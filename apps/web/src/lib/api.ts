const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  code?: string;
  status: number;
  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sanad_token');
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errorMsg =
      data?.message || data?.error?.message || `Request failed with status ${res.status}`;
    throw new ApiError(errorMsg, res.status, data?.code || data?.error?.code);
  }

  return data as T;
}

export const webApi = {
  auth: {
    login: (body: { identifier: string; password: string; twoFactorCode?: string }) =>
      apiFetch<{
        accessToken?: string;
        refreshToken?: string;
        user?: any;
        requires2FA?: boolean;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    register: (body: {
      displayName: string;
      email?: string;
      phone?: string;
      username?: string;
      dateOfBirth: string;
      password: string;
    }) =>
      apiFetch<{ success: boolean; message: string; user?: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    forgotPassword: (identifier: string) =>
      apiFetch<{ success: boolean; message: string; code?: string; token?: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ identifier }),
        }
      ),

    resetPassword: (body: { token: string; newPassword: string; identifier?: string }) =>
      apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getMe: () => apiFetch<{ user: any; counts: any }>('/users/me'),
  },

  users: {
    getMe: () => apiFetch<{ user: any; counts: any }>('/users/me'),

    getUser: (id: string) =>
      apiFetch<{ user: any; counts: any; isFollowing: boolean; isFollowedBy: boolean; relation: string }>(
        `/users/${id}`
      ),

    searchUsers: (query?: string, role?: string) => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (role) params.append('role', role);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<{ users: any[] }>(`/users${qs}`);
    },

    updateProfile: (body: Record<string, unknown>) =>
      apiFetch<{ user: any }>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),

    follow: (id: string) =>
      apiFetch<{ success: boolean; message: string }>(`/users/${id}/follow`, {
        method: 'POST',
      }),

    unfollow: (id: string) =>
      apiFetch<{ success: boolean; message: string }>(`/users/${id}/follow`, {
        method: 'DELETE',
      }),

    getNetwork: (id: string) =>
      apiFetch<{ followers: any[]; following: any[] }>(`/users/${id}/network`),
  },

  admin: {
    getUsers: (query?: string) => {
      const qs = query ? `?q=${encodeURIComponent(query)}` : '';
      return apiFetch<{ users: any[] }>(`/users${qs}`);
    },

    updateUserRole: (userId: string, roles: string[]) =>
      apiFetch<{ success: boolean; user: any }>(`/admin/users/${userId}/roles`, {
        method: 'PATCH',
        body: JSON.stringify({ roles }),
      }),

    toggleUserStatus: (
      userId: string,
      status?: 'active' | 'disabled' | 'suspended',
      reason?: string
    ) =>
      apiFetch<{ success: boolean; status: string; message: string; user?: any }>(
        `/admin/users/${userId}/disable`,
        {
          method: 'POST',
          body: JSON.stringify({ status, reason }),
        }
      ),

    getReviewQueue: () =>
      apiFetch<{ items: any[]; applications?: any[] }>('/admin/review-queue'),

    reviewApplication: (
      applicationId: string,
      decision: 'approved' | 'rejected',
      notes?: string
    ) =>
      apiFetch<{ success: boolean }>(`/admin/applications/${applicationId}/review`, {
        method: 'POST',
        body: JSON.stringify({ decision, notes }),
      }),

    getReports: (status?: string) => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return apiFetch<{ reports: any[] }>(`/admin/reports${qs}`);
    },

    resolveReport: (
      reportId: string,
      action: 'resolve' | 'dismiss' | 'escalate',
      notes?: string
    ) =>
      apiFetch<{ success: boolean }>(`/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ action, notes }),
      }),

    getAuditLogs: (limit: number = 50) =>
      apiFetch<{ logs: any[]; auditLogs?: any[] }>(`/admin/audit-logs?limit=${limit}`),

    getScholarMonitoring: (params?: { country?: string; experience?: string; username?: string }) => {
      const q = new URLSearchParams();
      if (params?.country) q.append('country', params.country);
      if (params?.experience) q.append('experience', params.experience);
      if (params?.username) q.append('username', params.username);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<{ scholars: any[]; meta: any }>(`/admin/scholars/activity-overview${qs}`);
    },

    getScholarActivityTimeline: (scholarId: string) =>
      apiFetch<{ scholar: any; activities: any[] }>(`/admin/scholars/${scholarId}/activity-logs`),

    sendScholarSecurityAlert: (
      scholarId: string,
      data: { flagTitle?: string; message: string; severity?: string }
    ) =>
      apiFetch<{ success: boolean; activity: any }>(`/admin/scholars/${scholarId}/security-alert`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    dismissActivityAlert: (activityId: string) =>
      apiFetch<{ success: boolean }>(`/admin/scholars/activity/${activityId}/dismiss`, {
        method: 'PATCH',
      }),
  },
};

