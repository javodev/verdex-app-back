import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { CollectionRequest } from './CollectionRequest';
import { RequestAssignment } from './RequestAssignment';

export enum UserRole {
  CITIZEN = 'CITIZEN',
  OPERATOR = 'OPERATOR',
  COLLECTOR = 'COLLECTOR'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', length: 200 })
  fullName: string;

  @Column({ length: 20, nullable: true })
  dni: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CITIZEN })
  role: UserRole;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'vehicle_type', length: 50, nullable: true })
  vehicleType: string;

  @Column({ name: 'assigned_zone', length: 50, nullable: true })
  assignedZone: string;

  @OneToMany(() => CollectionRequest, request => request.citizen)
  requests: CollectionRequest[];

  @OneToMany(() => RequestAssignment, assignment => assignment.collector)
  assignments: RequestAssignment[];
}