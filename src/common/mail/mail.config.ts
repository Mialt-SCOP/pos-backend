import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

export enum MailProvider {
  BREVO = 'BREVO',
}

const MAIL_PROVIDER = 'MAIL_PROVIDER';
const MAIL_SENDER_EMAIL = 'MAIL_SENDER_EMAIL';
const MAIL_SENDER_NAME = 'MAIL_SENDER_NAME';

@Injectable()
export class MailConfig {
  public readonly provider: MailProvider;
  public readonly senderEmail: string;
  public readonly senderName?: string;

  constructor(configService: ConfigService) {
    this.provider = configService.getOrThrow<MailProvider>(MAIL_PROVIDER);
    this.senderEmail = configService.getOrThrow<string>(MAIL_SENDER_EMAIL);
    this.senderName = configService.get<string>(MAIL_SENDER_NAME);
  }

  public static getConfigValidation() {
    return {
      [MAIL_PROVIDER]: Joi.string()
        .required()
        .valid(...Object.values(MailProvider)),
      [MAIL_SENDER_EMAIL]: Joi.string().email().required(),
      [MAIL_SENDER_NAME]: Joi.string(),
    };
  }
}
