import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { EmailConfirmationService } from './emailConfirmation.service';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthUserEmail, AuthUserId } from 'src/decorators/auth-user.decorator';
import { TenantId, TenantIdFrom } from 'src/decorators/tenant.decorator';

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

  @UseGuards(AuthGuard)
  @Get('send')
  async sendConfirmEmail(
    @AuthUserId() userId: number,
    @AuthUserEmail() userEmail: string,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ) {
    await this.emailConfirmationService.sendVerificationLink(
      userEmail,
      userId,
      tenantId,
    );
  }
}
