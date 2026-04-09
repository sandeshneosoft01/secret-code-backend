import { Schema, model, Document, models } from 'mongoose';

export interface IUser extends Document {
  firebaseUID?: string | null;
  fullName?: string;
  email: string;
  password?: string | null;
  photoURL?: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUID: {
      type: String,
      unique: true,
      sparse: true,
    },
    fullName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: null,
    },
    photoURL: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true },
);

export default models.Users || model<IUser>('Users', UserSchema);
