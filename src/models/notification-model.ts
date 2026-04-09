import mongoose, { Schema, model, Document } from 'mongoose';

export interface INotificationItem {
  message: string;
  actionType: string;
  actionData: any;
}

export interface INotification extends Document {
  userId?: string;
  email?: string;
  notifications: INotificationItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

/* -------------------- SUB-SCHEMA -------------------- */

const NotificationItemSchema = new Schema<INotificationItem>(
  {
    message: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      required: true,
    },
    actionData: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

/* -------------------- MAIN SCHEMA -------------------- */

const NotificationSchema = new Schema<INotification>(
  {
    userId: String,
    email: {
      type: String,
      required: false,
      index: true,
      sparse: true,
      unique: true,
    },
    notifications: {
      type: [NotificationItemSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.models.Notifications || model('Notifications', NotificationSchema);
