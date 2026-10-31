import { AuditLogRepository } from '../repositories/index.js';
import { AuditLog } from '../types/models.js';
import { logger } from '../utils/logger.js';

export class AuditLogService {
  constructor(private auditRepo = new AuditLogRepository()) {}

  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const logEntry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata,
      timestamp: new Date(),
    };

    logger.info(`[AUDIT] Action="${params.action}" Entity=${params.entity}:${params.entityId} User=${params.userId || 'system'}`);
    return this.auditRepo.create(logEntry);
  }

  async getRecentLogs(limit = 100): Promise<AuditLog[]> {
    return this.auditRepo.listAll(limit);
  }
}
