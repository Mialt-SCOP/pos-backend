import { Body, Controller, Put, Request } from '@nestjs/common';
import { DeviceService } from './device.service';
import { Roles } from '../auth/auth.decorators';
import { UserOrganizationRole } from '../organization/organization.types';
import { DeviceDto, RegisterDevicePayload } from './device.dto';
import type { AuthenticatedRequestWithOrganization } from 'src/common/Request';

@Controller('organization/:organizationId/device')
export class DeviceController {
  constructor(private readonly service: DeviceService) {}

  @Put()
  @Roles(UserOrganizationRole.POINT_OF_SALE)
  async create(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Body() payload: RegisterDevicePayload,
  ): Promise<DeviceDto> {
    return this.service.create(payload, req.organization);
  }
}
