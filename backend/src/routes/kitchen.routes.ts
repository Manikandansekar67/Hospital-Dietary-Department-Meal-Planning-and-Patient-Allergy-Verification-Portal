import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateKitchenStatusSchema, createAvailabilitySchema } from '../validators/index.js';
import { Role } from '../constants/index.js';

const router = Router();
const controller = new KitchenController();

// Public kitchen operational status for portal header & pre-flight ordering checks
router.get('/status', controller.getStatus);

// Management restricted to KITCHEN and ADMIN
router.put(
  '/status',
  authenticate,
  authorize(Role.KITCHEN, Role.ADMIN),
  validateBody(updateKitchenStatusSchema),
  controller.updateStatus
);

router.patch(
  '/status',
  authenticate,
  authorize(Role.KITCHEN, Role.ADMIN),
  controller.patchStatus
);

router.get('/availabilities', authenticate, controller.listAvailabilities);
router.post(
  '/availabilities',
  authenticate,
  authorize(Role.KITCHEN, Role.ADMIN),
  validateBody(createAvailabilitySchema),
  controller.createAvailability
);
router.put(
  '/availabilities/:id',
  authenticate,
  authorize(Role.KITCHEN, Role.ADMIN),
  controller.toggleAvailability
);
router.patch(
  '/availabilities/:id',
  authenticate,
  authorize(Role.KITCHEN, Role.ADMIN),
  controller.patchAvailability
);
router.delete(
  '/availabilities/:id',
  authenticate,
  authorize(Role.KITCHEN, Role.ADMIN),
  controller.deleteAvailability
);

router.get('/orders', authenticate, authorize(Role.KITCHEN, Role.DOCTOR, Role.ADMIN), controller.listOrders);
router.get(
  '/orders/:orderId/prep-sheet',
  authenticate,
  authorize(Role.KITCHEN, Role.DOCTOR, Role.ADMIN),
  controller.getOrderPrepSheet
);

export default router;
