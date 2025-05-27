/**
 * AppointmentsStats component for PsyPsy CMS Dashboard
 * Displays appointment statistics: time slots, meeting preferences, language preferences
 */

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function AppointmentsStats({ appointmentsData = {} }) {
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
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Appointments Statistics
        </MDTypography>
        {!isDataAvailable && (
          <MDTypography variant="caption" color="warning" display="block" mt={1}>
            ⚠️ Using mock data - Cloud function integration pending
          </MDTypography>
        )}
      </MDBox>
      <MDBox pt={1} pb={2} px={3}>
        {/* Total Appointments */}
        <MDBox mb={3} textAlign="center">
          <MDTypography variant="h2" fontWeight="bold" color="info">
            {totalAppointments}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Total Appointments
          </MDTypography>
        </MDBox>

        {/* Time Slot Availability */}
        <MDBox mb={3}>
          <MDTypography variant="button" fontWeight="medium" color="text" mb={2}>
            Time Slot Offers
          </MDTypography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <MDBox textAlign="center" py={2} bgcolor="success.main" borderRadius="lg">
                <MDTypography variant="h4" fontWeight="bold" color="white">
                  {timeSlotStats.withTimeSlot}
                </MDTypography>
                <MDTypography variant="caption" color="white">
                  With Time Slots
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={6}>
              <MDBox textAlign="center" py={2} bgcolor="warning.main" borderRadius="lg">
                <MDTypography variant="h4" fontWeight="bold" color="white">
                  {timeSlotStats.withoutTimeSlot}
                </MDTypography>
                <MDTypography variant="caption" color="white">
                  Without Time Slots
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Meeting Preferences */}
        <MDBox mb={3}>
          <MDTypography variant="button" fontWeight="medium" color="text" mb={2}>
            Meeting Preferences
          </MDTypography>
          
          {/* Online */}
          <MDBox mb={2}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <MDBox display="flex" alignItems="center">
                <Chip label="Online" color="info" size="small" sx={{ mr: 1 }} />
                <MDTypography variant="caption" color="text">
                  Online
                </MDTypography>
              </MDBox>
              <MDBox textAlign="right">
                <MDTypography variant="caption" fontWeight="medium">
                  {meetingPreferences.online} ({getPercentage(meetingPreferences.online, totalAppointments)}%)
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox
              width="100%"
              height="6px"
              borderRadius="3px"
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
          <MDBox mb={2}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <MDBox display="flex" alignItems="center">
                <Chip label="In-Person" color="success" size="small" sx={{ mr: 1 }} />
                <MDTypography variant="caption" color="text">
                  In-Person
                </MDTypography>
              </MDBox>
              <MDBox textAlign="right">
                <MDTypography variant="caption" fontWeight="medium">
                  {meetingPreferences.inPerson} ({getPercentage(meetingPreferences.inPerson, totalAppointments)}%)
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox
              width="100%"
              height="6px"
              borderRadius="3px"
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
          <MDBox mb={2}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <MDBox display="flex" alignItems="center">
                <Chip label="Both" color="primary" size="small" sx={{ mr: 1 }} />
                <MDTypography variant="caption" color="text">
                  Both
                </MDTypography>
              </MDBox>
              <MDBox textAlign="right">
                <MDTypography variant="caption" fontWeight="medium">
                  {meetingPreferences.both} ({getPercentage(meetingPreferences.both, totalAppointments)}%)
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox
              width="100%"
              height="6px"
              borderRadius="3px"
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
          <MDTypography variant="button" fontWeight="medium" color="text" mb={2}>
            Language Preferences
          </MDTypography>
          
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <MDBox textAlign="center" py={1}>
                <MDTypography variant="h6" fontWeight="bold" color="primary">
                  {languagePreferences.french}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Français
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={4}>
              <MDBox textAlign="center" py={1}>
                <MDTypography variant="h6" fontWeight="bold" color="info">
                  {languagePreferences.english}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  English
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={4}>
              <MDBox textAlign="center" py={1}>
                <MDTypography variant="h6" fontWeight="bold" color="success">
                  {languagePreferences.both}
                </MDTypography>
                <MDTypography variant="caption" color="text">
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