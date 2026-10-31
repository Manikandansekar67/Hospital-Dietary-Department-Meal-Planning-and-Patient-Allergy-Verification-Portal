import {
  UserRepository,
  PatientRepository,
  DoctorRepository,
  DiseaseRepository,
  AllergyRepository,
} from '../repositories/index.js';
import { User, Patient, Doctor } from '../types/models.js';
import { Role, UserStatus, ErrorCode, Severity } from '../constants/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/response.js';
import { AuditLogService } from './auditLog.service.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
  patientNumber?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  roomNumber?: string;
  contactNumber?: string;
  department?: string;
  licenseNumber?: string;
  station?: string;
  diseases?: string[];
  allergies?: Array<{
    allergyName: string;
    severity?: string;
    reactionNotes?: string;
  }>;
}

export class AuthService {
  constructor(
    private userRepo = new UserRepository(),
    private patientRepo = new PatientRepository(),
    private doctorRepo = new DoctorRepository(),
    private diseaseRepo = new DiseaseRepository(),
    private allergyRepo = new AllergyRepository(),
    private auditLogService = new AuditLogService()
  ) {}

  async register(dto: RegisterDTO): Promise<{ token: string; user: Omit<User, 'passwordHash'>; patientId?: string; doctorId?: string }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new AppError(409, ErrorCode.CONFLICT, `An account with email '${dto.email}' already exists`);
    }

    const passwordHash = await hashPassword(dto.password);
    const now = new Date();
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const user: User = {
      id: userId,
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role,
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    const savedUser = await this.userRepo.create(user);
    let patientId: string | undefined;
    let doctorId: string | undefined;

    if (dto.role === Role.PATIENT) {
      const patId = `pat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const patient: Patient = {
        id: patId,
        userId: savedUser.id,
        patientNumber: dto.patientNumber || `P-${Math.floor(10000 + Math.random() * 90000)}`,
        age: dto.age || 45,
        gender: dto.gender || 'OTHER',
        roomNumber: dto.roomNumber || 'Room 101',
        createdAt: now,
        updatedAt: now,
      };
      await this.patientRepo.create(patient);
      patientId = patient.id;

      // Link any diagnosed diseases provided during registration
      if (Array.isArray(dto.diseases)) {
        for (const dName of dto.diseases) {
          if (!dName || typeof dName !== 'string') continue;
          let disease = await this.diseaseRepo.findByName(dName);
          if (!disease) {
            disease = await this.diseaseRepo.create({
              id: `dis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: dName.trim(),
              description: `Clinical condition: ${dName.trim()}`,
              status: 'ACTIVE',
              createdAt: now,
              updatedAt: now,
            });
          }
          await this.patientRepo.addDisease({
            id: `pd-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            patientId: patient.id,
            diseaseId: disease.id,
            doctorId: 'doc-1',
            notes: 'Reported upon patient self-registration',
            createdAt: now,
          });
        }
      }

      // Link any diagnosed allergies provided during registration
      if (Array.isArray(dto.allergies)) {
        for (const al of dto.allergies) {
          if (!al || !al.allergyName) continue;
          const alName = al.allergyName.trim();
          let allergy = await this.allergyRepo.findByName(alName);
          if (!allergy) {
            allergy = await this.allergyRepo.create({
              id: `alg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: alName,
              description: `Allergic sensitivity: ${alName}`,
              status: 'ACTIVE',
              createdAt: now,
              updatedAt: now,
            });
          }

          const rawSev = (al.severity || 'MODERATE').toUpperCase();
          const severity: Severity =
            rawSev === 'CRITICAL'
              ? Severity.CRITICAL
              : rawSev === 'SEVERE'
              ? Severity.SEVERE
              : rawSev === 'MILD'
              ? Severity.MILD
              : Severity.MODERATE;

          await this.patientRepo.addAllergy({
            id: `pa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            patientId: patient.id,
            allergyId: allergy.id,
            severity,
            doctorId: 'doc-1',
            notes: al.reactionNotes || 'Self-reported by patient upon portal registration',
            createdAt: now,
          });
        }
      }
    } else if (dto.role === Role.DOCTOR) {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const doctor: Doctor = {
        id: docId,
        userId: savedUser.id,
        department: dto.department || 'Clinical Dietetics',
        licenseNumber: dto.licenseNumber || `MD-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: now,
        updatedAt: now,
      };
      await this.doctorRepo.create(doctor);
      doctorId = doctor.id;
    }

    const token = signToken({
      userId: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      patientId,
      doctorId,
    });

    await this.auditLogService.log({
      userId: savedUser.id,
      action: 'User registered',
      entity: 'User',
      entityId: savedUser.id,
      metadata: { role: savedUser.role, email: savedUser.email },
    });

    const { passwordHash: _, ...sanitizedUser } = savedUser;
    return { token, user: sanitizedUser, patientId, doctorId };
  }

  async login(identifier: string, password: string): Promise<{ token: string; user: Omit<User, 'passwordHash'>; patientId?: string; doctorId?: string }> {
    // Support login via email or phone number
    const isPhone = /^[+\d][\d\s\-().]{6,}$/.test(identifier.trim()) && !identifier.includes('@');
    let user: User | null = null;

    if (isPhone) {
      user = await this.userRepo.findByPhone(identifier.trim());
    } else {
      user = await this.userRepo.findByEmail(identifier.trim());
    }

    if (!user) {
      throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Invalid credentials. Please check your email/phone and password.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(403, ErrorCode.FORBIDDEN, `Account is currently ${user.status.toLowerCase()}`);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Invalid credentials. Please check your email/phone and password.');
    }

    let patientId: string | undefined;
    let doctorId: string | undefined;

    if (user.role === Role.PATIENT) {
      const patient = await this.patientRepo.findByUserId(user.id);
      patientId = patient?.id;
    } else if (user.role === Role.DOCTOR) {
      const doctor = await this.doctorRepo.findByUserId(user.id);
      doctorId = doctor?.id;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      patientId,
      doctorId,
    });

    const { passwordHash: _, ...sanitizedUser } = user;
    return { token, user: sanitizedUser, patientId, doctorId };
  }
}
