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
} from 'typeorm';
import { AccountingGroupDto } from './accounting-group.dto';

@Entity()
export class AccountingGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'integer' })
  vatRate: number;

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

  toDto(): AccountingGroupDto {
    return {
      id: this.id,
      name: this.name,
      vatRate: this.vatRate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
