import mongoose, { Schema, Document } from 'mongoose';
import { Severity } from '../constants/index.js';
import { PatientAllergy } from '../types/models.js';

export interface PatientAllergyDocument extends Omit<PatientAllergy, 'id'>, Document {
  id: string;
}

const PatientAllergySchema = new Schema<PatientAllergyDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    allergyId: { type: String, required: true, index: true },
    severity: { type: String, enum: Object.values(Severity), default: Severity.MODERATE },
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

PatientAllergySchema.index({ patientId: 1, allergyId: 1 }, { unique: true });

export const PatientAllergyModel =
  mongoose.models.PatientAllergy || mongoose.model<PatientAllergyDocument>('PatientAllergy', PatientAllergySchema);
export default PatientAllergyModel;
