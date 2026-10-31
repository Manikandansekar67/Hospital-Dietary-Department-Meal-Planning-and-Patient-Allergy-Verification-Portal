import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from '../constants/index.js';
import { OrderStatusHistory } from '../types/models.js';

export interface OrderStatusHistoryDocument extends Omit<OrderStatusHistory, 'id'>, Document {
  id: string;
}

const OrderStatusHistorySchema = new Schema<OrderStatusHistoryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    changedBy: { type: String, default: null },
    notes: { type: String, trim: true },
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

OrderStatusHistorySchema.index({ orderId: 1, createdAt: 1 });

export const OrderStatusHistoryModel =
  mongoose.models.OrderStatusHistory ||
  mongoose.model<OrderStatusHistoryDocument>('OrderStatusHistory', OrderStatusHistorySchema);
export default OrderStatusHistoryModel;
