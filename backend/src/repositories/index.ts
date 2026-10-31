import { db } from './database.js';
import {
  User,
  Patient,
  Doctor,
  Disease,
  PatientDisease,
  Allergy,
  PatientAllergy,
  Food,
  Ingredient,
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
  OrderStatus,
} from '../constants/index.js';
import {
  UserModel,
  PatientModel,
  DoctorModel,
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

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await UserModel.findOne({ id }).lean();
        if (doc) return doc as unknown as User;
      } catch {
        // Fallback to in-memory
      }
    }
    return db.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rawEmail = email.toLowerCase().trim();
    const normalizedEmail = rawEmail.replace(/@hospital\.org$/, '@hospital.com');
    if (isDatabaseConnected()) {
      try {
        const doc = await UserModel.findOne({
          $or: [{ email: rawEmail }, { email: normalizedEmail }]
        }).lean();
        if (doc) return doc as unknown as User;
      } catch {
        // Fallback to in-memory
      }
    }
    for (const user of db.users.values()) {
      const uEmail = user.email.toLowerCase();
      if (uEmail === rawEmail || uEmail === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  async create(user: User): Promise<User> {
    db.users.set(user.id, user);
    if (isDatabaseConnected()) {
      try {
        await UserModel.create(user);
      } catch {
        // Fallback in-memory
      }
    }
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    let existing = db.users.get(id);

    // If not in memory (e.g. after server restart), try to load from MongoDB
    if (!existing && isDatabaseConnected()) {
      try {
        const doc = await UserModel.findOne({ id }).lean();
        if (doc) {
          existing = doc as unknown as User;
          db.users.set(id, existing); // warm the in-memory cache
        }
      } catch {
        // ignore, will return null below
      }
    }

    if (!existing) return null;

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    db.users.set(id, updated);
    if (isDatabaseConnected()) {
      try {
        await UserModel.findOneAndUpdate({ id }, { $set: { ...updates, updatedAt: updated.updatedAt } });
      } catch {
        // Fallback in-memory
      }
    }
    return updated;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const trimmed = phone.trim();
    const rawClean = phone.replace(/[\s\-().]/g, '');
    if (isDatabaseConnected()) {
      try {
        const doc = await UserModel.findOne({
          $or: [
            { phone: trimmed },
            { phone: rawClean }
          ]
        }).lean();
        if (doc) return doc as unknown as User;
      } catch {
        // Fallback to in-memory
      }
    }
    for (const user of db.users.values()) {
      if (user.phone) {
        const uClean = user.phone.replace(/[\s\-().]/g, '');
        if (user.phone === trimmed || uClean === rawClean) {
          return user;
        }
      }
    }
    return null;
  }

  async listAll(): Promise<User[]> {
    const inMemory = Array.from(db.users.values());
    if (isDatabaseConnected()) {
      try {
        const docs = await UserModel.find().lean();
        if (docs.length > 0) {
          const dbMap = new Map<string, User>();
          for (const doc of docs) {
            const u = doc as unknown as User;
            const existing = db.users.get(u.id);
            if (existing && existing.updatedAt && u.updatedAt && new Date(existing.updatedAt).getTime() > new Date(u.updatedAt).getTime()) {
              dbMap.set(u.id, existing);
            } else {
              dbMap.set(u.id, u);
              db.users.set(u.id, u);
            }
          }
          for (const u of inMemory) {
            if (!dbMap.has(u.id)) dbMap.set(u.id, u);
          }
          return Array.from(dbMap.values());
        }
      } catch {
        // Fallback to in-memory
      }
    }
    return inMemory;
  }

  async delete(id: string): Promise<boolean> {
    const existed = db.users.delete(id);
    if (isDatabaseConnected()) {
      try {
        const res = await UserModel.deleteOne({ id });
        return (res.deletedCount ?? 0) > 0 || existed;
      } catch {
        // Fallback
      }
    }
    return existed;
  }
}

export class PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await PatientModel.findOne({ id }).lean();
        if (doc) return doc as unknown as Patient;
      } catch {
        // Fallback
      }
    }
    return db.patients.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await PatientModel.findOne({ userId }).lean();
        if (doc) return doc as unknown as Patient;
      } catch {
        // Fallback
      }
    }
    for (const patient of db.patients.values()) {
      if (patient.userId === userId) return patient;
    }
    return null;
  }

  async findByPatientNumber(patientNumber: string): Promise<Patient | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await PatientModel.findOne({ patientNumber }).lean();
        if (doc) return doc as unknown as Patient;
      } catch {
        // Fallback
      }
    }
    for (const patient of db.patients.values()) {
      if (patient.patientNumber === patientNumber) return patient;
    }
    return null;
  }

  async create(patient: Patient): Promise<Patient> {
    db.patients.set(patient.id, patient); // always warm in-memory first
    if (isDatabaseConnected()) {
      try {
        await PatientModel.create(patient);
      } catch {
        // Fallback in-memory already set above
      }
    }
    return patient;
  }

  async update(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    let current = db.patients.get(id);

    // If not in memory, try to load from MongoDB (e.g. after server restart)
    if (!current && isDatabaseConnected()) {
      try {
        const doc = await PatientModel.findOne({ id }).lean();
        if (doc) {
          current = doc as unknown as Patient;
          db.patients.set(id, current); // warm cache
        }
      } catch {
        // ignore
      }
    }

    if (!current) return null;

    if (isDatabaseConnected()) {
      try {
        const doc = await PatientModel.findOneAndUpdate(
          { id },
          { $set: { ...updates, updatedAt: new Date() } },
          { new: true }
        ).lean();
        if (doc) {
          db.patients.set(id, doc as unknown as Patient);
          return doc as unknown as Patient;
        }
      } catch {
        // Fallback to in-memory
      }
    }
    const updated = { ...current, ...updates, updatedAt: new Date() };
    db.patients.set(id, updated);
    return updated;
  }

  async assignDoctor(patientId: string, doctorId: string | null): Promise<Patient | null> {
    return this.update(patientId, { doctorId: doctorId || null });
  }

  async listAll(): Promise<Patient[]> {
    const inMemory = Array.from(db.patients.values());
    if (isDatabaseConnected()) {
      try {
        const docs = await PatientModel.find().lean();
        if (docs.length > 0) {
          const dbMap = new Map<string, Patient>();
          for (const doc of docs) {
            const p = doc as unknown as Patient;
            const existing = db.patients.get(p.id);
            if (existing && existing.updatedAt && p.updatedAt && new Date(existing.updatedAt).getTime() > new Date(p.updatedAt).getTime()) {
              dbMap.set(p.id, existing);
            } else {
              dbMap.set(p.id, p);
              db.patients.set(p.id, p);
            }
          }
          for (const p of inMemory) {
            if (!dbMap.has(p.id)) dbMap.set(p.id, p);
          }
          return Array.from(dbMap.values());
        }
      } catch {
        // Fallback to in-memory
      }
    }
    return inMemory;
  }

  async getDiseasesForPatient(patientId: string): Promise<Array<{ disease: Disease; notes?: string }>> {
    const results: Array<{ disease: Disease; notes?: string }> = [];
    if (isDatabaseConnected()) {
      try {
        const pds = await PatientDiseaseModel.find({ patientId }).lean();
        if (pds.length > 0) {
          for (const pd of pds) {
            const dis = (await DiseaseModel.findOne({ id: pd.diseaseId }).lean()) || db.diseases.get(pd.diseaseId);
            if (dis) results.push({ disease: dis as unknown as Disease, notes: pd.notes || undefined });
          }
          return results;
        }
      } catch {
        // Fallback
      }
    }
    for (const pd of db.patientDiseases.values()) {
      if (pd.patientId === patientId) {
        const dis = db.diseases.get(pd.diseaseId);
        if (dis) results.push({ disease: dis, notes: pd.notes });
      }
    }
    return results;
  }

  async getAllergiesForPatient(patientId: string): Promise<Array<{ allergy: Allergy; severity: PatientAllergy['severity']; notes?: string }>> {
    const results: Array<{ allergy: Allergy; severity: PatientAllergy['severity']; notes?: string }> = [];
    if (isDatabaseConnected()) {
      try {
        const pas = await PatientAllergyModel.find({ patientId }).lean();
        if (pas.length > 0) {
          for (const pa of pas) {
            const alg = (await AllergyModel.findOne({ id: pa.allergyId }).lean()) || db.allergies.get(pa.allergyId);
            if (alg) results.push({ allergy: alg as unknown as Allergy, severity: pa.severity as PatientAllergy['severity'], notes: pa.notes || undefined });
          }
          return results;
        }
      } catch {
        // Fallback
      }
    }
    for (const pa of db.patientAllergies.values()) {
      if (pa.patientId === patientId) {
        const alg = db.allergies.get(pa.allergyId);
        if (alg) results.push({ allergy: alg, severity: pa.severity, notes: pa.notes });
      }
    }
    return results;
  }

  async addDisease(pd: PatientDisease): Promise<PatientDisease> {
    db.patientDiseases.set(`${pd.patientId}_${pd.diseaseId}`, pd);
    if (isDatabaseConnected()) {
      try {
        await PatientDiseaseModel.findOneAndUpdate(
          { patientId: pd.patientId, diseaseId: pd.diseaseId },
          { $set: pd },
          { upsert: true }
        );
      } catch {
        // Fallback
      }
    }
    return pd;
  }

  async addAllergy(pa: PatientAllergy): Promise<PatientAllergy> {
    db.patientAllergies.set(`${pa.patientId}_${pa.allergyId}`, pa);
    if (isDatabaseConnected()) {
      try {
        await PatientAllergyModel.findOneAndUpdate(
          { patientId: pa.patientId, allergyId: pa.allergyId },
          { $set: pa },
          { upsert: true }
        );
      } catch {
        // Fallback
      }
    }
    return pa;
  }

  async delete(id: string): Promise<boolean> {
    const existed = db.patients.delete(id);
    for (const key of Array.from(db.patientDiseases.keys())) {
      if (key.startsWith(`${id}_`)) db.patientDiseases.delete(key);
    }
    for (const key of Array.from(db.patientAllergies.keys())) {
      if (key.startsWith(`${id}_`)) db.patientAllergies.delete(key);
    }
    for (const key of Array.from(db.doctorFoodApprovals.keys())) {
      if (key.startsWith(`${id}_`)) db.doctorFoodApprovals.delete(key);
    }
    if (isDatabaseConnected()) {
      try {
        await Promise.all([
          PatientModel.deleteOne({ id }),
          PatientDiseaseModel.deleteMany({ patientId: id }),
          PatientAllergyModel.deleteMany({ patientId: id }),
          DoctorFoodApprovalModel.deleteMany({ patientId: id }),
        ]);
        return true;
      } catch {
        // Fallback
      }
    }
    return existed;
  }

  async removeDisease(patientId: string, diseaseId: string): Promise<boolean> {
    const key = `${patientId}_${diseaseId}`;
    const existed = db.patientDiseases.delete(key);
    if (isDatabaseConnected()) {
      try {
        const res = await PatientDiseaseModel.deleteOne({ patientId, diseaseId });
        return (res.deletedCount ?? 0) > 0 || existed;
      } catch {
        // Fallback
      }
    }
    return existed;
  }

  async removeAllergy(patientId: string, allergyId: string): Promise<boolean> {
    const key = `${patientId}_${allergyId}`;
    const existed = db.patientAllergies.delete(key);
    if (isDatabaseConnected()) {
      try {
        const res = await PatientAllergyModel.deleteOne({ patientId, allergyId });
        return (res.deletedCount ?? 0) > 0 || existed;
      } catch {
        // Fallback
      }
    }
    return existed;
  }
}

