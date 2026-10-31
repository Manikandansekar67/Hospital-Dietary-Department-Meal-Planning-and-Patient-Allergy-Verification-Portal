import mongoose, { Schema, Document } from 'mongoose';
import { Role, UserStatus } from '../constants/index.js';
import { User } from '../types/models.js';

export interface UserDocument extends Omit<User, 'id'>, Document {
  id: string;
}

const UserSchema = new Schema<UserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), required: true, index: true },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    phone: { type: String, trim: true, sparse: true, default: null },
    age: { type: Number, default: null },
    dateOfBirth: { type: String, default: null }, // ISO date string YYYY-MM-DD
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

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
export default UserModel;
