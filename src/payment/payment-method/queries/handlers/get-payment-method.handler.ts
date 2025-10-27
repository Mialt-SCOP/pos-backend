import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethodVersion } from '../../payment-method-version.entity';
import { PaymentMethodDto } from '../../dto/payment-method.dto';
import { GetPaymentMethodQuery } from '../get-payment-method.query';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetPaymentMethodQuery)
export class GetPaymentMethodHandler
  implements IQueryHandler<GetPaymentMethodQuery>
{
  constructor(
    @InjectRepository(PaymentMethodVersion)
    private readonly repository: Repository<PaymentMethodVersion>,
  ) {}

  async execute({
    organizationId,
    paymentMethodId,
  }: GetPaymentMethodQuery): Promise<PaymentMethodDto> {
    const paymentMethod = await this.repository.findOne({
      where: { organizationId, paymentMethodId, active: true },
    });
    if (!paymentMethod) {
      throw new NotFoundException();
    }
    return paymentMethod.toDto();
  }
}
