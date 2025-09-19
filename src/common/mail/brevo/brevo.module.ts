import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BrevoService } from './brevo.service';
import { BrevoConfig } from './brevo.config';
import { ConfigModule } from '@nestjs/config';
import { MailConfig } from '../mail.config';

const BASE_URL = 'https://api.brevo.com/v3';

@Module({
  imports: [HttpModule.register({ baseURL: BASE_URL }), ConfigModule],
  providers: [BrevoConfig, MailConfig, BrevoService],
  controllers: [],
  exports: [BrevoService],
})
export class BrevoModule {}