export class DoctorRepository {
  async findById(id: string): Promise<Doctor | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await DoctorModel.findOne({ id }).lean();
        if (doc) return doc as unknown as Doctor;
      } catch {
        // Fallback
      }
    }
    return db.doctors.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Doctor | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await DoctorModel.findOne({ userId }).lean();
        if (doc) return doc as unknown as Doctor;
      } catch {
        // Fallback
      }
    }
    for (const doc of db.doctors.values()) {
      if (doc.userId === userId) return doc;
    }
    return null;
  }

  async create(doctor: Doctor): Promise<Doctor> {
    db.doctors.set(doctor.id, doctor);
    if (isDatabaseConnected()) {
      try {
        await DoctorModel.create(doctor);
      } catch {
        // Fallback
      }
    }
    return doctor;
  }

  async listAll(): Promise<Doctor[]> {
    const inMemory = Array.from(db.doctors.values());
    if (isDatabaseConnected()) {
      try {
        const docs = await DoctorModel.find().lean();
        if (docs.length > 0) {
          const dbMap = new Map<string, Doctor>();
          for (const doc of docs) {
            const d = doc as unknown as Doctor;
            dbMap.set(d.id, d);
            db.doctors.set(d.id, d);
          }
          for (const d of inMemory) {
            if (!dbMap.has(d.id)) dbMap.set(d.id, d);
          }
          return Array.from(dbMap.values());
        }
      } catch {
        // Fallback
      }
    }
    return inMemory;
  }
}

