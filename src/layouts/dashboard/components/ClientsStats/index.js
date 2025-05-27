/**
 * ClientsStats component for PsyPsy CMS Dashboard
 * Displays client statistics: gender, age groups, and other metrics
 */

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ClientsStats({ clientsData = {} }) {
  // Check if data is available
  const isDataAvailable = clientsData && Object.keys(clientsData).length > 0;
  
  const {
    totalClients = isDataAvailable ? clientsData.totalClients : 247,
    genderStats = isDataAvailable ? clientsData.genderStats : {
      men: 87,
      women: 144,
      other: 16
    },
    ageGroups = isDataAvailable ? clientsData.ageGroups : [
      { range: "18-25", count: 45 },
      { range: "26-35", count: 78 },
      { range: "36-45", count: 62 },
      { range: "46-55", count: 38 },
      { range: "56+", count: 24 }
    ]
  } = clientsData;

  const getGenderPercentage = (count) => {
    return ((count / totalClients) * 100).toFixed(1);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Clients Statistics
        </MDTypography>
        {!isDataAvailable && (
          <MDTypography variant="caption" color="warning" display="block" mt={1}>
            ⚠️ Using mock data - Cloud function integration pending
          </MDTypography>
        )}
      </MDBox>
      <MDBox pt={1} pb={2} px={3}>
        {/* Total Clients */}
        <MDBox mb={3} textAlign="center">
          <MDTypography variant="h2" fontWeight="bold" color="success">
            {totalClients}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Total Clients
          </MDTypography>
        </MDBox>

        {/* Gender Distribution */}
        <MDBox mb={3}>
          <MDTypography variant="button" fontWeight="medium" color="text" mb={2}>
            Gender Distribution
          </MDTypography>
          
          {/* Men */}
          <MDBox mb={2}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <MDTypography variant="caption" color="text">
                Men
              </MDTypography>
              <MDBox textAlign="right">
                <MDTypography variant="caption" fontWeight="medium">
                  {genderStats.men} ({getGenderPercentage(genderStats.men)}%)
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
                width={`${getGenderPercentage(genderStats.men)}%`}
                height="100%"
                borderRadius="3px"
                bgcolor="info.main"
              />
            </MDBox>
          </MDBox>

          {/* Women */}
          <MDBox mb={2}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <MDTypography variant="caption" color="text">
                Women
              </MDTypography>
              <MDBox textAlign="right">
                <MDTypography variant="caption" fontWeight="medium">
                  {genderStats.women} ({getGenderPercentage(genderStats.women)}%)
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
                width={`${getGenderPercentage(genderStats.women)}%`}
                height="100%"
                borderRadius="3px"
                bgcolor="primary.main"
              />
            </MDBox>
          </MDBox>

          {/* Other */}
          <MDBox mb={2}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <MDTypography variant="caption" color="text">
                Other
              </MDTypography>
              <MDBox textAlign="right">
                <MDTypography variant="caption" fontWeight="medium">
                  {genderStats.other} ({getGenderPercentage(genderStats.other)}%)
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
                width={`${getGenderPercentage(genderStats.other)}%`}
                height="100%"
                borderRadius="3px"
                bgcolor="success.main"
              />
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Age Groups */}
        <MDBox>
          <MDTypography variant="button" fontWeight="medium" color="text" mb={2}>
            Age Groups
          </MDTypography>
          <Grid container spacing={1}>
            {ageGroups.map((group, index) => (
              <Grid item xs={4} key={group.range}>
                <MDBox textAlign="center" py={1}>
                  <MDTypography variant="h6" fontWeight="bold" color="dark">
                    {group.count}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    {group.range} years
                  </MDTypography>
                </MDBox>
              </Grid>
            ))}
          </Grid>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ClientsStats; 