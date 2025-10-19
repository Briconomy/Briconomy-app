import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/api.ts';
import { googleLogout } from '@react-oauth/google';

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (userData: Record<string, unknown>) => Promise<{ success: boolean; message: string }>;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  googleLogin: (credentialResponse: { credential?: string }) => Promise<{ success: boolean; message: string; user?: User }>;
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
    const initializeAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));

      try {
        // Check localStorage first (Remember Me), then sessionStorage (current session)
        const savedUser = localStorage.getItem('briconomy_user') || sessionStorage.getItem('briconomy_user');
        const token = localStorage.getItem('briconomy_token') || sessionStorage.getItem('briconomy_token');

        console.log('[AuthContext] Initializing auth, savedUser:', !!savedUser, 'token:', !!token);

        if (savedUser && token) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log('[AuthContext] Restoring user session:', parsedUser.fullName, parsedUser.userType);

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
              
              // Update in whichever storage is being used
              if (localStorage.getItem('briconomy_user')) {
                localStorage.setItem('briconomy_user', JSON.stringify(enhancedUser));
              } else if (sessionStorage.getItem('briconomy_user')) {
                sessionStorage.setItem('briconomy_user', JSON.stringify(enhancedUser));
              }
            } else {
              setUser(parsedUser);
            }
          } catch (error) {
            console.error('[AuthContext] Error parsing saved user:', error);
            localStorage.removeItem('briconomy_user');
            localStorage.removeItem('briconomy_token');
          }
        } else {
          console.log('[AuthContext] No saved session found');
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
        setError('Auth initialization failed');
      } finally {
        setLoading(false);
        console.log('[AuthContext] Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  if (error) {
    console.warn('AuthProvider error:', error);
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const result: { success: boolean; message: string; user?: Record<string, unknown>; token?: string } = await authApi.login(email, password);

      if (result.success && result.user) {
        const raw = result.user as Record<string, unknown>;
        const id = String((raw as { _id?: unknown; id?: unknown }).id ?? (raw as { _id?: unknown })._id ?? '');
        const { _id: _ignored, ...rest } = raw as Record<string, unknown> & { _id?: unknown };
        const userWithId = { id, ...(rest as Record<string, unknown>) } as unknown as User;

        setUser(userWithId);
        
        // Only save to localStorage if rememberMe is true
        if (rememberMe) {
          localStorage.setItem('briconomy_user', JSON.stringify(userWithId));
          localStorage.setItem('briconomy_token', result.token || 'mock-token');
          console.log('[AuthContext] Login successful, saved to localStorage (Remember Me):', userWithId.fullName, userWithId.userType);
        } else {
          // Use sessionStorage for non-persistent sessions
          sessionStorage.setItem('briconomy_user', JSON.stringify(userWithId));
          sessionStorage.setItem('briconomy_token', result.token || 'mock-token');
          console.log('[AuthContext] Login successful, saved to sessionStorage (current session only):', userWithId.fullName, userWithId.userType);
        }
        
        return { success: true, message: result.message, user: userWithId };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
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
      
      // Update in whichever storage is being used
      if (localStorage.getItem('briconomy_user')) {
        localStorage.setItem('briconomy_user', JSON.stringify(updatedUser));
      } else if (sessionStorage.getItem('briconomy_user')) {
        sessionStorage.setItem('briconomy_user', JSON.stringify(updatedUser));
      }
    }
  };

  const logout = () => {
    try { googleLogout(); } catch (_e) { /* ignore if googleLogout is unavailable */ }
    setUser(null);
    localStorage.removeItem('briconomy_user');
    localStorage.removeItem('briconomy_token');
    sessionStorage.removeItem('briconomy_user');
    sessionStorage.removeItem('briconomy_token');
  };

  const googleLogin = async (credentialResponse: { credential?: string }) => {
    try {
      if (!credentialResponse.credential) {
        console.error('[AuthContext] No credential in response');
        return Promise.resolve({ success: false, message: 'No credential received from Google' });
      }

      const response = await fetch('http://localhost:8000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          credential: credentialResponse.credential 
        }),
      });

      const result: { success: boolean; message: string; user?: Record<string, unknown>; token?: string } = await response.json();

      if (result.success && result.user) {
        const raw = result.user as Record<string, unknown>;
        const id = String((raw as { _id?: unknown; id?: unknown }).id ?? (raw as { _id?: unknown })._id ?? '');
        const { _id: _ignored, ...rest } = raw as Record<string, unknown> & { _id?: unknown };
        const userWithId = { id, ...(rest as Record<string, unknown>) } as unknown as User;

        if (userWithId.userType === 'tenant') {
          const userRecord = userWithId as unknown as Record<string, unknown>;
          const enhancedUser = {
            ...userWithId,
            avatar: (userRecord.googlePicture as string | undefined) || userWithId.fullName?.substring(0, 2).toUpperCase() || 'T',
            joinDate: (userRecord.createdAt as string | undefined) || new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString(),
            unit: 'N/A',
            property: 'N/A',
            rent: 0,
            leaseStart: new Date().toISOString().split('T')[0],
            leaseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            emergencyContact: { name: '', relationship: '', phone: '' }
          };
          setUser(enhancedUser);
          localStorage.setItem('briconomy_user', JSON.stringify(enhancedUser));
          localStorage.setItem('briconomy_token', result.token || 'google-token');
        } else {
          setUser(userWithId);
          localStorage.setItem('briconomy_user', JSON.stringify(userWithId));
          localStorage.setItem('briconomy_token', result.token || 'google-token');
        }

        console.log('[AuthContext] Google login successful, saved to localStorage');
        return Promise.resolve({ success: true, message: 'Google login successful', user: userWithId });
      } else {
        return Promise.resolve({ success: false, message: result.message });
      }
    } catch (error) {
      console.error('[AuthContext] Google login error:', error);
      return Promise.resolve({ success: false, message: 'Google login failed. Please try again.' });
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    updateUser,
    logout,
    googleLogin,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
