import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { Roles } from 'src/identity/auth/auth.decorators';
import { UserOrganizationRole } from 'src/identity/organization/organization.types';
import type { AuthenticatedRequestWithOrganization } from 'src/identity/auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ScreenService } from './screen.service';
import {
  AddProductToScreenPayload,
  ScreenCreatePayload,
  ScreenUpdatePayload,
} from './screen.dto';

@ApiTags('Catalog')
@Controller('organization/:organizationId/screen')
export class ScreenController {
  constructor(private readonly service: ScreenService) {}

  @Get()
  @Roles(
    UserOrganizationRole.SUPPLY_MANAGER,
    UserOrganizationRole.POINT_OF_SALE,
  )
  async getAll(@Request() req: AuthenticatedRequestWithOrganization) {
    return this.service.findAll(req.organization);
  }

  @Post()
  @Roles(UserOrganizationRole.SUPPLY_MANAGER)
  async create(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Body() payload: ScreenCreatePayload,
  ) {
    return this.service.create(req.organization, payload);
  }

  @Get(':screenId')
  @Roles(UserOrganizationRole.SUPPLY_MANAGER)
  async getOne(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Param('screenId', ParseUUIDPipe) screenId: string,
  ) {
    return this.service.getOneById(req.organization, screenId);
  }

  @Put(':screenId')
  @Roles(UserOrganizationRole.SUPPLY_MANAGER)
  async update(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Param('screenId', ParseUUIDPipe) screenId: string,
    @Body() payload: ScreenUpdatePayload,
  ) {
    return this.service.update(req.organization, screenId, payload);
  }

  @Post(':screenId/product')
  @Roles(UserOrganizationRole.SUPPLY_MANAGER)
  async addProductOnScreen(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Param('screenId', ParseUUIDPipe) screenId: string,
    @Body() payload: AddProductToScreenPayload,
  ) {
    return this.service.addProductOnScreen(req.organization, screenId, payload);
  }
}
