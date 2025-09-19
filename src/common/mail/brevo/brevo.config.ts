import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BREVO_API_KEY = 'BREVO_API_KEY';

@Injectable()
export class BrevoConfig {
  public readonly apiKey: string;
  constructor(configService: ConfigService) {
    this.apiKey = configService.getOrThrow<string>(BREVO_API_KEY);
  }
}
