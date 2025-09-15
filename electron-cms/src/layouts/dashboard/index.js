/**
=========================================================
* PsyPsy CMS Dashboard - Enhanced Layout
=========================================================

* Enhanced dashboard for mental health professionals management
* Based on Material Dashboard 2 React - v2.2.0
* Now with PsyPsy theme integration and dark mode support

 =========================================================
*/

// React hooks
import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";

// PsyPsy Dashboard components
import ProfessionalsStats from "layouts/dashboard/components/ProfessionalsStats";
import ClientsStats from "layouts/dashboard/components/ClientsStats";
import AppointmentsStats from "layouts/dashboard/components/AppointmentsStats";

// Custom components
import EmptyState from "components/EmptyState";
import LoadingState from "components/LoadingState";

// PsyPsy Theme System
import { useTheme, useThemeStyles } from "components/ThemeProvider";

// Services
import DashboardService from "services/dashboardService";

function Dashboard() {
  const { colors, isDarkMode } = useTheme();

  // Theme-aware styles
  const styles = useThemeStyles((colors, theme) => ({
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      backgroundColor: colors.backgroundDefault,
    },
    loadingContent: {
      textAlign: 'center',
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: colors.backgroundPaper,
      boxShadow: theme.shadows.md,
    },
    errorContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
    },
    errorContent: {
      textAlign: 'center',
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: colors.backgroundPaper,
      border: `2px solid ${colors.errorRed}`,
      boxShadow: theme.shadows.md,
    },
    retryButton: {
      backgroundColor: colors.mainColor,
      color: colors.txt,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      cursor: 'pointer',
      fontSize: theme.typography.sizeMD,
      fontWeight: theme.typography.weightMedium,
      transition: theme.transitions.normal,
      '&:hover': {
        backgroundColor: colors.prevMainColor,
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows.lg,
      },
    },
    dashboardContainer: {
      backgroundColor: colors.backgroundDefault,
      minHeight: '100vh',
      padding: theme.spacing.lg,
    },
    statsGrid: {
      '& .MuiGrid-item': {
        display: 'flex',
        flexDirection: 'column',
      },
    },
  }));

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

  const handleRetry = () => {
    loadDashboardData();
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState 
          type="dashboard" 
          size="large"
          variant="spinner"
        />
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <EmptyState
          type="connection-error"
          size="large"
          title="Dashboard Error"
          description={error}
          actionLabel="Retry"
          onActionClick={handleRetry}
          showRefresh={true}
          onRefresh={handleRetry}
        />
      </DashboardLayout>
    );
  }

  // Main dashboard content
  return (
    <DashboardLayout>
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Professionals Stats */}
          <Grid item xs={12} md={6} lg={4}>
            <ProfessionalsStats data={dashboardData.professionals} />
          </Grid>

          {/* Clients Stats */}
          <Grid item xs={12} md={6} lg={4}>
            <ClientsStats data={dashboardData.clients} />
          </Grid>

          {/* Appointments Stats */}
          <Grid item xs={12} md={6} lg={4}>
            <AppointmentsStats data={dashboardData.appointments} />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
