import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: 'admin' | 'manager' | 'caretaker' | 'tenant';
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (userData: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('briconomy_user');
      const token = localStorage.getItem('briconomy_token');
      
      if (savedUser && token) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('briconomy_user');
          localStorage.removeItem('briconomy_token');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError('Auth initialization failed');
    } finally {
      setLoading(false);
    }
  }, []);

  if (error) {
    console.warn('AuthProvider error:', error);
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password);
      
      if (result.success && result.user) {
        // Convert MongoDB _id to id field for frontend consistency
        const userWithId = {
          ...result.user,
          id: result.user._id || result.user.id
        };
        
        setUser(userWithId);
        localStorage.setItem('briconomy_user', JSON.stringify(userWithId));
        localStorage.setItem('briconomy_token', result.token || 'mock-token');
        return { success: true, message: result.message, user: userWithId };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData: any) => {
    try {
      const result = await authApi.register(userData);
      
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('briconomy_user');
    localStorage.removeItem('briconomy_token');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
