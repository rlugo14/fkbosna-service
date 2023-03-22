import { TenantId, TenantIdFrom } from 'src/tenants/tenant.decorator';
import { TokenService } from 'src/tokens/tokens.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/auth.guard';
import { Token } from 'src/token.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ) {
    return this.authService.resetPassword(email, tenantId);
  }

  @Get('verify-token')
  @UseGuards(AuthGuard)
  async verifyToken(@Token() token: string) {
    await this.tokenService.checkTokenValidity(token);
  }
}
