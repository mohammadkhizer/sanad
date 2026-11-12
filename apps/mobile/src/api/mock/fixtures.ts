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
} from '@sanad/shared';

// Empty collections - no dummy data
export const mockUsers: Record<string, UserEntity> = {};
export const mockPosts: PostEntity[] = [];
export const mockComments: Record<string, CommentEntity[]> = {};
export const mockApplications: ScholarApplicationEntity[] = [];
export const mockConversations: ConversationEntity[] = [];
export const mockMessages: Record<string, MessageEntity[]> = {};
export const mockLiveSessions: LiveSessionEntity[] = [];
export const mockCallSessions: CallSessionEntity[] = [];
export const mockReports: ReportEntity[] = [];
export const mockAuditLogs: AuditLogEntity[] = [];
