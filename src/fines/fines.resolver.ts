import { Logger, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Resolver,
  ResolveField,
  Parent,
  Query,
} from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { Fine } from './models/fine.model';
import {
  CreatePlayerFineInput,
  CreateManyPlayerFinesInput,
  CreateManyFinesInput,
  UpsertBatchResponse,
} from './dto/create-fine.input';
import { TenantId, TenantIdFrom } from 'src/decorators/tenant.decorator';
import { FinesService } from './fines.service';
import { FineType } from './models/fine-type.model';
import { CreateFineTypeInput } from './dto/create-fine-type.input';
import { PlayerService } from 'src/players/players.service';
import { AuthUserId } from '../decorators/auth-user.decorator';
import { Player } from 'src/players/models/player.model';
import { UpdateFineTypeInput } from './dto/update-fine-type.input';
import { UpdateFineInput } from './dto/update-fine.input';
import filterNullAndUndefined from 'src/helpers/filterNullAndUndefined';
import { Prisma } from '@prisma/client';
import { MonthFilterArgs } from 'src/shared/dto/month-filter.args';
import getMonthLimits from 'src/helpers/getMonthLimits';

@Resolver(() => Fine)
export class FinesResolver {
  private readonly logger = new Logger(FinesResolver.name);
  constructor(
    private readonly fineService: FinesService,
    private readonly prismaService: PrismaService,
    private readonly playerService: PlayerService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => [FineType])
  async fineTypes(
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<FineType[]> {
    return this.prismaService.fineType.findMany({
      where: { tenantId, deletedAt: null },
      include: { tenant: true },
    });
  }

  @UseGuards(AuthGuard)
  @Query(() => [Fine])
  async fines(
    @Args() monthFilterArgs: MonthFilterArgs,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<Fine[]> {
    const createdAt: { gte: Date; lte: Date } = {
      gte: undefined,
      lte: undefined,
    };
    if (
      monthFilterArgs.month !== undefined &&
      monthFilterArgs.year !== undefined
    ) {
      const month = monthFilterArgs.month;
      const year = monthFilterArgs.year;
      const monthLimits = getMonthLimits(month, year);
      createdAt.gte = monthLimits.firstDay;
      createdAt.lte = monthLimits.lastDay;
    }
    return this.prismaService.fine.findMany({
      where: {
        tenantId,
        deletedAt: null,
        createdAt,
      },
      include: { tenant: true },
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Fine)
  async createFine(
    @Args('data') newFineInput: CreatePlayerFineInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
    @AuthUserId() userId: number,
  ): Promise<Fine> {
    const { playerId, amount, typeId } = newFineInput;
    await this.playerService.verifyUserCanManagePlayer(userId, playerId);
    const fineType = await this.fineService.fetchUniqueFineType(typeId);

    const existingFineByType =
      await this.fineService.fetchPlayerFineByFineTypeInCurrentMonth(
        playerId,
        fineType.id,
      );

    if (existingFineByType) {
      return this.prismaService.fine.update({
        data: { amount },
        where: { id: existingFineByType.id },
      });
    }

    const createdFine = await this.prismaService.fine.create({
      data: {
        playerId,
        amount,
        typeId,
        tenantId,
        total: amount * fineType.cost,
        createdAt: new Date(Date.now()),
      },
    });

    this.logger.log(
      `Created Fine by User with ID: ${userId} - createdFine: ${JSON.stringify(
        createdFine,
      )}`,
    );

    return createdFine;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => UpsertBatchResponse)
  async createManyFines(
    @Args('fines') newFinesInput: CreateManyPlayerFinesInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
    @AuthUserId() userId: number,
  ): Promise<UpsertBatchResponse> {
    const { data } = newFinesInput;
    const transactionPromises =
      await this.fineService.createUpdateOrCreatePlayersFineTransactions(
        data,
        userId,
        tenantId,
      );

    const response: {
      created: Prisma.BatchPayload;
      updated: Prisma.BatchPayload;
    } = { created: { count: 0 }, updated: { count: 0 } };

    response.updated = {
      count: (await Promise.all(transactionPromises.updates)).length,
    };

    response.created = await this.prismaService.fine.createMany({
      data: transactionPromises.createManyData,
    });

    this.logger.log(
      `Created many Fines in batch by User with ID: ${userId} - Fines create in batch response: ${JSON.stringify(
        response,
      )}`,
    );

    return response;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => UpsertBatchResponse)
  async createManyFinesForAllPlayers(
    @Args('fines') newFinesInput: CreateManyFinesInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
    @AuthUserId() userId: number,
  ): Promise<UpsertBatchResponse> {
    const { data } = newFinesInput;
    const tenantPlayers = await this.playerService.fetchAllPlayersFromTenant(
      tenantId,
    );

    const transactionPromises: {
      createManyData: Prisma.FineCreateManyInput[];
      updates: Promise<Fine>[];
    } = { createManyData: [], updates: [] };

    for (const player of tenantPlayers) {
      const transactions =
        await this.fineService.createUpdateOrCreateFinesTransactions(
          data,
          player.id,
          userId,
          tenantId,
        );

      transactionPromises.createManyData = [
        ...transactionPromises.createManyData,
        ...transactions.createManyData,
      ];
      transactionPromises.updates = [
        ...transactionPromises.updates,
        ...transactions.updates,
      ];
    }

    const response: {
      created: Prisma.BatchPayload;
      updated: Prisma.BatchPayload;
    } = { created: { count: 0 }, updated: { count: 0 } };

    response.updated = {
      count: (await Promise.all(transactionPromises.updates)).length,
    };

    response.created = await this.prismaService.fine.createMany({
      data: transactionPromises.createManyData,
    });

    this.logger.log(
      `Many Fines created for all Players by User with ID: ${userId}`,
    );

    return response;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => FineType)
  async createFineType(
    @Args('data') newFineTypeInput: CreateFineTypeInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<FineType> {
    const { name, cost, category } = newFineTypeInput;

    const createdFineType = await this.prismaService.fineType.create({
      data: {
        name,
        cost,
        tenantId,
        category,
      },
    });

    this.logger.log(
      `Created FineType for tenant with ID: ${tenantId} - createdFineType: ${JSON.stringify(
        createdFineType,
      )}`,
    );

    return createdFineType;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => FineType)
  async updateFineType(
    @Args('data') updateFineTypeInput: UpdateFineTypeInput,
    @AuthUserId() userId: number,
  ): Promise<FineType> {
    await this.fineService.verifyUserCanManageFineType(
      userId,
      updateFineTypeInput.id,
    );

    const updatedFineType = await this.prismaService.fineType.update({
      data: {
        ...filterNullAndUndefined(updateFineTypeInput),
      },
      where: { id: updateFineTypeInput.id },
    });

    this.logger.log(
      `Updated FineType by User with ID: ${userId} - updatedFineType: ${JSON.stringify(
        updatedFineType,
      )}`,
    );

    return updatedFineType;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Fine)
  async updateFine(
    @Args('data') updateFineInput: UpdateFineInput,
    @AuthUserId() userId: number,
  ): Promise<Fine> {
    await this.fineService.verifyUserCanManageFine(userId, updateFineInput.id);
    if (updateFineInput.playerId) {
      await this.playerService.fetchUnique(updateFineInput.playerId);
    }

    let newTotal: number;

    if (updateFineInput.amount) {
      const fine = await this.fineService.fetchUniqueFine(updateFineInput.id);
      const fineType = await this.fineService.fetchUniqueFineType(fine.typeId);
      newTotal =
        fine.total + fineType.cost * (updateFineInput.amount - fine.amount);
    } else if (updateFineInput.amount === 0) {
      newTotal = 0;
    }

    const updatedFine = await this.prismaService.fine.update({
      data: {
        ...filterNullAndUndefined({ ...updateFineInput, total: newTotal }),
      },
      where: { id: updateFineInput.id },
    });

    this.logger.log(
      `Updated Fine by User with ID: ${userId} - updatedFine: ${JSON.stringify(
        updatedFine,
      )}`,
    );

    return updatedFine;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async deleteFineType(
    @Args('id') id: number,
    @AuthUserId() userId: number,
  ): Promise<boolean> {
    await this.fineService.verifyUserCanManageFineType(userId, id);
    await this.fineService.fetchUniqueFineType(id);
    await this.prismaService.fineType.delete({ where: { id } });
    this.logger.log(
      `Deleted FineType by User with ID: ${userId} - FineType with ID: ${id}`,
    );
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async deleteFine(
    @Args('id') id: number,
    @AuthUserId() userId: number,
  ): Promise<boolean> {
    await this.fineService.verifyUserCanManageFine(userId, id);
    await this.fineService.fetchUniqueFine(id);
    await this.prismaService.fine.delete({ where: { id } });
    this.logger.log(
      `Deleted Fine by User with ID: ${userId} - Fine with ID: ${id}`,
    );
    return true;
  }

  @ResolveField(() => FineType)
  async type(@Parent() fine: Fine): Promise<FineType> {
    const { typeId } = fine;
    return this.fineService.fetchUniqueFineType(typeId);
  }

  @ResolveField(() => Player)
  async player(@Parent() fine: Fine): Promise<Player> {
    const { playerId } = fine;
    return this.playerService.fetchUnique(playerId);
  }
}
