import { Order, OrderFeedback } from '../types';
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
  },
};
