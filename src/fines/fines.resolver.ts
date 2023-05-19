import { NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Resolver,
  ResolveField,
  Parent,
  Query,
  Context,
} from '@nestjs/graphql';
import { AuthGuard } from 'src/auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { Fine } from './models/fine.model';
import { CreateFineInput } from './dto/create-fine.input';
import { TenantId, TenantIdFrom } from 'src/tenants/tenant.decorator';
import { FinesService } from './fines.service';
import { FineType } from './models/fine-type.model';
import { CreateFineTypeInput } from './dto/create-fine-type.input';
import { PlayerService } from 'src/players/players.service';
import { AuthUserId } from '../auth-user.decorator';
import { ResultArgs } from 'src/shared/dto/results.args';
import { Player } from 'src/players/models/player.model';
import { UpdateFineTypeInput } from './dto/update-fine-type.input';
import { UpdateFineInput } from './dto/update-fine.input';

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
    @Args() playersArgs: ResultArgs,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<FineType[]> {
    return this.prismaService.fineType.findMany({
      ...playersArgs,
      where: { tenantId, deletedAt: null },
      include: { tenant: true },
    });
  }

  @UseGuards(AuthGuard)
  @Query(() => [Fine])
  async fines(
    @Args() playersArgs: ResultArgs,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<Fine[]> {
    return this.prismaService.fine.findMany({
      ...playersArgs,
      where: { tenantId, deletedAt: null },
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
  @Mutation(() => FineType)
  async createFineType(
    @Args('data') newFineTypeInput: CreateFineTypeInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<FineType> {
    const { name, cost } = newFineTypeInput;

    return this.prismaService.fineType.create({
      data: {
        name,
        cost,
        tenantId,
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
        ...updateFineTypeInput,
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

    return this.prismaService.fine.update({
      data: {
        ...updateFineInput,
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
    try {
      await this.fineService.verifyUserCanManageFineType(userId, id);
      await this.prismaService.fineType.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async deleteFine(
    @Args('id') id: number,
    @AuthUserId() userId: number,
  ): Promise<boolean> {
    try {
      await this.fineService.verifyUserCanManageFine(userId, id);
      await this.prismaService.fine.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
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
