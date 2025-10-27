export class GetPaymentMethodQuery {
  constructor(
    public readonly organizationId: string,
    public readonly paymentMethodId: string,
  ) {}
}
