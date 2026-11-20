'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { webApi } from '../lib/api';

export interface WebUser {
  id: string;
  _id?: string;
  publicId?: string;
  displayName: string;
  username?: string;
  email?: string;
  phone?: string;
  roles: string[];
  bio?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
  scholarProfile?: {
    verified: boolean;
    institution?: string;
    specialties: string[];
    languages: string[];
  };
}

interface AuthContextType {
  user: WebUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isScholar: boolean;
  login: (token: string, user: WebUser, refreshToken?: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WebUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sanad_token') || localStorage.getItem('sanad_member_token');
    const savedUser = localStorage.getItem('sanad_user') || localStorage.getItem('sanad_member_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {}
    }

    if (savedToken) {
      webApi.auth
        .getMe()
        .then((res) => {
          if (res?.user) {
            const raw = res.user;
            const updatedUser: WebUser = {
              id: raw._id || raw.id,
              _id: raw._id || raw.id,
              publicId: raw.publicId,
              displayName: raw.displayName,
              username: raw.username,
              email: raw.email,
              phone: raw.phone,
              roles: raw.roles || ['member'],
              bio: raw.bio,
              avatarUrl: raw.avatarUrl,
              isPrivate: raw.isPrivate,
              scholarProfile: raw.scholarProfile,
            };
            setUser(updatedUser);
            localStorage.setItem('sanad_user', JSON.stringify(updatedUser));
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('sanad_token');
          localStorage.removeItem('sanad_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: WebUser, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sanad_token', newToken);
    localStorage.setItem('sanad_user', JSON.stringify(newUser));
    localStorage.setItem('sanad_member_token', newToken);
    localStorage.setItem('sanad_member_user', JSON.stringify(newUser));
    if (refreshToken) {
      localStorage.setItem('sanad_refresh_token', refreshToken);
      localStorage.setItem('sanad_member_refresh_token', refreshToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('sanad_token');
    localStorage.removeItem('sanad_refresh_token');
    localStorage.removeItem('sanad_user');
    localStorage.removeItem('sanad_member_token');
    localStorage.removeItem('sanad_member_refresh_token');
    localStorage.removeItem('sanad_member_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const res = await webApi.auth.getMe();
      if (res?.user) {
        const raw = res.user;
        const updatedUser: WebUser = {
          id: raw._id || raw.id,
          _id: raw._id || raw.id,
          publicId: raw.publicId,
          displayName: raw.displayName,
          username: raw.username,
          email: raw.email,
          phone: raw.phone,
          roles: raw.roles || ['member'],
          bio: raw.bio,
          avatarUrl: raw.avatarUrl,
          isPrivate: raw.isPrivate,
          scholarProfile: raw.scholarProfile,
        };
        setUser(updatedUser);
        localStorage.setItem('sanad_user', JSON.stringify(updatedUser));
      }
    } catch {}
  };

  const roles = user?.roles || [];
  const isAdmin = roles.includes('admin');
  const isModerator = roles.includes('moderator') || isAdmin;
  const isScholar = roles.includes('scholar') || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(token && user),
        isAdmin,
        isModerator,
        isScholar,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