export class DiseaseRepository {
  async findById(id: string): Promise<Disease | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await DiseaseModel.findOne({ id }).lean();
        if (doc) return doc as unknown as Disease;
      } catch {
        // Fallback
      }
    }
    return db.diseases.get(id) || null;
  }

  async findByName(name: string): Promise<Disease | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await DiseaseModel.findOne({ name: new RegExp(`^${name}$`, 'i') }).lean();
        if (doc) return doc as unknown as Disease;
      } catch {
        // Fallback
      }
    }
    for (const d of db.diseases.values()) {
      if (d.name.toLowerCase() === name.toLowerCase()) return d;
    }
    return null;
  }

  async listAll(): Promise<Disease[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await DiseaseModel.find().lean();
        if (docs.length > 0) return docs as unknown as Disease[];
      } catch {
        // Fallback
      }
    }
    return Array.from(db.diseases.values());
  }

  async create(disease: Disease): Promise<Disease> {
    db.diseases.set(disease.id, disease);
    if (isDatabaseConnected()) {
      try {
        await DiseaseModel.create(disease);
      } catch {
        // Fallback
      }
    }
    return disease;
  }

  async update(id: string, updates: Partial<Disease>): Promise<Disease | null> {
    const existing = db.diseases.get(id);
    const updated = { ...(existing || {}), ...updates, id } as Disease;
    db.diseases.set(id, updated);
    if (isDatabaseConnected()) {
      try {
        const doc = await DiseaseModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
        if (doc) return doc as unknown as Disease;
      } catch {
        // Fallback
      }
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    db.diseases.delete(id);
    if (isDatabaseConnected()) {
      try {
        await DiseaseModel.deleteOne({ id });
      } catch {
        // Fallback
      }
    }
    return true;
  }
}

