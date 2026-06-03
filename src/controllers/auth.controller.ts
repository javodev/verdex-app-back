import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { generateToken } from '../utils/jwt';
import { validationResult } from 'express-validator';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  register = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { full_name, dni, phone, email, password, role } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = this.userRepository.create({
        fullName: full_name,
        dni,
        phone,
        email,
        passwordHash: hashedPassword,
        role: role || UserRole.CITIZEN
      });

      await this.userRepository.save(user);

      // Generar token
      const token = generateToken(user.id, user.email, user.role);

      // Remover password hash de la respuesta
      const { passwordHash, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar usuario' });
    }
  };

  login = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Buscar usuario
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar si está activo
      if (!user.active) {
        return res.status(401).json({ message: 'Usuario desactivado' });
      }

      // Generar token
      const token = generateToken(user.id, user.email, user.role);

      // Remover password hash de la respuesta
      const { passwordHash, ...userWithoutPassword } = user;

      res.json({
        message: 'Login exitoso',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      const user = await this.userRepository.findOne({
        where: { id: (req as any).user.userId },
        select: ['id', 'fullName', 'dni', 'phone', 'email', 'role', 'active', 'createdAt']
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener perfil' });
    }
  };
}