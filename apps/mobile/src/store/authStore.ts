import { create } from 'zustand';
import { Role } from '@sanad/shared';
import { getApiBaseUrl } from '../api/config';

function getSecureStore() {
  try {
    return require('expo-secure-store');
  } catch {
    return {
      getItemAsync: async (_key: string) => null,
      setItemAsync: async (_key: string, _value: string) => {},
      deleteItemAsync: async (_key: string) => {},
    };
  }
}

const SecureStore = getSecureStore();

const ACCESS_TOKEN_KEY = 'sanad_access_token';
const REFRESH_TOKEN_KEY = 'sanad_refresh_token';
const USER_DATA_KEY = 'sanad_user_data';

export interface AuthUser {
  id: string;
  displayName: string;
  username?: string;
  email?: string;
  phone?: string;
  roles: Role[];
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => Promise<void>;
  updateAccessToken: (token: string) => Promise<void>;
  updateUser: (partialUser: Partial<AuthUser>) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const [accessToken, refreshToken, rawUser] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_DATA_KEY),
      ]);

      const baseUrl = getApiBaseUrl();

      if (accessToken && refreshToken && rawUser) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(`${baseUrl}/users/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (res.ok) {
            const data = await res.json();
            const dbUser = data.user || data;
            const liveUser: AuthUser = {
              id: dbUser._id || dbUser.id,
              displayName: dbUser.displayName,
              username: dbUser.username,
              email: dbUser.email,
              phone: dbUser.phone,
              roles: dbUser.roles || ['member'],
              twoFactorEnabled: dbUser.twoFA?.enabled ?? false,
            };
            await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(liveUser));
            set({
              accessToken,
              refreshToken,
              user: liveUser,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        } catch {
          // If server is temporarily unreachable, maintain cached session
          const user = JSON.parse(rawUser) as AuthUser;
          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }

      // No saved token found in storage
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch {
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (accessToken, refreshToken, user) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user)),
    ]);

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateAccessToken: async (accessToken) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    set({ accessToken });
  },

  updateUser: async (partialUser: Partial<AuthUser>) => {
    set((state) => {
      if (!state.user) return state;
      const updated: AuthUser = { ...state.user, ...partialUser };
      SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(updated)).catch(() => {});
      return { user: updated };
    });
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_DATA_KEY),
    ]);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
