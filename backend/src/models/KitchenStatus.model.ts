import mongoose, { Schema, Document } from 'mongoose';

export interface KitchenStatusDocument extends Document {
  isActive: boolean;
  notes: string;
  updatedAt: Date;
}

const KitchenStatusSchema = new Schema<KitchenStatusDocument>(
  {
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: 'Kitchen operations normal' },
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

export const KitchenStatusModel =
  mongoose.models.KitchenStatus || mongoose.model<KitchenStatusDocument>('KitchenStatus', KitchenStatusSchema);
export default KitchenStatusModel;
