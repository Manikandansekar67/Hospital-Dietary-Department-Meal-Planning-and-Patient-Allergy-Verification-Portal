import {
  ApprovalRepository,
  PatientRepository,
  FoodRepository,
  DoctorRepository,
  UserRepository,
} from '../repositories/index.js';
import { DoctorFoodApproval } from '../types/models.js';
import { ApprovalStatus, NotificationType, ErrorCode } from '../constants/index.js';
import { AppError } from '../utils/response.js';
import { AuditLogService } from './auditLog.service.js';
import { NotificationService } from './notification.service.js';
import { AllergyVerificationService } from './allergyVerification.service.js';

const DEFAULT_FOOD_IMAGES: Record<string, string> = {
  'food-1': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop&q=80',
  'food-2': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  'food-3': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
  'food-4': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
  'food-5': 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80',
  'food-6': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
  'food-7': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
};
const DEFAULT_FALLBACK_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

export class ApprovalService {
  constructor(
    private approvalRepo = new ApprovalRepository(),
    private patientRepo = new PatientRepository(),
    private foodRepo = new FoodRepository(),
    private doctorRepo = new DoctorRepository(),
    private userRepo = new UserRepository(),
    private auditLogService = new AuditLogService(),
    private notifService = new NotificationService(),
    private allergyService = new AllergyVerificationService()
  ) {}

  async getApproval(patientId: string, foodId: string): Promise<DoctorFoodApproval | null> {
    return this.approvalRepo.findByPatientAndFood(patientId, foodId);
  }

  async listApprovalsForPatient(patientId: string): Promise<any[]> {
    const all = await this.listAllApprovals();
    return all.filter((a) => a.patientId === patientId);
  }

  async listAllApprovals(): Promise<any[]> {
    const rawList = await this.approvalRepo.listAll();
    const enriched = await Promise.all(
      rawList.map(async (app) => {
        const food = await this.foodRepo.findById(app.foodId);
        const patient = await this.patientRepo.findById(app.patientId);
        const patientUser = patient ? await this.userRepo.findById(patient.userId) : null;
        const doctorUser = await this.userRepo.findById(app.doctorId);
        const ingredients = food ? await this.foodRepo.getIngredientsForFood(food.id) : [];
        const allergyCheck = await this.allergyService.verifyAllergySafety(app.patientId, app.foodId);

        return {
          id: app.id,
          foodId: app.foodId,
          food: food
            ? {
                ...food,
                image: (food as any).image || DEFAULT_FOOD_IMAGES[food.id] || DEFAULT_FALLBACK_FOOD_IMAGE,
                category: food.category,
                nutrition: {
                  calories: food.calories || 250,
                  protein: food.protein || 10,
                  carbohydrates: food.carbohydrates || 30,
                  fat: food.fat || 5,
                  sodium: food.sodium || 80,
                  sugar: food.sugar || 4,
                },
                ingredients: ingredients.map((i) => i.name),
              }
            : null,
          patientId: app.patientId,
          patientName: patientUser?.name || 'Patient',
          diseaseCompatibility: {
            compatible: true,
            notes: 'Clinically assessed',
            matchedDiseases: [],
            conflicts: [],
          },
          allergyCheck: {
            hasConflict: !allergyCheck.safe,
            conflictingIngredients: allergyCheck.conflicts.map((c) => c.ingredient),
            allergenName: allergyCheck.conflicts.map((c) => c.allergy).join(', '),
            details: allergyCheck.safe ? 'Verified safe' : 'Allergen hazard detected',
          },
          safetyStatus: !allergyCheck.safe
            ? 'CRITICAL_ALLERGY'
            : app.status === ApprovalStatus.APPROVED
            ? 'SAFE'
            : 'CONTRAINDICATED',
          doctorApproval: {
            status: (app.status || 'pending').toLowerCase(),
            doctorId: app.doctorId,
            doctorName: doctorUser?.name || 'Dr. Sarah Mitchell, MD',
            doctorRemarks: app.remarks || '',
            approvalDate: app.approvedAt ? new Date(app.approvedAt).toISOString() : new Date().toISOString(),
          },
        };
      })
    );
    return enriched.filter((e) => e.food !== null);
  }

