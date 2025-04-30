import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MDBox from './MDBox';
import MDTypography from './MDTypography';
import { Card, CircularProgress, Divider } from '@mui/material';
import { ParseAuth, Parse } from '../services/parseService';
import { useParseInitialization } from './ParseInitializer';

/**
 * Debug component to show routing and authentication state
 * This will help us understand why the app might be hanging after login
 */
const RouteDebugger = () => {
  const location = useLocation();
  const { isInitialized } = useParseInitialization();
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    currentUser: null,
    authGuardState: null,
    tokenValid: false
  });
  
  useEffect(() => {
    // Check auth state when Parse is initialized
    if (isInitialized) {
      try {
        const isLoggedIn = ParseAuth.isLoggedIn();
        const currentUser = ParseAuth.getCurrentUser();
        const authGuardState = window.__PSYPSY_AUTH_GUARD__ || {
          checksDone: false,
          isAuthenticated: false
        };
        
        // Check if token is valid
        let tokenValid = false;
        const sessionToken = currentUser?.getSessionToken?.() || localStorage.getItem('Parse/sessionToken');
        
        if (sessionToken) {
          // Just log the token existence - don't make extra API calls
          tokenValid = true;
        }
        
        setAuthState({
          isLoggedIn,
          currentUser: currentUser ? {
            id: currentUser.id,
            username: currentUser.get('username'),
            email: currentUser.get('email')
          } : null,
          authGuardState,
          tokenValid,
          sessionToken: sessionToken ? `${sessionToken.substring(0, 5)}...` : 'None'
        });
      } catch (err) {
        console.error('Error checking auth state:', err);
      }
    }
  }, [isInitialized, location.pathname]);
  
  // If Parse is not initialized, show loading
  if (!isInitialized) {
    return (
      <Card sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, p: 2, width: 300, opacity: 0.9 }}>
        <MDTypography variant="h6" color="error">Route Debugger</MDTypography>
        <Divider sx={{ my: 1 }} />
        <MDBox display="flex" alignItems="center">
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <MDTypography variant="body2">Parse initializing...</MDTypography>
        </MDBox>
      </Card>
    );
  }
  
  return (
    <Card sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, p: 2, width: 300, opacity: 0.9 }}>
      <MDTypography variant="h6" color="info">Route Debugger</MDTypography>
      <Divider sx={{ my: 1 }} />
      
      <MDTypography variant="caption" fontWeight="bold">Current Path:</MDTypography>
      <MDTypography variant="body2" mb={1}>{location.pathname}</MDTypography>
      
      <MDTypography variant="caption" fontWeight="bold">Parse Initialized:</MDTypography>
      <MDTypography variant="body2" mb={1}>{isInitialized ? 'Yes' : 'No'}</MDTypography>
      
      <MDTypography variant="caption" fontWeight="bold">Auth State:</MDTypography>
      <MDTypography variant="body2" mb={1}>{authState.isLoggedIn ? 'Logged In' : 'Not Logged In'}</MDTypography>
      
      <MDTypography variant="caption" fontWeight="bold">AuthGuard State:</MDTypography>
      <MDTypography variant="body2" mb={1}>
        checksDone: {authState.authGuardState?.checksDone ? 'Yes' : 'No'}, 
        isAuthenticated: {authState.authGuardState?.isAuthenticated ? 'Yes' : 'No'}
      </MDTypography>
      
      <MDTypography variant="caption" fontWeight="bold">Session Token:</MDTypography>
      <MDTypography variant="body2" mb={1}>{authState.sessionToken}</MDTypography>
      
      <MDTypography variant="caption" fontWeight="bold">Token Valid:</MDTypography>
      <MDTypography variant="body2" mb={1}>{authState.tokenValid ? 'Yes' : 'No'}</MDTypography>
      
      {authState.currentUser && (
        <>
          <MDTypography variant="caption" fontWeight="bold">User:</MDTypography>
          <MDTypography variant="body2">ID: {authState.currentUser.id}</MDTypography>
          <MDTypography variant="body2">Username: {authState.currentUser.username}</MDTypography>
          <MDTypography variant="body2">Email: {authState.currentUser.email}</MDTypography>
        </>
      )}
    </Card>
  );
};

export default RouteDebugger; 