import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethodType } from '../payment-method-type.enum';
import { CustomFieldType } from '../custom-field-type.enum';

export class CreatePaymentMethodPayloadV0 {
  @ApiProperty({ enum: PaymentMethodType, example: PaymentMethodType.CARD })
  readonly type: PaymentMethodType;

  @ApiProperty({ example: 'Carte bancaire' })
  readonly name: string;

  readonly customFields?: Array<{
    label: string;
    type: CustomFieldType;
    required?: boolean;
    helperText?: string;
  }>;
}
