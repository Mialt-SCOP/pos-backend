import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { ProductReadModel } from '../../product.read-model';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductDto } from '../../product.dto';
import { GetProductByIdQuery } from '../get-product-by-id.query';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler
  implements IQueryHandler<GetProductByIdQuery>
{
  constructor(
    @InjectRepository(ProductReadModel)
    private readonly repository: Repository<ProductReadModel>,
  ) {}

  async execute(query: GetProductByIdQuery): Promise<ProductDto> {
    const product = await this.repository.findOneBy({
      id: query.productId,
      organizationId: query.organizationId,
    });
    if (!product) throw new NotFoundException();
    return product.toDto();
  }
}
