import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Role } from '@sanad/shared';

const ACCESS_TOKEN_KEY = 'sanad_access_token';
const REFRESH_TOKEN_KEY = 'sanad_refresh_token';
const USER_DATA_KEY = 'sanad_user_data';

export interface AuthUser {
  id: string;
  displayName: string;
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
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'usr_admin_1',
  displayName: 'Sanad Platform Admin',
  email: 'admin@sanad.internal',
  roles: ['member', 'scholar', 'moderator', 'admin'],
  twoFactorEnabled: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_ADMIN_USER,
  accessToken: 'mock_jwt_access_token_sanad_admin',
  refreshToken: 'mock_jwt_refresh_token_sanad_admin',
  isLoading: false,
  isAuthenticated: true,

  initialize: async () => {
    try {
      const [accessToken, refreshToken, rawUser] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_DATA_KEY),
      ]);

      if (accessToken && refreshToken && rawUser) {
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

      // If in HTTP mode, attempt auto-login with default seeded admin credentials
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: 'admin@sanad.app', password: 'SanadSecure2026!' }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data.accessToken && data.refreshToken && data.user) {
            const liveUser: AuthUser = {
              id: data.user.id || data.user._id,
              displayName: data.user.displayName,
              email: data.user.email,
              phone: data.user.phone,
              roles: data.user.roles,
              twoFactorEnabled: data.user.twoFactorEnabled ?? data.user.twoFA?.enabled,
            };
            await Promise.all([
              SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken),
              SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken),
              SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(liveUser)),
            ]);
            set({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: liveUser,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }
      } catch {
        // Fallback when server is not running or offline
      }

      // Default to Platform Admin account
      set({
        accessToken: 'mock_jwt_access_token_sanad_admin',
        refreshToken: 'mock_jwt_refresh_token_sanad_admin',
        user: DEFAULT_ADMIN_USER,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Default to Platform Admin account on storage error
      set({
        accessToken: 'mock_jwt_access_token_sanad_admin',
        refreshToken: 'mock_jwt_refresh_token_sanad_admin',
        user: DEFAULT_ADMIN_USER,
        isAuthenticated: true,
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

