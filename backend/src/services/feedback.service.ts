import { FeedbackRepository, OrderRepository, PatientRepository } from '../repositories/index.js';
import { Feedback } from '../types/models.js';
import { OrderStatus, ErrorCode } from '../constants/index.js';
import { AppError } from '../utils/response.js';

export class FeedbackService {
  constructor(
    private feedbackRepo = new FeedbackRepository(),
    private orderRepo = new OrderRepository(),
    private patientRepo = new PatientRepository()
  ) {}

  async submitFeedback(params: {
    orderId: string;
    patientId: string;
    rating: number;
    comment?: string;
  }): Promise<Feedback> {
    const order = await this.orderRepo.findById(params.orderId);
    if (!order) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Order not found');
    }

    if (order.patientId !== params.patientId) {
      throw new AppError(403, ErrorCode.FORBIDDEN, 'Feedback can only be submitted by the patient who received the meal');
    }

    // Only allow feedback for delivered orders
    if (order.status !== OrderStatus.DELIVERED) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        `Cannot submit feedback: Meal order is in '${order.status}' status. Feedback is only permitted for delivered meals.`
      );
    }

    const existingFeedback = await this.feedbackRepo.findByOrderId(params.orderId);
    if (existingFeedback) {
      throw new AppError(409, ErrorCode.CONFLICT, 'Feedback has already been submitted for this meal order');
    }

    const feedback: Feedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      orderId: params.orderId,
      patientId: params.patientId,
      rating: params.rating,
      comment: params.comment,
      createdAt: new Date(),
    };

    return this.feedbackRepo.create(feedback);
  }

  async listFeedbackForPatient(patientId: string): Promise<Feedback[]> {
    return this.feedbackRepo.listByPatient(patientId);
  }

  async listAllFeedback(): Promise<Feedback[]> {
    return this.feedbackRepo.listAll();
  }

  async deleteFeedback(id: string): Promise<boolean> {
    return this.feedbackRepo.delete(id);
  }
}
