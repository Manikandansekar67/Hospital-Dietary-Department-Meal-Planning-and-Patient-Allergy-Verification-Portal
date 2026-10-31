import { Request, Response, NextFunction } from 'express';
import { ApprovalService } from '../services/approval.service.js';
import { sendSuccess } from '../utils/response.js';

export class ApprovalController {
  constructor(private approvalService = new ApprovalService()) {}

  getApprovalsForPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.params.patientId || req.user?.patientId;
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required' } });
        return;
      }
      const list = await this.approvalService.listApprovalsForPatient(patientId);
      sendSuccess(res, list, 200);
    } catch (err) {
      next(err);
    }
  };

  listAllApprovals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.approvalService.listAllApprovals();
      sendSuccess(res, list, 200);
    } catch (err) {
      next(err);
    }
  };

  updateApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = req.user?.doctorId || req.user?.userId || 'unknown-doc';
      const result = await this.approvalService.setApprovalStatus({
        ...req.body,
        doctorId,
      });
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };

  patchApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = req.user?.doctorId || req.user?.userId || 'unknown-doc';
      const result = await this.approvalService.patchApprovalStatus({
        ...req.body,
        doctorId,
      });
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };

  deleteApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = req.user?.doctorId || req.user?.userId || 'unknown-doc';
      const id = req.params.id;
      const patientId = (req.query.patientId as string) || req.body.patientId;
      const foodId = (req.query.foodId as string) || req.body.foodId;

      if (id) {
        await this.approvalService.deleteApprovalById(id, doctorId);
      } else if (patientId && foodId) {
        await this.approvalService.deleteApproval(patientId, foodId, doctorId);
      } else {
        res.status(400).json({ success: false, error: { message: 'Approval ID or both patientId and foodId are required' } });
        return;
      }
      sendSuccess(res, { success: true, message: 'Approval removed successfully' }, 200);
    } catch (err) {
      next(err);
    }
  };
}
