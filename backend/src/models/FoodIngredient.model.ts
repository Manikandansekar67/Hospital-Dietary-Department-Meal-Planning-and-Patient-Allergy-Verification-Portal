import mongoose, { Schema, Document } from 'mongoose';
import { FoodIngredient } from '../types/models.js';

export interface FoodIngredientDocument extends Omit<FoodIngredient, 'id'>, Document {
  id: string;
}

const FoodIngredientSchema = new Schema<FoodIngredientDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    foodId: { type: String, required: true, index: true },
    ingredientId: { type: String, required: true, index: true },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

FoodIngredientSchema.index({ foodId: 1, ingredientId: 1 }, { unique: true });

export const FoodIngredientModel =
  mongoose.models.FoodIngredient || mongoose.model<FoodIngredientDocument>('FoodIngredient', FoodIngredientSchema);
export default FoodIngredientModel;
