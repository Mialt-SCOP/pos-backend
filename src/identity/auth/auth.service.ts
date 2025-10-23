import { randomBytes, randomInt } from 'crypto';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthResult,
  JwtCreatePayload,
  PasswordlessResponseDto,
  PasswordlessValidationPayload,
  RegisterDto,
} from './auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordLessTemporaryPin } from './auth.entity';
import { UserService } from '../user/user.service';
import { HasherService } from '../hasher/hasher.service';
import {
  MAIL_PROVIDER,
  type MailServiceI,
} from 'src/common/mail/mail.interface';
import { AppConfig } from 'src/app.config';
import { User } from '../user/user.entity';
import { userToDto } from '../user/user.utils';
import { PasswordlessAuthDto } from './passwordLess.dto';
import { SignInDto } from '../user/user.dto';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PasswordLessTemporaryPin)
    private passwordLessTemporaryPinRepository: Repository<PasswordLessTemporaryPin>,
    private readonly userService: UserService,
    private readonly hasherService: HasherService,
    private readonly jwtService: JwtService,
    @Inject(MAIL_PROVIDER) private readonly mailService: MailServiceI,
    private readonly appConfig: AppConfig,
    private readonly redisService: RedisService,
  ) {}

  async signIn(payload: SignInDto): Promise<AuthResult> {
    const user = await this.userService.findByUsername(payload.username);
    if (
      !user ||
      !(await this.hasherService.verify(payload.password, user.password))
    ) {
      throw new UnauthorizedException();
    }

    return this.getAccessToken(user);
  }

  private getPayload(user: User): JwtCreatePayload {
    return { sub: user.id, name: `${user.displayName}` };
  }

  public async getAccessToken(user: User): Promise<AuthResult> {
    const payload = this.getPayload(user);
    const challenge = randomBytes(32).toString('base64url');
    await this.redisService.set(`challenge:${challenge}`, user.id);
    return {
      token: await this.jwtService.signAsync(payload, { expiresIn: 60 * 60 }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: 60 * 60 * 24 * 7,
      }),
      user: userToDto(user),
      challenge,
    };
  }

  async refreshToken(token: string | undefined): Promise<AuthResult> {
    if (!token) throw new UnauthorizedException();
    const refreshToken =
      await this.jwtService.verifyAsync<JwtCreatePayload>(token);
    const user = await this.userService.findOne(refreshToken.sub);
    if (!user) throw new UnauthorizedException();
    return this.getAccessToken(user);
  }

  private async createPasswordlessToken(user: User): Promise<string> {
    const payload = this.getPayload(user);
    payload.isPasswordless = true;
    return await this.jwtService.signAsync(payload, { expiresIn: 300 });
  }

  async register(payload: RegisterDto): Promise<AuthResult> {
    let user = await this.userService.findByUsername(payload.username);
    if (
      user &&
      !(await this.hasherService.verify(payload.password, user.password))
    ) {
      throw new UnauthorizedException();
    }
    if (!user) {
      user = await this.userService.register(payload);
    }
    return this.getAccessToken(user);
  }

  async passwordLessAuth({
    email,
  }: PasswordlessAuthDto): Promise<PasswordlessResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException();
    }
    const token = await this.createPasswordlessToken(user);
    const temporaryPin = randomInt(100000, 999999);
    const temporaryPinEntity = new PasswordLessTemporaryPin();
    temporaryPinEntity.user = user;
    temporaryPinEntity.pin = temporaryPin.toString();
    await this.passwordLessTemporaryPinRepository.save(temporaryPinEntity);

    await this.mailService.sendEmail(
      { email, name: user.displayName },
      'Affiches : Authentification sans mot de passe',
      `<html><head></head>
    <body>
      <p>
        Bonjour ${user.displayName},<br/>
        Pour vous authentifier, utilisez le code suivant : <br />
        <span  style="font-size: 22px">${temporaryPin}</span><br />
        <br />
        Vous pouvez également cliquer sur le lien suivant : <a href="${this.appConfig.frontEndBaseUrl}/passwordless-auth/${token}/${temporaryPin}">connexion</a>
      </p>
    </body>
  </html>`,
    );
    return { token: token };
  }

  async validatePasswordLessAuth(payload: PasswordlessValidationPayload) {
    try {
      const result = await this.jwtService.verifyAsync<JwtCreatePayload>(
        payload.token,
      );
      if (!result.isPasswordless) {
        throw new UnauthorizedException();
      }
      const user = await this.userService.findOne(result.sub);
      if (!user) {
        throw new UnauthorizedException();
      }
      const temporaryPin =
        await this.passwordLessTemporaryPinRepository.findOne({
          where: { user: { id: user.id } },
        });
      if (
        !temporaryPin ||
        temporaryPin.pin !== payload.code ||
        temporaryPin.isExpired()
      ) {
        throw new UnauthorizedException();
      }
      const accessToken = await this.getAccessToken(user);
      return accessToken;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
