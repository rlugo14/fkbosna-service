import { UserModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { PlayersResolver } from './players.resolver';
import { PlayerService } from './players.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { PlayerImageModule } from 'src/player-image/player-image.module';
import { TenantsModule } from 'src/tenants/tenants.module';
import { PlayerController } from './players.controller';
import { ColorsModule } from 'src/colors/colors.module';

@Module({
  imports: [
    UserModule,
    JwtModule,
    HttpModule,
    PlayerImageModule,
    TenantsModule,
    ColorsModule,
  ],
  providers: [PlayersResolver, PlayerService],
  controllers: [PlayerController],
  exports: [PlayerService],
})
export class PlayersModule {}
