import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Role } from '../../types';
import { LoadingState } from '../common/StateFeedback';
import { AccessDenied } from '../../pages/errors/AccessDenied';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Authenticating credentials..." className="min-h-screen" />;
  }

  // Not authenticated → send to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but wrong role → show access denied (not silent redirect)
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
