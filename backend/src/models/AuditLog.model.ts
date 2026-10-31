import mongoose, { Schema, Document } from 'mongoose';
import { AuditLog } from '../types/models.js';

export interface AuditLogDocument extends Omit<AuditLog, 'id'>, Document {
  id: string;
}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: null },
    timestamp: { type: Date, default: Date.now, index: true },
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

AuditLogSchema.index({ timestamp: -1 });

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);
export default AuditLogModel;
