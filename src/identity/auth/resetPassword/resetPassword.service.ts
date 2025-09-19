import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResetPassword } from './resetPassword.entity';
import { Repository } from 'typeorm';
import { CreateResetPasswordDto, SetNewPasswordDto } from './resetPassword.dto';
import { UserService } from 'src/identity/user/user.service';
import {
  MAIL_PROVIDER,
  type MailServiceI,
} from 'src/common/mail/mail.interface';
import { HasherService } from 'src/identity/hasher/hasher.service';
import { AppConfig } from 'src/app.config';

const RESET_PASSWORD_EXPIRATION_TIME = 3600_000; // Reset password tokens expire after 1 hour

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
    private readonly userService: UserService,
    @Inject(MAIL_PROVIDER) private readonly mailService: MailServiceI,
    private readonly hasherService: HasherService,
    private readonly appConfig: AppConfig,
  ) {}

  async create({ email }: CreateResetPasswordDto): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      const createResetPassword = new ResetPassword();
      createResetPassword.user = user;
      const resetPassword =
        await this.resetPasswordRepository.save(createResetPassword);
      const resetPasswordLink = new URL(
        `/reset-password/${resetPassword.id}`,
        this.appConfig.frontEndBaseUrl,
      );
      return await this.mailService.sendEmail(
        {
          name: user.displayName,
          email: user.email,
        },
        'Reset your password',
        `<html><head></head>
            <body>
              <p>
                Hello ${user.displayName},<br/>
                To reset your password, click on the following link: <a href="${resetPasswordLink.href}">${resetPasswordLink.href}</a>
              </p>
            </body>
          </html>`,
      );
    }
    return false;
  }

  async setNewPassword({
    password,
    resetToken,
  }: SetNewPasswordDto): Promise<void> {
    const results = await this.resetPasswordRepository.find({
      where: {
        id: resetToken,
      },
      relations: {
        user: true,
      },
      take: 1,
    });
    if (results.length === 0) {
      throw new NotFoundException();
    }
    const resetPassword = results[0];
    if (resetPassword.usedAt) {
      throw new BadRequestException(
        'Your reset password token has been already used',
      );
    }
    if (
      resetPassword.createdAt.getTime() <
      new Date().getTime() - RESET_PASSWORD_EXPIRATION_TIME
    ) {
      throw new BadRequestException(
        'Your token has expired, please restart the reset process from the begining',
      );
    }
    const user = resetPassword.user;
    await this.resetPasswordRepository.manager.transaction(
      async (transactionEntityManager) => {
        user.password = await this.hasherService.hash(password);
        await transactionEntityManager.save(user);
        resetPassword.usedAt = new Date();
        await transactionEntityManager.save(resetPassword);
      },
    );
  }
}
