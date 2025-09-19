import { Module } from '@nestjs/common';
import { MailConfig } from './mail.config';
import { BrevoModule } from './brevo/brevo.module';
import { MailService } from './mail.service';

@Module({
  imports: [BrevoModule],
  providers: [MailConfig, MailService],
  controllers: [],
  exports: [MailService],
})
export class MailModule {}
