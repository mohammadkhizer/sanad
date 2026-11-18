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

const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    author: {
      id: 'scholar-1',
      displayName: 'Senior Hadith Department Fellow',
      username: 'hadith_chair',
      isScholar: true,
      institution: 'Dar al-Hadith Classical Seminary',
    },
    hadithTextArabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    hadithTextTranslation: 'Actions are judged by motives, and each person will have according to their intention.',
    chainVerificationStatus: 'sahih',
    sourceReference: 'Sahih al-Bukhari 1, Sahih Muslim 1907',
    body: 'A comprehensive pedagogical treatise on the first tradition in the Sahihayn. This tradition establishes the indispensable foundation of classical epistemology: spiritual alignment prior to cognitive pursuit.',
    tags: ['Niyyah', 'Foundations', 'Sahihayn'],
    likesCount: 142,
    commentsCount: 18,
    isLiked: false,
    isBookmarked: true,
    createdAt: '2026-11-17T14:30:00Z',
  },
  {
    id: 'post-2',
    author: {
      id: 'scholar-2',
      displayName: 'Principles of Jurisprudence Chair',
      username: 'usul_studies',
      isScholar: true,
      institution: 'Faculty of Classical Usul & Hermeneutics',
    },
    hadithTextArabic: 'الدِّينُ النَّصِيحَةُ، قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ',
    hadithTextTranslation: 'The religion is sincere counsel. We asked: To whom? He answered: To Allah, His Book, His Messenger, the leaders of the Muslims, and their common folk.',
    chainVerificationStatus: 'sahih',
    sourceReference: 'Sahih Muslim 55',
    body: 'Examining the semantic breadth of "al-Nasihah" across early lexicographers and legal exegetes. Sincerity constitutes not mere advice, but total restorative fidelity to divine covenants.',
    tags: ['Usul', 'Ethics', 'Sahih Muslim'],
    likesCount: 96,
    commentsCount: 12,
    isLiked: true,
    isBookmarked: false,
    createdAt: '2026-11-16T18:15:00Z',
  },
  {
    id: 'post-3',
    author: {
      id: 'scholar-3',
      displayName: 'Biographical Evaluation & Rijal Researcher',
      username: 'rijal_scholar',
      isScholar: true,
      institution: 'Center for Isnad Heritage & Transmission',
    },
    hadithTextArabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    hadithTextTranslation: 'Whoever travels a path seeking sacred knowledge, Allah facilitates for him thereby a path to Paradise.',
    chainVerificationStatus: 'sahih',
    sourceReference: 'Sahih Muslim 2699',
    body: 'Analysis of transmitting authorities across the Basran and Kufan recensions. We observe uninterrupted continuities in student chains spanning over three centuries.',
    tags: ['Knowledge', 'Rijal', 'Isnad Science'],
    likesCount: 215,
    commentsCount: 31,
    isLiked: false,
    isBookmarked: false,
    createdAt: '2026-11-15T09:40:00Z',
  },
];

