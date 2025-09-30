import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from '../create-product.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEvent, ProductEventType } from '../../product.event';
import { ProductReadModel } from '../../product.read-model';
import { Product } from '../../models/product.model';
import { AccountingGroup } from 'src/catalog/accounting-group/accounting-group.entity';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    @InjectRepository(ProductEvent)
    private readonly eventRepository: Repository<ProductEvent>,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateProductCommand) {
    const { payload, organizationId } = command;

    const { savedProduct, savedEvent } =
      await this.eventRepository.manager.transaction(async (manager) => {
        const accountingGroup = await manager.findOne(AccountingGroup, {
          where: { id: payload.accountingGroupId },
        });
        if (!accountingGroup)
          throw new BadRequestException('Accounting group not found');
        const product = new ProductReadModel();
        product.name = payload.name;
        product.accountingGroupId = payload.accountingGroupId;
        product.accountingGroup = accountingGroup;
        if (payload.shortName) {
          product.shortName = payload.shortName;
        }
        product.openPricing = payload.openPricing;
        product.organizationId = organizationId;
        product.purchasePrice = payload.purchasePrice;
        product.sellPrice = payload.sellPrice;

        const savedProduct = await manager.save(product);

        const event = new ProductEvent();
        event.organizationId = organizationId;
        event.type = ProductEventType.CREATED;
        event.productId = savedProduct.id;
        event.payload = JSON.stringify(payload);
        const savedEvent = await manager.save(event);

        return { savedProduct, savedEvent };
      });

    const ProductModel = this.publisher.mergeClassContext(Product);
    const product = new ProductModel(savedProduct.id);
    product.create(savedEvent);

    return savedProduct;
  }
}
