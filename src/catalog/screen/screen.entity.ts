import { Organization } from 'src/identity/organization/organization.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  type Relation,
  Index,
  OneToMany,
} from 'typeorm';
import { ProductOnScreenDto, ScreenDto } from './screen.dto';
import { ProductReadModel } from '../product/product.read-model';
import { ProductDto } from '../product/product.dto';

@Entity()
export class Screen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index('screen_rank')
  @Column()
  rank: string;

  @Column({ type: 'varchar', nullable: true })
  color: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({
    name: 'organizationId',
    referencedColumnName: 'id',
  })
  organization: Relation<Organization>;

  @OneToMany(
    () => ProductOnScreen,
    (productOnScreen) => productOnScreen.screen,
    { eager: true },
  )
  productOnScreens: Relation<ProductOnScreen[]>;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;

  @BeforeInsert()
  beforeInsertActions() {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  beforeUpdateActions() {
    this.updatedAt = new Date();
  }

  toDto(): ScreenDto {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      active: true,
      children: [],
      products: this.productOnScreens.map((p) => p.toDto()),
    };
  }
}

@Entity()
export class ProductOnScreen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('product_on_screen_rank')
  @Column()
  rank: string;

  @Index('product_on_screen_active')
  @Column()
  active: boolean;

  @Column()
  productId: string;

  @ManyToOne(() => ProductReadModel, { eager: true })
  @JoinColumn({
    name: 'productId',
    referencedColumnName: 'id',
  })
  product: Relation<ProductReadModel>;
  private _productDto: ProductDto | null = null;

  setProductDto(productDto: ProductDto) {
    this._productDto = productDto;
  }

  @Column()
  screenId: string;

  @ManyToOne(() => Screen)
  @JoinColumn({
    name: 'screenId',
    referencedColumnName: 'id',
  })
  screen: Relation<Screen>;

  toDto(): ProductOnScreenDto {
    return {
      id: this.id,
      active: this.active,
      product: this._productDto ?? this.product.toDto(),
    };
  }
}
