import { JwtModule } from '@nestjs/jwt';
import { ColorService } from './colors.service';
import { UserModule } from './../users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { ColorsResolver } from './colors.resolver';
import { ColorsGateway } from './colors.gateway';

@Module({
  imports: [forwardRef(() => UserModule), JwtModule],
  providers: [ColorsResolver, ColorService, ColorsGateway],
  exports: [ColorService, ColorsGateway],
})
export class ColorsModule {}
