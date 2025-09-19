import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

const FRONTEND_BASE_URL = 'FRONTEND_BASE_URL';

@Injectable()
export class AppConfig {
  frontEndBaseUrl: string;

  constructor(configService: ConfigService) {
    this.frontEndBaseUrl = configService.getOrThrow<string>(FRONTEND_BASE_URL);
  }

  public static getConfigValidation() {
    return {
      [FRONTEND_BASE_URL]: Joi.string().required(),
    };
  }
}
