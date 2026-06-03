import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { registerValidator, loginValidator } from '../utils/validators';

const router = Router();
const authController = new AuthController();

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.get('/profile', authenticate, authController.getProfile);

export default router;