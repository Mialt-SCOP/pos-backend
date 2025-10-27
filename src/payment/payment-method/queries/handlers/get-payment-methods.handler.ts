import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetPaymentMethodsQuery } from '../get-payment-methods.query';
import { PaymentMethodVersion } from '../../payment-method-version.entity';
import { PaymentMethodDto } from '../../dto/payment-method.dto';

const sortByRank = (a: PaymentMethodVersion, b: PaymentMethodVersion) => {
  if (a.rank > b.rank) return 1;
  if (a.rank < b.rank) return -1;
  return 0;
};

@QueryHandler(GetPaymentMethodsQuery)
export class GetPaymentMethodsHandler
  implements IQueryHandler<GetPaymentMethodsQuery>
{
  constructor(
    @InjectRepository(PaymentMethodVersion)
    private readonly repository: Repository<PaymentMethodVersion>,
  ) {}

  async execute({
    organizationId,
  }: GetPaymentMethodsQuery): Promise<PaymentMethodDto[]> {
    const paymentMethods = await this.repository.find({
      where: { organizationId, active: true },
    });
    return paymentMethods
      .sort(sortByRank)
      .map((paymentMethod) => paymentMethod.toDto());
  }
}
