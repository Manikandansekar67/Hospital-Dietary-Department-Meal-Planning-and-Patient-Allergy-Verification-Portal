import { AppNotification } from '../types';
<<<<<<< HEAD
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
=======
import { delay } from './apiService';
import { storageService } from './storageService';

export const notificationService = {
  getNotifications: async (userRole?: string, userId?: string): Promise<AppNotification[]> => {
    await delay(100);
    const notifs = storageService.getNotifications();
    if (!userRole) return notifs;

    return notifs.filter((n) => {
      if (n.targetRole === 'all' || !n.targetRole) return true;
      if (n.targetRole === userRole) {
        if (n.targetUserId && userId && n.targetUserId !== userId) {
          return false;
        }
        return true;
      }
      return false;
    });
  },

  markAsRead: async (id: string): Promise<void> => {
    const notifs = storageService.getNotifications();
    const index = notifs.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifs[index].read = true;
      storageService.saveNotifications(notifs);
    }
  },

  markAllAsRead: async (): Promise<void> => {
    const notifs = storageService.getNotifications();
    notifs.forEach((n) => (n.read = true));
    storageService.saveNotifications(notifs);
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },
};
