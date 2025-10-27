import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaymentMethodEvent,
  PaymentMethodEventType,
} from '../../payment-method-event.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { PaymentMethodVersion } from '../../payment-method-version.entity';
import { UpdatePaymentMethodCommand } from '../update-payment-method.command';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  getRankAfter,
  getRankBefore,
  getRankBetween,
} from 'src/common/stringRank';

@CommandHandler(UpdatePaymentMethodCommand)
export class UpdatePaymentMethodHandler
  implements ICommandHandler<UpdatePaymentMethodCommand>
{
  constructor(
    @InjectRepository(PaymentMethodVersion)
    private readonly versionRepository: Repository<PaymentMethodVersion>,
  ) {}

  async execute(command: UpdatePaymentMethodCommand) {
    const { payload, organizationId, paymentMethodId } = command;
    const { version } = await this.versionRepository.manager.transaction(
      async (manager) => {
        const currentVersion = await manager.findOne(PaymentMethodVersion, {
          where: { paymentMethodId, organizationId, active: true },
        });
        if (!currentVersion) {
          throw new NotFoundException('Payment method not found');
        }
        const event = new PaymentMethodEvent();
        event.aggregateId = paymentMethodId;
        event.organizationId = organizationId;
        event.version = 0;
        event.payload = { ...payload };
        event.type = PaymentMethodEventType.UPDATED;
        const savedEvent = await manager.save(event);

        const version = new PaymentMethodVersion();
        version.paymentMethodId = paymentMethodId;
        version.organizationId = organizationId;
        version.name = payload.name ?? currentVersion.name;
        version.type = payload.type ?? currentVersion.type;
        version.enabled = currentVersion.enabled;
        version.rank = currentVersion.rank;
        if (typeof payload.enabled === 'boolean') {
          version.enabled = payload.enabled;
        }
        if (payload.setAfter) {
          const beforePaymentMethod = await manager.findOne(
            PaymentMethodVersion,
            {
              where: {
                paymentMethodId: payload.setAfter,
                organizationId,
                active: true,
              },
            },
          );
          if (!beforePaymentMethod)
            throw new BadRequestException(`After payment method not found`);

          const afterPaymentMethod = await manager.findOne(
            PaymentMethodVersion,
            {
              where: {
                organizationId,
                active: true,
                rank: MoreThan(beforePaymentMethod.rank),
              },
              order: { rank: 'ASC' },
            },
          );
          if (afterPaymentMethod) {
            version.rank = getRankBetween(
              beforePaymentMethod.rank,
              afterPaymentMethod.rank,
            );
          } else {
            version.rank = getRankAfter(beforePaymentMethod.rank);
          }
        } else if (payload.setBefore) {
          const afterPaymentMethod = await manager.findOne(
            PaymentMethodVersion,
            {
              where: {
                paymentMethodId: payload.setBefore,
                organizationId,
                active: true,
              },
            },
          );
          if (!afterPaymentMethod)
            throw new BadRequestException(`Before payment method not found`);

          const beforePaymentMethod = await manager.findOne(
            PaymentMethodVersion,
            {
              where: {
                organizationId,
                active: true,
                rank: LessThan(afterPaymentMethod.rank),
              },
              order: { rank: 'DESC' },
            },
          );
          if (beforePaymentMethod) {
            version.rank = getRankBetween(
              beforePaymentMethod.rank,
              afterPaymentMethod.rank,
            );
          } else {
            version.rank = getRankBefore(afterPaymentMethod.rank);
          }
        }
        version.customFields = payload.customFields
          ? payload.customFields.map((field) => ({
              label: field.label,
              type: field.type,
              helperText: field.helperText,
              required: field.required === true,
            }))
          : currentVersion.customFields;
        version.version = currentVersion.version + 1;

        await manager.update(
          PaymentMethodVersion,
          { id: currentVersion.id },
          { active: false },
        );
        const savedVersion = await manager.save(version);
        return { event: savedEvent, version: savedVersion };
      },
    );
    return version.toDto();
  }
}
