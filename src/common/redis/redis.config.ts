import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

const REDIS_HOST = 'REDIS_HOST';
const REDIS_PORT = 'REDIS_PORT';
const REDIS_PASSWORD = 'REDIS_PASSWORD';
const REDIS_TOKEN = 'REDIS_TOKEN';

@Injectable()
export class RedisConfig {
  host: string;
  port: number;
  password?: string | undefined;
  token?: string | undefined;

  constructor(configService: ConfigService) {
    this.host = configService.getOrThrow<string>(REDIS_HOST);
    this.port = configService.getOrThrow<number>(REDIS_PORT);
    this.password = configService.get<string>(REDIS_PASSWORD);
    this.token = configService.get<string>(REDIS_TOKEN);
  }

  public static getConfigValidation() {
    return {
      [REDIS_HOST]: Joi.string().required(),
      [REDIS_PORT]: Joi.number().required(),
      [REDIS_PASSWORD]: Joi.string().optional(),
      [REDIS_TOKEN]: Joi.string().optional(),
    };
  }
}
