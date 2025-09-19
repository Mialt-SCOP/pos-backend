import {
  Body,
  Controller,
  Post,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthResult,
  JwtPayload,
  PasswordlessResponseDto,
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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private resetPasswordService: ResetPasswordService,
    private userService: UserService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login to get an access token' })
  @ApiResponse({ status: 200, type: AuthResult })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  signIn(@Body() signInDto: SignInDto): Promise<AuthResult> {
    return this.authService.signIn(signInDto.email, signInDto.password);
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
  register(@Body() registerDto: RegisterDto): Promise<AuthResult> {
    return this.authService.register(registerDto);
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
