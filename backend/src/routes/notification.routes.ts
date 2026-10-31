import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new NotificationController();

router.get('/', authenticate, controller.getNotifications);
router.put('/:id/read', authenticate, controller.markAsRead);
router.patch('/:id/read', authenticate, controller.patchNotification);
router.patch('/:id', authenticate, controller.patchNotification);
router.delete('/:id', authenticate, controller.deleteNotification);
router.delete('/', authenticate, controller.clearAll);

export default router;
