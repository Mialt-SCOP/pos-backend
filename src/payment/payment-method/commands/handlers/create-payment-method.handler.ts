import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePaymentMethodCommand } from '../create-payment-method.command';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaymentMethodEvent,
  PaymentMethodEventType,
} from '../../payment-method-event.entity';
import { Repository } from 'typeorm';
import { PaymentMethodVersion } from '../../payment-method-version.entity';
import { v7 } from 'uuid';
import { getDefaultRank, getRankAfter } from 'src/common/stringRank';

@CommandHandler(CreatePaymentMethodCommand)
export class CreatePaymentMethodHandler
  implements ICommandHandler<CreatePaymentMethodCommand>
{
  constructor(
    @InjectRepository(PaymentMethodVersion)
    private readonly versionRepository: Repository<PaymentMethodVersion>,
  ) {}

  async execute(command: CreatePaymentMethodCommand) {
    const { payload, organizationId } = command;
    const { version } = await this.versionRepository.manager.transaction(
      async (manager) => {
        const lastPaymentMethod = await manager.findOne(PaymentMethodVersion, {
          where: { organizationId, active: true },
          order: { rank: 'DESC' },
        });
        const version = new PaymentMethodVersion();
        version.paymentMethodId = v7();
        version.organizationId = organizationId;
        version.name = payload.name;
        version.type = payload.type;
        version.rank = lastPaymentMethod
          ? getRankAfter(lastPaymentMethod.rank)
          : getDefaultRank();
        if (payload.customFields) {
          version.customFields = payload.customFields.map((field) => ({
            label: field.label,
            type: field.type,
            helperText: field.helperText,
            required: field.required === true,
          }));
        }
        version.version = 0;

        const event = new PaymentMethodEvent();
        event.aggregateId = version.paymentMethodId;
        event.organizationId = organizationId;
        event.version = 0;
        event.payload = { ...payload };
        event.type = PaymentMethodEventType.CREATED;
        const savedVersion = await manager.save(version);
        const savedEvent = await manager.save(event);
        return { event: savedEvent, version: savedVersion };
      },
    );
    return version.toDto();
  }
}
