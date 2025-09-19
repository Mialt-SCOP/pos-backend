import { User } from 'src/identity/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';

@Entity()
export class ResetPassword {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  usedAt: Date;

  @BeforeInsert()
  beforeInsertActions() {
    const now = new Date();
    this.createdAt = now;
  }
}
