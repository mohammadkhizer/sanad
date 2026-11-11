import mongoose, { Schema, Document } from 'mongoose';

export interface IScholarCredential {
  type: 'degree' | 'ijazah' | 'certificate' | 'other';
  fileKey: string;
  institution: string;
  year: number;
}

export interface IScholarApplication extends Document {
  userId: mongoose.Types.ObjectId;
  credentials: IScholarCredential[];
  statement: string;
  institution: string;
  specialties: string[];
  languages: string[];
  endorsements: Array<{
    scholarId: mongoose.Types.ObjectId;
    note?: string;
    createdAt: Date;
  }>;
  status: 'pending' | 'more_info' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scholarApplicationSchema = new Schema<IScholarApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    credentials: [
      {
        type: { type: String, required: true },
        fileKey: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
      },
    ],
    statement: { type: String, required: true },
    institution: { type: String, required: true },
    specialties: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    endorsements: [
      {
        scholarId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        note: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'more_info', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

export const ScholarApplicationModel =
  mongoose.models.ScholarApplication ||
  mongoose.model<IScholarApplication>('ScholarApplication', scholarApplicationSchema);

