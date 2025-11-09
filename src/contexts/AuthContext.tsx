import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, tenantsApi } from '../services/api.ts';
import { googleLogout } from '@react-oauth/google';

interface TenantPropertyInfo {
  id: string;
  name?: string;
  address?: string;
  managerId?: string | null;
  type?: string | null;
}

interface TenantUnitInfo {
  id: string;
  unitNumber?: string;
  floor?: string | number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  status?: string | null;
}

interface TenantManagerInfo {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

interface TenantLeaseInfo {
  id: string;
  status?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  monthlyRent?: number | null;
  deposit?: number | null;
}

interface TenantContextData {
  tenantId?: string;
  property: TenantPropertyInfo | null;
  unit: TenantUnitInfo | null;
  manager: TenantManagerInfo | null;
  lease: TenantLeaseInfo | null;
  fetchedAt?: string;
}

const toStringOrNull = (value: unknown): string | null => (typeof value === 'string' && value.length > 0 ? value : null);

function enrichTenantUser(baseUser: User): User {
  if (baseUser.userType !== 'tenant') {
    return baseUser;
  }

  const contextData = baseUser.tenantContext ?? null;
  const fallbackDate = new Date().toISOString().split('T')[0];
  const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const unitNumber = contextData?.unit?.unitNumber || baseUser.unit || 'N/A';
  const propertyName = contextData?.property?.name || baseUser.property || 'N/A';

  let rentValue = 0;
  const contextRent = contextData?.lease?.monthlyRent;
  if (typeof contextRent === 'number' && Number.isFinite(contextRent)) {
    rentValue = contextRent;
  } else if (typeof contextRent === 'string') {
    const parsed = Number(contextRent);
    if (!Number.isNaN(parsed)) {
      rentValue = parsed;
    }
  }
  if (rentValue === 0) {
    if (typeof baseUser.rent === 'number' && Number.isFinite(baseUser.rent)) {
      rentValue = baseUser.rent;
    } else {
      const rawRent = (baseUser as unknown as Record<string, unknown>).rent;
      if (typeof rawRent === 'string') {
        const parsed = Number(rawRent);
        if (!Number.isNaN(parsed)) {
          rentValue = parsed;
        }
      }
    }
  }

  const startSource = contextData?.lease?.startDate ?? baseUser.leaseStart ?? fallbackDate;
  const endSource = contextData?.lease?.endDate ?? baseUser.leaseEnd ?? futureDate;
  const leaseStartValue = typeof startSource === 'string'
    ? startSource
    : startSource instanceof Date
      ? startSource.toISOString()
      : fallbackDate;
  const leaseEndValue = typeof endSource === 'string'
    ? endSource
    : endSource instanceof Date
      ? endSource.toISOString()
      : futureDate;

  const propertyFromContext = contextData?.property?.id || null;
  const assignedPropertyCandidate = toStringOrNull(baseUser.assignedPropertyId) || propertyFromContext || toStringOrNull(baseUser.propertyId) || toStringOrNull(baseUser.appliedPropertyId) || null;
  const propertyIdCandidate = toStringOrNull(baseUser.propertyId) || propertyFromContext || assignedPropertyCandidate || null;
  const unitIdCandidate = toStringOrNull(baseUser.unitId) || contextData?.unit?.id || null;
  const managerIdCandidate = toStringOrNull(baseUser.managerId) || contextData?.manager?.id || contextData?.property?.managerId || null;
  const appliedPropertyCandidate = toStringOrNull(baseUser.appliedPropertyId) || null;

  const normalizedContext = contextData
    ? {
        ...contextData,
        tenantId: contextData.tenantId || baseUser.id
      }
    : null;

  return {
    ...baseUser,
    avatar: baseUser.avatar || baseUser.fullName?.substring(0, 2).toUpperCase() || 'T',
    joinDate: baseUser.joinDate || fallbackDate,
    lastLogin: baseUser.lastLogin || new Date().toISOString(),
    unit: unitNumber,
    property: propertyName,
    rent: rentValue,
    leaseStart: leaseStartValue,
    leaseEnd: leaseEndValue,
    assignedPropertyId: assignedPropertyCandidate,
    propertyId: propertyIdCandidate,
    appliedPropertyId: appliedPropertyCandidate,
    unitId: unitIdCandidate,
    managerId: managerIdCandidate,
    tenantContext: normalizedContext,
    emergencyContact: baseUser.emergencyContact || {
      name: '',
      relationship: '',
      phone: ''
    }
  };
}
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
  assignedPropertyId?: string | null;
  propertyId?: string | null;
  appliedPropertyId?: string | null;
  unitId?: string | null;
  managerId?: string | null;
  tenantContext?: TenantContextData | null;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string; user?: User; restricted?: boolean; redirectTo?: string }>;
  register: (userData: Record<string, unknown>) => Promise<{ success: boolean; message: string }>;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  googleLogin: (credentialResponse: unknown) => Promise<{ success: boolean; message: string; user?: User }>;
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
              const enhancedUser = enrichTenantUser(parsedUser as User);
              setUser(enhancedUser);
              
              // Update in whichever storage is being used
              if (localStorage.getItem('briconomy_user')) {
                localStorage.setItem('briconomy_user', JSON.stringify(enhancedUser));
              } else if (sessionStorage.getItem('briconomy_user')) {
                sessionStorage.setItem('briconomy_user', JSON.stringify(enhancedUser));
              }
            } else {
              setUser(parsedUser as User);
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
      const result: { success: boolean; message: string; user?: Record<string, unknown>; token?: string; restricted?: boolean; redirectTo?: string } = await authApi.login(email, password);

      if (result.success && result.user) {
        const raw = result.user as Record<string, unknown>;
        const id = String((raw as { _id?: unknown; id?: unknown }).id ?? (raw as { _id?: unknown })._id ?? '');
        const { _id: _ignored, ...rest } = raw as Record<string, unknown> & { _id?: unknown };
  const baseUser = { id, ...(rest as Record<string, unknown>) } as unknown as User;
  const userWithId = enrichTenantUser(baseUser);

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
        
        return { 
          success: true, 
          message: result.message, 
          user: userWithId,
          restricted: result.restricted,
          redirectTo: result.redirectTo
        };
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
      const updatedUser = enrichTenantUser({ ...user, ...userData } as User);
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
    // Call Google's logout helper to clear any Google session state
  try { googleLogout(); } catch (_e) { /* ignore if googleLogout is unavailable */ }

    setUser(null);
    localStorage.removeItem('briconomy_user');
    localStorage.removeItem('briconomy_token');
    sessionStorage.removeItem('briconomy_user');
    sessionStorage.removeItem('briconomy_token');
  };

  const googleLogin = (_credentialResponse: unknown) => {
    try {
      const mockGoogleUser = {
        id: 'google_' + Date.now(),
        fullName: 'Google User',
        email: 'user@gmail.com',
        phone: '',
        userType: 'tenant' as const,
        avatar: 'GU',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
        unit: 'N/A',
        property: 'N/A',
        rent: 0,
        leaseStart: new Date().toISOString().split('T')[0],
        leaseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emergencyContact: { name: '', relationship: '', phone: '' }
      };

      setUser(mockGoogleUser);
      localStorage.setItem('briconomy_user', JSON.stringify(mockGoogleUser));
      localStorage.setItem('briconomy_token', 'google-token-' + Date.now());
      console.log('[AuthContext] Google login successful, saved to localStorage');

      return Promise.resolve({ success: true, message: 'Google login successful', user: mockGoogleUser });
    } catch (error) {
      console.error('[AuthContext] Google login error:', error);
      return Promise.resolve({ success: false, message: 'Google login failed. Please try again.' });
    }
  };

  useEffect(() => {
    let cancelled = false;

    const syncTenantContext = async () => {
      if (!user || user.userType !== 'tenant') {
        return;
      }
      const hasProperty = Boolean(user.tenantContext?.property?.id || user.assignedPropertyId || user.propertyId);
      const hasManager = Boolean(user.tenantContext?.manager?.id || user.managerId || user.tenantContext?.property?.managerId);
      const hasUnit = Boolean(user.tenantContext?.unit?.id || user.unitId);
      if (hasProperty && hasManager && hasUnit) {
        return;
      }
      try {
        const context = await tenantsApi.getContext(user.id) as TenantContextData;
        if (cancelled || !context) {
          return;
        }
        setUser(prev => {
          if (!prev) {
            return prev;
          }
          const merged = enrichTenantUser({ ...prev, tenantContext: context });
          if (localStorage.getItem('briconomy_user')) {
            localStorage.setItem('briconomy_user', JSON.stringify(merged));
          } else if (sessionStorage.getItem('briconomy_user')) {
            sessionStorage.setItem('briconomy_user', JSON.stringify(merged));
          }
          return merged;
        });
      } catch (error) {
        console.error('[AuthContext] Tenant context sync error:', error);
      }
    };

    syncTenantContext();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.userType, user?.tenantContext?.property?.id, user?.tenantContext?.manager?.id, user?.tenantContext?.unit?.id, user?.assignedPropertyId, user?.managerId, user?.unitId]);

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
