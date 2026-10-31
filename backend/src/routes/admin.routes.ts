import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { AuditController } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { PatientController } from '../controllers/patient.controller.js';
import { Role } from '../constants/index.js';

const router = Router();
const adminController = new AdminController();
const auditController = new AuditController();
const patientController = new PatientController();

// Doctors list accessible to both Admin and Doctor (e.g. Inpatient Roster & Doctor Assignment)
router.get('/doctors', authenticate, authorize(Role.ADMIN, Role.DOCTOR), adminController.listDoctors);

router.use(authenticate, authorize(Role.ADMIN));

// Dashboard Stats
router.get('/stats', adminController.getStats);

// Patients
router.get('/patients', patientController.listAll);
router.post('/patients', patientController.createPatient);
router.put('/patients/:patientId', patientController.updatePatient);
router.patch('/patients/:patientId', patientController.patchPatient);
router.delete('/patients/:patientId', patientController.deletePatient);
router.put('/patients/:patientId/assign-doctor', adminController.assignDoctorToPatient);
router.delete('/patients/:patientId/assign-doctor', adminController.removeDoctorFromPatient);

// Users
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id', adminController.patchUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/status', adminController.updateUserStatus);

// Diseases
router.get('/diseases', adminController.listDiseases);
router.post('/diseases', adminController.createDisease);
router.put('/diseases/:id', adminController.updateDisease);
router.patch('/diseases/:id', adminController.patchDisease);
router.delete('/diseases/:id', adminController.deleteDisease);

// Allergies
router.get('/allergies', adminController.listAllergies);
router.post('/allergies', adminController.createAllergy);
router.put('/allergies/:id', adminController.updateAllergy);
router.patch('/allergies/:id', adminController.patchAllergy);
router.delete('/allergies/:id', adminController.deleteAllergy);

// Audit Logs
router.get('/audit-logs', auditController.getAuditLogs);

export default router;
