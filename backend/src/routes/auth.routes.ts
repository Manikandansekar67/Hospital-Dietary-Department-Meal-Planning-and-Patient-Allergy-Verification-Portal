import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { registerUserSchema, loginUserSchema } from '../validators/index.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();
const controller = new AuthController();

router.post('/register', authRateLimiter, validateBody(registerUserSchema), controller.register);
router.post('/login', authRateLimiter, validateBody(loginUserSchema), controller.login);
router.get('/me', authenticate, controller.getMe);

export default router;
