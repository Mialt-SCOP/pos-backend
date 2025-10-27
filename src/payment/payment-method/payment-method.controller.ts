import {
  Body,
  Controller,
  Request,
  Post,
  UseInterceptors,
  Get,
  ParseUUIDPipe,
  Param,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/identity/auth/auth.decorators';
import type { AuthenticatedRequestWithOrganization } from 'src/common/Request';
import { UserOrganizationRole } from 'src/identity/organization/organization.types';

import { CreatePaymentMethodPayloadV0 } from './dto/create-payment-method.dto';
import { CreatePaymentMethodCommand } from './commands/create-payment-method.command';
import { IdempotencyInterceptor } from 'src/common/idempotency/idempotency.interceptor';
import { PaymentMethodDto } from './dto/payment-method.dto';
import { GetPaymentMethodsQuery } from './queries/get-payment-methods.query';
import { GetPaymentMethodQuery } from './queries/get-payment-method.query';
import { UpdatePaymentMethodPayloadV0 } from './dto/update-payment-method.dto';
import { UpdatePaymentMethodCommand } from './commands/update-payment-method.command';

@ApiTags('Payment Method')
@Controller('organization/:organizationId/payment-method')
export class PaymentMethodController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserOrganizationRole.ADMIN)
  @UseInterceptors(IdempotencyInterceptor)
  async createPaymentMethod(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Body() payload: CreatePaymentMethodPayloadV0,
  ) {
    return this.commandBus.execute(
      new CreatePaymentMethodCommand(payload, req.organization.id),
    );
  }

  @Get()
  @Roles(UserOrganizationRole.POINT_OF_SALE)
  async findAll(
    @Request() req: AuthenticatedRequestWithOrganization,
  ): Promise<PaymentMethodDto[]> {
    return this.queryBus.execute(
      new GetPaymentMethodsQuery(req.organization.id),
    );
  }

  @Get(`:paymentMethodId`)
  @Roles(UserOrganizationRole.POINT_OF_SALE)
  async findOne(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Param('paymentMethodId', ParseUUIDPipe) paymentMethodId: string,
  ): Promise<PaymentMethodDto[]> {
    return this.queryBus.execute(
      new GetPaymentMethodQuery(req.organization.id, paymentMethodId),
    );
  }

  @Patch(`:paymentMethodId`)
  @Roles(UserOrganizationRole.ADMIN)
  @UseInterceptors(IdempotencyInterceptor)
  async update(
    @Request() req: AuthenticatedRequestWithOrganization,
    @Param('paymentMethodId', ParseUUIDPipe) paymentMethodId: string,
    @Body() payload: UpdatePaymentMethodPayloadV0,
  ): Promise<PaymentMethodDto> {
    return this.commandBus.execute(
      new UpdatePaymentMethodCommand(
        payload,
        req.organization.id,
        paymentMethodId,
      ),
    );
  }
}
