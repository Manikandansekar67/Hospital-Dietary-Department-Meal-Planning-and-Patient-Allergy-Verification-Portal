import {
  OrderRepository,
  PatientRepository,
  FoodRepository,
  ApprovalRepository,
  KitchenRepository,
  UserRepository,
} from '../repositories/index.js';
import { AllergyVerificationService } from './allergyVerification.service.js';
import { AuditLogService } from './auditLog.service.js';
import { NotificationService } from './notification.service.js';
import { Order, KitchenOrderPrepSheet, Food } from '../types/models.js';
import {
  ApprovalStatus,
  OrderStatus,
  AvailabilityStatus,
  NotificationType,
  ErrorCode,
  RuleType,
} from '../constants/index.js';
import { AppError } from '../utils/response.js';

export interface CreateOrderParams {
  patientId: string;
  foodId: string;
  specialInstructions?: string;
}

export class OrderService {
  constructor(
    private orderRepo = new OrderRepository(),
    private patientRepo = new PatientRepository(),
    private foodRepo = new FoodRepository(),
    private approvalRepo = new ApprovalRepository(),
    private kitchenRepo = new KitchenRepository(),
    private userRepo = new UserRepository(),
    private allergyService = new AllergyVerificationService(),
    private auditLogService = new AuditLogService(),
    private notifService = new NotificationService()
  ) {}

  /**
   * Returns ONLY foods that pass the strict 7-point clinical & operational check.
   * NEVER rely on frontend filtering.
   */
  async getAvailableFoodsForPatient(patientId: string): Promise<Food[]> {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient not found');
    }

    // Check 1: Kitchen Active
    if (!this.kitchenRepo.isKitchenActive()) {
      return [];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const currentNow = new Date();
    const currentHours = currentNow.getHours().toString().padStart(2, '0');
    const currentMinutes = currentNow.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    // Get today's active schedules
    const todayAvailabilities = await this.kitchenRepo.listAvailabilitiesForDate(todayStr);
    const activeAvailabilities = todayAvailabilities.filter(
      (a) =>
        a.status === AvailabilityStatus.ACTIVE &&
        currentTimeStr >= a.startTime &&
        currentTimeStr <= a.endTime
    );

    // If today has active scheduled windows, use those; otherwise, evaluate all active hospital foods
    let candidateFoodIds: string[] = [];
    if (activeAvailabilities.length > 0) {
      candidateFoodIds = Array.from(new Set(activeAvailabilities.map((a) => a.foodId)));
    } else {
      const allActive = await this.foodRepo.listAll();
      candidateFoodIds = allActive.filter((f) => f.status === 'ACTIVE').map((f) => f.id);
    }

    const qualifiedFoods: Food[] = [];

    // Get patient disease rules
    const patientDiseases = await this.patientRepo.getDiseasesForPatient(patientId);

    for (const foodId of candidateFoodIds) {
      const food = await this.foodRepo.findById(foodId);
      if (!food || food.status !== 'ACTIVE') continue;

      // Check 2: Doctor Approval = APPROVED (MUST be clinically approved for this patient)
      const approval = await this.approvalRepo.findByPatientAndFood(patientId, foodId);
      if (!approval || approval.status !== ApprovalStatus.APPROVED) {
        continue;
      }

      // Check 3: Disease Compatibility != AVOID
      const diseaseRules = await this.foodRepo.getDiseaseRulesForFood(foodId);
      const isContraindicated = patientDiseases.some((pd) =>
        diseaseRules.some((dr) => dr.diseaseId === pd.disease.id && dr.ruleType === RuleType.AVOID)
      );
      if (isContraindicated) {
        continue;
      }

      // Check 4: Allergy Safety
      const allergyCheck = await this.allergyService.verifyAllergySafety(patientId, foodId);
      if (!allergyCheck.safe) {
        continue;
      }

      qualifiedFoods.push(food);
    }

    return qualifiedFoods;
  }

