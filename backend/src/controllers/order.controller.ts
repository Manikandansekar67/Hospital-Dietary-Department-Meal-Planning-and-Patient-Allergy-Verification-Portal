import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';
import { sendSuccess } from '../utils/response.js';
import { Role } from '../constants/index.js';

export class OrderController {
  constructor(private orderService = new OrderService()) {}

  getAvailableFoods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = (req.query.patientId as string) || req.user?.patientId;
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required' } });
        return;
      }
      const foods = await this.orderService.getAvailableFoodsForPatient(patientId);
      sendSuccess(res, foods, 200);
    } catch (err) {
      next(err);
    }
  };

  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let patientId = req.body.patientId;
      if (req.user?.role === Role.PATIENT && req.user.patientId) {
        patientId = req.user.patientId;
      }
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required to place an order' } });
        return;
      }

      const order = await this.orderService.createOrder({
        patientId,
        foodId: req.body.foodId,
        specialInstructions: req.body.specialInstructions,
      });

      sendSuccess(res, order, 201);
    } catch (err) {
      next(err);
    }
  };

  getPatientOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = (req.query.patientId as string) || req.user?.patientId;
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required' } });
        return;
      }
      const orders = await this.orderService.listOrdersForPatient(patientId);
      sendSuccess(res, orders, 200);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, notes } = req.body;
      const changedBy = req.user?.userId || 'kitchen-staff';
      const order = await this.orderService.updateOrderStatus(
        req.params.id,
        status,
        changedBy,
        notes
      );
      sendSuccess(res, order, 200);
    } catch (err) {
      next(err);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      if (!order) {
        res.status(404).json({ success: false, error: { message: 'Order not found' } });
        return;
      }
      sendSuccess(res, order, 200);
    } catch (err) {
      next(err);
    }
  };

  patchOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = req.user?.userId;
      const order = await this.orderService.patchOrder(req.params.id, req.body, actorId);
      sendSuccess(res, order, 200);
    } catch (err) {
      next(err);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = req.user?.userId;
      const reason = req.body?.reason || (req.query?.reason as string) || 'Cancelled by user';
      await this.orderService.cancelOrder(req.params.id, actorId, reason);
      sendSuccess(res, { success: true, message: 'Order cancelled/deleted successfully' }, 200);
    } catch (err) {
      next(err);
    }
  };
}
