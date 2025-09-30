import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductDto } from '../product/product.dto';

export class ScreenCreatePayload {
  @ApiProperty({
    example: 'Taux intermédiaire',
    description: 'Name of the screen',
    required: true,
  })
  name: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Screen id of the parent screen',
  })
  parentId?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '#00AAFF',
    description: 'Color of the screen button',
  })
  color?: string | null;
}

export class ScreenUpdatePayload {
  @ApiPropertyOptional({
    example: 'Taux intermédiaire',
    description: 'Name of the screen',
    required: true,
  })
  name?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Screen id of the parent screen',
  })
  parentId?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '#00AAFF',
    description: 'Color of the screen button',
  })
  color?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Id of the screen to set after',
  })
  setAfter?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Id of the screen to set before',
  })
  setBefore?: string | null;
}

export class ProductOnScreenDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ type: ProductDto })
  product: ProductDto;
}

export class ScreenDto extends ScreenCreatePayload {
  @ApiProperty({
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Identifier of the screen',
    required: true,
  })
  id: string;

  @ApiProperty({
    example: '2023-07-16T21:49:12Z',
    description: 'Datetime in iso format when the screen has been created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-07-16T21:49:12Z',
    description: 'Datetime in iso format when the screen has been updated',
  })
  updatedAt: Date;

  @ApiProperty({
    example: true,
    description: 'Weither the screen is active or not',
  })
  active: boolean;

  @ApiProperty({
    type: ScreenDto,
    isArray: true,
    description: 'Children of the screen',
  })
  children: ScreenDto[];

  @ApiProperty({
    type: ProductOnScreenDto,
    isArray: true,
  })
  products: ProductOnScreenDto[];
}

export class AddProductToScreenPayload {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  active: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Id of the screen to set after',
  })
  setAfter?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '81dc1b63-b7ce-433d-a32f-8b9ebf90aa70',
    description: 'Id of the screen to set before',
  })
  setBefore?: string | null;
}
