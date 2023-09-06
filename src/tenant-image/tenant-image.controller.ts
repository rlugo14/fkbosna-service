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
import { AuthGuard } from 'src/guards/auth.guard';
import { EmailConfirmedGuard } from 'src/guards/email-confirmed.guard';

@Controller('tenant-image')
export class TenantImageController {
  constructor(private readonly tenantImageService: TenantImageService) {}

  @Post('file/upload')
  @UseGuards(AuthGuard, EmailConfirmedGuard)
  @UseInterceptors(FileInterceptor('file'))
  async fileUpload(
    @UploadedFile()
    file: Express.Multer.File,
    @Body('tenantId', ParseIntPipe) tenantId: number,
    @Body('tenantSlug') tenantSlug: string,
  ) {
    return this.tenantImageService.createFromFile(file, tenantId, tenantSlug);
  }

  @Post('source/upload')
  @UseGuards(AuthGuard, EmailConfirmedGuard)
  async sourceUpload(
    @Body('imageUrl') imageUrl: string,
    @Body('tenantId', ParseIntPipe) tenantId: number,
    @Body('tenantSlug') tenantSlug: string,
  ) {
    return this.tenantImageService.downloadAndCreate(
      imageUrl,
      tenantId,
      tenantSlug,
    );
  }
}
