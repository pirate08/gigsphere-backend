import mongoose, { Document, Types } from 'mongoose';

// Base interface without Document
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'freelancer' | 'client';
}

// Document type for Mongoose operations
export interface UserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['freelancer', 'client'],
      default: 'freelancer',
      required: true,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;