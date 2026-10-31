import mongoose, { Schema, Document } from 'mongoose';
import { Patient } from '../types/models.js';

export interface PatientDocument extends Omit<Patient, 'id'>, Document {
  id: string;
}

const PatientSchema = new Schema<PatientDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, unique: true, index: true },
    patientNumber: { type: String, required: true, unique: true, index: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    roomNumber: { type: String, required: true, index: true },
    doctorId: { type: String, default: null, index: true },
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

export const PatientModel = mongoose.models.Patient || mongoose.model<PatientDocument>('Patient', PatientSchema);
export default PatientModel;
