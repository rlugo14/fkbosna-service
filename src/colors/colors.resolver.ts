import {
  HttpException,
  HttpStatus,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
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
  CreateColorInput,
  CreateManyColorsInput,
} from './dto/create-color.input';
import { Color } from './models/color.model';
import { PubSub } from 'apollo-server-express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { BatchResponse } from '../shared/dto/batch-response.model';
import { DeleteManyColorsInput } from './dto/delete-color.input';
import { UpdateColorInput } from './dto/update-color.input';
import { ResultArgs } from '../shared/dto/results.args';
import { AuthGuard } from '../auth.guard';

const pubSub = new PubSub();
enum ColorTopics {
  colorAdded = 'colorAdded',
}

@Resolver(() => Color)
export class ColorsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query(() => Color)
  async color(
    @Args('id', { nullable: true }) id: number,
    @Args('name', { nullable: true }) name: string,
  ): Promise<Color> {
    const color = await this.prismaService.color.findUnique({
      where: { id, name },
    });
    if (!color) {
      throw new NotFoundException(id);
    }
    return color;
  }

  @Query(() => [Color])
  async colors(@Args() resultArgs: ResultArgs): Promise<Color[]> {
    return this.prismaService.color.findMany(resultArgs);
  }

  @Mutation(() => Color)
  async createColor(
    @Args('data') newColorInput: CreateColorInput,
  ): Promise<Color> {
    try {
      const color = await this.prismaService.color.create({
        data: { ...newColorInput, name: newColorInput.name.toUpperCase() },
      });
      pubSub.publish(ColorTopics.colorAdded, { colorAdded: color });
      return color;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Entity Already Exist', HttpStatus.CONFLICT);
      }
    }
  }

  @Mutation(() => BatchResponse)
  async createManyColors(
    @Args('colors') newColorsInput: CreateManyColorsInput,
  ): Promise<BatchResponse> {
    try {
      const createdColors = await this.prismaService.color.createMany({
        data: newColorsInput.data.map((colorData) => ({
          ...colorData,
          name: colorData.name.toUpperCase(),
        })),
      });
      pubSub.publish(ColorTopics.colorAdded, {
        colorsAdded: createdColors,
      });
      return createdColors;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Entity Already Exist', HttpStatus.CONFLICT);
      }
    }
  }

  @Mutation(() => Boolean)
  async deleteColor(@Args('id') id: number) {
    try {
      await this.prismaService.color.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  @Mutation(() => BatchResponse)
  async deleteManyColors(
    @Args('colors') deleteManyInput: DeleteManyColorsInput,
  ): Promise<BatchResponse> {
    await this.prismaService.player.updateMany({
      data: { colorId: null },
      where: { colorId: { in: deleteManyInput.ids } },
    });
    return this.prismaService.color.deleteMany({
      where: {
        id: { in: deleteManyInput.ids },
        name: { in: deleteManyInput.names },
      },
    });
  }

  @Mutation(() => Color)
  async updateColor(
    @Args('data') updateInput: UpdateColorInput,
  ): Promise<Color> {
    return this.prismaService.color.update({
      where: { name: updateInput.where.name },
      data: {
        name: updateInput.name?.toUpperCase(),
        hexCode: updateInput.hexCode?.toUpperCase(),
      },
    });
  }

  @Subscription(() => Color)
  colorAdded() {
    return pubSub.asyncIterator(ColorTopics.colorAdded);
  }

  @ResolveField()
  async players(@Parent() color: Color) {
    const { id } = color;
    return this.prismaService.player.findMany({ where: { colorId: id } });
  }
}
