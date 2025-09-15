import React from 'react';
import { useNavigate } from 'react-router-dom';
import Parse from 'parse';
import MDBox from './MDBox';
import MDButton from './MDButton';
import MDTypography from './MDTypography';

const SessionReset = () => {
  const navigate = useNavigate();

  const clearSessionAndRedirect = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Log out current Parse user
      if (Parse.User.current()) {
        Parse.User.logOut();
      }
      
      console.log('Session cleared successfully');
      
      // Redirect to login
      navigate('/authentication/login', { replace: true });
      
      // Reload the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Error clearing session:', error);
      // Force reload as fallback
      window.location.reload();
    }
  };

  const debugInfo = () => {
    console.log('=== SESSION DEBUG INFO ===');
    console.log('Current User:', Parse.User.current());
    console.log('Session Token:', localStorage.getItem('Parse/sessionToken'));
    console.log('Remember Me:', localStorage.getItem('psypsy_remember_me'));
    console.log('Parse Config:', {
      appId: Parse.applicationId,
      serverURL: Parse.serverURL,
      jsKey: Parse.javaScriptKey ? 'Set' : 'Not set'
    });
    console.log('========================');
  };

  return (
    <MDBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
    >
      <MDTypography variant="h4" mb={2} color="error">
        Session Error Detected
      </MDTypography>
      
      <MDTypography variant="body1" mb={3} textAlign="center" maxWidth="500px">
        There seems to be an issue with your authentication session. 
        This usually happens when the session token has expired or is invalid.
      </MDTypography>
      
      <MDBox display="flex" gap={2} mb={2}>
        <MDButton 
          variant="gradient" 
          color="info" 
          onClick={clearSessionAndRedirect}
        >
          Clear Session & Login
        </MDButton>
        
        <MDButton 
          variant="outlined" 
          color="secondary" 
          onClick={debugInfo}
        >
          Debug Info (Check Console)
        </MDButton>
      </MDBox>
      
      <MDTypography variant="caption" color="text" textAlign="center">
        Click "Clear Session & Login" to reset your authentication and redirect to the login page.
      </MDTypography>
    </MDBox>
  );
};

export default SessionReset; 