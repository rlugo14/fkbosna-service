import { UserService } from './users.service';
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UsersResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
