import { FoodRepository, DiseaseRepository } from '../repositories/index.js';
import { Food, Ingredient, DiseaseFoodRule } from '../types/models.js';
import { FoodCategory, RuleType, ErrorCode } from '../constants/index.js';
import { AllergyVerificationService } from './allergyVerification.service.js';
import { AuditLogService } from './auditLog.service.js';
import { AppError } from '../utils/response.js';

export interface CreateFoodInput {
  name: string;
  category: FoodCategory;
  description?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  sodium?: number;
  sugar?: number;
  preparationInstructions?: string;
  ingredients: string[];
  diseaseRules?: Array<{ diseaseId: string; ruleType: RuleType; reason?: string }>;
  doctorId: string;
  patientIdForVerification?: string;
}

export class FoodService {
  constructor(
    private foodRepo = new FoodRepository(),
    private diseaseRepo = new DiseaseRepository(),
    private allergyService = new AllergyVerificationService(),
    private auditLogService = new AuditLogService()
  ) {}

  async listFoods(): Promise<any[]> {
    const foods = await this.foodRepo.listAll();
    const diseases = await this.diseaseRepo.listAll();
    const diseaseMap = new Map(diseases.map((d) => [d.id, d.name]));

    const defaultImages: Record<string, string> = {
      'food-1': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop&q=80',
      'food-2': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      'food-3': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
      'food-4': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
      'food-5': 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80',
      'food-6': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
      'food-7': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    };

    const enriched = await Promise.all(
      foods.map(async (f) => {
        const ingredients = await this.foodRepo.getIngredientsForFood(f.id);
        const diseaseRules = await this.foodRepo.getDiseaseRulesForFood(f.id);

        return {
          ...f,
          image: f.image || defaultImages[f.id] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
          ingredients: ingredients.map((i) => i.name),
          diseaseCompatibility: diseaseRules.map((dr) => ({
            diseaseId: dr.diseaseId,
            diseaseName: diseaseMap.get(dr.diseaseId) || dr.diseaseId,
            compatible: dr.ruleType === 'ALLOWED',
            notes: dr.reason || (dr.ruleType === 'ALLOWED' ? 'Suitable for condition' : 'Contraindicated for condition'),
          })),
          nutrition: {
            calories: f.calories || 250,
            protein: f.protein || 10,
            carbohydrates: f.carbohydrates || 30,
            fat: f.fat || 5,
            sodium: f.sodium || 80,
            sugar: f.sugar || 4,
            fiber: 5,
          },
        };
      })
    );

    return enriched;
  }

  async getFoodById(id: string): Promise<{ food: Food; ingredients: Ingredient[]; diseaseRules: DiseaseFoodRule[] } | null> {
    const food = await this.foodRepo.findById(id);
    if (!food) return null;

    const ingredients = await this.foodRepo.getIngredientsForFood(id);
    const diseaseRules = await this.foodRepo.getDiseaseRulesForFood(id);

    return { food, ingredients, diseaseRules };
  }

  async updateFood(id: string, updates: Partial<Food>): Promise<Food | null> {
    const updated = await this.foodRepo.update(id, updates);
    return updated;
  }

  async patchFood(id: string, updates: Partial<Food>): Promise<Food | null> {
    return this.updateFood(id, updates);
  }

  async deleteFood(id: string, actorId?: string): Promise<boolean> {
    const food = await this.foodRepo.findById(id);
    if (!food) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Food item not found');
    }

    const deleted = await this.foodRepo.delete(id);

    await this.auditLogService.log({
      userId: actorId || 'system',
      action: 'Doctor/Admin deleted food item',
      entity: 'Food',
      entityId: id,
      metadata: { foodName: food.name },
    });

    return deleted;
  }

  /**
   * Adds food by doctor following the strict multi-step clinical verification sequence.
   */
  async addFoodByDoctor(input: CreateFoodInput): Promise<{
    food: Food;
    existing: boolean;
    verificationResult?: {
      allergySafety?: unknown;
      diseaseRulesApplied: number;
      requiresApprovalBeforePatientOrder: boolean;
    };
  }> {
    // 1. Check whether food already exists
    const existing = await this.foodRepo.findByName(input.name);
    if (existing) {
      let allergyCheck = null;
      if (input.patientIdForVerification) {
        allergyCheck = await this.allergyService.verifyAllergySafety(input.patientIdForVerification, existing.id);
      }
      return {
        food: existing,
        existing: true,
        verificationResult: {
          allergySafety: allergyCheck,
          diseaseRulesApplied: 0,
          requiresApprovalBeforePatientOrder: true,
        },
      };
    }

    // 2. Create food
    const now = new Date();
    const foodId = `food-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newFood: Food = {
      id: foodId,
      name: input.name,
      category: input.category,
      description: input.description,
      calories: input.calories || 0,
      protein: input.protein || 0,
      carbohydrates: input.carbohydrates || 0,
      fat: input.fat || 0,
      sodium: input.sodium || 0,
      sugar: input.sugar || 0,
      preparationInstructions: input.preparationInstructions,
      status: 'ACTIVE',
      createdBy: input.doctorId,
      createdAt: now,
      updatedAt: now,
    };

    const savedFood = await this.foodRepo.create(newFood);

    // 3. Create & associate ingredients
    for (const ingName of input.ingredients) {
      let ingredient = await this.foodRepo.findIngredientByName(ingName);
      if (!ingredient) {
        ingredient = await this.foodRepo.addIngredient({
          id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: ingName,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        });
      }
      await this.foodRepo.linkFoodIngredient(savedFood.id, ingredient.id);
    }

    // 4. Associate Disease Compatibility Rules
    let rulesCount = 0;
    if (input.diseaseRules && input.diseaseRules.length > 0) {
      for (const rule of input.diseaseRules) {
        await this.foodRepo.setDiseaseRule({
          id: `dfr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          diseaseId: rule.diseaseId,
          foodId: savedFood.id,
          ruleType: rule.ruleType,
          reason: rule.reason,
          createdAt: now,
        });
        rulesCount++;
      }
    }

    // 5. Run allergy verification if patient specified
    let allergySafety = null;
    if (input.patientIdForVerification) {
      allergySafety = await this.allergyService.verifyAllergySafety(input.patientIdForVerification, savedFood.id);
    }

    // 6. Audit Log
    await this.auditLogService.log({
      userId: input.doctorId,
      action: 'Doctor added new food',
      entity: 'Food',
      entityId: savedFood.id,
      metadata: {
        name: savedFood.name,
        category: savedFood.category,
        ingredientsCount: input.ingredients.length,
      },
    });

    return {
      food: savedFood,
      existing: false,
      verificationResult: {
        allergySafety,
        diseaseRulesApplied: rulesCount,
        requiresApprovalBeforePatientOrder: true,
      },
    };
  }
}
