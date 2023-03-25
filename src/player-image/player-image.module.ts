import { Module } from '@nestjs/common';
import { PlayerImageService } from './player-image.service';
import { PlayerImageController } from './player-image.controller';
import { S3ManagerModule } from 'src/s3-manager/s3-manager.module';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [S3ManagerModule, JwtModule],
  providers: [PlayerImageService, S3ManagerService],
  controllers: [PlayerImageController],
  exports: [PlayerImageService],
})
export class PlayerImageModule {}
