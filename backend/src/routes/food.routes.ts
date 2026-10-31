import { Router } from 'express';
import { FoodController } from '../controllers/food.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createFoodSchema } from '../validators/index.js';
import { Role } from '../constants/index.js';

const router = Router();
const controller = new FoodController();

router.get('/', authenticate, controller.listFoods);
router.get('/:id', authenticate, controller.getFoodById);
router.post(
  '/',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  validateBody(createFoodSchema),
  controller.createFood
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  controller.updateFood
);

router.patch(
  '/:id',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  controller.patchFood
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  controller.deleteFood
);

export default router;
