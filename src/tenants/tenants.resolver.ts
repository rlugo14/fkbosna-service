import { CreateTenantInput } from './dto/create-tenant.input';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Tenant } from './models/tenant.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResultArgs } from 'src/shared/dto/results.args';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import {
  TenantWhereUniqueInput,
  UpdateTenantInput,
} from './dto/update-tenant.input';
import { TenantService } from './tenants.service';
import { AuthUserId } from 'src/auth-user.decorator';
import { ColorService } from 'src/colors/colors.service';
import { FinesService } from 'src/fines/fines.service';

@Resolver(() => Tenant)
export class TenantsResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tenantService: TenantService,
    private readonly colorService: ColorService,
    private fineService: FinesService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => [Tenant])
  async tenants(@Args() resultArgs: ResultArgs): Promise<Tenant[]> {
    return this.prismaService.tenant.findMany({
      ...resultArgs,
    });
  }

  @Query(() => Tenant)
  async tenant(@Args('slug') slug: string): Promise<Tenant> {
    const foundTenant = await this.prismaService.tenant.findUnique({
      where: { slug },
    });

    if (!foundTenant) {
      throw new NotFoundException(`Tenant with slug: ${slug} - Not Found`);
    }

    return foundTenant;
  }

  @Mutation(() => Tenant)
  async createTenant(@Args('tenant') tenant: CreateTenantInput) {
    const { name, slug, fupaSlug, imageName, active } = tenant;
    await this.tenantService.verifySlugIsAvailable(slug);
    const newTenant = await this.prismaService.tenant.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        fupaSlug,
        imageName,
        active,
      },
    });

    await this.colorService.createDefaultColors(newTenant.id);
    await this.fineService.createDefaultFineTypes(newTenant.id);
    return newTenant;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Tenant)
  async updateTenant(
    @Args('data') updateTenantInput: UpdateTenantInput,
    @Args('where') whereUnique: TenantWhereUniqueInput,
    @AuthUserId() userId: number,
  ) {
    await this.tenantService.verifyUserCanManageTenant(userId, whereUnique.id);

    const updatedTenant = await this.prismaService.tenant.update({
      data: updateTenantInput,
      where: whereUnique,
    });

    return updatedTenant;
  }

  @Query(() => Boolean)
  async isTenantSlugAvailable(@Args('slug') slug: string): Promise<boolean> {
    try {
      await this.tenantService.verifySlugIsAvailable(slug);
      return true;
    } catch (error) {
      return false;
    }
  }
}
