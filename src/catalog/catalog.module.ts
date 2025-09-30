import { Module } from '@nestjs/common';
import { AccountingGroupModule } from './accounting-group/accounting-group.module';
import { ProductModule } from './product/product.module';
import { ScreenModule } from './screen/screen.module';

@Module({
  imports: [AccountingGroupModule, ProductModule, ScreenModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class CatalogModule {}
