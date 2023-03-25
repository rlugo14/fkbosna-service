import { UserModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { PlayersResolver } from './players.resolver';
import { PlayerService } from './players.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { PlayerImageModule } from 'src/player-image/player-image.module';
import { TenantsModule } from 'src/tenants/tenants.module';
import { PlayerController } from './players.controller';

@Module({
  imports: [
    UserModule,
    JwtModule,
    HttpModule,
    PlayerImageModule,
    TenantsModule,
  ],
  providers: [PlayersResolver, PlayerService],
  controllers: [PlayerController],
})
export class PlayersModule {}
