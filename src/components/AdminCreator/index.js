import React, { useState } from 'react';
import { ParseAuth, ParseData } from '../../services/parseService';
import Parse from 'parse';

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

/**
 * AdminCreator Component
 * A utility component to create admin users through the React app
 */
const AdminCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const createAdminUser = async () => {
    setIsCreating(true);
    setResult(null);
    setError(null);

    try {
      console.log('🚀 Starting admin user creation...');
      
      // Admin user details
      const adminData = {
        username: 'andy@admin.ca',
        email: 'andy@admin.ca',
        password: 'aaaaaa',
        userType: 0, // Admin type
        roleNames: ['admin'],
        emailVerified: true,
        isBlocked: false
      };

      // Check if user already exists using Parse Query
      console.log('🔍 Checking if admin user already exists...');
      
      try {
        const existingUserQuery = new Parse.Query(Parse.User);
        existingUserQuery.equalTo('username', adminData.username);
        const existingUser = await existingUserQuery.first();
        
        if (existingUser) {
          setResult({
            success: true,
            message: 'Admin user already exists',
            user: {
              id: existingUser.id,
              username: existingUser.get('username'),
              email: existingUser.get('email'),
              userType: existingUser.get('userType'),
              roleNames: existingUser.get('roleNames'),
              createdAt: existingUser.get('createdAt')
            }
          });
          setIsCreating(false);
          return;
        }
      } catch (checkError) {
        console.log('Could not check for existing user, proceeding with creation...');
      }

      // Create new admin user using Parse SDK
      console.log('👤 Creating new admin user using Parse SDK...');
      
      const user = new Parse.User();
      user.set('username', adminData.username);
      user.set('email', adminData.email);
      user.set('password', adminData.password);
      user.set('userType', adminData.userType);
      user.set('roleNames', adminData.roleNames);
      user.set('emailVerified', adminData.emailVerified);
      user.set('isBlocked', adminData.isBlocked);

      // Sign up the user
      const savedUser = await user.signUp();
      
      setResult({
        success: true,
        message: 'Admin user created successfully!',
        user: {
          id: savedUser.id,
          username: savedUser.get('username'),
          email: savedUser.get('email'),
          userType: savedUser.get('userType'),
          roleNames: savedUser.get('roleNames'),
          createdAt: savedUser.get('createdAt')
        }
      });

      console.log('🎉 Admin user created successfully!');

    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      
      let errorMessage = error.message;
      
      if (error.code === 202) {
        errorMessage = 'Username is already taken.';
      } else if (error.code === 203) {
        errorMessage = 'Email is already taken.';
      } else if (error.code === 101) {
        errorMessage = 'Invalid username/password format or user already exists.';
      } else if (error.message && error.message.includes('unauthorized')) {
        errorMessage = 'Unauthorized. Check Parse server configuration.';
      } else if (error.message && error.message.includes('Unable to connect')) {
        errorMessage = 'Cannot connect to Parse server. Check if server is running.';
      }
      
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MDBox>
      <Card sx={{ p: 3, mb: 3 }}>
        <MDTypography variant="h6" fontWeight="medium" color="text" mb={2}>
          Default Admin Credentials
        </MDTypography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body2" color="text">
              <strong>Username:</strong> andy@admin.ca
            </MDTypography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body2" color="text">
              <strong>Email:</strong> andy@admin.ca
            </MDTypography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body2" color="text">
              <strong>Password:</strong> aaaaaa
            </MDTypography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body2" color="text">
              <strong>User Type:</strong> Admin (0)
            </MDTypography>
          </Grid>
          <Grid item xs={12}>
            <MDTypography variant="body2" color="text">
              <strong>Roles:</strong> ['admin']
            </MDTypography>
          </Grid>
        </Grid>
      </Card>

      <MDBox mb={3}>
        <MDButton 
          variant="gradient"
          color="success"
          onClick={createAdminUser}
          disabled={isCreating}
          fullWidth
        >
          {isCreating ? 'Creating Admin User...' : 'Create Admin User'}
        </MDButton>
      </MDBox>

      {result && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>✅ {result.message}</AlertTitle>
          <MDBox mt={2}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="caption" color="text">
                  <strong>User ID:</strong> {result.user.id}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="caption" color="text">
                  <strong>Username:</strong> {result.user.username}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="caption" color="text">
                  <strong>Email:</strong> {result.user.email}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="caption" color="text">
                  <strong>User Type:</strong> {result.user.userType}
                </MDTypography>
              </Grid>
              <Grid item xs={12}>
                <MDTypography variant="caption" color="text">
                  <strong>Role Names:</strong> {JSON.stringify(result.user.roleNames)}
                </MDTypography>
              </Grid>
              <Grid item xs={12}>
                <MDTypography variant="caption" color="text">
                  <strong>Created At:</strong> {result.user.createdAt}
                </MDTypography>
              </Grid>
            </Grid>
          </MDBox>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>❌ Error</AlertTitle>
          <MDTypography variant="body2" color="text">
            {error}
          </MDTypography>
        </Alert>
      )}

      <Card sx={{ p: 2, backgroundColor: "grey.100" }}>
        <MDTypography variant="caption" color="text">
          <strong>Note:</strong> This component creates an admin user with the specified credentials. 
          After creation, you can login to the CMS with the username and password shown above.
        </MDTypography>
      </Card>
    </MDBox>
  );
};

export default AdminCreator; 