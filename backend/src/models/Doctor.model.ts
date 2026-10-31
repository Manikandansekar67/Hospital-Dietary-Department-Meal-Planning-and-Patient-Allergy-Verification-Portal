import mongoose, { Schema, Document } from 'mongoose';
import { Doctor } from '../types/models.js';

export interface DoctorDocument extends Omit<Doctor, 'id'>, Document {
  id: string;
}

const DoctorSchema = new Schema<DoctorDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, unique: true, index: true },
    department: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, index: true },
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

export const DoctorModel = mongoose.models.Doctor || mongoose.model<DoctorDocument>('Doctor', DoctorSchema);
export default DoctorModel;
