import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from 'src/constants';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent(Events.sendMail)
  sendMail(options: ISendMailOptions) {
    return this.mailerService.sendMail(options);
  }
}
