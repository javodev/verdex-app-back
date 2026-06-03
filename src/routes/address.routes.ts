import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const addressController = new AddressController();

router.use(authenticate);
router.post('/', addressController.createAddress);
router.get('/', addressController.getUserAddresses);

export default router;