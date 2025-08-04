import mongoose, { Document, Schema } from 'mongoose';

export interface Job extends Document {
  title: string;
  description: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  budget: number;
  skills: string[];
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
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: function (skills: string[]) {
          return skills.length > 0;
        },
        message: 'At least one skill is required',
      },
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

// Add indexes for better query performance
jobSchema.index({ clientId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ skills: 1 });

const JobModel = mongoose.model<Job>('Job', jobSchema);

export default JobModel;
