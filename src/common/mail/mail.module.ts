import { FactoryProvider, Module } from '@nestjs/common';
import { MailConfig, MailProvider } from './mail.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrevoService } from './brevo/brevo.service';
import { BrevoConfig } from './brevo/brevo.config';
import { HttpService } from '@nestjs/axios';
import { create } from 'axios';
import { MAIL_PROVIDER, MailServiceI } from './mail.interface';

const provider: FactoryProvider<MailServiceI> = {
  provide: MAIL_PROVIDER,
  inject: [ConfigService, MailConfig],
  useFactory: (configService: ConfigService, mailConfig: MailConfig) => {
    switch (mailConfig.provider) {
      case MailProvider.BREVO: {
        const brevoConfig = new BrevoConfig(configService);
        const httpService = new HttpService(
          create({ baseURL: brevoConfig.baseUrl }),
        );
        return new BrevoService(httpService, mailConfig, brevoConfig);
      }
    }
  },
};

@Module({
  imports: [ConfigModule],
  providers: [MailConfig, provider],
  exports: [provider],
})
export class MailModule {}
