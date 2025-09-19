import {
  Body,
  Controller,
  Request,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  ParseUUIDPipe,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  InviteMemberDto,
  OrganizationDetailsDto,
  OrganizationInvitation,
  PendingInvitation,
  SuccessResponse,
} from './organization.dto';
import { Organization, OrganizationMembers } from './organization.entity';
import { UserService } from '../user/user.service';
import { JwtPayload } from '../auth/auth.dto';
import { Roles } from '../auth/auth.decorators';
import { UserOrganizationRole } from './organization.types';
import { User } from '../user/user.entity';

const getUserIdFromOrganizationMember = (member: OrganizationMembers) =>
  member.userId;

@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly usersService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 200, type: Organization })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  createOrganization(
    @Body() createOrganizationData: CreateOrganizationDto,
    @Request() req: Request & { user: JwtPayload },
  ): Promise<Organization> {
    const userId = req.user.sub;
    return this.organizationService.create(createOrganizationData, userId);
  }

  @Roles(UserOrganizationRole.ADMIN, UserOrganizationRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @Get(':organizationId')
  @ApiOperation({ summary: 'Get the details of an organization' })
  @ApiResponse({ status: 200, type: OrganizationDetailsDto })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async fetchOrganization(
    @Request() req: Request & { organization: Organization },
  ): Promise<OrganizationDetailsDto> {
    const organization = req.organization;
    const users = await this.usersService.findByIds(
      organization.members.map(getUserIdFromOrganizationMember),
    );
    const userById: Record<string, User> = users.reduce(
      (acc: Record<string, User>, user) => {
        acc[user.id] = user;
        return acc;
      },
      {},
    );

    return {
      id: organization.id,
      name: organization.name,
      members: organization.members.map((member) => ({
        id: member.userId,
        displayName: userById[member.userId]?.displayName || '',
        role: member.role,
      })),
    };
  }

  @Roles(UserOrganizationRole.OWNER, UserOrganizationRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post(':organizationId/members')
  @ApiOperation({ summary: 'Invite a new member to the organization' })
  @ApiResponse({ status: 200, type: SuccessResponse })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async inviteMember(
    @Request() req: Request & { user: JwtPayload; organization: Organization },
    @Body() inviteMemberData: InviteMemberDto,
  ): Promise<SuccessResponse> {
    const organization = req.organization;
    const user = await this.usersService.findOne(req.user.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const response = await this.organizationService.inviteMember(
      user,
      organization,
      inviteMemberData,
    );

    return {
      success: response,
    };
  }

  @Roles(UserOrganizationRole.OWNER, UserOrganizationRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get(':organizationId/pending-invitations')
  @ApiOperation({
    summary:
      'Get the list of people who have a pending invitation to join the organization',
  })
  @ApiResponse({ status: 200, type: SuccessResponse })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async getPendingInvitation(
    @Request() req: Request & { organization: Organization },
  ): Promise<PendingInvitation[]> {
    return this.organizationService.getInvitedPeople(req.organization);
  }

  @HttpCode(HttpStatus.OK)
  @Get('invitation/:invitationId')
  @ApiOperation({
    summary:
      'Get the list of people who have a pending invitation to join the organization',
  })
  @ApiResponse({ status: 200, type: OrganizationInvitation })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async getInvitation(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ): Promise<OrganizationInvitation> {
    return this.organizationService.getInvitation(invitationId);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':organizationId/invitations/:invitationId')
  @ApiOperation({
    summary: 'Accept to join an organization',
  })
  @ApiResponse({ status: 200, type: SuccessResponse })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async acceptInvitation(
    @Request() req: Request & { user: JwtPayload },
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ): Promise<SuccessResponse> {
    const user = await this.usersService.findOne(req.user.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization) {
      throw new UnauthorizedException();
    }
    const res = await this.organizationService.acceptInvitation(
      organization,
      user,
      invitationId,
    );
    return { success: res };
  }
}
