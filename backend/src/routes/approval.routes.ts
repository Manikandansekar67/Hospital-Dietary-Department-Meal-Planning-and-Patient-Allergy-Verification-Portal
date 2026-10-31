import { Router } from 'express';
import { ApprovalController } from '../controllers/approval.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize, requirePatientOwner } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateApprovalSchema } from '../validators/index.js';
import { Role } from '../constants/index.js';

const router = Router();
const controller = new ApprovalController();

router.get('/', authenticate, authorize(Role.DOCTOR, Role.ADMIN), controller.listAllApprovals);
router.get(
  '/patient/:patientId',
  authenticate,
  requirePatientOwner,
  controller.getApprovalsForPatient
);
router.post(
  '/',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  validateBody(updateApprovalSchema),
  controller.updateApproval
);
router.put(
  '/',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  validateBody(updateApprovalSchema),
  controller.updateApproval
);

router.patch(
  '/',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  controller.patchApproval
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  controller.deleteApproval
);

router.delete(
  '/',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  controller.deleteApproval
);

export default router;
