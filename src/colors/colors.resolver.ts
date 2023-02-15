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
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateColorInput,
  CreateManyColorsInput,
} from './dto/create-color.input';
import { Color } from './models/color.model';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { BatchResponse } from '../shared/dto/batch-response.model';
import { DeleteManyColorsInput } from './dto/delete-color.input';
import {
  ColorWhereUniqueInput,
  UpdateColorInput,
} from './dto/update-color.input';
import { ResultArgs } from '../shared/dto/results.args';
import { AuthGuard } from '../auth.guard';

@Resolver(() => Color)
export class ColorsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query(() => Color)
  async color(
    @Args('id', { nullable: true }) id: number,
    @Args('name', { nullable: true }) name: string,
    @Args('hexCode', { nullable: true }) hexCode: string,
  ): Promise<Color> {
    const color = await this.prismaService.color.findUnique({
      where: { id, hexCode },
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

  @UseGuards(AuthGuard)
  @Mutation(() => Color)
  async createColor(
    @Args('data') newColorInput: CreateColorInput,
  ): Promise<Color> {
    try {
      const color = await this.prismaService.color.create({
        data: { ...newColorInput, name: newColorInput.name.toUpperCase() },
      });
      return color;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Entity Already Exist', HttpStatus.CONFLICT);
      }
    }
  }

  @UseGuards(AuthGuard)
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
      return createdColors;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Entity Already Exist', HttpStatus.CONFLICT);
      }
    }
  }

  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Mutation(() => Color)
  async updateColor(
    @Args('data') updateInput: UpdateColorInput,
    @Args('where') whereUnique: ColorWhereUniqueInput,
  ): Promise<Color> {
    if (whereUnique.id && whereUnique.hexCode)
      // Prisma client only accepts one key in whereUnique
      // id takes precedence if both present
      whereUnique = { ...whereUnique, hexCode: undefined };

    return this.prismaService.color.update({
      where: whereUnique,
      data: {
        name: updateInput.name?.toUpperCase(),
        hexCode: updateInput.hexCode?.toUpperCase(),
      },
    });
  }

  @ResolveField()
  async players(@Parent() color: Color) {
    const { id } = color;
    return this.prismaService.player.findMany({ where: { colorId: id } });
  }
}
