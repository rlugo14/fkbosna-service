import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('reset-password')
  async resetPassword(@Body('email') email: string) {
    return this.authService.resetPassword(email);
  }
}
