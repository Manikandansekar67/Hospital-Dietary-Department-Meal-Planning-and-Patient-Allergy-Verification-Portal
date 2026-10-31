export type Role = 'admin' | 'doctor' | 'kitchen' | 'patient';

export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'critical';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export type MealSession = MealType;

export type FoodCategory =
  | 'Grains & Cereals'
  | 'Soups & Broths'
  | 'Steamed Meals'
  | 'High Protein'
  | 'Purees & Soft Diets'
  | 'Fruits & Salads'
  | 'Beverages'
  | 'Desserts (Diabetic Safe)';

export type MealCategory = FoodCategory | 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Beverage' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
<<<<<<< HEAD
  age?: number;
  dateOfBirth?: string;
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  department?: string;
  active: boolean;
  patientId?: string; // If role is patient
}

export interface Disease {
  id: string;
  name: string;
  code?: string;
  category?: string;
  description: string;
  contraindications?: string[]; // e.g. "High Sodium", "Refined Sugar", "High Potassium"
  compatibleCategories?: string[];
  avoidFoodItems?: string[];
  recommendedFoodItems?: string[];
}

export interface Allergy {
  id: string;
  name: string;
  category?: 'Nuts' | 'Dairy' | 'Gluten' | 'Seafood' | 'Soy' | 'Eggs' | 'Sulfites' | 'Other' | string;
  commonIngredients: string[];
  severityGuidelines?: string;
  description?: string;
  symptoms?: string;
}

export interface PatientAllergy {
  allergyId: string;
  allergyName: string;
  severity: AllergySeverity;
  reactionNotes?: string;
}

export interface Patient {
  id: string;
  patientCode: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  roomNumber: string;
  admissionDate: string;
  doctorId: string;
  doctorName: string;
  contactNumber?: string;
  diseases: string[]; // Disease names or IDs
  allergies: PatientAllergy[];
  dietaryRestrictions: string[];
  specialInstructions: string;
  status: 'admitted' | 'discharged';
}

export interface FoodNutrition {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  sodium: number; // mg
  sugar: number; // grams
  fiber?: number; // grams
}

export interface Food {
  id: string;
  name: string;
<<<<<<< HEAD
  category: MealCategory;
=======
  category: FoodCategory;
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  description: string;
  image: string;
  ingredients: string[];
  nutrition: FoodNutrition;
  compatibleDiseases?: string[]; // diseases it's recommended for
  contraindicatedDiseases?: string[]; // diseases it must NOT be used for
  diseaseCompatibility?:
    | {
        compatible: string[];
        contraindicated: string[];
      }
    | Array<{ diseaseName: string; compatible: boolean; notes?: string }>
    | any;
  allergens?: string[]; // allergen tags
  preparationInstructions: string;
  status: 'active' | 'inactive';
  createdBy?: string;
  createdByRole?: string;
  createdAt?: string;
}

export type SafetyStatus = 'SAFE' | 'CAUTION' | 'CONTRAINDICATED' | 'CRITICAL_ALLERGY';

export interface FoodRecommendation {
  id: string;
  foodId: string;
  food: Food;
  patientId: string;
  diseaseCompatibility: {
    compatible: boolean;
    notes: string;
    matchedDiseases: string[];
    conflicts: string[];
  };
  allergyCheck: {
    hasConflict: boolean;
    conflictingIngredients: string[];
    allergenName?: string;
    severity?: AllergySeverity;
    details: string;
  };
  safetyStatus: SafetyStatus;
  doctorApproval: {
    status: 'pending' | 'approved' | 'rejected';
    doctorId?: string;
    doctorName?: string;
    doctorRemarks?: string;
    approvalDate?: string;
  };
}

export interface DailyFoodAvailability {
  id: string;
  foodId: string;
  foodName: string;
  category: FoodCategory;
  foodCategory?: FoodCategory | string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  mealSession?: MealSession | string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
  totalPortions: number;
  remainingPortions: number;
}

export interface KitchenStatus {
  isActive: boolean;
  activeSession: MealType | 'closed';
  date: string;
  announcement?: string;
<<<<<<< HEAD
  toggledBy?: string;
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  lastToggledBy?: string;
  lastToggledAt?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderTimelineStep {
  status: OrderStatus;
  timestamp: string;
  notes?: string;
  by?: string;
}

export interface OrderFeedback {
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  roomNumber: string;
  foodId: string;
  foodName: string;
<<<<<<< HEAD
  foodCategory: MealCategory;
  mealType: MealType;
  mealSession?: MealSession | string;
=======
  foodCategory: FoodCategory;
  mealType: MealType;
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  orderDate: string; // YYYY-MM-DD
  orderTime: string; // ISO string
  status: OrderStatus;
  patientAllergies: PatientAllergy[];
  avoidIngredients: string[];
  preparationInstructions: string;
  doctorApproved: boolean;
  timeline: OrderTimelineStep[];
  feedback?: OrderFeedback;
}

export type NotificationType =
  | 'recommendation'
  | 'approval'
  | 'rejection'
  | 'allergy_conflict'
  | 'order_accepted'
  | 'order_preparing'
  | 'order_ready'
  | 'order_delivered'
  | 'kitchen_inactive'
  | 'meal_unavailable';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRole?: Role | 'all';
  targetUserId?: string;
  link?: string;
  priority: 'normal' | 'high' | 'critical';
}
