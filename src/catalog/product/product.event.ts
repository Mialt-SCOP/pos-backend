import { Organization } from 'src/identity/organization/organization.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  type Relation,
  Index,
} from 'typeorm';

export enum ProductEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

@Entity()
export class ProductEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: ProductEventType;

  @Column()
  @Index()
  productId: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({
    name: 'organizationId',
    referencedColumnName: 'id',
  })
  organization: Relation<Organization>;

  @Column({ type: 'jsonb' })
  payload: string;

  @Column('timestamp')
  @Index()
  createdAt: Date;

  @BeforeInsert()
  beforeInsertActions() {
    const now = new Date();
    this.createdAt = now;
  }
}
