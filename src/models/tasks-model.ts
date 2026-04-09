import { Schema, model, Document, models, ObjectId } from 'mongoose';

export interface ITaskItem {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignTo?: ObjectId;
}

export interface ITaskSchema extends Document {
  userId: ObjectId;
  tasks: ITaskItem[];
}

const TaskItemSchema = new Schema<ITaskItem>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      required: true,
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
      default: 'low',
    },
    assignTo: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: 'AdminUser',
      required: false,
    },
  },
  { timestamps: true },
);

const TasksSchema = new Schema<ITaskSchema>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    tasks: [TaskItemSchema],
  },
  { timestamps: true },
);

export default models.Tasks || model<ITaskSchema>('Tasks', TasksSchema);
