<<<<<<< HEAD
import { Food, FoodRecommendation, Patient, PatientAllergy } from '../types';
import { apiClient } from './apiService';

/** Detect the current user's role from localStorage without importing AuthContext */
const getCurrentUserRole = (): string => {
  try {
    const userStr = localStorage.getItem('hdmp_current_user');
    if (!userStr) return '';
    return (JSON.parse(userStr).role || '').toLowerCase();
  } catch {
    return '';
  }
};

/** Map a raw profile API response (from /patient/profile or /patient/:id) to Patient */
const mapProfileResponse = (data: any): Patient => {
  const p = data.patient || data;
  const u = data.user || {};
  const diseases = (data.diseases || []).map((d: any) => d.disease?.name || d.name || d);
  const allergies = (data.allergies || []).map((a: any) => ({
    allergyId: a.allergy?.id || a.allergyId || 'alg-1',
    allergyName: a.allergy?.name || a.allergyName || 'Allergen',
    severity: (a.severity || 'moderate').toLowerCase(),
    reactionNotes: a.notes || a.reactionNotes || '',
  }));
  return {
    id: p.id,
    patientCode: p.patientCode || p.patientNumber || 'P-10001',
    name: u.name || p.name || `Patient ${p.patientNumber || p.id}`,
    age: p.age || 50,
    gender: p.gender || 'Female',
    roomNumber: p.roomNumber || 'Room 101',
    admissionDate: p.admissionDate || (p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    doctorId: p.doctorId || 'doc-1',
    doctorName: p.doctorName || 'Dr. Sarah Mitchell, MD',
    diseases,
    allergies,
    dietaryRestrictions: diseases,
    specialInstructions: allergies.map((a: any) => a.reactionNotes).filter(Boolean).join('; ') || 'Standard dietary supervision',
    status: (p.status || 'admitted') as 'admitted' | 'discharged',
  };
};

/** Map a flat list item (from /patients, /admin/patients, /doctor/patients) to Patient */
const mapListItem = (p: any): Patient => ({
  id: p.id,
  patientCode: p.patientCode || p.patientNumber || 'P-10001',
  name: p.name || `Patient ${p.patientNumber || p.id}`,
  email: p.email || '',
  phone: p.contactNumber || p.phone || '',
  contactNumber: p.contactNumber || p.phone || '',
  age: p.age || 50,
  gender: p.gender || 'Female',
  roomNumber: p.roomNumber || 'Room 101',
  admissionDate: p.admissionDate || (p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
  doctorId: p.doctorId && p.doctorId !== 'unassigned' && p.doctorId !== 'none' ? p.doctorId : undefined,
  doctorName: p.doctorName && p.doctorName !== 'Unassigned' ? p.doctorName : undefined,
  diseases: p.diseases || [],
  allergies: (p.allergies || []).map((a: any) => ({
    allergyId: a.allergyId || a.id || 'alg-1',
    allergyName: a.allergyName || a.name || 'Allergen',
    severity: (a.severity || 'moderate').toLowerCase(),
    reactionNotes: a.reactionNotes || a.notes || '',
  })),
  dietaryRestrictions: p.dietaryRestrictions || p.diseases || [],
  specialInstructions: p.specialInstructions || 'Standard dietary supervision',
  status: (p.status || 'admitted') as 'admitted' | 'discharged',
});

export const patientService = {
  getPatients: async (): Promise<Patient[]> => {
    const role = getCurrentUserRole();

    // Patient role: only fetch their own profile, return as single-item array
    if (role === 'patient') {
      try {
        const res = await apiClient.get('/patient/profile');
        if (res.data?.success && res.data?.data) {
          return [mapProfileResponse(res.data.data)];
        }
      } catch {
        return [];
      }
      return [];
    }

    // Doctor / Admin / Kitchen: fetch full list via appropriate endpoint
    let rawList: any[] = [];
    try {
      const endpoint = role === 'admin' ? '/patients' : '/doctor/patients';
      const res = await apiClient.get(endpoint);
      rawList = res.data?.data || [];
    } catch {
      // Final fallback across all available patient list endpoints
      for (const ep of ['/patients', '/admin/patients', '/doctor/patients']) {
        try {
          const res = await apiClient.get(ep);
          rawList = res.data?.data || [];
          if (rawList.length > 0) break;
        } catch {
          continue;
        }
      }
    }

    return rawList.map(mapListItem);
  },

  getPatientById: async (id: string): Promise<Patient | null> => {
    const role = getCurrentUserRole();

    // Patient-role users: always use their own profile endpoint (avoids 403)
    if (role === 'patient') {
      try {
        const res = await apiClient.get('/patient/profile');
        if (res.data?.success && res.data?.data) {
          return mapProfileResponse(res.data.data);
        }
      } catch {
        return null;
      }
      return null;
    }

    // Doctor/Admin/Kitchen: check list first, then fetch by ID
    const list = await patientService.getPatients();
    const found = list.find((p) => p.id === id);
    if (found) return found;

    // Try direct profile endpoint
    for (const endpoint of [`/patient/${id}`, `/doctor/patients/${id}`]) {
      try {
        const res = await apiClient.get(endpoint);
        const data = res.data?.data;
        if (data) return mapProfileResponse(data);
      } catch {
        continue;
      }
    }
    return null;
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
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
<<<<<<< HEAD
    // Post new conditions to backend
    const allDiseasesRes = await apiClient.get('/diseases').catch(() => ({ data: { data: [] } }));
    const allDiseases = allDiseasesRes.data.data || [];
    for (const dName of data.diseases) {
      const matched = allDiseases.find((d: any) => d.name.toLowerCase() === dName.toLowerCase());
      if (matched) {
        await apiClient.post(`/doctor/patients/${patientId}/diseases`, {
          diseaseId: matched.id,
          notes: 'Updated via patient clinical profile',
        }).catch(() => {});
      }
    }

    const allAllergiesRes = await apiClient.get('/allergies').catch(() => ({ data: { data: [] } }));
    const allAllergies = allAllergiesRes.data.data || [];
    for (const al of data.allergies) {
      const matched = allAllergies.find((a: any) => a.name.toLowerCase() === al.allergyName.toLowerCase());
      if (matched) {
        await apiClient.post(`/doctor/patients/${patientId}/allergies`, {
          allergyId: matched.id,
          severity: (al.severity || 'moderate').toUpperCase(),
          notes: al.reactionNotes || 'Updated via clinical portal',
        }).catch(() => {});
      }
    }

    const updated = await patientService.getPatientById(patientId);
    return updated || (await patientService.getPatients())[0];
  },

  refreshRecommendations: async (patient: Patient): Promise<FoodRecommendation[]> => {
    try {
      const res = await apiClient.get(`/patient/recommendations?patientId=${patient.id}`);
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  addPatient: async (newPatient: Omit<Patient, 'id'>): Promise<Patient> => {
    const role = getCurrentUserRole();
    const endpoints =
      role === 'admin'
        ? ['/admin/patients', '/patients', '/doctor/patients']
        : ['/doctor/patients', '/patients', '/admin/patients'];

    for (const ep of endpoints) {
      try {
        const res = await apiClient.post(ep, newPatient);
        if (res.data?.success && res.data?.data) {
          return mapListItem(res.data.data);
        }
      } catch {
        continue;
      }
    }
    throw new Error('Failed to register inpatient');
  },

  getApprovedFoodsForPatient: async (patientId: string): Promise<Food[]> => {
    const mapFood = (f: any): Food => ({
      ...f,
      nutrition: {
        calories: f.calories || 250,
        protein: f.protein || 10,
        carbohydrates: f.carbohydrates || 30,
        fat: f.fat || 5,
        sodium: f.sodium || 80,
        sugar: f.sugar || 4,
      },
      ingredients: f.ingredients || [],
    });

    // 1. Try the verified available foods endpoint (returns physician-approved & safe foods)
    try {
      const res = await apiClient.get(`/patient/available-foods?patientId=${patientId}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data.map(mapFood);
      }
    } catch {
      // Fallback to direct approvals endpoint
    }

    // 2. Fallback: query patient-specific clinical approvals endpoint
    try {
      const approvalsRes = await apiClient.get(`/approvals/patient/${patientId}`);
      const approvals = approvalsRes.data?.data || [];
      const approved = approvals.filter(
        (a: any) =>
          (a.status === 'APPROVED' ||
            a.doctorApproval?.status === 'approved' ||
            a.safetyStatus === 'SAFE') &&
          !a.allergyCheck?.hasConflict
      );
      if (approved.length > 0) {
        return approved.map((a: any) => mapFood(a.food || a));
      }
    } catch {
      // Approvals endpoint unavailable
    }

    return [];
  },

  updatePatient: async (patientId: string, data: any): Promise<any> => {
    const res = await apiClient.put(`/patients/${patientId}`, data);
    return res.data.data;
  },

  patchPatient: async (patientId: string, data: any): Promise<any> => {
    const res = await apiClient.patch(`/patients/${patientId}`, data);
    return res.data.data;
  },

  deletePatient: async (patientId: string): Promise<void> => {
    await apiClient.delete(`/patients/${patientId}`);
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },
};
