import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentMethodEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

@Entity()
export class PaymentMethodEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  @Index()
  aggregateId: string; // actual PaymentMethod.id

  @Column({ type: 'enum', enum: PaymentMethodEventType })
  type: PaymentMethodEventType;

  @Column()
  version: number;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
