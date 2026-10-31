import { KitchenRepository, FoodRepository } from '../repositories/index.js';
import { KitchenAvailability } from '../types/models.js';
import { MealType, AvailabilityStatus } from '../constants/index.js';
import { AuditLogService } from './auditLog.service.js';
import { NotificationService } from './notification.service.js';
import { NotificationType } from '../constants/index.js';

export class KitchenService {
  constructor(
    private kitchenRepo = new KitchenRepository(),
    private foodRepo = new FoodRepository(),
    private auditLogService = new AuditLogService(),
    private notifService = new NotificationService()
  ) {}

  getKitchenStatus(): { isActive: boolean; notes: string } {
    return {
      isActive: this.kitchenRepo.isKitchenActive(),
      notes: this.kitchenRepo.getKitchenStatusNotes(),
    };
  }

  async updateKitchenStatus(
    isActive: boolean,
    notes?: string,
    updatedBy?: string
  ): Promise<{ isActive: boolean; notes: string }> {
    this.kitchenRepo.setKitchenStatus(isActive, notes);

    await this.auditLogService.log({
      userId: updatedBy,
      action: 'Kitchen changed availability',
      entity: 'KitchenStatus',
      entityId: 'global',
      metadata: { isActive, notes },
    });

    return {
      isActive,
      notes: notes || this.kitchenRepo.getKitchenStatusNotes(),
    };
  }

  async listAvailabilitiesForDate(date: string): Promise<KitchenAvailability[]> {
    return this.kitchenRepo.listAvailabilitiesForDate(date);
  }

  async createAvailability(params: {
    foodId: string;
    date: string;
    mealType: MealType;
    startTime: string;
    endTime: string;
    createdBy?: string;
  }): Promise<KitchenAvailability> {
    const now = new Date();
    const ka: KitchenAvailability = {
      id: `ka-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      foodId: params.foodId,
      date: params.date,
      mealType: params.mealType,
      startTime: params.startTime,
      endTime: params.endTime,
      status: AvailabilityStatus.ACTIVE,
      createdBy: params.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.kitchenRepo.createAvailability(ka);

    await this.auditLogService.log({
      userId: params.createdBy,
      action: 'Kitchen added meal schedule',
      entity: 'KitchenAvailability',
      entityId: saved.id,
      metadata: { foodId: params.foodId, date: params.date, mealType: params.mealType },
    });

    return saved;
  }

  async updateAvailabilityStatus(id: string, status: AvailabilityStatus, updatedBy?: string): Promise<KitchenAvailability | null> {
    const updated = await this.kitchenRepo.updateAvailability(id, { status });
    if (updated) {
      await this.auditLogService.log({
        userId: updatedBy,
        action: 'Kitchen changed availability status',
        entity: 'KitchenAvailability',
        entityId: id,
        metadata: { status },
      });
    }
    return updated;
  }

  async patchKitchenStatus(
    params: { isActive?: boolean; notes?: string },
    updatedBy?: string
  ): Promise<{ isActive: boolean; notes: string }> {
    const currentActive = this.kitchenRepo.isKitchenActive();
    const currentNotes = this.kitchenRepo.getKitchenStatusNotes();
    const isActive = params.isActive !== undefined ? params.isActive : currentActive;
    const notes = params.notes !== undefined ? params.notes : currentNotes;
    return this.updateKitchenStatus(isActive, notes, updatedBy);
  }

  async patchAvailability(
    id: string,
    updates: Partial<KitchenAvailability>,
    updatedBy?: string
  ): Promise<KitchenAvailability | null> {
    const updated = await this.kitchenRepo.updateAvailability(id, updates);
    if (updated) {
      await this.auditLogService.log({
        userId: updatedBy,
        action: 'Kitchen patched availability',
        entity: 'KitchenAvailability',
        entityId: id,
        metadata: updates as Record<string, unknown>,
      });
    }
    return updated;
  }

  async deleteAvailability(id: string, deletedBy?: string): Promise<boolean> {
    const deleted = await this.kitchenRepo.delete(id);
    await this.auditLogService.log({
      userId: deletedBy,
      action: 'Kitchen deleted availability entry',
      entity: 'KitchenAvailability',
      entityId: id,
      metadata: {},
    });
    return deleted;
  }
}
