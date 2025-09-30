export class GetProductByIdQuery {
  constructor(
    public readonly organizationId: string,
    public readonly productId: string,
  ) {}
}
