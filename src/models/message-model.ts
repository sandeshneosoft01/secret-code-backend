import { Schema, model, Document, models, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  content: string;
  emailLists?: string[];
  code: string;
  codeHash: string;
  status: 'new' | 'expiry' | 'delete';
  expiresAt?: Date;
  viewCount: number;
  viewedBy: { email: string; viewedAt: Date }[];
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
      default: [],
    },
    code: {
      type: String,
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'expiry', 'delete'],
      default: 'new',
    },
    expiresAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        email: { type: String, required: true },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default models.Messages || model<IMessage>('Messages', MessageSchema);
