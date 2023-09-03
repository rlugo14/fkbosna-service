import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Events } from 'src/constants';
import { TokenService } from 'src/tokens/tokens.service';
import { TokenPayload } from 'src/tokens/interfaces/token.payload';
import { AppConfigService } from 'src/shared/services/app-config.service';
import { UserService } from './users.service';
import { TenantService } from 'src/tenants/tenants.service';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private usersService: UserService,
    private configService: AppConfigService,
    private eventEmitter: EventEmitter2,
    private tokenService: TokenService,
    private tenantService: TenantService,
  ) {}

  @OnEvent(Events.sendVerificationEmail)
  public async sendVerificationLink(
    email: string,
    userId: number,
    tenantId: number,
  ) {
    const payload: TokenPayload = { email, userId, tenantId, type: 'refresh' };
    const token = await this.tokenService.createVerifyEmailToken(payload);

    return this.eventEmitter.emit(Events.sendMail, {
      to: email,
      subject: 'Bestätige deine E-Mail Adresse | Matdienst.de',
      template: './verify-email',
      context: {
        url: `${this.configService.appConfig.baseUrl}/email-confirmation/confirm?token=${token}`,
      },
    });
  }

  public async confirmEmail(token: string) {
    await this.tokenService.checkTokenValidity(token);
    const decodedToken = this.tokenService.decodeToken(token);
    await this.usersService.markEmailAsVerified(decodedToken.email);
    await this.tokenService.deleteAll(decodedToken.userId);
    const foundTenant = await this.tenantService.fetchUniqueById(
      decodedToken.tenantId,
    );
    const { protocol, host } = this.configService.webAppConfig;

    return `${protocol}${foundTenant.slug}.${host}/dashboard`;
  }
}
