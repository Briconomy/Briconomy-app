import React from 'react';
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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.userType !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleBasedRedirect = `/${user?.userType}`;
    return <Navigate to={roleBasedRedirect} replace />;
  }

  return <>{children}</>;
}

// Role-based protected routes
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