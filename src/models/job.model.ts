import mongoose, { Document, Schema } from 'mongoose';

export interface Job extends Document {
  title: string;
  description: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  budget: number;
  clientId: mongoose.Types.ObjectId;
  status: 'open' | 'closed' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<Job>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      default: 'Remote',
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: true,
      default: 'full-time',
    },
    budget: {
      type: Number,
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
    },
  },
  { timestamps: true }
);

const JobModel = mongoose.model<Job>('Job', jobSchema);

export default JobModel;
