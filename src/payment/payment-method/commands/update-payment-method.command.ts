import { Command } from '@nestjs/cqrs';
import { UpdatePaymentMethodPayloadV0 } from '../dto/update-payment-method.dto';
import { PaymentMethodDto } from '../dto/payment-method.dto';

export class UpdatePaymentMethodCommand extends Command<PaymentMethodDto> {
  constructor(
    public readonly payload: UpdatePaymentMethodPayloadV0,
    public readonly organizationId: string,
    public readonly paymentMethodId: string,
  ) {
    super();
  }
}
