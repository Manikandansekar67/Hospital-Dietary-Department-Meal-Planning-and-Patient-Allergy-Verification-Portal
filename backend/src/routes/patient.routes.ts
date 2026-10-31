import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller.js';
import { OrderController } from '../controllers/order.controller.js';
import { RecommendationController } from '../controllers/recommendation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize, requirePatientOwner } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { addPatientDiseaseSchema, addPatientAllergySchema } from '../validators/index.js';
import { Role } from '../constants/index.js';

const router = Router();
const patientController = new PatientController();
const orderController = new OrderController();
const recommendationController = new RecommendationController();

// Patient available foods - CRITICAL endpoint
router.get(
  '/available-foods',
  authenticate,
  orderController.getAvailableFoods
);

// Recommendation engine
router.get(
  '/recommendations',
  authenticate,
  recommendationController.getRecommendations
);

// Patient profile
router.get(
  '/profile',
  authenticate,
  patientController.getProfile
);

router.get(
  '/list',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  patientController.listAll
);

router.get(
  '/:patientId',
  authenticate,
  requirePatientOwner,
  patientController.getProfile
);

// Update patient
router.put(
  '/:patientId',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  patientController.updatePatient
);

router.patch(
  '/:patientId',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  patientController.patchPatient
);

// Delete patient
router.delete(
  '/:patientId',
  authenticate,
  authorize(Role.ADMIN),
  patientController.deletePatient
);

// Doctor adds disease to patient
router.post(
  '/:patientId/diseases',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  validateBody(addPatientDiseaseSchema),
  patientController.addDisease
);

// Remove disease from patient
router.delete(
  '/:patientId/diseases/:diseaseId',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  patientController.removeDisease
);

// Doctor adds allergy to patient
router.post(
  '/:patientId/allergies',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  validateBody(addPatientAllergySchema),
  patientController.addAllergy
);

// Remove allergy from patient
router.delete(
  '/:patientId/allergies/:allergyId',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  patientController.removeAllergy
);

// Allergy verification engine test/check
router.post(
  '/verify-allergy',
  authenticate,
  patientController.verifyAllergySafety
);

export default router;
