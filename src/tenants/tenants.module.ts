import { UserModule } from './../users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { TenantsResolver } from './tenants.resolver';
import { TenantService } from './tenants.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, forwardRef(() => UserModule)],
  providers: [TenantsResolver, TenantService],
  exports: [TenantService],
})
export class TenantsModule {}
