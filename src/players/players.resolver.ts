import { NotFoundException } from '@nestjs/common';
import {
  Args,
  Query,
  Resolver,
  Mutation,
  Subscription,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePlayerInput,
  CreateManyPlayersInput,
} from './dto/create-player.input';
import { Player } from './models/player.model';
import { PubSub } from 'apollo-server-express';
import { BatchResponse } from '../shared/dto/batch-response.model';
import {
  PlayersWhereUniqueInput,
  PlayerWhereUniqueInput,
  UpdatePlayerInput,
} from './dto/update-player.input';
import { Color } from '../colors/models/color.model';
import { ResultArgs } from '../shared/dto/results.args';

const pubSub = new PubSub();
enum PlayerTopics {
  playerAdded = 'playerAdded',
}

@Resolver(() => Player)
export class PlayersResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query(() => Player)
  async player(@Args('id') id: number): Promise<Player> {
    const player = await this.prismaService.player.findUnique({
      where: { id },
      include: { color: false },
    });
    if (!player) {
      throw new NotFoundException(id);
    }
    return player;
  }

  @ResolveField(() => Color)
  async color(@Parent() player: Player): Promise<Color> {
    const { id } = player;
    return this.prismaService.color.findFirst({
      where: { players: { some: { id } } },
    });
  }

  @Query(() => [Player])
  players(@Args() playersArgs: ResultArgs): Promise<Player[]> {
    return this.prismaService.player.findMany(playersArgs);
  }

  @Mutation(() => Player)
  async createPlayer(
    @Args('data') newPlayerInput: CreatePlayerInput,
  ): Promise<Player> {
    const { firstname, lastname, colorId } = newPlayerInput;
    const color = newPlayerInput.color;
    const player = await this.prismaService.player.create({
      data: {
        firstname,
        lastname,
        color: {
          connectOrCreate: {
            where: {
              id: colorId,
              name: color.name,
            },
            create: {
              name: color.name.toUpperCase(),
              hexCode: color.hexCode?.toUpperCase(),
            },
          },
        },
      },
    });
    pubSub.publish(PlayerTopics.playerAdded, { playerAdded: player });
    return player;
  }

  @Mutation(() => BatchResponse)
  async createManyPlayers(
    @Args('players') newPlayersInput: CreateManyPlayersInput,
  ): Promise<BatchResponse> {
    try {
      const createdPlayers = await this.prismaService.player.createMany({
        data: newPlayersInput.data,
      });
      pubSub.publish(PlayerTopics.playerAdded, {
        playersAdded: createdPlayers,
      });
      return createdPlayers;
    } catch {
      return { count: 0 };
    }
  }

  @Mutation(() => Boolean)
  async deletePlayer(@Args('id') id: number) {
    try {
      await this.prismaService.player.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  @Mutation(() => Player)
  async updatePlayer(
    @Args('data') updatePlayerInput: UpdatePlayerInput,
    @Args('where') whereUnique: PlayerWhereUniqueInput,
  ): Promise<Player> {
    const { firstname, lastname, color } = updatePlayerInput;
    return this.prismaService.player.update({
      data: {
        firstname,
        lastname,
        color: {
          connectOrCreate: {
            where: { name: color.name },
            create: {
              name: color.name.toUpperCase(),
              hexCode: color.hexCode.toUpperCase(),
            },
          },
        },
      },
      where: whereUnique,
    });
  }

  @Mutation(() => BatchResponse)
  async updateManyPlayers(
    @Args('data') updatePlayerInput: UpdatePlayerInput,
    @Args('where') whereUnique: PlayersWhereUniqueInput,
  ): Promise<BatchResponse> {
    return this.prismaService.player.updateMany({
      where: { id: { in: whereUnique.ids } },
      data: updatePlayerInput,
    });
  }

  @Subscription(() => Player)
  playerAdded() {
    return pubSub.asyncIterator(PlayerTopics.playerAdded);
  }
}
