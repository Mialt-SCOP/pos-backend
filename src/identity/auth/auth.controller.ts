import {
  Body,
  Controller,
  Post,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import {
  AuthResult,
  JwtPayload,
  PasswordlessResponseDto,
  RefreshTokenDto,
  RegisterDto,
  SignInDto,
} from './auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './auth.decorators';
import { AuthService } from './auth.service';
import { ResetPasswordService } from './resetPassword/resetPassword.service';
import { UserService } from '../user/user.service';
import { PasswordlessAuthDto } from './passwordLess.dto';
import {
  CreateResetPasswordDto,
  SetNewPasswordDto,
} from './resetPassword/resetPassword.dto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CookieSerializeOptions } from '@fastify/cookie';

type FastifyReplyWithCookie = FastifyReply & {
  setCookie: (
    name: string,
    value: string,
    options?: CookieSerializeOptions,
  ) => FastifyReply;
};

type FastifyRequestWithCookies = FastifyRequest & {
  cookies: { [cookieName: string]: string | undefined };
};

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private resetPasswordService: ResetPasswordService,
    private userService: UserService,
  ) {}

  private setRefreshTokenCookie(
    response: FastifyReplyWithCookie,
    refreshToken: string,
  ) {
    response.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      //secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      signed: true,
      domain: 'localhost',
      path: '/',
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login to get an access token' })
  @ApiResponse({ status: 200, type: AuthResult })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: FastifyReplyWithCookie,
  ): Promise<AuthResult> {
    const result = await this.authService.signIn(signInDto);
    this.setRefreshTokenCookie(response, result.refresh_token);
    return result;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('passwordless')
  @ApiOperation({
    summary: 'Passwordless authentication sending code by email',
  })
  passwordLessAuth(
    @Body() payload: PasswordlessAuthDto,
  ): Promise<PasswordlessResponseDto> {
    return this.authService.passwordLessAuth(payload);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Request() req: FastifyRequestWithCookies,
    @Res({ passthrough: true }) response: FastifyReplyWithCookie,
    @Body() refreshTokenDto?: RefreshTokenDto,
  ) {
    const refreshToken =
      req.cookies['refresh_token'] ?? refreshTokenDto?.refresh_token;
    const result = await this.authService.refreshToken(refreshToken);
    this.setRefreshTokenCookie(response, result.refresh_token);
    return result;
  }

  /*@Public()
  @HttpCode(HttpStatus.OK)
  @Post('passwordless/validate')
  @ApiOperation({
    summary: 'Passwordless authentication with code received by email',
  })
  validatePasswordless(
    @Body() payload: PasswordlessValidationPayload,
  ): Promise<AuthResult> {
    return this.authService.validatePasswordLessAuth(payload);
  }*/

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  @ApiOperation({ summary: 'Register as a new user' })
  @ApiResponse({ status: 200, type: AuthResult })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: FastifyReplyWithCookie,
  ): Promise<AuthResult> {
    const result = await this.authService.register(registerDto);
    this.setRefreshTokenCookie(response, result.refresh_token);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Get('current-user')
  @ApiOperation({
    summary: 'Retrieve current user data',
  })
  @ApiResponse({ status: 200, type: AuthResult })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async getProfile(
    @Request() req: Request & { user: JwtPayload },
  ): Promise<AuthResult> {
    const user = await this.userService.findOne(req.user.sub);
    if (!user) throw new UnauthorizedException();
    return this.authService.getAccessToken(user);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password with link in email' })
  @ApiResponse({ status: 200, type: AuthResult })
  resetPassword(@Body() resetDto: CreateResetPasswordDto): Promise<boolean> {
    return this.resetPasswordService.create(resetDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('set-new-password')
  @ApiOperation({
    summary: 'Set new password with reset password token received by email',
  })
  @ApiResponse({ status: 200, type: AuthResult })
  setNewPassword(@Body() setNewPassword: SetNewPasswordDto): Promise<void> {
    return this.resetPasswordService.setNewPassword(setNewPassword);
  }
}
