'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  role: 'Admin' | 'User';
  createdAt: string;
  isNewAccount?: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name: string, isNew?: boolean) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const SESSION_KEY = 'creatortracker_session';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string, isNew: boolean = false) => {
    const newUser: User = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      avatar: name.substring(0, 2).toUpperCase(),
      status: 'online',
      role: 'Admin',
      createdAt: new Date().toISOString(),
      isNewAccount: isNew,
    };
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    window.location.href = '/auth';
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