const MOCK_REELS: Reel[] = [
  {
    id: 'reel-1',
    title: 'How Hadith Transmitters Were Audited',
    scholar: {
      name: 'Senior Hadith Department Fellow',
      handle: '@hadith_chair',
      institution: 'Dar al-Hadith Classical Seminary',
    },
    duration: '02:45',
    hadithRef: 'Ilm al-Rijal Methodology',
    grade: 'sahih',
    summary: 'A 3-minute visual breakdown of the 5 conditions of Hadith authenticity: continuity, uprightness, precision, absence of defects, and lack of anomaly.',
    likes: 384,
  },
  {
    id: 'reel-2',
    title: 'The Architecture of an Isnad Chain',
    scholar: {
      name: 'Biographical Evaluation & Rijal Researcher',
      handle: '@rijal_scholar',
      institution: 'Center for Isnad Heritage',
    },
    duration: '01:50',
    hadithRef: 'Chain Transmission Verification',
    grade: 'sahih',
    summary: 'Understanding student-teacher transmission links from 8th-century Medina to classical compendia compilations.',
    likes: 512,
  },
  {
    id: 'reel-3',
    title: 'Distinguishing Sahih from Hasan Traditions',
    scholar: {
      name: 'Principles of Jurisprudence Chair',
      handle: '@usul_studies',
      institution: 'Faculty of Classical Usul',
    },
    duration: '03:10',
    hadithRef: 'Methodology of Terminology',
    grade: 'hasan',
    summary: 'How slight variations in mnemonic precision (dabt) shift a narration from Sahih li-Dhatihi to Hasan li-Dhatihi.',
    likes: 290,
  },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participant: {
      id: 'scholar-1',
      displayName: 'Senior Hadith Department Fellow',
      username: 'hadith_chair',
      isScholar: true,
    },
    lastMessage: 'The manuscript variant in manuscript Vat. Arab. 340 confirms the reading.',
    lastMessageAt: '10:45 AM',
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    participant: {
      id: 'scholar-2',
      displayName: 'Principles of Jurisprudence Chair',
      username: 'usul_studies',
      isScholar: true,
    },
    lastMessage: 'Your question regarding non-literal hermeneutics in Surah an-Nur has been scheduled for tomorrow.',
    lastMessageAt: 'Yesterday',
    unreadCount: 0,
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sanad_token') : null;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (err) {
    throw err;
  }
}

