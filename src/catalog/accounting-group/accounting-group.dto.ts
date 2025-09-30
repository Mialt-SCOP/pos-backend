import { ApiProperty } from '@nestjs/swagger';
import { Max, Min } from 'class-validator';

export class AccountingGroupCreatePayload {
  @ApiProperty({
    example: 'Taux intermédiaire',
    description: 'Name of the accounting group',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 20_000,
    description: `VAT rate expressed as an integer to avoid floating-point rounding issues.
        The value is the percentage multiplied by 100,000.
        For example:
          - 20% VAT → 20000
          - 5.5% VAT → 5500
          - 0% VAT → 0
        To retrieve the decimal value, divide by 100,000 (e.g. 20000 / 100000 = 0.20).`,
    required: true,
  })
  @Min(0)
  @Max(1_000_000)
  vatRate: number;
}

export class AccountingGroupDto extends AccountingGroupCreatePayload {
  @ApiProperty({
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Identifier of the accounting group',
    required: true,
  })
  id: string;

  @ApiProperty({
    example: '2023-07-16T21:49:12Z',
    description:
      'Datetime in iso format when the accounting group has been created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-07-16T21:49:12Z',
    description:
      'Datetime in iso format when the accounting group has been updated',
  })
  updatedAt: Date;
}
