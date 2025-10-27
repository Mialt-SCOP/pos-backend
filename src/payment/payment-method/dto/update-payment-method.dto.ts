import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '../payment-method-type.enum';
import { CustomFieldType } from '../custom-field-type.enum';

export class UpdatePaymentMethodPayloadV0 {
  @ApiPropertyOptional({
    enum: PaymentMethodType,
    example: PaymentMethodType.CARD,
  })
  readonly type?: PaymentMethodType;

  @ApiPropertyOptional({ example: 'Carte bancaire' })
  readonly name?: string;

  @ApiPropertyOptional({
    example: [
      {
        label: 'payment ID',
        type: CustomFieldType.STRING,
        required: true,
        helperText: 'Identifier of the payment',
      },
    ],
  })
  readonly customFields?: Array<{
    label: string;
    type: CustomFieldType;
    required?: boolean;
    helperText?: string;
  }>;

  @ApiPropertyOptional()
  readonly enabled?: boolean;

  @ApiPropertyOptional()
  readonly setBefore?: string;

  @ApiPropertyOptional()
  readonly setAfter?: string;
}
