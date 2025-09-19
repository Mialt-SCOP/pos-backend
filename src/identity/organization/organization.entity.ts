import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { UserOrganizationRole } from './organization.types';
import { User } from '../user/user.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;

  @OneToMany(() => OrganizationMembers, (members) => members.organization)
  @JoinColumn({
    referencedColumnName: 'organizationId',
  })
  members: Relation<OrganizationMembers[]>;

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
}

@Entity()
export class OrganizationMembers {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public organizationId: string;

  @Column()
  public userId: string;

  @Column({
    type: 'enum',
    enum: UserOrganizationRole,
    default: UserOrganizationRole.NONE,
  })
  public role: UserOrganizationRole;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
  })
  public user: Relation<User>;

  @ManyToOne(() => Organization, (organization) => organization.members, {
    eager: true,
  })
  @JoinColumn({
    name: 'organizationId',
    referencedColumnName: 'id',
  })
  public organization: Relation<Organization>;
}

@Entity()
export class OrganizationMemberInvitation {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({
    name: 'organizationId',
    referencedColumnName: 'id',
  })
  public organization: Organization;

  @Column({
    type: 'enum',
    enum: UserOrganizationRole,
    default: UserOrganizationRole.NONE,
  })
  public role: UserOrganizationRole;

  @Index()
  @Column()
  public email: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;

  @Index()
  @Column({ default: false })
  used: boolean;

  @Column('timestamp', { nullable: true })
  usedAt: Date;

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
}
