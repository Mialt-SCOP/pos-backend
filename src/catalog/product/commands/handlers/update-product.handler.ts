import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEvent, ProductEventType } from '../../product.event';
import { ProductReadModel } from '../../product.read-model';
import { Product } from '../../models/product.model';
import { UpdateProductCommand } from '../update-product.command';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand>
{
  constructor(
    @InjectRepository(ProductEvent)
    private readonly eventRepository: Repository<ProductEvent>,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateProductCommand) {
    const { payload, organizationId, productId } = command;

    const { savedProduct, savedEvent } =
      await this.eventRepository.manager.transaction(async (manager) => {
        const product = await manager.findOneBy(ProductReadModel, {
          id: productId,
        });
        if (!product) throw new NotFoundException();

        if (payload.name) {
          product.name = payload.name;
        }
        if (typeof payload.accountingGroupId !== 'undefined') {
          product.accountingGroupId = payload.accountingGroupId;
        }
        if (typeof payload.shortName !== 'undefined') {
          product.shortName = payload.shortName;
        }
        if (typeof payload.openPricing === 'boolean') {
          product.openPricing = payload.openPricing;
        }
        if (typeof payload.purchasePrice !== 'undefined') {
          product.purchasePrice = payload.purchasePrice;
        }
        if (typeof payload.sellPrice !== 'undefined') {
          product.sellPrice = payload.sellPrice;
        }

        const savedProduct = await manager.save(product);

        const event = new ProductEvent();
        event.organizationId = organizationId;
        event.type = ProductEventType.UPDATED;
        event.productId = savedProduct.id;
        event.payload = JSON.stringify(payload);
        const savedEvent = await manager.save(event);

        return { savedProduct, savedEvent };
      });

    const ProductModel = this.publisher.mergeClassContext(Product);
    const product = new ProductModel(savedProduct.id);
    product.update(savedEvent);

    return savedProduct;
  }
}