export class AllergyRepository {
  async findById(id: string): Promise<Allergy | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await AllergyModel.findOne({ id }).lean();
        if (doc) return doc as unknown as Allergy;
      } catch {
        // Fallback
      }
    }
    return db.allergies.get(id) || null;
  }

  async findByName(name: string): Promise<Allergy | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await AllergyModel.findOne({ name: new RegExp(`^${name}$`, 'i') }).lean();
        if (doc) return doc as unknown as Allergy;
      } catch {
        // Fallback
      }
    }
    for (const a of db.allergies.values()) {
      if (a.name.toLowerCase() === name.toLowerCase()) return a;
    }
    return null;
  }

  async listAll(): Promise<Allergy[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await AllergyModel.find().lean();
        if (docs.length > 0) return docs as unknown as Allergy[];
      } catch {
        // Fallback
      }
    }
    return Array.from(db.allergies.values());
  }

  async create(allergy: Allergy): Promise<Allergy> {
    db.allergies.set(allergy.id, allergy);
    if (isDatabaseConnected()) {
      try {
        await AllergyModel.create(allergy);
      } catch {
        // Fallback
      }
    }
    return allergy;
  }

  async update(id: string, updates: Partial<Allergy>): Promise<Allergy | null> {
    const existing = db.allergies.get(id);
    const updated = { ...(existing || {}), ...updates, id } as Allergy;
    db.allergies.set(id, updated);
    if (isDatabaseConnected()) {
      try {
        const doc = await AllergyModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
        if (doc) return doc as unknown as Allergy;
      } catch {
        // Fallback
      }
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    db.allergies.delete(id);
    if (isDatabaseConnected()) {
      try {
        await AllergyModel.deleteOne({ id });
      } catch {
        // Fallback
      }
    }
    return true;
  }
}

