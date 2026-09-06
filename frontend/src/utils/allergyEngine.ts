import { Allergy, Disease, Food, FoodRecommendation, Patient, SafetyStatus } from '../types';

/**
 * Checks whether an ingredient string conflicts with a known patient allergen
 */
export function checkIngredientAllergenConflict(
  ingredient: string,
  allergyName: string,
  allergyRef?: Allergy
): boolean {
  const ingLower = ingredient.toLowerCase();
  const allNameLower = allergyName.toLowerCase();

  // Direct word or substring match
  if (ingLower.includes(allNameLower)) {
    return true;
  }

  // Common synonyms and derivatives
  const synonymsMap: Record<string, string[]> = {
    peanut: ['peanut', 'peanuts', 'peanut oil', 'arachis', 'peanut butter', 'groundnut'],
    'tree nuts': ['almond', 'cashew', 'walnut', 'pistachio', 'hazelnut', 'pecan', 'marzipan'],
    dairy: ['milk', 'dairy', 'butter', 'ghee', 'cheese', 'cream', 'whey', 'casein', 'yogurt', 'curd', 'lactose'],
    gluten: ['wheat', 'gluten', 'maida', 'semolina', 'rava', 'barley', 'rye', 'malt', 'breadcrumbs'],
    seafood: ['shrimp', 'prawn', 'crab', 'lobster', 'shellfish', 'oyster', 'squid', 'clam'],
    fish: ['fish', 'cod', 'salmon', 'tuna', 'mackerel', 'anchovy'],
    soy: ['soy', 'soya', 'tofu', 'edamame', 'soy lecithin', 'soy sauce', 'tamari'],
    eggs: ['egg', 'eggs', 'egg white', 'yolk', 'albumin', 'mayonnaise'],
  };

  for (const [key, synonyms] of Object.entries(synonymsMap)) {
    if (allNameLower.includes(key)) {
      if (synonyms.some((syn) => ingLower.includes(syn))) {
        return true;
      }
    }
  }

  if (allergyRef && allergyRef.commonIngredients) {
    if (allergyRef.commonIngredients.some((common) => ingLower.includes(common.toLowerCase()))) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates a Food against a Patient profile for both Disease compatibility and Allergen safety
 */
export function evaluateFoodForPatient(
  food: Food,
  patient: Patient,
  allDiseases: Disease[],
  allAllergies: Allergy[]
): Omit<FoodRecommendation, 'id' | 'doctorApproval'> {
  // 1. Allergy evaluation
  const conflictingIngredients: string[] = [];
  let worstSeverity: Patient['allergies'][0]['severity'] | undefined;
  let conflictingAllergenName: string | undefined;

  for (const patientAllergy of patient.allergies) {
    const allergyRef = allAllergies.find(
      (a) => a.id === patientAllergy.allergyId || a.name.toLowerCase() === patientAllergy.allergyName.toLowerCase()
    );

    // Check food allergen tags
    const hasTagConflict = food.allergens.some((tag) =>
      checkIngredientAllergenConflict(tag, patientAllergy.allergyName, allergyRef)
    );

    // Check individual ingredients
    const matchedIngredients = food.ingredients.filter((ing) =>
      checkIngredientAllergenConflict(ing, patientAllergy.allergyName, allergyRef)
    );

    if (hasTagConflict || matchedIngredients.length > 0) {
      if (!conflictingAllergenName) {
        conflictingAllergenName = patientAllergy.allergyName;
      }
      if (!worstSeverity || getSeverityWeight(patientAllergy.severity) > getSeverityWeight(worstSeverity)) {
        worstSeverity = patientAllergy.severity;
      }
      matchedIngredients.forEach((ing) => {
        if (!conflictingIngredients.includes(ing)) {
          conflictingIngredients.push(ing);
        }
      });
      if (hasTagConflict && matchedIngredients.length === 0) {
        conflictingIngredients.push(`${patientAllergy.allergyName} (Declared Allergen Tag)`);
      }
    }
  }

  const hasAllergyConflict = conflictingIngredients.length > 0;

  // 2. Disease compatibility evaluation
  const matchedDiseases: string[] = [];
  const diseaseConflicts: string[] = [];

  for (const diseaseName of patient.diseases) {
    const isExplicitlyContraindicated = food.contraindicatedDiseases.includes(diseaseName);
    const isExplicitlyCompatible = food.compatibleDiseases.includes(diseaseName);

    // Check disease specific nutrient constraints
    let nutrientConflictReason: string | null = null;
    if (diseaseName.includes('Hypertension') && food.nutrition.sodium > 250) {
      nutrientConflictReason = 'Sodium exceeds 250mg DASH restriction threshold';
    } else if (diseaseName.includes('Diabetes') && (food.nutrition.sugar > 6 || food.nutrition.carbohydrates > 50)) {
      nutrientConflictReason = 'High carbohydrate or sugar content for Diabetic management';
    } else if (diseaseName.includes('Kidney') && food.nutrition.sodium > 200) {
      nutrientConflictReason = 'Sodium or protein level requires renal limitation';
    }

    if (isExplicitlyContraindicated || nutrientConflictReason) {
      diseaseConflicts.push(
        `${diseaseName}${nutrientConflictReason ? ` (${nutrientConflictReason})` : ' (Direct Contraindication)'}`
      );
    } else if (isExplicitlyCompatible) {
      matchedDiseases.push(diseaseName);
    }
  }

  const isDiseaseCompatible = diseaseConflicts.length === 0;

  // 3. Overall Safety Status determination
  let safetyStatus: SafetyStatus = 'SAFE';

  if (hasAllergyConflict) {
    if (worstSeverity === 'severe' || worstSeverity === 'critical') {
      safetyStatus = 'CRITICAL_ALLERGY';
    } else {
      safetyStatus = 'CAUTION';
    }
  } else if (!isDiseaseCompatible) {
    safetyStatus = 'CONTRAINDICATED';
  } else if (diseaseConflicts.length > 0) {
    safetyStatus = 'CAUTION';
  }

  // Detailed notes
  const diseaseNotes = isDiseaseCompatible
    ? matchedDiseases.length > 0
      ? `Medically suitable: formulated for ${matchedDiseases.join(', ')}.`
      : 'Acceptable baseline diet with no identified medical contraindications.'
    : `Contraindicated for: ${diseaseConflicts.join('; ')}.`;

  const allergyDetails = hasAllergyConflict
    ? `DETECTED ALLERGY CONFLICT: Patient has ${worstSeverity?.toUpperCase()} ${conflictingAllergenName} allergy. Conflicting ingredients found: ${conflictingIngredients.join(', ')}.`
    : 'No severe allergy conflict detected based on patient records.';

  return {
    foodId: food.id,
    food,
    patientId: patient.id,
    diseaseCompatibility: {
      compatible: isDiseaseCompatible,
      notes: diseaseNotes,
      matchedDiseases,
      conflicts: diseaseConflicts,
    },
    allergyCheck: {
      hasConflict: hasAllergyConflict,
      conflictingIngredients,
      allergenName: conflictingAllergenName,
      severity: worstSeverity,
      details: allergyDetails,
    },
    safetyStatus,
  };
}

function getSeverityWeight(sev: Patient['allergies'][0]['severity']): number {
  switch (sev) {
    case 'critical':
      return 4;
    case 'severe':
      return 3;
    case 'moderate':
      return 2;
    case 'mild':
      return 1;
    default:
      return 0;
  }
}
