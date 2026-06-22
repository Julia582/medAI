'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: { documents: number; chats: number };
  recentChats: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {
      api.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) fetchUser();
    else setLoading(false);
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const tokens = await api.login({ email, password });
    api.setTokens(tokens.accessToken, tokens.refreshToken);
    await fetchUser();
  };

  const register = async (name: string, email: string, password: string) => {
    const tokens = await api.register({ name, email, password });
    api.setTokens(tokens.accessToken, tokens.refreshToken);
    await fetchUser();
  };

  const logout = () => {
    api.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
