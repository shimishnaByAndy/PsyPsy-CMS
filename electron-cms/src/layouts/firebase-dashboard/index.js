/**
 * Firebase Dashboard Layout
 * 
 * Dashboard layout that uses Firebase services instead of Parse Server
 * Provides real-time statistics and data visualization
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Firebase hooks for data
import { useFirebaseClientStats } from "../../hooks/useFirebaseClients";
import { useFirebaseProfessionalStats } from "../../hooks/useFirebaseProfessionals";
import { useFirebaseAppointmentStats } from "../../hooks/useFirebaseAppointments";

// Charts data functions
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

function FirebaseDashboard() {
  const { t } = useTranslation();
  const [userType, setUserType] = useState(2); // Default to client view

  // Firebase statistics hooks
  const clientStats = useFirebaseClientStats();
  const professionalStats = useFirebaseProfessionalStats();
  const appointmentStats = useFirebaseAppointmentStats();

  // Chart data
  const barChartData = reportsBarChartData;
  const barChartOptions = {}; // Will be configured later
  const lineChartData = reportsLineChartData;
  const lineChartOptions = {}; // Will be configured later

  // Loading state
  const isLoading = clientStats.isLoading || professionalStats.isLoading || appointmentStats.isLoading;
  
  // Error state
  const hasError = clientStats.error || professionalStats.error || appointmentStats.error;
  const error = clientStats.error || professionalStats.error || appointmentStats.error;

  // Handle user type change for different views
  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  // Render loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <MDBox display="flex" flexDirection="column" alignItems="center">
                      <CircularProgress size={50} color="success" />
                      <MDTypography variant="h6" color="text" mt={2}>
                        {t('dashboard.loading')}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="error">
                <MDTypography variant="h6" mb={1}>
                  {t('dashboard.errorTitle')}
                </MDTypography>
                <MDTypography variant="body2">
                  {error.message || t('dashboard.errorMessage')}
                </MDTypography>
              </Alert>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Extract stats data
  const clients = clientStats.data || {};
  const professionals = professionalStats.data || {};
  const appointments = appointmentStats.data || {};

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="weekend"
                title={t('dashboard.totalClients')}
                count={clients.total || 0}
                percentage={{
                  color: "success",
                  amount: clients.newThisMonth || 0,
                  label: t('dashboard.newThisMonth'),
                }}
              />
            </MDBox>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="people_alt"
                title={t('dashboard.totalProfessionals')}
                count={professionals.total || 0}
                percentage={{
                  color: "success",
                  amount: professionals.newThisMonth || 0,
                  label: t('dashboard.newThisMonth'),
                }}
              />
            </MDBox>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="calendar_today"
                title={t('dashboard.totalAppointments')}
                count={appointments.total || 0}
                percentage={{
                  color: "success",
                  amount: appointments.pending || 0,
                  label: t('dashboard.pending'),
                }}
              />
            </MDBox>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="verified"
                title={t('dashboard.verifiedProfessionals')}
                count={professionals.verifiedCount || 0}
                percentage={{
                  color: "success",
                  amount: professionals.averageRating || 0,
                  label: t('dashboard.avgRating'),
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            {/* Client Demographics */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <Card>
                  <CardContent>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      {t('dashboard.clientDemographics')}
                    </MDTypography>
                    
                    {/* Gender Distribution */}
                    <MDBox mb={2}>
                      <MDTypography variant="body2" color="text" mb={1}>
                        {t('dashboard.genderDistribution')}
                      </MDTypography>
                      <MDBox>
                        {Object.entries(clients.genderCounts || {}).map(([gender, count]) => {
                          const genderNames = {
                            1: t('common.woman'),
                            2: t('common.man'), 
                            3: t('common.other'),
                            4: t('common.notDisclosed')
                          };
                          
                          return (
                            <MDBox key={gender} display="flex" justifyContent="space-between" mb={0.5}>
                              <MDTypography variant="caption">
                                {genderNames[gender] || 'Unknown'}
                              </MDTypography>
                              <MDTypography variant="caption" fontWeight="medium">
                                {count}
                              </MDTypography>
                            </MDBox>
                          );
                        })}
                      </MDBox>
                    </MDBox>

                    {/* Age Ranges */}
                    <MDBox>
                      <MDTypography variant="body2" color="text" mb={1}>
                        {t('dashboard.ageRanges')}
                      </MDTypography>
                      <MDBox>
                        {Object.entries(clients.ageRanges || {}).map(([range, count]) => (
                          <MDBox key={range} display="flex" justifyContent="space-between" mb={0.5}>
                            <MDTypography variant="caption">
                              {range}
                            </MDTypography>
                            <MDTypography variant="caption" fontWeight="medium">
                              {count}
                            </MDTypography>
                          </MDBox>
                        ))}
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </MDBox>
            </Grid>

            {/* Professional Statistics */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <Card>
                  <CardContent>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      {t('dashboard.professionalStats')}
                    </MDTypography>
                    
                    {/* Professional Types */}
                    <MDBox mb={2}>
                      <MDTypography variant="body2" color="text" mb={1}>
                        {t('dashboard.professionTypes')}
                      </MDTypography>
                      <MDBox>
                        {Object.entries(professionals.profTypeCounts || {}).map(([type, count]) => {
                          const typeNames = {
                            1: t('professionals.psychologist'),
                            2: t('professionals.socialWorker'),
                            3: t('professionals.psychoeducator'),
                            4: t('professionals.marriageTherapist'),
                            5: t('professionals.counselor'),
                            6: t('professionals.clinicalSocialWorker')
                          };
                          
                          return (
                            <MDBox key={type} display="flex" justifyContent="space-between" mb={0.5}>
                              <MDTypography variant="caption">
                                {typeNames[type] || 'Unknown'}
                              </MDTypography>
                              <MDTypography variant="caption" fontWeight="medium">
                                {count}
                              </MDTypography>
                            </MDBox>
                          );
                        })}
                      </MDBox>
                    </MDBox>

                    {/* Meeting Types */}
                    <MDBox>
                      <MDTypography variant="body2" color="text" mb={1}>
                        {t('dashboard.meetingTypes')}
                      </MDTypography>
                      <MDBox>
                        {Object.entries(professionals.meetTypeCounts || {}).map(([type, count]) => {
                          const meetTypeNames = {
                            1: t('professionals.inPersonOnly'),
                            2: t('professionals.onlineOnly'),
                            3: t('professionals.both')
                          };
                          
                          return (
                            <MDBox key={type} display="flex" justifyContent="space-between" mb={0.5}>
                              <MDTypography variant="caption">
                                {meetTypeNames[type] || 'Unknown'}
                              </MDTypography>
                              <MDTypography variant="caption" fontWeight="medium">
                                {count}
                              </MDTypography>
                            </MDBox>
                          );
                        })}
                      </MDBox>
                    </MDBox>
                  </CardContent>
                </Card>
              </MDBox>
            </Grid>

            {/* Appointment Overview */}
            <Grid item xs={12} md={12} lg={4}>
              <MDBox mb={3}>
                <Card>
                  <CardContent>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      {t('dashboard.appointmentOverview')}
                    </MDTypography>
                    
                    <MDBox>
                      {[
                        { key: 'total', label: t('appointments.total'), color: 'info' },
                        { key: 'pending', label: t('appointments.pending'), color: 'warning' },
                        { key: 'confirmed', label: t('appointments.confirmed'), color: 'success' },
                        { key: 'completed', label: t('appointments.completed'), color: 'dark' },
                        { key: 'cancelled', label: t('appointments.cancelled'), color: 'error' }
                      ].map(({ key, label, color }) => (
                        <MDBox key={key} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <MDBox display="flex" alignItems="center">
                            <MDBox
                              width="12px"
                              height="12px"
                              borderRadius="50%"
                              mr={1}
                              sx={{ backgroundColor: (theme) => theme.palette[color].main }}
                            />
                            <MDTypography variant="caption">
                              {label}
                            </MDTypography>
                          </MDBox>
                          <MDTypography variant="caption" fontWeight="medium">
                            {appointments[key] || 0}
                          </MDTypography>
                        </MDBox>
                      ))}
                    </MDBox>
                  </CardContent>
                </Card>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Charts Section */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <ReportsLineChart
                color="success"
                title={t('dashboard.clientGrowth')}
                description={
                  <>
                    (<strong>+{clients.newThisMonth || 0}</strong>) {t('dashboard.newClientsThisMonth')}
                  </>
                }
                date={t('dashboard.lastUpdated')}
                chart={lineChartData}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ReportsBarChart
                color="info"
                title={t('dashboard.professionalActivity')}
                description={t('dashboard.professionalActivityDesc')}
                date={t('dashboard.lastUpdated')}
                chart={barChartData}
              />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default FirebaseDashboard;