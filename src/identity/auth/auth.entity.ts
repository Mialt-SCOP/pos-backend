import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { User } from '../user/user.entity';

const TEMPORARY_PIN_EXPIRATION_TIME = 5 * 60 * 1000;

@Entity()
export class PasswordLessTemporaryPin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column()
  pin: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  usedAt: Date;

  @BeforeInsert()
  beforeInsertActions() {
    const now = new Date();
    this.createdAt = now;
  }

  isExpired(): boolean {
    return (
      !!this.usedAt ||
      this.createdAt.getTime() + TEMPORARY_PIN_EXPIRATION_TIME <
        new Date().getTime()
    );
  }
}
