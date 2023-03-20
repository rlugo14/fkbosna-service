import { Module } from '@nestjs/common';
import { TenantImageService } from './tenant-image.service';
import { TenantImageController } from './tenant-image.controller';
import { S3ManagerModule } from 'src/s3-manager/s3-manager.module';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [S3ManagerModule, JwtModule],
  providers: [TenantImageService, S3ManagerService],
  controllers: [TenantImageController],
})
export class TenantImageModule {}
