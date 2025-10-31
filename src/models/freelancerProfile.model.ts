import mongoose, { Schema, Document } from 'mongoose';

// // Sub-schemas for complex data structures
const PortfolioSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { id: false }
);

const CertificateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    issuer: {
      type: String,
    },
    date: {
      type: Date,
    },
  },
  { id: false }
);
const ExperienceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
  },
  { id: false }
);

export interface IFreelancerProfile extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  description: string;
  qualification: string[];
  skills: string[];
  yearsOfExperience: number;
  hourlyRate: number;
  location: string;
  portfolio: { name: string; description?: string; url: string }[];
  certificates: { name: string; issuer?: string; date?: Date }[];
  experience: {
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
    description?: string;
  }[];
}

// --Main Schema--
const FreelancerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    qualification: {
      type: [String],
      required: true,
      default: [],
    },
    skills: {
      type: [String],
      required: true,
      default: [],
    },
    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String,
      required: true,
    },
    portfolio: [PortfolioSchema],
    certificates: [CertificateSchema],
    experience: [ExperienceSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IFreelancerProfile>(
  'FreelancerProfile',
  FreelancerProfileSchema
);
