import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeORMConfig } from './db/db.config';
import { DbModule } from './db/db.module';
import { IdentityConfig } from './identity/identity.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        ...TypeORMConfig.getConfigValidation(),
        ...IdentityConfig.getConfigValidation(),
      }),
    }),
    DbModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
