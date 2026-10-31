import mongoose, { Schema, Document } from 'mongoose';
import { Allergy } from '../types/models.js';

export interface AllergyDocument extends Omit<Allergy, 'id'>, Document {
  id: string;
}

const AllergySchema = new Schema<AllergyDocument>(
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

export const AllergyModel = mongoose.models.Allergy || mongoose.model<AllergyDocument>('Allergy', AllergySchema);
export default AllergyModel;
