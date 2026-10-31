import mongoose, { Schema, Document } from 'mongoose';
import { ApprovalStatus } from '../constants/index.js';
import { DoctorFoodApproval } from '../types/models.js';

export interface DoctorFoodApprovalDocument extends Omit<DoctorFoodApproval, 'id'>, Document {
  id: string;
}

const DoctorFoodApprovalSchema = new Schema<DoctorFoodApprovalDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    foodId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    status: { type: String, enum: Object.values(ApprovalStatus), default: ApprovalStatus.PENDING, index: true },
    remarks: { type: String, trim: true },
    approvedAt: { type: Date, default: null },
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

DoctorFoodApprovalSchema.index({ patientId: 1, foodId: 1 }, { unique: true });

export const DoctorFoodApprovalModel =
  mongoose.models.DoctorFoodApproval ||
  mongoose.model<DoctorFoodApprovalDocument>('DoctorFoodApproval', DoctorFoodApprovalSchema);
export default DoctorFoodApprovalModel;
