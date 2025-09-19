import { EmailRecipient } from './mail.dto';

export const MAIL_PROVIDER = 'MAIL_PROVIDER';

export interface MailServiceI {
  sendEmail: (
    to: EmailRecipient | EmailRecipient[],
    subject: string,
    htmlContent: string,
  ) => Promise<boolean>;
}
