import { UseGuards } from '@nestjs/common';
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
import { CreateFineInput, CreateManyFinesInput } from './dto/create-fine.input';
import { TenantId, TenantIdFrom } from 'src/decorators/tenant.decorator';
import { FinesService } from './fines.service';
import { FineType } from './models/fine-type.model';
import { CreateFineTypeInput } from './dto/create-fine-type.input';
import { PlayerService } from 'src/players/players.service';
import { AuthUserId } from '../decorators/auth-user.decorator';
import { ResultArgs } from 'src/shared/dto/results.args';
import { Player } from 'src/players/models/player.model';
import { UpdateFineTypeInput } from './dto/update-fine-type.input';
import {
  UpdateFineInput,
  UpsertFineInput,
  UpsertManyFinesInput,
} from './dto/update-fine.input';
import filterNullAndUndefined from 'src/helpers/filterNullAndUndefined';
import { BatchResponse } from 'src/shared/dto/batch-response.model';
import { Prisma } from '@prisma/client';
import { MonthFilterArgs } from 'src/shared/dto/month-filter.args';
import getMonthLimits from 'src/helpers/getMonthLimits';

@Resolver(() => Fine)
export class FinesResolver {
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
    @Args('data') newFineInput: CreateFineInput,
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

    return this.prismaService.fine.create({
      data: {
        playerId,
        amount,
        typeId,
        tenantId,
        total: amount * fineType.cost,
        createdAt: new Date(Date.now()),
      },
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => BatchResponse)
  async createManyFines(
    @Args('fines') newFinesInput: CreateManyFinesInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
    @AuthUserId() userId: number,
  ): Promise<BatchResponse> {
    const { data } = newFinesInput;
    const transactionPromises: {
      createManyData: Prisma.FineCreateManyInput[];
      updates: Promise<Fine>[];
    } = { createManyData: [], updates: [] };

    for (const input of data) {
      await this.playerService.verifyUserCanManagePlayer(
        userId,
        input.playerId,
      );

      const fineType = await this.fineService.fetchUniqueFineType(input.typeId);
      const existingFineByType =
        await this.fineService.fetchPlayerFineByFineTypeInCurrentMonth(
          input.playerId,
          fineType.id,
        );

      if (existingFineByType) {
        transactionPromises.updates.push(
          this.prismaService.fine.update({
            data: { amount: input.amount },
            where: { id: existingFineByType.id },
          }),
        );
      } else {
        transactionPromises.createManyData.push({
          playerId: input.playerId,
          amount: input.amount,
          typeId: input.typeId,
          tenantId,
          total: input.amount * fineType.cost,
          createdAt: new Date(Date.now()),
        });
      }
    }

    await Promise.all(transactionPromises.updates);

    const res = await this.prismaService.fine.createMany({
      data: transactionPromises.createManyData,
    });

    return res;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => FineType)
  async createFineType(
    @Args('data') newFineTypeInput: CreateFineTypeInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<FineType> {
    const { name, cost, category } = newFineTypeInput;

    return this.prismaService.fineType.create({
      data: {
        name,
        cost,
        tenantId,
        category,
      },
    });
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

    return this.prismaService.fineType.update({
      data: {
        ...filterNullAndUndefined(updateFineTypeInput),
      },
      where: { id: updateFineTypeInput.id },
    });
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

    return this.prismaService.fine.update({
      data: {
        ...filterNullAndUndefined({ ...updateFineInput, total: newTotal }),
      },
      where: { id: updateFineInput.id },
    });
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
