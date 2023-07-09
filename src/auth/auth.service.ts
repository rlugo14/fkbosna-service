import { AppConfigService } from './../shared/services/app-config.service';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/constants';
import { TokenService } from 'src/tokens/tokens.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly configService: AppConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async resetPassword(email: string, tenantId: number) {
    this.logger.log(
      `resetting password for email: ${email}, tenantId: ${tenantId}`,
    );
    const foundUser = await this.userService.fetchUniqueByEmail(email);

    if (!foundUser || foundUser.tenantId !== tenantId) {
      if (foundUser) {
        this.logger.error(
          `User with email: ${email} does not belong to tenant: ${JSON.stringify(
            foundUser.tenant,
          )}`,
        );
      } else {
        this.logger.error(`User with email: ${email} was not found`);
      }

      return;
    }

    await this.tokenService.deleteAll(foundUser.id);
    const token = await this.tokenService.createChangePasswordToken({
      userId: foundUser.id,
      email: foundUser.email,
      tenantId: foundUser.tenantId,
      type: 'refresh',
    });

    const resetPasswordLink = this.createResetPasswordLink(
      foundUser.tenant.slug,
      token,
    );

    this.logger.log(`Sending `);
    this.sendResetPasswordMail(foundUser.email, resetPasswordLink);
  }

  private createResetPasswordLink(tenantSlug: string, token: string) {
    this.logger.log(
      `Creating reset password for tenant: ${tenantSlug} - token: ${token}`,
    );
    const { protocol, host } = this.configService.webAppConfig;
    return `${protocol}${tenantSlug}.${host}/reset-password?token=${token}`;
  }

  private sendResetPasswordMail(email: string, resetPasswordLink: string) {
    this.logger.log(`Sending reset password link to email: ${email}`);
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
