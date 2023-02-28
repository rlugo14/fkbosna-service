import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantsResolver } from './tenants.resolver';

@Module({
  imports: [PrismaModule],
  providers: [TenantsResolver],
})
export class TenantsModule {}