export class FoodRepository {
  async findById(id: string): Promise<Food | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await FoodModel.findOne({ id }).lean();
        if (doc) return doc as unknown as Food;
      } catch {
        // Fallback
      }
    }
    return db.foods.get(id) || null;
  }

  async findByName(name: string): Promise<Food | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await FoodModel.findOne({ name: new RegExp(`^${name}$`, 'i') }).lean();
        if (doc) return doc as unknown as Food;
      } catch {
        // Fallback
      }
    }
    for (const f of db.foods.values()) {
      if (f.name.toLowerCase() === name.toLowerCase()) return f;
    }
    return null;
  }

  async listAll(): Promise<Food[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await FoodModel.find().lean();
        if (docs.length > 0) return docs as unknown as Food[];
      } catch {
        // Fallback
      }
    }
    return Array.from(db.foods.values());
  }

  async create(food: Food): Promise<Food> {
    db.foods.set(food.id, food);
    if (isDatabaseConnected()) {
      try {
        await FoodModel.create(food);
      } catch {
        // Fallback
      }
    }
    return food;
  }

  async update(id: string, updates: Partial<Food>): Promise<Food | null> {
    const existing = db.foods.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    db.foods.set(id, updated);
    if (isDatabaseConnected()) {
      try {
        await FoodModel.findOneAndUpdate({ id }, { $set: updates, updatedAt: new Date() });
      } catch {
        // Fallback
      }
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existed = db.foods.delete(id);
    for (const key of Array.from(db.foodIngredients.keys())) {
      if (key.startsWith(`${id}_`)) db.foodIngredients.delete(key);
    }
    for (const key of Array.from(db.doctorFoodApprovals.keys())) {
      if (key.endsWith(`_${id}`)) db.doctorFoodApprovals.delete(key);
    }
    if (isDatabaseConnected()) {
      try {
        await Promise.all([
          FoodModel.deleteOne({ id }),
          FoodIngredientModel.deleteMany({ foodId: id }),
          DoctorFoodApprovalModel.deleteMany({ foodId: id }),
          KitchenAvailabilityModel.deleteMany({ foodId: id }),
        ]);
        return true;
      } catch {
        // Fallback
      }
    }
    return existed;
  }

  async getIngredientsForFood(foodId: string): Promise<Ingredient[]> {
    const list: Ingredient[] = [];
    if (isDatabaseConnected()) {
      try {
        const fis = await FoodIngredientModel.find({ foodId }).lean();
        if (fis.length > 0) {
          for (const fi of fis) {
            const ing = (await IngredientModel.findOne({ id: fi.ingredientId }).lean()) || db.ingredients.get(fi.ingredientId);
            if (ing) list.push(ing as unknown as Ingredient);
          }
          return list;
        }
      } catch {
        // Fallback
      }
    }
    for (const fi of db.foodIngredients.values()) {
      if (fi.foodId === foodId) {
        const ing = db.ingredients.get(fi.ingredientId);
        if (ing) list.push(ing);
      }
    }
    return list;
  }

  async addIngredient(ingredient: Ingredient): Promise<Ingredient> {
    db.ingredients.set(ingredient.id, ingredient);
    if (isDatabaseConnected()) {
      try {
        await IngredientModel.create(ingredient);
      } catch {
        // Fallback
      }
    }
    return ingredient;
  }

  async findIngredientByName(name: string): Promise<Ingredient | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await IngredientModel.findOne({ name: new RegExp(`^${name}$`, 'i') }).lean();
        if (doc) return doc as unknown as Ingredient;
      } catch {
        // Fallback
      }
    }
    for (const ing of db.ingredients.values()) {
      if (ing.name.toLowerCase() === name.toLowerCase()) return ing;
    }
    return null;
  }

  async linkFoodIngredient(foodId: string, ingredientId: string): Promise<void> {
    db.foodIngredients.set(`${foodId}_${ingredientId}`, {
      id: `fi-${foodId}-${ingredientId}`,
      foodId,
      ingredientId,
    });
    if (isDatabaseConnected()) {
      try {
        await FoodIngredientModel.findOneAndUpdate(
          { foodId, ingredientId },
          { id: `fi-${foodId}-${ingredientId}`, foodId, ingredientId },
          { upsert: true }
        );
      } catch {
        // Fallback
      }
    }
  }

  async getDiseaseRulesForFood(foodId: string): Promise<DiseaseFoodRule[]> {
    if (isDatabaseConnected()) {
      try {
        const rules = await DiseaseFoodRuleModel.find({ foodId }).lean();
        if (rules.length > 0) return rules as unknown as DiseaseFoodRule[];
      } catch {
        // Fallback
      }
    }
    const rules: DiseaseFoodRule[] = [];
    for (const r of db.diseaseFoodRules.values()) {
      if (r.foodId === foodId) rules.push(r);
    }
    return rules;
  }

  async getRulesForDisease(diseaseId: string): Promise<DiseaseFoodRule[]> {
    if (isDatabaseConnected()) {
      try {
        const rules = await DiseaseFoodRuleModel.find({ diseaseId }).lean();
        if (rules.length > 0) return rules as unknown as DiseaseFoodRule[];
      } catch {
        // Fallback
      }
    }
    const rules: DiseaseFoodRule[] = [];
    for (const r of db.diseaseFoodRules.values()) {
      if (r.diseaseId === diseaseId) rules.push(r);
    }
    return rules;
  }

  async setDiseaseRule(rule: DiseaseFoodRule): Promise<DiseaseFoodRule> {
    db.diseaseFoodRules.set(rule.id, rule);
    if (isDatabaseConnected()) {
      try {
        await DiseaseFoodRuleModel.findOneAndUpdate(
          { diseaseId: rule.diseaseId, foodId: rule.foodId },
          { $set: rule },
          { upsert: true }
        );
      } catch {
        // Fallback
      }
    }
    return rule;
  }
}

