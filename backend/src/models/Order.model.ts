import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from '../constants/index.js';
import { Order } from '../types/models.js';

export interface OrderDocument extends Omit<Order, 'id'>, Document {
  id: string;
}

const OrderSchema = new Schema<OrderDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    foodId: { type: String, required: true, index: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING, index: true },
    specialInstructions: { type: String, trim: true },
    preparationWarnings: { type: [String], default: [] },
    crossContactWarnings: { type: [String], default: [] },
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

OrderSchema.index({ createdAt: -1 });

export const OrderModel = mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);
export default OrderModel;
