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
import {
  User,
  Patient,
  Doctor,
  KitchenStaff,
  Disease,
  PatientDisease,
  Allergy,
  PatientAllergy,
  Food,
  Ingredient,
  FoodIngredient,
  DiseaseFoodRule,
  DoctorFoodApproval,
  KitchenAvailability,
  Order,
  OrderStatusHistory,
  Feedback,
  Notification,
  AuditLog,
} from '../types/models.js';
import {
  UserModel,
  PatientModel,
  DoctorModel,
  KitchenStaffModel,
  DiseaseModel,
  PatientDiseaseModel,
  AllergyModel,
  PatientAllergyModel,
  FoodModel,
  IngredientModel,
  FoodIngredientModel,
  DiseaseFoodRuleModel,
  DoctorFoodApprovalModel,
  KitchenAvailabilityModel,
  KitchenStatusModel,
  OrderModel,
  OrderStatusHistoryModel,
  FeedbackModel,
  NotificationModel,
  AuditLogModel,
} from '../models/index.js';
import { isDatabaseConnected } from '../config/database.js';
import bcrypt from 'bcryptjs';

export interface DatabaseState {
  users: Map<string, User>;
  patients: Map<string, Patient>;
  doctors: Map<string, Doctor>;
  kitchenStaff: Map<string, KitchenStaff>;
  diseases: Map<string, Disease>;
  patientDiseases: Map<string, PatientDisease>;
  allergies: Map<string, Allergy>;
  patientAllergies: Map<string, PatientAllergy>;
  foods: Map<string, Food>;
  ingredients: Map<string, Ingredient>;
  foodIngredients: Map<string, FoodIngredient>;
  diseaseFoodRules: Map<string, DiseaseFoodRule>;
  doctorFoodApprovals: Map<string, DoctorFoodApproval>;
  kitchenAvailabilities: Map<string, KitchenAvailability>;
  orders: Map<string, Order>;
  orderStatusHistories: Map<string, OrderStatusHistory>;
  feedbacks: Map<string, Feedback>;
  notifications: Map<string, Notification>;
  auditLogs: Map<string, AuditLog>;
  kitchenIsActive: boolean;
  kitchenStatusNotes: string;
}

class InMemoryHospitalDatabase {
  public users = new Map<string, User>();
  public patients = new Map<string, Patient>();
  public doctors = new Map<string, Doctor>();
  public kitchenStaff = new Map<string, KitchenStaff>();
  public diseases = new Map<string, Disease>();
  public patientDiseases = new Map<string, PatientDisease>();
  public allergies = new Map<string, Allergy>();
  public patientAllergies = new Map<string, PatientAllergy>();
  public foods = new Map<string, Food>();
  public ingredients = new Map<string, Ingredient>();
  public foodIngredients = new Map<string, FoodIngredient>();
  public diseaseFoodRules = new Map<string, DiseaseFoodRule>();
  public doctorFoodApprovals = new Map<string, DoctorFoodApproval>();
  public kitchenAvailabilities = new Map<string, KitchenAvailability>();
  public orders = new Map<string, Order>();
  public orderStatusHistories = new Map<string, OrderStatusHistory>();
  public feedbacks = new Map<string, Feedback>();
  public notifications = new Map<string, Notification>();
  public auditLogs = new Map<string, AuditLog>();
  public kitchenIsActive = true;
  public kitchenStatusNotes = 'Kitchen operations normal';

  private initialized = false;

