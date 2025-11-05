import mongoose, { Types, Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: 'APPLICATION_STATUS' | 'NEW_JOB_OPEN' | 'MESSAGE';
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema({
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// TTL index on createdAt field. '60 * 60 * 24 * 7' is the expiration time in seconds (7 days).
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 }
);

export const NotificationModel = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
