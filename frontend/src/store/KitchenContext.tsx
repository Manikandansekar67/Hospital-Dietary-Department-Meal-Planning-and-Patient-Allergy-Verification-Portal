import React, { createContext, useContext, useEffect, useState } from 'react';
import { kitchenService } from '../services/kitchenService';
import { KitchenStatus } from '../types';
<<<<<<< HEAD
import { useAuth } from './AuthContext';
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3

interface KitchenContextType {
  kitchenStatus: KitchenStatus;
  isLoading: boolean;
  currentSession: string;
  availableTodayCount: number;
  toggleKitchenStatus: (isActive: boolean, staffName: string) => Promise<KitchenStatus>;
  refreshStatus: () => Promise<void>;
}

const defaultStatus: KitchenStatus = {
  isActive: true,
  activeSession: 'lunch',
  date: new Date().toISOString().split('T')[0],
};

/** Derive the current meal session from the time of day */
const deriveCurrentSession = (): string => {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 10) return 'breakfast';
  if (hour >= 12 && hour < 15) return 'lunch';
  if (hour >= 18 && hour < 21) return 'dinner';
  if (hour >= 10 && hour < 12) return 'snacks';
  if (hour >= 15 && hour < 18) return 'snacks';
  return 'lunch'; // default
};

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kitchenStatus, setKitchenStatus] = useState<KitchenStatus>(defaultStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTodayCount, setAvailableTodayCount] = useState(0);
<<<<<<< HEAD
  const { user } = useAuth();
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3

  const currentSession = kitchenStatus.activeSession ?? deriveCurrentSession();

  const refreshStatus = async () => {
    try {
      const status = await kitchenService.getKitchenStatus();
<<<<<<< HEAD
      if (status) {
        setKitchenStatus(status);
      }

      // Only fetch availability if user is authenticated (availabilities requires auth)
      const token = localStorage.getItem('hdmp_token');
      if (token) {
        try {
          const available = await kitchenService.getDailyAvailability();
          if (Array.isArray(available)) {
            setAvailableTodayCount(available.filter((a: any) => a.isAvailable).length);
          }
        } catch {
          // non-critical availability check failure
        }
      }
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        console.warn('Kitchen status unavailable:', err?.message || err);
      }
=======
      setKitchenStatus(status);

      // Also fetch available foods count
      try {
        const available = await kitchenService.getDailyAvailability();
        setAvailableTodayCount(available.filter((a: any) => a.isAvailable).length);
      } catch {
        // non-critical
      }
    } catch (err) {
      console.error('Failed to load kitchen status:', err);
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
<<<<<<< HEAD
  }, [user?.id]);
=======
  }, []);
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3

  const toggleKitchenStatus = async (isActive: boolean, staffName: string) => {
    const updated = await kitchenService.toggleKitchenStatus(isActive, staffName);
    setKitchenStatus(updated);
    return updated;
  };

  return (
    <KitchenContext.Provider
      value={{
        kitchenStatus,
        isLoading,
        currentSession,
        availableTodayCount,
        toggleKitchenStatus,
        refreshStatus,
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};
