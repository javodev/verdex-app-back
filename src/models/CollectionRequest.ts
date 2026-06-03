import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Address } from './Address';
import { RequestMaterial } from './RequestMaterial';
import { RequestAssignment } from './RequestAssignment';
import { CollectionEvidence } from './CollectionsEvidence';
import { RequestStatusHistory } from './RequestStatusHistory';

export enum RequestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Entity('collection_requests')
export class CollectionRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'citizen_id' })
  citizenId: number;

  @Column({ name: 'address_id' })
  addressId: number;

  @CreateDateColumn({ name: 'request_date' })
  requestDate: Date;

  @Column({ name: 'estimated_weight', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedWeight: number;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'citizen_id' })
  citizen: User;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => RequestMaterial, material => material.request)
  materials: RequestMaterial[];

  @OneToMany(() => RequestAssignment, assignment => assignment.request)
  assignments: RequestAssignment[];

  @OneToMany(() => CollectionEvidence, evidence => evidence.request)
  evidences: CollectionEvidence[];

  @OneToMany(() => RequestStatusHistory, history => history.request)
  statusHistory: RequestStatusHistory[];
}