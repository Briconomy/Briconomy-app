import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/api.ts';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: 'admin' | 'manager' | 'caretaker' | 'tenant';
  profile?: Record<string, unknown>;
  // Extended profile information for tenants
  avatar?: string;
  joinDate?: string;
  lastLogin?: string;
  unit?: string;
  property?: string;
  rent?: number;
  leaseStart?: string;
  leaseEnd?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (userData: Record<string, unknown>) => Promise<{ success: boolean; message: string }>;
  updateUser: (userData: Partial<User>) => void;
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
          
          // Ensure extended profile fields exist for tenants
          if (parsedUser.userType === 'tenant') {
            const enhancedUser = {
              ...parsedUser,
              avatar: parsedUser.avatar || parsedUser.fullName?.substring(0, 2).toUpperCase() || 'T',
              joinDate: parsedUser.joinDate || new Date().toISOString().split('T')[0],
              lastLogin: parsedUser.lastLogin || new Date().toISOString(),
              unit: parsedUser.unit || 'N/A',
              property: parsedUser.property || 'N/A',
              rent: parsedUser.rent || 0,
              leaseStart: parsedUser.leaseStart || new Date().toISOString().split('T')[0],
              leaseEnd: parsedUser.leaseEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              emergencyContact: parsedUser.emergencyContact || {
                name: '',
                relationship: '',
                phone: ''
              }
            };
            setUser(enhancedUser);
            localStorage.setItem('briconomy_user', JSON.stringify(enhancedUser));
          } else {
            setUser(parsedUser);
          }
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
      const result: { success: boolean; message: string; user?: Record<string, unknown>; token?: string } = await authApi.login(email, password);
      
      if (result.success && result.user) {
        const raw = result.user as Record<string, unknown>;
        const id = String((raw as { _id?: unknown; id?: unknown }).id ?? (raw as { _id?: unknown })._id ?? '');
        const { _id: _ignored, ...rest } = raw as Record<string, unknown> & { _id?: unknown };
        const userWithId = { id, ...(rest as Record<string, unknown>) } as unknown as User;
        
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

  const register = async (userData: Record<string, unknown>) => {
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

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('briconomy_user', JSON.stringify(updatedUser));
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
    updateUser,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
