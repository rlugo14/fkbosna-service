import { AppConfigService } from './../shared/services/app-config.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/constants';
import { TokenService } from 'src/tokens/tokens.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly configService: AppConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async resetPassword(email: string, tenantId: number) {
    const foundUser = await this.userService.fetchUniqueByEmail(email);

    if (!foundUser || foundUser.tenantId !== tenantId) {
      return;
    }

    await this.tokenService.deleteAll(foundUser.id);
    const token = await this.tokenService.createChangePasswordToken({
      userId: foundUser.id,
      email: foundUser.email,
      tenantId: foundUser.tenantId,
    });

    const resetPasswordLink = this.createResetPasswordLink(
      foundUser.tenant.slug,
      token,
    );
    this.sendResetPasswordMail(foundUser.email, resetPasswordLink);
  }

  private createResetPasswordLink(tenantSlug: string, token: string) {
    const { protocol, host } = this.configService.webAppConfig;
    return `${protocol}${tenantSlug}.${host}/reset-password?token=${token}`;
  }

  private sendResetPasswordMail(email: string, resetPasswordLink: string) {
    this.eventEmitter.emit(Events.sendMail, {
      to: email,
      subject: 'Passwort zurücksetzen | Matdienst.de',
      template: './reset-password',
      context: {
        url: resetPasswordLink,
      },
    });
  }
}
