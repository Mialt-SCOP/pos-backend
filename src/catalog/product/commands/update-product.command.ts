import { Command } from '@nestjs/cqrs';
import { ProductUpdatePayload, ProductDto } from '../product.dto';

export class UpdateProductCommand extends Command<ProductDto> {
  constructor(
    public readonly productId: string,
    public readonly organizationId: string,
    public readonly payload: ProductUpdatePayload,
  ) {
    super();
  }
}
