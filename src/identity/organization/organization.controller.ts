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
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  InviteMemberDto,
  OrganizationDetailsDto,
  OrganizationInvitation,
  OrganizationMembersDto,
  OrganizationSummary,
  SuccessResponse,
} from './organization.dto';
import { Organization, OrganizationMembers } from './organization.entity';
import { UserService } from '../user/user.service';
import { Roles } from '../auth/auth.decorators';
import { UserOrganizationRole } from './organization.types';
import { User } from '../user/user.entity';
import type {
  AuthenticatedRequest,
  AuthenticatedRequestWithOrganization,
} from '../auth/auth.guard';
import { PaginatedResultsI, PaginationDto } from 'src/common/pagination';

const getUserIdFromOrganizationMember = (member: OrganizationMembers) =>
  member.userId;

@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly usersService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('')
  @ApiOperation({ summary: 'List all organizations' })
  @ApiResponse({ status: 200, type: [OrganizationSummary] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async fetchOrganizations(
    @Request() req: AuthenticatedRequest,
  ): Promise<OrganizationSummary[]> {
    console.log('req.user', req.user);
    return this.organizationService.findAll(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 200, type: Organization })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  createOrganization(
    @Body() createOrganizationData: CreateOrganizationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Organization> {
    return this.organizationService.create(createOrganizationData, req.user);
  }

  @Roles(UserOrganizationRole.ADMIN, UserOrganizationRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @Get(':organizationId')
  @ApiOperation({ summary: 'Get the details of an organization' })
  @ApiResponse({ status: 200, type: OrganizationDetailsDto })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async fetchOrganization(
    @Request() req: AuthenticatedRequestWithOrganization,
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
        ...userById[member.userId].toDto(),
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
    @Request() req: AuthenticatedRequestWithOrganization,
    @Body() inviteMemberData: InviteMemberDto,
  ): Promise<InviteMemberDto> {
    const organization = req.organization;
    const response = await this.organizationService.inviteMember(
      req.user,
      organization,
      inviteMemberData,
    );

    return response;
  }

  @Roles(UserOrganizationRole.OWNER, UserOrganizationRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get(':organizationId/members')
  @ApiOperation({ summary: 'List members of an organization' })
  @ApiResponse({ status: 200, type: SuccessResponse })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async listMembers(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResultsI<OrganizationMembersDto>> {
    const organization = req.organization;
    return await this.organizationService.findOrganizationMembers(
      organization,
      paginationDto,
    );
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
    @Request() req: AuthenticatedRequestWithOrganization,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResultsI<InviteMemberDto>> {
    return this.organizationService.getInvitedPeople(
      req.organization,
      paginationDto,
    );
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
    @Request() req: AuthenticatedRequest,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ): Promise<SuccessResponse> {
    const user = req.user;
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
