import { AggregateRoot } from '@nestjs/cqrs';
import { ProductEvent } from '../product.event';

export class Product extends AggregateRoot {
  constructor(private readonly id: string) {
    super();
    this.autoCommit = true;
  }

  create(event: ProductEvent) {
    this.apply(event);
  }

  update(event: ProductEvent) {
    this.apply(event);
  }
}
