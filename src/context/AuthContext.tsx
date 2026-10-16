'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/clashTypes';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    email: string;
    password: string;
    fullName: string;
    preferredLanguage: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  setUser: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('crosstalk_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.email) {
          setUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem('crosstalk_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('crosstalk_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials.' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Connection failed. Please try again.' };
    }
  };

  const signup = async (data: {
    email: string;
    password: string;
    fullName: string;
    preferredLanguage: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          preferredLanguage: data.preferredLanguage,
        }),
      });
      const json = await res.json();
      if (json.success && json.user) {
        setUser(json.user);
        localStorage.setItem('crosstalk_user', JSON.stringify(json.user));
        return { success: true };
      }
      return { success: false, error: json.error || 'Registration failed.' };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'Connection failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('crosstalk_user');
    } catch {
      // ignore
    }
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    try {
      localStorage.setItem('crosstalk_user', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
