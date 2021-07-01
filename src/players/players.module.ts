import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlayersResolver } from './players.resolver';

@Module({
  imports: [PrismaModule],
  providers: [PlayersResolver],
})
export class PlayersModule {}
