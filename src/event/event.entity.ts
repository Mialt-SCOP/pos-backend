import { Organization } from 'src/identity/organization/organization.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  JoinColumn,
  type Relation,
} from 'typeorm';

@Entity('event')
export class EventEntity {
  @PrimaryColumn('uuid', { unique: true, default: () => 'uuidv7()' })
  internalEventId: string; // uuid v7

  @Column({ type: 'uuid', unique: true })
  id: string; // uuid v7

  @Column({ type: 'uuid', nullable: true })
  @Index()
  orderId: string | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  paymentId: string | null;

  @Column()
  type: string;

  @Column({ type: 'text' })
  data: string;

  @Column({ type: 'varchar', nullable: true })
  prevHash: string | null;

  @Column({ type: 'varchar' })
  hash: string;

  @Column({ type: 'text' })
  signature: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  @Index()
  deviceId: string;

  @Column()
  organizationId: string;

  @JoinColumn({
    name: 'organizationId',
    referencedColumnName: 'id',
  })
  organization: Relation<Organization>;
}
