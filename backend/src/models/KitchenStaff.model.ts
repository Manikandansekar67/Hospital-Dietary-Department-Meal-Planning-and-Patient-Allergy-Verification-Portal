import mongoose, { Schema, Document } from 'mongoose';
import { KitchenStaff } from '../types/models.js';

export interface KitchenStaffDocument extends Omit<KitchenStaff, 'id'>, Document {
  id: string;
}

const KitchenStaffSchema = new Schema<KitchenStaffDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, unique: true, index: true },
    station: { type: String, trim: true },
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

export const KitchenStaffModel =
  mongoose.models.KitchenStaff || mongoose.model<KitchenStaffDocument>('KitchenStaff', KitchenStaffSchema);
export default KitchenStaffModel;
