import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeORMConfig } from './db.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      extraProviders: [TypeORMConfig],
      inject: [TypeORMConfig],
      useFactory: (config: TypeORMConfig) => ({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.name,
        autoLoadEntities: true,
        logging: false,
        synchronize: false,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class DbModule {}
