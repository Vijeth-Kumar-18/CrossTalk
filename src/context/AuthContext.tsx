'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/clashTypes';
import { DEMO_USERS } from '@/constants/appConstants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  demoLogin: (userId: string) => Promise<boolean>;
  signup: (data: { email: string; fullName: string; preferredLanguage: string }) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  demoLogin: async () => false,
  signup: async () => false,
  logout: () => {},
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted session
    try {
      const stored = localStorage.getItem('crosstalk_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to Marco for immediate out-of-the-box experience
        const defaultUser: User = {
          id: DEMO_USERS[0].id,
          email: DEMO_USERS[0].email,
          full_name: DEMO_USERS[0].fullName,
          preferred_language: DEMO_USERS[0].preferredLanguage,
        };
        setUser(defaultUser);
        localStorage.setItem('crosstalk_user', JSON.stringify(defaultUser));
      }
    } catch {
      // Storage error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('crosstalk_user', JSON.stringify(data.user));
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const demoLogin = async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo', userId }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('crosstalk_user', JSON.stringify(data.user));
        return true;
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
    return false;
  };

  const signup = async (data: { email: string; fullName: string; preferredLanguage: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: data.email,
          fullName: data.fullName,
          preferredLanguage: data.preferredLanguage,
        }),
      });
      const json = await res.json();
      if (json.success && json.user) {
        setUser(json.user);
        localStorage.setItem('crosstalk_user', JSON.stringify(json.user));
        return true;
      }
    } catch (err) {
      console.error('Signup error:', err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('crosstalk_user');
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, demoLogin, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
