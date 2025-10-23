import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeORMConfig } from './common/db/db.config';
import { DbModule } from './common/db/db.module';
import { IdentityConfig } from './identity/identity.config';
import { MailConfig } from './common/mail/mail.config';
import { IdentityModule } from './identity/identity.module';
import { AppConfig } from './app.config';
import { CatalogModule } from './catalog/catalog.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './identity/auth/auth.guard';
import { UserModule } from './identity/user/user.module';
import { OrganizationModule } from './identity/organization/organization.module';
import { RedisConfig } from './common/redis/redis.config';

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
        ...RedisConfig.getConfigValidation(),
      }),
    }),
    DbModule,

    IdentityModule,
    UserModule, // Needed for AuthGuard
    OrganizationModule, // Needed for AuthGuard
    CatalogModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
