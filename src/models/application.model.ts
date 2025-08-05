import mongoose, { Schema, Document } from 'mongoose';

export interface Application extends Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  coverLetter?: string;
  appliedAt: Date;
  isMessaged?: boolean;
  messageThreadId?: mongoose.Types.ObjectId;
}

const applicationSchema = new Schema<Application>({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  coverLetter: {
    type: String,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  isMessaged: {
    type: Boolean,
    default: 'false',
  },
  messageThreadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
});

const ApplicationModel = mongoose.model<Application>(
  'Application',
  applicationSchema
);

export default ApplicationModel;
