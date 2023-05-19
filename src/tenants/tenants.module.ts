import { UserModule } from './../users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { TenantsResolver } from './tenants.resolver';
import { TenantService } from './tenants.service';
import { JwtModule } from '@nestjs/jwt';
import { ColorsModule } from 'src/colors/colors.module';
import { FinesModule } from 'src/fines/fines.module';

@Module({
  imports: [FinesModule, JwtModule, forwardRef(() => UserModule), ColorsModule],
  providers: [TenantsResolver, TenantService],
  exports: [TenantService],
})
export class TenantsModule {}
