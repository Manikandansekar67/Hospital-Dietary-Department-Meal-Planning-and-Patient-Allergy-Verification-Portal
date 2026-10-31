import { z } from 'zod';
import {
  Role,
  FoodCategory,
  RuleType,
  ApprovalStatus,
  MealType,
  AvailabilityStatus,
  OrderStatus,
  Severity,
} from '../constants/index.js';

// Auth Validators
export const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role),
  // Role-specific fields
  patientNumber: z.string().optional(),
  age: z.number().int().positive().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  roomNumber: z.string().optional(),
  contactNumber: z.string().optional(),
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
  station: z.string().optional(),
  diseases: z.array(z.string()).optional(),
  allergies: z
    .array(
      z.object({
        allergyName: z.string(),
        severity: z.string().optional(),
        reactionNotes: z.string().optional(),
      })
    )
    .optional(),
});

export const loginUserSchema = z
  .object({
    email: z.string().optional(),
    identifier: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine(
    (data) => {
      const val = data.identifier || data.email;
      return typeof val === 'string' && val.trim().length > 0;
    },
    {
      message: 'Please provide your email address or phone number',
      path: ['email'],
    }
  );

export const createAdminUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role),
  password: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  age: z.union([z.number().int().min(0).max(130), z.string()]).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
});

// Food Validators
export const createFoodSchema = z.object({
  name: z.string().min(2, 'Food name must be at least 2 characters'),
  category: z.nativeEnum(FoodCategory),
  description: z.string().optional(),
  calories: z.number().nonnegative().default(0),
  protein: z.number().nonnegative().default(0),
  carbohydrates: z.number().nonnegative().default(0),
  fat: z.number().nonnegative().default(0),
  sodium: z.number().nonnegative().default(0),
  sugar: z.number().nonnegative().default(0),
  preparationInstructions: z.string().optional(),
  ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient is required'),
  diseaseRules: z
    .array(
      z.object({
        diseaseId: z.string(),
        ruleType: z.nativeEnum(RuleType),
        reason: z.string().optional(),
      })
    )
    .optional(),
  patientIdForVerification: z.string().optional(),
});

export const updateFoodSchema = createFoodSchema.partial();

// Doctor Food Approval Validator
export const updateApprovalSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  foodId: z.string().min(1, 'Food ID is required'),
  status: z.nativeEnum(ApprovalStatus),
  remarks: z.string().optional(),
});

// Kitchen Availability & Status Validator
export const createAvailabilitySchema = z.object({
  foodId: z.string().min(1, 'Food ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  mealType: z.nativeEnum(MealType),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:mm format'),
  status: z.nativeEnum(AvailabilityStatus).default(AvailabilityStatus.ACTIVE),
});

export const updateKitchenStatusSchema = z.object({
  isActive: z.boolean(),
  notes: z.string().optional(),
});

// Patient Ordering Validator
export const createOrderSchema = z.object({
  foodId: z.string().min(1, 'Food ID is required'),
  patientId: z.string().optional(), // Inferred from auth token if patient role
  specialInstructions: z.string().max(300).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

// Clinical Diagnosis & Allergy Validators
export const addPatientDiseaseSchema = z.object({
  diseaseId: z.string().min(1, 'Disease ID is required'),
  notes: z.string().optional(),
});

export const addPatientAllergySchema = z.object({
  allergyId: z.string().min(1, 'Allergy ID is required'),
  severity: z.nativeEnum(Severity),
  notes: z.string().optional(),
});

// Feedback Validator
export const createFeedbackSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(500).optional(),
});
