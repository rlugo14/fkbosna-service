import { NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Query,
  Resolver,
  Mutation,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePlayerInput,
  CreateManyPlayersInput,
} from './dto/create-player.input';
import { Player } from './models/player.model';
import { BatchResponse } from '../shared/dto/batch-response.model';
import {
  PlayersWhereInput,
  PlayerWhereUniqueInput,
  UpdatePlayerInput,
} from './dto/update-player.input';
import { Color } from '../colors/models/color.model';
import { ResultArgs } from '../shared/dto/results.args';
import { AuthGuard } from 'src/auth.guard';
import { GqlContext } from 'src/helpers/interfaces';
import { Tenant } from 'src/tenants/models/tenant.model';
import { TenantId, TenantIdFrom } from 'src/tenants/tenant.decorator';
import { AuthUserId } from 'src/auth-user.decorator';
import { UserService } from 'src/users/users.service';
import { PlayerService } from './players.service';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly playerService: PlayerService,
    private readonly userService: UserService,
  ) {}

  @Query(() => Player)
  async player(
    @Args('id') id: number,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<Player> {
    const player = await this.playerService.fetchUnique(id);
    if (!player || player.tenantId !== tenantId) {
      throw new NotFoundException(id);
    }
    return player;
  }

  @ResolveField(() => Color)
  async color(@Parent() player: Player): Promise<Color> {
    const { id } = player;
    return this.prismaService.color.findFirst({
      where: { players: { some: { id } } },
      include: { tenant: true },
    });
  }

  @ResolveField(() => Tenant)
  async tenant(@Parent() player: Player): Promise<Tenant> {
    const { id } = player;
    return this.prismaService.tenant.findFirst({
      where: { players: { some: { id } } },
    });
  }

  @Query(() => [Player])
  players(
    @Args() playersArgs: ResultArgs,
    @Context() ctx: GqlContext,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<Player[]> {
    return this.prismaService.player.findMany({
      ...playersArgs,
      where: { tenantId },
      include: { tenant: true },
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Player)
  async createPlayer(
    @Args('data') newPlayerInput: CreatePlayerInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<Player> {
    const { firstname, lastname, fupaSlug, imageName } = newPlayerInput;

    const player = await this.prismaService.player.create({
      data: {
        firstname,
        lastname,
        fupaSlug,
        imageName,
        tenantId,
      },
      include: { tenant: true },
    });

    if (newPlayerInput.colorId) {
      const colorId = newPlayerInput.colorId;
      await this.prismaService.player.update({
        where: { id: player.id },
        data: { color: { connect: { id: colorId } } },
      });
    }

    return player;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => BatchResponse)
  async createManyPlayers(
    @Args('players') newPlayersInput: CreateManyPlayersInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<BatchResponse> {
    try {
      const createdPlayers = await this.prismaService.player.createMany({
        data: { ...newPlayersInput.data, tenantId },
      });

      return createdPlayers;
    } catch {
      return { count: 0 };
    }
  }
  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async deletePlayer(@Args('id') id: number, @AuthUserId() userId: number) {
    try {
      await this.playerService.verifyUserCanManagePlayer(userId, id);
      await this.prismaService.player.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }
  @UseGuards(AuthGuard)
  @Mutation(() => Player)
  async updatePlayer(
    @Args('data') updatePlayerInput: UpdatePlayerInput,
    @Args('where') whereUnique: PlayerWhereUniqueInput,
    @AuthUserId() userId: number,
  ): Promise<Player> {
    const { firstname, lastname, fupaSlug, imageName } = updatePlayerInput;

    await this.playerService.verifyUserCanManagePlayer(userId, whereUnique.id);
    let updatedPlayer = await this.prismaService.player.update({
      data: {
        firstname,
        lastname,
        fupaSlug,
        imageName,
      },
      where: whereUnique,
      include: { tenant: true },
    });

    if (updatePlayerInput.color) {
      const color = updatePlayerInput.color;
      updatedPlayer = await this.prismaService.player.update({
        data: {
          color: {
            connectOrCreate: {
              where: { id: color.id },
              create: { name: color.name, hexCode: color.hexCode },
            },
          },
        },
        where: { id: updatedPlayer.id },
        include: { tenant: true },
      });
    }

    return updatedPlayer;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => BatchResponse)
  async updateManyPlayers(
    @Args('data') updatePlayerInput: UpdatePlayerInput,
    @Args('where') whereUnique: PlayersWhereInput,
    @AuthUserId() userId: number,
  ): Promise<BatchResponse> {
    whereUnique.ids.forEach(
      async (id) =>
        await this.playerService.verifyUserCanManagePlayer(userId, id),
    );
    return this.prismaService.player.updateMany({
      where: { id: { in: whereUnique.ids }, colorId: whereUnique.colorId },
      data: updatePlayerInput,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => BatchResponse)
  async removePlayersColor(
    @Args('where') whereUnique: PlayersWhereInput,
    @AuthUserId() userId: number,
  ): Promise<BatchResponse> {
    whereUnique.ids.forEach(
      async (id) =>
        await this.playerService.verifyUserCanManagePlayer(userId, id),
    );
    const ids = whereUnique.ids.map((id) => ({ id }));

    return this.prismaService.player.updateMany({
      data: { colorId: null },
      where: { OR: ids },
    });
  }
}
