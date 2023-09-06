import { SharedModule } from './../shared/shared.module';
import { Global, Module } from '@nestjs/common';
import { TokenService } from './tokens.service';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [SharedModule, JwtModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