export class ApprovalRepository {
  async findByPatientAndFood(patientId: string, foodId: string): Promise<DoctorFoodApproval | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await DoctorFoodApprovalModel.findOne({ patientId, foodId }).lean();
        if (doc) return doc as unknown as DoctorFoodApproval;
      } catch {
        // Fallback
      }
    }
    return db.doctorFoodApprovals.get(`${patientId}_${foodId}`) || null;
  }

  async listByPatient(patientId: string): Promise<DoctorFoodApproval[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await DoctorFoodApprovalModel.find({ patientId }).lean();
        if (docs.length > 0) return docs as unknown as DoctorFoodApproval[];
      } catch {
        // Fallback
      }
    }
    const list: DoctorFoodApproval[] = [];
    for (const app of db.doctorFoodApprovals.values()) {
      if (app.patientId === patientId) list.push(app);
    }
    return list;
  }

  async listAll(): Promise<DoctorFoodApproval[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await DoctorFoodApprovalModel.find().lean();
        if (docs.length > 0) return docs as unknown as DoctorFoodApproval[];
      } catch {
        // Fallback
      }
    }
    return Array.from(db.doctorFoodApprovals.values());
  }

  async upsert(approval: DoctorFoodApproval): Promise<DoctorFoodApproval> {
    db.doctorFoodApprovals.set(`${approval.patientId}_${approval.foodId}`, approval);
    if (isDatabaseConnected()) {
      try {
        await DoctorFoodApprovalModel.findOneAndUpdate(
          { patientId: approval.patientId, foodId: approval.foodId },
          { $set: approval },
          { upsert: true }
        );
      } catch {
        // Fallback
      }
    }
    return approval;
  }

  async delete(patientId: string, foodId: string): Promise<boolean> {
    const key = `${patientId}_${foodId}`;
    const existed = db.doctorFoodApprovals.delete(key);
    if (isDatabaseConnected()) {
      try {
        const res = await DoctorFoodApprovalModel.deleteOne({ patientId, foodId });
        return (res.deletedCount ?? 0) > 0 || existed;
      } catch {
        // Fallback
      }
    }
    return existed;
  }

  async deleteById(id: string): Promise<boolean> {
    let existed = false;
    for (const [key, app] of db.doctorFoodApprovals.entries()) {
      if (app.id === id) {
        db.doctorFoodApprovals.delete(key);
        existed = true;
        break;
      }
    }
    if (isDatabaseConnected()) {
      try {
        const res = await DoctorFoodApprovalModel.deleteOne({ id });
        return (res.deletedCount ?? 0) > 0 || existed;
      } catch {
        // Fallback
      }
    }
    return existed;
  }
}

export class KitchenRepository {
  isKitchenActive(): boolean {
    return db.kitchenIsActive;
  }

  getKitchenStatusNotes(): string {
    return db.kitchenStatusNotes;
  }

  setKitchenStatus(isActive: boolean, notes?: string): void {
    db.kitchenIsActive = isActive;
    if (notes) db.kitchenStatusNotes = notes;
    if (isDatabaseConnected()) {
      try {
        KitchenStatusModel.findOneAndUpdate(
          {},
          { $set: { isActive, notes: notes || db.kitchenStatusNotes } },
          { upsert: true }
        ).catch(() => {});
      } catch {
        // Fallback
      }
    }
  }

