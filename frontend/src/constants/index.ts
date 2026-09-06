import { AllergySeverity, MealType, Role } from '../types';

export const ROLES: { [key in Role]: { name: string; label: string; description: string } } = {
  admin: {
    name: 'admin',
    label: 'Dietary Administrator',
    description: 'Full portal control, user management, foods, and hospital dietary audits',
  },
  doctor: {
    name: 'doctor',
    label: 'Attending Physician / Dietitian',
    description: 'Patient medical conditions, allergy diagnosis, and clinical food approvals',
  },
  kitchen: {
    name: 'kitchen',
    label: 'Dietary Kitchen Staff',
    description: 'Daily food availability, specialized meal prep, and allergy cross-contact safety',
  },
  patient: {
    name: 'patient',
    label: 'Inpatient',
    description: 'Verified dietary meal selection, allergy awareness, and delivery tracking',
  },
};

export const SEVERITY_CONFIG: Record<
  AllergySeverity,
  { label: string; badgeClass: string; borderClass: string; icon: string }
> = {
  mild: {
    label: 'Mild Allergy',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    borderClass: 'border-amber-300',
    icon: 'AlertCircle',
  },
  moderate: {
    label: 'Moderate Allergy',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    borderClass: 'border-orange-400',
    icon: 'AlertTriangle',
  },
  severe: {
    label: 'Severe Allergy',
    badgeClass: 'bg-red-50 text-red-700 border-red-300 font-medium',
    borderClass: 'border-red-500',
    icon: 'ShieldAlert',
  },
  critical: {
    label: 'Critical Anaphylaxis Risk',
    badgeClass: 'bg-red-100 text-red-800 border-red-400 font-semibold animate-pulse',
    borderClass: 'border-red-600',
    icon: 'Flame',
  },
};

export const MEAL_SESSIONS: { type: MealType; label: string; defaultStart: string; defaultEnd: string }[] = [
  { type: 'breakfast', label: 'Breakfast Service', defaultStart: '07:00', defaultEnd: '10:00' },
  { type: 'lunch', label: 'Lunch Service', defaultStart: '12:00', defaultEnd: '15:00' },
  { type: 'dinner', label: 'Dinner Service', defaultStart: '18:00', defaultEnd: '21:00' },
  { type: 'snacks', label: 'Healthy Snacks & Fluids', defaultStart: '10:00', defaultEnd: '20:00' },
];

export const MEAL_SESSION_TIMES: Record<string, { start: string; end: string }> = {
  breakfast: { start: '07:00', end: '10:00' },
  lunch: { start: '12:00', end: '15:00' },
  dinner: { start: '18:00', end: '21:00' },
  snacks: { start: '10:00', end: '20:00' },
  snack: { start: '10:00', end: '20:00' },
};

export const COMMON_DISEASES = [
  'Type 2 Diabetes',
  'Hypertension',
  'Chronic Kidney Disease (CKD)',
  'Celiac Disease',
  'Cardiovascular Disease',
  'GERD / Acid Reflux',
  'Gout / Hyperuricemia',
  'Liver Cirrhosis',
];

export const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts (Almonds, Cashews, Walnuts)',
  'Dairy / Lactose',
  'Gluten / Wheat',
  'Seafood / Shellfish',
  'Fish',
  'Soy & Soy Lecithin',
  'Eggs',
  'Sesame Seeds',
  'Sulfites',
  'Corn / Cornstarch',
];

export const ALLERGIES_LIST = COMMON_ALLERGENS;

export const HOSPITAL_INFO = {
  name: 'St. Jude Metropolitan Hospital',
  department: 'Department of Clinical Nutrition & Dietary Services',
  hotline: 'Ext. 4082 (Dietary Nurse Dispatch)',
  safetyStandard: 'HACCP & Patient Safety Certified',
};
