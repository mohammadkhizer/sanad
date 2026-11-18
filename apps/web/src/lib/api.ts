export interface Post {
  id: string;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
    isScholar: boolean;
    institution?: string;
  };
  hadithTextArabic?: string;
  hadithTextTranslation?: string;
  chainVerificationStatus: 'sahih' | 'hasan' | 'daif';
  sourceReference: string;
  body: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
}

export interface Reel {
  id: string;
  title: string;
  scholar: {
    name: string;
    handle: string;
    institution: string;
  };
  duration: string;
  hadithRef: string;
  grade: 'sahih' | 'hasan';
  summary: string;
  videoUrl?: string;
  likes: number;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
    isScholar: boolean;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface CommentItem {
  id: string;
  author: string;
  role?: string;
  text: string;
  date: string;
  createdAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sanad-api-s8t5.onrender.com/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('sanad_member_token') || localStorage.getItem('sanad_token')
      : null;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errorMsg = data?.message || data?.error?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export function normalizePost(raw: any): Post {
  const authorObj = raw.authorId || raw.author || {};
  const isScholar = Boolean(
    authorObj.scholarProfile?.verified ||
    (Array.isArray(authorObj.roles) && authorObj.roles.includes('scholar')) ||
    raw.isScholar
  );

  return {
    id: raw._id?.toString() || raw.id || '',
    author: {
      id: authorObj._id?.toString() || authorObj.id || 'author',
      displayName: authorObj.displayName || 'Scholar of Sacred Traditions',
      username: authorObj.username || 'scholar',
      avatarUrl: authorObj.avatarUrl,
      isScholar,
      institution: authorObj.scholarProfile?.institution || 'Sanad Academic Council',
    },
    hadithTextArabic: raw.hadithTextArabic || '',
    hadithTextTranslation: raw.hadithTextTranslation || '',
    chainVerificationStatus: raw.chainVerificationStatus || 'sahih',
    sourceReference: raw.sourceReference || 'Primary Transmission Record',
    body: raw.caption || raw.body || '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    likesCount: raw.counts?.likes ?? raw.likesCount ?? 0,
    commentsCount: raw.counts?.comments ?? raw.commentsCount ?? 0,
    isLiked: Boolean(raw.isLiked),
    isBookmarked: Boolean(raw.isBookmarked || raw.isSaved),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
  };
}

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sanad_member_user') || localStorage.getItem('sanad_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed.id || parsed._id)?.toString() || null;
  } catch {
    return null;
  }
}

