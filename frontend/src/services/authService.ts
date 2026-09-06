import { Role, User } from '../types';
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
  },
};
