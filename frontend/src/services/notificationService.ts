import { AppNotification } from '../types';
import { apiClient } from './apiService';

export const notificationService = {
  getNotifications: async (_userRole?: string, _userId?: string): Promise<AppNotification[]> => {
    try {
      const token = localStorage.getItem('hdmp_token');
      if (!token) return [];

      const res = await apiClient.get('/notifications');
      const list = res.data.data || [];
      return list.map((n: any) => ({
        id: n.id,
        type: (n.type || 'recommendation').toLowerCase(),
        title: n.title,
        message: n.message,
        timestamp: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
        read: !!n.isRead,
        targetRole: 'all',
        priority: 'normal',
      }));
    } catch {
      return [];
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch {}
  },

  markAllAsRead: async (): Promise<void> => {
    const notifs = await notificationService.getNotifications();
    await Promise.all(
      notifs.filter((n) => !n.read).map((n) => notificationService.markAsRead(n.id))
    );
  },

  deleteNotification: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch {}
  },

  clearAll: async (): Promise<void> => {
    try {
      await apiClient.delete('/notifications');
    } catch {}
  },
};
