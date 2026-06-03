import { Router } from 'express';
import { CollectorController } from '../controllers/collector.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const collectorController = new CollectorController();

router.use(authenticate);
router.use(authorize('OPERATOR'));

router.post('/collector', collectorController.createCollector);
router.get('/collectors', collectorController.getCollectors);
router.put('/collector/:id/toggle', collectorController.toggleCollectorStatus);
router.put('/collector/:id', collectorController.updateCollector);

export default router;