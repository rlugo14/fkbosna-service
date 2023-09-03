import { Controller, Get, Query, Res } from '@nestjs/common';
import { EmailConfirmationService } from './emailConfirmation.service';
import { Response } from 'express';

@Controller('email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Get('confirm')
  async confirm(@Query('token') token: string, @Res() res: Response) {
    const redirectUrl = await this.emailConfirmationService.confirmEmail(token);
    return res.redirect(redirectUrl);
  }
}
