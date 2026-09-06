import { DailyFoodAvailability, KitchenStatus, MealType, Order, OrderStatus } from '../types';
import { delay } from './apiService';
import { storageService } from './storageService';

export const kitchenService = {
  getKitchenStatus: async (): Promise<KitchenStatus> => {
    await delay(150);
    return storageService.getKitchenStatus();
  },

  toggleKitchenStatus: async (isActive: boolean, staffName: string): Promise<KitchenStatus> => {
    await delay(250);
    const current = storageService.getKitchenStatus();
    const updated: KitchenStatus = {
      ...current,
      isActive,
      lastToggledBy: staffName,
      lastToggledAt: new Date().toISOString(),
      announcement: isActive
        ? 'Dietary Central Kitchen is ACTIVE. Accepting approved patient meal orders.'
        : 'Kitchen meal intake is currently INACTIVE for deep cleaning / shift changeover.',
    };
    storageService.saveKitchenStatus(updated);

    // Broadcast system notification
    const notifs = storageService.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      type: isActive ? 'order_accepted' : 'kitchen_inactive',
      title: isActive ? 'Kitchen Service Activated' : 'Dietary Kitchen Status: INACTIVE',
      message: isActive
        ? 'Central kitchen is now online and processing inpatient dietary orders.'
        : 'The kitchen has paused meal intake. New meal ordering is temporarily halted.',
      timestamp: new Date().toISOString(),
      read: false,
      priority: isActive ? 'normal' : 'high',
      targetRole: 'all',
    });
    storageService.saveNotifications(notifs);

    return updated;
  },

  getDailyAvailability: async (date?: string): Promise<DailyFoodAvailability[]> => {
    await delay(200);
    const availabilities = storageService.getDailyAvailability();
    const targetDate = date || new Date().toISOString().split('T')[0];
    return availabilities.filter((a) => a.date === targetDate);
  },

  getAllDailyAvailabilities: async (): Promise<DailyFoodAvailability[]> => {
    await delay(200);
    return storageService.getDailyAvailability();
  },

  toggleFoodAvailability: async (id: string): Promise<DailyFoodAvailability> => {
    await delay(200);
    const list = storageService.getDailyAvailability();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Availability record not found');

    list[index].isAvailable = !list[index].isAvailable;
    storageService.saveDailyAvailability(list);
    return list[index];
  },

  addAvailabilityRecord: async (
    data: Omit<DailyFoodAvailability, 'id'>
  ): Promise<DailyFoodAvailability> => {
    await delay(250);
    const list = storageService.getDailyAvailability();
    const record: DailyFoodAvailability = {
      ...data,
      id: `avail-${Date.now()}`,
    };
    list.unshift(record);
    storageService.saveDailyAvailability(list);
    return record;
  },

  addFoodAvailability: async (data: any): Promise<DailyFoodAvailability> => {
    const recordData: Omit<DailyFoodAvailability, 'id'> = {
      foodId: data.foodId,
      foodName: data.foodName,
      category: data.category || data.foodCategory || 'Grains & Cereals',
      date: data.date,
      mealType: (data.mealType || data.mealSession || 'lunch').toLowerCase(),
      startTime: data.startTime || '12:00',
      endTime: data.endTime || '15:00',
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      totalPortions: data.totalPortions || data.maxPortions || 50,
      remainingPortions: data.remainingPortions !== undefined ? data.remainingPortions : 50,
    };
    return kitchenService.addAvailabilityRecord(recordData);
  },

  getKitchenOrders: async (): Promise<Order[]> => {
    await delay(250);
    return storageService.getOrders();
  },

  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus,
    staffName: string,
    notes?: string
  ): Promise<Order> => {
    await delay(300);
    const orders = storageService.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];
    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      by: staffName,
      notes: notes || `Order progressed to ${status.toUpperCase()} by ${staffName}`,
    });

    storageService.saveOrders(orders);

    // Notify patient
    const notifs = storageService.getNotifications();
    let notifType: any = 'order_preparing';
    let title = `Order Status: ${status.toUpperCase()}`;
    if (status === 'ready') {
      notifType = 'order_ready';
      title = 'Your Meal is Prepared and Inspected';
    } else if (status === 'delivered') {
      notifType = 'order_delivered';
      title = 'Meal Delivered to Your Room';
    }

    notifs.unshift({
      id: `notif-${Date.now()}`,
      type: notifType,
      title,
      message: `${order.foodName} for Room ${order.roomNumber} is now ${status}.`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
      targetRole: 'patient',
      targetUserId: order.patientId,
      link: '/patient/orders',
    });
    storageService.saveNotifications(notifs);

    return order;
  },
};
