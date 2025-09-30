import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from '../user/user.dto';
import { IsEmail } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'louise.michel',
    description: 'Username of the user',
  })
  username: string;

  @ApiProperty({
    example: 'Vive la commune libre 1871',
    description: 'Password of the user',
  })
  password: string;
}

export class RegisterDto extends SignInDto {
  @ApiProperty({
    example: 'louise.michel@commune.paris',
    description: 'Email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Louise Michel',
    description: 'Name of the user',
  })
  displayName: string;
}

export class PasswordlessResponseDto {
  @ApiProperty({
    example: 'f3353102-a656-417b-93d4-5f326b51ba97',
    description: 'Temporary token sent by email to the user',
  })
  token: string;
}

export class PasswordlessValidationPayload {
  @ApiProperty({
    example: 'd57ac9d7-e5a4-4688-a81a-7c6455364d06',
    description: 'Token sent by email to the user',
  })
  token: string;

  @ApiProperty({
    example: '918273',
    description: 'Code sent by email to the user',
  })
  code: string;
}

export class AuthResult {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0aXRpIHRvdG8iLCJuYW1lIjoiVGl0aSBUb3RvIiwiaWF0IjoxNjg4NTgzMTcwLCJleHAiOjE2ODkxODc5NzB9.C4Wm911ugYvj_dUb1ClPr4r4Usf5W07kRkP1boOWP2E',
    description: 'Identifier of the user',
    required: true,
  })
  token: string;

  @ApiProperty()
  user: UserDto;
}

export class JwtCreatePayload {
  @ApiProperty({
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Identifier of the user',
  })
  sub: string;

  @ApiProperty({
    example: 'Louise Michel',
    description: 'Name of the user',
  })
  name: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Weither the token is passwordless or not',
  })
  isPasswordless?: boolean;
}

export class JwtPayload extends JwtCreatePayload {
  @ApiProperty({
    example: '1688627656',
    description: 'Timestamp in seconds of the creation date of the token',
  })
  iat: number;

  @ApiProperty({
    example: '1689232456',
    description: 'Timestamp in seconds of the expiration date of the token',
  })
  exp: number;
}
