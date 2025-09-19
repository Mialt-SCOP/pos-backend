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