  async setApprovalStatus(params: {
    doctorId: string;
    patientId: string;
    foodId: string;
    status: ApprovalStatus;
    remarks?: string;
  }): Promise<DoctorFoodApproval> {
    const patient = await this.patientRepo.findById(params.patientId);
    if (!patient) {
      throw new AppError(404, ErrorCode.NOT_FOUND, `Patient ${params.patientId} does not exist`);
    }

    const food = await this.foodRepo.findById(params.foodId);
    if (!food) {
      throw new AppError(404, ErrorCode.NOT_FOUND, `Food item ${params.foodId} does not exist`);
    }

    const now = new Date();
    const existing = await this.approvalRepo.findByPatientAndFood(params.patientId, params.foodId);

    const approval: DoctorFoodApproval = {
      id: existing ? existing.id : `dfa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      patientId: params.patientId,
      foodId: params.foodId,
      doctorId: params.doctorId,
      status: params.status,
      remarks: params.remarks,
      approvedAt: params.status === ApprovalStatus.APPROVED ? now : existing?.approvedAt,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    const saved = await this.approvalRepo.upsert(approval);

    // Audit Logging
    await this.auditLogService.log({
      userId: params.doctorId,
      action: params.status === ApprovalStatus.APPROVED ? 'Doctor approved food' : 'Doctor rejected food',
      entity: 'DoctorFoodApproval',
      entityId: saved.id,
      metadata: {
        patientId: params.patientId,
        foodId: params.foodId,
        status: params.status,
        remarks: params.remarks,
      },
    });

    // Notify patient
    const notifType = params.status === ApprovalStatus.APPROVED ? NotificationType.FOOD_APPROVED : NotificationType.FOOD_REJECTED;
    await this.notifService.notify({
      userId: patient.userId,
      type: notifType,
      title: `Dietary Order Update: ${food.name}`,
      message:
        params.status === ApprovalStatus.APPROVED
          ? `Dr. approved "${food.name}" for your meal plan.`
          : `"${food.name}" was marked not suitable for your current medical diet.`,
      metadata: { foodId: food.id, status: params.status },
    });

    return saved;
  }

  async patchApprovalStatus(params: {
    patientId: string;
    foodId: string;
    status?: ApprovalStatus;
    remarks?: string;
    doctorId: string;
  }): Promise<DoctorFoodApproval> {
    const existing = await this.approvalRepo.findByPatientAndFood(params.patientId, params.foodId);
    const status = params.status || existing?.status || ApprovalStatus.APPROVED;
    const remarks = params.remarks !== undefined ? params.remarks : existing?.remarks;
    return this.setApprovalStatus({
      patientId: params.patientId,
      foodId: params.foodId,
      status,
      remarks,
      doctorId: params.doctorId,
    });
  }

  async deleteApproval(patientId: string, foodId: string, doctorId: string = 'doc-1'): Promise<boolean> {
    const deleted = await this.approvalRepo.delete(patientId, foodId);
    await this.auditLogService.log({
      userId: doctorId,
      action: 'Doctor removed food approval',
      entity: 'DoctorFoodApproval',
      entityId: `${patientId}_${foodId}`,
      metadata: { patientId, foodId },
    });
    return deleted;
  }

  async deleteApprovalById(id: string, doctorId: string = 'doc-1'): Promise<boolean> {
    const deleted = await this.approvalRepo.deleteById(id);
    await this.auditLogService.log({
      userId: doctorId,
      action: 'Doctor removed food approval by id',
      entity: 'DoctorFoodApproval',
      entityId: id,
      metadata: { id },
    });
    return deleted;
  }
}
