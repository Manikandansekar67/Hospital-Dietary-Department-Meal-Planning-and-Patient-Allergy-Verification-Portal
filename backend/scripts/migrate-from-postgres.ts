/**
 * Migration Script: PostgreSQL / Relational Schema to MongoDB (Mongoose)
 *
 * This utility script facilitates migrating legacy PostgreSQL database records or exported
 * JSON tables into MongoDB collections managed by Mongoose.
 */

import mongoose from 'mongoose';
import { env } from '../src/config/env.config.js';
import { logger } from '../src/utils/logger.js';
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

export interface PostgresExportData {
  users?: Array<Record<string, unknown>>;
  patients?: Array<Record<string, unknown>>;
  doctors?: Array<Record<string, unknown>>;
  kitchenStaff?: Array<Record<string, unknown>>;
  diseases?: Array<Record<string, unknown>>;
  patientDiseases?: Array<Record<string, unknown>>;
  allergies?: Array<Record<string, unknown>>;
  patientAllergies?: Array<Record<string, unknown>>;
  foods?: Array<Record<string, unknown>>;
  ingredients?: Array<Record<string, unknown>>;
  foodIngredients?: Array<Record<string, unknown>>;
  diseaseFoodRules?: Array<Record<string, unknown>>;
  doctorFoodApprovals?: Array<Record<string, unknown>>;
  kitchenAvailabilities?: Array<Record<string, unknown>>;
  orders?: Array<Record<string, unknown>>;
  orderStatusHistories?: Array<Record<string, unknown>>;
  feedbacks?: Array<Record<string, unknown>>;
  notifications?: Array<Record<string, unknown>>;
  auditLogs?: Array<Record<string, unknown>>;
}

export async function migrateFromPostgres(data?: PostgresExportData): Promise<{ migratedCount: number; errors: string[] }> {
  const uri = env.MONGODB_URI;
  const errors: string[] = [];
  let totalMigrated = 0;

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
      logger.info(`Connected to MongoDB at ${uri} for migration`);
    }

    if (!data) {
      logger.info('No external PostgreSQL JSON payload provided. Validating Mongoose collections...');
      const userCount = await UserModel.countDocuments();
      logger.info(`Current MongoDB users count: ${userCount}`);
      return { migratedCount: userCount, errors: [] };
    }

    // 1. Users
    if (data.users && data.users.length > 0) {
      for (const user of data.users) {
        try {
          await UserModel.findOneAndUpdate({ id: user.id }, { $set: user }, { upsert: true });
          totalMigrated++;
        } catch (err) {
          errors.push(`Failed to migrate user ${user.id}: ${(err as Error).message}`);
        }
      }
    }

    // 2. Patients & Doctors
    if (data.patients) {
      for (const p of data.patients) {
        try {
          await PatientModel.findOneAndUpdate({ id: p.id }, { $set: p }, { upsert: true });
          totalMigrated++;
        } catch (err) {
          errors.push(`Failed to migrate patient ${p.id}: ${(err as Error).message}`);
        }
      }
    }

    if (data.doctors) {
      for (const d of data.doctors) {
        try {
          await DoctorModel.findOneAndUpdate({ id: d.id }, { $set: d }, { upsert: true });
          totalMigrated++;
        } catch (err) {
          errors.push(`Failed to migrate doctor ${d.id}: ${(err as Error).message}`);
        }
      }
    }

    // 3. Clinical Data (Diseases & Allergies)
    if (data.diseases) {
      for (const dis of data.diseases) {
        try {
          await DiseaseModel.findOneAndUpdate({ id: dis.id }, { $set: dis }, { upsert: true });
          totalMigrated++;
        } catch (err) {
          errors.push(`Failed to migrate disease ${dis.id}: ${(err as Error).message}`);
        }
      }
    }

    if (data.allergies) {
      for (const alg of data.allergies) {
        try {
          await AllergyModel.findOneAndUpdate({ id: alg.id }, { $set: alg }, { upsert: true });
          totalMigrated++;
        } catch (err) {
          errors.push(`Failed to migrate allergy ${alg.id}: ${(err as Error).message}`);
        }
      }
    }

    // 4. Foods & Ingredients
    if (data.foods) {
      for (const food of data.foods) {
        try {
          await FoodModel.findOneAndUpdate({ id: food.id }, { $set: food }, { upsert: true });
          totalMigrated++;
        } catch (err) {
          errors.push(`Failed to migrate food ${food.id}: ${(err as Error).message}`);
        }
      }
    }

    if (data.ingredients) {
      for (const ing of data.ingredients) {
        try {
          await IngredientModel.findOneAndUpdate({ id: ing.id }, { $set: ing }, { upsert: true });
          totalMigrated++;
        } catch (err) {
          errors.push(`Failed to migrate ingredient ${ing.id}: ${(err as Error).message}`);
        }
      }
    }

    logger.info(`Migration complete! Successfully migrated ${totalMigrated} entities with ${errors.length} errors.`);
    return { migratedCount: totalMigrated, errors };
  } catch (error) {
    logger.error('Fatal error during PostgreSQL migration:', error);
    throw error;
  }
}

// Allow CLI execution
if (process.argv[1] && process.argv[1].endsWith('migrate-from-postgres.ts')) {
  migrateFromPostgres()
    .then((result) => {
      console.log('PostgreSQL migration check completed:', result);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
