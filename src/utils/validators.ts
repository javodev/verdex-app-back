import { body } from 'express-validator';

export const registerValidator = [
  body('full_name').notEmpty().withMessage('Nombre completo es requerido'),
  body('email').isEmail().withMessage('Email válido es requerido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('role').optional().isIn(['CITIZEN', 'OPERATOR', 'COLLECTOR'])
];

export const loginValidator = [
  body('email').isEmail().withMessage('Email válido es requerido'),
  body('password').notEmpty().withMessage('Contraseña es requerida')
];

export const createRequestValidator = [
  body('address_id').isInt().withMessage('ID de dirección válido es requerido'),
  body('estimated_weight').optional().isFloat({ min: 0 }),
  body('materials').isArray().withMessage('Materiales debe ser un array')
];

export const assignRequestValidator = [
  body('collector_id').isInt().withMessage('ID de recolector válido es requerido')
];