import { Request, Response, NextFunction } from 'express';
import { KitchenService } from '../services/kitchen.service.js';
import { OrderService } from '../services/order.service.js';
import { sendSuccess } from '../utils/response.js';
import { AvailabilityStatus } from '../constants/index.js';

export class KitchenController {
  constructor(
    private kitchenService = new KitchenService(),
    private orderService = new OrderService()
  ) {}

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = this.kitchenService.getKitchenStatus();
      sendSuccess(res, status, 200);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive, notes } = req.body;
      const updated = await this.kitchenService.updateKitchenStatus(
        isActive,
        notes,
        req.user?.userId
      );
      sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  };

  patchStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive, notes } = req.body;
      const updated = await this.kitchenService.patchKitchenStatus(
        { isActive, notes },
        req.user?.userId
      );
      sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  };

  listAvailabilities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const list = await this.kitchenService.listAvailabilitiesForDate(date);
      sendSuccess(res, list, 200);
    } catch (err) {
      next(err);
    }
  };

  createAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const saved = await this.kitchenService.createAvailability({
        ...req.body,
        createdBy: req.user?.userId,
      });
      sendSuccess(res, saved, 201);
    } catch (err) {
      next(err);
    }
  };

  listOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await this.orderService.listOrdersForKitchen();
      sendSuccess(res, orders, 200);
    } catch (err) {
      next(err);
    }
  };

  getOrderPrepSheet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prepSheet = await this.orderService.getKitchenPrepSheet(req.params.orderId);
      sendSuccess(res, prepSheet, 200);
    } catch (err) {
      next(err);
    }
  };

  toggleAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetId = req.params.id;
      const updated = await this.kitchenService.updateAvailabilityStatus(
        targetId,
        (req.body.status as any) || AvailabilityStatus.ACTIVE,
        req.user?.userId
      );
      sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  };

  patchAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetId = req.params.id;
      const updated = await this.kitchenService.patchAvailability(
        targetId,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  };

  deleteAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetId = req.params.id;
      await this.kitchenService.deleteAvailability(targetId, req.user?.userId);
      sendSuccess(res, { success: true, message: 'Availability schedule deleted successfully' }, 200);
    } catch (err) {
      next(err);
    }
  };
}
