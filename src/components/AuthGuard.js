import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Parse authentication service
import { ParseAuth, Parse } from '../services/parseService';
import { useParseInitialization } from './ParseInitializer';

/**
 * Guard component that prevents unauthorized users from accessing protected routes
 * Redirects to login page if user is not authenticated
 */
const AuthGuard = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized } = useParseInitialization();

  useEffect(() => {
    // Only check auth status when Parse is initialized
    if (!isInitialized) {
      return;
    }

    // Check authentication status
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        // Use the safer isLoggedIn method from ParseAuth
        const isLoggedIn = ParseAuth.isLoggedIn();
        setIsAuthenticated(isLoggedIn);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isInitialized]);

  // Show nothing while checking authentication or waiting for Parse to initialize
  if (isLoading || !isInitialized) {
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