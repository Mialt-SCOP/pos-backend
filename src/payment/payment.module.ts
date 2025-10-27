import { Module } from '@nestjs/common';
import { PaymentMethodModule } from './payment-method/payment-method.module';

@Module({
  imports: [PaymentMethodModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class PaymentModule {}