  async findAvailability(foodId: string, date: string): Promise<KitchenAvailability[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await KitchenAvailabilityModel.find({ foodId, date }).lean();
        if (docs.length > 0) return docs as unknown as KitchenAvailability[];
      } catch {
        // Fallback
      }
    }
    const list: KitchenAvailability[] = [];
    for (const ka of db.kitchenAvailabilities.values()) {
      if (ka.foodId === foodId && ka.date === date) {
        list.push(ka);
      }
    }
    return list;
  }

  async listAvailabilitiesForDate(date: string): Promise<KitchenAvailability[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await KitchenAvailabilityModel.find({ date }).lean();
        if (docs.length > 0) return docs as unknown as KitchenAvailability[];
      } catch {
        // Fallback
      }
    }
    const list: KitchenAvailability[] = [];
    for (const ka of db.kitchenAvailabilities.values()) {
      if (ka.date === date) list.push(ka);
    }
    return list;
  }

  async createAvailability(ka: KitchenAvailability): Promise<KitchenAvailability> {
    db.kitchenAvailabilities.set(ka.id, ka);
    if (isDatabaseConnected()) {
      try {
        await KitchenAvailabilityModel.create(ka);
      } catch {
        // Fallback
      }
    }
    return ka;
  }

  async updateAvailability(id: string, updates: Partial<KitchenAvailability>): Promise<KitchenAvailability | null> {
    const existing = db.kitchenAvailabilities.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    db.kitchenAvailabilities.set(id, updated);
    if (isDatabaseConnected()) {
      try {
        await KitchenAvailabilityModel.findOneAndUpdate({ id }, { $set: updates, updatedAt: new Date() });
      } catch {
        // Fallback
      }
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existed = db.kitchenAvailabilities.delete(id);
    if (isDatabaseConnected()) {
      try {
        const res = await KitchenAvailabilityModel.deleteOne({ id });
        return (res.deletedCount ?? 0) > 0 || existed;
      } catch {
        // Fallback
      }
    }
    return existed;
  }
}

