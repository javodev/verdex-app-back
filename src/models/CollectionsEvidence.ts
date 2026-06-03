import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CollectionRequest } from './CollectionRequest';

@Entity('collection_evidences')
export class CollectionEvidence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'image_url', length: 1000, nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => CollectionRequest)
  @JoinColumn({ name: 'request_id' })
  request: CollectionRequest;
}