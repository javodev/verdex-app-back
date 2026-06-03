import { AppDataSource } from './database';
import { RecyclableMaterial } from '../models/RecyclableMaterial';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';

const seedDatabase = async () => {
  await AppDataSource.initialize();

  // Insertar materiales reciclables
  const materials = [
    { name: 'Plástico PET', description: 'Botellas de plástico, envases' },
    { name: 'Vidrio', description: 'Botellas de vidrio, frascos' },
    { name: 'Papel y Cartón', description: 'Periódicos, cajas, revistas' },
    { name: 'Metales', description: 'Latas de aluminio, fierro, cobre' },
    { name: 'Orgánicos', description: 'Restos de comida, cáscaras' },
    { name: 'Electrónicos', description: 'Celulares, computadoras, cables' },
    { name: 'Textiles', description: 'Ropa, telas, zapatos' },
    { name: 'Pilas y Baterías', description: 'Pilas usadas, baterías' }
  ];

  for (const material of materials) {
    const existing = await AppDataSource.getRepository(RecyclableMaterial).findOne({
      where: { name: material.name }
    });
    
    if (!existing) {
      const newMaterial = AppDataSource.getRepository(RecyclableMaterial).create(material);
      await AppDataSource.getRepository(RecyclableMaterial).save(newMaterial);
      console.log(`✅ Material creado: ${material.name}`);
    }
  }

  // Crear usuario operador por defecto
  const operatorEmail = 'operador@municipalidad.com';
  const existingOperator = await AppDataSource.getRepository(User).findOne({
    where: { email: operatorEmail }
  });

  if (!existingOperator) {
    const hashedPassword = await bcrypt.hash('operador123', 10);
    const operator = AppDataSource.getRepository(User).create({
      fullName: 'Operador Municipal',
      email: operatorEmail,
      passwordHash: hashedPassword,
      role: UserRole.OPERATOR,
      active: true
    });
    await AppDataSource.getRepository(User).save(operator);
    console.log('✅ Usuario operador creado: operador@municipalidad.com / operador123');
  }

  console.log('🎉 Seed completado!');
  process.exit(0);
};

seedDatabase().catch(error => {
  console.error('Error en seed:', error);
  process.exit(1);
});