import { UserService } from './users.service';
import { Module, forwardRef } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => TenantsModule)],
  providers: [UsersResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
