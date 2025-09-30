import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetProductsHandler } from './queries/handlers/get-products.handler';
import { CreateProductHandler } from './commands/handlers/create-product.handler';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEvent } from './product.event';
import { ProductReadModel } from './product.read-model';
import { GetProductByIdHandler } from './queries/handlers/get-product-by-id.handler';
import { UpdateProductHandler } from './commands/handlers/update-product.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ProductEvent, ProductReadModel]),
  ],
  controllers: [ProductController],
  providers: [
    CreateProductHandler,
    UpdateProductHandler,
    GetProductsHandler,
    GetProductByIdHandler,
  ],
  exports: [GetProductByIdHandler],
})
export class ProductModule {}
