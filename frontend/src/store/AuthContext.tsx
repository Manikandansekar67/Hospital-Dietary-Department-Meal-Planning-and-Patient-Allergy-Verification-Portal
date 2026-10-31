import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  login: (identifier: string, role?: Role, password?: string) => Promise<User>;
  registerPatient: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => Promise<User>;
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
    setAvailableUsers(authService.getAvailableUsers());
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, role?: Role, password?: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(identifier, role, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPatient = async (data: any) => {
    setIsLoading(true);
    try {
      const newUser = await authService.registerPatient(data);
      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: Role) => {
    setIsLoading(true);
    try {
      const switched = await authService.switchRoleUser(targetRole);
      setUser(switched);
      return switched;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        registerPatient,
        logout,
        switchRole,
        availableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
