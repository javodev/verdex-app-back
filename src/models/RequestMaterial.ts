import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CollectionRequest } from './CollectionRequest';
import { RecyclableMaterial } from './RecyclableMaterial';

@Entity('collection_request_materials')
export class RequestMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'material_id' })
  materialId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number;

  @ManyToOne(() => CollectionRequest, request => request.materials)
  @JoinColumn({ name: 'request_id' })
  request: CollectionRequest;

  @ManyToOne(() => RecyclableMaterial)
  @JoinColumn({ name: 'material_id' })
  material: RecyclableMaterial;
}