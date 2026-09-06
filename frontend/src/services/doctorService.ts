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
  },

  getRecommendationsForPatient: async (patientId: string): Promise<FoodRecommendation[]> => {
    return doctorService.getPatientRecommendations(patientId);
  },

  approveFood: async (
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
  },

  addNewFoodAndEvaluate: async (
    patientId: string,
    foodData: Omit<Food, 'id' | 'createdAt' | 'status'>,
    doctorId: string = 'doc-1',
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
  },

  addUnlistedFoodAndVerify: async (
    foodData: any,
    patientId: string,
    doctorName: string = 'Dr. Sharma'
  ): Promise<FoodRecommendation> => {
    const res = await doctorService.addNewFoodAndEvaluate(patientId, foodData, 'doc-1', doctorName);
    return res.recommendation;
  },
};
