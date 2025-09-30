import { Command } from '@nestjs/cqrs';
import { ProductCreatePayload, ProductDto } from '../product.dto';

export class CreateProductCommand extends Command<ProductDto> {
  constructor(
    public readonly payload: ProductCreatePayload,
    public readonly organizationId: string,
  ) {
    super();
  }
}
