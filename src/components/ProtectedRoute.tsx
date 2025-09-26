import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'caretaker' | 'tenant';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  // Ensure minimum loading time to prevent flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Debug logging
  console.log('ProtectedRoute state:', { isAuthenticated, user: user?.userType, loading, minLoadingTime, requiredRole, pathname: location.pathname });

  if (loading || minLoadingTime) {
    console.log('ProtectedRoute: showing loading screen');
    return (
      <div className="loading-screen" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: not authenticated, redirecting to', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.userType !== requiredRole) {
    console.log('ProtectedRoute: wrong role, redirecting from', user?.userType, 'to', `/${user?.userType}`);
    const roleBasedRedirect = `/${user?.userType}`;
    return <Navigate to={roleBasedRedirect} replace />;
  }

  console.log('ProtectedRoute: rendering children');
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

export function ManagerRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="manager">{children}</ProtectedRoute>;
}

export function CaretakerRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="caretaker">{children}</ProtectedRoute>;
}

export function TenantRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="tenant">{children}</ProtectedRoute>;
}