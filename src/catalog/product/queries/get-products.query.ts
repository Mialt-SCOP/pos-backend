import { PaginationDto } from 'src/common/pagination';

export class GetProductsQuery {
  constructor(
    public readonly organizationId: string,
    public readonly pagination: PaginationDto,
  ) {}
}
