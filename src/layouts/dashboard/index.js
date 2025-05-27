/**
=========================================================
* PsyPsy CMS Dashboard - Enhanced Layout
=========================================================

* Enhanced dashboard for mental health professionals management
* Based on Material Dashboard 2 React - v2.2.0

 =========================================================
*/

// React hooks
import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// PsyPsy Dashboard components
import ProfessionalsStats from "layouts/dashboard/components/ProfessionalsStats";
import ClientsStats from "layouts/dashboard/components/ClientsStats";
import AppointmentsStats from "layouts/dashboard/components/AppointmentsStats";

// Services
import DashboardService from "services/dashboardService";

function Dashboard() {
  // State management
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    professionals: {},
    clients: {},
    appointments: {},
  });
  const [error, setError] = useState(null);
  
  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [professionals, clients, appointments] = await Promise.all([
        DashboardService.getProfessionalsStats(),
        DashboardService.getClientsStats(), 
        DashboardService.getAppointmentsStats(),
      ]);

      setDashboardData({
        professionals,
        clients,
        appointments,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <MDBox textAlign="center">
            <CircularProgress size={60} />
            <MDTypography variant="h6" color="text" mt={2}>
              Loading Dashboard...
            </MDTypography>
          </MDBox>
        </MDBox>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <MDBox textAlign="center">
            <MDTypography variant="h6" color="error" mb={2}>
              {error}
            </MDTypography>
            <MDBox
              component="button"
              onClick={loadDashboardData}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                border: 'none',
                borderRadius: 1,
                px: 3,
                py: 1,
                cursor: 'pointer'
              }}
            >
              Retry
            </MDBox>
          </MDBox>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* REMOVE Key Metrics Overview */}
        {/* <MDBox mb={3}> */}
        {/*  <KeyMetricsOverviewCard /> */}
        {/* </MDBox> */}

        {/* Main Dashboard - 3 Containers in a row */}
        <Grid container spacing={3}>
          {/* Professionals Stats */}
          <Grid item xs={12} md={6} lg={4}> {/* Reverted to lg={4} */}
            <ProfessionalsStats professionalsData={dashboardData.professionals} />
          </Grid>
          
          {/* Clients Stats */}
          <Grid item xs={12} md={6} lg={4}> {/* Reverted to lg={4} */}
            <ClientsStats clientsData={dashboardData.clients} />
          </Grid>
          
          {/* Appointments Stats */}
          <Grid item xs={12} md={12} lg={4}> {/* Reverted to lg={4}, md was 6, now 12 for consistency on medium or if only one row */}
            <AppointmentsStats appointmentsData={dashboardData.appointments} />
          </Grid>
        </Grid>

        {/* User Positions Map -- REMOVED */}
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
