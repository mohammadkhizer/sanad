import mongoose, { Schema, Document } from 'mongoose';
import { Role, UserStatus } from '@sanad/types';

export interface IUser extends Document {
  email: string;
  phone?: string;
  passwordHash: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  roles: Role[];
  scholarProfile: {
    verified: boolean;
    verifiedAt?: Date;
    institution?: string;
    specialties: string[];
    languages: string[];
  };
  twoFA: {
    enabled: boolean;
    secretEnc?: string;
  };
  status: UserStatus;
  tokenVersion: number;
  suspension?: {
    reason?: string;
    until?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      sparse: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    roles: {
      type: [String],
      enum: ['guest', 'member', 'scholar', 'moderator', 'admin'],
      default: ['member'],
      index: true,
    },
    scholarProfile: {
      verified: { type: Boolean, default: false, index: true },
      verifiedAt: { type: Date },
      institution: { type: String },
      specialties: { type: [String], default: [] },
      languages: { type: [String], default: [] },
    },
    twoFA: {
      enabled: { type: Boolean, default: false },
      secretEnc: { type: String },
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
      index: true,
    },
    tokenVersion: {
      type: Number,
      default: 1,
    },
    suspension: {
      reason: { type: String },
      until: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        if (ret.twoFA) {
          delete ret.twoFA.secretEnc;
        }
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
