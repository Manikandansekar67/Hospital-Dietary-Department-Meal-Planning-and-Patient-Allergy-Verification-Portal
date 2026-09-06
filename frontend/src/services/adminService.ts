import { Allergy, Disease, Food, Patient, User } from '../types';
import { delay } from './apiService';
import { storageService } from './storageService';

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
  },

  // User Management
  getUsers: async (): Promise<User[]> => {
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
  },

  // Disease Management
  getDiseases: async (): Promise<Disease[]> => {
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
  },

  // Allergy Management
  getAllergies: async (): Promise<Allergy[]> => {
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
  },
};
