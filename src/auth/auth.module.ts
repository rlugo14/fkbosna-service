import { AuthController } from './auth.controller';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenModule } from 'src/tokens/tokens.module';
import { UserModule } from 'src/users/users.module';

@Module({
  imports: [TokenModule, UserModule],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
