import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CollectionRequest } from './CollectionRequest';
import { User } from './User';

@Entity('request_status_history')
export class RequestStatusHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'request_id', type: 'bigint' })
  requestId: number;

  @Column({ name: 'old_status', type: 'varchar', length: 30, nullable: true })
  oldStatus: string | null;

  @Column({ name: 'new_status', type: 'varchar', length: 30, nullable: false })
  newStatus: string;

  @Column({ name: 'changed_by', type: 'bigint', nullable: true })
  changedBy: number | null;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamp' })
  changedAt: Date;

  @ManyToOne(() => CollectionRequest)
  @JoinColumn({ name: 'request_id' })
  request: CollectionRequest;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  user: User;
}