import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const { user: userResponse } = response.data;
      setUser(userResponse);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('access_token', access_token);
      setUser(userData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (username: string, email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('access_token', access_token);
      setUser(userData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
