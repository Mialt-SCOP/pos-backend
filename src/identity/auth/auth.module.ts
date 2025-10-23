import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordLessTemporaryPin } from './auth.entity';
import { AppConfig } from 'src/app.config';
import { UserModule } from '../user/user.module';
import { ResetPasswordModule } from './resetPassword/resetPassword.module';
import { AuthService } from './auth.service';
import { MailModule } from 'src/common/mail/mail.module';
import { AuthController } from './auth.controller';
import { HasherModule } from '../hasher/hasher.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { IdentityConfig } from '../identity.config';
import { OrganizationModule } from '../organization/organization.module';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      extraProviders: [IdentityConfig],
      inject: [IdentityConfig],
      useFactory: (config: IdentityConfig) => ({
        secret: config.JwtSecret,
        signOptions: { expiresIn: '7d' },
      }),
    }),
    TypeOrmModule.forFeature([PasswordLessTemporaryPin]),
    UserModule,
    OrganizationModule,
    ResetPasswordModule,
    MailModule,
    HasherModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AppConfig, AuthService],
})
export class AuthModule {}
