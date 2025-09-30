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
} from 'typeorm';
import { AccountingGroup } from '../accounting-group/accounting-group.entity';
import { ProductDto } from './product.dto';

@Entity()
export class ProductReadModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  shortName: string | null;

  @Column({ type: 'integer' })
  purchasePrice: number;

  @Column({ type: 'integer' })
  sellPrice: number;

  @Column({ type: 'boolean', default: false })
  openPricing: boolean;

  @Column()
  accountingGroupId: string;

  @ManyToOne(() => AccountingGroup, { eager: true })
  @JoinColumn({
    name: 'accountingGroupId',
    referencedColumnName: 'id',
  })
  accountingGroup: Relation<AccountingGroup>;

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

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;

  @Index('product_read_model_document_weights_idx')
  @Column('tsvector', { select: false })
  document_with_weights: unknown;

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

  toDto(): ProductDto {
    return {
      id: this.id,
      name: this.name,
      shortName: this.shortName,
      purchasePrice: this.purchasePrice,
      sellPrice: this.sellPrice,
      openPricing: this.openPricing,
      accountingGroup: this.accountingGroup.toDto(),
    };
  }
}
