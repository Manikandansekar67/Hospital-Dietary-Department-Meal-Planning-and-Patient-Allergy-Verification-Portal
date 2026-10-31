import mongoose, { Schema, Document } from 'mongoose';
import { Disease } from '../types/models.js';

export interface DiseaseDocument extends Omit<Disease, 'id'>, Document {
  id: string;
}

const DiseaseSchema = new Schema<DiseaseDocument>(
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

export const DiseaseModel = mongoose.models.Disease || mongoose.model<DiseaseDocument>('Disease', DiseaseSchema);
export default DiseaseModel;
