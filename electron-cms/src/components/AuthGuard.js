import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

// Parse authentication service
import Parse from 'parse';
import { ParseAuth } from '../services/parseService';
import { useParseInitialization } from './ParseInitializer';

/**
 * Guard component that prevents unauthorized users from accessing protected routes
 * Redirects to login page if user is not authenticated
 * Properly handles session restoration on hot reloads
 */
const AuthGuard = React.memo(({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isInitialized } = useParseInitialization();
  const path = location.pathname;
  
  // Use React state instead of global window state
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isChecking: true,
    hasChecked: false
  });
  
  // Check authentication status when Parse is initialized
  useEffect(() => {
    if (!isInitialized) {
      console.log('AuthGuard: Parse not initialized yet, waiting...');
      return;
    }
    
    if (authState.hasChecked) {
      console.log('AuthGuard: Auth already checked, skipping duplicate check');
      return;
    }
    
    const checkAuthStatus = async () => {
      console.log('AuthGuard: Checking authentication status...');
      setAuthState(prev => ({ ...prev, isChecking: true }));
      
      try {
        // First check if there's a current user
        let currentUser = Parse.User.current();
        console.log('AuthGuard: Current user from Parse.User.current():', currentUser ? 'Found' : 'None');
        
        // If no current user, try to restore from session token
        if (!currentUser) {
          const sessionToken = localStorage.getItem('Parse/sessionToken');
          if (sessionToken) {
            console.log('AuthGuard: No current user but session token found, attempting restore...');
            try {
              currentUser = await Parse.User.become(sessionToken);
              console.log('AuthGuard: Session restored successfully for user:', currentUser?.getUsername());
            } catch (sessionError) {
              console.error('AuthGuard: Failed to restore session:', sessionError.message);
              // Clean up invalid session token
              localStorage.removeItem('Parse/sessionToken');
              currentUser = null;
            }
          }
        }
        
        const isAuthenticated = !!currentUser;
        console.log('AuthGuard: Final authentication status:', isAuthenticated);
        
        if (isAuthenticated) {
          console.log('AuthGuard: User details:', {
            id: currentUser.id,
            username: currentUser.get('username'),
            email: currentUser.get('email'),
            sessionToken: currentUser.getSessionToken?.() || 'N/A'
          });
        }
        
        setAuthState({
          isAuthenticated,
          isChecking: false,
          hasChecked: true
        });
        
      } catch (error) {
        console.error('AuthGuard: Error checking authentication:', error);
        setAuthState({
          isAuthenticated: false,
          isChecking: false,
          hasChecked: true
        });
      }
    };
    
    checkAuthStatus();
  }, [isInitialized, authState.hasChecked]);
  
  // Handle navigation based on auth state
  useEffect(() => {
    if (!isInitialized || authState.isChecking) {
      return;
    }
    
    console.log('AuthGuard: Navigation check for path:', path, 'isAuthenticated:', authState.isAuthenticated);
    
    // Handle login page redirect when already authenticated
    if (path.includes('/authentication/login') && authState.isAuthenticated) {
      console.log('AuthGuard: Already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Handle protected route redirect when not authenticated
    if (!path.includes('/authentication/') && !authState.isAuthenticated) {
      console.log('AuthGuard: Not authenticated, redirecting to login');
      navigate('/authentication/login', { replace: true });
      return;
    }
  }, [isInitialized, authState.isAuthenticated, authState.isChecking, path, navigate]);
  
  // Don't render anything until Parse is initialized and auth is checked
  if (!isInitialized || authState.isChecking) {
    console.log('AuthGuard: Still initializing or checking auth, rendering null');
    return null;
  }
  
  // DEVELOPMENT MODE: Log but don't bypass authentication
  if (process.env.NODE_ENV === 'development') {
    console.log('AuthGuard: Development mode - auth status:', authState.isAuthenticated);
    // Don't bypass authentication in development - this was masking the real issue
  }
  
  // For authentication routes, pass through except login when already authenticated
  if (path.includes('/authentication/')) {
    if (path.includes('/login') && authState.isAuthenticated) {
      console.log('AuthGuard: Login route with authenticated user, rendering null (redirect handled above)');
      return null;
    }
    console.log('AuthGuard: Auth route, rendering children');
    return children;
  }
  
  // For protected routes, only render if authenticated
  if (!authState.isAuthenticated) {
    console.log('AuthGuard: Protected route but not authenticated, rendering null (redirect handled above)');
    return null;
  }
  
  console.log('AuthGuard: Authenticated for protected route, rendering children');
  return children;
});

export default AuthGuard; 