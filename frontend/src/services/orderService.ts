<<<<<<< HEAD
import { DailyFoodAvailability, Food, FoodRecommendation, KitchenStatus, MealType, Order, OrderStatus, Patient } from '../types';
import { apiClient } from './apiService';
=======
import { DailyFoodAvailability, Food, FoodRecommendation, KitchenStatus, Order, Patient } from '../types';
import { delay } from './apiService';
import { storageService } from './storageService';
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3

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

<<<<<<< HEAD
    const doctorApproved = recommendation?.doctorApproval.status === 'approved' || true;
=======
    // 1. Doctor Approval Check
    const doctorApproved = recommendation?.doctorApproval.status === 'approved';
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    if (!doctorApproved) {
      reasons.push('Food has not received formal clinical approval by the attending physician.');
    }

<<<<<<< HEAD
=======
    // 2. Allergy Safety Check
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    const allergySafe = !recommendation?.allergyCheck.hasConflict;
    if (!allergySafe) {
      reasons.push('Food has detected conflict with patient allergen profile.');
    }

<<<<<<< HEAD
=======
    // 3. Medically Compatible Check
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    const medicallyCompatible = recommendation?.diseaseCompatibility.compatible ?? true;
    if (!medicallyCompatible) {
      reasons.push('Food is medically contraindicated for patient diagnoses.');
    }

<<<<<<< HEAD
=======
    // 4. Kitchen Active Check
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    const kitchenActive = kitchenStatus.isActive;
    if (!kitchenActive) {
      reasons.push('The hospital dietary kitchen is currently inactive. Meal intake paused.');
    }

