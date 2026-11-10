import { z } from 'zod';

export { z };
export type { ZodSchema, ZodError } from 'zod';

// Roles and Status
export const RoleEnum = z.enum(['guest', 'member', 'scholar', 'moderator', 'admin']);
export type Role = z.infer<typeof RoleEnum>;

export const UserStatusEnum = z.enum(['active', 'suspended', 'deleted']);
export type UserStatus = z.infer<typeof UserStatusEnum>;

// User Profile Schemas
export const ScholarProfileSchema = z.object({
  verified: z.boolean().default(false),
  verifiedAt: z.coerce.date().optional(),
  institution: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});
export type ScholarProfile = z.infer<typeof ScholarProfileSchema>;

export const TwoFactorAuthSchema = z.object({
  enabled: z.boolean().default(false),
  secretEnc: z.string().optional(),
});
export type TwoFactorAuth = z.infer<typeof TwoFactorAuthSchema>;

export const UsernameRegex = /^[a-z0-9_]{3,30}$/;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().regex(UsernameRegex, 'Username must be 3-30 lowercase alphanumeric characters or underscores').optional(),
  phone: z.string().optional(),
  displayName: z.string().min(2).max(100),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  roles: z.array(RoleEnum).default(['member']),
  scholarProfile: ScholarProfileSchema.default({
    verified: false,
    specialties: [],
    languages: [],
  }),
  twoFA: TwoFactorAuthSchema.default({ enabled: false }),
  status: UserStatusEnum.default('active'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

// Auth Request Schemas
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().regex(UsernameRegex, 'Username must be 3-30 lowercase alphanumeric characters or underscores').optional(),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters long')
    .max(128),
  displayName: z.string().min(2).max(100),
  phone: z.string().optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const CheckUsernameQuerySchema = z.object({
  username: z.string().min(3).max(30),
});
export type CheckUsernameQuery = z.infer<typeof CheckUsernameQuerySchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  twoFactorCode: z.string().length(6).optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const VerifyOtpRequestSchema = z.object({
  target: z.string().min(3),
  code: z.string().min(4).max(8),
  type: z.enum(['register', 'login', 'reset']).default('register'),
});
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
  deviceId: z.string().optional(),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const TwoFactorVerifySchema = z.object({
  code: z.string().length(6),
});
export type TwoFactorVerifyRequest = z.infer<typeof TwoFactorVerifySchema>;

export const UpdateUserSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
});
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

// Scholar Verification Schemas
export const CredentialItemSchema = z.object({
  type: z.string().min(2),
  fileKey: z.string().min(1),
  institution: z.string().min(2),
  year: z.number().int().min(1900).max(2100),
});
export type CredentialItem = z.infer<typeof CredentialItemSchema>;

export const SubmitScholarApplicationSchema = z.object({
  credentials: z.array(CredentialItemSchema).min(1, 'At least one credential is required'),
  statement: z.string().min(20).max(2000),
  institution: z.string().min(2),
  specialties: z.array(z.string()).min(1),
  languages: z.array(z.string()).min(1),
});
export type SubmitScholarApplicationRequest = z.infer<typeof SubmitScholarApplicationSchema>;

export const ApplicationDecisionSchema = z.object({
  status: z.enum(['approved', 'rejected', 'more_info']),
  reviewNote: z.string().max(1000).optional(),
});
export type ApplicationDecisionRequest = z.infer<typeof ApplicationDecisionSchema>;

export const EndorseApplicationSchema = z.object({
  note: z.string().max(500).optional(),
});
export type EndorseApplicationRequest = z.infer<typeof EndorseApplicationSchema>;

export const RevokeScholarSchema = z.object({
  reason: z.string().min(5).max(1000),
});
export type RevokeScholarRequest = z.infer<typeof RevokeScholarSchema>;

// Content Schemas
export const PostTypeEnum = z.enum(['reel', 'video']);
export type PostType = z.infer<typeof PostTypeEnum>;

export const PostStatusEnum = z.enum(['processing', 'live', 'removed']);
export type PostStatus = z.infer<typeof PostStatusEnum>;

