import {
  PatientRepository,
  DiseaseRepository,
  AllergyRepository,
  UserRepository,
  DoctorRepository,
} from '../repositories/index.js';
import { Patient, Disease, Allergy, PatientDisease, PatientAllergy, User } from '../types/models.js';
import { Severity, NotificationType, ErrorCode, Role, UserStatus } from '../constants/index.js';
import { AppError } from '../utils/response.js';
import { AuditLogService } from './auditLog.service.js';
import { NotificationService } from './notification.service.js';

export class PatientService {
  constructor(
    private patientRepo = new PatientRepository(),
    private diseaseRepo = new DiseaseRepository(),
    private allergyRepo = new AllergyRepository(),
    private userRepo = new UserRepository(),
    private doctorRepo = new DoctorRepository(),
    private auditLogService = new AuditLogService(),
    private notifService = new NotificationService()
  ) {}

  async getPatientProfile(patientId: string): Promise<{
    patient: Patient;
    user: { name: string; email: string };
    diseases: Array<{ disease: Disease; notes?: string }>;
    allergies: Array<{ allergy: Allergy; severity: Severity; notes?: string }>;
  }> {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient record not found');
    }

    const user = await this.userRepo.findById(patient.userId);
    const diseases = await this.patientRepo.getDiseasesForPatient(patientId);
    const allergies = await this.patientRepo.getAllergiesForPatient(patientId);

