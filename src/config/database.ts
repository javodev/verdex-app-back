import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Address } from '../models/Address';
import { CollectionRequest } from '../models/CollectionRequest';
import { RecyclableMaterial } from '../models/RecyclableMaterial';
import { RequestMaterial } from '../models/RequestMaterial';
import { RequestAssignment } from '../models/RequestAssignment';
import { CollectionEvidence } from '../models/CollectionsEvidence';
import { RequestStatusHistory } from '../models/RequestStatusHistory';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  synchronize: false, // Solo true en desarrollo
  logging: true,
  entities: [
    User,
    Address,
    CollectionRequest,
    RecyclableMaterial,
    RequestMaterial,
    RequestAssignment,
    CollectionEvidence,
    RequestStatusHistory
  ],
  subscribers: [],
  migrations: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};