  public async seed(): Promise<void> {
    if (this.initialized) return;

    const defaultPasswordHash = await bcrypt.hash('Hospital@123', 10);
    const now = new Date();

    // 1. Users
    const adminUser: User = {
      id: 'usr-admin-1',
      name: 'System Administrator',
      email: 'admin@hospital.com',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(adminUser.id, adminUser);

    const docUser1: User = {
      id: 'usr-doc-1',
      name: 'Dr. Sarah Mitchell, MD',
      email: 'doctor@hospital.com',
      passwordHash: defaultPasswordHash,
      role: Role.DOCTOR,
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(docUser1.id, docUser1);

    const doc1: Doctor = {
      id: 'doc-1',
      userId: docUser1.id,
      department: 'Clinical Nutrition & Endocrinology',
      licenseNumber: 'MD-94021',
      createdAt: now,
      updatedAt: now,
    };
    this.doctors.set(doc1.id, doc1);

    const docUser2: User = {
      id: 'usr-doc-2',
      name: 'Dr. James Wilson, MD',
      email: 'jwilson@hospital.com',
      passwordHash: defaultPasswordHash,
      role: Role.DOCTOR,
      status: UserStatus.ACTIVE,
      phone: '+1 555-0182',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(docUser2.id, docUser2);

    const doc2: Doctor = {
      id: 'doc-2',
      userId: docUser2.id,
      department: 'Cardiology & Internal Medicine',
      licenseNumber: 'MD-88104',
      createdAt: now,
      updatedAt: now,
    };
    this.doctors.set(doc2.id, doc2);

    const docUser3: User = {
      id: 'usr-doc-3',
      name: 'Dr. Robert Chang, MD',
      email: 'rchang@hospital.com',
      passwordHash: defaultPasswordHash,
      role: Role.DOCTOR,
      status: UserStatus.ACTIVE,
      phone: '+1 555-0193',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(docUser3.id, docUser3);

    const doc3: Doctor = {
      id: 'doc-3',
      userId: docUser3.id,
      department: 'Gastroenterology & Dietary Health',
      licenseNumber: 'MD-72491',
      createdAt: now,
      updatedAt: now,
    };
    this.doctors.set(doc3.id, doc3);

    const kitchenUser: User = {
      id: 'usr-kitchen-1',
      name: 'Chef Marcus Vance',
      email: 'kitchen@hospital.com',
      passwordHash: defaultPasswordHash,
      role: Role.KITCHEN,
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(kitchenUser.id, kitchenUser);

    const kitchenStaff1: KitchenStaff = {
      id: 'ks-1',
      userId: kitchenUser.id,
      station: 'Main Dietary & Allergen Station',
      createdAt: now,
      updatedAt: now,
    };
    this.kitchenStaff.set(kitchenStaff1.id, kitchenStaff1);

    // Patient 1 (has Diabetes, Peanut Allergy SEVERE)
    const patientUser1: User = {
      id: 'usr-patient-1',
      name: 'Eleanor Vance',
      email: 'patient@hospital.com',
      passwordHash: defaultPasswordHash,
      role: Role.PATIENT,
      status: UserStatus.ACTIVE,
      phone: '+1 555-0111',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(patientUser1.id, patientUser1);

    const patient1: Patient = {
      id: 'pat-1',
      userId: patientUser1.id,
      patientNumber: 'P-10023',
      age: 58,
      gender: 'FEMALE',
      roomNumber: 'Room 304-B',
      doctorId: 'doc-1',
      createdAt: now,
      updatedAt: now,
    };
    this.patients.set(patient1.id, patient1);

    // Patient 2 (Hypertension & Milk Allergy)
    const patientUser2: User = {
      id: 'usr-patient-2',
      name: 'Robert Chen',
      email: 'robert.chen@hospital.com',
      passwordHash: defaultPasswordHash,
      role: Role.PATIENT,
      status: UserStatus.ACTIVE,
      phone: '+1 555-0222',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(patientUser2.id, patientUser2);

    const patient2: Patient = {
      id: 'pat-2',
      userId: patientUser2.id,
      patientNumber: 'P-10024',
      age: 64,
      gender: 'MALE',
      roomNumber: 'Room 412-A',
      doctorId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.patients.set(patient2.id, patient2);

    // 2. Diseases
    const diseaseList: Array<Omit<Disease, 'createdAt' | 'updatedAt'>> = [
      { id: 'dis-1', name: 'Diabetes', description: 'Metabolic disorder requiring low glycemic index foods', status: 'ACTIVE' },
      { id: 'dis-2', name: 'Hypertension', description: 'High blood pressure requiring low sodium dietary protocol', status: 'ACTIVE' },
      { id: 'dis-3', name: 'Heart Disease', description: 'Cardiovascular condition requiring low saturated fat and cholesterol', status: 'ACTIVE' },
      { id: 'dis-4', name: 'Kidney Disease', description: 'Renal disorder requiring strict protein, sodium, and potassium regulation', status: 'ACTIVE' },
      { id: 'dis-5', name: 'Obesity', description: 'Weight management requiring caloric control and nutrient density', status: 'ACTIVE' },
      { id: 'dis-6', name: 'Anemia', description: 'Requires iron-rich and vitamin C fortified nutrition', status: 'ACTIVE' },
    ];
    for (const d of diseaseList) {
      this.diseases.set(d.id, { ...d, createdAt: now, updatedAt: now });
    }

    // 3. Allergies
    const allergyList: Array<Omit<Allergy, 'createdAt' | 'updatedAt'>> = [
      { id: 'alg-1', name: 'Peanut', description: 'Peanut and groundnut derivatives', status: 'ACTIVE' },
      { id: 'alg-2', name: 'Milk', description: 'Dairy, lactose, whey, and casein', status: 'ACTIVE' },
      { id: 'alg-3', name: 'Egg', description: 'Egg whites and yolk proteins', status: 'ACTIVE' },
      { id: 'alg-4', name: 'Fish', description: 'Finned fish and fish by-products', status: 'ACTIVE' },
      { id: 'alg-5', name: 'Shellfish', description: 'Crustaceans and mollusks', status: 'ACTIVE' },
      { id: 'alg-6', name: 'Soy', description: 'Soybeans, soy lecithin, and soy sauce', status: 'ACTIVE' },
      { id: 'alg-7', name: 'Wheat', description: 'Wheat flour, bran, and gluten components', status: 'ACTIVE' },
      { id: 'alg-8', name: 'Tree Nuts', description: 'Almonds, walnuts, cashews, hazelnuts', status: 'ACTIVE' },
    ];
    for (const a of allergyList) {
      this.allergies.set(a.id, { ...a, createdAt: now, updatedAt: now });
    }

    // Patient Diseases
    this.patientDiseases.set('pat-1_dis-1', {
      id: 'pd-1',
      patientId: 'pat-1',
      diseaseId: 'dis-1', // Diabetes
      doctorId: 'doc-1',
      notes: 'Type 2 Diabetes, closely monitor carb intake',
      createdAt: now,
    });
    this.patientDiseases.set('pat-2_dis-2', {
      id: 'pd-2',
      patientId: 'pat-2',
      diseaseId: 'dis-2', // Hypertension
      doctorId: 'doc-1',
      notes: 'Stage 2 Hypertension, strict low-sodium dietary order',
      createdAt: now,
    });

    // Patient Allergies
    this.patientAllergies.set('pat-1_alg-1', {
      id: 'pa-1',
      patientId: 'pat-1',
      allergyId: 'alg-1', // Peanut
      severity: Severity.SEVERE,
      doctorId: 'doc-1',
      notes: 'Anaphylactic history; strict allergen isolation mandatory',
      createdAt: now,
    });
    this.patientAllergies.set('pat-2_alg-2', {
      id: 'pa-2',
      patientId: 'pat-2',
      allergyId: 'alg-2', // Milk
      severity: Severity.MODERATE,
      doctorId: 'doc-1',
      notes: 'GI distress and hives upon dairy ingestion',
      createdAt: now,
    });

    // 4. Ingredients
    const ingredientList: Array<Omit<Ingredient, 'createdAt' | 'updatedAt'>> = [
      { id: 'ing-1', name: 'Rolled Oats', description: 'Whole grain soluble fiber', status: 'ACTIVE' },
      { id: 'ing-2', name: 'Almond Milk', description: 'Unsweetened plant milk', status: 'ACTIVE' },
      { id: 'ing-3', name: 'Brown Rice', description: 'Complex carbohydrate whole grain', status: 'ACTIVE' },
      { id: 'ing-4', name: 'Fresh Atlantic Salmon', description: 'High omega-3 lean protein', status: 'ACTIVE' },
      { id: 'ing-5', name: 'Steamed Broccoli', description: 'Cruciferous vegetable rich in vitamins', status: 'ACTIVE' },
      { id: 'ing-6', name: 'Extra Virgin Olive Oil', description: 'Monounsaturated cooking fat', status: 'ACTIVE' },
      { id: 'ing-7', name: 'Chicken Breast', description: 'Skinless boneless lean protein', status: 'ACTIVE' },
      { id: 'ing-8', name: 'Peanut Oil', description: 'Extracted peanut oil', status: 'ACTIVE' },
      { id: 'ing-9', name: 'Crushed Peanuts', description: 'Roasted ground peanuts', status: 'ACTIVE' },
      { id: 'ing-10', name: 'Cow Milk Whole', description: 'Pasteurized dairy milk', status: 'ACTIVE' },
      { id: 'ing-11', name: 'Refined Sugar', description: 'Simple carbohydrate sucrose', status: 'ACTIVE' },
      { id: 'ing-12', name: 'All-Purpose Wheat Flour', description: 'Enriched wheat flour containing gluten', status: 'ACTIVE' },
      { id: 'ing-13', name: 'Fresh Blueberries', description: 'Low glycemic antioxidant berry', status: 'ACTIVE' },
      { id: 'ing-14', name: 'Chia Seeds', description: 'Fiber and omega fatty acids', status: 'ACTIVE' },
      { id: 'ing-15', name: 'Low Sodium Vegetable Broth', description: 'Clear strained herb vegetable broth', status: 'ACTIVE' },
    ];
    for (const ing of ingredientList) {
      this.ingredients.set(ing.id, { ...ing, createdAt: now, updatedAt: now });
    }

    // 5. Foods
    const foodList: Array<Omit<Food, 'createdAt' | 'updatedAt'>> = [
      {
        id: 'food-1',
        name: 'Steel-Cut Oats with Berries',
        category: FoodCategory.BREAKFAST,
        description: 'Heart-healthy high-fiber oats topped with fresh blueberries and chia seeds.',
        calories: 280,
        protein: 9,
        carbohydrates: 48,
        fat: 5,
        sodium: 15,
        sugar: 6,
        preparationInstructions: 'Slow simmer rolled oats with water. Top with fresh blueberries and chia seeds.',
        status: 'ACTIVE',
        createdBy: 'doc-1',
      },
      {
        id: 'food-2',
        name: 'Herbed Brown Rice Bowl',
        category: FoodCategory.LUNCH,
        description: 'Steamed organic brown rice seasoned with herbs and extra virgin olive oil.',
        calories: 320,
        protein: 7,
        carbohydrates: 58,
        fat: 6,
        sodium: 40,
        sugar: 1,
        preparationInstructions: 'Steam brown rice with filtered water. Drizzle with extra virgin olive oil and fresh parsley.',
        status: 'ACTIVE',
        createdBy: 'doc-1',
      },
      {
        id: 'food-3',
        name: 'Steamed Salmon with Greens',
        category: FoodCategory.DINNER,
        description: 'Atlantic salmon fillet gently steamed with crisp broccoli and lemon herb zest.',
        calories: 410,
        protein: 38,
        carbohydrates: 12,
        fat: 16,
        sodium: 95,
        sugar: 2,
        preparationInstructions: 'Steam salmon fillet for 11 minutes at 100°C. Steam broccoli separately. No added sodium.',
        status: 'ACTIVE',
        createdBy: 'doc-1',
      },
      {
        id: 'food-4',
        name: 'Diabetic Lean Chicken Broth',
        category: FoodCategory.LUNCH,
        description: 'Poached lean chicken breast in clear low-sodium vegetable broth with greens.',
        calories: 240,
        protein: 32,
        carbohydrates: 6,
        fat: 4,
        sodium: 120,
        sugar: 1,
        preparationInstructions: 'Simmer trimmed chicken breast in filtered low-sodium broth until tender. Shred and serve.',
        status: 'ACTIVE',
        createdBy: 'doc-1',
      },
      {
        id: 'food-5',
        name: 'Peanut Chicken Curry',
        category: FoodCategory.DINNER,
        description: 'Tender chicken simmered in rich peanut satay sauce with peanut oil.',
        calories: 580,
        protein: 34,
        carbohydrates: 28,
        fat: 32,
        sodium: 480,
        sugar: 9,
        preparationInstructions: 'Contains crushed roasted peanuts and peanut oil. Simmer chicken breast in peanut curry base.',
        status: 'ACTIVE',
        createdBy: 'ks-1',
      },
      {
        id: 'food-6',
        name: 'Frosted Chocolate Cake',
        category: FoodCategory.SNACK,
        description: 'High sugar dessert cake with dairy cream frosting and refined wheat flour.',
        calories: 490,
        protein: 4,
        carbohydrates: 72,
        fat: 22,
        sodium: 310,
        sugar: 54,
        preparationInstructions: 'Baked confection containing wheat flour, refined sugar, whole cow milk, and cocoa.',
        status: 'ACTIVE',
        createdBy: 'ks-1',
      },
    ];

    for (const f of foodList) {
      this.foods.set(f.id, { ...f, createdAt: now, updatedAt: now });
    }

    // Food Ingredients Association
    const associations: Array<[string, string[]]> = [
      ['food-1', ['ing-1', 'ing-13', 'ing-14']], // Oats, blueberries, chia seeds
      ['food-2', ['ing-3', 'ing-6']], // Brown rice, olive oil
      ['food-3', ['ing-4', 'ing-5', 'ing-6']], // Salmon, broccoli, olive oil
      ['food-4', ['ing-7', 'ing-15', 'ing-5']], // Chicken breast, broth, broccoli
      ['food-5', ['ing-7', 'ing-8', 'ing-9']], // Chicken, peanut oil, crushed peanuts
      ['food-6', ['ing-11', 'ing-12', 'ing-10']], // Sugar, wheat flour, cow milk
    ];

    for (const [foodId, ingIds] of associations) {
      for (const ingId of ingIds) {
        this.foodIngredients.set(`${foodId}_${ingId}`, {
          id: `fi-${foodId}-${ingId}`,
          foodId,
          ingredientId: ingId,
        });
      }
    }

    // Disease Food Rules
    const rules: DiseaseFoodRule[] = [
      // Diabetes (dis-1)
      { id: 'dfr-1', diseaseId: 'dis-1', foodId: 'food-1', ruleType: RuleType.RECOMMENDED, reason: 'High soluble beta-glucan fiber slows glucose absorption', createdAt: now },
      { id: 'dfr-2', diseaseId: 'dis-1', foodId: 'food-2', ruleType: RuleType.RECOMMENDED, reason: 'Complex whole grain carbohydrates prevent rapid glycemic spikes', createdAt: now },
      { id: 'dfr-3', diseaseId: 'dis-1', foodId: 'food-3', ruleType: RuleType.RECOMMENDED, reason: 'High protein and omega-3 fatty acids with negligible sugar', createdAt: now },
      { id: 'dfr-4', diseaseId: 'dis-1', foodId: 'food-4', ruleType: RuleType.RECOMMENDED, reason: 'Lean protein meal with low glycemic impact', createdAt: now },
      { id: 'dfr-5', diseaseId: 'dis-1', foodId: 'food-6', ruleType: RuleType.AVOID, reason: 'Excessive refined sucrose triggers severe hyperglycemia', createdAt: now },

      // Hypertension (dis-2)
      { id: 'dfr-6', diseaseId: 'dis-2', foodId: 'food-1', ruleType: RuleType.RECOMMENDED, reason: 'Naturally low sodium breakfast supportive of DASH diet', createdAt: now },
      { id: 'dfr-7', diseaseId: 'dis-2', foodId: 'food-3', ruleType: RuleType.RECOMMENDED, reason: 'Omega-3 fatty acids promote vascular arterial elasticity', createdAt: now },
      { id: 'dfr-8', diseaseId: 'dis-2', foodId: 'food-5', ruleType: RuleType.AVOID, reason: 'Elevated sodium content contraindicates blood pressure regulation', createdAt: now },
    ];
    for (const r of rules) {
      this.diseaseFoodRules.set(r.id, r);
    }

    // Doctor Approvals for Patient 1 (Eleanor Vance)
    this.doctorFoodApprovals.set('pat-1_food-1', {
      id: 'dfa-1',
      patientId: 'pat-1',
      foodId: 'food-1', // Oats
      doctorId: 'doc-1',
      status: ApprovalStatus.APPROVED,
      remarks: 'Clinically approved for glycemic and cardiac stability.',
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    this.doctorFoodApprovals.set('pat-1_food-2', {
      id: 'dfa-2',
      patientId: 'pat-1',
      foodId: 'food-2', // Brown Rice
      doctorId: 'doc-1',
      status: ApprovalStatus.APPROVED,
      remarks: 'Approved for dietary lunch session.',
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    this.doctorFoodApprovals.set('pat-1_food-3', {
      id: 'dfa-3',
      patientId: 'pat-1',
      foodId: 'food-3', // Salmon
      doctorId: 'doc-1',
      status: ApprovalStatus.APPROVED,
      remarks: 'High protein recovery meal approved.',
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    this.doctorFoodApprovals.set('pat-1_food-5', {
      id: 'dfa-4',
      patientId: 'pat-1',
      foodId: 'food-5', // Peanut Curry
      doctorId: 'doc-1',
      status: ApprovalStatus.REJECTED,
      remarks: 'REJECTED: Patient has life-threatening peanut allergy.',
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Doctor Approvals for Patient 2
    this.doctorFoodApprovals.set('pat-2_food-1', {
      id: 'dfa-5',
      patientId: 'pat-2',
      foodId: 'food-1',
      doctorId: 'doc-1',
      status: ApprovalStatus.APPROVED,
      remarks: 'Approved low-sodium breakfast.',
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    this.doctorFoodApprovals.set('pat-2_food-3', {
      id: 'dfa-6',
      patientId: 'pat-2',
      foodId: 'food-3',
      doctorId: 'doc-1',
      status: ApprovalStatus.APPROVED,
      remarks: 'Approved cardio-protective meal.',
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Kitchen Availabilities for TODAY
    const todayStr = new Date().toISOString().split('T')[0];
    const availabilities: KitchenAvailability[] = [
      {
        id: 'ka-1',
        foodId: 'food-1', // Oats
        date: todayStr,
        mealType: MealType.BREAKFAST,
        startTime: '06:00',
        endTime: '23:59', // Full day window for testing accessibility
        status: AvailabilityStatus.ACTIVE,
        createdBy: 'ks-1',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ka-2',
        foodId: 'food-2', // Brown Rice
        date: todayStr,
        mealType: MealType.LUNCH,
        startTime: '06:00',
        endTime: '23:59',
        status: AvailabilityStatus.ACTIVE,
        createdBy: 'ks-1',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ka-3',
        foodId: 'food-3', // Salmon
        date: todayStr,
        mealType: MealType.DINNER,
        startTime: '06:00',
        endTime: '23:59',
        status: AvailabilityStatus.ACTIVE,
        createdBy: 'ks-1',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ka-4',
        foodId: 'food-4', // Chicken Broth
        date: todayStr,
        mealType: MealType.LUNCH,
        startTime: '06:00',
        endTime: '23:59',
        status: AvailabilityStatus.ACTIVE,
        createdBy: 'ks-1',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ka-5',
        foodId: 'food-5', // Peanut Curry
        date: todayStr,
        mealType: MealType.DINNER,
        startTime: '06:00',
        endTime: '23:59',
        status: AvailabilityStatus.ACTIVE,
        createdBy: 'ks-1',
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const a of availabilities) {
      this.kitchenAvailabilities.set(a.id, a);
    }

    // Existing Delivered Order for Patient 1 (for feedback test)
    const existingOrder: Order = {
      id: 'ord-101',
      orderNumber: 'ORD-2026-101',
      patientId: 'pat-1',
      foodId: 'food-1',
      status: OrderStatus.DELIVERED,
      specialInstructions: 'Warm to bedside; low temperature',
      preparationWarnings: ['Allergy alert: Patient Eleanor Vance has SEVERE Peanut allergy'],
      crossContactWarnings: ['Strict allergen isolation mandatory during preparation'],
      createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      updatedAt: now,
    };
    this.orders.set(existingOrder.id, existingOrder);

    this.orderStatusHistories.set('osh-1', {
      id: 'osh-1',
      orderId: existingOrder.id,
      status: OrderStatus.PENDING,
      changedBy: 'pat-1',
      notes: 'Initial order placement',
      createdAt: new Date(Date.now() - 3600000 * 2),
    });
    this.orderStatusHistories.set('osh-2', {
      id: 'osh-2',
      orderId: existingOrder.id,
      status: OrderStatus.DELIVERED,
      changedBy: 'ks-1',
      notes: 'Delivered to room 304-B',
      createdAt: now,
    });

    // Notifications
    this.notifications.set('notif-1', {
      id: 'notif-1',
      userId: patientUser1.id,
      type: NotificationType.FOOD_APPROVED,
      title: 'Doctor Approved Meals',
      message: 'Dr. Sarah Mitchell approved Steel-Cut Oats and Steamed Salmon for your diet.',
      isRead: false,
      metadata: { doctorId: 'doc-1' },
      createdAt: now,
    });

    // Audit Log
    this.auditLogs.set('aud-1', {
      id: 'aud-1',
      userId: docUser1.id,
      action: 'Doctor approved food',
      entity: 'DoctorFoodApproval',
      entityId: 'dfa-1',
      metadata: { patientId: 'pat-1', foodId: 'food-1', status: 'APPROVED' },
      timestamp: now,
    });

    this.initialized = true;
    await this.syncToMongo();
  }

  public async syncToMongo(): Promise<void> {
    if (!isDatabaseConnected()) return;
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        await UserModel.insertMany(Array.from(this.users.values()));
        await PatientModel.insertMany(Array.from(this.patients.values()));
        await DoctorModel.insertMany(Array.from(this.doctors.values()));
        await KitchenStaffModel.insertMany(Array.from(this.kitchenStaff.values()));
        await DiseaseModel.insertMany(Array.from(this.diseases.values()));
        await PatientDiseaseModel.insertMany(Array.from(this.patientDiseases.values()));
        await AllergyModel.insertMany(Array.from(this.allergies.values()));
        await PatientAllergyModel.insertMany(Array.from(this.patientAllergies.values()));
        await FoodModel.insertMany(Array.from(this.foods.values()));
        await IngredientModel.insertMany(Array.from(this.ingredients.values()));
        await FoodIngredientModel.insertMany(Array.from(this.foodIngredients.values()));
        await DiseaseFoodRuleModel.insertMany(Array.from(this.diseaseFoodRules.values()));
        await DoctorFoodApprovalModel.insertMany(Array.from(this.doctorFoodApprovals.values()));
        await KitchenAvailabilityModel.insertMany(Array.from(this.kitchenAvailabilities.values()));
        await OrderModel.insertMany(Array.from(this.orders.values()));
        await OrderStatusHistoryModel.insertMany(Array.from(this.orderStatusHistories.values()));
        await FeedbackModel.insertMany(Array.from(this.feedbacks.values()));
        await NotificationModel.insertMany(Array.from(this.notifications.values()));
        await AuditLogModel.insertMany(Array.from(this.auditLogs.values()));
      }
    } catch (err) {
      // Non-blocking sync error
    }
  }
}

export const db = new InMemoryHospitalDatabase();
// Auto seed in-memory store immediately
db.seed().catch((err) => console.error('Error seeding hospital database:', err));