    return {
      patient,
      user: { name: user?.name || 'Unknown', email: user?.email || '' },
      diseases,
      allergies,
    };
  }

  async listAllPatients(requestingDoctorId?: string): Promise<any[]> {
    // 1. Ensure any User with Role.PATIENT has a corresponding Patient record
    try {
      const allUsers = await this.userRepo.listAll();
      const patientUsers = allUsers.filter((u) => (u.role || '').toUpperCase() === Role.PATIENT && u.status !== UserStatus.INACTIVE);
      for (const pu of patientUsers) {
        let pRecord = await this.patientRepo.findByUserId(pu.id);
        if (!pRecord) {
          const patId = `pat-${pu.id.replace(/^usr-/, '')}`;
          pRecord = {
            id: patId,
            userId: pu.id,
            patientNumber: (pu as any).patientNumber || `P-${Math.floor(10000 + Math.random() * 90000)}`,
            age: pu.age || 45,
            gender: 'OTHER',
            roomNumber: 'Room 101',
            doctorId: null,
            createdAt: pu.createdAt || new Date(),
            updatedAt: new Date(),
          };
          await this.patientRepo.create(pRecord);
        }
      }
    } catch {
      // Non-blocking
    }

    const patients = await this.patientRepo.listAll();
    const enriched = await Promise.all(
      patients.map(async (p) => {
        const user = await this.userRepo.findById(p.userId);
        const diseases = await this.patientRepo.getDiseasesForPatient(p.id);
        const allergies = await this.patientRepo.getAllergiesForPatient(p.id);

        let doctorName = 'Unassigned';
        let assignedDoctorObj: any = null;
        if (p.doctorId && p.doctorId !== 'unassigned' && p.doctorId !== 'none') {
          const doc = (await this.doctorRepo.findById(p.doctorId)) || (await this.doctorRepo.findByUserId(p.doctorId));
          if (doc) {
            const docUser = await this.userRepo.findById(doc.userId);
            doctorName = docUser?.name || 'Dr. Assigned';
            assignedDoctorObj = {
              id: doc.id,
              userId: doc.userId,
              name: docUser?.name || 'Dr. Assigned',
              email: docUser?.email || '',
              department: doc.department,
            };
          } else {
            const docUser = await this.userRepo.findById(p.doctorId);
            if (docUser) {
              doctorName = docUser.name;
              assignedDoctorObj = {
                id: docUser.id,
                userId: docUser.id,
                name: docUser.name,
                email: docUser.email,
                department: 'Clinical Care',
              };
            }
          }
        }

        const phone = user?.phone || (p as any).contactNumber || (p as any).phone || '';

        return {
          ...p,
          name: user?.name || `Patient ${p.patientNumber}`,
          email: user?.email || '',
          phone,
          contactNumber: phone,
          doctorId: p.doctorId || null,
          doctorName,
          assignedDoctor: assignedDoctorObj,
          patientCode: p.patientNumber,
          admissionDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '2026-10-10',
          diseases: diseases.map((d) => d.disease.name),
          allergies: allergies.map((a) => ({
            allergyId: a.allergy.id,
            allergyName: a.allergy.name,
            severity: (a.severity || 'moderate').toLowerCase(),
            reactionNotes: a.notes,
          })),
          dietaryRestrictions: diseases.map((d) => d.disease.description).filter(Boolean),
          specialInstructions: allergies.map((a) => a.notes).filter(Boolean).join('; ') || 'Standard dietary supervision',
          status: 'admitted',
        };
      })
    );

    if (requestingDoctorId) {
      const docRecord =
        (await this.doctorRepo.findById(requestingDoctorId)) ||
        (await this.doctorRepo.findByUserId(requestingDoctorId));
      const possibleDocIds = new Set<string>([requestingDoctorId]);
      if (docRecord) {
        possibleDocIds.add(docRecord.id);
        possibleDocIds.add(docRecord.userId);
      }
      return enriched.filter((p) => p.doctorId && possibleDocIds.has(p.doctorId));
    }

    return enriched;
  }

  async createPatient(params: {
    name: string;
    age: number | string;
    gender?: string;
    roomNumber: string;
    contactNumber?: string;
    patientCode?: string;
    diseases?: string[];
    allergies?: Array<{
      allergyName: string;
      severity?: string;
      reactionNotes?: string;
    }>;
    dietaryRestrictions?: string[];
    specialInstructions?: string;
    doctorId?: string;
  }): Promise<any> {
    if (!params.name || !params.roomNumber) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Name and Room Number are required');
    }

    const patientId = `pat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const patientCode = params.patientCode || `P-${Math.floor(10000 + Math.random() * 90000)}`;
    const email = `${patientCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@hospital.com`;

    // 1. Create User account for patient
    const user: User = {
      id: userId,
      name: params.name,
      email,
      phone: params.contactNumber ? params.contactNumber.trim() : undefined,
      passwordHash: '$2a$10$defaultHashPlaceholder',
      role: Role.PATIENT,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.userRepo.create(user);

    // 2. Resolve Doctor Assignment if provided
    let validDocId: string | null = null;
    let doctorName = 'Unassigned';
    if (params.doctorId && params.doctorId !== 'unassigned' && params.doctorId !== 'none') {
      const doc =
        (await this.doctorRepo.findById(params.doctorId)) ||
        (await this.doctorRepo.findByUserId(params.doctorId));
      if (doc) {
        validDocId = doc.id;
        const docUser = await this.userRepo.findById(doc.userId);
        doctorName = docUser?.name || 'Dr. Assigned';
      } else {
        const docUser = await this.userRepo.findById(params.doctorId);
        if (docUser && docUser.role === Role.DOCTOR) {
          validDocId = docUser.id;
          doctorName = docUser.name;
        }
      }
    }

    // 3. Create Patient Record
    const rawGender = (params.gender || 'MALE').toUpperCase();
    const gender: 'MALE' | 'FEMALE' | 'OTHER' =
      rawGender === 'FEMALE' ? 'FEMALE' : rawGender === 'OTHER' ? 'OTHER' : 'MALE';

    const patient: Patient = {
      id: patientId,
      userId,
      patientNumber: patientCode,
      age: parseInt(String(params.age), 10) || 45,
      gender,
      roomNumber: params.roomNumber,
      doctorId: validDocId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.patientRepo.create(patient);

    const docActionId = validDocId || 'doc-1';

    // 4. Link Diagnosed Diseases
    const attachedDiseases: string[] = [];
    if (Array.isArray(params.diseases)) {
      for (const dName of params.diseases) {
        if (!dName || typeof dName !== 'string') continue;
        let disease = await this.diseaseRepo.findByName(dName);
        if (!disease) {
          disease = await this.diseaseRepo.create({
            id: `dis-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: dName.trim(),
            description: `Clinical condition: ${dName.trim()}`,
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        await this.addPatientDisease({
          patientId,
          diseaseId: disease.id,
          doctorId: docActionId,
          notes: 'Diagnosed upon registration',
        });
        attachedDiseases.push(disease.name);
      }
    }

    // 5. Link Diagnosed Allergies
    const attachedAllergies: Array<{ allergyId: string; allergyName: string; severity: string; reactionNotes?: string }> = [];
    if (Array.isArray(params.allergies)) {
      for (const al of params.allergies) {
        if (!al || !al.allergyName) continue;
        const alName = al.allergyName.trim();
        let allergy = await this.allergyRepo.findByName(alName);
        if (!allergy) {
          allergy = await this.allergyRepo.create({
            id: `alg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: alName,
            description: `Allergic sensitivity: ${alName}`,
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
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

        await this.addPatientAllergy({
          patientId,
          allergyId: allergy.id,
          severity,
          doctorId: docActionId,
          notes: al.reactionNotes || params.specialInstructions || 'Logged upon registration',
        });

        attachedAllergies.push({
          allergyId: allergy.id,
          allergyName: allergy.name,
          severity: severity.toLowerCase(),
          reactionNotes: al.reactionNotes,
        });
      }
    }

    await this.auditLogService.log({
      userId: docActionId,
      action: 'Registered new inpatient',
      entity: 'Patient',
      entityId: patientId,
      metadata: { patientNumber: patientCode, name: params.name, roomNumber: params.roomNumber, doctorId: validDocId },
    });

    return {
      id: patientId,
      userId,
      patientCode,
      name: params.name,
      email,
      phone: params.contactNumber || '',
      contactNumber: params.contactNumber || '',
      age: patient.age,
      gender: patient.gender,
      roomNumber: patient.roomNumber,
      admissionDate: new Date().toISOString().split('T')[0],
      doctorId: validDocId,
      doctorName,
      status: 'admitted',
      diseases: attachedDiseases,
      allergies: attachedAllergies,
      dietaryRestrictions: params.dietaryRestrictions || attachedDiseases,
      specialInstructions: params.specialInstructions || 'Standard dietary supervision',
    };
  }

  async addPatientDisease(params: {
    patientId: string;
    diseaseId: string;
    doctorId: string;
    notes?: string;
  }): Promise<PatientDisease> {
    const patient = await this.patientRepo.findById(params.patientId);
    if (!patient) throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient not found');

    const disease = await this.diseaseRepo.findById(params.diseaseId);
    if (!disease) throw new AppError(404, ErrorCode.NOT_FOUND, 'Disease record not found');

    const pd: PatientDisease = {
      id: `pd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      patientId: params.patientId,
      diseaseId: params.diseaseId,
      doctorId: params.doctorId,
      notes: params.notes,
      createdAt: new Date(),
    };

    await this.patientRepo.addDisease(pd);

    await this.auditLogService.log({
      userId: params.doctorId,
      action: 'Doctor changed disease',
      entity: 'PatientDisease',
      entityId: pd.id,
      metadata: { patientId: params.patientId, diseaseName: disease.name, notes: params.notes },
    });

    return pd;
  }

  async addPatientAllergy(params: {
    patientId: string;
    allergyId: string;
    severity: Severity;
    doctorId: string;
    notes?: string;
  }): Promise<PatientAllergy> {
    const patient = await this.patientRepo.findById(params.patientId);
    if (!patient) throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient not found');

    const allergy = await this.allergyRepo.findById(params.allergyId);
    if (!allergy) throw new AppError(404, ErrorCode.NOT_FOUND, 'Allergy record not found');

    const pa: PatientAllergy = {
      id: `pa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      patientId: params.patientId,
      allergyId: params.allergyId,
      severity: params.severity,
      doctorId: params.doctorId,
      notes: params.notes,
      createdAt: new Date(),
    };

    await this.patientRepo.addAllergy(pa);

    await this.auditLogService.log({
      userId: params.doctorId,
      action: 'Doctor added allergy',
      entity: 'PatientAllergy',
      entityId: pa.id,
      metadata: { patientId: params.patientId, allergyName: allergy.name, severity: params.severity },
    });

    if (params.severity === Severity.SEVERE || params.severity === Severity.CRITICAL) {
      await this.notifService.notify({
        userId: patient.userId,
        type: NotificationType.ALLERGY_ALERT,
        title: 'Clinical Allergy Alert Logged',
        message: `Dr. recorded a ${params.severity} allergy to ${allergy.name}. All future dietary requests will strictly isolate this allergen.`,
      });
    }

    return pa;
  }

  async updatePatient(
    patientId: string,
    updates: Partial<Patient> & {
      name?: string;
      email?: string;
      phone?: string;
      contactNumber?: string;
    }
  ): Promise<any> {
    const existing = await this.patientRepo.findById(patientId);
    if (!existing) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient not found');
    }

    if (existing.userId && (updates.name || updates.phone || updates.contactNumber || updates.email)) {
      const userUpdates: Partial<User> = {};
      if (updates.name) userUpdates.name = updates.name;
      if (updates.phone || updates.contactNumber) userUpdates.phone = updates.phone || updates.contactNumber;
      if (updates.email) userUpdates.email = updates.email.toLowerCase();
      await this.userRepo.update(existing.userId, userUpdates);
    }

    const patientUpdates: Partial<Patient> = {};
    if (updates.age !== undefined) patientUpdates.age = Number(updates.age);
    if (updates.gender) patientUpdates.gender = updates.gender;
    if (updates.roomNumber) patientUpdates.roomNumber = updates.roomNumber;
    if (updates.doctorId !== undefined) patientUpdates.doctorId = updates.doctorId;
    if (updates.patientNumber) patientUpdates.patientNumber = updates.patientNumber;

    await this.patientRepo.update(patientId, patientUpdates);
    return this.getPatientProfile(patientId);
  }

  async patchPatient(patientId: string, updates: Partial<Patient> & Record<string, any>): Promise<any> {
    return this.updatePatient(patientId, updates);
  }

  async deletePatient(patientId: string, actorId?: string): Promise<boolean> {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient not found');
    }

    const deleted = await this.patientRepo.delete(patientId);

    if (patient.userId) {
      const user = await this.userRepo.findById(patient.userId);
      if (user && user.role === Role.PATIENT) {
        await this.userRepo.delete(patient.userId);
      }
    }

    await this.auditLogService.log({
      userId: actorId || 'system',
      action: 'Admin deleted patient record',
      entity: 'Patient',
      entityId: patientId,
      metadata: { patientNumber: patient.patientNumber },
    });

    return deleted;
  }

  async removePatientDisease(patientId: string, diseaseId: string, doctorId: string = 'doc-1'): Promise<boolean> {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient not found');

    const removed = await this.patientRepo.removeDisease(patientId, diseaseId);

    await this.auditLogService.log({
      userId: doctorId,
      action: 'Doctor removed disease from patient',
      entity: 'PatientDisease',
      entityId: `${patientId}_${diseaseId}`,
      metadata: { patientId, diseaseId },
    });

    return removed;
  }

  async removePatientAllergy(patientId: string, allergyId: string, doctorId: string = 'doc-1'): Promise<boolean> {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) throw new AppError(404, ErrorCode.NOT_FOUND, 'Patient not found');

    const removed = await this.patientRepo.removeAllergy(patientId, allergyId);

    await this.auditLogService.log({
      userId: doctorId,
      action: 'Doctor removed allergy from patient',
      entity: 'PatientAllergy',
      entityId: `${patientId}_${allergyId}`,
      metadata: { patientId, allergyId },
    });

    return removed;
  }
}
