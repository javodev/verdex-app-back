import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import bcrypt from 'bcryptjs';

export class CollectorController {
  private userRepository = AppDataSource.getRepository(User);

  createCollector = async (req: AuthRequest, res: Response) => {
    try {
      const { full_name, dni, phone, email, password, vehicle_type, assigned_zone } = req.body;

      // Verificar si ya existe
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      // Hash de contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear recolector
      const collector = this.userRepository.create({
        fullName: full_name,
        dni,
        phone,
        email,
        passwordHash: hashedPassword,
        role: UserRole.COLLECTOR,
        vehicleType: vehicle_type,
        assignedZone: assigned_zone
      });

      await this.userRepository.save(collector);

      const { passwordHash, ...collectorWithoutPassword } = collector;

      res.status(201).json({
        message: 'Recolector creado exitosamente',
        collector: collectorWithoutPassword
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear recolector' });
    }
  };

  getCollectors = async (req: AuthRequest, res: Response) => {
    try {
      const collectors = await this.userRepository.find({
        where: { role: UserRole.COLLECTOR },
        select: ['id', 'fullName', 'dni', 'phone', 'email', 'active', 'createdAt', 'vehicleType', 'assignedZone']
      });

      // Aquí podrías agregar estadísticas de recolecciones
      const collectorsWithStats = await Promise.all(collectors.map(async (collector) => {
        return {
          ...collector,
          assigned_count: 0, // Calcular desde assignments
          completed_count: 0, // Calcular desde requests
          pending_count: 0
        };
      }));

      res.json(collectorsWithStats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener recolectores' });
    }
  };

  toggleCollectorStatus = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { active } = req.body;

      const collector = await this.userRepository.findOne({
        where: { id: parseInt(id), role: UserRole.COLLECTOR }
      });

      if (!collector) {
        return res.status(404).json({ message: 'Recolector no encontrado' });
      }

      collector.active = active;
      await this.userRepository.save(collector);

      res.json({
        message: `Recolector ${active ? 'activado' : 'desactivado'} exitosamente`,
        active: collector.active
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al cambiar estado del recolector' });
    }
  };

  updateCollector = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dni, phone, vehicle_type, assigned_zone } = req.body;

    // Buscar el recolector
    const collector = await this.userRepository.findOne({
      where: { id: parseInt(id), role: UserRole.COLLECTOR }
    });

    if (!collector) {
      return res.status(404).json({ message: 'Recolector no encontrado' });
    }

    // Actualizar solo los campos permitidos
    if (dni !== undefined) collector.dni = dni;
    if (phone !== undefined) collector.phone = phone;
    if (vehicle_type !== undefined) collector.vehicleType = vehicle_type;
    if (assigned_zone !== undefined) collector.assignedZone = assigned_zone;

    await this.userRepository.save(collector);

    const { passwordHash, ...collectorWithoutPassword } = collector;

    res.json({
      message: 'Recolector actualizado exitosamente',
      collector: collectorWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar recolector' });
  }
};
}