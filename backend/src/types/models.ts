import {
  Role,
  UserStatus,
  Severity,
  FoodCategory,
  RuleType,
  ApprovalStatus,
  MealType,
  AvailabilityStatus,
  OrderStatus,
  NotificationType,
} from '../constants/index.js';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  phone?: string;
  age?: number;
  dateOfBirth?: string; // ISO date string: YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  userId: string;
  patientNumber: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  roomNumber: string;
  doctorId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  userId: string;
  department: string;
  licenseNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KitchenStaff {
  id: string;
  userId: string;
  station?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Disease {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientDisease {
  id: string;
  patientId: string;
  diseaseId: string;
  doctorId?: string;
  notes?: string;
  createdAt: Date;
}

export interface Allergy {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientAllergy {
  id: string;
  patientId: string;
  allergyId: string;
  severity: Severity;
  doctorId?: string;
  notes?: string;
  createdAt: Date;
}

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  description?: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  sodium: number;
  sugar: number;
  image?: string;
  preparationInstructions?: string;
  status: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodIngredient {
  id?: string;
  foodId: string;
  ingredientId: string;
}

export interface DiseaseFoodRule {
  id: string;
  diseaseId: string;
  foodId: string;
  ruleType: RuleType;
  reason?: string;
  createdAt: Date;
}

export interface DoctorFoodApproval {
  id: string;
  patientId: string;
  foodId: string;
  doctorId: string;
  status: ApprovalStatus;
  remarks?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface KitchenAvailability {
  id: string;
  foodId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AvailabilityStatus;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  patientId: string;
  foodId: string;
  status: OrderStatus;
  specialInstructions?: string;
  preparationWarnings: string[];
  crossContactWarnings: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedBy?: string;
  notes?: string;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  orderId: string;
  patientId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface AllergyConflict {
  allergy: string;
  ingredient: string;
  severity?: Severity;
}

export interface AllergyVerificationResult {
  safe: boolean;
  severity: Severity | null;
  conflicts: AllergyConflict[];
  crossContactWarnings?: string[];
}

export interface FoodRecommendationResult {
  foodId: string;
  foodName: string;
  category: FoodCategory;
  diseaseCompatibility: RuleType;
  allergySafe: boolean;
  status: 'SAFE' | 'UNSAFE';
  reason?: string;
  calories: number;
  protein: number;
}

export interface KitchenOrderPrepSheet {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  patientName: string;
  patientNumber: string;
  room: string;
  foodName: string;
  category: FoodCategory;
  preparationInstructions?: string;
  ingredients: string[];
  patientAllergies: Array<{ name: string; severity: Severity }>;
  conflictingIngredients: string[];
  preparationWarnings: string[];
  crossContactWarnings: string[];
  doctorSpecialInstructions?: string;
  orderedAt: Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  patientId?: string;
  doctorId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
