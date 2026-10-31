export enum Role {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  KITCHEN = 'KITCHEN',
  PATIENT = 'PATIENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum Severity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  CRITICAL = 'CRITICAL',
}

export enum FoodCategory {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
  BEVERAGE = 'BEVERAGE',
  OTHER = 'OTHER',
}

export enum RuleType {
  RECOMMENDED = 'RECOMMENDED',
  ALLOWED = 'ALLOWED',
  AVOID = 'AVOID',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
}

export enum AvailabilityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum NotificationType {
  FOOD_APPROVED = 'FOOD_APPROVED',
  FOOD_REJECTED = 'FOOD_REJECTED',
  ALLERGY_ALERT = 'ALLERGY_ALERT',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_PREPARING = 'ORDER_PREPARING',
  ORDER_READY = 'ORDER_READY',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  KITCHEN_INACTIVE = 'KITCHEN_INACTIVE',
  MEAL_UNAVAILABLE = 'MEAL_UNAVAILABLE',
}

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ALLERGY_CONFLICT = 'ALLERGY_CONFLICT',
  DISEASE_CONTRAINDICATION = 'DISEASE_CONTRAINDICATION',
  DOCTOR_APPROVAL_REQUIRED = 'DOCTOR_APPROVAL_REQUIRED',
  KITCHEN_INACTIVE = 'KITCHEN_INACTIVE',
  MEAL_UNAVAILABLE = 'MEAL_UNAVAILABLE',
  INVALID_MEAL_WINDOW = 'INVALID_MEAL_WINDOW',
  PAST_DATE_ORDER_PROHIBITED = 'PAST_DATE_ORDER_PROHIBITED',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export const COMMON_ALLERGENS = [
  'Peanut',
  'Milk',
  'Egg',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Tree Nuts',
  'Sesame',
  'Gluten',
] as const;

export const CROSS_CONTACT_WARNING_TEMPLATES = [
  'Avoid cross-contact with allergen surfaces and equipment',
  'Use dedicated clean prep area and sanitized utensils',
  'Strict allergen separation mandatory during preparation',
  'Do not prepare alongside allergen-containing ingredients',
] as const;
