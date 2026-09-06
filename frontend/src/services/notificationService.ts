import { AppNotification } from '../types';
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
  },
};
