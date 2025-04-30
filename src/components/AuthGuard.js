import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

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
  const { isInitialized } = useParseInitialization();
  const path = location.pathname;
  const guard = window.__PSYPSY_AUTH_GUARD__;
  
  // Don't render anything until Parse is initialized
  if (!isInitialized) {
    return null;
  }
  
  // Only check auth once for the whole app
  if (!guard.checksDone) {
    try {
      guard.isAuthenticated = ParseAuth.isLoggedIn();
      console.log("Auth checked, user is authenticated:", guard.isAuthenticated);
    } catch (error) {
      console.error('Auth check error:', error);
      guard.isAuthenticated = false;
    }
    guard.checksDone = true;
  }
  
  // Skip auth check for authentication routes
  if (path.includes('/authentication/')) {
    return children;
  }
  
  // If not authenticated, redirect to login page
  if (!guard.isAuthenticated) {
    // Only redirect once
    if (!guard.checkedRoutes[path]) {
      console.log(`Redirecting from protected route: ${path} to login`);
      guard.checkedRoutes[path] = true;
      
      // Use browser history API instead of window.location to prevent full page reload
      if (window.history) {
        window.history.pushState({}, '', '/#/authentication/login');
        // Dispatch a popstate event to force React Router to notice the URL change
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        // Fallback
        window.location.replace('/#/authentication/login');
      }
    }
    
    return null;
  }
  
  // If authenticated, render children
  return children;
});

export default AuthGuard; 