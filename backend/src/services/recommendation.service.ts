import { PatientRepository, FoodRepository } from '../repositories/index.js';
import { AllergyVerificationService } from './allergyVerification.service.js';
import { FoodRecommendationResult } from '../types/models.js';
import { RuleType } from '../constants/index.js';
import { AppError } from '../utils/response.js';
import { ErrorCode } from '../constants/index.js';

export class RecommendationService {
  constructor(
    private patientRepo = new PatientRepository(),
    private foodRepo = new FoodRepository(),
    private allergyService = new AllergyVerificationService()
  ) {}

  /**
   * Generates clinically compliant dietary recommendations for a patient.
   * Integrates disease contraindication rules with ingredient-level allergy validation.
   */
  async getRecommendationsForPatient(patientId: string): Promise<FoodRecommendationResult[]> {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) {
      throw new AppError(404, ErrorCode.NOT_FOUND, `Patient with ID ${patientId} not found`);
    }

    const patientDiseases = await this.patientRepo.getDiseasesForPatient(patientId);
    const allFoods = await this.foodRepo.listAll();
    const results: FoodRecommendationResult[] = [];

    for (const food of allFoods) {
      if (food.status !== 'ACTIVE') continue;

      // 1. Evaluate Disease Compatibility Rules
      let overallDiseaseCompatibility: RuleType = RuleType.ALLOWED;
      const reasons: string[] = [];

      for (const pd of patientDiseases) {
        const rules = await this.foodRepo.getDiseaseRulesForFood(food.id);
        const matchingRule = rules.find((r) => r.diseaseId === pd.disease.id);

        if (matchingRule) {
          if (matchingRule.ruleType === RuleType.AVOID) {
            overallDiseaseCompatibility = RuleType.AVOID;
            reasons.push(`Contraindicated for ${pd.disease.name}: ${matchingRule.reason || 'Not recommended'}`);
          } else if (matchingRule.ruleType === RuleType.RECOMMENDED && overallDiseaseCompatibility !== RuleType.AVOID) {
            overallDiseaseCompatibility = RuleType.RECOMMENDED;
            if (matchingRule.reason) reasons.push(`${pd.disease.name}: ${matchingRule.reason}`);
          }
        }
      }

      // 2. Evaluate Allergy Safety
      const allergyCheck = await this.allergyService.verifyAllergySafety(patientId, food.id);

      let status: 'SAFE' | 'UNSAFE' = 'SAFE';
      if (!allergyCheck.safe) {
        status = 'UNSAFE';
        const allergenNames = allergyCheck.conflicts.map((c) => c.allergy).join(', ');
        reasons.unshift(`Contains allergen conflict: ${allergenNames}`);
      } else if (overallDiseaseCompatibility === RuleType.AVOID) {
        status = 'UNSAFE';
      }

      results.push({
        foodId: food.id,
        foodName: food.name,
        category: food.category,
        diseaseCompatibility: overallDiseaseCompatibility,
        allergySafe: allergyCheck.safe,
        status,
        reason: reasons.length > 0 ? reasons.join('; ') : 'Safe for general consumption',
        calories: food.calories,
        protein: food.protein,
      });
    }

    // Sort SAFE and RECOMMENDED meals first
    return results.sort((a, b) => {
      if (a.status === 'SAFE' && b.status === 'UNSAFE') return -1;
      if (a.status === 'UNSAFE' && b.status === 'SAFE') return 1;
      if (a.diseaseCompatibility === RuleType.RECOMMENDED && b.diseaseCompatibility !== RuleType.RECOMMENDED) return -1;
      if (a.diseaseCompatibility !== RuleType.RECOMMENDED && b.diseaseCompatibility === RuleType.RECOMMENDED) return 1;
      return a.foodName.localeCompare(b.foodName);
    });
  }
}
