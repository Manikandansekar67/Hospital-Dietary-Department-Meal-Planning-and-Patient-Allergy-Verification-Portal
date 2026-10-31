import {
  UserRepository,
  PatientRepository,
  DoctorRepository,
  FoodRepository,
  DiseaseRepository,
  AllergyRepository,
  OrderRepository,
  ApprovalRepository,
} from '../repositories/index.js';
import { User, Doctor, Patient, Disease, Allergy } from '../types/models.js';
import { UserStatus, ErrorCode, Role, ApprovalStatus, NotificationType } from '../constants/index.js';
import { AppError } from '../utils/response.js';
import { hashPassword } from '../utils/password.js';
import { AuditLogService } from './auditLog.service.js';
import { NotificationService } from './notification.service.js';

export interface AdminDashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalKitchenStaff: number;
  totalFoods: number;
  totalDiseases: number;
  todaysOrders: number;
  activeFoods: number;
  pendingApprovals: number;
  allergyAlerts: number;
  ordersByDay: { day: string; count: number }[];
  dietDistribution: { name: string; value: number }[];
  foodCategoryDistribution: { category: string; count: number }[];
  approvalComparison: { name: string; count: number }[];
}

function parseDobAndGeneratePassword(dobStr: string): { storedDob: string; initialPassword: string } {
  const trimmed = dobStr.trim();
  // YYYY-MM-DD
  const ymd = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    const [, year, month, day] = ymd;
    const dd = day.padStart(2, '0');
    const mm = month.padStart(2, '0');
    return {
      storedDob: `${year}-${mm}-${dd}`,
      initialPassword: `${dd}${mm}${year}`,
    };
  }
  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    const [, day, month, year] = dmy;
    const dd = day.padStart(2, '0');
    const mm = month.padStart(2, '0');
    return {
      storedDob: `${year}-${mm}-${dd}`,
      initialPassword: `${dd}${mm}${year}`,
    };
  }
  // Digits only
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 8) {
    const dd = digits.substring(0, 2);
    const mm = digits.substring(2, 4);
    const year = digits.substring(4, 8);
    return {
      storedDob: `${year}-${mm}-${dd}`,
      initialPassword: digits,
    };
  }
  return {
    storedDob: trimmed,
    initialPassword: digits || trimmed,
  };
}

export class AdminService {
  constructor(
    private userRepo = new UserRepository(),
    private patientRepo = new PatientRepository(),
    private doctorRepo = new DoctorRepository(),
    private foodRepo = new FoodRepository(),
    private diseaseRepo = new DiseaseRepository(),
    private allergyRepo = new AllergyRepository(),
    private orderRepo = new OrderRepository(),
    private approvalRepo = new ApprovalRepository(),
    private auditLogService = new AuditLogService(),
    private notifService = new NotificationService()
  ) {}

  async listAllUsers(): Promise<Array<Omit<User, 'passwordHash'>>> {
    const users = await this.userRepo.listAll();
    return users.map(({ passwordHash: _, ...u }) => u);
  }

