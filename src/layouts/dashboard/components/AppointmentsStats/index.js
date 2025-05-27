/**
 * AppointmentsStats component for PsyPsy CMS Dashboard
 * Displays appointment statistics: time slots, meeting preferences, language preferences
 */

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useTheme } from '@mui/material/styles';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function AppointmentsStats({ appointmentsData = {} }) {
  const theme = useTheme();

  // Check if data is available
  const isDataAvailable = appointmentsData && Object.keys(appointmentsData).length > 0;
  
  const {
    totalAppointments = isDataAvailable ? appointmentsData.totalAppointments : 89,
    timeSlotStats = isDataAvailable ? appointmentsData.timeSlotStats : {
      withTimeSlot: 67,
      withoutTimeSlot: 22
    },
    meetingPreferences = isDataAvailable ? appointmentsData.meetingPreferences : {
      online: 34,
      inPerson: 28,
      both: 27
    },
    languagePreferences = isDataAvailable ? appointmentsData.languagePreferences : {
      french: 45,
      english: 32,
      both: 12
    }
  } = appointmentsData;

  const getPercentage = (count, total) => {
    return ((count / total) * 100).toFixed(1);
  };

  return (
    <Card sx={{
      height: "100%",
      borderTop: `3px solid ${theme.palette.primary.main}`,
      transition: theme.transitions.create('box-shadow', {
        duration: theme.transitions.duration.short,
      }),
      '&:hover': {
        boxShadow: theme.shadows[8],
      },
    }}>
      <MDBox pt={2} px={2} display="flex" flexDirection="column" alignItems="center">
        <MDBox mb={0.5} color="primary.main">
          <CalendarMonthIcon fontSize="large"/>
        </MDBox>
        <MDTypography variant="h6" fontWeight="medium" textAlign="center">
          Appointments Statistics
        </MDTypography>
        {!isDataAvailable && (
          <MDTypography variant="caption" color="warning" display="block" mt={0.5} textAlign="center">
            ⚠️ Using mock data
          </MDTypography>
        )}
      </MDBox>
      <MDBox pt={1.5} pb={1.5} px={2}>
        {/* Total Appointments */}
        <MDBox mb={1} textAlign="center">
          <MDTypography variant="h3" fontWeight="bold" color="info">
            {totalAppointments}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Total Appointments
          </MDTypography>
        </MDBox>

        {/* Time Slot Availability */}
        <MDBox mb={1.5}>
          <MDTypography variant="overline" fontWeight="medium" color="text" mb={1} sx={{ textTransform: "uppercase" }}>
            Time Slot Offers
          </MDTypography>
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <MDBox 
                textAlign="center" 
                py={1} 
                bgcolor="success.main" 
                borderRadius="lg"
                sx={{
                  border: `1px solid ${theme.palette.success.dark}`,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.03)'
                  }
                }}
              >
                <MDTypography variant="h6" fontWeight="bold" color={theme.palette.getContrastText(theme.palette.success.main)}>
                  {timeSlotStats.withTimeSlot}
                </MDTypography>
                <MDTypography variant="caption" color={theme.palette.getContrastText(theme.palette.success.main)} sx={{ fontSize: '0.7rem' }}>
                  With Time Slots
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={6}>
              <MDBox 
                textAlign="center" 
                py={1} 
                bgcolor="warning.main" 
                borderRadius="lg"
                sx={{
                  border: `1px solid ${theme.palette.warning.dark}`,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.03)'
                  }
                }}
              >
                <MDTypography variant="h6" fontWeight="bold" color={theme.palette.getContrastText(theme.palette.warning.main)}>
                  {timeSlotStats.withoutTimeSlot}
                </MDTypography>
                <MDTypography variant="caption" color={theme.palette.getContrastText(theme.palette.warning.main)} sx={{ fontSize: '0.7rem' }}>
                  Without Time Slots
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Meeting Preferences */}
        <MDBox mb={1.5}>
          <MDTypography variant="overline" fontWeight="medium" color="text" mb={1} sx={{ textTransform: "uppercase" }}>
            Meeting Preferences
          </MDTypography>
          
          {/* Online */}
          <MDBox mb={0.75}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.1}>
              <MDBox display="flex" alignItems="center">
                <Chip label="Online" color="info" size="small" sx={{ mr: 0.5, height: '18px', fontSize: '0.65rem' }} />
                <MDTypography variant="caption" color="text" sx={{ fontSize: '0.7rem' }}>
                  Online
                </MDTypography>
              </MDBox>
              <MDBox textAlign="right">
                <MDTypography variant="caption" fontWeight="medium" sx={{ fontSize: '0.7rem' }}>
                  {meetingPreferences.online} ({getPercentage(meetingPreferences.online, totalAppointments)}%)
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox
              width="100%"
              height="4px"
              borderRadius="sm"
              bgcolor="grey.300"
              position="relative"
            >
              <MDBox
                width={`${getPercentage(meetingPreferences.online, totalAppointments)}%`}
                height="100%"
                borderRadius="3px"
                bgcolor="info.main"
              />
            </MDBox>
          </MDBox>

          {/* In-Person */}
          <MDBox mb={0.75}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.1}>
              <MDBox display="flex" alignItems="center">
                <Chip label="In-Person" color="success" size="small" sx={{ mr: 0.5, height: '18px', fontSize: '0.65rem' }} />
                <MDTypography variant="caption" color="text" sx={{ fontSize: '0.7rem' }}>
                  In-Person
                </MDTypography>
              </MDBox>
              <MDBox textAlign="right">
                <MDTypography variant="caption" fontWeight="medium" sx={{ fontSize: '0.7rem' }}>
                  {meetingPreferences.inPerson} ({getPercentage(meetingPreferences.inPerson, totalAppointments)}%)
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox
              width="100%"
              height="4px"
              borderRadius="sm"
              bgcolor="grey.300"
              position="relative"
            >
              <MDBox
                width={`${getPercentage(meetingPreferences.inPerson, totalAppointments)}%`}
                height="100%"
                borderRadius="3px"
                bgcolor="success.main"
              />
            </MDBox>
          </MDBox>

          {/* Both */}
          <MDBox mb={0.75}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.1}>
              <MDBox display="flex" alignItems="center">
                <Chip label="Both" color="primary" size="small" sx={{ mr: 0.5, height: '18px', fontSize: '0.65rem' }} />
                <MDTypography variant="caption" color="text" sx={{ fontSize: '0.7rem' }}>
                  Both
                </MDTypography>
              </MDBox>
              <MDBox textAlign="right">
                <MDTypography variant="caption" fontWeight="medium" sx={{ fontSize: '0.7rem' }}>
                  {meetingPreferences.both} ({getPercentage(meetingPreferences.both, totalAppointments)}%)
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox
              width="100%"
              height="4px"
              borderRadius="sm"
              bgcolor="grey.300"
              position="relative"
            >
              <MDBox
                width={`${getPercentage(meetingPreferences.both, totalAppointments)}%`}
                height="100%"
                borderRadius="3px"
                bgcolor="primary.main"
              />
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Language Preferences */}
        <MDBox>
          <MDTypography variant="overline" fontWeight="medium" color="text" mb={1} sx={{ textTransform: "uppercase" }}>
            Language Preferences
          </MDTypography>
          
          <Grid container spacing={0.75} justifyContent="center">
            {/* French */}
            <Grid item xs={4} sm={3} md={4}>
              <MDBox 
                textAlign="center" 
                py={0.75} 
                px={0.25}
                borderRadius="md"
                sx={{
                  backgroundColor: theme.palette.grey[100],
                  border: `1px solid ${theme.palette.grey[300]}`, 
                }}
              >
                <MDTypography variant="body2" fontWeight="bold" color="primary">
                  {languagePreferences.french}
                </MDTypography>
                <MDTypography variant="caption" color="text" sx={{ fontSize: '0.6rem'}}>
                  Français
                </MDTypography>
              </MDBox>
            </Grid>
            {/* English */}
            <Grid item xs={4} sm={3} md={4}>
              <MDBox 
                textAlign="center" 
                py={0.75} 
                px={0.25}
                borderRadius="md"
                sx={{
                  backgroundColor: theme.palette.grey[100],
                  border: `1px solid ${theme.palette.grey[300]}`, 
                }}
              >
                <MDTypography variant="body2" fontWeight="bold" color="info">
                  {languagePreferences.english}
                </MDTypography>
                <MDTypography variant="caption" color="text" sx={{ fontSize: '0.6rem'}}>
                  English
                </MDTypography>
              </MDBox>
            </Grid>
            {/* Both */}
            <Grid item xs={4} sm={3} md={4}>
              <MDBox 
                textAlign="center" 
                py={0.75} 
                px={0.25}
                borderRadius="md"
                sx={{
                  backgroundColor: theme.palette.grey[100],
                  border: `1px solid ${theme.palette.grey[300]}`, 
                }}
              >
                <MDTypography variant="body2" fontWeight="bold" color="success">
                  {languagePreferences.both}
                </MDTypography>
                <MDTypography variant="caption" color="text" sx={{ fontSize: '0.6rem'}}>
                  Both
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default AppointmentsStats; 