import {
  ApiClientModules,
  AuthModule,
  UsersModule,
  ContentModule,
  VerificationModule,
  ChatModule,
  LiveModule,
  CallsModule,
  ModerationModule,
  NotificationsModule,
} from '../types';
import {
  mockUsers,
  mockPosts,
  mockComments,
  mockApplications,
  mockConversations,
  mockMessages,
  mockLiveSessions,
  mockReports,
  mockAuditLogs,
} from './fixtures';
import {
  userEntitySchema,
  postEntitySchema,
  commentEntitySchema,
  scholarApplicationEntitySchema,
  conversationEntitySchema,
  messageEntitySchema,
  liveSessionEntitySchema,
  callSessionEntitySchema,
  reportEntitySchema,
  auditLogEntitySchema,
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
import { devSettings } from '../config';

async function simulateLatency(): Promise<void> {
  if (devSettings.forceError) {
    throw new Error('Simulation Error: Forced failure mode is enabled in Dev Settings');
  }
  if (devSettings.latencyMs > 0) {
    await new Promise((res) => setTimeout(res, devSettings.latencyMs));
  }
}

// In-memory clones to allow mutations in mock mode
let postsState: PostEntity[] = [...mockPosts];
let commentsState: Record<string, CommentEntity[]> = { ...mockComments };
let applicationsState: ScholarApplicationEntity[] = [...mockApplications];
let conversationsState: ConversationEntity[] = [...mockConversations];
let messagesState: Record<string, MessageEntity[]> = { ...mockMessages };
let liveSessionsState: LiveSessionEntity[] = [...mockLiveSessions];
let reportsState: ReportEntity[] = [...mockReports];
let auditLogsState: AuditLogEntity[] = [...mockAuditLogs];
let currentUser: UserEntity = { ...mockUsers.admin1 };

const authMock: AuthModule = {
  async register(input) {
    await simulateLatency();
    const newUser: UserEntity = {
      _id: `usr_${Date.now()}`,
      displayName: input.displayName,
      email: input.email,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      roles: ['member'],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    return {
      user: userEntitySchema.parse(newUser),
      requiresOtp: true,
    };
  },

  async adminRegister(input) {
    await simulateLatency();
    const newAdmin: UserEntity = {
      _id: `usr_admin_${Date.now()}`,
      displayName: input.displayName,
      email: input.email,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      roles: ['admin', 'moderator', 'scholar', 'member'],
      scholarProfile: {
        verified: true,
        verifiedAt: new Date().toISOString(),
        institution: input.institution || 'Sanad Academic Foundation',
        specialties: ['Platform Governance', 'Isnad Verification'],
        languages: ['English', 'Arabic'],
      },
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    currentUser = newAdmin;
    return {
      accessToken: 'jwt_admin_' + Date.now(),
      refreshToken: 'refresh_admin_' + Date.now(),
      user: userEntitySchema.parse(newAdmin),
    };
  },

  async verifyOtp(input) {
    await simulateLatency();
    currentUser = {
      _id: `usr_${Date.now()}`,
      displayName: 'Verified Learner',
      email: input.identifier.includes('@') ? input.identifier : undefined,
      phone: !input.identifier.includes('@') ? input.identifier : undefined,
      roles: ['member'],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    return {
      accessToken: 'mock_jwt_access_token_sanad',
      refreshToken: 'mock_jwt_refresh_token_sanad',
      user: userEntitySchema.parse(currentUser),
    };
  },

  async login(input) {
    await simulateLatency();
    if (input.identifier.includes('admin')) {
      currentUser = { ...mockUsers.admin1 };
    } else if (input.identifier.includes('mod')) {
      currentUser = { ...mockUsers.moderator1 };
    } else if (input.identifier.includes('scholar2') || input.identifier.includes('taha')) {
      currentUser = { ...mockUsers.scholar2 };
    } else if (input.identifier.includes('member') || input.identifier.includes('zayd')) {
      currentUser = { ...mockUsers.member1 };
    } else if (input.identifier.includes('scholar1') || input.identifier.includes('omar')) {
      currentUser = { ...mockUsers.scholar1 };
    } else {
      currentUser = { ...mockUsers.admin1 };
    }

    return {
      accessToken: 'mock_jwt_access_token_sanad',
      refreshToken: 'mock_jwt_refresh_token_sanad',
      user: userEntitySchema.parse(currentUser),
      requires2FA: false,
    };
  },

  async refresh(refreshToken) {
    await simulateLatency();
    return { accessToken: `mock_jwt_access_refreshed_${Date.now()}` };
  },

  async logout() {
    await simulateLatency();
    return { success: true };
  },

  async setup2FA() {
    await simulateLatency();
    return {
      secret: 'JBSWY3DPEHPK3PXP',
      qrCodeUri: 'otpauth://totp/Sanad:User?secret=JBSWY3DPEHPK3PXP&issuer=Sanad',
      backupCodes: ['4829-1094', '9102-4820', '3910-5829', '6019-2849'],
    };
  },

  async verify2FA(code) {
    await simulateLatency();
    if (code !== '123456') {
      throw new Error('Invalid TOTP verification code. Use 123456 in mock mode.');
    }
    currentUser.twoFA = { enabled: true };
    return { success: true };
  },

  async forgotPassword(identifier) {
    await simulateLatency();
    return {
      success: true,
      message: 'Reset instructions have been sent to your registered address.',
      code: '123456',
      token: 'mock_reset_token_12345',
    };
  },

  async resetPassword(token, newPass, _identifier) {
    await simulateLatency();
    return { success: true };
  },
};

const usersMock: UsersModule = {
  async getMe() {
    await simulateLatency();
    return userEntitySchema.parse(currentUser);
  },

  async updateProfile(data) {
    await simulateLatency();
    currentUser = { ...currentUser, ...data };
    return userEntitySchema.parse(currentUser);
  },

  async getUser(id) {
    await simulateLatency();
    const found = Object.values(mockUsers).find((u) => u._id === id) || mockUsers.scholar1;
    return userEntitySchema.parse(found);
  },

  async searchUsers(query, role) {
    await simulateLatency();
    let list = Object.values(mockUsers);
    if (role) {
      list = list.filter((u) => u.roles.includes(role as any));
    }
    if (query && query.trim()) {
      const q = query.trim().toLowerCase().replace(/^@/, '');
      list = list.filter((u) => (u.username && u.username.toLowerCase().includes(q)) || u.displayName.toLowerCase().includes(q));
    }
    return list.map((u) => userEntitySchema.parse(u));
  },

  async createUser(input) {
    await simulateLatency();
    const newUser: UserEntity = {
      _id: `usr_${Date.now()}`,
      displayName: input.displayName || 'New User',
      email: input.email,
      phone: input.phone,
      roles: input.roles || ['member'],
      status: 'active',
      createdAt: new Date().toISOString(),
      ...input,
    };
    mockUsers[newUser._id] = newUser;
    return userEntitySchema.parse(newUser);
  },

  async deleteUser(userId) {
    await simulateLatency();
    delete mockUsers[userId];
    return { success: true };
  },

  async getNetwork(userId) {
    await simulateLatency();
    return {
      followers: [userEntitySchema.parse(mockUsers.member1), userEntitySchema.parse(mockUsers.scholar2)],
      following: [userEntitySchema.parse(mockUsers.scholar1), userEntitySchema.parse(mockUsers.scholar2)],
    };
  },

  async follow(userId) {
    await simulateLatency();
    return { following: true };
  },

  async unfollow(userId) {
    await simulateLatency();
    return { following: false };
  },

  async getBlockedUsers() {
    await simulateLatency();
    return [];
  },

  async blockUser(userId) {
    await simulateLatency();
    return { blocked: true };
  },

  async unblockUser(userId) {
    await simulateLatency();
    return { blocked: false };
  },

  async deleteAccount(confirmation) {
    await simulateLatency();
    return { success: true };
  },

  async exportData() {
    await simulateLatency();
    return {
      exportUrl: 'https://sanad.internal/exports/user_archive.zip',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
  },
};

const contentMock: ContentModule = {
  async getFeed(params) {
    await simulateLatency();
    if (devSettings.emptyData) return { items: [] };
    const items = postsState.map((p) => postEntitySchema.parse(p));
    return { items, nextCursor: undefined };
  },

  async getReels(params) {
    await simulateLatency();
    if (devSettings.emptyData) return { items: [] };
    const items = postsState.filter((p) => p.type === 'reel').map((p) => postEntitySchema.parse(p));
    return { items, nextCursor: undefined };
  },

  async getPost(id) {
    await simulateLatency();
    const post = postsState.find((p) => p._id === id) || postsState[0];
    return postEntitySchema.parse(post);
  },

  async createPost(input) {
    await simulateLatency();
    const newPost: PostEntity = {
      _id: `post_${Date.now()}`,
      authorId: {
        _id: currentUser._id,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        scholarProfile: currentUser.scholarProfile,
      },
      type: input.type,
      caption: input.caption,
      tags: input.tags,
      language: input.language,
      visibility: input.visibility,
      status: 'live',
      counts: { likes: 0, comments: 0, views: 0, shares: 0 },
      videoUrl: input.type !== 'text' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : undefined,
      createdAt: new Date().toISOString(),
    };
    postsState.unshift(newPost);
    return postEntitySchema.parse(newPost);
  },

  async updatePost(id, patch) {
    await simulateLatency();
    const index = postsState.findIndex((p) => p._id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    const updated = {
      ...postsState[index],
      ...patch,
    };
    postsState[index] = updated;
    return postEntitySchema.parse(updated);
  },

  async deletePost(id) {
    await simulateLatency();
    postsState = postsState.filter((p) => p._id !== id);
    return { success: true };
  },

  async getComments(postId) {
    await simulateLatency();
    if (devSettings.emptyData) return [];
    const list = commentsState[postId] || mockComments.post_reel_101;
    return list.map((c) => commentEntitySchema.parse(c));
  },

  async addComment(postId, input) {
    await simulateLatency();
    const newComment: CommentEntity = {
      _id: `cmt_${Date.now()}`,
      postId,
      userId: {
        _id: currentUser._id,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        roles: currentUser.roles,
        scholarProfile: currentUser.scholarProfile,
      },
      parentId: input.parentId,
      text: input.text,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    if (!commentsState[postId]) commentsState[postId] = [];
    commentsState[postId].push(newComment);
    return commentEntitySchema.parse(newComment);
  },

  async deleteComment(postId, commentId) {
    await simulateLatency();
    if (commentsState[postId]) {
      commentsState[postId] = commentsState[postId].filter((c) => c._id !== commentId);
    }
    return { success: true };
  },

  async likePost(postId) {
    await simulateLatency();
    const post = postsState.find((p) => p._id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.counts.likes += post.isLiked ? 1 : -1;
      return { liked: post.isLiked, count: post.counts.likes };
    }
    return { liked: true, count: 1 };
  },

  async savePost(postId) {
    await simulateLatency();
    const post = postsState.find((p) => p._id === postId);
    if (post) {
      post.isSaved = !post.isSaved;
      return { saved: post.isSaved };
    }
    return { saved: true };
  },

  async pinComment(postId, commentId) {
    await simulateLatency();
    const list = commentsState[postId];
    if (list) {
      const target = list.find((c) => c._id === commentId);
      if (target) target.status = 'pinned';
    }
    return { success: true };
  },

  async hideComment(postId, commentId) {
    await simulateLatency();
    const list = commentsState[postId];
    if (list) {
      const target = list.find((c) => c._id === commentId);
      if (target) target.status = 'hidden';
    }
    return { success: true };
  },
};

const verificationMock: VerificationModule = {
  async submitApplication(input) {
    await simulateLatency();
    const newApp: ScholarApplicationEntity = {
      _id: `app_${Date.now()}`,
      userId: {
        _id: currentUser._id,
        displayName: currentUser.displayName,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
      },
      institution: input.institution,
      specialties: input.specialties,
      languages: input.languages,
      credentials: input.credentials,
      statement: input.statement,
      endorsements: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    applicationsState.unshift(newApp);
    return scholarApplicationEntitySchema.parse(newApp);
  },

  async getMyApplication() {
    await simulateLatency();
    const app = applicationsState.find((a) => {
      const uid = typeof a.userId === 'string' ? a.userId : a.userId._id;
      return uid === currentUser._id;
    }) || applicationsState[0];
    return app ? scholarApplicationEntitySchema.parse(app) : null;
  },

  async getApplications(status) {
    await simulateLatency();
    let res = applicationsState;
    if (status && status !== 'all') {
      res = res.filter((a) => a.status === status);
    }
    return res.map((a) => scholarApplicationEntitySchema.parse(a));
  },

  async getApplication(id) {
    await simulateLatency();
    const found = applicationsState.find((a) => a._id === id) || applicationsState[0];
    return scholarApplicationEntitySchema.parse(found);
  },

  async reviewApplication(id, input) {
    await simulateLatency();
    const app = applicationsState.find((a) => a._id === id);
    if (!app) throw new Error('Application not found');
    app.status = input.decision;
    app.reviewNote = input.reviewNote;
    app.reviewedBy = currentUser._id;
    return scholarApplicationEntitySchema.parse(app);
  },

  async endorseApplication(id) {
    await simulateLatency();
    const app = applicationsState.find((a) => a._id === id);
    if (app) {
      app.endorsements.push({ scholarId: currentUser._id, at: new Date().toISOString() });
    }
    return { success: true };
  },
};

const chatMock: ChatModule = {
  async getConversations(filter) {
    await simulateLatency();
    if (devSettings.emptyData) return [];
    let list = conversationsState;
    if (filter === 'requests') {
      list = list.filter((c) => c.isRequest);
    }
    return list.map((c) => conversationEntitySchema.parse(c));
  },

  async getMessages(conversationId) {
    await simulateLatency();
    if (devSettings.emptyData) return [];
    const list = messagesState[conversationId] || [];
    return list.map((m) => messageEntitySchema.parse(m));
  },

  async sendMessage(input) {
    await simulateLatency();
    const newMsg: MessageEntity = {
      _id: `msg_${Date.now()}`,
      conversationId: input.conversationId,
      senderId: {
        _id: currentUser._id,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
      },
      type: input.type,
      body: input.body,
      attachmentUrl: input.attachmentUrl,
      readBy: [currentUser._id],
      createdAt: new Date().toISOString(),
    };
    if (!messagesState[input.conversationId]) messagesState[input.conversationId] = [];
    messagesState[input.conversationId].push(newMsg);
    return messageEntitySchema.parse(newMsg);
  },

  async sendChatRequest(input) {
    await simulateLatency();
    const newConv: ConversationEntity = {
      _id: `conv_${Date.now()}`,
      participants: [
        {
          _id: currentUser._id,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl,
          roles: currentUser.roles,
        },
        {
          _id: input.scholarId,
          displayName: 'Scholar Teacher',
          roles: ['scholar'],
        },
      ],
      isRequest: true,
      requestStatus: 'pending',
      lastMessage: {
        _id: `msg_${Date.now()}`,
        conversationId: `conv_${Date.now()}`,
        senderId: currentUser._id,
        type: 'text',
        body: input.message,
        readBy: [currentUser._id],
        createdAt: new Date().toISOString(),
      },
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };
    conversationsState.unshift(newConv);
    return { success: true, conversationId: newConv._id };
  },

  async respondChatRequest(requestId, decision) {
    await simulateLatency();
    const conv = conversationsState.find((c) => c._id === requestId);
    if (conv) {
      conv.requestStatus = decision;
      if (decision === 'accepted') {
        conv.isRequest = false;
      }
    }
    return { success: true };
  },
};

const liveMock: LiveModule = {
  async getLiveSessions() {
    await simulateLatency();
    if (devSettings.emptyData) return [];
    return liveSessionsState.map((l) => liveSessionEntitySchema.parse(l));
  },

  async getLiveSession(id) {
    await simulateLatency();
    const session = liveSessionsState.find((l) => l._id === id) || liveSessionsState[0];
    return liveSessionEntitySchema.parse(session);
  },

  async createLiveSession(input) {
    await simulateLatency();
    const newLive: LiveSessionEntity = {
      _id: `live_${Date.now()}`,
      hostId: {
        _id: currentUser._id,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        scholarProfile: currentUser.scholarProfile,
      },
      roomName: `sanad-live-${Date.now()}`,
      title: input.title,
      description: input.description,
      status: 'live',
      viewerCount: 1,
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    liveSessionsState.unshift(newLive);
    return liveSessionEntitySchema.parse(newLive);
  },

  async endLiveSession(id) {
    await simulateLatency();
    const s = liveSessionsState.find((l) => l._id === id);
    if (s) {
      s.status = 'ended';
      s.endedAt = new Date().toISOString();
    }
    return { success: true };
  },

  async deleteLiveSession(id) {
    await simulateLatency();
    liveSessionsState = liveSessionsState.filter((l) => l._id !== id);
    return { success: true };
  },

  async getViewerToken(id) {
    await simulateLatency();
    return { token: 'mock_livekit_viewer_jwt_token', roomName: 'sanad-live-room' };
  },
};

const callsMock: CallsModule = {
  async initiateCall(calleeId) {
    await simulateLatency();
    const session: CallSessionEntity = {
      _id: `call_${Date.now()}`,
      callerId: currentUser._id,
      calleeId,
      callerName: currentUser.displayName,
      callerAvatar: currentUser.avatarUrl,
      roomName: `sanad-call-${Date.now()}`,
      status: 'ringing',
      createdAt: new Date().toISOString(),
    };
    return callSessionEntitySchema.parse(session);
  },

  async getCallSession(id) {
    await simulateLatency();
    const session: CallSessionEntity = {
      _id: id,
      callerId: mockUsers.scholar1._id,
      calleeId: currentUser._id,
      callerName: mockUsers.scholar1.displayName,
      callerAvatar: mockUsers.scholar1.avatarUrl,
      roomName: `sanad-call-room-${id}`,
      status: 'connected',
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    return callSessionEntitySchema.parse(session);
  },

  async respondCall(id, decision) {
    await simulateLatency();
    const session: CallSessionEntity = {
      _id: id,
      callerId: mockUsers.scholar1._id,
      calleeId: currentUser._id,
      callerName: mockUsers.scholar1.displayName,
      callerAvatar: mockUsers.scholar1.avatarUrl,
      roomName: `sanad-call-room-${id}`,
      status: decision === 'accepted' ? 'connected' : 'declined',
      startedAt: decision === 'accepted' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };
    return callSessionEntitySchema.parse(session);
  },

  async endCall(id) {
    await simulateLatency();
    return { success: true };
  },
};

const moderationMock: ModerationModule = {
  async createReport(input) {
    await simulateLatency();
    const newReport: ReportEntity = {
      _id: `rep_${Date.now()}`,
      reporterId: {
        _id: currentUser._id,
        displayName: currentUser.displayName,
      },
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      priority: 'P1',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    reportsState.unshift(newReport);
    return reportEntitySchema.parse(newReport);
  },

  async getReports(params) {
    await simulateLatency();
    let list = reportsState;
    if (params?.status && params.status !== 'all') {
      list = list.filter((r) => r.status === params.status);
    }
    if (params?.priority && params.priority !== 'all') {
      list = list.filter((r) => r.priority === params.priority);
    }
    return list.map((r) => reportEntitySchema.parse(r));
  },

  async getReport(id) {
    await simulateLatency();
    const rep = reportsState.find((r) => r._id === id) || reportsState[0];
    return reportEntitySchema.parse(rep);
  },

  async takeAction(reportId, action) {
    await simulateLatency();
    const rep = reportsState.find((r) => r._id === reportId);
    if (rep) {
      rep.status = 'actioned';
      rep.actionTaken = `${action.action}: ${action.reason}`;
      rep.handledBy = currentUser._id;
    }
    auditLogsState.unshift({
      _id: `aud_${Date.now()}`,
      actorId: currentUser._id,
      actorName: currentUser.displayName,
      action: `moderation:${action.action}`,
      targetType: 'report',
      targetId: reportId,
      meta: { reason: action.reason, durationDays: action.durationDays },
      ip: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  },

  async deleteReport(reportId) {
    await simulateLatency();
    reportsState = reportsState.filter((r) => r._id !== reportId);
    return { success: true };
  },

  async getAuditLogs() {
    await simulateLatency();
    return auditLogsState.map((l) => auditLogEntitySchema.parse(l));
  },

  async getUsers(query) {
    await simulateLatency();
    let all = Object.values(mockUsers);
    if (query) {
      const q = query.toLowerCase();
      all = all.filter((u) => u.displayName.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q)));
    }
    return all.map((u) => userEntitySchema.parse(u));
  },

  async updateUserRole(userId, roles) {
    await simulateLatency();
    const user = Object.values(mockUsers).find((u) => u._id === userId) || currentUser;
    user.roles = roles;
    auditLogsState.unshift({
      _id: `aud_${Date.now()}`,
      actorId: currentUser._id,
      actorName: currentUser.displayName,
      action: 'role:assign',
      targetType: 'user',
      targetId: userId,
      meta: { newRoles: roles },
      ip: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });
    return userEntitySchema.parse(user);
  },

  async revokeScholar(userId, reason) {
    await simulateLatency();
    const user = Object.values(mockUsers).find((u) => u._id === userId) || currentUser;
    user.roles = user.roles.filter((r) => r !== 'scholar');
    if (user.scholarProfile) {
      user.scholarProfile.verified = false;
    }
    auditLogsState.unshift({
      _id: `aud_${Date.now()}`,
      actorId: currentUser._id,
      actorName: currentUser.displayName,
      action: 'role:revoke_scholar',
      targetType: 'user',
      targetId: userId,
      meta: { reason },
      ip: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  },
};

const notificationsMock: NotificationsModule = {
  async getNotifications() {
    await simulateLatency();
    return [];
  },

  async getUnreadCount() {
    await simulateLatency();
    return { unreadCount: 0 };
  },

  async markAsRead(id: string) {
    await simulateLatency();
    return { success: true };
  },

  async markAllAsRead() {
    await simulateLatency();
    return { success: true };
  },

  async getPreferences() {
    await simulateLatency();
    return {
      quietHoursEnabled: true,
      prayerQuietHours: true,
      pushEnabled: true,
    };
  },

  async updatePreferences(prefs) {
    await simulateLatency();
    return { success: true };
  },
};

export function setMockUser(role: 'guest' | 'member' | 'scholar' | 'moderator' | 'admin') {
  if (role === 'guest') {
    currentUser = {
      _id: 'usr_guest_0',
      displayName: 'Guest Visitor',
      roles: ['guest'],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
  } else if (role === 'member') {
    currentUser = { ...mockUsers.member1 };
  } else if (role === 'scholar') {
    currentUser = { ...mockUsers.scholar1 };
  } else if (role === 'moderator') {
    currentUser = { ...mockUsers.moderator1 };
  } else if (role === 'admin') {
    currentUser = { ...mockUsers.admin1 };
  }
}

export const mockAdapter: ApiClientModules = {
  auth: authMock,
  users: usersMock,
  content: contentMock,
  verification: verificationMock,
  chat: chatMock,
  live: liveMock,
  calls: callsMock,
  moderation: moderationMock,
  notifications: notificationsMock,
};

