import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsQuery } from '../get-products.query';
import { Repository } from 'typeorm';
import { ProductReadModel } from '../../product.read-model';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResultsI } from 'src/common/pagination';
import { ProductDto } from '../../product.dto';

@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
  constructor(
    @InjectRepository(ProductReadModel)
    private readonly repository: Repository<ProductReadModel>,
  ) {}

  async execute({
    organizationId,
    pagination,
  }: GetProductsQuery): Promise<PaginatedResultsI<ProductDto>> {
    let selectQuery = this.repository.manager
      .createQueryBuilder(ProductReadModel, 'p')
      .select()
      .leftJoinAndSelect('p.accountingGroup', 'a')
      .where(`p."organizationId" = :organizationId`, { organizationId });

    if (pagination.accountingGroupId) {
      selectQuery = selectQuery.andWhere(
        `p."accountingGroupId" = :accountingGroupId`,
        { accountingGroupId: pagination.accountingGroupId },
      );
    }

    if (pagination.query) {
      selectQuery = selectQuery
        .andWhere(
          `p.document_with_weights @@ (websearch_to_tsquery('simple', :query)::text || ':*')::tsquery`,
          { query: pagination.query },
        )
        .orderBy(
          `ts_rank("document_with_weights", (websearch_to_tsquery('simple', :query)::text || ':*')::tsquery)`,
          'DESC',
        );
    }

    const [items, results] = await selectQuery
      .addOrderBy('p.createdAt', 'DESC')
      .offset(pagination.offset)
      .limit(pagination.limit)
      .getManyAndCount();

    return {
      items: items.map((item) => item.toDto()),
      results,
    };
  }
}
