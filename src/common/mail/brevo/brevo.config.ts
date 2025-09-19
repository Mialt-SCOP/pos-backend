import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

const BREVO_API_KEY = 'BREVO_API_KEY';

export const BREVO_BASE_URL = 'https://api.brevo.com/v3';

@Injectable()
export class BrevoConfig {
  public readonly apiKey: string;
  public readonly baseUrl = BREVO_BASE_URL;

  constructor(configService: ConfigService) {
    this.apiKey = configService.getOrThrow<string>(BREVO_API_KEY);
  }

  public static getConfigValidation() {
    return {
      [BREVO_API_KEY]: Joi.string().required(),
    };
  }
}
