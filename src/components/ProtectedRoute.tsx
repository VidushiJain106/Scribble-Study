
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // If authentication is still loading, show a loading state
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If user is not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
