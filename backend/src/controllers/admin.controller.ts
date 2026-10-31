import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';

export class AdminController {
  constructor(private adminService = new AdminService()) {}

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.adminService.getDashboardStats();
      sendSuccess(res, stats, 200);
    } catch (err) {
      next(err);
    }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.adminService.listAllUsers();
      sendSuccess(res, users, 200);
    } catch (err) {
      next(err);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.adminService.createUser(req.body);
      sendSuccess(res, user, 201);
    } catch (err) {
      next(err);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.adminService.updateUser(req.params.id, req.body);
      sendSuccess(res, user, 200);
    } catch (err) {
      next(err);
    }
  };

  patchUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.adminService.patchUser(req.params.id, req.body);
      sendSuccess(res, user, 200);
    } catch (err) {
      next(err);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminUserId = req.user?.userId;
      await this.adminService.deleteUser(req.params.id, adminUserId);
      sendSuccess(res, { success: true, message: 'User deleted successfully' }, 200);
    } catch (err) {
      next(err);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body;
      const adminUserId = req.user?.userId || 'admin';
      const updatedUser = await this.adminService.updateUserStatus(
        req.params.id,
        status,
        adminUserId
      );
      sendSuccess(res, updatedUser, 200);
    } catch (err) {
      next(err);
    }
  };

  listDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctors = await this.adminService.listAllDoctors();
      sendSuccess(res, doctors, 200);
    } catch (err) {
      next(err);
    }
  };

  assignDoctorToPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { patientId } = req.params;
      const { doctorId } = req.body;
      const adminUserId = req.user?.userId || 'admin';
      const result = await this.adminService.assignDoctorToPatient(patientId, doctorId, adminUserId);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };

  removeDoctorFromPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { patientId } = req.params;
      const adminUserId = req.user?.userId || 'admin';
      const result = await this.adminService.removeDoctorFromPatient(patientId, adminUserId);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };

  // Diseases
  listDiseases = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const diseases = await this.adminService.listDiseases();
      sendSuccess(res, diseases, 200);
    } catch (err) {
      next(err);
    }
  };

  createDisease = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const disease = await this.adminService.createDisease(req.body);
      sendSuccess(res, disease, 201);
    } catch (err) {
      next(err);
    }
  };

  updateDisease = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const disease = await this.adminService.updateDisease(req.params.id, req.body);
      sendSuccess(res, disease, 200);
    } catch (err) {
      next(err);
    }
  };

  patchDisease = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const disease = await this.adminService.patchDisease(req.params.id, req.body);
      sendSuccess(res, disease, 200);
    } catch (err) {
      next(err);
    }
  };

  deleteDisease = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.adminService.deleteDisease(req.params.id);
      sendSuccess(res, { success: true }, 200);
    } catch (err) {
      next(err);
    }
  };

  // Allergies
  listAllergies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allergies = await this.adminService.listAllergies();
      sendSuccess(res, allergies, 200);
    } catch (err) {
      next(err);
    }
  };

  createAllergy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allergy = await this.adminService.createAllergy(req.body);
      sendSuccess(res, allergy, 201);
    } catch (err) {
      next(err);
    }
  };

  updateAllergy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allergy = await this.adminService.updateAllergy(req.params.id, req.body);
      sendSuccess(res, allergy, 200);
    } catch (err) {
      next(err);
    }
  };

  patchAllergy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allergy = await this.adminService.patchAllergy(req.params.id, req.body);
      sendSuccess(res, allergy, 200);
    } catch (err) {
      next(err);
    }
  };

  deleteAllergy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.adminService.deleteAllergy(req.params.id);
      sendSuccess(res, { success: true }, 200);
    } catch (err) {
      next(err);
    }
  };
}
