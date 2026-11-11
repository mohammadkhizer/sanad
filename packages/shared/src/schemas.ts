import { z } from 'zod';
import { ROLES } from './roles.js';

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, 'Username must be 3-30 lowercase alphanumeric characters or underscores')
    .optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number format').optional(),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters long')
    .max(128, 'Password cannot exceed 128 characters'),
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone must be provided',
  path: ['email'],
});

export const checkUsernameQuerySchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters'),
});

export type CheckUsernameQueryInput = z.infer<typeof checkUsernameQuerySchema>;

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  identifier: z.string().min(3),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
  twoFactorCode: z.string().length(6).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(20),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const totpVerifySchema = z.object({
  code: z.string().length(6, 'TOTP code must be 6 digits'),
});

export type TotpVerifyInput = z.infer<typeof totpVerifySchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(3),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(10).max(128),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  specialties: z.array(z.string().max(40)).max(10).optional(),
  languages: z.array(z.string().max(20)).max(5).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const credentialItemSchema = z.object({
  type: z.enum(['degree', 'ijazah', 'certificate', 'other']),
  fileKey: z.string().min(5),
  institution: z.string().min(2).max(100),
  year: z.number().int().min(1900).max(2100),
});

export const submitScholarApplicationSchema = z.object({
  credentials: z.array(credentialItemSchema).min(1, 'At least one credential is required'),
  statement: z.string().min(20, 'Statement must be at least 20 characters').max(2000),
  institution: z.string().min(2).max(100),
  specialties: z.array(z.string().min(2).max(40)).min(1),
  languages: z.array(z.string().min(2).max(20)).min(1),
});

export type SubmitScholarApplicationInput = z.infer<typeof submitScholarApplicationSchema>;

export const reviewScholarApplicationSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'more_info']),
  reviewNote: z.string().max(1000).optional(),
}).refine(
  (data) => (data.decision === 'rejected' ? Boolean(data.reviewNote && data.reviewNote.trim().length > 0) : true),
  { message: 'Review note with reason is required when rejecting an application', path: ['reviewNote'] }
);

export type ReviewScholarApplicationInput = z.infer<typeof reviewScholarApplicationSchema>;

export const createPostSchema = z.object({
  type: z.enum(['reel', 'video', 'text']),
  caption: z.string().max(2200).default(''),
  tags: z.array(z.string().max(30)).max(10).default([]),
  language: z.string().max(10).default('en'),
  visibility: z.enum(['public', 'followers']).default('public'),
  muxAssetId: z.string().optional(),
  playbackId: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  caption: z.string().max(2200).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  visibility: z.enum(['public', 'followers']).optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const addCommentSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  parentId: z.string().optional(),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;

export const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(['all', 'reel', 'video']).optional(),
  scholarId: z.string().optional(),
});

export type FeedQueryInput = z.infer<typeof feedQuerySchema>;

export const createLiveSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().max(500).optional(),
});

export type CreateLiveInput = z.infer<typeof createLiveSchema>;

export const sendChatRequestSchema = z.object({
  scholarId: z.string().min(1),
  message: z.string().trim().min(5).max(1000),
});

export type SendChatRequestInput = z.infer<typeof sendChatRequestSchema>;

export const respondChatRequestSchema = z.object({
  decision: z.enum(['accepted', 'declined']),
});

export type RespondChatRequestInput = z.infer<typeof respondChatRequestSchema>;

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
  type: z.enum(['text', 'image']).default('text'),
  attachmentUrl: z.string().url().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const initiateCallSchema = z.object({
  calleeId: z.string().min(1),
});

export type InitiateCallInput = z.infer<typeof initiateCallSchema>;

export const respondCallSchema = z.object({
  decision: z.enum(['accepted', 'declined']),
});

export type RespondCallInput = z.infer<typeof respondCallSchema>;

export const createReportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user', 'message', 'live']),
  targetId: z.string().min(1),
  reason: z.string().trim().min(5).max(500),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const moderationActionSchema = z.object({
  action: z.enum(['remove_content', 'warn', 'suspend', 'revoke_scholar', 'ban']),
  reason: z.string().trim().min(5).max(500),
  durationDays: z.number().int().min(1).max(365).optional(),
});

export type ModerationActionInput = z.infer<typeof moderationActionSchema>;

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

