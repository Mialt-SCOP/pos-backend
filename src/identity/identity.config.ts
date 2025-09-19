import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

@Injectable()
export class IdentityConfig {
  hashPasswordPepper: string;
  JwtSecret: string;
  constructor(configService: ConfigService) {
    this.hashPasswordPepper = configService.getOrThrow<string>(
      'HASH_PASSWORD_PEPPER',
    );
    this.JwtSecret = configService.getOrThrow<string>('AUTH_JWT_SECRET');
  }

  public static getConfigValidation() {
    return {
      HASH_PASSWORD_PEPPER: Joi.string().required(),
      AUTH_JWT_SECRET: Joi.string().required(),
    };
  }
}
