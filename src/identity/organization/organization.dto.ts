import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../user/user.dto';
import { UserOrganizationRole } from './organization.types';
import { IsEmail } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'La Commune',
    description: 'Name of your organization',
  })
  name: string;
}

export class OrganizationMembersDto extends UserDto {
  @ApiProperty({
    enum: UserOrganizationRole,
    example: UserOrganizationRole.SUPPLY_MANAGER,
    description: 'Role of the user in the organization',
  })
  role: UserOrganizationRole;
}

export class OrganizationSummary extends CreateOrganizationDto {
  @ApiProperty({
    example: '6d8ec82b-4d46-4986-baca-4c54118dca6b',
    description: 'Id of your organization',
  })
  id: string;
}

export class OrganizationDetailsDto extends OrganizationSummary {
  @ApiProperty({
    type: OrganizationMembersDto,
    isArray: true,
    description: 'List of members of the organization',
  })
  members: OrganizationMembersDto[];
}

export class InviteMemberDto {
  @ApiProperty({
    example: '6d8ec82b-4d46-4986-baca-4c54118dca6b',
    description: 'Id of the invited member',
  })
  id: string;

  @ApiProperty({
    example: 'louise.michel@commune.paris',
    description: 'email of the new invited member',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: UserOrganizationRole,
    example: UserOrganizationRole.ACCOUTANT,
    description: 'Role of the user in the organization',
  })
  role: UserOrganizationRole;

  @ApiProperty({
    example: '2023-07-16T21:49:12Z',
    description: 'Datetime in iso format when the invitation has been created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-07-16T21:49:12Z',
    description: 'Datetime in iso format when the invitation has been updated',
  })
  updatedAt: Date;
}

export class SuccessResponse {
  @ApiProperty({
    example: true,
    description: 'true if request has been successful',
  })
  success: boolean;
}

export class PendingInvitation {
  @ApiProperty({
    example: 'louise.michel@commune.paris',
    description: 'email of the new invited member',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: UserOrganizationRole,
    example: UserOrganizationRole.ACCOUTANT,
    description: 'Role of the user in the organization',
  })
  role: UserOrganizationRole;

  @ApiProperty({
    example: '2023-07-16T21:49:12Z',
    description: 'Datetime in iso format when the invitation has been created',
  })
  createdAt: Date;
}

export class OrganizationInvitation {
  @ApiProperty({
    type: OrganizationSummary,
    description: 'Organization the user has been invited to join',
  })
  organization: OrganizationSummary;

  @ApiProperty({
    enum: UserOrganizationRole,
    example: UserOrganizationRole.ACCOUTANT,
    description: 'Role of the user in the organization',
  })
  role: UserOrganizationRole;

  @ApiProperty({
    example: 'louise.michel@commune.paris',
    description: 'email of the new invited member',
  })
  email: string;
}
