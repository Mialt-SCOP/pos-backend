import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodEvent } from './payment-method-event.entity';
import { PaymentMethodVersion } from './payment-method-version.entity';
import { CreatePaymentMethodHandler } from './commands/handlers/create-payment-method.handler';
import { IdempotencyModule } from 'src/common/idempotency/idempotency.module';
import { PaymentMethodController } from './payment-method.controller';
import { GetPaymentMethodsHandler } from './queries/handlers/get-payment-methods.handler';
import { GetPaymentMethodHandler } from './queries/handlers/get-payment-method.handler';
import { UpdatePaymentMethodHandler } from './commands/handlers/update-payment-method.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([PaymentMethodEvent, PaymentMethodVersion]),
    IdempotencyModule,
  ],
  controllers: [PaymentMethodController],
  providers: [
    CreatePaymentMethodHandler,
    GetPaymentMethodsHandler,
    GetPaymentMethodHandler,
    UpdatePaymentMethodHandler,
  ],
  exports: [],
})
export class PaymentMethodModule {}