export const CreatePostSchema = z.object({
  type: PostTypeEnum,
  caption: z.string().max(2000).default(''),
  muxAssetId: z.string().optional(),
  playbackId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  language: z.string().default('en'),
  visibility: z.enum(['public', 'followers', 'unlisted']).default('public'),
});
export type CreatePostRequest = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = z.object({
  caption: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
  visibility: z.enum(['public', 'followers', 'unlisted']).optional(),
});
export type UpdatePostRequest = z.infer<typeof UpdatePostSchema>;

export const FeedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  authorId: z.string().optional(),
  type: PostTypeEnum.optional(),
  tag: z.string().optional(),
});
export type FeedQuery = z.infer<typeof FeedQuerySchema>;

export const CreateCommentSchema = z.object({
  text: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});
export type CreateCommentRequest = z.infer<typeof CreateCommentSchema>;

// Live Streaming Schemas
export const LiveSessionStatusEnum = z.enum(['scheduled', 'live', 'ended']);
export type LiveSessionStatus = z.infer<typeof LiveSessionStatusEnum>;

export const CreateLiveSessionSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
});
export type CreateLiveSessionRequest = z.infer<typeof CreateLiveSessionSchema>;

// Messaging and Calls Schemas
export const ChatRequestStatusEnum = z.enum(['pending', 'accepted', 'declined']);
export type ChatRequestStatus = z.infer<typeof ChatRequestStatusEnum>;

export const CreateChatRequestSchema = z.object({
  toId: z.string().min(1),
  message: z.string().min(1).max(500),
});
export type CreateChatRequest = z.infer<typeof CreateChatRequestSchema>;

export const RespondChatRequestSchema = z.object({
  status: z.enum(['accepted', 'declined']),
});
export type RespondChatRequest = z.infer<typeof RespondChatRequestSchema>;

export const MessageTypeEnum = z.enum(['text', 'image', 'audio']);
export type MessageType = z.infer<typeof MessageTypeEnum>;

export const SendMessageSchema = z.object({
  body: z.string().min(1).max(2000),
  type: MessageTypeEnum.default('text'),
});
export type SendMessageRequest = z.infer<typeof SendMessageSchema>;

export const CreateCallSessionSchema = z.object({
  calleeId: z.string().min(1),
});
export type CreateCallSessionRequest = z.infer<typeof CreateCallSessionSchema>;

export const RespondCallSessionSchema = z.object({
  action: z.enum(['accept', 'reject', 'end']),
});
export type RespondCallSessionRequest = z.infer<typeof RespondCallSessionSchema>;

// Moderation Schemas
export const ReportTargetTypeEnum = z.enum(['post', 'comment', 'user', 'live']);
export type ReportTargetType = z.infer<typeof ReportTargetTypeEnum>;

export const ReportReasonEnum = z.enum([
  'misinformation',
  'hate_speech',
  'impersonation',
  'harassment',
  'sectarian_conflict',
  'other',
]);
export type ReportReason = z.infer<typeof ReportReasonEnum>;

export const CreateReportSchema = z.object({
  targetType: ReportTargetTypeEnum,
  targetId: z.string().min(1),
  reason: ReportReasonEnum,
  details: z.string().max(1000).optional(),
});
export type CreateReportRequest = z.infer<typeof CreateReportSchema>;

export const ReportActionSchema = z.object({
  action: z.enum(['resolve', 'dismiss']),
  resolutionNote: z.string().max(1000).optional(),
  suspendUser: z.boolean().default(false),
  removeContent: z.boolean().default(false),
});
export type ReportActionRequest = z.infer<typeof ReportActionSchema>;

export const SuspendUserSchema = z.object({
  reason: z.string().min(5).max(1000),
  durationDays: z.number().int().min(1).max(365).optional(),
});
export type SuspendUserRequest = z.infer<typeof SuspendUserSchema>;

// Standard API Response / Error Schemas
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    cursor?: string;
    hasMore?: boolean;
    total?: number;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
