'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  _id?: string;
  displayName: string;
  username?: string;
  email?: string;
  phone?: string;
  roles: string[];
  bio?: string;
  avatarUrl?: string;
  institution?: string;
  specialties?: string[];
  languages?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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
    const savedToken = localStorage.getItem('sanad_member_token');
    const savedUser = localStorage.getItem('sanad_member_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sanad_member_token');
        localStorage.removeItem('sanad_member_user');
      }
    } else {
      // Default initial mock logged-in scholar experience for rich interactive demonstration
      const defaultUser: User = {
        id: 'usr-student-01',
        displayName: 'Mohammed Khizer Shaikh',
        username: 'khizer_shaikh',
        email: 'khizer@sanad.app',
        roles: ['scholar', 'member'],
        bio: 'Classical Hadith methodology researcher and software architect. Specializing in isnad transmission networks and digital pedagogical environments.',
        institution: 'Dar al-Hadith Classical Seminary',
        specialties: ['Hadith Terminology', 'Ilm al-Rijal', 'Usul al-Fiqh'],
        languages: ['English', 'Arabic', 'Urdu'],
      };
      setUser(defaultUser);
      setToken('demo_token');
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
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('sanad_member_user', JSON.stringify(updated));
  };

  const isScholar = Boolean(user?.roles?.includes('scholar'));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
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
