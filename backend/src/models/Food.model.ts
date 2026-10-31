import mongoose, { Schema, Document } from 'mongoose';
import { FoodCategory } from '../constants/index.js';
import { Food } from '../types/models.js';

export interface FoodDocument extends Omit<Food, 'id'>, Document {
  id: string;
}

const FoodSchema = new Schema<FoodDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, trim: true, index: true },
    category: { type: String, enum: Object.values(FoodCategory), required: true, index: true },
    description: { type: String, trim: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0.0 },
    carbohydrates: { type: Number, default: 0.0 },
    fat: { type: Number, default: 0.0 },
    sodium: { type: Number, default: 0.0 },
    sugar: { type: Number, default: 0.0 },
    preparationInstructions: { type: String, trim: true },
    status: { type: String, default: 'ACTIVE' },
    createdBy: { type: String, default: null },
  },
  {
    timestamps: true,
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

export const FoodModel = mongoose.models.Food || mongoose.model<FoodDocument>('Food', FoodSchema);
export default FoodModel;
