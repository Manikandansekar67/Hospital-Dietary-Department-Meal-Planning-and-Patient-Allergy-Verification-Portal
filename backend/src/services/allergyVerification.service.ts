import { PatientRepository, FoodRepository } from '../repositories/index.js';
import { AllergyVerificationResult, AllergyConflict } from '../types/models.js';
import { Severity, CROSS_CONTACT_WARNING_TEMPLATES } from '../constants/index.js';

export class AllergyVerificationService {
  constructor(
    private patientRepo = new PatientRepository(),
    private foodRepo = new FoodRepository()
  ) {}

  /**
   * Verifies ingredient-level allergy compatibility for a patient and food item.
   * Server-side authoritative evaluation - never trust client validation.
   */
  async verifyAllergySafety(patientId: string, foodId: string): Promise<AllergyVerificationResult> {
    const patientAllergies = await this.patientRepo.getAllergiesForPatient(patientId);
    const foodIngredients = await this.foodRepo.getIngredientsForFood(foodId);
    const food = await this.foodRepo.findById(foodId);

    if (patientAllergies.length === 0) {
      return {
        safe: true,
        severity: null,
        conflicts: [],
        crossContactWarnings: [],
      };
    }

    const conflicts: AllergyConflict[] = [];
    let maxSeverity: Severity | null = null;
    const severityHierarchy: Record<Severity, number> = {
      [Severity.MILD]: 1,
      [Severity.MODERATE]: 2,
      [Severity.SEVERE]: 3,
      [Severity.CRITICAL]: 4,
    };

    const updateMaxSeverity = (sev: Severity) => {
      if (!maxSeverity || severityHierarchy[sev] > severityHierarchy[maxSeverity]) {
        maxSeverity = sev;
      }
    };

    // Ingredient and allergen matching tokens
    for (const pa of patientAllergies) {
      const allergyNameLower = pa.allergy.name.toLowerCase().trim();

      // Check against food title & description as safety net
      if (food) {
        const foodNameLower = food.name.toLowerCase();
        const foodDescLower = (food.description || '').toLowerCase();
        if (foodNameLower.includes(allergyNameLower) || foodDescLower.includes(allergyNameLower)) {
          conflicts.push({
            allergy: pa.allergy.name,
            ingredient: `Recipe contains ${pa.allergy.name}`,
            severity: pa.severity,
          });
          updateMaxSeverity(pa.severity);
        }
      }

      // Check ingredient-level matches
      for (const ing of foodIngredients) {
        const ingNameLower = ing.name.toLowerCase().trim();
        const ingDescLower = (ing.description || '').toLowerCase();

        // Exact, substring, or derivative check
        const isConflict =
          ingNameLower.includes(allergyNameLower) ||
          allergyNameLower.includes(ingNameLower) ||
          ingDescLower.includes(allergyNameLower) ||
          (allergyNameLower === 'milk' && (ingNameLower.includes('dairy') || ingNameLower.includes('whey') || ingNameLower.includes('casein') || ingNameLower.includes('cheese') || ingNameLower.includes('butter'))) ||
          (allergyNameLower === 'wheat' && (ingNameLower.includes('gluten') || ingNameLower.includes('flour'))) ||
          (allergyNameLower === 'egg' && (ingNameLower.includes('albumin') || ingNameLower.includes('yolk') || ingNameLower.includes('mayo'))) ||
          (allergyNameLower === 'tree nuts' && (ingNameLower.includes('almond') || ingNameLower.includes('walnut') || ingNameLower.includes('cashew') || ingNameLower.includes('pecan')));

        if (isConflict) {
          conflicts.push({
            allergy: pa.allergy.name,
            ingredient: ing.name,
            severity: pa.severity,
          });
          updateMaxSeverity(pa.severity);
        }
      }
    }

    // Generate cross-contact warnings if severe or critical allergy exists
    const crossContactWarnings: string[] = [];
    if (
      maxSeverity === Severity.SEVERE ||
      maxSeverity === Severity.CRITICAL ||
      patientAllergies.some((a) => a.severity === Severity.SEVERE || a.severity === Severity.CRITICAL)
    ) {
      crossContactWarnings.push(...CROSS_CONTACT_WARNING_TEMPLATES);
    }

    return {
      safe: conflicts.length === 0,
      severity: maxSeverity,
      conflicts,
      crossContactWarnings,
    };
  }
}
