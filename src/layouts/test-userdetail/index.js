/**
 * Test page for UserDetail component with mock data
 * Use this when Parse Server is not available
 */

import { useState } from "react";
import { Grid, Card, CardContent, Button, Alert } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// UserDetail component
import UserDetail from "components/UserDetail";

// Mock data
import { mockUsers } from "services/mockData";

// PsyPsy Theme
import { useTheme } from "components/ThemeProvider";

function TestUserDetail() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const { colors } = useTheme();

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
  };

  const handleCloseUserDetail = () => {
    setUserDetailOpen(false);
    setSelectedUser(null);
  };

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 0: return "Administrator";
      case 1: return "Professional";
      case 2: return "Client";
      default: return "Unknown";
    }
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 0: return "error";
      case 1: return "info";
      case 2: return "success";
      default: return "default";
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <MDTypography variant="h4" fontWeight="medium" mb={2}>
                    UserDetail Component Test
                  </MDTypography>
                  
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <strong>Parse Server Connection Issue:</strong> Using mock data because Parse Server at http://localhost:1337/parse is not accessible.
                  </Alert>

                  <MDTypography variant="body1" mb={3}>
                    Click on any user below to test the UserDetail popup component with comprehensive profile information.
                  </MDTypography>

                  <Grid container spacing={2}>
                    {mockUsers.map((user) => (
                      <Grid item xs={12} md={4} key={user.objectId}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => handleUserClick(user)}
                        >
                          <CardContent>
                            <MDTypography variant="h6" fontWeight="medium" mb={1}>
                              {user.username}
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mb={1}>
                              {user.email}
                            </MDTypography>
                            <MDBox display="flex" justifyContent="space-between" alignItems="center">
                              <MDTypography 
                                variant="caption" 
                                color={getUserTypeColor(user.userType)}
                                fontWeight="bold"
                              >
                                {getUserTypeLabel(user.userType)}
                              </MDTypography>
                              <MDButton 
                                variant="outlined" 
                                color="info" 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserClick(user);
                                }}
                              >
                                View Details
                              </MDButton>
                            </MDBox>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <MDBox mt={4}>
                    <MDTypography variant="h6" mb={2}>
                      Test Features:
                    </MDTypography>
                    <ul>
                      <li><strong>Client User:</strong> Shows personal info, contact details, preferences, and location data</li>
                      <li><strong>Professional User:</strong> Shows comprehensive professional profile including business info, services, tax details, and availability</li>
                      <li><strong>Admin User:</strong> Shows basic account and system information</li>
                      <li><strong>Responsive Design:</strong> Professional styling with proper theme integration</li>
                      <li><strong>Fallback Data:</strong> Handles missing profile data gracefully</li>
                    </ul>
                  </MDBox>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      {/* UserDetail Popup */}
      <UserDetail
        open={userDetailOpen}
        user={selectedUser}
        onClose={handleCloseUserDetail}
      />
    </DashboardLayout>
  );
}

export default TestUserDetail; 