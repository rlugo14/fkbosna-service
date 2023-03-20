import { JwtModule } from '@nestjs/jwt';
import { ColorService } from './colors.service';
import { UserModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { ColorsResolver } from './colors.resolver';

@Module({
  imports: [UserModule, JwtModule],
  providers: [ColorsResolver, ColorService],
})
export class ColorsModule {}