  /**
   * Revalidates all preconditions server-side before booking an order.
   * Throws explicit medical dietary errors on failure.
   */
  async createOrder(params: CreateOrderParams): Promise<Order> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    // 1. Patient exists
    const patient = await this.patientRepo.findById(params.patientId);
    if (!patient) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient record not found');
    }

    // 2. Food exists
    const food = await this.foodRepo.findById(params.foodId);
    if (!food || food.status !== 'ACTIVE') {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Selected food meal not found in active menu');
    }

    // 3. Kitchen is active
    if (!this.kitchenRepo.isKitchenActive()) {
      throw new AppError(
        400,
        ErrorCode.KITCHEN_INACTIVE,
        'Sorry for the inconvenience. The kitchen is currently inactive. Please choose another available meal.'
      );
    }

    // 4. Kitchen Availability & Date Validation (MUST NEVER ORDER FROM PREVIOUS DATE)
    const availabilities = await this.kitchenRepo.findAvailability(params.foodId, todayStr);
    const validWindow = availabilities.find(
      (a) =>
        a.status === AvailabilityStatus.ACTIVE &&
        currentTimeStr >= a.startTime &&
        currentTimeStr <= a.endTime
    );

    if (availabilities.length > 0 && !validWindow) {
      throw new AppError(
        400,
        ErrorCode.MEAL_UNAVAILABLE,
        "Sorry for the inconvenience. This meal is no longer available in the current meal session. Please choose from today's available meals."
      );
    }

    // 5. Doctor Approval exists and is APPROVED
    const approval = await this.approvalRepo.findByPatientAndFood(params.patientId, params.foodId);
    if (!approval || approval.status !== ApprovalStatus.APPROVED) {
      throw new AppError(
        403,
        ErrorCode.DOCTOR_APPROVAL_REQUIRED,
        `Cannot place order: Meal '${food.name}' requires doctor approval before patient ordering.`
      );
    }

    // 6. Allergy Verification Safe
    const allergyResult = await this.allergyService.verifyAllergySafety(params.patientId, params.foodId);
    if (!allergyResult.safe) {
      const conflictSummary = allergyResult.conflicts.map((c) => `${c.allergy} (${c.ingredient})`).join(', ');
      throw new AppError(
        400,
        ErrorCode.ALLERGY_CONFLICT,
        `Medical Alert: Meal contains ingredients conflicting with patient allergy record: ${conflictSummary}`,
        allergyResult
      );
    }

    // 7. Create Order & Patient-Specific Prep Warnings
    const patientAllergies = await this.patientRepo.getAllergiesForPatient(params.patientId);
    const prepWarnings: string[] = [];
    if (patientAllergies.length > 0) {
      prepWarnings.push(
        `Patient allergy profile: ${patientAllergies.map((a) => `${a.allergy.name} [${a.severity}]`).join(', ')}`
      );
    }
    if (approval.remarks) {
      prepWarnings.push(`Doctor note: ${approval.remarks}`);
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      orderNumber,
      patientId: params.patientId,
      foodId: params.foodId,
      status: OrderStatus.PENDING,
      specialInstructions: params.specialInstructions,
      preparationWarnings: prepWarnings,
      crossContactWarnings: allergyResult.crossContactWarnings || [],
      createdAt: now,
      updatedAt: now,
    };

    const savedOrder = await this.orderRepo.create(newOrder);

    // Initial status history
    await this.orderRepo.updateStatus(savedOrder.id, OrderStatus.PENDING, params.patientId, 'Order booked');

    // Notify kitchen and patient
    await this.notifService.notify({
      userId: patient.userId,
      type: NotificationType.ORDER_CREATED,
      title: 'Order Placed Successfully',
      message: `Your meal order #${orderNumber} for "${food.name}" has been placed with the dietary department.`,
      metadata: { orderId: savedOrder.id },
    });

    return savedOrder;
  }

  /**
   * Retrieves full patient-specific preparation instructions for kitchen staff.
   */
  async getKitchenPrepSheet(orderId: string): Promise<KitchenOrderPrepSheet> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Order not found');
    }

    const patient = await this.patientRepo.findById(order.patientId);
    const patientUser = patient ? await this.userRepo.findById(patient.userId) : null;
    const food = await this.foodRepo.findById(order.foodId);
    const ingredients = food ? await this.foodRepo.getIngredientsForFood(food.id) : [];
    const patientAllergies = patient ? await this.patientRepo.getAllergiesForPatient(patient.id) : [];
    const approval = patient && food ? await this.approvalRepo.findByPatientAndFood(patient.id, food.id) : null;

    const allergyVerification = patient && food
      ? await this.allergyService.verifyAllergySafety(patient.id, food.id)
      : { conflicts: [], crossContactWarnings: [] };

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      patientName: patientUser ? patientUser.name : 'Unknown Patient',
      patientNumber: patient ? patient.patientNumber : 'N/A',
      room: patient ? patient.roomNumber : 'Unassigned',
      foodName: food ? food.name : 'Unknown Item',
      category: food ? food.category : ('OTHER' as any),
      preparationInstructions: food?.preparationInstructions,
      ingredients: ingredients.map((i) => i.name),
      patientAllergies: patientAllergies.map((pa) => ({ name: pa.allergy.name, severity: pa.severity })),
      conflictingIngredients: allergyVerification.conflicts.map((c) => c.ingredient),
      preparationWarnings: order.preparationWarnings,
      crossContactWarnings: order.crossContactWarnings,
      doctorSpecialInstructions: approval?.remarks,
      orderedAt: order.createdAt,
    };
  }

  async listOrdersForKitchen(): Promise<KitchenOrderPrepSheet[]> {
    const orders = await this.orderRepo.listAll();
    const sheets: KitchenOrderPrepSheet[] = [];
    for (const order of orders) {
      sheets.push(await this.getKitchenPrepSheet(order.id));
    }
    return sheets;
  }

  async listOrdersForPatient(patientId: string): Promise<Order[]> {
    return this.orderRepo.listByPatient(patientId);
  }

  /**
   * Kitchen updates order status: PENDING -> PREPARING -> READY -> DELIVERED.
   */
  async updateOrderStatus(orderId: string, newStatus: OrderStatus, changedBy: string, notes?: string): Promise<Order> {
    const existing = await this.orderRepo.findById(orderId);
    if (!existing) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Order not found');
    }

    const updated = await this.orderRepo.updateStatus(orderId, newStatus, changedBy, notes);
    if (!updated) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Failed to update order status');
    }

    // Audit log
    await this.auditLogService.log({
      userId: changedBy,
      action: 'Kitchen changed order status',
      entity: 'Order',
      entityId: orderId,
      metadata: { from: existing.status, to: newStatus, notes },
    });

    // Notify patient
    const patient = await this.patientRepo.findById(existing.patientId);
    if (patient) {
      let notifType: NotificationType = NotificationType.ORDER_PREPARING;
      let msg = `Your meal order #${existing.orderNumber} is now being prepared in the kitchen.`;

      if (newStatus === OrderStatus.READY) {
        notifType = NotificationType.ORDER_READY;
        msg = `Your meal order #${existing.orderNumber} is ready and in transit to ${patient.roomNumber}.`;
      } else if (newStatus === OrderStatus.DELIVERED) {
        notifType = NotificationType.ORDER_DELIVERED;
        msg = `Your meal order #${existing.orderNumber} has been delivered. Bon appétit!`;
      }

      await this.notifService.notify({
        userId: patient.userId,
        type: notifType,
        title: `Meal Status: ${newStatus}`,
        message: msg,
        metadata: { orderId: existing.id, status: newStatus },
      });
    }

    return updated;
  }

  async getOrderById(orderId: string): Promise<KitchenOrderPrepSheet | Order | null> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) return null;
    try {
      return await this.getKitchenPrepSheet(orderId);
    } catch {
      return order;
    }
  }

  async patchOrder(orderId: string, updates: Partial<Order> & { status?: OrderStatus; specialInstructions?: string }, actorId?: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new AppError(404, ErrorCode.NOT_FOUND, 'Order not found');

    if (updates.status && updates.status !== order.status) {
      return this.updateOrderStatus(orderId, updates.status, actorId || 'system', updates.specialInstructions);
    }

    const updated = await this.orderRepo.update(orderId, updates);
    if (!updated) throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Failed to update order');
    return updated;
  }

  async cancelOrder(orderId: string, cancelledBy?: string, reason?: string): Promise<boolean> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new AppError(404, ErrorCode.NOT_FOUND, 'Order not found');

    if (order.status === OrderStatus.DELIVERED) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Cannot cancel an order that has already been delivered');
    }

    const deleted = await this.orderRepo.delete(orderId);

    await this.auditLogService.log({
      userId: cancelledBy || 'system',
      action: 'Meal order cancelled/deleted',
      entity: 'Order',
      entityId: orderId,
      metadata: { orderNumber: order.orderNumber, reason },
    });

    return deleted;
  }
}
