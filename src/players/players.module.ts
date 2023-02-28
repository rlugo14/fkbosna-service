import { UserModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlayersResolver } from './players.resolver';
import { PlayerService } from './players.service';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [PlayersResolver, PlayerService],
})
export class PlayersModule {}
