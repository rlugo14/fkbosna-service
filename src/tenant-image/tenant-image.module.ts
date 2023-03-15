import { Module } from '@nestjs/common';
import { TenantImageService } from './tenant-image.service';
import { TenantImageController } from './tenant-image.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { S3ManagerModule } from 'src/s3-manager/s3-manager.module';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';

@Module({
  imports: [S3ManagerModule, PrismaModule],
  providers: [TenantImageService, S3ManagerService],
  controllers: [TenantImageController],
})
export class TenantImageModule {}
