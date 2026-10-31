import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service.js';
import { sendSuccess } from '../utils/response.js';

export class RecommendationController {
  constructor(private recommendationService = new RecommendationService()) {}

  getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.params.patientId || (req.query.patientId as string) || req.user?.patientId;
      if (!patientId) {
        res.status(400).json({ success: false, error: { message: 'Patient ID is required' } });
        return;
      }
      const results = await this.recommendationService.getRecommendationsForPatient(patientId);
      sendSuccess(res, results, 200);
    } catch (err) {
      next(err);
    }
  };
}
