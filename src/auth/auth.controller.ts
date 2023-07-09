import { TenantId, TenantIdFrom } from 'src/decorators/tenant.decorator';
import { TokenService } from 'src/tokens/tokens.service';
import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Token } from 'src/decorators/token.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ) {
    this.logger.log(
      `Resetting password for email: ${email} - tenantId: ${tenantId}`,
    );
    return this.authService.resetPassword(email, tenantId);
  }

  @Get('verify-token')
  @UseGuards(AuthGuard)
  async verifyToken(@Token() token: string) {
    this.logger.log(`Verifying following token: ${token}`);
    await this.tokenService.checkTokenValidity(token);
  }
}
