import { Schema, model, Document, models, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  content: string;
  emailLists: string[];
  code: string;
  status: 'new' | 'expiry' | 'delete';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    emailLists: {
      type: [String],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'expiry', 'delete'],
      default: 'new',
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default models.Messages || model<IMessage>('Messages', MessageSchema);
