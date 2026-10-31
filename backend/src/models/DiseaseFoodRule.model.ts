import mongoose, { Schema, Document } from 'mongoose';
import { RuleType } from '../constants/index.js';
import { DiseaseFoodRule } from '../types/models.js';

export interface DiseaseFoodRuleDocument extends Omit<DiseaseFoodRule, 'id'>, Document {
  id: string;
}

const DiseaseFoodRuleSchema = new Schema<DiseaseFoodRuleDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    diseaseId: { type: String, required: true, index: true },
    foodId: { type: String, required: true, index: true },
    ruleType: { type: String, enum: Object.values(RuleType), required: true, index: true },
    reason: { type: String, trim: true },
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

DiseaseFoodRuleSchema.index({ diseaseId: 1, foodId: 1 }, { unique: true });

export const DiseaseFoodRuleModel =
  mongoose.models.DiseaseFoodRule ||
  mongoose.model<DiseaseFoodRuleDocument>('DiseaseFoodRule', DiseaseFoodRuleSchema);
export default DiseaseFoodRuleModel;
