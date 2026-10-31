<<<<<<< HEAD
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
=======
import { Allergy, Disease, Food, Patient, User } from '../types';
import { delay } from './apiService';
import { storageService } from './storageService';
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3

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
<<<<<<< HEAD
    const res = await apiClient.get('/admin/stats');
    return res.data.data;
=======
    await delay(300);
    const users = storageService.getUsers();
    const patients = storageService.getPatients();
    const foods = storageService.getFoods();
    const diseases = storageService.getDiseases();
    const orders = storageService.getOrders();
    const recs = storageService.getRecommendations();

    const today = new Date().toISOString().split('T')[0];
    const todaysOrdersCount = orders.filter((o) => o.orderDate === today).length;

    const pendingApprovalsCount = recs.filter((r) => r.doctorApproval.status === 'pending').length;
    const approvedCount = recs.filter((r) => r.doctorApproval.status === 'approved').length;
    const rejectedCount = recs.filter((r) => r.doctorApproval.status === 'rejected').length;
    const allergyAlertsCount = recs.filter((r) => r.allergyCheck.hasConflict).length;

    // Aggregate category distribution
    const categoryMap: Record<string, number> = {};
    foods.forEach((f) => {
      categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
    });
    const foodCategoryDistribution = Object.entries(categoryMap).map(([category, count]) => ({
      category: category.split(' ')[0], // short label for charts
      count,
    }));

    // Aggregate disease diet distribution
    const diseaseMap: Record<string, number> = {};
    patients.forEach((p) => {
      p.diseases.forEach((d) => {
        diseaseMap[d] = (diseaseMap[d] || 0) + 1;
      });
    });
    const dietDistribution = Object.entries(diseaseMap).map(([name, value]) => ({
      name: name.replace('Type 2 ', '').replace(' (Stage 3)', ''),
      value,
    }));

    // Orders by day (last 7 days mock + today)
    const ordersByDay = [
      { day: 'Mon', count: 18 },
      { day: 'Tue', count: 24 },
      { day: 'Wed', count: 21 },
      { day: 'Thu', count: 28 },
      { day: 'Fri', count: 32 },
      { day: 'Sat', count: 26 },
      { day: 'Today', count: todaysOrdersCount || 14 },
    ];

    const approvalComparison = [
      { name: 'Approved', count: approvedCount },
      { name: 'Pending', count: pendingApprovalsCount },
      { name: 'Rejected (Safety)', count: rejectedCount },
    ];

    return {
      totalPatients: patients.length,
      totalDoctors: users.filter((u) => u.role === 'doctor').length,
      totalKitchenStaff: users.filter((u) => u.role === 'kitchen').length,
      totalFoods: foods.length,
      totalDiseases: diseases.length,
      todaysOrders: todaysOrdersCount || orders.length,
      activeFoods: foods.filter((f) => f.status === 'active').length,
      pendingApprovals: pendingApprovalsCount,
      allergyAlerts: allergyAlertsCount,
      ordersByDay,
      dietDistribution,
      foodCategoryDistribution,
      approvalComparison,
    };
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },

  // User Management
  getUsers: async (): Promise<User[]> => {
<<<<<<< HEAD
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
=======
    await delay(150);
    return storageService.getUsers();
  },
  addUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    await delay(250);
    const users = storageService.getUsers();
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    users.push(newUser);
    storageService.saveUsers(users);
    return newUser;
  },
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    await delay(200);
    const users = storageService.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...updates };
    storageService.saveUsers(users);
    return users[index];
  },
  toggleUserStatus: async (id: string): Promise<User> => {
    await delay(200);
    const users = storageService.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index].active = !users[index].active;
    storageService.saveUsers(users);
    return users[index];
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },

  // Disease Management
  getDiseases: async (): Promise<Disease[]> => {
<<<<<<< HEAD
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
=======
    await delay(150);
    return storageService.getDiseases();
  },
  addDisease: async (data: Omit<Disease, 'id'>): Promise<Disease> => {
    await delay(250);
    const diseases = storageService.getDiseases();
    const item: Disease = { ...data, id: `dis-${Date.now()}` };
    diseases.push(item);
    storageService.saveDiseases(diseases);
    return item;
  },
  updateDisease: async (id: string, data: Partial<Disease>): Promise<Disease> => {
    await delay(200);
    const diseases = storageService.getDiseases();
    const index = diseases.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Disease not found');
    diseases[index] = { ...diseases[index], ...data };
    storageService.saveDiseases(diseases);
    return diseases[index];
  },
  deleteDisease: async (id: string): Promise<void> => {
    await delay(200);
    const diseases = storageService.getDiseases().filter((d) => d.id !== id);
    storageService.saveDiseases(diseases);
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },

  // Allergy Management
  getAllergies: async (): Promise<Allergy[]> => {
<<<<<<< HEAD
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
=======
    await delay(150);
    return storageService.getAllergies();
  },
  addAllergy: async (data: Omit<Allergy, 'id'>): Promise<Allergy> => {
    await delay(250);
    const allergies = storageService.getAllergies();
    const item: Allergy = { ...data, id: `all-${Date.now()}` };
    allergies.push(item);
    storageService.saveAllergies(allergies);
    return item;
  },
  updateAllergy: async (id: string, data: Partial<Allergy>): Promise<Allergy> => {
    await delay(200);
    const allergies = storageService.getAllergies();
    const index = allergies.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Allergy not found');
    allergies[index] = { ...allergies[index], ...data };
    storageService.saveAllergies(allergies);
    return allergies[index];
  },
  deleteAllergy: async (id: string): Promise<void> => {
    await delay(200);
    const allergies = storageService.getAllergies().filter((a) => a.id !== id);
    storageService.saveAllergies(allergies);
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },
};
