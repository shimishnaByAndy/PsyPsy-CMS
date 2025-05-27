/**
 * ProfessionalsStats component for PsyPsy CMS Dashboard
 * Displays professional statistics: gender, age groups, and other metrics
 */

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ProfessionalsStats({ professionalsData = {} }) {
  // Check if data is available
  const isDataAvailable = professionalsData && Object.keys(professionalsData).length > 0;
  
  const {
    totalProfessionals = isDataAvailable ? professionalsData.totalProfessionals : 45,
    genderStats = isDataAvailable ? professionalsData.genderStats : {
      men: 18,
      women: 24,
      other: 3
    },
    ageGroups = isDataAvailable ? professionalsData.ageGroups : [
      { range: "25-35", count: 15 },
      { range: "36-45", count: 18 },
      { range: "46-55", count: 8 },
      { range: "56+", count: 4 }
    ]
  } = professionalsData;

  const getGenderPercentage = (count) => {
    return ((count / totalProfessionals) * 100).toFixed(1);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Professionals Statistics
        </MDTypography>
        {!isDataAvailable && (
          <MDTypography variant="caption" color="warning" display="block" mt={1}>
            ⚠️ Using mock data - Cloud function integration pending
          </MDTypography>
        )}
      </MDBox>
      <MDBox pt={1} pb={2} px={3}>
        {/* Total Professionals */}
        <MDBox mb={3} textAlign="center">
          <MDTypography variant="h2" fontWeight="bold" color="primary">
            {totalProfessionals}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Total Professionals
          </MDTypography>
        </MDBox>

        {/* Gender Distribution */}
        <MDBox mb={3}>
          <MDTypography variant="overline" fontWeight="medium" color="text" mb={2.5} sx={{ textTransform: "uppercase" }}>
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
          <MDTypography variant="overline" fontWeight="medium" color="text" mb={2.5} sx={{ textTransform: "uppercase" }}>
            Age Groups
          </MDTypography>
          <Grid container spacing={1}>
            {ageGroups.map((group, index) => (
              <Grid item xs={6} key={group.range}>
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

export default ProfessionalsStats; 