import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  role: 'caregiver' | 'employer' | 'admin';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  role: 'caregiver' | 'employer' | 'admin' | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ role: string }>;
  register: (email: string, password: string, role: string) => Promise<{ role: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('caregap_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('caregap_token');
      const savedUser = localStorage.getItem('caregap_user');
      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (e) {
          localStorage.removeItem('caregap_token');
          localStorage.removeItem('caregap_user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, role, user_id } = res.data;
    const userData: User = { id: user_id, email, role };
    
    localStorage.setItem('caregap_token', access_token);
    localStorage.setItem('caregap_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return { role };
  };

  const register = async (email: string, password: string, role: string) => {
    const res = await api.post('/auth/register', { email, password, role });
    const { access_token, role: userRole, user_id } = res.data;
    const userData: User = { id: user_id, email, role: userRole };

    localStorage.setItem('caregap_token', access_token);
    localStorage.setItem('caregap_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return { role: userRole };
  };

  const logout = () => {
    localStorage.removeItem('caregap_token');
    localStorage.removeItem('caregap_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
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

