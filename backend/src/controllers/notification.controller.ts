import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export class NotificationController {
  constructor(private notifService = new NotificationService()) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const notifications = await this.notifService.getUserNotifications(userId);
      sendSuccess(res, notifications, 200);
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.notifService.markAsRead(req.params.id);
      sendSuccess(res, { markedAsRead: true }, 200);
    } catch (err) {
      next(err);
    }
  };

  patchNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isRead = req.body?.isRead ?? true;
      if (isRead) {
        await this.notifService.markAsRead(req.params.id);
      }
      sendSuccess(res, { success: true, id: req.params.id, isRead }, 200);
    } catch (err) {
      next(err);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.notifService.deleteNotification(req.params.id);
      sendSuccess(res, { success: true, message: 'Notification deleted' }, 200);
    } catch (err) {
      next(err);
    }
  };

  clearAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      await this.notifService.clearAll(userId);
      sendSuccess(res, { success: true, message: 'All notifications cleared' }, 200);
    } catch (err) {
      next(err);
    }
  };
}
