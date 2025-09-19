import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { BrevoConfig } from './brevo.config';
import { MailConfig } from '../mail.config';
import { EmailRecipient } from '../mail.dto';
import { MailServiceI } from '../mail.interface';

@Injectable()
export class BrevoService implements MailServiceI {
  constructor(
    private readonly httpService: HttpService,
    private readonly mailConfig: MailConfig,
    private readonly brevoConfig: BrevoConfig,
  ) {}

  async sendEmail(
    to: EmailRecipient | EmailRecipient[],
    subject: string,
    htmlContent: string,
  ) {
    const response = await firstValueFrom(
      this.httpService.post<{ messageId?: string }>(
        `smtp/email`,
        {
          sender: {
            name: this.mailConfig.senderName,
            email: this.mailConfig.senderEmail,
          },
          to: Array.isArray(to) ? to : [to],
          subject,
          htmlContent,
        },
        {
          headers: {
            Accept: 'application/json',
            'api-key': this.brevoConfig.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return (
      response.status >= 200 &&
      response.status < 300 &&
      !!response.data?.messageId
    );
  }
}
