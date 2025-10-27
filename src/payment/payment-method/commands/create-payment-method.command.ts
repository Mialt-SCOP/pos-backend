import { Command } from '@nestjs/cqrs';
import { CreatePaymentMethodPayloadV0 } from '../dto/create-payment-method.dto';
import { PaymentMethodDto } from '../dto/payment-method.dto';

export class CreatePaymentMethodCommand extends Command<PaymentMethodDto> {
  constructor(
    public readonly payload: CreatePaymentMethodPayloadV0,
    public readonly organizationId: string,
  ) {
    super();
  }
}
