import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { KitchenController } from '../controllers/kitchen.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize, requirePatientOwner } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/index.js';
import { Role } from '../constants/index.js';

const router = Router();
const orderController = new OrderController();
const kitchenController = new KitchenController();

// Patient places order
router.post(
  '/',
  authenticate,
  authorize(Role.PATIENT, Role.ADMIN),
  validateBody(createOrderSchema),
  orderController.createOrder
);

// Patient retrieves their own orders
router.get(
  '/my-orders',
  authenticate,
  authorize(Role.PATIENT, Role.ADMIN),
  orderController.getPatientOrders
);

router.get(
  '/patient/:patientId',
  authenticate,
  requirePatientOwner,
  orderController.getPatientOrders
);

// Retrieve all orders (accessible to staff: KITCHEN, DOCTOR, ADMIN)
router.get(
  '/',
  authenticate,
  authorize(Role.KITCHEN, Role.DOCTOR, Role.ADMIN),
  kitchenController.listOrders
);

// Kitchen retrieves all orders
router.get(
  '/kitchen/all',
  authenticate,
  authorize(Role.KITCHEN, Role.DOCTOR, Role.ADMIN),
  kitchenController.listOrders
);

// Retrieve specific order by ID
router.get(
  '/:id',
  authenticate,
  orderController.getOrderById
);

// Kitchen updates status (PUT & PATCH)
router.put(
  '/:id/status',
  authenticate,
  authorize(Role.KITCHEN, Role.ADMIN),
  validateBody(updateOrderStatusSchema),
  orderController.updateStatus
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(Role.KITCHEN, Role.ADMIN),
  orderController.patchOrder
);

// Update/patch order details
router.put(
  '/:id',
  authenticate,
  authorize(Role.KITCHEN, Role.DOCTOR, Role.ADMIN),
  orderController.patchOrder
);

router.patch(
  '/:id',
  authenticate,
  authorize(Role.KITCHEN, Role.DOCTOR, Role.ADMIN),
  orderController.patchOrder
);

// Cancel/delete order
router.delete(
  '/:id',
  authenticate,
  orderController.cancelOrder
);

export default router;
