import mongoose, { Schema, model, Document } from 'mongoose';

export interface IBugReport extends Document {
  fullName: string;
  email: string;
  title: string;
  description: string;
  attachments: string[];
}

const BugReportSchema = new Schema<IBugReport>(
  {
    fullName: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.models.BugReports || model('BugReports', BugReportSchema);
