import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ProspectiveTenantSession {
  searchPreferences: {
    searchTerm: string;
    selectedType: string;
    priceRange: { min: string; max: string };
  };
  viewedProperties: string[];
  lastActivity: Date | null;
}

interface ProspectiveTenantContextType {
  session: ProspectiveTenantSession;
  updateSearchPreferences: (preferences: { searchTerm: string; selectedType: string; priceRange: { min: string; max: string } }) => void;
  addViewedProperty: (propertyId: string) => void;
  clearSession: () => void;
  isActive: boolean;
}

const ProspectiveTenantContext = createContext<ProspectiveTenantContextType | undefined>(undefined);

export function useProspectiveTenant() {
  const context = useContext(ProspectiveTenantContext);
  if (context === undefined) {
    throw new Error('useProspectiveTenant must be used within a ProspectiveTenantProvider');
  }
  return context;
}

interface ProspectiveTenantProviderProps {
  children: ReactNode;
}

export function ProspectiveTenantProvider({ children }: ProspectiveTenantProviderProps) {
  const [session, setSession] = useState<ProspectiveTenantSession>({
    searchPreferences: {
      searchTerm: '',
      selectedType: 'all',
      priceRange: { min: '', max: '' }
    },
    viewedProperties: [],
    lastActivity: null
  });

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('briconomy_prospective_tenant_session');
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        // Convert lastActivity back to Date object
        if (parsedSession.lastActivity) {
          parsedSession.lastActivity = new Date(parsedSession.lastActivity);
        }
        setSession(parsedSession);
      }
    } catch (error) {
      console.error('Error loading prospective tenant session:', error);
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('briconomy_prospective_tenant_session', JSON.stringify(session));
    } catch (error) {
      console.error('Error saving prospective tenant session:', error);
    }
  }, [session]);

  // Check if session is active (last activity within 24 hours)
  const isActive = session.lastActivity && 
    (Date.now() - session.lastActivity.getTime()) < (24 * 60 * 60 * 1000);

  const updateSearchPreferences = (preferences: { 
    searchTerm: string; 
    selectedType: string; 
    priceRange: { min: string; max: string } 
  }) => {
    setSession(prev => ({
      ...prev,
      searchPreferences: preferences,
      lastActivity: new Date()
    }));
  };

  const addViewedProperty = (propertyId: string) => {
    setSession(prev => ({
      ...prev,
      viewedProperties: prev.viewedProperties.includes(propertyId) 
        ? prev.viewedProperties 
        : [...prev.viewedProperties, propertyId],
      lastActivity: new Date()
    }));
  };

  const clearSession = () => {
    setSession({
      searchPreferences: {
        searchTerm: '',
        selectedType: 'all',
        priceRange: { min: '', max: '' }
      },
      viewedProperties: [],
      lastActivity: null
    });
    localStorage.removeItem('briconomy_prospective_tenant_session');
  };

  const value = {
    session,
    updateSearchPreferences,
    addViewedProperty,
    clearSession,
    isActive
  };

  return (
    <ProspectiveTenantContext.Provider value={value}>
      {children}
    </ProspectiveTenantContext.Provider>
  );
}
