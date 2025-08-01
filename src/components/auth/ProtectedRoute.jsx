import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/403" replace />;
  }

  if (requiredPermission && !user.permissions.includes(requiredPermission) && !user.permissions.includes('*')) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;