import mongoose, { Schema, Document } from 'mongoose';
import { PatientDisease } from '../types/models.js';

export interface PatientDiseaseDocument extends Omit<PatientDisease, 'id'>, Document {
  id: string;
}

const PatientDiseaseSchema = new Schema<PatientDiseaseDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    diseaseId: { type: String, required: true, index: true },
    doctorId: { type: String, default: null },
    notes: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
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

PatientDiseaseSchema.index({ patientId: 1, diseaseId: 1 }, { unique: true });

export const PatientDiseaseModel =
  mongoose.models.PatientDisease || mongoose.model<PatientDiseaseDocument>('PatientDisease', PatientDiseaseSchema);
export default PatientDiseaseModel;
