import { UserModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { PlayersResolver } from './players.resolver';
import { PlayerService } from './players.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule, JwtModule],
  providers: [PlayersResolver, PlayerService],
})
export class PlayersModule {}
