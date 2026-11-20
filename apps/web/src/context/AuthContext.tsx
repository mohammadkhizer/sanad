'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  _id?: string;
  publicId?: string;
  displayName: string;
  username?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  roles: string[];
  bio?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
  institution?: string;
  specialties?: string[];
  languages?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isScholar: boolean;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sanad_member_token') || localStorage.getItem('sanad_token');
    const savedUser = localStorage.getItem('sanad_member_user') || localStorage.getItem('sanad_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sanad_member_token');
        localStorage.removeItem('sanad_member_user');
        setToken(null);
        setUser(null);
      }
    } else {
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sanad_member_token', newToken);
    localStorage.setItem('sanad_member_user', JSON.stringify(newUser));
    if (refreshToken) {
      localStorage.setItem('sanad_member_refresh_token', refreshToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sanad_member_token');
    localStorage.removeItem('sanad_member_user');
    localStorage.removeItem('sanad_member_refresh_token');
  };

  const updateUser = (data: Partial<User>) => {
    let base = user;
    if (!base && typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('sanad_member_user') || localStorage.getItem('sanad_user');
      if (savedUser) {
        try {
          base = JSON.parse(savedUser);
        } catch {
          base = null;
        }
      }
    }
    const updated = {
      ...(base || {}),
      ...data,
      id: data.id || data._id || base?.id || base?._id || '',
    } as User;
    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sanad_member_user', JSON.stringify(updated));
      localStorage.setItem('sanad_user', JSON.stringify(updated));
    }
  };

  const isAdmin = Boolean(user?.roles?.includes('admin'));
  const isModerator = Boolean(user?.roles?.includes('moderator'));
  const isScholar = Boolean(user?.roles?.includes('scholar') || isAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        isAdmin,
        isModerator,
        isScholar,
        login,
        logout,
        updateUser,
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
