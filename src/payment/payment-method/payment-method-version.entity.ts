import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { PaymentMethodType } from './payment-method-type.enum';
import { CustomFieldType } from './custom-field-type.enum';
import { PaymentMethodDto } from './dto/payment-method.dto';

@Entity()
@Unique('payment_method_version_unique', ['paymentMethodId', 'version'])
export class PaymentMethodVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  @Index()
  paymentMethodId: string;

  @Column({ type: 'int' })
  @Index()
  version: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  type: PaymentMethodType;

  @Index('payment_method_rank')
  @Column()
  rank: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Array<{
    label: string;
    required: boolean;
    helperText?: string;
    type: CustomFieldType;
  }>;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'boolean', default: true })
  @Index()
  enabled: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  toDto(): PaymentMethodDto {
    return {
      id: this.paymentMethodId,
      versionId: this.id,
      name: this.name,
      type: this.type,
      customFields: this.customFields,
      enabled: this.enabled,
    };
  }
}
