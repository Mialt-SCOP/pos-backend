import { Injectable } from '@nestjs/common';
import { BrevoService } from './brevo';
import { MailServiceI } from './interface';
import { MailConfig, MailProvider } from './mail.config';
import { EmailRecipient } from './mail.dto';

@Injectable()
export class MailService {
  private service: MailServiceI;
  constructor(private readonly config: MailConfig) {
    if (config.provider === MailProvider.BREVO) {
      // TODO: Inject BrevoService
    }
  }

  async sendEmail(
    to: EmailRecipient | EmailRecipient[],
    subject: string,
    htmlContent: string,
  ): Promise<boolean> {
    return await this.service.sendEmail(to, subject, htmlContent);
  }
}
