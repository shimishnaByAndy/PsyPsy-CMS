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

import React, { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Settings components
import AdminSettings from "layouts/profile/components/AdminSettings";

// Parse
import Parse from 'parse';

function Overview() {
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    // Get current user information
    const user = Parse.User.current();
    setCurrentUser(user);
  }, []);

  const getUserTypeLabel = (userType) => {
    switch(userType) {
      case 0: return "Admin";
      case 1: return "Professional";
      case 2: return "Client";
      default: return "Unknown";
    }
  };

  console.log('🔍 Profile/Settings component is rendering!');
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Left Column - Admin Management */}
          <Grid item xs={12} lg={8}>
            <AdminSettings />
          </Grid>
          
          {/* Right Column - System Information */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              {/* Current User Information */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <MDTypography variant="h6" fontWeight="medium" color="text" mb={2}>
                    Current User
                  </MDTypography>
                  <Divider sx={{ mb: 2 }} />
                  {currentUser ? (
                    <>
                      <MDBox mb={1}>
                        <MDTypography variant="body2" color="text">
                          <strong>Username:</strong> {currentUser.get("username") || "N/A"}
                        </MDTypography>
                      </MDBox>
                      <MDBox mb={1}>
                        <MDTypography variant="body2" color="text">
                          <strong>Email:</strong> {currentUser.get("email") || "N/A"}
                        </MDTypography>
                      </MDBox>
                      <MDBox mb={1}>
                        <MDTypography variant="body2" color="text">
                          <strong>User Type:</strong> {getUserTypeLabel(currentUser.get("userType"))} ({currentUser.get("userType")})
                        </MDTypography>
                      </MDBox>
                      <MDBox mb={1}>
                        <MDTypography variant="body2" color="text">
                          <strong>User ID:</strong> {currentUser.id}
                        </MDTypography>
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="body2" color="text">
                          <strong>Session:</strong> Active
                        </MDTypography>
                      </MDBox>
                    </>
                  ) : (
                    <MDTypography variant="body2" color="text">
                      No user logged in
                    </MDTypography>
                  )}
                </Card>
              </Grid>
              
              {/* System Information */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <MDTypography variant="h6" fontWeight="medium" color="text" mb={2}>
                    System Information
                  </MDTypography>
                  <Divider sx={{ mb: 2 }} />
                  <MDBox mb={1}>
                    <MDTypography variant="body2" color="text">
                      <strong>Application:</strong> PsyPsy CMS
                    </MDTypography>
                  </MDBox>
                  <MDBox mb={1}>
                    <MDTypography variant="body2" color="text">
                      <strong>Version:</strong> 2.2.0
                    </MDTypography>
                  </MDBox>
                  <MDBox mb={1}>
                    <MDTypography variant="body2" color="text">
                      <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
                    </MDTypography>
                  </MDBox>
                  <MDBox mb={1}>
                    <MDTypography variant="body2" color="text">
                      <strong>Parse Server:</strong> Connected
                    </MDTypography>
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="body2" color="text">
                      <strong>Build:</strong> React {React.version}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
