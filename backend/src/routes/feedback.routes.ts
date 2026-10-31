import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createFeedbackSchema } from '../validators/index.js';
import { Role } from '../constants/index.js';

const router = Router();
const controller = new FeedbackController();

// Only patients can submit feedback on delivered orders
router.post(
  '/',
  authenticate,
  authorize(Role.PATIENT, Role.ADMIN),
  validateBody(createFeedbackSchema),
  controller.submitFeedback
);

router.get('/', authenticate, controller.listFeedback);
router.delete('/:id', authenticate, authorize(Role.ADMIN), controller.deleteFeedback);

export default router;
