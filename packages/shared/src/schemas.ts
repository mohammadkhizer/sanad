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
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .refine((dob) => {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 13;
    }, 'Must be at least 13 years old to register'),
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

export const adminRegisterSchema = z.object({
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
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .refine((dob) => {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 13;
    }, 'Must be at least 13 years old to register'),
  adminSecret: z.string().min(1, 'Administrator provisioning secret key is required'),
  institution: z.string().optional(),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone must be provided',
  path: ['email'],
});

export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;

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
  token: z.string().min(6),
  newPassword: z.string().min(10).max(128),
  identifier: z.string().optional(),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, 'Username must be 3-30 lowercase alphanumeric characters or underscores')
    .optional(),
  displayName: z.string().trim().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  isPrivate: z.boolean().optional(),
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

export type CredentialItem = z.infer<typeof credentialItemSchema>;

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

// Entity schemas for validation and contract testing
export const scholarProfileSchema = z.object({
  verified: z.boolean(),
  verifiedAt: z.string().optional(),
  institution: z.string().optional(),
  country: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  specialties: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});

export type ScholarProfile = z.infer<typeof scholarProfileSchema>;

export const userEntitySchema = z.object({
  _id: z.string(),
  publicId: z.string().optional(),
  displayName: z.string(),
  username: z.string().optional(),
  isPrivate: z.boolean().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  roles: z.array(z.enum(['guest', 'member', 'scholar', 'moderator', 'admin'])),
  scholarProfile: scholarProfileSchema.optional(),
  twoFA: z.object({ enabled: z.boolean() }).optional(),
  status: z.enum(['active', 'suspended', 'deleted']).default('active'),
  isFollowing: z.boolean().optional(),
  isFollowedBy: z.boolean().optional(),
  relation: z.enum(['none', 'following', 'follow_back', 'mutual']).optional(),
  createdAt: z.string().optional(),
});

export type UserEntity = z.infer<typeof userEntitySchema>;

export const postCountsSchema = z.object({
  likes: z.number().int().default(0),
  comments: z.number().int().default(0),
  views: z.number().int().default(0),
  shares: z.number().int().default(0),
});

export const postEntitySchema = z.object({
  _id: z.string(),
  authorId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      displayName: z.string(),
      avatarUrl: z.string().optional(),
      scholarProfile: scholarProfileSchema.optional(),
    }),
  ]),
  type: z.enum(['reel', 'video', 'text']),
  muxAssetId: z.string().optional(),
  playbackId: z.string().optional(),
  videoUrl: z.string().optional(),
  caption: z.string().default(''),
  tags: z.array(z.string()).default([]),
  language: z.string().default('en'),
  visibility: z.enum(['public', 'followers']).default('public'),
  status: z.enum(['processing', 'live', 'removed']).default('live'),
  counts: postCountsSchema.default({ likes: 0, comments: 0, views: 0, shares: 0 }),
  isLiked: z.boolean().optional(),
  isSaved: z.boolean().optional(),
  createdAt: z.string(),
});

export type PostEntity = z.infer<typeof postEntitySchema>;

export const commentEntitySchema = z.object({
  _id: z.string(),
  postId: z.string(),
  userId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      displayName: z.string(),
      avatarUrl: z.string().optional(),
      roles: z.array(z.string()).optional(),
      scholarProfile: scholarProfileSchema.optional(),
    }),
  ]),
  parentId: z.string().optional(),
  text: z.string(),
  status: z.enum(['active', 'hidden', 'pinned', 'removed']).default('active'),
  createdAt: z.string(),
});

export type CommentEntity = z.infer<typeof commentEntitySchema>;

export const scholarApplicationEntitySchema = z.object({
  _id: z.string(),
  userId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      displayName: z.string(),
      email: z.string().optional(),
      avatarUrl: z.string().optional(),
    }),
  ]),
  credentials: z.array(credentialItemSchema),
  statement: z.string(),
  institution: z.string(),
  specialties: z.array(z.string()),
  languages: z.array(z.string()),
  endorsements: z.array(z.object({ scholarId: z.string(), at: z.string() })).default([]),
  status: z.enum(['pending', 'approved', 'rejected', 'more_info']).default('pending'),
  reviewedBy: z.string().optional(),
  reviewNote: z.string().optional(),
  createdAt: z.string(),
});

export type ScholarApplicationEntity = z.infer<typeof scholarApplicationEntitySchema>;

export const messageEntitySchema = z.object({
  _id: z.string(),
  conversationId: z.string(),
  senderId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      displayName: z.string(),
      avatarUrl: z.string().optional(),
    }),
  ]),
  type: z.enum(['text', 'image']),
  body: z.string(),
  attachmentUrl: z.string().optional(),
  readBy: z.array(z.string()).default([]),
  createdAt: z.string(),
});

export type MessageEntity = z.infer<typeof messageEntitySchema>;

export const conversationEntitySchema = z.object({
  _id: z.string(),
  participants: z.array(
    z.object({
      _id: z.string(),
      displayName: z.string(),
      avatarUrl: z.string().optional(),
      roles: z.array(z.string()).optional(),
      scholarProfile: scholarProfileSchema.optional(),
    })
  ),
  lastMessage: messageEntitySchema.optional(),
  lastMessageAt: z.string().optional(),
  unreadCount: z.number().int().default(0),
  isRequest: z.boolean().default(false),
  requestStatus: z.enum(['pending', 'accepted', 'declined']).optional(),
  createdAt: z.string().optional(),
});

export type ConversationEntity = z.infer<typeof conversationEntitySchema>;

export const liveSessionEntitySchema = z.object({
  _id: z.string(),
  hostId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      displayName: z.string(),
      avatarUrl: z.string().optional(),
      scholarProfile: scholarProfileSchema.optional(),
    }),
  ]),
  roomName: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'live', 'ended']).default('scheduled'),
  viewerCount: z.number().int().default(0),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  scheduledFor: z.string().optional(),
  createdAt: z.string(),
});

export type LiveSessionEntity = z.infer<typeof liveSessionEntitySchema>;

export const callSessionEntitySchema = z.object({
  _id: z.string(),
  callerId: z.string(),
  calleeId: z.string(),
  callerName: z.string().optional(),
  callerAvatar: z.string().optional(),
  roomName: z.string(),
  status: z.enum(['ringing', 'connected', 'ended', 'declined']),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  createdAt: z.string(),
});

export type CallSessionEntity = z.infer<typeof callSessionEntitySchema>;

export const reportEntitySchema = z.object({
  _id: z.string(),
  reporterId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      displayName: z.string(),
    }),
  ]),
  targetType: z.enum(['post', 'comment', 'user', 'message', 'live']),
  targetId: z.string(),
  targetSummary: z.string().optional(),
  priority: z.enum(['P0', 'P1', 'P2']).default('P1'),
  reason: z.string(),
  status: z.enum(['pending', 'reviewed', 'actioned', 'dismissed']).default('pending'),
  handledBy: z.string().optional(),
  actionTaken: z.string().optional(),
  createdAt: z.string(),
});

export type ReportEntity = z.infer<typeof reportEntitySchema>;

export const auditLogEntitySchema = z.object({
  _id: z.string(),
  actorId: z.string(),
  actorName: z.string().optional(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  meta: z.record(z.unknown()).optional(),
  ip: z.string().optional(),
  createdAt: z.string(),
});

export type AuditLogEntity = z.infer<typeof auditLogEntitySchema>;

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().optional(),
    total: z.number().int().optional(),
  });
}


