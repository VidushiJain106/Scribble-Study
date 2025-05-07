
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // No longer checking for authentication, simply render children
  return <>{children}</>;
};

export default ProtectedRoute;
