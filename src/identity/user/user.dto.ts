import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class PasswordlessAuthDto {
  @ApiProperty({
    example: 'louise.michel@commune.paris',
    description: 'Email address of the user',
  })
  @IsEmail()
  email: string;
}

export class SignInDto extends PasswordlessAuthDto {
  @ApiProperty({
    example: 'Vive la commune libre 1871',
    description: 'Password of the user',
  })
  password: string;
}

export class RegisterDto extends SignInDto {
  @ApiProperty({
    example: 'Louise Michel',
    description: 'Name of the user',
  })
  displayName: string;
}

export class UserDto {
  @ApiProperty({
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Identifier of the user',
    required: true,
  })
  id: string;

  @ApiProperty({
    example: 'Louise Michel',
    description: 'Name of the user',
  })
  displayName: string;
}
