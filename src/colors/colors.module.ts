import { ColorService } from './colors.service';
import { UserModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ColorsResolver } from './colors.resolver';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [ColorsResolver, ColorService],
})
export class ColorsModule {}
