import { Request, Response, NextFunction } from 'express';
import { FoodService } from '../services/food.service.js';
import { sendSuccess } from '../utils/response.js';

export class FoodController {
  constructor(private foodService = new FoodService()) {}

  listFoods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const foods = await this.foodService.listFoods();
      sendSuccess(res, foods, 200);
    } catch (err) {
      next(err);
    }
  };

  getFoodById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const details = await this.foodService.getFoodById(req.params.id);
      if (!details) {
        res.status(404).json({ success: false, error: { message: 'Food item not found' } });
        return;
      }
      sendSuccess(res, details, 200);
    } catch (err) {
      next(err);
    }
  };

  updateFood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.foodService.updateFood(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: { message: 'Food item not found' } });
        return;
      }
      sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  };

  patchFood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.foodService.patchFood(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: { message: 'Food item not found' } });
        return;
      }
      sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  };

  deleteFood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = req.user?.userId;
      await this.foodService.deleteFood(req.params.id, actorId);
      sendSuccess(res, { success: true, message: 'Food item deleted successfully' }, 200);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Doctor adds new food:
   * 1. Check whether food already exists.
   * 2. If existing, return existing food.
   * 3. If not existing, create food.
   * 4. Create ingredients.
   * 5. Associate ingredients.
   * 6. Run disease compatibility.
   * 7. Run allergy verification for selected patient if applicable.
   * 8. Return verification result.
   * 9. Require doctor approval before patient visibility.
   */
  createFood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = req.user?.doctorId || req.user?.userId || 'unknown-doc';
      const result = await this.foodService.addFoodByDoctor({
        ...req.body,
        doctorId,
      });
      sendSuccess(res, result, result.existing ? 200 : 201);
    } catch (err) {
      next(err);
    }
  };
}
