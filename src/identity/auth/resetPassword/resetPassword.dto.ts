import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateResetPasswordDto {
  @ApiProperty({
    example: 'louise.michel@commune.paris',
    description: 'Email address of the user',
  })
  @IsEmail()
  email: string;
}

export class SetNewPasswordDto {
  @ApiProperty({
    example: 'aec22905-922f-4453-b5d7-37b0a563823b',
    description: 'Reset password Token received by email',
  })
  resetToken: string;

  @ApiProperty({
    example: 'Vive la commune libre 1871',
    description: 'Password of the user',
  })
  password: string;
}
