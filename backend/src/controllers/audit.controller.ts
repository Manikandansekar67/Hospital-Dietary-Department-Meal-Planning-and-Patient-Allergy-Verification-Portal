import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLog.service.js';
import { sendSuccess } from '../utils/response.js';

export class AuditController {
  constructor(private auditLogService = new AuditLogService()) {}

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt((req.query.limit as string) || '100', 10);
      const logs = await this.auditLogService.getRecentLogs(limit);
      sendSuccess(res, logs, 200);
    } catch (err) {
      next(err);
    }
  };
}
