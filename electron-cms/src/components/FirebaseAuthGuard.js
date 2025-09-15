/**
 * Firebase Auth Guard Component
 * 
 * Replaces Parse-based AuthGuard with Firebase authentication
 * Manages route protection and authentication state
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import firebaseAuthService from '../services/firebaseAuthService';

/**
 * Loading indicator component
 */
const AuthLoadingIndicator = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    flexDirection: 'column'
  }}>
    <div style={{
      width: '30px',
      height: '30px',
      border: '3px solid #899581',
      borderTop: '3px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ color: '#666', marginTop: '16px', fontSize: '14px' }}>
      Checking authentication...
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/**
 * Firebase Auth Guard Component
 * 
 * Protects routes based on Firebase authentication state
 * Handles automatic redirects and session restoration
 */
const FirebaseAuthGuard = React.memo(({ children, requireRole = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  
  const [authState, setAuthState] = useState({
    user: null,
    profile: null,
    isAuthenticated: false,
    isChecking: true,
    hasChecked: false,
    error: null
  });

  useEffect(() => {
    if (authState.hasChecked && !authState.isChecking) {
      console.log('FirebaseAuthGuard: Auth already checked, skipping');
      return;
    }

    console.log('FirebaseAuthGuard: Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('FirebaseAuthGuard: Auth state changed:', firebaseUser ? 'User found' : 'No user');
      
      try {
        if (firebaseUser) {
          // User is authenticated, get profile
          try {
            const userProfile = await firebaseAuthService.getUserProfile(firebaseUser.uid);
            
            console.log('FirebaseAuthGuard: User authenticated:', {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userProfile.role,
              emailVerified: firebaseUser.emailVerified
            });
            
            setAuthState({
              user: firebaseUser,
              profile: userProfile,
              isAuthenticated: true,
              isChecking: false,
              hasChecked: true,
              error: null
            });
          } catch (profileError) {
            console.error('FirebaseAuthGuard: Error loading user profile:', profileError);
            
            // Still set as authenticated but without profile
            setAuthState({
              user: firebaseUser,
              profile: null,
              isAuthenticated: true,
              isChecking: false,
              hasChecked: true,
              error: profileError.message
            });
          }
        } else {
          // No user authenticated
          console.log('FirebaseAuthGuard: No authenticated user');
          
          setAuthState({
            user: null,
            profile: null,
            isAuthenticated: false,
            isChecking: false,
            hasChecked: true,
            error: null
          });
        }
      } catch (error) {
        console.error('FirebaseAuthGuard: Auth state error:', error);
        
        setAuthState({
          user: null,
          profile: null,
          isAuthenticated: false,
          isChecking: false,
          hasChecked: true,
          error: error.message
        });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('FirebaseAuthGuard: Cleaning up auth listener');
      unsubscribe();
    };
  }, [authState.hasChecked, authState.isChecking]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!authState.hasChecked || authState.isChecking) {
      return;
    }

    console.log('FirebaseAuthGuard: Navigation check for path:', path, {
      isAuthenticated: authState.isAuthenticated,
      userRole: authState.profile?.role,
      requireRole
    });

    // Handle login page redirect when already authenticated
    if (path.includes('/authentication/login') && authState.isAuthenticated) {
      console.log('FirebaseAuthGuard: Already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }

    // Handle protected route redirect when not authenticated
    if (!path.includes('/authentication/') && !authState.isAuthenticated) {
      console.log('FirebaseAuthGuard: Not authenticated, redirecting to login');
      navigate('/authentication/login', { 
        replace: true, 
        state: { from: location } 
      });
      return;
    }

    // Handle role-based access control
    if (requireRole && authState.isAuthenticated && authState.profile) {
      if (authState.profile.role !== requireRole) {
        console.log('FirebaseAuthGuard: Insufficient permissions, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [
    authState.hasChecked, 
    authState.isChecking, 
    authState.isAuthenticated, 
    authState.profile, 
    path, 
    navigate, 
    location, 
    requireRole
  ]);

  // Show loading while checking authentication
  if (!authState.hasChecked || authState.isChecking) {
    return <AuthLoadingIndicator />;
  }

  // Show error if there's an authentication error (but still allow access)
  if (authState.error && authState.isAuthenticated) {
    console.warn('FirebaseAuthGuard: Authentication error but user is authenticated:', authState.error);
  }

  // For authentication routes (login, etc.)
  if (path.includes('/authentication/')) {
    // Don't render login if already authenticated (redirect handled above)
    if (path.includes('/login') && authState.isAuthenticated) {
      return null;
    }
    
    console.log('FirebaseAuthGuard: Rendering authentication route');
    return children;
  }

  // For protected routes
  if (!authState.isAuthenticated) {
    console.log('FirebaseAuthGuard: Protected route but not authenticated');
    return null; // Redirect handled above
  }

  // Role-based access control
  if (requireRole && authState.profile && authState.profile.role !== requireRole) {
    console.log('FirebaseAuthGuard: Role requirement not met');
    return null; // Redirect handled above
  }

  console.log('FirebaseAuthGuard: Access granted, rendering children');
  return children;
});

// Higher-order components for specific roles
export const AdminGuard = ({ children }) => (
  <FirebaseAuthGuard requireRole="admin">
    {children}
  </FirebaseAuthGuard>
);

export const ProfessionalGuard = ({ children }) => (
  <FirebaseAuthGuard requireRole="professional">
    {children}
  </FirebaseAuthGuard>
);

export const ClientGuard = ({ children }) => (
  <FirebaseAuthGuard requireRole="client">
    {children}
  </FirebaseAuthGuard>
);

export default FirebaseAuthGuard;