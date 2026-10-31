import { Order, OrderFeedback } from '../types';
<<<<<<< HEAD
import { apiClient } from './apiService';
import { orderService } from './orderService';

export const feedbackService = {
  submitFeedback: async (orderId: string, rating: number, comment: string): Promise<Order> => {
    await apiClient.post('/feedback', {
      orderId,
      rating,
      comment,
    });
    return orderService.getOrderById(orderId) as any;
  },

  getAllFeedbacks: async (): Promise<{ order: Order; feedback: OrderFeedback }[]> => {
    try {
      const res = await apiClient.get('/feedback');
      const feedbacks = res.data.data || [];
      const orders = await orderService.getOrders();

      return feedbacks.map((fb: any) => {
        const order = orders.find((o) => o.id === fb.orderId) || {
          id: fb.orderId,
          orderNumber: 'ORD-2026-101',
          patientId: fb.patientId || 'pat-1',
          patientName: 'Inpatient',
          roomNumber: 'Room 304-B',
          foodId: 'food-1',
          foodName: 'Dietary Meal',
          foodCategory: 'Lunch',
          mealType: 'lunch' as const,
          orderDate: '2026-10-10',
          orderTime: new Date().toISOString(),
          status: 'delivered' as const,
          patientAllergies: [],
          avoidIngredients: [],
          preparationInstructions: 'Standard',
          doctorApproved: true,
          timeline: [],
        };

        const feedback: OrderFeedback = {
          rating: fb.rating,
          comment: fb.comment || '',
          submittedAt: fb.createdAt ? new Date(fb.createdAt).toISOString() : new Date().toISOString(),
        };

        return { order, feedback };
      });
    } catch {
      return [];
    }
=======
import { delay } from './apiService';
import { storageService } from './storageService';

export const feedbackService = {
  submitFeedback: async (orderId: string, rating: number, comment: string): Promise<Order> => {
    await delay(300);
    const orders = storageService.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const feedback: OrderFeedback = {
      rating,
      comment,
      submittedAt: new Date().toISOString(),
    };

    orders[index].feedback = feedback;
    storageService.saveOrders(orders);
    return orders[index];
  },

  getAllFeedbacks: async (): Promise<{ order: Order; feedback: OrderFeedback }[]> => {
    await delay(200);
    const orders = storageService.getOrders();
    return orders
      .filter((o) => o.feedback)
      .map((o) => ({ order: o, feedback: o.feedback! }));
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },
};
