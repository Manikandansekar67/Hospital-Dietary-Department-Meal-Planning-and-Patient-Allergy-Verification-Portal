import mongoose, { Schema, Document } from 'mongoose';
import { MealType, AvailabilityStatus } from '../constants/index.js';
import { KitchenAvailability } from '../types/models.js';

export interface KitchenAvailabilityDocument extends Omit<KitchenAvailability, 'id'>, Document {
  id: string;
}

const KitchenAvailabilitySchema = new Schema<KitchenAvailabilityDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    foodId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    mealType: { type: String, enum: Object.values(MealType), required: true, index: true },
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    status: { type: String, enum: Object.values(AvailabilityStatus), default: AvailabilityStatus.ACTIVE, index: true },
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

KitchenAvailabilitySchema.index({ foodId: 1, date: 1, mealType: 1 });

export const KitchenAvailabilityModel =
  mongoose.models.KitchenAvailability ||
  mongoose.model<KitchenAvailabilityDocument>('KitchenAvailability', KitchenAvailabilitySchema);
export default KitchenAvailabilityModel;
