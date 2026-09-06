import { Allergy, Disease, Food, FoodRecommendation, Patient, PatientAllergy } from '../types';
import { evaluateFoodForPatient } from '../utils/allergyEngine';
import { delay } from './apiService';
import { storageService } from './storageService';

export const patientService = {
  getPatients: async (): Promise<Patient[]> => {
    await delay(250);
    return storageService.getPatients();
  },

  getPatientById: async (id: string): Promise<Patient | null> => {
    await delay(150);
    const patients = storageService.getPatients();
    return patients.find((p) => p.id === id) || null;
  },

  updateConditions: async (
    patientId: string,
    data: {
      diseases: string[];
      allergies: PatientAllergy[];
      dietaryRestrictions: string[];
      specialInstructions: string;
    }
  ): Promise<Patient> => {
    await delay(400);
    const patients = storageService.getPatients();
    const index = patients.findIndex((p) => p.id === patientId);
    if (index === -1) {
      throw new Error('Patient not found');
    }

    const updatedPatient: Patient = {
      ...patients[index],
      diseases: data.diseases,
      allergies: data.allergies,
      dietaryRestrictions: data.dietaryRestrictions,
      specialInstructions: data.specialInstructions,
    };

    patients[index] = updatedPatient;
    storageService.savePatients(patients);

    // Refresh recommendations for this patient
    await patientService.refreshRecommendations(updatedPatient);

    return updatedPatient;
  },

  refreshRecommendations: async (patient: Patient): Promise<FoodRecommendation[]> => {
    const foods = storageService.getFoods().filter((f) => f.status === 'active');
    const diseases = storageService.getDiseases();
    const allergies = storageService.getAllergies();
    const existingRecs = storageService.getRecommendations();

    // Re-evaluate all active foods for this patient
    const otherRecs = existingRecs.filter((r) => r.patientId !== patient.id);
    const newPatientRecs: FoodRecommendation[] = foods.map((food) => {
      const evaluation = evaluateFoodForPatient(food, patient, diseases, allergies);
      const existing = existingRecs.find((r) => r.patientId === patient.id && r.foodId === food.id);

      // Preserve doctor approval if safety status hasn't degraded to critical allergy
      let doctorApproval = existing?.doctorApproval || { status: 'pending' };
      if (evaluation.safetyStatus === 'CRITICAL_ALLERGY' && doctorApproval.status === 'approved') {
        // Automatic revoke if conflict detected upon condition update
        doctorApproval = {
          status: 'rejected',
          doctorRemarks: 'Automated Revocation: Critical allergy conflict detected after patient allergy update.',
          approvalDate: new Date().toISOString(),
        };
      }

      return {
        id: `rec-${patient.id}-${food.id}`,
        ...evaluation,
        doctorApproval,
      };
    });

    const combined = [...otherRecs, ...newPatientRecs];
    storageService.saveRecommendations(combined);
    return newPatientRecs;
  },

  addPatient: async (newPatient: Omit<Patient, 'id'>): Promise<Patient> => {
    await delay(300);
    const patients = storageService.getPatients();
    const patient: Patient = {
      ...newPatient,
      id: `pat-${Date.now()}`,
    };
    patients.unshift(patient);
    storageService.savePatients(patients);
    await patientService.refreshRecommendations(patient);
    return patient;
  },

  getApprovedFoodsForPatient: async (patientId: string): Promise<Food[]> => {
    await delay(200);
    const recs = storageService.getRecommendations().filter((r) => r.patientId === patientId);
    const approvedRecs = recs.filter(
      (r) =>
        r.doctorApproval.status === 'approved' &&
        !r.allergyCheck.hasConflict &&
        r.diseaseCompatibility.compatible !== false
    );
    return approvedRecs.map((r) => r.food);
  },
};
