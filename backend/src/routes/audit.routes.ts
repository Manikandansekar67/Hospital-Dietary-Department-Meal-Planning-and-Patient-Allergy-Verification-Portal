import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Role } from '../constants/index.js';

const router = Router();
const controller = new AuditController();

router.get('/', authenticate, authorize(Role.ADMIN), controller.getAuditLogs);

export default router;
