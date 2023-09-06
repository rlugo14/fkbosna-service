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
import { PlayerImageService } from './player-image.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { EmailConfirmedGuard } from 'src/guards/email-confirmed.guard';

@Controller('player-image')
export class PlayerImageController {
  constructor(private readonly playerImageService: PlayerImageService) {}

  @Post('upload')
  @UseGuards(AuthGuard, EmailConfirmedGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile()
    file: Express.Multer.File,
    @Body('playerId', ParseIntPipe) playerId: number,
    @Body('tenantSlug') tenantSlug: string,
  ) {
    return this.playerImageService.createFromFile(file, playerId, tenantSlug);
  }
}
