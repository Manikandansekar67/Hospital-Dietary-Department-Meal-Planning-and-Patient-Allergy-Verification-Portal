import mongoose, { Schema, Document } from 'mongoose';
import { Feedback } from '../types/models.js';

export interface FeedbackDocument extends Omit<Feedback, 'id'>, Document {
  id: string;
}

const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
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

export const FeedbackModel =
  mongoose.models.Feedback || mongoose.model<FeedbackDocument>('Feedback', FeedbackSchema);
export default FeedbackModel;
