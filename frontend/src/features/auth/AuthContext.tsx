import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../types';
import { authApi } from '../../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAs: (role: 'learner' | 'trainer' | 'manager' | 'admin' | 'analyst') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('statskill_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('statskill_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
        } catch (err) {
          console.error('Session expired or invalid', err);
          localStorage.removeItem('statskill_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { access_token, user_id, full_name, role } = res.data;
      localStorage.setItem('statskill_token', access_token);
      setToken(access_token);
      
      const meRes = await authApi.getMe();
      setUser(meRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAs = async (role: 'learner' | 'trainer' | 'manager' | 'admin' | 'analyst') => {
    const creds = {
      learner: { email: 'learner@mospi.gov.in', password: 'Learner@2026' },
      trainer: { email: 'trainer@nssta.gov.in', password: 'Trainer@2026' },
      manager: { email: 'manager@mospi.gov.in', password: 'Manager@2026' },
      admin: { email: 'admin@statskill.gov.in', password: 'Admin@2026' },
      analyst: { email: 'analyst@mospi.gov.in', password: 'Analyst@2026' },
    };
    const c = creds[role];
    await login(c.email, c.password);
  };

  const logout = () => {
    localStorage.removeItem('statskill_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
