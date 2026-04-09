import { Schema, model, Document, models } from 'mongoose';

export interface IUser {
  firstName: string;
  lastName: string;
  email?: string;
  userId?: string;
  active: boolean;
  status: 'invited' | 'active' | 'suspended';
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: Date | null;
  lastLogin: Date | null;
  password?: string;
  ref: 'Users';
}

export interface IAdminUser extends Document {
  adminId: string;
  users: IUser[];
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, default: null },
    userId: { type: Schema.Types.ObjectId, default: null, ref: 'Users' },
    active: { type: Boolean, required: true, default: true },
    status: {
      type: String,
      enum: ['invited', 'active', 'suspended'],
      default: 'invited',
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      required: true,
      default: 'viewer',
    },
    joinedAt: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const AdminUser = new Schema<IAdminUser>(
  {
    adminId: {
      type: String,
      required: true,
      unique: true,
    },
    users: [UserSchema],
  },
  { timestamps: true },
);

export default models.AdminUser || model<IAdminUser>('AdminUser', AdminUser);
