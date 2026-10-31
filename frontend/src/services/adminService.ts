import { Allergy, Disease, User } from '../types';
import { apiClient } from './apiService';

export interface DoctorInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  specialization?: string;
}

export interface AdminDashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalKitchenStaff: number;
  totalFoods: number;
  totalDiseases: number;
  todaysOrders: number;
  activeFoods: number;
  pendingApprovals: number;
  allergyAlerts: number;
  ordersByDay: { day: string; count: number }[];
  dietDistribution: { name: string; value: number }[];
  foodCategoryDistribution: { category: string; count: number }[];
  approvalComparison: { name: string; count: number }[];
}

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get('/admin/stats');
    return res.data.data;
  },

  // User Management
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get('/admin/users');
    return (res.data.data || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: (u.role || 'patient').toLowerCase(),
      active: u.status === 'ACTIVE',
      department: u.department,
      phone: u.phone,
      age: u.age,
      dateOfBirth: u.dateOfBirth,
    }));
  },

  addUser: async (userData: Omit<User, 'id'> & { password?: string }): Promise<User> => {
    const res = await apiClient.post('/admin/users', {
      name: userData.name,
      email: userData.email,
      role: userData.role.toUpperCase(),
      status: userData.active ? 'ACTIVE' : 'INACTIVE',
      password: userData.password,
      phone: userData.phone,
      age: userData.age,
      dateOfBirth: userData.dateOfBirth,
    });
    const u = res.data.data;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: (u.role || 'patient').toLowerCase(),
      active: u.status === 'ACTIVE',
      department: u.department,
      phone: u.phone,
      age: u.age,
      dateOfBirth: u.dateOfBirth,
    };
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.email) payload.email = updates.email;
    if (updates.role) payload.role = updates.role.toUpperCase();
    if (updates.active !== undefined) payload.status = updates.active ? 'ACTIVE' : 'INACTIVE';
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.age !== undefined) payload.age = updates.age;
    if (updates.dateOfBirth !== undefined) payload.dateOfBirth = updates.dateOfBirth;

    const res = await apiClient.put(`/admin/users/${id}`, payload);
    const u = res.data.data;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: (u.role || 'patient').toLowerCase(),
      active: u.status === 'ACTIVE',
      department: u.department,
      phone: u.phone,
      age: u.age,
      dateOfBirth: u.dateOfBirth,
    };
  },

  patchUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.email) payload.email = updates.email;
    if (updates.role) payload.role = updates.role.toUpperCase();
    if (updates.department) payload.department = updates.department;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.age !== undefined) payload.age = updates.age;
    if (updates.dateOfBirth) payload.dateOfBirth = updates.dateOfBirth;

    const res = await apiClient.patch(`/admin/users/${id}`, payload);
    const u = res.data.data;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: (u.role || 'patient').toLowerCase(),
      active: u.status === 'ACTIVE',
      department: u.department,
      phone: u.phone,
      age: u.age,
      dateOfBirth: u.dateOfBirth,
    };
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  toggleUserStatus: async (id: string, currentActive: boolean): Promise<User> => {
    const newStatus = currentActive ? 'INACTIVE' : 'ACTIVE';
    const res = await apiClient.put(`/admin/users/${id}/status`, { status: newStatus });
    const u = res.data.data;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: (u.role || 'patient').toLowerCase(),
      active: u.status === 'ACTIVE',
      department: u.department,
    };
  },

  // Disease Management
  getDiseases: async (): Promise<Disease[]> => {
    try {
      const res = await apiClient.get('/admin/diseases');
      return (res.data.data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description || '',
        contraindications: d.contraindications || [],
        compatibleCategories: d.compatibleCategories || [],
        avoidFoodItems: d.avoidFoodItems || [],
        recommendedFoodItems: d.recommendedFoodItems || [],
      }));
    } catch {
      try {
        const res = await apiClient.get('/diseases');
        return (res.data.data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description || '',
          contraindications: d.contraindications || [],
          compatibleCategories: d.compatibleCategories || [],
          avoidFoodItems: d.avoidFoodItems || [],
          recommendedFoodItems: d.recommendedFoodItems || [],
        }));
      } catch {
        return [];
      }
    }
  },

  addDisease: async (data: Omit<Disease, 'id'>): Promise<Disease> => {
    const res = await apiClient.post('/admin/diseases', {
      name: data.name,
      description: data.description,
    });
    const d = res.data.data;
    return {
      id: d.id,
      name: d.name,
      description: d.description || '',
    };
  },

  updateDisease: async (id: string, data: Partial<Disease>): Promise<Disease> => {
    const res = await apiClient.put(`/admin/diseases/${id}`, data);
    const d = res.data.data;
    return {
      id: d.id,
      name: d.name,
      description: d.description || '',
    };
  },

  patchDisease: async (id: string, data: Partial<Disease>): Promise<Disease> => {
    const res = await apiClient.patch(`/admin/diseases/${id}`, data);
    const d = res.data.data;
    return {
      id: d.id,
      name: d.name,
      description: d.description || '',
    };
  },

  deleteDisease: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/diseases/${id}`);
  },

  // Allergy Management
  getAllergies: async (): Promise<Allergy[]> => {
    const res = await apiClient.get('/admin/allergies');
    return (res.data.data || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      category: a.category || 'Other',
      commonIngredients: a.commonIngredients || [a.name],
      description: a.description || '',
      symptoms: a.symptoms || '',
    }));
  },

  addAllergy: async (data: Omit<Allergy, 'id'>): Promise<Allergy> => {
    const res = await apiClient.post('/admin/allergies', {
      name: data.name,
      description: data.description,
    });
    const a = res.data.data;
    return {
      id: a.id,
      name: a.name,
      category: a.category || 'Other',
      commonIngredients: [a.name],
      description: a.description || '',
    };
  },

  updateAllergy: async (id: string, data: Partial<Allergy>): Promise<Allergy> => {
    const res = await apiClient.put(`/admin/allergies/${id}`, data);
    const a = res.data.data;
    return {
      id: a.id,
      name: a.name,
      category: a.category || 'Other',
      commonIngredients: [a.name],
      description: a.description || '',
    };
  },

  patchAllergy: async (id: string, data: Partial<Allergy>): Promise<Allergy> => {
    const res = await apiClient.patch(`/admin/allergies/${id}`, data);
    const a = res.data.data;
    return {
      id: a.id,
      name: a.name,
      category: a.category || 'Other',
      commonIngredients: [a.name],
      description: a.description || '',
    };
  },

  deleteAllergy: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/allergies/${id}`);
  },

  // Patient Management CRUD
  updatePatient: async (patientId: string, data: any): Promise<any> => {
    const res = await apiClient.put(`/admin/patients/${patientId}`, data);
    return res.data.data;
  },

  patchPatient: async (patientId: string, data: any): Promise<any> => {
    const res = await apiClient.patch(`/admin/patients/${patientId}`, data);
    return res.data.data;
  },

  deletePatient: async (patientId: string): Promise<void> => {
    await apiClient.delete(`/admin/patients/${patientId}`);
  },

  // Doctor Assignment
  getDoctors: async (): Promise<DoctorInfo[]> => {
    try {
      const res = await apiClient.get('/admin/doctors');
      return (res.data.data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        department: d.department,
        specialization: d.specialization,
      }));
    } catch {
      try {
        const res = await apiClient.get('/doctor/doctors');
        return (res.data.data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          department: d.department,
          specialization: d.specialization,
        }));
      } catch {
        const res = await apiClient.get('/doctors');
        return (res.data.data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          department: d.department,
          specialization: d.specialization,
        }));
      }
    }
  },

  assignDoctor: async (patientId: string, doctorId: string): Promise<void> => {
    await apiClient.put(`/admin/patients/${patientId}/assign-doctor`, { doctorId });
  },

  removeDoctor: async (patientId: string): Promise<void> => {
    await apiClient.delete(`/admin/patients/${patientId}/assign-doctor`);
  },
};