export const platformApi = {
  feed: {
    getPosts: async (category?: string): Promise<{ posts: Post[] }> => {
      try {
        const query = category && category !== 'all' ? `?category=${category}` : '';
        const res = await apiFetch<{ posts: Post[] }>(`/posts${query}`);
        return res;
      } catch {
        const filtered = category && category !== 'all'
          ? MOCK_POSTS.filter((p) => p.tags.some((t) => t.toLowerCase().includes(category.toLowerCase())))
          : MOCK_POSTS;
        return { posts: filtered };
      }
    },
    getPost: async (id: string): Promise<{ post: Post }> => {
      try {
        return await apiFetch<{ post: Post }>(`/posts/${id}`);
      } catch {
        const post = MOCK_POSTS.find((p) => p.id === id) || MOCK_POSTS[0];
        return { post };
      }
    },
    createPost: async (data: Partial<Post>): Promise<{ post: Post }> => {
      try {
        return await apiFetch<{ post: Post }>('/posts', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        const newPost: Post = {
          id: `post-${Date.now()}`,
          author: {
            id: 'user-me',
            displayName: 'Authenticated Scholar',
            username: 'scholar_fellow',
            isScholar: true,
            institution: 'Sanad Academy of Classical Studies',
          },
          body: data.body || '',
          hadithTextArabic: data.hadithTextArabic,
          hadithTextTranslation: data.hadithTextTranslation,
          chainVerificationStatus: data.chainVerificationStatus || 'sahih',
          sourceReference: data.sourceReference || 'Primary Transmission Record',
          tags: data.tags || ['General'],
          likesCount: 0,
          commentsCount: 0,
          createdAt: new Date().toISOString(),
        };
        MOCK_POSTS.unshift(newPost);
        return { post: newPost };
      }
    },
  },

  reels: {
    getReels: async (): Promise<{ reels: Reel[] }> => {
      try {
        return await apiFetch<{ reels: Reel[] }>('/reels');
      } catch {
        return { reels: MOCK_REELS };
      }
    },
  },

  chat: {
    getConversations: async (): Promise<{ conversations: Conversation[] }> => {
      try {
        return await apiFetch<{ conversations: Conversation[] }>('/conversations');
      } catch {
        return { conversations: MOCK_CONVERSATIONS };
      }
    },
    getMessages: async (convId: string): Promise<{ messages: any[] }> => {
      try {
        return await apiFetch<{ messages: any[] }>(`/conversations/${convId}/messages`);
      } catch {
        return {
          messages: [
            {
              id: 'm1',
              senderId: 'scholar-1',
              text: 'Peace and blessings upon you. How may I assist in clarifying the transmission chain?',
              createdAt: '10:30 AM',
            },
            {
              id: 'm2',
              senderId: 'user-me',
              text: 'I wanted to inquire about the reliability of the narrator Muhammad ibn Sirin in Kufan transmissions.',
              createdAt: '10:35 AM',
            },
            {
              id: 'm3',
              senderId: 'scholar-1',
              text: 'Imam Ibn Sirin is universally recognized as Thiqah Thabt (unimpeachable and steadfast) across all classical authorities.',
              createdAt: '10:40 AM',
            },
          ],
        };
      }
    },
    sendMessage: async (convId: string, text: string): Promise<any> => {
      try {
        return await apiFetch(`/conversations/${convId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ body: text }),
        });
      } catch {
        return { success: true, message: { id: `m-${Date.now()}`, senderId: 'user-me', text, createdAt: 'Just now' } };
      }
    },
  },

  scholar: {
    apply: async (data: any): Promise<{ success: boolean; message: string }> => {
      try {
        return await apiFetch('/scholar/apply', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return {
          success: true,
          message: 'Scholar application received. Our faculty review committee will inspect your credentials.',
        };
      }
    },
    getStatus: async (): Promise<{ status: string; submittedAt: string }> => {
      try {
        return await apiFetch('/scholar/status');
      } catch {
        return { status: 'under_review', submittedAt: '2026-11-16' };
      }
    },
  },

  users: {
    getUser: async (id: string): Promise<any> => {
      try {
        return await apiFetch(`/users/${id}`);
      } catch {
        return {
          user: {
            id,
            displayName: 'Seeker of Sacred Traditions',
            username: 'seeker_' + id.slice(0, 5),
            bio: 'Student of classical Hadith methodology, Arabic lexicography, and isnad transmission.',
            roles: ['member'],
          },
          counts: { followers: 14, following: 8, lessons: 2 },
          isFollowing: false,
        };
      }
    },
    unfollow: async (id: string) => {
      return { success: true };
    },
  },

  posts: {
    getById: async (id: string): Promise<Post> => {
      const res = await platformApi.feed.getPost(id);
      return res.post;
    },
  },

  auth: {
    login: async (credentials: any) => {
      try {
        return await apiFetch<any>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
      } catch {
        // Fallback for standalone demo mode
        return {
          accessToken: 'demo_jwt_token_public_web',
          user: {
            id: 'user-101',
            displayName: credentials.identifier?.split('@')[0] || 'Sanad Scholar',
            username: credentials.identifier?.split('@')[0] || 'scholar',
            email: credentials.identifier?.includes('@') ? credentials.identifier : 'member@sanad.app',
            roles: ['scholar', 'member'],
            bio: 'Dedicated student of classical Islamic Hadith methodology and Arabic linguistics.',
            institution: 'Sanad Classical Academy',
          },
        };
      }
    },
    register: async (data: any) => {
      try {
        return await apiFetch<any>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return {
          accessToken: 'demo_jwt_token_public_web',
          user: {
            id: 'user-102',
            displayName: data.displayName,
            username: data.username,
            email: data.email,
            roles: [data.role || 'member'],
            bio: 'Student of sacred knowledge.',
          },
        };
      }
    },
    forgotPassword: async (identifier: string) => {
      try {
        return await apiFetch<{ success: boolean; message: string }>('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ identifier }),
        });
      } catch {
        return {
          success: true,
          message: 'If an account exists, a 6-digit recovery code has been dispatched to your email address.',
        };
      }
    },
    resetPassword: async (data: any) => {
      try {
        return await apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return { success: true, message: 'Password reset successfully.' };
      }
    },
  },
};

export const webApi = platformApi;
export type HadithPost = Post;
