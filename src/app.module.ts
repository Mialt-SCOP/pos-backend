import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeORMConfig } from './db/db.config';
import { DbModule } from './db/db.module';
import { IdentityConfig } from './identity/identity.config';
import { MailConfig } from './common/mail/mail.config';
import { IdentityModule } from './identity/identity.module';
import { AppConfig } from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        ...AppConfig.getConfigValidation(),
        ...TypeORMConfig.getConfigValidation(),
        ...IdentityConfig.getConfigValidation(),
        ...MailConfig.getConfigValidation(),
      }),
    }),

    DbModule,
    IdentityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
