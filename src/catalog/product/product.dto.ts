import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountingGroupDto } from '../accounting-group/accounting-group.dto';

class ProductCommonFields {
  @ApiProperty({
    example: 'Espresso',
    description: 'Name of the product',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Espresso',
    description: 'Short name of the product',
    nullable: true,
  })
  shortName?: string | null;

  @ApiProperty({
    example: 200_000,
    nullable: true,
    description: `Amount expressed as an integer to avoid floating-point rounding issues.
        The value is the amount multiplied by 100,000.
        For example:
          - 20 € → 2 000 000
          - 0,10 € → 10 000
          - 0 € → 0
        To retrieve the decimal value, divide by 100,000 (e.g. 2000000 / 100000 = 20).`,
  })
  purchasePrice: number;

  @ApiProperty({
    example: 1_000_000,
    nullable: true,
    description: `Amount expressed as an integer to avoid floating-point rounding issues.
        The value is the amount multiplied by 100,000.
        For example:
          - 20 € → 2 000 000
          - 0,10 € → 10 000
          - 0 € → 0
        To retrieve the decimal value, divide by 100,000 (e.g. 2000000 / 100000 = 20).`,
  })
  sellPrice: number;

  @ApiProperty({
    example: true,
    description: `True if the price can be chosen by the customer or the cashier`,
  })
  openPricing: boolean;
}

export class ProductCreatePayload extends ProductCommonFields {
  @ApiProperty({
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Id of the accounting group',
  })
  accountingGroupId: string;
}

export class ProductUpdatePayload {
  @ApiPropertyOptional({
    example: 'Espresso',
    description: 'Name of the product',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'Espresso',
    description: 'Short name of the product',
    nullable: true,
  })
  shortName?: string | null;

  @ApiPropertyOptional({
    example: 200_000,
    nullable: true,
    description: `Amount expressed as an integer to avoid floating-point rounding issues.
        The value is the amount multiplied by 100,000.
        For example:
          - 20 € → 2 000 000
          - 0,10 € → 10 000
          - 0 € → 0
        To retrieve the decimal value, divide by 100,000 (e.g. 2000000 / 100000 = 20).`,
  })
  purchasePrice?: number;

  @ApiPropertyOptional({
    example: 1_000_000,
    nullable: true,
    description: `Amount expressed as an integer to avoid floating-point rounding issues.
        The value is the amount multiplied by 100,000.
        For example:
          - 20 € → 2 000 000
          - 0,10 € → 10 000
          - 0 € → 0
        To retrieve the decimal value, divide by 100,000 (e.g. 2000000 / 100000 = 20).`,
  })
  sellPrice?: number;

  @ApiPropertyOptional({
    example: true,
    description: `True if the price can be chosen by the customer or the cashier`,
  })
  openPricing?: boolean;

  @ApiPropertyOptional({
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Id of the accounting group',
  })
  accountingGroupId?: string;
}

export class ProductDto extends ProductCommonFields {
  @ApiProperty({
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Identifier of the product',
  })
  id: string;

  @ApiProperty({ type: AccountingGroupDto })
  accountingGroup: AccountingGroupDto;
}