  async listAllDoctors(): Promise<Array<{
    id: string; // doctorId
    userId: string;
    name: string;
    email: string;
    phone?: string;
    department: string;
    licenseNumber?: string;
  }>> {
    const doctorUsers = (await this.userRepo.listAll()).filter(
      (u) => (u.role || '').toUpperCase() === Role.DOCTOR && u.status === UserStatus.ACTIVE
    );

    const doctors = await Promise.all(
      doctorUsers.map(async (u) => {
        let doc = await this.doctorRepo.findByUserId(u.id);
        if (!doc) {
          const newDoc: Doctor = {
            id: `doc-${u.id.replace(/^usr-/, '')}`,
            userId: u.id,
            department: (u as any).department || 'Clinical Care & Nutrition',
            licenseNumber: `MD-${Math.floor(10000 + Math.random() * 90000)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          doc = await this.doctorRepo.create(newDoc);
        }
        return {
          id: doc.id,
          userId: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          department: doc.department || (u as any).department || 'Clinical Care',
          licenseNumber: doc.licenseNumber,
        };
      })
    );

    return doctors;
  }

  async assignDoctorToPatient(
    patientId: string,
    doctorId: string | null | undefined,
    adminUserId: string
  ): Promise<any> {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient not found');
    }

    let doctorName = 'Unassigned';
    let targetDoctorId: string | null = null;

    if (doctorId && doctorId.trim() !== '' && doctorId !== 'none' && doctorId !== 'unassigned') {
      const doc = (await this.doctorRepo.findById(doctorId)) || (await this.doctorRepo.findByUserId(doctorId));
      if (!doc) {
        const docUser = await this.userRepo.findById(doctorId);
        if (!docUser || docUser.role !== Role.DOCTOR) {
          throw new AppError(404, ErrorCode.NOT_FOUND, 'Selected doctor record not found');
        }
        targetDoctorId = docUser.id;
        doctorName = docUser.name;
      } else {
        targetDoctorId = doc.id;
        const docUser = await this.userRepo.findById(doc.userId);
        doctorName = docUser?.name || 'Dr. Assigned';
      }
    }

    const updated = await this.patientRepo.update(patientId, {
      doctorId: targetDoctorId,
    });

    if (!updated) {
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to update patient doctor assignment');
    }

    await this.auditLogService.log({
      userId: adminUserId,
      action: targetDoctorId ? 'ASSIGN_DOCTOR_TO_PATIENT' : 'REMOVE_DOCTOR_FROM_PATIENT',
      entity: 'Patient',
      entityId: patientId,
      metadata: {
        patientId,
        doctorId: targetDoctorId,
        doctorName,
        adminUserId,
      },
    });

    if (targetDoctorId) {
      try {
        const docRecord =
          (await this.doctorRepo.findById(targetDoctorId)) ||
          (await this.doctorRepo.findByUserId(targetDoctorId));
        const recipientUserId = docRecord?.userId || targetDoctorId;
        const patientUser = await this.userRepo.findById(patient.userId);
        await this.notifService.notify({
          userId: recipientUserId,
          type: NotificationType.ALLERGY_ALERT,
          title: 'New Patient Assigned',
          message: `Patient ${patientUser?.name || patient.patientNumber} (Room ${patient.roomNumber}) has been assigned to your clinical care.`,
          metadata: { patientId, doctorId: targetDoctorId },
        });
      } catch {
        // Notification creation non-blocking
      }
    }

    return {
      success: true,
      patientId,
      doctorId: targetDoctorId,
      doctorName,
    };
  }

  async removeDoctorFromPatient(patientId: string, adminUserId: string): Promise<any> {
    return this.assignDoctorToPatient(patientId, null, adminUserId);
  }

  async createUser(userData: {
    name: string;
    email: string;
    role: Role;
    password?: string;
    status?: UserStatus;
    phone?: string;
    age?: number;
    dateOfBirth?: string;
  }): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.userRepo.findByEmail(userData.email);
    if (existing) {
      throw new AppError(409, ErrorCode.CONFLICT, `User with email ${userData.email} already exists`);
    }

    if (userData.phone) {
      const existingPhone = await this.userRepo.findByPhone(userData.phone);
      if (existingPhone) {
        throw new AppError(409, ErrorCode.CONFLICT, `User with phone ${userData.phone} already exists`);
      }
    }

    let initialPassword = userData.password || 'Hospital@123';
    let storedDob: string | undefined = undefined;

    if (userData.dateOfBirth) {
      const dobResult = parseDobAndGeneratePassword(userData.dateOfBirth);
      storedDob = dobResult.storedDob;
      initialPassword = dobResult.initialPassword;
    }

    const passwordHash = await hashPassword(initialPassword);
    const now = new Date();
    const id = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const normalizedRole = ((userData.role || Role.PATIENT) as string).toUpperCase() as Role;

    const user: User = {
      id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash,
      role: normalizedRole,
      status: userData.status || UserStatus.ACTIVE,
      phone: userData.phone ? userData.phone.trim() : undefined,
      age: userData.age !== undefined && userData.age !== null ? Number(userData.age) : undefined,
      dateOfBirth: storedDob,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.userRepo.create(user);

    if (normalizedRole === Role.DOCTOR) {
      try {
        const doctor: Doctor = {
          id: `doc-${user.id.replace(/^usr-/, '')}`,
          userId: user.id,
          department: (userData as any).department || 'Clinical Care & Nutrition',
          licenseNumber: `MD-${Math.floor(10000 + Math.random() * 90000)}`,
          createdAt: now,
          updatedAt: now,
        };
        await this.doctorRepo.create(doctor);
      } catch {
        // Non-blocking
      }
    } else if (normalizedRole === Role.PATIENT) {
      try {
        const patId = `pat-${user.id.replace(/^usr-/, '')}`;
        const patient: Patient = {
          id: patId,
          userId: user.id,
          patientNumber: (userData as any).patientNumber || `P-${Math.floor(10000 + Math.random() * 90000)}`,
          age: user.age || 45,
          gender: ((userData as any).gender || 'OTHER').toUpperCase() as any,
          roomNumber: (userData as any).roomNumber || 'Room 101',
          doctorId: (userData as any).doctorId || null,
          createdAt: now,
          updatedAt: now,
        };
        await this.patientRepo.create(patient);
      } catch {
        // Non-blocking
      }
    }

    const { passwordHash: _, ...sanitized } = saved;
    return sanitized;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'User not found');
    }

    if (updates.phone && updates.phone !== user.phone) {
      const existingPhone = await this.userRepo.findByPhone(updates.phone);
      if (existingPhone && existingPhone.id !== userId) {
        throw new AppError(409, ErrorCode.CONFLICT, `User with phone ${updates.phone} already exists`);
      }
    }

    if (updates.dateOfBirth) {
      const dobResult = parseDobAndGeneratePassword(updates.dateOfBirth);
      updates.dateOfBirth = dobResult.storedDob;
    }

    const updated = await this.userRepo.update(userId, updates);
    if (!updated) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Failed to update user');
    }

    const { passwordHash: _, ...sanitized } = updated;
    return sanitized;
  }

  async patchUser(userId: string, updates: Partial<User>): Promise<Omit<User, 'passwordHash'>> {
    return this.updateUser(userId, updates);
  }

  async deleteUser(userId: string, adminUserId?: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'User not found');
    }

    if (adminUserId && adminUserId === userId) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Cannot delete your own active administrator account');
    }

    if (user.role === Role.ADMIN) {
      const allUsers = await this.userRepo.listAll();
      const adminCount = allUsers.filter((u) => u.role === Role.ADMIN).length;
      if (adminCount <= 1) {
        throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Cannot delete the last administrator in the system');
      }
    }

    // Clean up corresponding patient record if applicable
    if (user.role === Role.PATIENT) {
      const p = await this.patientRepo.findByUserId(userId);
      if (p) {
        await this.patientRepo.delete(p.id);
      }
    }

    const deleted = await this.userRepo.delete(userId);

    await this.auditLogService.log({
      userId: adminUserId || 'admin',
      action: 'Admin deleted user',
      entity: 'User',
      entityId: userId,
      metadata: { deletedEmail: user.email, role: user.role },
    });

    return deleted;
  }

  async updateUserStatus(userId: string, status: UserStatus, adminUserId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'User not found');
    }

    const updated = await this.userRepo.update(userId, { status });
    if (!updated) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Failed to update user status');
    }

    await this.auditLogService.log({
      userId: adminUserId,
      action: 'Admin changed user status',
      entity: 'User',
      entityId: userId,
      metadata: { from: user.status, to: status },
    });

    const { passwordHash: _, ...sanitized } = updated;
    return sanitized;
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [users, patients, foods, diseases, orders, approvals] = await Promise.all([
      this.userRepo.listAll(),
      this.patientRepo.listAll(),
      this.foodRepo.listAll(),
      this.diseaseRepo.listAll(),
      this.orderRepo.listAll(),
      this.approvalRepo.listAll(),
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysOrders = orders.filter((o) => {
      const orderDate = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '';
      return orderDate === todayStr;
    });

    const pendingApprovals = approvals.filter((a) => a.status === ApprovalStatus.PENDING).length;
    const approvedCount = approvals.filter((a) => a.status === ApprovalStatus.APPROVED).length;
    const rejectedCount = approvals.filter((a) => a.status === ApprovalStatus.REJECTED).length;

    // Calculate food category distribution
    const catMap: Record<string, number> = {};
    foods.forEach((f) => {
      const cat = f.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const foodCategoryDistribution = Object.entries(catMap).map(([category, count]) => ({
      category,
      count,
    }));

    // Calculate disease diet distribution
    const disMap: Record<string, number> = {};
    for (const patient of patients) {
      const pDiseases = await this.patientRepo.getDiseasesForPatient(patient.id);
      pDiseases.forEach((pd) => {
        const name = pd.disease.name;
        disMap[name] = (disMap[name] || 0) + 1;
      });
    }
    const dietDistribution = Object.entries(disMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Orders by day (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const ordersByDayMap: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };
    orders.forEach((o) => {
      if (o.createdAt) {
        const dName = days[new Date(o.createdAt).getDay()];
        if (ordersByDayMap[dName] !== undefined) {
          ordersByDayMap[dName] += 1;
        }
      }
    });
    const ordersByDay = Object.entries(ordersByDayMap).map(([day, count]) => ({ day, count }));

    return {
      totalPatients: patients.length,
      totalDoctors: users.filter((u) => u.role === Role.DOCTOR).length,
      totalKitchenStaff: users.filter((u) => u.role === Role.KITCHEN).length,
      totalFoods: foods.length,
      totalDiseases: diseases.length,
      todaysOrders: todaysOrders.length || orders.length,
      activeFoods: foods.filter((f) => f.status === 'ACTIVE').length,
      pendingApprovals,
      allergyAlerts: rejectedCount,
      ordersByDay,
      dietDistribution: dietDistribution.length > 0 ? dietDistribution : [{ name: 'Diabetes', value: 1 }],
      foodCategoryDistribution,
      approvalComparison: [
        { name: 'Approved', count: approvedCount },
        { name: 'Pending', count: pendingApprovals },
        { name: 'Rejected (Safety)', count: rejectedCount },
      ],
    };
  }

  // Diseases
  async listDiseases(): Promise<Disease[]> {
    return this.diseaseRepo.listAll();
  }

  async createDisease(data: { name: string; description?: string }): Promise<Disease> {
    const id = `dis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date();
    const disease: Disease = {
      id,
      name: data.name,
      description: data.description,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    return this.diseaseRepo.create(disease);
  }

  async updateDisease(id: string, data: Partial<Disease>): Promise<Disease | null> {
    return this.diseaseRepo.update(id, data);
  }

  async patchDisease(id: string, data: Partial<Disease>): Promise<Disease | null> {
    return this.updateDisease(id, data);
  }

  async deleteDisease(id: string): Promise<boolean> {
    return this.diseaseRepo.delete(id);
  }

  // Allergies
  async listAllergies(): Promise<Allergy[]> {
    return this.allergyRepo.listAll();
  }

  async createAllergy(data: { name: string; description?: string }): Promise<Allergy> {
    const id = `alg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date();
    const allergy: Allergy = {
      id,
      name: data.name,
      description: data.description,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    return this.allergyRepo.create(allergy);
  }

  async updateAllergy(id: string, data: Partial<Allergy>): Promise<Allergy | null> {
    return this.allergyRepo.update(id, data);
  }

  async patchAllergy(id: string, data: Partial<Allergy>): Promise<Allergy | null> {
    return this.updateAllergy(id, data);
  }

  async deleteAllergy(id: string): Promise<boolean> {
    return this.allergyRepo.delete(id);
  }
}
