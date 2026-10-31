/**
 * Database Seed Script for MongoDB via Mongoose
 * Run with: tsx scripts/seed.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.config.js';
import { logger } from '../src/utils/logger.js';
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
} from '../src/constants/index.js';
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
} from '../src/models/index.js';

export async function seedMongoDB(): Promise<void> {
  const uri = env.MONGODB_URI;

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
      logger.info(`Connected to MongoDB at ${uri} for seeding`);
    }

    const defaultPasswordHash = await bcrypt.hash('Hospital@123', 10);
    const now = new Date();

    // Clear existing collections safely for clean, idempotent re-run
    await Promise.all([
      UserModel.deleteMany({}),
      PatientModel.deleteMany({}),
      DoctorModel.deleteMany({}),
      KitchenStaffModel.deleteMany({}),
      DiseaseModel.deleteMany({}),
      PatientDiseaseModel.deleteMany({}),
      AllergyModel.deleteMany({}),
      PatientAllergyModel.deleteMany({}),
      FoodModel.deleteMany({}),
      IngredientModel.deleteMany({}),
      FoodIngredientModel.deleteMany({}),
      DiseaseFoodRuleModel.deleteMany({}),
      DoctorFoodApprovalModel.deleteMany({}),
      KitchenAvailabilityModel.deleteMany({}),
      KitchenStatusModel.deleteMany({}),
      OrderModel.deleteMany({}),
      OrderStatusHistoryModel.deleteMany({}),
      FeedbackModel.deleteMany({}),
      NotificationModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
    ]);

    logger.info('Cleaned existing MongoDB collections. Inserting initial records...');

    // 1. Users (1 Admin, 2 Doctors, 2 Kitchen Staff, 3 Patients)
    const users = [
      {
        id: 'usr-admin-1',
        name: 'System Administrator',
        email: 'admin@hospital.com',
        passwordHash: defaultPasswordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
      {
        id: 'usr-doc-1',
        name: 'Dr. Sarah Mitchell, MD',
        email: 'doctor@hospital.com',
        passwordHash: defaultPasswordHash,
        role: Role.DOCTOR,
        status: UserStatus.ACTIVE,
      },
      {
        id: 'usr-doc-2',
        name: 'Dr. James Wilson, MD',
        email: 'doctor2@hospital.com',
        passwordHash: defaultPasswordHash,
        role: Role.DOCTOR,
        status: UserStatus.ACTIVE,
      },
      {
        id: 'usr-kitchen-1',
        name: 'Chef Marcus Vance',
        email: 'kitchen@hospital.com',
        passwordHash: defaultPasswordHash,
        role: Role.KITCHEN,
        status: UserStatus.ACTIVE,
      },
      {
        id: 'usr-kitchen-2',
        name: 'Chef Elena Rostova',
        email: 'kitchen2@hospital.com',
        passwordHash: defaultPasswordHash,
        role: Role.KITCHEN,
        status: UserStatus.ACTIVE,
      },
      {
        id: 'usr-patient-1',
        name: 'Eleanor Vance',
        email: 'patient@hospital.com',
        passwordHash: defaultPasswordHash,
        role: Role.PATIENT,
        status: UserStatus.ACTIVE,
      },
      {
        id: 'usr-patient-2',
        name: 'Robert Chen',
        email: 'robert.chen@hospital.com',
        passwordHash: defaultPasswordHash,
        role: Role.PATIENT,
        status: UserStatus.ACTIVE,
      },
      {
        id: 'usr-patient-3',
        name: 'Maria Garcia',
        email: 'maria.garcia@hospital.com',
        passwordHash: defaultPasswordHash,
        role: Role.PATIENT,
        status: UserStatus.ACTIVE,
      },
    ];
    await UserModel.insertMany(users);

    // 2. Doctors, Kitchen Staff, Patients
    await DoctorModel.insertMany([
      {
        id: 'doc-1',
        userId: 'usr-doc-1',
        department: 'Clinical Nutrition & Endocrinology',
        licenseNumber: 'MD-94021',
      },
      {
        id: 'doc-2',
        userId: 'usr-doc-2',
        department: 'Cardiovascular Dietetics',
        licenseNumber: 'MD-88145',
      },
    ]);

    await KitchenStaffModel.insertMany([
      {
        id: 'ks-1',
        userId: 'usr-kitchen-1',
        station: 'Main Dietary & Allergen Station',
      },
      {
        id: 'ks-2',
        userId: 'usr-kitchen-2',
        station: 'Therapeutic Soft Diet Station',
      },
    ]);

    await PatientModel.insertMany([
      {
        id: 'pat-1',
        userId: 'usr-patient-1',
        patientNumber: 'P-10023',
        age: 58,
        gender: 'FEMALE',
        roomNumber: 'Room 304-B',
      },
      {
        id: 'pat-2',
        userId: 'usr-patient-2',
        patientNumber: 'P-10024',
        age: 64,
        gender: 'MALE',
        roomNumber: 'Room 412-A',
      },
      {
        id: 'pat-3',
        userId: 'usr-patient-3',
        patientNumber: 'P-10025',
        age: 42,
        gender: 'FEMALE',
        roomNumber: 'Room 205-C',
      },
    ]);

    // 3. Clinical Master Data (Diseases & Allergies)
    const diseases = [
      { id: 'dis-1', name: 'Type 2 Diabetes', description: 'Metabolic disorder requiring low glycemic index foods', status: 'ACTIVE' },
      { id: 'dis-2', name: 'Hypertension', description: 'High blood pressure requiring low sodium dietary protocol', status: 'ACTIVE' },
      { id: 'dis-3', name: 'Heart Disease', description: 'Cardiovascular condition requiring low saturated fat and cholesterol', status: 'ACTIVE' },
      { id: 'dis-4', name: 'Chronic Kidney Disease', description: 'Renal disorder requiring strict protein, sodium, and potassium regulation', status: 'ACTIVE' },
      { id: 'dis-5', name: 'Celiac Disease', description: 'Autoimmune gluten intolerance requiring 100% gluten-free diet', status: 'ACTIVE' },
      { id: 'dis-6', name: 'Congestive Heart Failure', description: 'Cardiac volume management requiring fluid and sodium restrictions', status: 'ACTIVE' },
    ];
    await DiseaseModel.insertMany(diseases);

    const allergies = [
      { id: 'alg-1', name: 'Peanut', description: 'Peanut and groundnut derivatives', status: 'ACTIVE' },
      { id: 'alg-2', name: 'Milk', description: 'Dairy, lactose, whey, and casein', status: 'ACTIVE' },
      { id: 'alg-3', name: 'Egg', description: 'Egg whites and yolk proteins', status: 'ACTIVE' },
      { id: 'alg-4', name: 'Fish', description: 'Finned fish and fish by-products', status: 'ACTIVE' },
      { id: 'alg-5', name: 'Shellfish', description: 'Crustaceans and mollusks', status: 'ACTIVE' },
      { id: 'alg-6', name: 'Soy', description: 'Soybeans, soy lecithin, and soy sauce', status: 'ACTIVE' },
      { id: 'alg-7', name: 'Gluten', description: 'Wheat flour, barley, rye, and gluten proteins', status: 'ACTIVE' },
      { id: 'alg-8', name: 'Tree Nuts', description: 'Almonds, walnuts, cashews, hazelnuts', status: 'ACTIVE' },
    ];
    await AllergyModel.insertMany(allergies);

    // Patient Clinical Profiles
    await PatientDiseaseModel.insertMany([
      { id: 'pd-1', patientId: 'pat-1', diseaseId: 'dis-1', doctorId: 'doc-1', notes: 'Type 2 Diabetes, closely monitor carb intake' },
      { id: 'pd-2', patientId: 'pat-2', diseaseId: 'dis-2', doctorId: 'doc-1', notes: 'Stage 2 Hypertension, strict low-sodium dietary order' },
      { id: 'pd-3', patientId: 'pat-3', diseaseId: 'dis-5', doctorId: 'doc-2', notes: 'Biopsy-confirmed Celiac Disease, strict zero-gluten' },
    ]);

    await PatientAllergyModel.insertMany([
      { id: 'pa-1', patientId: 'pat-1', allergyId: 'alg-1', severity: Severity.CRITICAL, doctorId: 'doc-1', notes: 'Anaphylactic history; strict allergen isolation mandatory' },
      { id: 'pa-2', patientId: 'pat-2', allergyId: 'alg-2', severity: Severity.MODERATE, doctorId: 'doc-1', notes: 'GI distress and hives upon dairy ingestion' },
      { id: 'pa-3', patientId: 'pat-3', allergyId: 'alg-7', severity: Severity.SEVERE, doctorId: 'doc-2', notes: 'Severe autoimmune reaction to any wheat or gluten' },
    ]);

    // 4. Canonical Ingredients
    const ingredients = [
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
      { id: 'ing-12', name: 'Wheat Flour', description: 'Enriched wheat flour containing gluten', status: 'ACTIVE' },
      { id: 'ing-13', name: 'Fresh Blueberries', description: 'Low glycemic antioxidant berry', status: 'ACTIVE' },
      { id: 'ing-14', name: 'Chia Seeds', description: 'Fiber and omega fatty acids', status: 'ACTIVE' },
      { id: 'ing-15', name: 'Low Sodium Vegetable Broth', description: 'Clear strained herb vegetable broth', status: 'ACTIVE' },
      { id: 'ing-16', name: 'Fresh Lemon Juice', description: 'Natural citrus flavor', status: 'ACTIVE' },
      { id: 'ing-17', name: 'Green Tea Leaves', description: 'Antioxidant herbal infusion', status: 'ACTIVE' },
    ];
    await IngredientModel.insertMany(ingredients);

    // 5. Foods across all 5 meal categories
    const foods = [
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
      {
        id: 'food-7',
        name: 'Citrus Green Tea Cooler',
        category: FoodCategory.BEVERAGE,
        description: 'Antioxidant green tea with fresh lemon slices and mint. Naturally unsweetened.',
        calories: 15,
        protein: 0,
        carbohydrates: 3,
        fat: 0,
        sodium: 5,
        sugar: 0,
        preparationInstructions: 'Steep green tea leaves at 80°C. Chill and infuse with fresh lemon juice and mint.',
        status: 'ACTIVE',
        createdBy: 'doc-1',
      },
    ];
    await FoodModel.insertMany(foods);

    // Food Ingredients Associations
    await FoodIngredientModel.insertMany([
      { id: 'fi-1', foodId: 'food-1', ingredientId: 'ing-1' },
      { id: 'fi-2', foodId: 'food-1', ingredientId: 'ing-13' },
      { id: 'fi-3', foodId: 'food-1', ingredientId: 'ing-14' },
      { id: 'fi-4', foodId: 'food-2', ingredientId: 'ing-3' },
      { id: 'fi-5', foodId: 'food-2', ingredientId: 'ing-6' },
      { id: 'fi-6', foodId: 'food-3', ingredientId: 'ing-4' },
      { id: 'fi-7', foodId: 'food-3', ingredientId: 'ing-5' },
      { id: 'fi-8', foodId: 'food-3', ingredientId: 'ing-6' },
      { id: 'fi-9', foodId: 'food-4', ingredientId: 'ing-7' },
      { id: 'fi-10', foodId: 'food-4', ingredientId: 'ing-15' },
      { id: 'fi-11', foodId: 'food-4', ingredientId: 'ing-5' },
      { id: 'fi-12', foodId: 'food-5', ingredientId: 'ing-7' },
      { id: 'fi-13', foodId: 'food-5', ingredientId: 'ing-8' },
      { id: 'fi-14', foodId: 'food-5', ingredientId: 'ing-9' },
      { id: 'fi-15', foodId: 'food-6', ingredientId: 'ing-11' },
      { id: 'fi-16', foodId: 'food-6', ingredientId: 'ing-12' },
      { id: 'fi-17', foodId: 'food-6', ingredientId: 'ing-10' },
      { id: 'fi-18', foodId: 'food-7', ingredientId: 'ing-17' },
      { id: 'fi-19', foodId: 'food-7', ingredientId: 'ing-16' },
    ]);

    // Disease Rules
    await DiseaseFoodRuleModel.insertMany([
      { id: 'dfr-1', diseaseId: 'dis-1', foodId: 'food-1', ruleType: RuleType.RECOMMENDED, reason: 'High soluble beta-glucan fiber slows glucose absorption' },
      { id: 'dfr-2', diseaseId: 'dis-1', foodId: 'food-2', ruleType: RuleType.RECOMMENDED, reason: 'Complex whole grain carbohydrates prevent rapid glycemic spikes' },
      { id: 'dfr-3', diseaseId: 'dis-1', foodId: 'food-3', ruleType: RuleType.RECOMMENDED, reason: 'High protein and omega-3 fatty acids with negligible sugar' },
      { id: 'dfr-4', diseaseId: 'dis-1', foodId: 'food-4', ruleType: RuleType.RECOMMENDED, reason: 'Lean protein meal with low glycemic impact' },
      { id: 'dfr-5', diseaseId: 'dis-1', foodId: 'food-6', ruleType: RuleType.AVOID, reason: 'Excessive refined sucrose triggers severe hyperglycemia' },
      { id: 'dfr-6', diseaseId: 'dis-2', foodId: 'food-1', ruleType: RuleType.RECOMMENDED, reason: 'Naturally low sodium breakfast supportive of DASH diet' },
      { id: 'dfr-7', diseaseId: 'dis-2', foodId: 'food-3', ruleType: RuleType.RECOMMENDED, reason: 'Omega-3 fatty acids promote vascular arterial elasticity' },
      { id: 'dfr-8', diseaseId: 'dis-2', foodId: 'food-5', ruleType: RuleType.AVOID, reason: 'Elevated sodium content contraindicates blood pressure regulation' },
      { id: 'dfr-9', diseaseId: 'dis-5', foodId: 'food-6', ruleType: RuleType.AVOID, reason: 'Contains wheat flour with gluten; strictly contraindicated for Celiac Disease' },
      { id: 'dfr-10', diseaseId: 'dis-5', foodId: 'food-3', ruleType: RuleType.RECOMMENDED, reason: 'Naturally gluten-free steamed salmon with fresh greens' },
    ]);

    // Doctor Approvals
    await DoctorFoodApprovalModel.insertMany([
      { id: 'dfa-1', patientId: 'pat-1', foodId: 'food-1', doctorId: 'doc-1', status: ApprovalStatus.APPROVED, remarks: 'Clinically approved for glycemic stability.', approvedAt: now },
      { id: 'dfa-2', patientId: 'pat-1', foodId: 'food-2', doctorId: 'doc-1', status: ApprovalStatus.APPROVED, remarks: 'Approved for dietary lunch session.', approvedAt: now },
      { id: 'dfa-3', patientId: 'pat-1', foodId: 'food-3', doctorId: 'doc-1', status: ApprovalStatus.APPROVED, remarks: 'High protein recovery meal approved.', approvedAt: now },
      { id: 'dfa-4', patientId: 'pat-1', foodId: 'food-5', doctorId: 'doc-1', status: ApprovalStatus.REJECTED, remarks: 'REJECTED: Patient has life-threatening peanut allergy.', approvedAt: now },
      { id: 'dfa-5', patientId: 'pat-2', foodId: 'food-1', doctorId: 'doc-1', status: ApprovalStatus.APPROVED, remarks: 'Approved low-sodium breakfast.', approvedAt: now },
      { id: 'dfa-6', patientId: 'pat-2', foodId: 'food-3', doctorId: 'doc-1', status: ApprovalStatus.APPROVED, remarks: 'Approved cardio-protective meal.', approvedAt: now },
      { id: 'dfa-7', patientId: 'pat-3', foodId: 'food-3', doctorId: 'doc-2', status: ApprovalStatus.APPROVED, remarks: 'Approved 100% gluten-free salmon dinner.', approvedAt: now },
      { id: 'dfa-8', patientId: 'pat-3', foodId: 'food-7', doctorId: 'doc-2', status: ApprovalStatus.APPROVED, remarks: 'Approved antioxidant green tea beverage.', approvedAt: now },
    ]);

    // Kitchen Availability for Today
    const todayStr = new Date().toISOString().split('T')[0];
    await KitchenAvailabilityModel.insertMany([
      { id: 'ka-1', foodId: 'food-1', date: todayStr, mealType: MealType.BREAKFAST, startTime: '06:00', endTime: '23:59', status: AvailabilityStatus.ACTIVE, createdBy: 'ks-1' },
      { id: 'ka-2', foodId: 'food-2', date: todayStr, mealType: MealType.LUNCH, startTime: '06:00', endTime: '23:59', status: AvailabilityStatus.ACTIVE, createdBy: 'ks-1' },
      { id: 'ka-3', foodId: 'food-3', date: todayStr, mealType: MealType.DINNER, startTime: '06:00', endTime: '23:59', status: AvailabilityStatus.ACTIVE, createdBy: 'ks-1' },
      { id: 'ka-4', foodId: 'food-4', date: todayStr, mealType: MealType.LUNCH, startTime: '06:00', endTime: '23:59', status: AvailabilityStatus.ACTIVE, createdBy: 'ks-1' },
      { id: 'ka-5', foodId: 'food-7', date: todayStr, mealType: MealType.BREAKFAST, startTime: '06:00', endTime: '23:59', status: AvailabilityStatus.ACTIVE, createdBy: 'ks-1' },
    ]);

    await KitchenStatusModel.create({
      isActive: true,
      notes: 'Central Dietary Kitchen is active and operating under clinical HACCP standards.',
    });

    // Orders across different workflow statuses (DELIVERED, PREPARING, READY, PENDING)
    await OrderModel.insertMany([
      {
        id: 'ord-101',
        orderNumber: 'ORD-2026-101',
        patientId: 'pat-1',
        foodId: 'food-1',
        status: OrderStatus.DELIVERED,
        specialInstructions: 'Warm to bedside; low temperature',
        preparationWarnings: ['Allergy alert: Patient Eleanor Vance has SEVERE Peanut allergy'],
        crossContactWarnings: ['Strict allergen isolation mandatory during preparation'],
      },
      {
        id: 'ord-102',
        orderNumber: 'ORD-2026-102',
        patientId: 'pat-2',
        foodId: 'food-3',
        status: OrderStatus.PREPARING,
        specialInstructions: 'DASH diet: Zero added table salt',
        preparationWarnings: ['Patient Robert Chen has MODERATE Dairy allergy'],
        crossContactWarnings: ['Ensure sanitized utensils are used'],
      },
      {
        id: 'ord-103',
        orderNumber: 'ORD-2026-103',
        patientId: 'pat-3',
        foodId: 'food-7',
        status: OrderStatus.READY,
        specialInstructions: 'Extra lemon slice',
        preparationWarnings: ['Patient Maria Garcia has CRITICAL Gluten allergy'],
        crossContactWarnings: ['100% separate prep station required'],
      },
    ]);

    await OrderStatusHistoryModel.insertMany([
      { id: 'osh-1', orderId: 'ord-101', status: OrderStatus.PENDING, changedBy: 'pat-1', notes: 'Initial order placement by bedside' },
      { id: 'osh-2', orderId: 'ord-101', status: OrderStatus.PREPARING, changedBy: 'ks-1', notes: 'Tray assembled in allergen safe zone' },
      { id: 'osh-3', orderId: 'ord-101', status: OrderStatus.READY, changedBy: 'ks-1', notes: 'Final tray checked by dietary supervisor' },
      { id: 'osh-4', orderId: 'ord-101', status: OrderStatus.DELIVERED, changedBy: 'ks-1', notes: 'Delivered to Room 304-B' },
      { id: 'osh-5', orderId: 'ord-102', status: OrderStatus.PENDING, changedBy: 'pat-2', notes: 'Order placed by patient' },
      { id: 'osh-6', orderId: 'ord-102', status: OrderStatus.PREPARING, changedBy: 'ks-2', notes: 'Fish steaming cycle initiated' },
    ]);

    // Feedback for Delivered Order
    await FeedbackModel.create({
      id: 'fb-1',
      orderId: 'ord-101',
      patientId: 'pat-1',
      rating: 5,
      comment: 'Delicious steel-cut oats, and felt very reassured knowing the allergen checks were completed.',
    });

    // Notifications for each role
    await NotificationModel.insertMany([
      {
        id: 'notif-1',
        userId: 'usr-patient-1',
        type: NotificationType.FOOD_APPROVED,
        title: 'Doctor Approved Meals',
        message: 'Dr. Sarah Mitchell approved Steel-Cut Oats and Steamed Salmon for your diet.',
        isRead: false,
        metadata: { doctorId: 'doc-1' },
      },
      {
        id: 'notif-2',
        userId: 'usr-kitchen-1',
        type: NotificationType.ORDER_CREATED,
        title: 'New Meal Order Received',
        message: 'Order #ORD-2026-102 received for Room 412-A. Please review Dairy allergy notes.',
        isRead: false,
        metadata: { orderId: 'ord-102' },
      },
      {
        id: 'notif-3',
        userId: 'all',
        type: NotificationType.FOOD_APPROVED,
        title: 'Dietary Kitchen Status: ACTIVE',
        message: 'Central kitchen is active and processing verified meal requests.',
        isRead: false,
      },
    ]);

    // Audit Logs
    await AuditLogModel.insertMany([
      {
        id: 'aud-1',
        userId: 'usr-doc-1',
        action: 'Doctor approved food',
        entity: 'DoctorFoodApproval',
        entityId: 'dfa-1',
        metadata: { patientId: 'pat-1', foodId: 'food-1', status: 'APPROVED' },
      },
      {
        id: 'aud-2',
        userId: 'usr-doc-1',
        action: 'Doctor rejected food',
        entity: 'DoctorFoodApproval',
        entityId: 'dfa-4',
        metadata: { patientId: 'pat-1', foodId: 'food-5', status: 'REJECTED', reason: 'Peanut allergy conflict' },
      },
    ]);

    logger.info('MongoDB seed completed successfully with all clinical and dietary test entities!');
  } catch (error) {
    logger.error('Failed to seed MongoDB database:', error);
    throw error;
  }
}

// Allow CLI execution
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedMongoDB()
    .then(() => {
      console.log('MongoDB seeding finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('MongoDB seeding failed:', err);
      process.exit(1);
    });
}
