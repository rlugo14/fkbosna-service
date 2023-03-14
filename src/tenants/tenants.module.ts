import { UserModule } from './../users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantsResolver } from './tenants.resolver';
import { TenantService } from './tenants.service';

@Module({
  imports: [PrismaModule, forwardRef(() => UserModule)],
  providers: [TenantsResolver, TenantService],
  exports: [TenantService],
})
export class TenantsModule {}
