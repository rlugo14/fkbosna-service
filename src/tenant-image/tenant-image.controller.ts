import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantImageService } from './tenant-image.service';
import { AuthGuard } from 'src/auth.guard';

@Controller('tenant-image')
export class TenantImageController {
  constructor(private readonly tenantImageService: TenantImageService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile()
    file: Express.Multer.File,
    @Body('tenantId', ParseIntPipe) tenantId: number,
    @Body('tenantSlug') tenantSlug: string,
  ) {
    return this.tenantImageService.create(file, tenantId, tenantSlug);
  }
}
