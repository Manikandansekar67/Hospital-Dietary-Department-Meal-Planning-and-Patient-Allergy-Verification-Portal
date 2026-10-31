import {
  Allergy,
  AppNotification,
  DailyFoodAvailability,
  Disease,
  Food,
  FoodRecommendation,
  KitchenStatus,
  Order,
  Patient,
  User,
} from '../types';
import {
  INITIAL_ALLERGIES,
  INITIAL_DAILY_AVAILABILITY,
  INITIAL_DISEASES,
  INITIAL_FOODS,
  INITIAL_KITCHEN_STATUS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PATIENTS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_USERS,
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'hdmp_users',
  CURRENT_USER: 'hdmp_current_user',
  PATIENTS: 'hdmp_patients',
  DISEASES: 'hdmp_diseases',
  ALLERGIES: 'hdmp_allergies',
  FOODS: 'hdmp_foods',
  RECOMMENDATIONS: 'hdmp_recommendations',
  KITCHEN_STATUS: 'hdmp_kitchen_status',
  DAILY_AVAILABILITY: 'hdmp_daily_availability',
  ORDERS: 'hdmp_orders',
  NOTIFICATIONS: 'hdmp_notifications',
};

function getFromStorage<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const storageService = {
  getUsers: (): User[] => getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUsers: (data: User[]) => saveToStorage(STORAGE_KEYS.USERS, data),

  getCurrentUser: (): User | null => getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[1]), // Default to Doctor Sarah for quick review
  saveCurrentUser: (user: User | null) => saveToStorage(STORAGE_KEYS.CURRENT_USER, user),

  getPatients: (): Patient[] => getFromStorage<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS),
  savePatients: (data: Patient[]) => saveToStorage(STORAGE_KEYS.PATIENTS, data),

  getDiseases: (): Disease[] => getFromStorage<Disease[]>(STORAGE_KEYS.DISEASES, INITIAL_DISEASES),
  saveDiseases: (data: Disease[]) => saveToStorage(STORAGE_KEYS.DISEASES, data),

  getAllergies: (): Allergy[] => getFromStorage<Allergy[]>(STORAGE_KEYS.ALLERGIES, INITIAL_ALLERGIES),
  saveAllergies: (data: Allergy[]) => saveToStorage(STORAGE_KEYS.ALLERGIES, data),

  getFoods: (): Food[] => getFromStorage<Food[]>(STORAGE_KEYS.FOODS, INITIAL_FOODS),
  saveFoods: (data: Food[]) => saveToStorage(STORAGE_KEYS.FOODS, data),

  getRecommendations: (): FoodRecommendation[] =>
    getFromStorage<FoodRecommendation[]>(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS),
  saveRecommendations: (data: FoodRecommendation[]) => saveToStorage(STORAGE_KEYS.RECOMMENDATIONS, data),

  getKitchenStatus: (): KitchenStatus =>
    getFromStorage<KitchenStatus>(STORAGE_KEYS.KITCHEN_STATUS, INITIAL_KITCHEN_STATUS),
  saveKitchenStatus: (data: KitchenStatus) => saveToStorage(STORAGE_KEYS.KITCHEN_STATUS, data),

  getDailyAvailability: (): DailyFoodAvailability[] =>
    getFromStorage<DailyFoodAvailability[]>(STORAGE_KEYS.DAILY_AVAILABILITY, INITIAL_DAILY_AVAILABILITY),
  saveDailyAvailability: (data: DailyFoodAvailability[]) => saveToStorage(STORAGE_KEYS.DAILY_AVAILABILITY, data),

  getOrders: (): Order[] => getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
  saveOrders: (data: Order[]) => saveToStorage(STORAGE_KEYS.ORDERS, data),

  getNotifications: (): AppNotification[] =>
    getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  saveNotifications: (data: AppNotification[]) => saveToStorage(STORAGE_KEYS.NOTIFICATIONS, data),

  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.DISEASES);
    localStorage.removeItem(STORAGE_KEYS.ALLERGIES);
    localStorage.removeItem(STORAGE_KEYS.FOODS);
    localStorage.removeItem(STORAGE_KEYS.RECOMMENDATIONS);
    localStorage.removeItem(STORAGE_KEYS.KITCHEN_STATUS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_AVAILABILITY);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};
