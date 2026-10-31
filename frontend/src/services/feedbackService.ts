import { Order, OrderFeedback } from '../types';
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
  },
};
