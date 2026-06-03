import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const isOperator = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'OPERATOR') {
    return res.status(403).json({ message: 'Se requiere rol de Operador' });
  }
  next();
};

export const isCollector = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'COLLECTOR') {
    return res.status(403).json({ message: 'Se requiere rol de Recolector' });
  }
  next();
};

export const isCitizen = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'CITIZEN') {
    return res.status(403).json({ message: 'Se requiere rol de Ciudadano' });
  }
  next();
};