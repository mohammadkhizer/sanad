import mongoose, { Schema, Document } from 'mongoose';

export interface ICredentialItem {
  type: string;
  fileKey: string;
  institution: string;
  year: number;
}

export interface IEndorsement {
  scholarId: mongoose.Types.ObjectId;
  note?: string;
  createdAt: Date;
}

export interface IScholarApplication extends Document {
  userId: mongoose.Types.ObjectId;
  credentials: ICredentialItem[];
  statement: string;
  institution: string;
  specialties: string[];
  languages: string[];
  endorsements: IEndorsement[];
  status: 'pending' | 'approved' | 'rejected' | 'more_info';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNote?: string;
  reviewedAt?: Date;
  decidedBy?: mongoose.Types.ObjectId;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScholarApplicationSchema = new Schema<IScholarApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    credentials: [
      {
        type: { type: String, required: true },
        fileKey: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
      },
    ],
    statement: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    specialties: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    endorsements: [
      {
        scholarId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        note: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'more_info'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNote: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    decidedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    decidedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ScholarApplication = mongoose.model<IScholarApplication>(
  'ScholarApplication',
  ScholarApplicationSchema
);
