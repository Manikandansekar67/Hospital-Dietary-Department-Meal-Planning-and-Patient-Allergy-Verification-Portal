import { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patient.service.js';
import { AllergyVerificationService } from '../services/allergyVerification.service.js';
import { sendSuccess } from '../utils/response.js';
import { Role } from '../constants/index.js';

export class PatientController {
  constructor(
    private patientService = new PatientService(),
    private allergyService = new AllergyVerificationService()
  ) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.params.patientId || req.user?.patientId;
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required' } });
        return;
      }
      const profile = await this.patientService.getPatientProfile(patientId);
      sendSuccess(res, profile, 200);
    } catch (err) {
      next(err);
    }
  };

  listAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let requestingDoctorId: string | undefined = undefined;
      if (req.user?.role === Role.DOCTOR) {
        requestingDoctorId = req.user?.doctorId || req.user?.userId;
      }
      const patients = await this.patientService.listAllPatients(requestingDoctorId);
      sendSuccess(res, patients, 200);
    } catch (err) {
      next(err);
    }
  };

  createPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId =
        req.user?.role === Role.DOCTOR
          ? (req.user?.doctorId || req.user?.userId)
          : req.body.doctorId;
      const patient = await this.patientService.createPatient({
        ...req.body,
        doctorId,
      });
      sendSuccess(res, patient, 201);
    } catch (err) {
      next(err);
    }
  };

  addDisease = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = req.user?.doctorId || req.user?.userId || 'doc-unknown';
      const patientId = req.params.patientId;
      const result = await this.patientService.addPatientDisease({
        patientId,
        diseaseId: req.body.diseaseId,
        notes: req.body.notes,
        doctorId,
      });
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  };

  addAllergy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = req.user?.doctorId || req.user?.userId || 'doc-unknown';
      const patientId = req.params.patientId;
      const result = await this.patientService.addPatientAllergy({
        patientId,
        allergyId: req.body.allergyId,
        severity: req.body.severity,
        notes: req.body.notes,
        doctorId,
      });
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  };

  verifyAllergySafety = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { patientId, foodId } = req.body;
      const result = await this.allergyService.verifyAllergySafety(patientId, foodId);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };

  updatePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.params.patientId || req.user?.patientId;
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required' } });
        return;
      }
      const updated = await this.patientService.updatePatient(patientId, req.body);
      sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  };

  patchPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.params.patientId || req.user?.patientId;
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required' } });
        return;
      }
      const updated = await this.patientService.patchPatient(patientId, req.body);
      sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  };

  deletePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.params.patientId;
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required' } });
        return;
      }
      const actorId = req.user?.userId;
      await this.patientService.deletePatient(patientId, actorId);
      sendSuccess(res, { success: true, message: 'Patient record deleted successfully' }, 200);
    } catch (err) {
      next(err);
    }
  };

  removeDisease = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { patientId, diseaseId } = req.params;
      const doctorId = req.user?.doctorId || req.user?.userId || 'doc-1';
      await this.patientService.removePatientDisease(patientId, diseaseId, doctorId);
      sendSuccess(res, { success: true, message: 'Disease removed from patient' }, 200);
    } catch (err) {
      next(err);
    }
  };

  removeAllergy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { patientId, allergyId } = req.params;
      const doctorId = req.user?.doctorId || req.user?.userId || 'doc-1';
      await this.patientService.removePatientAllergy(patientId, allergyId, doctorId);
      sendSuccess(res, { success: true, message: 'Allergy removed from patient' }, 200);
    } catch (err) {
      next(err);
    }
  };
}
