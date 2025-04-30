import React, { useState, useEffect } from 'react';
import { UserService, Parse, ParseAuth } from '../services/parseService';
import MDBox from './MDBox';
import MDTypography from './MDTypography';
import MDButton from './MDButton';
import { Card, CircularProgress, Chip, Divider, Grid, TextField } from '@mui/material';

/**
 * Test component to verify Parse user data connectivity
 * This component makes a direct call to the UserService to fetch users
 * and displays the results, bypassing the normal route-based access
 */
const TestUserData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  
  // Check if Parse is initialized on mount
  useEffect(() => {
    const checkParseStatus = () => {
      try {
        const appId = Parse.applicationId;
        const serverUrl = Parse.serverURL;
        
        if (appId && serverUrl) {
          console.log('Parse appears to be initialized:', { appId, serverUrl });
          setConnectionStatus('initialized');
        } else {
          console.log('Parse does not appear to be fully initialized');
          setConnectionStatus('not_initialized');
        }
      } catch (err) {
        console.error('Error checking Parse status:', err);
        setConnectionStatus('error');
      }
    };
    
    checkParseStatus();
  }, []);
  
  // Define a maximum number of retries and a delay between retries
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;
  
  // Function to fetch user data directly with retry mechanism
  const fetchUsers = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('TestUserData: Attempting to fetch users directly');
      
      // First check if user is authenticated
      const isLoggedIn = ParseAuth.isLoggedIn();
      const currentUser = ParseAuth.getCurrentUser();
      const sessionToken = currentUser?.getSessionToken?.();
      
      console.log('User authentication check:', { 
        isLoggedIn, 
        sessionToken: sessionToken ? `${sessionToken.substring(0, 5)}...` : 'None',
        userId: currentUser?.id
      });
      
      if (!isLoggedIn || !currentUser) {
        throw new Error('You must be logged in to fetch user data');
      }
      
      setConnectionStatus('connecting');
      
      const { stats, userTypes } = await Parse.Cloud.run("fetchUsers");
      
      // Log the stats and user types
      console.log('User Stats:', stats);
      console.log('Users by Type:', userTypes);
      
      // Set users from the userTypes object
      setUsers(userTypes.all || []); // Assuming you want to display all users
      setConnectionStatus('connected');
    } catch (err) {
      console.error('TestUserData: Error fetching users:', err);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying fetch users... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        setTimeout(() => fetchUsers(retryCount + 1), RETRY_DELAY_MS);
      } else {
        setError(err.message || 'Failed to fetch user data');
        setConnectionStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Render connection status chip
  const renderStatusChip = () => {
    const statusMap = {
      unknown: { label: 'Status Unknown', color: 'default' },
      initialized: { label: 'Parse Initialized', color: 'info' },
      not_initialized: { label: 'Parse Not Initialized', color: 'warning' },
      connecting: { label: 'Connecting...', color: 'warning' },
      connected: { label: 'Connected', color: 'success' },
      error: { label: 'Connection Error', color: 'error' }
    };
    
    const status = statusMap[connectionStatus] || statusMap.unknown;
    
    return (
      <Chip 
        label={status.label} 
        color={status.color} 
        size="small" 
        sx={{ mb: 2 }}
      />
    );
  };
  
  // Render Parse server info
  const renderServerInfo = () => {
    try {
      return (
        <MDBox mt={2} mb={2}>
          <MDTypography variant="caption" fontWeight="bold">Parse Server Configuration:</MDTypography>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Server URL"
                value={Parse.serverURL || 'Not set'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="App ID"
                value={Parse.applicationId ? 
                  `...${Parse.applicationId.substring(Parse.applicationId.length - 4)}` : 
                  'Not set'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="JavaScript Key"
                value={Parse.javaScriptKey ? 
                  `...${Parse.javaScriptKey.substring(Parse.javaScriptKey.length - 4)}` : 
                  'Not set'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                margin="dense"
              />
            </Grid>
          </Grid>
        </MDBox>
      );
    } catch (err) {
      return (
        <MDBox mt={2} mb={2}>
          <MDTypography variant="caption" color="error">
            Error reading Parse configuration: {err.message}
          </MDTypography>
        </MDBox>
      );
    }
  };
  
  // Render the test component
  return (
    <Card sx={{ p: 3, m: 2 }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MDTypography variant="h5">
          Parse Connection Tester
        </MDTypography>
        {renderStatusChip()}
      </MDBox>
      
      {renderServerInfo()}
      
      <Divider sx={{ mb: 2 }} />
      
      <MDBox mb={2}>
        <MDButton variant="contained" color="info" onClick={fetchUsers} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch User Data Directly'}
        </MDButton>
      </MDBox>
      
      {loading && (
        <MDBox display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </MDBox>
      )}
      
      {error && (
        <MDBox p={2} bgcolor="error.main" color="white" borderRadius={1}>
          <MDTypography variant="body2" color="white" fontWeight="bold">
            Error:
          </MDTypography>
          <MDTypography variant="body2" color="white">
            {error}
          </MDTypography>
          <MDTypography variant="caption" color="white" fontStyle="italic" mt={1}>
            Note: The app is displaying mock data because it couldn't fetch real user data.
          </MDTypography>
        </MDBox>
      )}
      
      {!loading && users.length > 0 && (
        <MDBox>
          <MDTypography variant="body1" mb={2}>
            Successfully loaded {users.length} users:
          </MDTypography>
          
          {users.map(user => (
            <MDBox 
              key={user.id} 
              p={2} 
              mb={1} 
              bgcolor="background.paper" 
              borderRadius={1}
              boxShadow={1}
            >
              <MDTypography variant="subtitle2">
                {user.username} - {user.email}
              </MDTypography>
              <MDTypography variant="caption" color="text.secondary">
                Type: {user.userType === 0 ? 'Admin' : 
                      user.userType === 1 ? 'Professional' : 
                      user.userType === 2 ? 'Client' : 'Unknown'}
              </MDTypography>
            </MDBox>
          ))}
        </MDBox>
      )}
      
      {!loading && !error && users.length === 0 && (
        <MDBox p={2} bgcolor="info.light" borderRadius={1}>
          <MDTypography variant="body2">
            No user data loaded yet. Click the button above to test the connection.
          </MDTypography>
        </MDBox>
      )}
    </Card>
  );
};

export default TestUserData; 