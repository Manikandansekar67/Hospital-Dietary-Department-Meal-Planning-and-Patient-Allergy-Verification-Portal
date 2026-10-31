import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller.js';
import { FoodController } from '../controllers/food.controller.js';
import { ApprovalController } from '../controllers/approval.controller.js';
import { RecommendationController } from '../controllers/recommendation.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createFoodSchema, updateApprovalSchema, addPatientDiseaseSchema, addPatientAllergySchema } from '../validators/index.js';
import { Role } from '../constants/index.js';

const router = Router();
const patientController = new PatientController();
const foodController = new FoodController();
const approvalController = new ApprovalController();
const recommendationController = new RecommendationController();
const adminController = new AdminController();

router.use(authenticate, authorize(Role.DOCTOR, Role.ADMIN));

// Doctors directory
router.get('/doctors', adminController.listDoctors);

// Patients
router.get('/patients', patientController.listAll);
router.post('/patients', patientController.createPatient);
router.get('/patients/:patientId', patientController.getProfile);
router.put('/patients/:patientId', patientController.updatePatient);
router.patch('/patients/:patientId', patientController.patchPatient);
router.get('/patients/:patientId/recommendations', recommendationController.getRecommendations);
router.post('/patients/:patientId/diseases', validateBody(addPatientDiseaseSchema), patientController.addDisease);
router.delete('/patients/:patientId/diseases/:diseaseId', patientController.removeDisease);
router.post('/patients/:patientId/allergies', validateBody(addPatientAllergySchema), patientController.addAllergy);
router.delete('/patients/:patientId/allergies/:allergyId', patientController.removeAllergy);

// Approvals
router.get('/approvals', approvalController.listAllApprovals);
router.post('/approvals', validateBody(updateApprovalSchema), approvalController.updateApproval);
router.put('/approvals', validateBody(updateApprovalSchema), approvalController.updateApproval);
router.patch('/approvals', approvalController.patchApproval);
router.delete('/approvals/:id', approvalController.deleteApproval);
router.delete('/approvals', approvalController.deleteApproval);

// Foods
router.get('/foods', foodController.listFoods);
router.get('/foods/:id', foodController.getFoodById);
router.post('/foods', validateBody(createFoodSchema), foodController.createFood);
router.put('/foods/:id', foodController.updateFood);
router.patch('/foods/:id', foodController.patchFood);
router.delete('/foods/:id', foodController.deleteFood);

export default router;
