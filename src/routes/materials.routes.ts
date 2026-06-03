import { Router } from 'express';
import { MaterialController } from '../controllers/material.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const materialController = new MaterialController();

// Rutas públicas (solo lectura)
router.get('/', materialController.getMaterials);
router.get('/:id', materialController.getMaterialById);

// Rutas protegidas (requieren autenticación)
router.use(authenticate);
router.post('/', materialController.createMaterial);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

export default router;