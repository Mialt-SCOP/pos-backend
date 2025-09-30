import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { AccountingGroupService } from './accounting-group.service';
import { Roles } from 'src/identity/auth/auth.decorators';
import { UserOrganizationRole } from 'src/identity/organization/organization.types';
import type { AuthenticatedRequestWithOrganization } from 'src/identity/auth/auth.guard';
import { PaginationDto } from 'src/common/pagination';
import { AccountingGroupCreatePayload } from './accounting-group.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Catalog')
@Controller('organization/:organizationId/accounting-group')
export class AccountingGroupController {
  constructor(private readonly service: AccountingGroupService) {}

  @Get()
  @Roles(UserOrganizationRole.SUPPLY_MANAGER, UserOrganizationRole.ACCOUTANT)
  async getAll(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.service.findAll(req.organization, paginationDto);
  }

  @Post()
  @Roles(UserOrganizationRole.SUPPLY_MANAGER)
  async create(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Body() payload: AccountingGroupCreatePayload,
  ) {
    return this.service.create(req.organization, payload);
  }
}
