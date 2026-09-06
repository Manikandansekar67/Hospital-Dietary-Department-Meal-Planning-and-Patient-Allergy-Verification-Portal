import { Food, FoodCategory } from '../types';
import { delay } from './apiService';
import { storageService } from './storageService';

export const foodService = {
  getFoods: async (): Promise<Food[]> => {
    await delay(200);
    return storageService.getFoods();
  },

  getFoodById: async (id: string): Promise<Food | null> => {
    await delay(100);
    const foods = storageService.getFoods();
    return foods.find((f) => f.id === id) || null;
  },

  addFood: async (newFood: Omit<Food, 'id' | 'createdAt'> & { status?: 'active' | 'inactive' }): Promise<Food> => {
    await delay(350);
    const foods = storageService.getFoods();
    const food: Food = {
      status: 'active',
      ...newFood,
      id: `food-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    foods.unshift(food);
    storageService.saveFoods(foods);
    return food;
  },

  updateFood: async (id: string, updates: Partial<Food>): Promise<Food> => {
    await delay(250);
    const foods = storageService.getFoods();
    const index = foods.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Food item not found');

    const updated = { ...foods[index], ...updates };
    foods[index] = updated;
    storageService.saveFoods(foods);
    return updated;
  },

  toggleFoodStatus: async (id: string): Promise<Food> => {
    await delay(200);
    const foods = storageService.getFoods();
    const index = foods.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Food item not found');

    foods[index].status = foods[index].status === 'active' ? 'inactive' : 'active';
    storageService.saveFoods(foods);
    return foods[index];
  },
};
