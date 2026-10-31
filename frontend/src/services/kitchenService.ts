import { DailyFoodAvailability, KitchenStatus, Order, OrderStatus } from '../types';
import { apiClient } from './apiService';

export const kitchenService = {
  getKitchenStatus: async (): Promise<KitchenStatus> => {
    const res = await apiClient.get('/kitchen/status');
    const data = res.data.data;
    const nowHour = new Date().getHours();
    let session = 'lunch';
    if (nowHour >= 6 && nowHour < 11) session = 'breakfast';
    else if (nowHour >= 11 && nowHour < 16) session = 'lunch';
    else if (nowHour >= 16 && nowHour < 22) session = 'dinner';
    else session = 'snacks';

    return {
      isActive: data.isActive,
      activeSession: session as any,
      date: new Date().toISOString().split('T')[0],
      announcement: data.notes || (data.isActive ? 'Central Dietary Kitchen is ACTIVE' : 'Kitchen meal intake is currently INACTIVE'),
      lastToggledBy: 'Staff',
      lastToggledAt: new Date().toISOString(),
    };
  },

  toggleKitchenStatus: async (isActive: boolean, staffName: string): Promise<KitchenStatus> => {
    const notes = isActive
      ? `Dietary Central Kitchen is ACTIVE. Toggled by ${staffName}.`
      : `Kitchen meal intake is currently INACTIVE for sanitation / shift changeover by ${staffName}.`;

    const res = await apiClient.put('/kitchen/status', { isActive, notes });
    const data = res.data.data;
    return {
      isActive: data.isActive,
      activeSession: 'lunch',
      date: new Date().toISOString().split('T')[0],
      announcement: data.notes,
      lastToggledBy: staffName,
      lastToggledAt: new Date().toISOString(),
    };
  },

  getDailyAvailability: async (date?: string): Promise<DailyFoodAvailability[]> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const res = await apiClient.get(`/kitchen/availabilities?date=${targetDate}`);
    const list = res.data.data || [];
    const foodsRes = await apiClient.get('/foods');
    const foods = foodsRes.data.data || [];

    return list.map((a: any) => {
      const food = foods.find((f: any) => f.id === a.foodId);
      return {
        id: a.id,
        foodId: a.foodId,
        foodName: food ? food.name : 'Dietary Food Option',
        category: food ? food.category : 'Lunch',
        date: a.date,
        mealType: (a.mealType || 'lunch').toLowerCase(),
        startTime: a.startTime || '06:00',
        endTime: a.endTime || '23:59',
        isAvailable: a.status === 'ACTIVE',
        totalPortions: 50,
        remainingPortions: 45,
      };
    });
  },

  getAllDailyAvailabilities: async (): Promise<DailyFoodAvailability[]> => {
    return kitchenService.getDailyAvailability();
  },

  toggleFoodAvailability: async (id: string): Promise<DailyFoodAvailability> => {
    const list = await kitchenService.getAllDailyAvailabilities();
    const item = list.find((a) => a.id === id);
    const newStatus = item?.isAvailable ? 'INACTIVE' : 'ACTIVE';

    await apiClient.put(`/kitchen/availabilities/${id}`, { status: newStatus });
    if (item) {
      item.isAvailable = !item.isAvailable;
      return item;
    }
    return list[0];
  },

  addAvailabilityRecord: async (
    data: Omit<DailyFoodAvailability, 'id'>
  ): Promise<DailyFoodAvailability> => {
    const validMealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
    const rawMeal = (data.mealType || 'LUNCH').toUpperCase();
    const mealType = validMealTypes.includes(rawMeal) ? rawMeal : 'LUNCH';

    const res = await apiClient.post('/kitchen/availabilities', {
      foodId: data.foodId,
      date: data.date,
      mealType,
      startTime: data.startTime || '06:00',
      endTime: data.endTime || '23:59',
      status: 'ACTIVE',
    });

    const saved = res.data.data;
    return {
      id: saved.id,
      foodId: saved.foodId,
      foodName: data.foodName,
      category: data.category,
      date: saved.date,
      mealType: data.mealType,
      startTime: saved.startTime,
      endTime: saved.endTime,
      isAvailable: true,
      totalPortions: data.totalPortions || 50,
      remainingPortions: data.remainingPortions || 50,
    };
  },

  addFoodAvailability: async (data: any): Promise<DailyFoodAvailability> => {
    return kitchenService.addAvailabilityRecord({
      foodId: data.foodId,
      foodName: data.foodName || 'Food Item',
      category: data.category || data.foodCategory || 'Lunch',
      date: data.date || new Date().toISOString().split('T')[0],
      mealType: (data.mealType || data.mealSession || 'lunch').toLowerCase(),
      startTime: data.startTime || '06:00',
      endTime: data.endTime || '23:59',
      isAvailable: true,
      totalPortions: data.totalPortions || 50,
      remainingPortions: data.remainingPortions || 50,
    });
  },

  getKitchenOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get('/kitchen/orders');
    const rawOrders = res.data.data || [];
    const foodsRes = await apiClient.get('/foods');
    const foods = foodsRes.data.data || [];
    const patientsRes = await apiClient.get('/doctor/patients');
    const patients = patientsRes.data.data || [];

    return rawOrders.map((o: any) => {
      const food = foods.find((f: any) => f.id === o.foodId);
      const patient = patients.find((p: any) => p.id === o.patientId);

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        patientId: o.patientId,
        patientName: patient ? patient.name : `Patient ${o.patientId}`,
        roomNumber: patient ? patient.roomNumber : 'Room 101',
        foodId: o.foodId,
        foodName: food ? food.name : 'Clinical Meal',
        foodCategory: food ? food.category : 'Lunch',
        mealType: 'lunch' as const,
        orderDate: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '2026-10-10',
        orderTime: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        status: (o.status || 'pending').toLowerCase() as OrderStatus,
        patientAllergies: patient ? patient.allergies : [],
        avoidIngredients: o.preparationWarnings || [],
        preparationInstructions: o.specialInstructions || 'Strict allergen isolation mandatory during preparation',
        doctorApproved: true,
        timeline: [
          {
            status: (o.status || 'pending').toLowerCase() as OrderStatus,
            timestamp: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
            notes: 'Order status: ' + o.status,
          },
        ],
      };
    });
  },

  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus,
    staffName: string,
    notes?: string
  ): Promise<Order> => {
    await apiClient.put(`/orders/${orderId}/status`, {
      status: status.toUpperCase(),
      notes: notes || `Order updated to ${status.toUpperCase()} by ${staffName}`,
    });

    const orders = await kitchenService.getKitchenOrders();
    return orders.find((o) => o.id === orderId) || orders[0];
  },

  deleteAvailability: async (id: string): Promise<void> => {
    await apiClient.delete(`/kitchen/availabilities/${id}`);
  },

  patchKitchenStatus: async (params: { isActive?: boolean; notes?: string }): Promise<void> => {
    await apiClient.patch('/kitchen/status', params);
  },
};
