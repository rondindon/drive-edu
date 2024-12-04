import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Array of roles that can access the route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('supabaseToken'); // Check if user is authenticated
  const userRole = localStorage.getItem('role'); // Get user role from localStorage

  // Redirect to login if no token or user is not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to login if the user's role is not allowed
  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    return <Navigate to="/login" replace />;
  }

  // Render the children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;