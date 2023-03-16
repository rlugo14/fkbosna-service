import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './services/app-config.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './services/email.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: AppConfigService) => ({
        transport: {
          secure: configService.emailConfig.secure,
          host: configService.emailConfig.host,
          port: configService.emailConfig.port,
          auth: {
            user: configService.emailConfig.user,
            pass: configService.emailConfig.password,
          },
        },
        defaults: {
          from: `"${configService.emailConfig.fromName}" <${configService.emailConfig.from}>`,
        },
        template: {
          dir: process.cwd() + '/dist/mail/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [AppConfigService, EmailService],
  exports: [AppConfigService],
})
export class SharedModule {}
