import { UserService } from './users.service';
import { Module, forwardRef } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TenantsModule } from 'src/tenants/tenants.module';
import { TokenModule } from 'src/tokens/tokens.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TokenModule, JwtModule, forwardRef(() => TenantsModule)],
  providers: [UsersResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
