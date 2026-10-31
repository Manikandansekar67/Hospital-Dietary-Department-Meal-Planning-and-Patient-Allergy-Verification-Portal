/**
 * Test Suite for MongoDB ODM & Mongoose Models
 */

import {
  UserModel,
  PatientModel,
  DoctorModel,
  FoodModel,
  AllergyModel,
  DiseaseModel,
  OrderModel,
} from '../src/models/index.js';
import { Role, UserStatus, FoodCategory, OrderStatus } from '../src/constants/index.js';

export function runModelValidationTests(): boolean {
  console.log('Testing Mongoose Schemas & Model Definitions...');

  // 1. User Model Schema Validation
  const testUser = new UserModel({
    id: 'test-usr-1',
    name: 'Test Clinical User',
    email: 'TEST@HOSPITAL.COM',
    passwordHash: 'hashed_pw_sample',
    role: Role.DOCTOR,
    status: UserStatus.ACTIVE,
  });

  const userErr = testUser.validateSync();
  if (userErr) {
    console.error('User validation failed:', userErr);
    return false;
  }
  // Email lowercase transform check
  if (testUser.email !== 'test@hospital.com') {
    console.error('User email was not normalized to lowercase:', testUser.email);
    return false;
  }
  console.log('✓ UserModel schema validation passed');

  // 2. Patient Model Schema Validation
  const testPatient = new PatientModel({
    id: 'test-pat-1',
    userId: 'test-usr-1',
    patientNumber: 'P-99999',
    age: 42,
    gender: 'MALE',
    roomNumber: 'Room 102',
  });
  const patientErr = testPatient.validateSync();
  if (patientErr) {
    console.error('Patient validation failed:', patientErr);
    return false;
  }
  console.log('✓ PatientModel schema validation passed');

  // 3. Doctor Model Schema Validation
  const testDoctor = new DoctorModel({
    id: 'test-doc-1',
    userId: 'test-usr-1',
    department: 'Cardiology & Nutrition',
    licenseNumber: 'MD-12345',
  });
  const doctorErr = testDoctor.validateSync();
  if (doctorErr) {
    console.error('Doctor validation failed:', doctorErr);
    return false;
  }
  console.log('✓ DoctorModel schema validation passed');

  // 4. Food Model Schema Validation
  const testFood = new FoodModel({
    id: 'test-food-1',
    name: 'Steamed Greens & Tofu',
    category: FoodCategory.LUNCH,
    calories: 220,
    protein: 18,
    carbohydrates: 12,
    fat: 6,
    sodium: 45,
    sugar: 2,
    status: 'ACTIVE',
  });
  const foodErr = testFood.validateSync();
  if (foodErr) {
    console.error('Food validation failed:', foodErr);
    return false;
  }
  console.log('✓ FoodModel schema validation passed');

  // 5. Allergy & Disease Validation
  const testAllergy = new AllergyModel({
    id: 'test-alg-1',
    name: 'Shellfish',
    status: 'ACTIVE',
  });
  const allergyErr = testAllergy.validateSync();
  if (allergyErr) {
    console.error('Allergy validation failed:', allergyErr);
    return false;
  }
  console.log('✓ AllergyModel schema validation passed');

  const testDisease = new DiseaseModel({
    id: 'test-dis-1',
    name: 'Hypertension',
    status: 'ACTIVE',
  });
  const diseaseErr = testDisease.validateSync();
  if (diseaseErr) {
    console.error('Disease validation failed:', diseaseErr);
    return false;
  }
  console.log('✓ DiseaseModel schema validation passed');

  // 6. Order Model Schema Validation
  const testOrder = new OrderModel({
    id: 'test-ord-1',
    orderNumber: 'ORD-TEST-1',
    patientId: 'test-pat-1',
    foodId: 'test-food-1',
    status: OrderStatus.PENDING,
    preparationWarnings: ['Allergy alert: Shellfish'],
    crossContactWarnings: ['Strict isolation'],
  });
  const orderErr = testOrder.validateSync();
  if (orderErr) {
    console.error('Order validation failed:', orderErr);
    return false;
  }
  console.log('✓ OrderModel schema validation passed');

  console.log('\nAll Mongoose models and schema validators passed successfully!');
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('database.test.ts')) {
  const success = runModelValidationTests();
  process.exit(success ? 0 : 1);
}