export class OrderRepository {
  async findById(id: string): Promise<Order | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await OrderModel.findOne({ id }).lean();
        if (doc) return doc as unknown as Order;
      } catch {
        // Fallback
      }
    }
    return db.orders.get(id) || null;
  }

  async listByPatient(patientId: string): Promise<Order[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await OrderModel.find({ patientId }).sort({ createdAt: -1 }).lean();
        if (docs.length > 0) return docs as unknown as Order[];
      } catch {
        // Fallback
      }
    }
    const list: Order[] = [];
    for (const o of db.orders.values()) {
      if (o.patientId === patientId) list.push(o);
    }
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async listAll(): Promise<Order[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await OrderModel.find().sort({ createdAt: -1 }).lean();
        if (docs.length > 0) return docs as unknown as Order[];
      } catch {
        // Fallback
      }
    }
    return Array.from(db.orders.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async create(order: Order): Promise<Order> {
    db.orders.set(order.id, order);
    if (isDatabaseConnected()) {
      try {
        await OrderModel.create(order);
      } catch {
        // Fallback
      }
    }
    return order;
  }

  async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    const existing = db.orders.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    db.orders.set(id, updated);
    if (isDatabaseConnected()) {
      try {
        await OrderModel.findOneAndUpdate({ id }, { $set: { ...updates, updatedAt: updated.updatedAt } });
      } catch {
        // Fallback
      }
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existed = db.orders.delete(id);
    if (isDatabaseConnected()) {
      try {
        const res = await OrderModel.deleteOne({ id });
        return (res.deletedCount ?? 0) > 0 || existed;
      } catch {
        // Fallback
      }
    }
    return existed;
  }

  async updateStatus(orderId: string, status: OrderStatus, changedBy?: string, notes?: string): Promise<Order | null> {
    const existing = db.orders.get(orderId);
    if (!existing) return null;
    const updated: Order = { ...existing, status, updatedAt: new Date() };
    db.orders.set(orderId, updated);

    // Record history
    const historyId = `osh-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const historyEntry = {
      id: historyId,
      orderId,
      status,
      changedBy,
      notes,
      createdAt: new Date(),
    };
    db.orderStatusHistories.set(historyId, historyEntry);

    if (isDatabaseConnected()) {
      try {
        await OrderModel.findOneAndUpdate({ id: orderId }, { $set: { status, updatedAt: new Date() } });
        await OrderStatusHistoryModel.create(historyEntry);
      } catch {
        // Fallback
      }
    }

    return updated;
  }

  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await OrderStatusHistoryModel.find({ orderId }).sort({ createdAt: 1 }).lean();
        if (docs.length > 0) return docs as unknown as OrderStatusHistory[];
      } catch {
        // Fallback
      }
    }
    const list: OrderStatusHistory[] = [];
    for (const h of db.orderStatusHistories.values()) {
      if (h.orderId === orderId) list.push(h);
    }
    return list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  }
}

export class FeedbackRepository {
  async findByOrderId(orderId: string): Promise<Feedback | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await FeedbackModel.findOne({ orderId }).lean();
        if (doc) return doc as unknown as Feedback;
      } catch {
        // Fallback
      }
    }
    for (const f of db.feedbacks.values()) {
      if (f.orderId === orderId) return f;
    }
    return null;
  }

  async listByPatient(patientId: string): Promise<Feedback[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await FeedbackModel.find({ patientId }).lean();
        if (docs.length > 0) return docs as unknown as Feedback[];
      } catch {
        // Fallback
      }
    }
    const list: Feedback[] = [];
    for (const f of db.feedbacks.values()) {
      if (f.patientId === patientId) list.push(f);
    }
    return list;
  }

  async listAll(): Promise<Feedback[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await FeedbackModel.find().lean();
        if (docs.length > 0) return docs as unknown as Feedback[];
      } catch {
        // Fallback
      }
    }
    return Array.from(db.feedbacks.values());
  }

  async create(feedback: Feedback): Promise<Feedback> {
    db.feedbacks.set(feedback.id, feedback);
    if (isDatabaseConnected()) {
      try {
        await FeedbackModel.create(feedback);
      } catch {
        // Fallback
      }
    }
    return feedback;
  }

  async delete(id: string): Promise<boolean> {
    const existed = db.feedbacks.delete(id);
    if (isDatabaseConnected()) {
      try {
        const res = await FeedbackModel.deleteOne({ id });
        return (res.deletedCount ?? 0) > 0 || existed;
      } catch {
        // Fallback
      }
    }
    return existed;
  }
}

export class NotificationRepository {
  async listByUser(userId: string): Promise<Notification[]> {
    const list: Notification[] = [];
    const seen = new Set<string>();

    if (isDatabaseConnected()) {
      try {
        const docs = await NotificationModel.find({ $or: [{ userId }, { userId: 'all' }] }).sort({ createdAt: -1 }).lean();
        for (const doc of docs) {
          const item = doc as unknown as Notification;
          if (item.id && !seen.has(item.id)) {
            seen.add(item.id);
            list.push(item);
          }
        }
      } catch {
        // Fallback
      }
    }
    for (const n of db.notifications.values()) {
      if ((n.userId === userId || n.userId === 'all') && !seen.has(n.id)) {
        seen.add(n.id);
        list.push(n);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async create(notif: Notification): Promise<Notification> {
    db.notifications.set(notif.id, notif);
    if (isDatabaseConnected()) {
      try {
        await NotificationModel.create(notif);
      } catch {
        // Fallback
      }
    }
    return notif;
  }

  async markAsRead(id: string): Promise<void> {
    const notif = db.notifications.get(id);
    if (notif) notif.isRead = true;
    if (isDatabaseConnected()) {
      try {
        await NotificationModel.findOneAndUpdate({ id }, { $set: { isRead: true } });
      } catch {
        // Fallback
      }
    }
  }

  async delete(id: string): Promise<boolean> {
    const existed = db.notifications.delete(id);
    if (isDatabaseConnected()) {
      try {
        const res = await NotificationModel.deleteOne({ id });
        return (res.deletedCount ?? 0) > 0 || existed;
      } catch {
        // Fallback
      }
    }
    return existed;
  }

  async deleteAll(userId: string): Promise<void> {
    for (const [id, n] of db.notifications.entries()) {
      if (n.userId === userId) db.notifications.delete(id);
    }
    if (isDatabaseConnected()) {
      try {
        await NotificationModel.deleteMany({ userId });
      } catch {
        // Fallback
      }
    }
  }
}

export class AuditLogRepository {
  async create(log: AuditLog): Promise<AuditLog> {
    db.auditLogs.set(log.id, log);
    if (isDatabaseConnected()) {
      try {
        await AuditLogModel.create(log);
      } catch {
        // Fallback
      }
    }
    return log;
  }

  async listAll(limit = 100): Promise<AuditLog[]> {
    if (isDatabaseConnected()) {
      try {
        const docs = await AuditLogModel.find().sort({ timestamp: -1 }).limit(limit).lean();
        if (docs.length > 0) return docs as unknown as AuditLog[];
      } catch {
        // Fallback
      }
    }
    return Array.from(db.auditLogs.values())
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, limit);
  }
}
