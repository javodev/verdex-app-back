import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CollectionRequest } from './CollectionRequest';
import { User } from './User';

@Entity('request_assignments')
export class RequestAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'collector_id' })
  collectorId: number;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @ManyToOne(() => CollectionRequest)
  @JoinColumn({ name: 'request_id' })
  request: CollectionRequest;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'collector_id' })
  collector: User;
}