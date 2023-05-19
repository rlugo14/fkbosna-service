import { Module, forwardRef } from '@nestjs/common';
import { FinesResolver } from './fines.resolver';
import { FinesService } from './fines.service';
import { JwtModule } from '@nestjs/jwt';
import { PlayersModule } from 'src/players/players.module';
import { UserModule } from 'src/users/users.module';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => PlayersModule),
    forwardRef(() => UserModule),
  ],
  providers: [FinesResolver, FinesService],
  exports: [FinesService],
})
export class FinesModule {}
