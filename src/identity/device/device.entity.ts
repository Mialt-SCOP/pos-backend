import {
  Column,
  Entity,
  Index,
  JoinColumn,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Organization } from '../organization/organization.entity';
import { DeviceDto } from './device.dto';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  deviceId: string;

  @Column({ type: 'text' })
  publicKeyBase64: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  meta: Record<string, string> | null;

  @Column()
  organizationId: string;

  @JoinColumn({
    name: 'organizationId',
    referencedColumnName: 'id',
  })
  organization: Relation<Organization>;

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  createdAt: Date;

  toDto(): DeviceDto {
    return {
      id: this.id,
    };
  }
}
