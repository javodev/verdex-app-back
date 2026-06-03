import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RequestMaterial } from './RequestMaterial';

@Entity('recyclable_materials')
export class RecyclableMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 300, nullable: true })
  description: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => RequestMaterial, requestMaterial => requestMaterial.material)
  requestMaterials: RequestMaterial[];
}