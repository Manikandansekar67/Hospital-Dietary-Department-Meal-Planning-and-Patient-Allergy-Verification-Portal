import { NotificationRepository } from '../repositories/index.js';
import { Notification } from '../types/models.js';
import { NotificationType } from '../constants/index.js';

export class NotificationService {
  constructor(private notifRepo = new NotificationRepository()) {}

  async notify(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      isRead: false,
      metadata: params.metadata,
      createdAt: new Date(),
    };
    return this.notifRepo.create(notif);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notifRepo.listByUser(userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    return this.notifRepo.markAsRead(notificationId);
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    return this.notifRepo.delete(notificationId);
  }

  async clearAll(userId: string): Promise<void> {
    return this.notifRepo.deleteAll(userId);
  }
}
