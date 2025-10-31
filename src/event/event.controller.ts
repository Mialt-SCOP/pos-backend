import {
  Body,
  Controller,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { EventService } from './event.service';
import { IdempotencyInterceptor } from 'src/common/idempotency/idempotency.interceptor';
import { SyncEventsDto } from './event.dto';
import type { AuthenticatedRequestWithOrganization } from 'src/common/Request';
import { Roles } from 'src/identity/auth/auth.decorators';
import { UserOrganizationRole } from 'src/identity/organization/organization.types';

@Controller('organization/:organizationId/event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('sync')
  @UseInterceptors(IdempotencyInterceptor)
  @Roles(UserOrganizationRole.POINT_OF_SALE)
  async sync(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Body() body: SyncEventsDto,
  ) {
    return this.eventService.sync(body, req.organization);
  }
}
