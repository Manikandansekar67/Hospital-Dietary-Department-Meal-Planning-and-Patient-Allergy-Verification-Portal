import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import doctorRoutes from './doctor.routes.js';
import kitchenRoutes from './kitchen.routes.js';
import patientRoutes from './patient.routes.js';
import foodRoutes from './food.routes.js';
import orderRoutes from './order.routes.js';
import approvalRoutes from './approval.routes.js';
import feedbackRoutes from './feedback.routes.js';
import notificationRoutes from './notification.routes.js';
import auditRoutes from './audit.routes.js';
import { RecommendationController } from '../controllers/recommendation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

import { PatientController } from '../controllers/patient.controller.js';

import { AdminController } from '../controllers/admin.controller.js';
import { OrderController } from '../controllers/order.controller.js';
import { Role } from '../constants/index.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();
const recommendationController = new RecommendationController();
const patientController = new PatientController();
const adminController = new AdminController();
const orderController = new OrderController();

// Mount modules
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/doctor', doctorRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/patient', patientRoutes);
router.use('/foods', foodRoutes);
router.use('/orders', orderRoutes);
router.use('/approvals', approvalRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);

// Direct top-level aliases requested in RBAC spec
router.get('/doctors', authenticate, adminController.listDoctors);
router.get('/patients', authenticate, patientController.listAll);
router.post('/patients', authenticate, patientController.createPatient);
router.get('/patients/:patientId', authenticate, patientController.getProfile);
router.put('/patients/:patientId', authenticate, patientController.updatePatient);
router.patch('/patients/:patientId', authenticate, patientController.patchPatient);
router.delete('/patients/:patientId', authenticate, authorize(Role.ADMIN), patientController.deletePatient);
router.get('/recommendations/:patientId', authenticate, recommendationController.getRecommendations);
router.get('/orders/:id', authenticate, orderController.getOrderById);

router.get('/diseases', authenticate, async (_req, res, next) => {
  try {
    const { DiseaseModel } = await import('../models/index.js');
    const list = await DiseaseModel.find().lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.get('/allergies', authenticate, async (_req, res, next) => {
  try {
    const { AllergyModel } = await import('../models/index.js');
    const list = await AllergyModel.find().lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