export const platformApi = {
  feed: {
    getPosts: async (category?: string, scholarId?: string): Promise<{ posts: Post[] }> => {
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('type', category);
      }
      if (scholarId) {
        params.append('scholarId', scholarId);
      }
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiFetch<{ posts?: any[]; items?: any[] }>(`/feed${qs}`);
      const rawPosts = res.posts || res.items || [];
      return { posts: rawPosts.map(normalizePost) };
    },

    getPost: async (id: string): Promise<{ post: Post; isLiked?: boolean; isSaved?: boolean }> => {
      const res = await apiFetch<{ post: any; isLiked?: boolean; isSaved?: boolean }>(`/posts/${id}`);
      return {
        post: normalizePost(res.post),
        isLiked: res.isLiked,
        isSaved: res.isSaved,
      };
    },

    createPost: async (data: {
      caption: string;
      tags?: string[];
      type?: 'text' | 'reel' | 'video';
      hadithTextArabic?: string;
      hadithTextTranslation?: string;
      sourceReference?: string;
      chainVerificationStatus?: string;
    }): Promise<{ post: Post }> => {
      const res = await apiFetch<{ post: any; message?: string }>('/posts', {
        method: 'POST',
        body: JSON.stringify({
          type: data.type || 'text',
          caption: data.caption,
          tags: data.tags || [],
          language: 'en',
          visibility: 'public',
        }),
      });
      return { post: normalizePost(res.post) };
    },

    likePost: async (id: string): Promise<{ success: boolean }> => {
      return await apiFetch<{ success: boolean }>(`/posts/${id}/like`, { method: 'POST' });
    },

    unlikePost: async (id: string): Promise<{ success: boolean }> => {
      return await apiFetch<{ success: boolean }>(`/posts/${id}/like`, { method: 'DELETE' });
    },

    savePost: async (id: string): Promise<{ saved: boolean }> => {
      return await apiFetch<{ saved: boolean }>(`/posts/${id}/save`, { method: 'POST' });
    },

    getComments: async (id: string): Promise<{ comments: CommentItem[] }> => {
      const res = await apiFetch<{ comments: any[] }>(`/posts/${id}/comments`);
      const list = (res.comments || []).map((c) => ({
        id: c._id?.toString() || c.id,
        author: c.userId?.displayName || 'Student of Knowledge',
        role: c.userId?.scholarProfile?.verified ? 'Verified Scholar' : 'Member',
        text: c.text,
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently',
        createdAt: c.createdAt,
      }));
      return { comments: list };
    },

    addComment: async (id: string, text: string): Promise<{ comment: any }> => {
      return await apiFetch<{ comment: any }>(`/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
    },
  },

  reels: {
    getReels: async (): Promise<{ reels: Reel[] }> => {
      const res = await apiFetch<{ posts?: any[]; items?: any[] }>('/feed?type=reel');
      const raw = res.posts || res.items || [];
      const list: Reel[] = raw.map((item) => ({
        id: item._id?.toString() || item.id,
        title: item.caption?.slice(0, 60) || 'Scholarly Reel',
        scholar: {
          name: item.authorId?.displayName || 'Verified Faculty',
          handle: item.authorId?.username ? `@${item.authorId.username}` : '@faculty',
          institution: item.authorId?.scholarProfile?.institution || 'Sanad Academic Foundation',
        },
        duration: '02:30',
        hadithRef: item.tags?.[0] || 'Transmission Record',
        grade: 'sahih',
        summary: item.caption || '',
        videoUrl: item.playbackId ? `https://stream.mux.com/${item.playbackId}.m3u8` : undefined,
        likes: item.counts?.likes || 0,
      }));
      return { reels: list };
    },
  },

  chat: {
    getConversations: async (): Promise<{ conversations: Conversation[] }> => {
      const res = await apiFetch<{ conversations?: any[] }>('/conversations');
      const raw = res.conversations || [];
      const myId = getCurrentUserId();
      const list: Conversation[] = raw.map((c) => {
        const participant =
          c.participants?.find((p: any) => {
            const pid = (p._id || p.id)?.toString();
            return myId ? pid !== myId : true;
          }) ||
          c.participants?.[0] ||
          c.participant ||
          {};
        const pid = (participant._id || participant.id || '').toString();
        return {
          id: c._id?.toString() || c.id,
          participant: {
            id: pid,
            displayName: participant.displayName || 'Academic Seeker',
            username: participant.username || 'member',
            avatarUrl: participant.avatarUrl,
            isScholar: Boolean(
              participant.scholarProfile?.verified || participant.roles?.includes('scholar')
            ),
          },
          lastMessage: c.lastMessageText || c.lastMessage?.body || 'Consultation channel opened.',
          lastMessageAt: c.lastMessageAt
            ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recently',
          unreadCount: c.unreadCount || 0,
        };
      });
      return { conversations: list };
    },

    getMessages: async (
      convOrUserId: string
    ): Promise<{ messages: any[]; conversationId?: string; recipient?: any }> => {
      const res = await apiFetch<{ messages?: any[]; conversationId?: string; recipient?: any }>(
        `/conversations/${convOrUserId}/messages`
      );
      const raw = res.messages || [];
      return {
        messages: raw.map((m: any) => ({
          id: m._id?.toString() || m.id,
          senderId: (m.senderId?._id || m.senderId)?.toString(),
          text: m.body || m.text,
          createdAt: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
        })),
        conversationId: res.conversationId,
        recipient: res.recipient,
      };
    },

    sendMessage: async (convOrUserId: string, text: string): Promise<any> => {
      return await apiFetch(`/conversations/${convOrUserId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: text }),
      });
    },
  },

  scholar: {
    apply: async (data: {
      institution: string;
      specialties: string[];
      statement: string;
      credentials: Array<{ type: string; fileKey: string; institution: string; year: number }>;
      languages: string[];
    }): Promise<{ success: boolean; message: string; application?: any }> => {
      const res = await apiFetch<{ message?: string; application?: any }>('/scholar/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        message: res.message || 'Scholar application received.',
        application: res.application,
      };
    },

    getStatus: async (): Promise<{ application: any | null }> => {
      const res = await apiFetch<{ application?: any }>('/scholar/applications/me');
      return { application: res.application || null };
    },
  },

  users: {
    getMe: async (): Promise<{ user: any; counts: { followers: number; following: number; lessons: number } }> => {
      return await apiFetch<{ user: any; counts: { followers: number; following: number; lessons: number } }>('/users/me');
    },

    updateMe: async (data: {
      username?: string;
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
      isPrivate?: boolean;
      specialties?: string[];
      languages?: string[];
    }): Promise<{ user: any }> => {
      return await apiFetch<{ user: any }>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    getUser: async (id: string): Promise<{
      user: any;
      counts: { followers: number; following: number; lessons: number };
      isFollowing: boolean;
      isFollowedBy: boolean;
      relation: string;
    }> => {
      return await apiFetch<{
        user: any;
        counts: { followers: number; following: number; lessons: number };
        isFollowing: boolean;
        isFollowedBy: boolean;
        relation: string;
      }>(`/users/${id}`);
    },

    listUsers: async (params?: { role?: string; q?: string }): Promise<{ users: any[] }> => {
      const sp = new URLSearchParams();
      if (params?.role) sp.append('role', params.role);
      if (params?.q) sp.append('q', params.q);
      const qs = sp.toString() ? `?${sp.toString()}` : '';
      return await apiFetch<{ users: any[] }>(`/users${qs}`);
    },

    follow: async (id: string): Promise<{ success: boolean; message: string }> => {
      return await apiFetch<{ success: boolean; message: string }>(`/users/${id}/follow`, { method: 'POST' });
    },

    unfollow: async (id: string): Promise<{ success: boolean; message: string }> => {
      return await apiFetch<{ success: boolean; message: string }>(`/users/${id}/follow`, { method: 'DELETE' });
    },

    getNetwork: async (id: string): Promise<{ followers: any[]; following: any[] }> => {
      return await apiFetch<{ followers: any[]; following: any[] }>(`/users/${id}/network`);
    },
  },

  posts: {
    getById: async (id: string): Promise<Post> => {
      const res = await platformApi.feed.getPost(id);
      return res.post;
    },
    getComments: async (id: string): Promise<{ comments: CommentItem[] }> => {
      return await platformApi.feed.getComments(id);
    },
    addComment: async (id: string, text: string): Promise<{ comment: any }> => {
      return await platformApi.feed.addComment(id, text);
    },
    like: async (id: string): Promise<{ success: boolean }> => {
      return await platformApi.feed.likePost(id);
    },
    unlike: async (id: string): Promise<{ success: boolean }> => {
      return await platformApi.feed.unlikePost(id);
    },
    save: async (id: string): Promise<{ saved: boolean }> => {
      return await platformApi.feed.savePost(id);
    },
  },

  auth: {
    login: async (credentials: { identifier: string; password: string; twoFactorCode?: string }) => {
      return await apiFetch<{
        accessToken?: string;
        refreshToken?: string;
        user?: any;
        requires2FA?: boolean;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    register: async (data: {
      displayName: string;
      email?: string;
      phone?: string;
      username?: string;
      dateOfBirth: string;
      password: string;
    }) => {
      return await apiFetch<{
        message?: string;
        identifier?: string;
        accessToken?: string;
        user?: any;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    verifyOtp: async (data: { identifier: string; code: string }) => {
      return await apiFetch<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    forgotPassword: async (identifier: string) => {
      return await apiFetch<{ success: boolean; message: string; code?: string; token?: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ identifier }),
        }
      );
    },

    resetPassword: async (data: { token: string; newPassword: string; identifier?: string }) => {
      return await apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};

export const webApi = platformApi;
export type HadithPost = Post;
