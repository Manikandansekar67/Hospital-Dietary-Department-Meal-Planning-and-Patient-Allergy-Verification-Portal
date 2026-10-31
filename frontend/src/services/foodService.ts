<<<<<<< HEAD
import { Food } from '../types';
import { apiClient } from './apiService';

export const foodService = {
  getFoods: async (): Promise<Food[]> => {
    const res = await apiClient.get('/foods');
    return (res.data.data || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      description: f.description || '',
      image: f.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      ingredients: f.ingredients || [],
      diseaseCompatibility: f.diseaseCompatibility || [],
      nutrition: {
        calories: f.calories || f.nutrition?.calories || 250,
        protein: f.protein || f.nutrition?.protein || 10,
        carbohydrates: f.carbohydrates || f.nutrition?.carbohydrates || 30,
        fat: f.fat || f.nutrition?.fat || 5,
        sodium: f.sodium || f.nutrition?.sodium || 80,
        sugar: f.sugar || f.nutrition?.sugar || 4,
      },
      preparationInstructions: f.preparationInstructions || 'Strict allergen isolation mandatory during preparation',
      status: (f.status || 'ACTIVE').toLowerCase() as 'active' | 'inactive',
      createdAt: f.createdAt ? new Date(f.createdAt).toISOString().split('T')[0] : '2026-10-10',
    }));
  },

  getFoodById: async (id: string): Promise<Food | null> => {
    try {
      const res = await apiClient.get(`/foods/${id}`);
      const data = res.data.data;
      if (!data) return null;
      const f = data.food || data;
      const ingredients = (data.ingredients || []).map((i: any) => i.name || i);

      return {
        id: f.id,
        name: f.name,
        category: f.category,
        description: f.description || '',
        image: f.image || '',
        ingredients: ingredients.length > 0 ? ingredients : (f.ingredients || []),
        nutrition: {
          calories: f.calories || 250,
          protein: f.protein || 10,
          carbohydrates: f.carbohydrates || 30,
          fat: f.fat || 5,
          sodium: f.sodium || 80,
          sugar: f.sugar || 4,
        },
        preparationInstructions: f.preparationInstructions || 'Strict allergen isolation mandatory during preparation',
        status: (f.status || 'ACTIVE').toLowerCase() as 'active' | 'inactive',
        createdAt: f.createdAt ? new Date(f.createdAt).toISOString().split('T')[0] : '2026-10-10',
      };
    } catch {
      return null;
    }
  },

  addFood: async (newFood: Omit<Food, 'id' | 'createdAt'> & { status?: 'active' | 'inactive' }): Promise<Food> => {
    const rawCat = (newFood.category || 'LUNCH').toUpperCase().replace(/[^A-Z]/g, '');
    const validCats = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'BEVERAGE'];
    const category = validCats.includes(rawCat) ? rawCat : 'LUNCH';

    const ingredients = Array.isArray(newFood.ingredients)
      ? newFood.ingredients.filter((i) => typeof i === 'string' && i.trim().length > 0)
      : ['Wholesome ingredients'];

    const res = await apiClient.post('/foods', {
      name: newFood.name,
      category,
      description: newFood.description,
      calories: Number(newFood.nutrition?.calories) || 250,
      protein: Number(newFood.nutrition?.protein) || 10,
      carbohydrates: Number(newFood.nutrition?.carbohydrates) || 30,
      fat: Number(newFood.nutrition?.fat) || 5,
      sodium: Number(newFood.nutrition?.sodium) || 80,
      sugar: Number(newFood.nutrition?.sugar) || 4,
      preparationInstructions: newFood.preparationInstructions || 'Strict allergen isolation mandatory during preparation',
      ingredients: ingredients.length > 0 ? ingredients : ['Fresh vegetables'],
    });

    const f = res.data.data?.food || res.data.data;
    return {
      id: f.id,
      name: f.name,
      category: f.category,
      description: f.description || '',
      image: '',
      ingredients,
      nutrition: {
        calories: f.calories,
        protein: f.protein,
        carbohydrates: f.carbohydrates,
        fat: f.fat,
        sodium: f.sodium,
        sugar: f.sugar,
      },
      preparationInstructions: f.preparationInstructions,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
  },

  updateFood: async (id: string, updates: Partial<Food>): Promise<Food> => {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.category) payload.category = updates.category.toUpperCase();
    if (updates.description) payload.description = updates.description;
    if (updates.status) payload.status = updates.status.toUpperCase();
    if (updates.nutrition?.calories) payload.calories = updates.nutrition.calories;
    if (updates.nutrition?.protein) payload.protein = updates.nutrition.protein;
    if (updates.nutrition?.carbohydrates) payload.carbohydrates = updates.nutrition.carbohydrates;
    if (updates.nutrition?.fat) payload.fat = updates.nutrition.fat;
    if (updates.nutrition?.sodium) payload.sodium = updates.nutrition.sodium;
    if (updates.nutrition?.sugar) payload.sugar = updates.nutrition.sugar;
    if (updates.preparationInstructions) payload.preparationInstructions = updates.preparationInstructions;

    const res = await apiClient.put(`/foods/${id}`, payload);
    const f = res.data.data;
    return {
      id: f.id,
      name: f.name,
      category: f.category,
      description: f.description || '',
      image: '',
      ingredients: f.ingredients || [],
      nutrition: {
        calories: f.calories,
        protein: f.protein,
        carbohydrates: f.carbohydrates,
        fat: f.fat,
        sodium: f.sodium,
        sugar: f.sugar,
      },
      preparationInstructions: f.preparationInstructions,
      status: (f.status || 'ACTIVE').toLowerCase() as 'active' | 'inactive',
      createdAt: f.createdAt ? new Date(f.createdAt).toISOString().split('T')[0] : '2026-10-10',
    };
  },

  toggleFoodStatus: async (id: string): Promise<Food> => {
    const food = await foodService.getFoodById(id);
    const newStatus = food?.status === 'active' ? 'inactive' : 'active';
    return foodService.updateFood(id, { status: newStatus });
  },

  patchFood: async (id: string, updates: Partial<Food>): Promise<Food> => {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.category) payload.category = updates.category.toUpperCase();
    if (updates.description) payload.description = updates.description;
    if (updates.status) payload.status = updates.status.toUpperCase();
    if (updates.nutrition?.calories) payload.calories = updates.nutrition.calories;
    if (updates.nutrition?.protein) payload.protein = updates.nutrition.protein;
    if (updates.nutrition?.carbohydrates) payload.carbohydrates = updates.nutrition.carbohydrates;
    if (updates.nutrition?.fat) payload.fat = updates.nutrition.fat;
    if (updates.nutrition?.sodium) payload.sodium = updates.nutrition.sodium;
    if (updates.nutrition?.sugar) payload.sugar = updates.nutrition.sugar;
    if (updates.preparationInstructions) payload.preparationInstructions = updates.preparationInstructions;

    const res = await apiClient.patch(`/foods/${id}`, payload);
    const f = res.data.data;
    return {
      id: f.id,
      name: f.name,
      category: f.category,
      description: f.description || '',
      image: '',
      ingredients: f.ingredients || [],
      nutrition: {
        calories: f.calories,
        protein: f.protein,
        carbohydrates: f.carbohydrates,
        fat: f.fat,
        sodium: f.sodium,
        sugar: f.sugar,
      },
      preparationInstructions: f.preparationInstructions,
      status: (f.status || 'ACTIVE').toLowerCase() as 'active' | 'inactive',
      createdAt: f.createdAt ? new Date(f.createdAt).toISOString().split('T')[0] : '2026-10-10',
    };
  },

  deleteFood: async (id: string): Promise<void> => {
    await apiClient.delete(`/foods/${id}`);
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  },
};
