import { Router } from 'express';
import { RequestController } from '../controllers/request.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { createRequestValidator, assignRequestValidator } from '../utils/validators';

const router = Router();
const requestController = new RequestController();

router.use(authenticate);

router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);
router.post('/', createRequestValidator, requestController.createRequest);
router.post('/:id/assign', authorize('OPERATOR'), assignRequestValidator, requestController.assignRequest);
router.put('/:id/status', requestController.updateRequestStatus);

export default router;