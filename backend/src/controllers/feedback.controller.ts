import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../services/feedback.service.js';
import { sendSuccess } from '../utils/response.js';

export class FeedbackController {
  constructor(private feedbackService = new FeedbackService()) {}

  submitFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.user?.patientId || req.body.patientId;
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required' } });
        return;
      }
      const feedback = await this.feedbackService.submitFeedback({
        orderId: req.body.orderId,
        patientId,
        rating: req.body.rating,
        comment: req.body.comment,
      });
      sendSuccess(res, feedback, 201);
    } catch (err) {
      next(err);
    }
  };

  listFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.params.patientId || (req.query.patientId as string);
      if (patientId) {
        const feedback = await this.feedbackService.listFeedbackForPatient(patientId);
        sendSuccess(res, feedback, 200);
      } else {
        const allFeedback = await this.feedbackService.listAllFeedback();
        sendSuccess(res, allFeedback, 200);
      }
    } catch (err) {
      next(err);
    }
  };

  deleteFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.feedbackService.deleteFeedback(req.params.id);
      sendSuccess(res, { success: true, message: 'Feedback deleted' }, 200);
    } catch (err) {
      next(err);
    }
  };
}
