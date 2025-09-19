import { Module } from '@nestjs/common';
import { ResetPasswordService } from './resetPassword.service';
import { ResetPassword } from './resetPassword.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HasherModule } from 'src/identity/hasher/hasher.module';
import { UserModule } from 'src/identity/user/user.module';
import { MailModule } from 'src/common/mail/mail.module';
import { AppConfig } from 'src/app.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResetPassword]),
    HasherModule,
    UserModule,
    MailModule,
  ],
  providers: [AppConfig, ResetPasswordService],
  controllers: [],
  exports: [ResetPasswordService],
})
export class ResetPasswordModule {}
