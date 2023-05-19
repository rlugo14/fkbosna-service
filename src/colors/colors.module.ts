import { JwtModule } from '@nestjs/jwt';
import { ColorService } from './colors.service';
import { UserModule } from './../users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { ColorsResolver } from './colors.resolver';

@Module({
  imports: [forwardRef(() => UserModule), JwtModule],
  providers: [ColorsResolver, ColorService],
  exports: [ColorService],
})
export class ColorsModule {}
