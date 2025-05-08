
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotesInitializer } from '@/lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // If authentication is still loading, show a loading state
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span className="ml-2">Loading...</span>
    </div>;
  }
  
  // If user is not authenticated, redirect to the landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated, render the protected content
  return (
    <>
      <NotesInitializer />
      {children}
    </>
  );
};

export default ProtectedRoute;
