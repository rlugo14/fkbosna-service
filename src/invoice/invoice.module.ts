import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { HttpModule } from '@nestjs/axios';
import { S3ManagerModule } from 'src/s3-manager/s3-manager.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService],
  imports: [HttpModule, S3ManagerModule, JwtModule],
})
export class InvoiceModule {}
