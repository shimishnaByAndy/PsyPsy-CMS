/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import SimpleErrorMessage from "components/SimpleErrorMessage";

// Parse
import Parse from 'parse';

function AdminSettings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const createAdminUser = async () => {
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    let newUser; // To potentially clean up if promotion fails
    
    try {
      console.log('Creating user with email:', email);
      
      const user = new Parse.User();
      user.set("username", email);
      user.set("email", email);
      user.set("password", password);
      user.set("userType", 0); // Set userType to 0 for admin
      
      newUser = await user.signUp();
      console.log('User created successfully with ID:', newUser.id, 'and userType 0 (admin)');
      
      // Now, call the Cloud Code function to promote the user
      try {
        console.log(`Calling promoteUserToAdmin Cloud Code for userId: ${newUser.id}`);
        const promotionResult = await Parse.Cloud.run("promoteUserToAdmin", { userId: newUser.id });
        console.log('User promotion successful:', promotionResult);
        setSuccess(promotionResult.message || `Admin user ${email} created and promoted successfully!`);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } catch (promotionError) {
        console.error('Error promoting user to admin via Cloud Code:', promotionError);
        let errorMessage = 'Unknown promotion error';
        if (promotionError && promotionError.message) {
          errorMessage = promotionError.message;
        }
        setError(`User created, but failed to promote to admin: ${errorMessage}`);
        
        if (newUser) {
          try {
            // Ensure your Parse JS SDK is configured to allow masterKey usage from client if this direct call is intended.
            // Otherwise, this destroy operation should also be a Cloud Function.
            await newUser.destroy({ useMasterKey: true }); 
            console.log(`User ${newUser.id} deleted after promotion failure.`);
          } catch (deleteError) {
            console.error(`Failed to delete user ${newUser.id} after promotion error:`, deleteError);
            let deleteErrorMessage = 'Unknown error during cleanup.';
            if (deleteError && deleteError.message) {
                deleteErrorMessage = deleteError.message;
            }
            setError(`User created, promotion failed (${errorMessage}), and cleanup failed: ${deleteErrorMessage}. Please check manually.`);
          }
        }
      }
      
    } catch (signUpError) {
      console.error("Error during user sign up:", signUpError);
      if (signUpError.code === 202) {
        setError("A user with this email already exists.");
      } else if (signUpError.code === 125) {
        setError("Invalid email address format.");
      } else {
        setError(signUpError.message || "Failed to create user.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ boxShadow: "none" }}>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" color="text" mb={1}>
          Admin Management
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={3}>
          Create new administrator accounts for system management
        </MDTypography>
        
        {error && (
          <MDBox mb={3}>
            <SimpleErrorMessage message={error} />
          </MDBox>
        )}
        
        {success && (
          <MDBox mb={3} p={2} borderRadius="lg" sx={{ backgroundColor: "success.main" }}>
            <MDTypography variant="button" color="white">
              {success}
            </MDTypography>
          </MDBox>
        )}
        
        <MDBox component="form" role="form">
          <MDBox mb={2}>
            <MDInput
              type="email"
              label="Admin Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </MDBox>
          
          <MDBox mb={2}>
            <MDInput
              type="password"
              label="Password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </MDBox>
          
          <MDBox mb={3}>
            <MDInput
              type="password"
              label="Confirm Password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </MDBox>
          
          <MDBox mb={2}>
            <MDButton
              variant="gradient"
              color="info"
              fullWidth
              onClick={createAdminUser}
              disabled={loading}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                }
              }}
            >
              {loading ? "Creating Admin..." : "Create Admin User"}
            </MDButton>
          </MDBox>
          
          <MDTypography variant="caption" color="text" textAlign="center" display="block">
            This will create a new admin user with full system access.
            Use this feature responsibly.
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default AdminSettings; 