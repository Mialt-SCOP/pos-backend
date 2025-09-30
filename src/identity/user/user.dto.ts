import { ApiProperty } from '@nestjs/swagger';

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

export class CreateUserDto {
  @ApiProperty({
    example: 'louise.michel',
    description: 'Username of the user',
  })
  username: string;
}

export class UserDto {
  @ApiProperty({
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Identifier of the user',
    required: true,
  })
  id: string;

  @ApiProperty({
    example: 'louise.michel',
    description: 'Username of the user',
  })
  username: string;

  @ApiProperty({
    example: 'Louise Michel',
    description: 'Name of the user',
  })
  displayName: string;

  @ApiProperty({
    example: true,
    description: 'Weither the user is active or not',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2023-07-16T21:49:12Z',
    description: 'Datetime in iso format when the user has been created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-07-16T21:49:12Z',
    description: 'Datetime in iso format when the user has been updated',
  })
  updatedAt: Date;
}
