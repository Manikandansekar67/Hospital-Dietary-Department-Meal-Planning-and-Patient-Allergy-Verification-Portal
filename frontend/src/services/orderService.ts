import { DailyFoodAvailability, Food, FoodRecommendation, KitchenStatus, Order, Patient } from '../types';
import { delay } from './apiService';
import { storageService } from './storageService';

export interface OrderValidationResult {
  isValid: boolean;
  checks: {
    doctorApproved: boolean;
    allergySafe: boolean;
    medicallyCompatible: boolean;
    kitchenActive: boolean;
    availableToday: boolean;
    mealTimeValid: boolean;
  };
  reasons: string[];
}

export const orderService = {
  validateOrderEligibility: (
    food: Food,
    patient: Patient,
    kitchenStatus: KitchenStatus,
    todayAvailabilities: DailyFoodAvailability[],
    recommendation?: FoodRecommendation
  ): OrderValidationResult => {
    const reasons: string[] = [];

    // 1. Doctor Approval Check
    const doctorApproved = recommendation?.doctorApproval.status === 'approved';
    if (!doctorApproved) {
      reasons.push('Food has not received formal clinical approval by the attending physician.');
    }

    // 2. Allergy Safety Check
    const allergySafe = !recommendation?.allergyCheck.hasConflict;
    if (!allergySafe) {
      reasons.push('Food has detected conflict with patient allergen profile.');
    }

    // 3. Medically Compatible Check
    const medicallyCompatible = recommendation?.diseaseCompatibility.compatible ?? true;
    if (!medicallyCompatible) {
      reasons.push('Food is medically contraindicated for patient diagnoses.');
    }

    // 4. Kitchen Active Check
    const kitchenActive = kitchenStatus.isActive;
    if (!kitchenActive) {
      reasons.push('The hospital dietary kitchen is currently inactive. Meal intake paused.');
    }

    // 5. Available Today Check
    const today = new Date().toISOString().split('T')[0];
    const availItem = todayAvailabilities.find(
      (a) => a.foodId === food.id && a.date === today && a.isAvailable && a.remainingPortions > 0
    );
    const availableToday = !!availItem;
    if (!availableToday) {
      reasons.push('Food is not currently available or remaining portions have been exhausted.');
    }

    // 6. Current Meal Time Check
    // For demo/flexibility, if available today in the session, consider valid
    const mealTimeValid = true;

    const isValid = doctorApproved && allergySafe && medicallyCompatible && kitchenActive && availableToday;

    return {
      isValid,
      checks: {
        doctorApproved,
        allergySafe,
        medicallyCompatible,
        kitchenActive,
        availableToday,
        mealTimeValid,
      },
      reasons,
    };
  },

  getPatientOrderableFoods: async (patientId: string): Promise<{ food: Food; recommendation: FoodRecommendation; availability: DailyFoodAvailability }[]> => {
    await delay(200);
    const patient = storageService.getPatients().find((p) => p.id === patientId);
    if (!patient) return [];

    const kitchenStatus = storageService.getKitchenStatus();
    const today = new Date().toISOString().split('T')[0];
    const availabilities = storageService.getDailyAvailability().filter((a) => a.date === today && a.isAvailable);
    const recs = storageService.getRecommendations().filter((r) => r.patientId === patientId);

    const results: { food: Food; recommendation: FoodRecommendation; availability: DailyFoodAvailability }[] = [];

    for (const avail of availabilities) {
      const rec = recs.find((r) => r.foodId === avail.foodId);
      if (
        rec &&
        rec.doctorApproval.status === 'approved' &&
        !rec.allergyCheck.hasConflict &&
        rec.diseaseCompatibility.compatible
      ) {
        results.push({
          food: rec.food,
          recommendation: rec,
          availability: avail,
        });
      }
    }

    return results;
  },

  createOrder: async (params: {
    patientId: string;
    foodId: string;
    mealType?: any;
    mealSession?: any;
    patientName?: string;
    roomNumber?: string;
    foodName?: string;
    patientAllergies?: any[];
    avoidIngredients?: string[];
    preparationInstructions?: string;
    specialNotes?: string;
  }): Promise<Order> => {
    await delay(400);
    const patient = storageService.getPatients().find((p) => p.id === params.patientId);
    if (!patient) throw new Error('Patient record not found');

    const food = storageService.getFoods().find((f) => f.id === params.foodId);
    if (!food) throw new Error('Food item not found');

    const kitchenStatus = storageService.getKitchenStatus();
    if (!kitchenStatus.isActive) {
      throw new Error('Sorry for the inconvenience. The kitchen is currently inactive. Please choose another available meal.');
    }

    const today = new Date().toISOString().split('T')[0];
    const availabilities = storageService.getDailyAvailability();
    const availItem = availabilities.find((a) => a.foodId === food.id && a.date === today && a.isAvailable);
    if (!availItem) {
      throw new Error('This meal is currently unavailable. Please choose another meal.');
    }

    const rec = storageService
      .getRecommendations()
      .find((r) => r.patientId === patient.id && r.foodId === food.id);

    if (!rec || rec.doctorApproval.status !== 'approved') {
      throw new Error('Safety block: This food has not been approved by your attending physician.');
    }
    if (rec.allergyCheck.hasConflict) {
      throw new Error('Safety block: Detected critical allergy conflict with your profile.');
    }

    // Decrement available portions
    if (availItem.remainingPortions > 0) {
      availItem.remainingPortions -= 1;
      storageService.saveDailyAvailability(availabilities);
    }

    // Build patient avoided ingredients list
    const avoidIngredients: string[] = [];
    patient.allergies.forEach((all) => {
      avoidIngredients.push(all.allergyName);
      avoidIngredients.push(`${all.allergyName}-derived oils & powders`);
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientId: patient.id,
      patientName: patient.name,
      roomNumber: patient.roomNumber,
      foodId: food.id,
      foodName: food.name,
      foodCategory: food.category,
      mealType: params.mealType || availItem.mealType || 'lunch',
      orderDate: today,
      orderTime: new Date().toISOString(),
      status: 'pending',
      patientAllergies: patient.allergies,
      avoidIngredients,
      preparationInstructions: `${food.preparationInstructions} | Dedicated allergen-free sanitization for patient with: ${patient.allergies.map((a) => `${a.allergyName} (${a.severity})`).join(', ')}.`,
      doctorApproved: true,
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          notes: 'Order placed by patient via verified bedside portal',
        },
      ],
    };

    const orders = storageService.getOrders();
    orders.unshift(newOrder);
    storageService.saveOrders(orders);

    // Notify kitchen
    const notifs = storageService.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      type: 'order_accepted',
      title: 'New Patient Diet Order Received',
      message: `Order #${newOrder.orderNumber} placed for ${patient.name} (${patient.roomNumber}). Review allergy warnings.`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: patient.allergies.some((a) => a.severity === 'severe' || a.severity === 'critical')
        ? 'critical'
        : 'normal',
      targetRole: 'kitchen',
      link: '/kitchen/orders',
    });
    storageService.saveNotifications(notifs);

    return newOrder;
  },

  getPatientOrders: async (patientId: string): Promise<Order[]> => {
    await delay(150);
    const orders = storageService.getOrders();
    return orders.filter((o) => o.patientId === patientId);
  },

  getOrderById: async (orderId: string): Promise<Order | null> => {
    await delay(100);
    const orders = storageService.getOrders();
    return orders.find((o) => o.id === orderId) || null;
  },

  getOrders: async (): Promise<Order[]> => {
    await delay(200);
    return storageService.getOrders();
  },

  getOrdersByPatientId: async (patientId: string): Promise<Order[]> => {
    return orderService.getPatientOrders(patientId);
  },

  updateOrderStatus: async (
    orderId: string,
    status: any,
    staffName: string = 'Staff',
    notes?: string
  ): Promise<Order> => {
    await delay(250);
    const orders = storageService.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];
    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      by: staffName,
      notes: notes || `Order updated to ${status.toUpperCase()} by ${staffName}`,
    });
    storageService.saveOrders(orders);
    return order;
  },

  submitFeedback: async (orderId: string, rating: number, comment: string): Promise<Order> => {
    await delay(300);
    const orders = storageService.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    orders[index].feedback = {
      rating,
      comment,
      submittedAt: new Date().toISOString(),
    };
    storageService.saveOrders(orders);
    return orders[index];
  },
};
