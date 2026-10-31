<<<<<<< HEAD
import { Food, FoodRecommendation } from '../types';
import { apiClient } from './apiService';

export const doctorService = {
  getAllRecommendations: async (): Promise<FoodRecommendation[]> => {
    const res = await apiClient.get('/doctor/approvals');
    return res.data.data || [];
  },

  getPatientRecommendations: async (patientId: string): Promise<FoodRecommendation[]> => {
    // 1. Fetch any existing doctor approval decisions for this patient
    const allApprovals = await doctorService.getAllRecommendations();
    const patientApprovals = allApprovals.filter((r) => r.patientId === patientId);

    // 2. Fetch full hospital food catalog evaluation from recommendation engine
    let engineResults: any[] = [];
    let allFoods: Food[] = [];
    try {
      const [recRes, foodsRes] = await Promise.all([
        apiClient.get(`/doctor/patients/${patientId}/recommendations`),
        apiClient.get('/foods'),
      ]);
      engineResults = recRes.data.data || [];
      allFoods = foodsRes.data.data || [];
    } catch (err) {
      console.warn('Failed to fetch recommendation engine results:', err);
    }

    // 3. Map engine results into full FoodRecommendation objects
    const catalogRecs: FoodRecommendation[] = engineResults.map((er: any) => {
      const food = allFoods.find((f) => f.id === er.foodId) || {
        id: er.foodId,
        name: er.foodName,
        category: er.category || 'Lunch',
        description: er.reason || '',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        ingredients: [],
        nutrition: {
          calories: er.calories || 200,
          protein: er.protein || 10,
          carbohydrates: 25,
          fat: 5,
          sodium: 100,
          sugar: 2,
        },
        preparationInstructions: 'Standard hygienic preparation',
        status: 'active' as const,
      };

      // Check if there is an existing approval for this food
      const existingApproval = patientApprovals.find((a) => a.foodId === er.foodId);

      return {
        id: existingApproval ? existingApproval.id : `rec-${patientId}-${er.foodId}`,
        foodId: er.foodId,
        food: existingApproval?.food || food,
        patientId,
        diseaseCompatibility: {
          compatible: er.diseaseCompatibility !== 'AVOID',
          notes: er.reason || '',
          matchedDiseases: [],
          conflicts: er.diseaseCompatibility === 'AVOID' ? [er.reason] : [],
        },
        allergyCheck: {
          hasConflict: !er.allergySafe,
          conflictingIngredients: [],
          details: er.allergySafe ? 'No allergen conflict detected' : 'Allergy conflict detected',
        },
        safetyStatus: !er.allergySafe ? 'CRITICAL_ALLERGY' : er.status === 'SAFE' ? 'SAFE' : 'CONTRAINDICATED',
        doctorApproval: existingApproval?.doctorApproval || {
          status: 'pending' as const,
        },
      };
    });

    // 4. Also include any custom unlisted/extra foods from patientApprovals that aren't in catalog
    const unlistedRecs = patientApprovals.filter(
      (pa) => !catalogRecs.some((cr) => cr.foodId === pa.foodId)
    );

    const merged = [...catalogRecs, ...unlistedRecs];
    if (merged.length > 0) return merged;

    return patientApprovals;
=======
import { Food, FoodRecommendation, Patient } from '../types';
import { evaluateFoodForPatient } from '../utils/allergyEngine';
import { delay } from './apiService';
import { storageService } from './storageService';

export const doctorService = {
  getAllRecommendations: async (): Promise<FoodRecommendation[]> => {
    await delay(200);
    return storageService.getRecommendations();
  },

  getPatientRecommendations: async (patientId: string): Promise<FoodRecommendation[]> => {
    await delay(300);
    const recs = storageService.getRecommendations();
    const patientRecs = recs.filter((r) => r.patientId === patientId);

    // If no recs exist yet for this patient, compute them now
    if (patientRecs.length === 0) {
      const patient = storageService.getPatients().find((p) => p.id === patientId);
      if (!patient) return [];
      const foods = storageService.getFoods().filter((f) => f.status === 'active');
      const diseases = storageService.getDiseases();
      const allergies = storageService.getAllergies();

      const computed: FoodRecommendation[] = foods.map((food) => {
        const evalResult = evaluateFoodForPatient(food, patient, diseases, allergies);
        return {
          id: `rec-${patient.id}-${food.id}`,
          ...evalResult,
          doctorApproval: {
            status: 'pending',
          },
        };
      });

      storageService.saveRecommendations([...recs, ...computed]);
      return computed;
    }

    return patientRecs;
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },

  getRecommendationsForPatient: async (patientId: string): Promise<FoodRecommendation[]> => {
    return doctorService.getPatientRecommendations(patientId);
  },

  approveFood: async (
<<<<<<< HEAD
    target: string | { foodId: string; patientId: string; remarks?: string },
    doctorIdOrRemarks: string = 'doc-1',
    doctorName: string = 'Dr. Sarah Mitchell, MD',
    remarks?: string
  ): Promise<FoodRecommendation> => {
    let foodId = '';
    let patientId = '';
    let actualRemarks = remarks || (typeof target !== 'object' && doctorIdOrRemarks !== 'doc-1' ? doctorIdOrRemarks : '');

    if (typeof target === 'object') {
      foodId = target.foodId;
      patientId = target.patientId;
      actualRemarks = target.remarks || actualRemarks;
    } else {
      const str = String(target);
      if (str.startsWith('rec-')) {
        const foodIdx = str.search(/(food|fd)-/);
        if (foodIdx > 4) {
          patientId = str.substring(4, foodIdx - 1);
          foodId = str.substring(foodIdx);
        } else {
          foodId = str;
        }
      } else {
        foodId = str;
      }
    }

    if (!patientId) patientId = 'pat-1';

    await apiClient.post('/doctor/approvals', {
      patientId,
      foodId,
      status: 'APPROVED',
      remarks: actualRemarks || 'Clinically approved for inpatient meal plan.',
    });

    const updated = await doctorService.getAllRecommendations();
    const found = updated.find((r) => r.foodId === foodId && r.patientId === patientId);
    return found || ({ id: `rec-${patientId}-${foodId}`, foodId, patientId } as any);
  },

  rejectFood: async (
    target: string | { foodId: string; patientId: string; remarks?: string },
    doctorIdOrRemarks: string = 'doc-1',
    doctorName: string = 'Dr. Sarah Mitchell, MD',
    remarks?: string
  ): Promise<FoodRecommendation> => {
    let foodId = '';
    let patientId = '';
    let actualRemarks = remarks || (typeof target !== 'object' && doctorIdOrRemarks !== 'doc-1' ? doctorIdOrRemarks : '');

    if (typeof target === 'object') {
      foodId = target.foodId;
      patientId = target.patientId;
      actualRemarks = target.remarks || actualRemarks;
    } else {
      const str = String(target);
      if (str.startsWith('rec-')) {
        const foodIdx = str.search(/(food|fd)-/);
        if (foodIdx > 4) {
          patientId = str.substring(4, foodIdx - 1);
          foodId = str.substring(foodIdx);
        } else {
          foodId = str;
        }
      } else {
        foodId = str;
      }
    }

    if (!patientId) patientId = 'pat-1';

    await apiClient.post('/doctor/approvals', {
      patientId,
      foodId,
      status: 'REJECTED',
      remarks: actualRemarks || 'Contraindicated or unsafe for patient condition.',
    });

    const updated = await doctorService.getAllRecommendations();
    const found = updated.find((r) => r.foodId === foodId && r.patientId === patientId);
    return found || ({ id: `rec-${patientId}-${foodId}`, foodId, patientId } as any);
=======
    recommendationId: string,
    doctorIdOrRemarks: string = 'doc-1',
    doctorName: string = 'Dr. Sharma',
    remarks?: string
  ): Promise<FoodRecommendation> => {
    await delay(300);
    const recs = storageService.getRecommendations();
    const index = recs.findIndex((r) => r.id === recommendationId);
    if (index === -1) throw new Error('Recommendation record not found');

    // Handle overloaded call: approveFood(id, remarks)
    let actualDoctorId = 'doc-1';
    let actualDoctorName = 'Dr. Sharma';
    let actualRemarks = remarks;

    if (remarks === undefined) {
      // Called with 1 or 2 args: approveFood(id, remarks)
      actualRemarks = doctorIdOrRemarks;
    } else {
      actualDoctorId = doctorIdOrRemarks;
      actualDoctorName = doctorName;
    }

    const updated: FoodRecommendation = {
      ...recs[index],
      doctorApproval: {
        status: 'approved',
        doctorId: actualDoctorId,
        doctorName: actualDoctorName,
        doctorRemarks: actualRemarks || 'Clinical approval granted. Safe for patient consumption.',
        approvalDate: new Date().toISOString(),
      },
    };

    recs[index] = updated;
    storageService.saveRecommendations(recs);

    // Notify patient
    const notifs = storageService.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      type: 'approval',
      title: 'Doctor Approved New Meal Option',
      message: `${updated.food.name} has been approved by ${actualDoctorName} for your meal plan.`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
      targetRole: 'patient',
      targetUserId: updated.patientId,
      link: '/patient/menu',
    });
    storageService.saveNotifications(notifs);

    return updated;
  },

  rejectFood: async (
    recommendationId: string,
    doctorIdOrRemarks: string = 'doc-1',
    doctorName: string = 'Dr. Sharma',
    remarks?: string
  ): Promise<FoodRecommendation> => {
    await delay(300);
    const recs = storageService.getRecommendations();
    const index = recs.findIndex((r) => r.id === recommendationId);
    if (index === -1) throw new Error('Recommendation record not found');

    let actualDoctorId = 'doc-1';
    let actualDoctorName = 'Dr. Sharma';
    let actualRemarks = remarks;

    if (remarks === undefined) {
      actualRemarks = doctorIdOrRemarks;
    } else {
      actualDoctorId = doctorIdOrRemarks;
      actualDoctorName = doctorName;
    }

    const updated: FoodRecommendation = {
      ...recs[index],
      doctorApproval: {
        status: 'rejected',
        doctorId: actualDoctorId,
        doctorName: actualDoctorName,
        doctorRemarks: actualRemarks || 'Clinical rejection: contraindicated or unsafe for patient condition.',
        approvalDate: new Date().toISOString(),
      },
    };

    recs[index] = updated;
    storageService.saveRecommendations(recs);

    // Notify patient
    const notifs = storageService.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      type: 'rejection',
      title: 'Dietary Restriction Notification',
      message: `${updated.food.name} was flagged as contraindicated by ${actualDoctorName}.`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      targetRole: 'patient',
      targetUserId: updated.patientId,
    });
    storageService.saveNotifications(notifs);

    return updated;
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },

  addNewFoodAndEvaluate: async (
    patientId: string,
    foodData: Omit<Food, 'id' | 'createdAt' | 'status'>,
    doctorId: string = 'doc-1',
<<<<<<< HEAD
    doctorName: string = 'Dr. Sarah Mitchell, MD'
  ): Promise<{ food: Food; recommendation: FoodRecommendation }> => {
    // Format category to enum
    const rawCat = (foodData.category || 'LUNCH').toUpperCase().replace(/[^A-Z]/g, '');
    const validCats = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'BEVERAGE'];
    const category = validCats.includes(rawCat) ? rawCat : 'LUNCH';

    const ingredients = Array.isArray(foodData.ingredients)
      ? foodData.ingredients.filter((i) => typeof i === 'string' && i.trim().length > 0)
      : ['Fresh ingredients'];

    const res = await apiClient.post('/doctor/foods', {
      name: foodData.name,
      category,
      description: foodData.description || 'Doctor created custom clinical diet item',
      calories: Number(foodData.nutrition?.calories) || 200,
      protein: Number(foodData.nutrition?.protein) || 10,
      carbohydrates: Number(foodData.nutrition?.carbohydrates) || 20,
      fat: Number(foodData.nutrition?.fat) || 5,
      sodium: Number(foodData.nutrition?.sodium) || 80,
      sugar: Number(foodData.nutrition?.sugar) || 2,
      preparationInstructions: foodData.preparationInstructions || 'Strict allergen isolation mandatory during preparation',
      ingredients: ingredients.length > 0 ? ingredients : ['Wholesome ingredients'],
      patientIdForVerification: patientId,
    });

    const resultFood = res.data.data.food;
    const allRecs = await doctorService.getAllRecommendations();
    let rec = allRecs.find((r) => r.foodId === resultFood.id && r.patientId === patientId);

    if (!rec) {
      rec = {
        id: `rec-${patientId}-${resultFood.id}`,
        foodId: resultFood.id,
        food: {
          ...resultFood,
          nutrition: {
            calories: resultFood.calories,
            protein: resultFood.protein,
            carbohydrates: resultFood.carbohydrates,
            fat: resultFood.fat,
            sodium: resultFood.sodium,
            sugar: resultFood.sugar,
          },
          ingredients,
        },
        patientId,
        diseaseCompatibility: {
          compatible: true,
          notes: 'Clinically created by attending physician',
          matchedDiseases: [],
          conflicts: [],
        },
        allergyCheck: {
          hasConflict: false,
          conflictingIngredients: [],
          details: 'Verified safe',
        },
        safetyStatus: 'SAFE',
        doctorApproval: {
          status: 'pending',
          doctorId,
          doctorName,
        },
      };
    }

    return { food: resultFood, recommendation: rec };
