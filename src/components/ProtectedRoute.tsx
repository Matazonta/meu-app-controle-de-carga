import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedType: 'driver' | 'admin';
}

export default function ProtectedRoute({ children, allowedType }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.type !== allowedType) {
    // If a driver tries to access admin, redirect to driver dashboard
    if (user.type === 'driver' && allowedType === 'admin') {
      return <Navigate to="/driver/dashboard" replace />;
    }
    // If an admin tries to access driver (unlikely but possible), redirect to admin
    if (user.type === 'admin' && allowedType === 'driver') {
      return <Navigate to="/admin/productivity" replace />;
    }
  }

  return <>{children}</>;
}
