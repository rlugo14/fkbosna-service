import { Args, Query, Resolver } from '@nestjs/graphql';
import { Tenant } from './models/tenant.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResultArgs } from 'src/shared/dto/results.args';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';

@Resolver(() => Tenant)
export class TenantsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @UseGuards(AuthGuard)
  @Query(() => [Tenant])
  async tenants(@Args() resultArgs: ResultArgs): Promise<Tenant[]> {
    return this.prismaService.tenant.findMany({
      ...resultArgs,
    });
  }

  @Query(() => Tenant)
  async tenant(@Args('slug') slug: string): Promise<Tenant> {
    return this.prismaService.tenant.findUnique({ where: { slug } });
  }
}
