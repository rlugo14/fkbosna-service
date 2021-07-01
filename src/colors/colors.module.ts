import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ColorsResolver } from './colors.resolver';

@Module({
  imports: [PrismaModule],
  providers: [ColorsResolver],
})
export class ColorsModule {}
