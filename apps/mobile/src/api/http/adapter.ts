import { ApiClientModules } from '../types';
import { apiClient } from '../client';
import { PostEntity } from '@sanad/shared';

export const httpAdapter: ApiClientModules = {
  auth: {
    register: (input) => apiClient('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
    adminRegister: (input) => apiClient('/auth/admin-register', { method: 'POST', body: JSON.stringify(input) }),
    verifyOtp: (input) => apiClient('/auth/verify-otp', { method: 'POST', body: JSON.stringify(input) }),
    login: (input) => apiClient('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    refresh: (refreshToken) => apiClient('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
    logout: () => apiClient('/auth/logout', { method: 'POST' }),
    setup2FA: () => apiClient('/auth/2fa/setup', { method: 'POST' }),
    verify2FA: (code) => apiClient('/auth/2fa/verify', { method: 'POST', body: JSON.stringify({ code }) }),
    forgotPassword: (identifier) => apiClient('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ identifier }) }),
    resetPassword: (token, newPass, identifier) => apiClient('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword: newPass, identifier }) }),
  },

  users: {
    getMe: async () => {
      const data = await apiClient<any>('/users/me');
      const user = data.user || data;
      const counts = data.counts || user.counts || { followers: 0, following: 0, lessons: 0 };
      return { ...user, user, counts };
    },
    updateProfile: async (data) => {
      const res = await apiClient<any>('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
      return res.user || res;
    },
    getUser: async (id) => {
      const data = await apiClient<any>(`/users/${id}`);
      const user = data.user || data;
      const counts = data.counts || user.counts || { followers: 0, following: 0, lessons: 0 };
      return {
        ...user,
        user,
        counts,
        isFollowing: data.isFollowing,
        isFollowedBy: data.isFollowedBy,
        relation: data.relation,
      };
    },
    searchUsers: async (query, role) => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (role) params.append('role', role);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await apiClient<any>(`/users${qs}`);
      return Array.isArray(data) ? data : data.users || [];
    },
    createUser: async (input) => {
      const res = await apiClient<any>('/admin/users', { method: 'POST', body: JSON.stringify(input) });
      return res.user || res;
    },
    deleteUser: (userId) => apiClient(`/admin/users/${userId}`, { method: 'DELETE' }),
    getNetwork: (userId) => apiClient(`/users/${userId}/network`),
    follow: (userId) => apiClient(`/users/${userId}/follow`, { method: 'POST' }),
    unfollow: (userId) => apiClient(`/users/${userId}/follow`, { method: 'DELETE' }),
    getBlockedUsers: async () => {
      const data = await apiClient<any>('/users/blocked');
      return Array.isArray(data) ? data : data.users || [];
    },
    blockUser: (userId) => apiClient(`/users/${userId}/block`, { method: 'POST' }),
    unblockUser: (userId) => apiClient(`/users/${userId}/block`, { method: 'DELETE' }),
    deleteAccount: (confirmation) => apiClient('/users/me', { method: 'DELETE', body: JSON.stringify({ confirmation }) }),
    exportData: () => apiClient('/users/me/export', { method: 'POST' }),
  },

  content: {
    getFeed: async (params) => {
      const search = params
        ? `?${new URLSearchParams(params as unknown as Record<string, string>).toString()}`
        : '';
      const data = await apiClient<any>(`/feed${search}`);
      return {
        items: data.items || data.posts || [],
        nextCursor: data.nextCursor,
      };
    },
    getReels: async (params) => {
      const search = params
        ? `?${new URLSearchParams({ ...params, type: 'reel' } as unknown as Record<string, string>).toString()}`
        : '?type=reel';
      const data = await apiClient<any>(`/feed${search}`);
      return {
        items: data.items || data.posts || [],
        nextCursor: data.nextCursor,
      };
    },
    getPost: async (id) => {
      const data = await apiClient<any>(`/posts/${id}`);
      if (data && data.post) {
        return {
          ...data.post,
          isLiked: data.isLiked ?? data.post.isLiked ?? false,
          isSaved: data.isSaved ?? data.post.isSaved ?? false,
        } as PostEntity;
      }
      return data as PostEntity;
    },
    createPost: async (input) => {
      const res = await apiClient<any>('/posts', { method: 'POST', body: JSON.stringify(input) });
      return res.post || res;
    },
    updatePost: async (id, patch) => {
      const res = await apiClient<any>(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      return res.post || res;
    },
    deletePost: (id) => apiClient(`/posts/${id}`, { method: 'DELETE' }),
    getComments: async (postId) => {
      const data = await apiClient<any>(`/posts/${postId}/comments`);
      return Array.isArray(data) ? data : data.comments || [];
    },
    addComment: async (postId, input) => {
      const res = await apiClient<any>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(input) });
      return res.comment || res;
    },
    deleteComment: (postId, commentId) => apiClient(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
    likePost: async (postId) => {
      const res = await apiClient<any>(`/posts/${postId}/like`, { method: 'POST' });
      return { liked: true, count: res.count ?? 1 };
    },
    savePost: async (postId) => {
      const res = await apiClient<any>(`/posts/${postId}/save`, { method: 'POST' });
      return { saved: res.saved ?? true };
    },
    pinComment: (postId, commentId) => apiClient(`/posts/${postId}/comments/${commentId}/pin`, { method: 'POST' }),
    hideComment: (postId, commentId) => apiClient(`/posts/${postId}/comments/${commentId}/hide`, { method: 'POST' }),
  },

  verification: {
    submitApplication: async (input) => {
      const res = await apiClient<any>('/scholar/applications', { method: 'POST', body: JSON.stringify(input) });
      return res.application || res;
    },
    getMyApplication: async () => {
      const res = await apiClient<any>('/scholar/applications/me');
      return res.application || res || null;
    },
    getApplications: async (status) => {
      const data = await apiClient<any>(`/admin/applications${status ? `?status=${status}` : ''}`);
      return Array.isArray(data) ? data : data.applications || [];
    },
    getApplication: async (id) => {
      const data = await apiClient<any>(`/admin/applications/${id}`);
      return data.application || data;
    },
    reviewApplication: async (id, input) => {
      const res = await apiClient<any>(`/admin/applications/${id}/decision`, { method: 'POST', body: JSON.stringify(input) });
      return res.application || res;
    },
    endorseApplication: (id) => apiClient(`/scholar/applications/${id}/endorse`, { method: 'POST' }),
  },

  chat: {
    getConversations: async (filter) => {
      const data = await apiClient<any>(`/conversations${filter ? `?filter=${filter}` : ''}`);
      return Array.isArray(data) ? data : data.conversations || [];
    },
    getMessages: async (conversationId) => {
      const data = await apiClient<any>(`/conversations/${conversationId}/messages`);
      return Array.isArray(data) ? data : data.messages || [];
    },
    sendMessage: async (input) => {
      const res = await apiClient<any>(`/conversations/${input.conversationId}/messages`, { method: 'POST', body: JSON.stringify(input) });
      return res.message || res;
    },
    sendChatRequest: (input) => apiClient('/chat/requests', { method: 'POST', body: JSON.stringify(input) }),
    respondChatRequest: (requestId, decision) => apiClient(`/chat/requests/${requestId}/respond`, { method: 'POST', body: JSON.stringify({ decision }) }),
  },

  live: {
    getLiveSessions: async () => {
      const data = await apiClient<any>('/live');
      return Array.isArray(data) ? data : data.sessions || [];
    },
    getLiveSession: async (id) => {
      const data = await apiClient<any>(`/live/${id}`);
      return data.session || data;
    },
    createLiveSession: async (input) => {
      const res = await apiClient<any>('/live', { method: 'POST', body: JSON.stringify(input) });
      return res.session || res;
    },
    endLiveSession: (id) => apiClient(`/live/${id}/end`, { method: 'POST' }),
    deleteLiveSession: (id) => apiClient(`/live/${id}`, { method: 'DELETE' }),
    getViewerToken: (id) => apiClient(`/live/${id}/token`, { method: 'POST' }),
  },

  calls: {
    initiateCall: (calleeId) => apiClient('/calls', { method: 'POST', body: JSON.stringify({ calleeId }) }),
    getCallSession: async (id) => {
      const data = await apiClient<any>(`/calls/${id}`);
      return data.session || data;
    },
    respondCall: (id, decision) => apiClient(`/calls/${id}/respond`, { method: 'POST', body: JSON.stringify({ decision }) }),
    endCall: (id) => apiClient(`/calls/${id}/end`, { method: 'POST' }),
  },

  moderation: {
    createReport: (input) => apiClient('/reports', { method: 'POST', body: JSON.stringify(input) }),
    getReports: async (params) => {
      const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
      const data = await apiClient<any>(`/admin/reports${query}`);
      return Array.isArray(data) ? data : data.reports || [];
    },
    getReport: async (id) => {
      const data = await apiClient<any>(`/admin/reports/${id}`);
      return data.report || data;
    },
    takeAction: (reportId, action) => apiClient(`/admin/reports/${reportId}/action`, { method: 'POST', body: JSON.stringify(action) }),
    deleteReport: (reportId) => apiClient(`/admin/reports/${reportId}`, { method: 'DELETE' }),
    getAuditLogs: async () => {
      const data = await apiClient<any>('/admin/audit-logs');
      return Array.isArray(data) ? data : data.logs || data.auditLogs || [];
    },
    getUsers: async (query) => {
      const data = await apiClient<any>(`/users${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      return Array.isArray(data) ? data : data.users || [];
    },
    updateUserRole: (userId, roles) => apiClient(`/admin/users/${userId}/roles`, { method: 'PATCH', body: JSON.stringify({ roles }) }),
    revokeScholar: (userId, reason) => apiClient(`/admin/users/${userId}/revoke-scholar`, { method: 'POST', body: JSON.stringify({ reason }) }),
  },

  notifications: {
    getNotifications: async (limit) => {
      const qs = limit ? `?limit=${limit}` : '';
      const data = await apiClient<any>(`/notifications${qs}`);
      return Array.isArray(data) ? data : data.notifications || [];
    },
    getUnreadCount: () => apiClient('/notifications/unread-count'),
    markAsRead: (id: string) => apiClient(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: () => apiClient('/notifications/read-all', { method: 'PUT' }),
    getPreferences: () => apiClient('/notifications/preferences'),
    updatePreferences: (prefs) => apiClient('/notifications/preferences', { method: 'PUT', body: JSON.stringify(prefs) }),
  },
};
