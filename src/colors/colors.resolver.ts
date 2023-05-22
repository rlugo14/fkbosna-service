import { ColorService } from './colors.service';
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
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BatchResponse } from '../shared/dto/batch-response.model';
import { DeleteManyColorsInput } from './dto/delete-color.input';
import {
  ColorWhereUniqueInput,
  UpdateColorInput,
} from './dto/update-color.input';
import { ResultArgs } from '../shared/dto/results.args';
import { AuthGuard } from '../guards/auth.guard';
import { TenantId, TenantIdFrom } from 'src/decorators/tenant.decorator';
import { AuthUserId } from 'src/decorators/auth-user.decorator';

@Resolver(() => Color)
export class ColorsResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly colorService: ColorService,
  ) {}

  @Query(() => Color)
  async color(
    @Args('id') id: number,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<Color> {
    const color = await this.colorService.fetchUnique(id);
    if (!color || color.tenantId !== tenantId) {
      throw new NotFoundException(id);
    }
    return color;
  }

  @Query(() => [Color])
  async colors(
    @Args() resultArgs: ResultArgs,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<Color[]> {
    return this.prismaService.color.findMany({
      ...resultArgs,
      where: { tenantId, deletedAt: null },
      include: { tenant: true },
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Color)
  async createColor(
    @Args('data') newColorInput: CreateColorInput,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<Color> {
    try {
      const color = await this.prismaService.color.create({
        data: {
          ...newColorInput,
          name: newColorInput.name.toUpperCase(),
          tenantId,
        },
        include: { tenant: true },
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
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<BatchResponse> {
    try {
      const createdColors = await this.prismaService.color.createMany({
        data: {
          ...newColorsInput.data.map((colorData) => ({
            ...colorData,
            name: colorData.name.toUpperCase(),
          })),
          tenantId,
        },
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
  async deleteColor(@Args('id') id: number, @AuthUserId() userId: number) {
    try {
      await this.colorService.verifyUserCanManageColor(userId, id);
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
    @AuthUserId() userId: number,
  ): Promise<BatchResponse> {
    deleteManyInput.ids.forEach(async (id) => {
      await this.colorService.verifyUserCanManageColor(userId, id);
    });
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
    @AuthUserId() userId: number,
  ): Promise<Color> {
    await this.colorService.verifyUserCanManageColor(userId, whereUnique.id);
    return this.prismaService.color.update({
      where: whereUnique,
      data: {
        name: updateInput.name?.toUpperCase(),
        hexCode: updateInput.hexCode?.toUpperCase(),
      },
      include: { tenant: true },
    });
  }

  @ResolveField()
  async players(@Parent() color: Color) {
    const { id } = color;
    return this.prismaService.player.findMany({
      where: { colorId: id, deletedAt: null },
    });
  }
}
