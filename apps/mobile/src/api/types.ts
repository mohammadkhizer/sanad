import {
  UserEntity,
  PostEntity,
  CommentEntity,
  ScholarApplicationEntity,
  ConversationEntity,
  MessageEntity,
  LiveSessionEntity,
  CallSessionEntity,
  ReportEntity,
  AuditLogEntity,
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  SubmitScholarApplicationInput,
  ReviewScholarApplicationInput,
  CreatePostInput,
  AddCommentInput,
  CreateLiveInput,
  SendChatRequestInput,
  SendMessageInput,
  CreateReportInput,
  ModerationActionInput,
  AdminRegisterInput,
  Role,
} from '@sanad/shared';

export interface AuthModule {
  register(input: RegisterInput): Promise<{ user: UserEntity; requiresOtp: boolean }>;
  adminRegister(input: AdminRegisterInput): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }>;
  verifyOtp(input: VerifyOtpInput): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }>;
  login(input: LoginInput): Promise<{ accessToken: string; refreshToken: string; user: UserEntity; requires2FA?: boolean }>;
  refresh(refreshToken: string): Promise<{ accessToken: string }>;
  logout(): Promise<{ success: boolean }>;
  setup2FA(): Promise<{ secret: string; qrCodeUri: string; backupCodes: string[] }>;
  verify2FA(code: string): Promise<{ success: boolean }>;
  forgotPassword(identifier: string): Promise<{ success: boolean; message: string }>;
  resetPassword(token: string, newPass: string, identifier?: string): Promise<{ success: boolean; message?: string }>;
}

export interface UsersModule {
  getMe(): Promise<UserEntity>;
  updateProfile(data: Partial<UserEntity>): Promise<UserEntity>;
  getUser(id: string): Promise<UserEntity>;
  createUser(input: Partial<UserEntity>): Promise<UserEntity>;
  deleteUser(userId: string): Promise<{ success: boolean }>;
  getNetwork(userId: string): Promise<{ followers: UserEntity[]; following: UserEntity[] }>;
  follow(userId: string): Promise<{ following: boolean }>;
  unfollow(userId: string): Promise<{ following: boolean }>;
  getBlockedUsers(): Promise<UserEntity[]>;
  blockUser(userId: string): Promise<{ blocked: boolean }>;
  unblockUser(userId: string): Promise<{ blocked: boolean }>;
  deleteAccount(confirmation: string): Promise<{ success: boolean }>;
  exportData(): Promise<{ exportUrl: string; expiresAt: string }>;
}

export interface ContentModule {
  getFeed(params?: { cursor?: string; limit?: number; tab?: 'following' | 'discover' }): Promise<{ items: PostEntity[]; nextCursor?: string }>;
  getReels(params?: { cursor?: string; limit?: number }): Promise<{ items: PostEntity[]; nextCursor?: string }>;
  getPost(id: string): Promise<PostEntity>;
  createPost(input: CreatePostInput): Promise<PostEntity>;
  updatePost(id: string, patch: Partial<CreatePostInput>): Promise<PostEntity>;
  deletePost(id: string): Promise<{ success: boolean }>;
  getComments(postId: string): Promise<CommentEntity[]>;
  addComment(postId: string, input: AddCommentInput): Promise<CommentEntity>;
  deleteComment(postId: string, commentId: string): Promise<{ success: boolean }>;
  likePost(postId: string): Promise<{ liked: boolean; count: number }>;
  savePost(postId: string): Promise<{ saved: boolean }>;
  pinComment(postId: string, commentId: string): Promise<{ success: boolean }>;
  hideComment(postId: string, commentId: string): Promise<{ success: boolean }>;
}

export interface VerificationModule {
  submitApplication(input: SubmitScholarApplicationInput): Promise<ScholarApplicationEntity>;
  getMyApplication(): Promise<ScholarApplicationEntity | null>;
  getApplications(status?: string): Promise<ScholarApplicationEntity[]>;
  getApplication(id: string): Promise<ScholarApplicationEntity>;
  reviewApplication(id: string, input: ReviewScholarApplicationInput): Promise<ScholarApplicationEntity>;
  endorseApplication(id: string): Promise<{ success: boolean }>;
}

export interface ChatModule {
  getConversations(filter?: 'all' | 'requests'): Promise<ConversationEntity[]>;
  getMessages(conversationId: string): Promise<MessageEntity[]>;
  sendMessage(input: SendMessageInput): Promise<MessageEntity>;
  sendChatRequest(input: SendChatRequestInput): Promise<{ success: boolean; conversationId?: string }>;
  respondChatRequest(requestId: string, decision: 'accepted' | 'declined'): Promise<{ success: boolean }>;
}

export interface LiveModule {
  getLiveSessions(): Promise<LiveSessionEntity[]>;
  getLiveSession(id: string): Promise<LiveSessionEntity>;
  createLiveSession(input: CreateLiveInput): Promise<LiveSessionEntity>;
  endLiveSession(id: string): Promise<{ success: boolean }>;
  deleteLiveSession(id: string): Promise<{ success: boolean }>;
  getViewerToken(id: string): Promise<{ token: string; roomName: string }>;
}

export interface CallsModule {
  initiateCall(calleeId: string): Promise<CallSessionEntity>;
  getCallSession(id: string): Promise<CallSessionEntity>;
  respondCall(id: string, decision: 'accepted' | 'declined'): Promise<CallSessionEntity>;
  endCall(id: string): Promise<{ success: boolean }>;
}

export interface ModerationModule {
  createReport(input: CreateReportInput): Promise<ReportEntity>;
  getReports(params?: { status?: string; priority?: string }): Promise<ReportEntity[]>;
  getReport(id: string): Promise<ReportEntity>;
  takeAction(reportId: string, action: ModerationActionInput): Promise<{ success: boolean }>;
  deleteReport(reportId: string): Promise<{ success: boolean }>;
  getAuditLogs(): Promise<AuditLogEntity[]>;
  getUsers(query?: string): Promise<UserEntity[]>;
  updateUserRole(userId: string, roles: Role[]): Promise<UserEntity>;
  revokeScholar(userId: string, reason: string): Promise<{ success: boolean }>;
}

export interface NotificationsModule {
  getPreferences(): Promise<{ quietHoursEnabled: boolean; prayerQuietHours: boolean; pushEnabled: boolean }>;
  updatePreferences(prefs: { quietHoursEnabled?: boolean; prayerQuietHours?: boolean; pushEnabled?: boolean }): Promise<{ success: boolean }>;
}

export interface ApiClientModules {
  auth: AuthModule;
  users: UsersModule;
  content: ContentModule;
  verification: VerificationModule;
  chat: ChatModule;
  live: LiveModule;
  calls: CallsModule;
  moderation: ModerationModule;
  notifications: NotificationsModule;
}

