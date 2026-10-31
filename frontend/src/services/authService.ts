import { Role, User } from '../types';
<<<<<<< HEAD
import { apiClient } from './apiService';

export const authService = {
  login: async (identifier: string, role?: Role, password = 'Hospital@123'): Promise<User> => {
    try {
      const trimmedIdentifier = identifier.trim();
      const res = await apiClient.post('/auth/login', {
        identifier: trimmedIdentifier,
        email: trimmedIdentifier,
        password: password,
      });

      if (res.data?.success && res.data?.data) {
        const { token, user: backendUser, patientId, doctorId } = res.data.data;
        const normalizedRole = (backendUser.role || role || 'doctor').toLowerCase() as Role;
        const user: User = {
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          role: normalizedRole,
          active: backendUser.status === 'ACTIVE' || backendUser.status === undefined,
          patientId: patientId || backendUser.patientId,
          department: backendUser.department,
          phone: backendUser.phone,
          age: backendUser.age,
          dateOfBirth: backendUser.dateOfBirth,
        };

        localStorage.setItem('hdmp_token', token);
        localStorage.setItem('hdmp_current_user', JSON.stringify(user));

        return user;
      }
      throw new Error(res.data?.error?.message || 'Authentication failed');
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials and password.';
      throw new Error(message);
    }
  },

  registerPatient: async (data: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    roomNumber: string;
    contactNumber?: string;
    diseases?: string[];
    allergies?: Array<{ allergyName: string; severity?: string; reactionNotes?: string }>;
  }): Promise<User> => {
    try {
      const res = await apiClient.post('/auth/register', {
        ...data,
        role: 'PATIENT',
      });

      if (res.data?.success && res.data?.data) {
        const { token, user: backendUser, patientId } = res.data.data;
        const user: User = {
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          role: 'patient',
          active: true,
          patientId: patientId || backendUser.patientId,
        };

        localStorage.setItem('hdmp_token', token);
        localStorage.setItem('hdmp_current_user', JSON.stringify(user));

        return user;
      }
      throw new Error(res.data?.error?.message || 'Patient registration failed');
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check your details.';
      throw new Error(message);
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const item = localStorage.getItem('hdmp_current_user');
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('hdmp_token');
    localStorage.removeItem('hdmp_current_user');
  },

  switchRoleUser: async (role: Role): Promise<User> => {
    const roleEmailMap: Record<Role, string> = {
      admin: 'admin@hospital.com',
      doctor: 'doctor@hospital.com',
      kitchen: 'kitchen@hospital.com',
      patient: 'patient@hospital.com',
    };
    const targetEmail = roleEmailMap[role] || `${role}@hospital.com`;
    return authService.login(targetEmail, role, 'Hospital@123');
  },

  getAvailableUsers: (): User[] => {
    return [
      {
        id: 'usr-admin-1',
        name: 'System Administrator',
        email: 'admin@hospital.com',
        role: 'admin',
        active: true,
      },
      {
        id: 'usr-doc-1',
        name: 'Dr. Sarah Mitchell, MD',
        email: 'doctor@hospital.com',
        role: 'doctor',
        active: true,
      },
      {
        id: 'usr-kitchen-1',
        name: 'Chef Marcus Vance',
        email: 'kitchen@hospital.com',
        role: 'kitchen',
        active: true,
      },
      {
        id: 'usr-patient-1',
        name: 'Eleanor Vance',
        email: 'patient@hospital.com',
        role: 'patient',
        patientId: 'pat-1',
        active: true,
      },
    ];
=======
import { delay } from './apiService';
import { storageService } from './storageService';

export const authService = {
  login: async (email: string, role?: Role): Promise<User> => {
    await delay(350);
    const users = storageService.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user && role) {
      user = users.find((u) => u.role === role);
    }

    if (!user) {
      // Default to doctor or create a demo user
      user = users[0];
    }

    if (!user.active) {
      throw new Error('This account has been deactivated. Please contact the dietary administrator.');
    }

    storageService.saveCurrentUser(user);
    return user;
  },

  getCurrentUser: (): User | null => {
    return storageService.getCurrentUser();
  },

  logout: async (): Promise<void> => {
    await delay(150);
    storageService.saveCurrentUser(null);
  },

  switchRoleUser: async (role: Role): Promise<User> => {
    await delay(200);
    const users = storageService.getUsers();
    const targetUser = users.find((u) => u.role === role) || users[0];
    storageService.saveCurrentUser(targetUser);
    return targetUser;
  },

  getAvailableUsers: (): User[] => {
    return storageService.getUsers();
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },
};
