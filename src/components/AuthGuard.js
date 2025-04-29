import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Parse authentication service
import { ParseAuth } from '../services/parseService';

/**
 * Guard component that prevents unauthorized users from accessing protected routes
 * Redirects to login page if user is not authenticated
 */
const AuthGuard = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      setIsLoading(true);
      const isLoggedIn = ParseAuth.isLoggedIn();
      setIsAuthenticated(isLoggedIn);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/authentication/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  return children;
};

export default AuthGuard; 