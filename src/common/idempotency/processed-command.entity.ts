import { Column, Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';
import type { CommandId, CorrelationId } from 'src/common/Request';

export enum ProcessedCommandStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

@Entity()
export class ProcessedCommand {
  @PrimaryColumn({ type: 'varchar' })
  commandId: CommandId;

  @Column({ type: 'varchar', nullable: true })
  correlationId: CorrelationId | null;

  @Column({ type: 'varchar', nullable: true })
  responseData: string | null;

  @Column({ type: 'varchar', nullable: true })
  responseError: string | null;

  @Column({ type: 'int', nullable: true })
  responseStatus: number | null;

  @Column({
    type: 'enum',
    enum: ProcessedCommandStatus,
    default: ProcessedCommandStatus.PENDING,
  })
  status: ProcessedCommandStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt?: Date;
}
