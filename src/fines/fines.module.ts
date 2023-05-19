import { Module } from '@nestjs/common';
import { FinesResolver } from './fines.resolver';
import { FinesService } from './fines.service';
import { JwtModule } from '@nestjs/jwt';
import { PlayersModule } from 'src/players/players.module';
import { UserModule } from 'src/users/users.module';

@Module({
  imports: [JwtModule, PlayersModule, UserModule],
  providers: [FinesResolver, FinesService],
})
export class FinesModule {}
