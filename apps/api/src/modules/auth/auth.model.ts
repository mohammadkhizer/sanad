import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'node:crypto';
import { Role, ROLES } from '@sanad/shared';

export interface IUser extends Document {
  publicId?: string;
  isPrivate?: boolean;
  username?: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  displayName: string;
  dateOfBirth?: Date;
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
  resetPasswordToken?: string;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  tokenVersion: number;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  status: 'active' | 'suspended' | 'disabled' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    publicId: { type: String, unique: true, sparse: true, index: true },
    isPrivate: { type: Boolean, default: false },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
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
      country: { type: String, default: 'Saudi Arabia' },
      yearsOfExperience: { type: Number, default: 12 },
      specialties: { type: [String], default: [] },
      languages: { type: [String], default: [] },
    },
    twoFA: {
      enabled: { type: Boolean, default: false },
      secretEnc: { type: String },
      backupCodes: { type: [String], default: [] },
    },
    resetPasswordToken: { type: String, sparse: true },
    resetPasswordCode: { type: String, sparse: true },
    resetPasswordExpires: { type: Date },
    tokenVersion: { type: Number, default: 1 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    status: {
      type: String,
      enum: ['active', 'suspended', 'disabled', 'deleted'],
      default: 'active',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  if (!this.publicId) {
    const hex = crypto.randomBytes(5).toString('hex');
    this.publicId = `snd_${hex}`;
  }
  if (this.username) {
    this.username = this.username.toLowerCase().trim();
  }
  next();
});

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

