import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, Role } from '@sanad/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

const ACCESS_TOKEN_KEY = 'sanad_access_token';
const REFRESH_TOKEN_KEY = 'sanad_refresh_token';

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
  return await SecureStore.getItemAsync(key);
}

async function removeSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user: User, accessToken: string, refreshToken: string) => {
    await setSecureItem(ACCESS_TOKEN_KEY, accessToken);
    await setSecureItem(REFRESH_TOKEN_KEY, refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (updatedFields: Partial<User>) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updatedFields } });
    }
  },

  logout: async () => {
    await removeSecureItem(ACCESS_TOKEN_KEY);
    await removeSecureItem(REFRESH_TOKEN_KEY);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadStoredAuth: async () => {
    try {
      const accessToken = await getSecureItem(ACCESS_TOKEN_KEY);
      const refreshToken = await getSecureItem(REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