=======
    doctorName: string = 'Dr. Sharma'
  ): Promise<{ food: Food; recommendation: FoodRecommendation }> => {
    await delay(450);
    // 1. Store food
    const foods = storageService.getFoods();
    const newFood: Food = {
      ...foodData,
      id: `food-doc-${Date.now()}`,
      status: 'active',
      createdBy: doctorName,
      createdAt: new Date().toISOString().split('T')[0],
    };
    foods.unshift(newFood);
    storageService.saveFoods(foods);

    // 2. Run allergy verification & disease compatibility
    const patient = storageService.getPatients().find((p) => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    const diseases = storageService.getDiseases();
    const allergies = storageService.getAllergies();
    const evalResult = evaluateFoodForPatient(newFood, patient, diseases, allergies);

    // 3. Create recommendation in pending state (Doctor must approve it explicitly!)
    const recs = storageService.getRecommendations();
    const newRec: FoodRecommendation = {
      id: `rec-${patient.id}-${newFood.id}`,
      ...evalResult,
      doctorApproval: {
        status: 'pending',
        doctorId,
        doctorName,
      },
    };

    recs.unshift(newRec);
    storageService.saveRecommendations(recs);

    return { food: newFood, recommendation: newRec };
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },

  addUnlistedFoodAndVerify: async (
    foodData: any,
    patientId: string,
<<<<<<< HEAD
    doctorName: string = 'Dr. Sarah Mitchell, MD'
=======
    doctorName: string = 'Dr. Sharma'
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  ): Promise<FoodRecommendation> => {
    const res = await doctorService.addNewFoodAndEvaluate(patientId, foodData, 'doc-1', doctorName);
    return res.recommendation;
  },
};
