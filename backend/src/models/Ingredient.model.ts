import mongoose, { Schema, Document } from 'mongoose';
import { Ingredient } from '../types/models.js';

export interface IngredientDocument extends Omit<Ingredient, 'id'>, Document {
  id: string;
}

const IngredientSchema = new Schema<IngredientDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, trim: true },
    status: { type: String, default: 'ACTIVE' },
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

export const IngredientModel =
  mongoose.models.Ingredient || mongoose.model<IngredientDocument>('Ingredient', IngredientSchema);
export default IngredientModel;
