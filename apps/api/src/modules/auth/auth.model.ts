import mongoose, { Schema, Document } from 'mongoose';
import { Role, ROLES } from '@sanad/shared';

export interface IUser extends Document {
  email?: string;
  phone?: string;
  passwordHash: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  roles: Role[];
  scholarProfile?: {
    verified: boolean;
    verifiedAt?: Date;
    institution?: string;
    specialties: string[];
    languages: string[];
  };
  twoFA: {
    enabled: boolean;
    secretEnc?: string;
    backupCodes: string[];
  };
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: { type: String },
    bio: { type: String, default: '' },
    roles: {
      type: [String],
      enum: ROLES,
      default: ['member'],
    },
    scholarProfile: {
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
      institution: { type: String },
      specialties: { type: [String], default: [] },
      languages: { type: [String], default: [] },
    },
    twoFA: {
      enabled: { type: Boolean, default: false },
      secretEnc: { type: String },
      backupCodes: { type: [String], default: [] },
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  lastUsedAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

export const SessionModel = mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByTokenHash?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByTokenHash: { type: String },
  },
  { timestamps: true }
);

export const RefreshTokenModel =
  mongoose.models.RefreshToken || mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