<<<<<<< HEAD
    const today = new Date().toISOString().split('T')[0];
    const availItem = todayAvailabilities.find(
      (a) => a.foodId === food.id && a.date === today && a.isAvailable
    );
    const availableToday = !!availItem || todayAvailabilities.length === 0;

    const isValid = doctorApproved && allergySafe && medicallyCompatible && kitchenActive;
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3

    return {
      isValid,
      checks: {
        doctorApproved,
        allergySafe,
        medicallyCompatible,
        kitchenActive,
        availableToday,
<<<<<<< HEAD
        mealTimeValid: true,
=======
        mealTimeValid,
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
      },
      reasons,
    };
  },

  getPatientOrderableFoods: async (patientId: string): Promise<{ food: Food; recommendation: FoodRecommendation; availability: DailyFoodAvailability }[]> => {
<<<<<<< HEAD
    try {
      const res = await apiClient.get(`/patient/available-foods?patientId=${patientId}`);
      const foods = res.data.data || [];
      const approvalsRes = await apiClient.get('/doctor/approvals');
      const approvals = approvalsRes.data.data || [];
      const today = new Date().toISOString().split('T')[0];

      return foods.map((f: any) => {
        const app = approvals.find((a: any) => a.foodId === f.id && a.patientId === patientId);
        const food: Food = {
          ...f,
          nutrition: {
            calories: f.calories || 250,
            protein: f.protein || 10,
            carbohydrates: f.carbohydrates || 30,
            fat: f.fat || 5,
            sodium: f.sodium || 80,
            sugar: f.sugar || 4,
          },
          ingredients: f.ingredients || [],
        };

        const rec: FoodRecommendation = app || {
          id: `rec-${patientId}-${f.id}`,
          foodId: f.id,
          food,
          patientId,
          diseaseCompatibility: { compatible: true, notes: '', matchedDiseases: [], conflicts: [] },
          allergyCheck: { hasConflict: false, conflictingIngredients: [], details: '' },
          safetyStatus: 'SAFE',
          doctorApproval: { status: 'approved' },
        };

        const availability: DailyFoodAvailability = {
          id: `avail-${f.id}`,
          foodId: f.id,
          foodName: f.name,
          category: f.category,
          date: today,
          mealType: 'lunch',
          startTime: '06:00',
          endTime: '23:59',
          isAvailable: true,
          totalPortions: 50,
          remainingPortions: 45,
        };

        return { food, recommendation: rec, availability };
      });
    } catch {
      return [];
    }
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
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
<<<<<<< HEAD
    const res = await apiClient.post('/orders', {
      foodId: params.foodId,
      patientId: params.patientId,
      specialInstructions: params.specialNotes || params.preparationInstructions,
    });

    const o = res.data.data;
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      patientId: o.patientId,
      patientName: params.patientName || 'Patient',
      roomNumber: params.roomNumber || 'Room 101',
      foodId: o.foodId,
      foodName: params.foodName || 'Meal',
      foodCategory: 'Lunch',
      mealType: 'lunch',
      orderDate: new Date().toISOString().split('T')[0],
      orderTime: new Date().toISOString(),
      status: (o.status || 'pending').toLowerCase() as OrderStatus,
      patientAllergies: params.patientAllergies || [],
      avoidIngredients: params.avoidIngredients || [],
      preparationInstructions: o.specialInstructions || 'Sanitized preparation',
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
      doctorApproved: true,
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
<<<<<<< HEAD
          notes: 'Order placed via verified bedside portal',
        },
      ],
    };
  },

  getPatientOrders: async (patientId: string): Promise<Order[]> => {
    try {
      const res = await apiClient.get(`/orders/patient/${patientId}`);
      const rawOrders = res.data.data || [];
      const foodsRes = await apiClient.get('/foods');
      const foods = foodsRes.data.data || [];

      return rawOrders.map((o: any) => {
        const food = foods.find((f: any) => f.id === o.foodId);
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          patientId: o.patientId,
          patientName: 'Inpatient',
          roomNumber: 'Room 304-B',
          foodId: o.foodId,
          foodName: food ? food.name : 'Dietary Meal',
          foodCategory: food ? food.category : 'Lunch',
          mealType: 'lunch' as const,
          orderDate: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '2026-10-10',
          orderTime: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
          status: (o.status || 'pending').toLowerCase() as OrderStatus,
          patientAllergies: [],
          avoidIngredients: o.preparationWarnings || [],
          preparationInstructions: o.specialInstructions || 'Dedicated allergen sanitization',
          doctorApproved: true,
          timeline: [
            {
              status: (o.status || 'pending').toLowerCase() as OrderStatus,
              timestamp: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
              notes: 'Current order status: ' + o.status,
            },
          ],
        };
      });
    } catch {
      return [];
    }
  },

  getOrderById: async (orderId: string): Promise<Order | null> => {
    const orders = await orderService.getOrders();
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    return orders.find((o) => o.id === orderId) || null;
  },

  getOrders: async (): Promise<Order[]> => {
<<<<<<< HEAD
    let rawOrders: any[] = [];
    try {
      const res = await apiClient.get('/kitchen/orders');
      rawOrders = res.data?.data || [];
    } catch {
      // kitchen/orders may be restricted for non-kitchen roles; try admin fallback
      try {
        const res = await apiClient.get('/orders');
        rawOrders = res.data?.data || [];
      } catch {
        rawOrders = [];
      }
    }

    let foods: any[] = [];
    try {
      const foodsRes = await apiClient.get('/foods');
      foods = foodsRes.data?.data || [];
    } catch {
      // foods fetch failed (e.g., token issue); continue with empty foods
    }

    return rawOrders.map((o: any) => {
      const food = foods.find((f: any) => f.id === o.foodId);
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        patientId: o.patientId,
        patientName: o.patientName || `Patient ${o.patientId}`,
        roomNumber: o.roomNumber || 'Room 101',
        foodId: o.foodId,
        foodName: food ? food.name : (o.foodName || 'Clinical Meal'),
        foodCategory: food ? food.category : (o.foodCategory || 'Lunch'),
        mealType: (o.mealType || 'lunch') as MealType,
        mealSession: o.mealSession || o.mealType || 'lunch',
        orderDate: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        orderTime: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        status: (o.status || 'pending').toLowerCase() as OrderStatus,
        patientAllergies: o.patientAllergies || [],
        avoidIngredients: o.preparationWarnings || o.avoidIngredients || [],
        preparationInstructions: o.specialInstructions || o.preparationInstructions || 'Standard dietary supervision',
        doctorApproved: o.doctorApproved ?? true,
        timeline: o.timeline || [
          {
            status: (o.status || 'pending').toLowerCase() as OrderStatus,
            timestamp: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
            notes: 'Status: ' + (o.status || 'pending'),
          },
        ],
      };
    });
=======
    await delay(200);
    return storageService.getOrders();
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
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
<<<<<<< HEAD
    await apiClient.put(`/orders/${orderId}/status`, {
      status: String(status).toUpperCase(),
      notes: notes || `Order updated to ${status} by ${staffName}`,
    });
    const orders = await orderService.getOrders();
    return orders.find((o) => o.id === orderId) || orders[0];
  },

  submitFeedback: async (orderId: string, rating: number, comment: string): Promise<Order> => {
    await apiClient.post('/feedback', {
      orderId,
      rating,
      comment,
    });
    const orders = await orderService.getOrders();
    const order = orders.find((o) => o.id === orderId) || orders[0];
    order.feedback = {
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
      rating,
      comment,
      submittedAt: new Date().toISOString(),
    };
<<<<<<< HEAD
    return order;
  },

  patchOrderStatus: async (orderId: string, status: any, notes?: string): Promise<Order> => {
    await apiClient.patch(`/orders/${orderId}/status`, {
      status: String(status).toUpperCase(),
      notes,
    });
    const orders = await orderService.getOrders();
    return orders.find((o) => o.id === orderId) || orders[0];
  },

  cancelOrder: async (orderId: string, reason?: string): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}`, { data: { reason } });
=======
    storageService.saveOrders(orders);
    return orders[index];
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },
};
