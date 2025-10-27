import { ApiProperty } from '@nestjs/swagger';
import { CreatePaymentMethodPayloadV0 } from './create-payment-method.dto';

export class PaymentMethodDto extends CreatePaymentMethodPayloadV0 {
  @ApiProperty()
  id: string;

  @ApiProperty()
  versionId: string;

  @ApiProperty()
  enabled: boolean;
}
