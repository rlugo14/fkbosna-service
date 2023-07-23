import { Logger, NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Query,
  Resolver,
  Mutation,
  ResolveField,
  Parent,
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
import { AuthGuard } from 'src/guards/auth.guard';
import { Tenant } from 'src/tenants/models/tenant.model';
import { TenantId, TenantIdFrom } from 'src/decorators/tenant.decorator';
import { AuthUserId } from 'src/decorators/auth-user.decorator';
import { PlayerService } from './players.service';
import { ColorsGateway } from 'src/colors/colors.gateway';

@Resolver(() => Player)
export class PlayersResolver {
  private readonly logger = new Logger(PlayersResolver.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly playerService: PlayerService,
    private readonly colorGateway: ColorsGateway,
  ) {}

  @Query(() => Player)
  async player(
    @Args('id') id: number,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<Player> {
    const player = await this.playerService.fetchUnique(id);
    if (!player || player.tenantId !== tenantId) {
      this.logger.error(
        `Player with ID: ${id} for tenantId: ${tenantId} not found`,
      );
      throw new NotFoundException(id);
    }
    return player;
  }

  @ResolveField(() => Color)
  async color(@Parent() player: Player): Promise<Color> {
    const { id } = player;
    return this.prismaService.color.findFirst({
      where: { players: { some: { id } }, deletedAt: null },
      include: { tenant: true },
    });
  }

  @ResolveField(() => Tenant)
  async tenant(@Parent() player: Player): Promise<Tenant> {
    const { id } = player;
    return this.prismaService.tenant.findFirst({
      where: { players: { some: { id } }, deletedAt: null },
    });
  }

  @Query(() => [Player])
  players(
    @Args() playersArgs: ResultArgs,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<Player[]> {
    return this.prismaService.player.findMany({
      ...playersArgs,
      where: { tenantId, deletedAt: null },
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

    this.logger.log(
      `New Player created for tenantId: ${tenantId} - Player: ${JSON.stringify(
        player,
      )}`,
    );

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

      this.logger.log(
        `Created players in batch - count: ${createdPlayers.count}`,
      );

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

      this.logger.log(
        `Player deleted by User with ID: ${userId} - deleted Player ID. ${id}`,
      );
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
    const { firstname, lastname, fupaSlug, imageName, colorId } =
      updatePlayerInput;

    await this.playerService.verifyUserCanManagePlayer(userId, whereUnique.id);
    const updatedPlayer = await this.prismaService.player.update({
      data: {
        firstname,
        lastname,
        fupaSlug,
        imageName,
        colorId,
      },
      where: whereUnique,
      include: { tenant: true },
    });
    this.logger.log(
      `Player updated by User with ID: ${userId} - updatedPlayer: ${JSON.stringify(
        updatedPlayer,
      )}`,
    );
    this.colorGateway.notifySocketsInRoom(updatedPlayer.tenant.slug);

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

    const updatedPlayers = await this.prismaService.player.updateMany({
      data: { colorId: null },
      where: { OR: ids, deletedAt: null },
    });

    this.logger.log(
      `Many Players updated - count: ${updatedPlayers.count} by User with ID: ${userId}`,
    );

    return updatedPlayers;
  }
}
