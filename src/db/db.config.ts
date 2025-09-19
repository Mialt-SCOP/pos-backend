import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

const DATABASE_HOST = 'DATABASE_HOST';
const DATABASE_USER = 'DATABASE_USER';
const DATABASE_PASSWORD = 'DATABASE_PASSWORD';
const DATABASE_NAME = 'DATABASE_NAME';
const DATABASE_PORT = 'DATABASE_PORT';

@Injectable()
export class TypeORMConfig {
  host: string;
  user: string;
  password: string;
  name: string;
  port: number;

  constructor(configService: ConfigService) {
    this.host = configService.getOrThrow<string>(DATABASE_HOST);
    this.user = configService.getOrThrow<string>(DATABASE_USER);
    this.password = configService.getOrThrow<string>(DATABASE_PASSWORD);
    this.name = configService.getOrThrow<string>(DATABASE_NAME);
    this.port = configService.getOrThrow<number>(DATABASE_PORT);
  }

  public static getConfigValidation() {
    return {
      DATABASE_HOST: Joi.string().required(),
      DATABASE_USER: Joi.string().required(),
      DATABASE_PASSWORD: Joi.string().required(),
      DATABASE_NAME: Joi.string().required(),
      DATABASE_PORT: Joi.number().required(),
    };
  }
}
