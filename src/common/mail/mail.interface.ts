import { EmailRecipient } from './mail.dto';

export interface MailServiceI {
  sendEmail: (
    to: EmailRecipient | EmailRecipient[],
    subject: string,
    htmlContent: string,
  ) => Promise<boolean>;
}
