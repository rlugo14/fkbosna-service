import { Module } from '@nestjs/common';
import { PlayerImageService } from './player-image.service';
import { PlayerImageController } from './player-image.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { S3ManagerModule } from 'src/s3-manager/s3-manager.module';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';

@Module({
  imports: [S3ManagerModule, PrismaModule],
  providers: [PlayerImageService, S3ManagerService],
  controllers: [PlayerImageController],
})
export class PlayerImageModule {}
