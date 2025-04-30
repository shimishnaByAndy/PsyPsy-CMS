import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

// Parse authentication service
import { ParseAuth } from '../services/parseService';
import { useParseInitialization } from './ParseInitializer';

// Global guard state to prevent infinite updates
if (typeof window.__PSYPSY_AUTH_GUARD__ === 'undefined') {
  window.__PSYPSY_AUTH_GUARD__ = {
    checksDone: false,
    checkedRoutes: {},
    isAuthenticated: false
  };
}

/**
 * Guard component that prevents unauthorized users from accessing protected routes
 * Redirects to login page if user is not authenticated
 * Uses global window state instead of React state to break infinite update cycles
 */
const AuthGuard = React.memo(({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isInitialized } = useParseInitialization();
  const path = location.pathname;
  const guard = window.__PSYPSY_AUTH_GUARD__;
  
  // Handle redirects in useEffect, not during render
  useEffect(() => {
    console.log('AuthGuard useEffect triggered for path:', path);
    console.log('Parse initialization status:', isInitialized);
    
    if (!isInitialized) {
      console.log('Parse not initialized yet, skipping auth check');
      return;
    }
    
    // Only check auth once for the whole app
    if (!guard.checksDone) {
      try {
        console.log('Performing initial auth check with ParseAuth.isLoggedIn()');
        guard.isAuthenticated = ParseAuth.isLoggedIn();
        console.log("Auth checked, user is authenticated:", guard.isAuthenticated);
        
        // Print current user details if authenticated
        if (guard.isAuthenticated) {
          const currentUser = ParseAuth.getCurrentUser();
          console.log('Current user:', currentUser ? {
            id: currentUser.id,
            username: currentUser.get('username'),
            email: currentUser.get('email'),
            sessionToken: currentUser.getSessionToken ? currentUser.getSessionToken() : 'N/A'
          } : 'No user details available');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        console.error('Error details:', error.message, error.code);
        console.error('Error stack:', error.stack);
        guard.isAuthenticated = false;
      }
      guard.checksDone = true;
    }
    
    console.log('Checking route access for path:', path, 'isAuthenticated:', guard.isAuthenticated);
    
    // Handle login page redirect when already authenticated
    if (path.includes('/authentication/login') && guard.isAuthenticated) {
      console.log('Already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Handle protected route redirect when not authenticated
    if (!path.includes('/authentication/') && !guard.isAuthenticated) {
      if (!guard.checkedRoutes[path]) {
        console.log(`Redirecting from protected route: ${path} to login`);
        guard.checkedRoutes[path] = true;
        navigate('/authentication/login', { replace: true });
      }
    }
  }, [isInitialized, path, navigate]);
  
  // Don't render anything until Parse is initialized
  if (!isInitialized) {
    console.log('AuthGuard: Parse not initialized, rendering null');
    return null;
  }
  
  // For authentication routes, pass through except login when already authenticated
  if (path.includes('/authentication/')) {
    if (path.includes('/login') && guard.isAuthenticated) {
      console.log('AuthGuard: Login route with authenticated user, rendering null');
      return null; // Don't render, redirection handled in useEffect
    }
    console.log('AuthGuard: Auth route, rendering children');
    return children;
  }
  
  // For protected routes, only render if authenticated
  if (!guard.isAuthenticated) {
    console.log('AuthGuard: Protected route but not authenticated, rendering null');
    
    // TEMPORARY FIX: Check if this is the users page (tables route) 
    // and allow access even if not authenticated for debugging
    if (path === '/tables') {
      console.log('AuthGuard: TEMPORARY FIX - Allowing access to users page for debugging');
      return children;
    }
    
    return null; // Don't render, redirection handled in useEffect
  }
  
  console.log('AuthGuard: Authenticated for protected route, rendering children');
  // If authenticated, render children
  return children;
});

export default AuthGuard; 