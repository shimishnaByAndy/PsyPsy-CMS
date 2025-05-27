/**
 * ProfessionalsStats component for PsyPsy CMS Dashboard
 * Displays professional statistics: gender, age groups, and other metrics
 */

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useTheme } from '@mui/material/styles';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ProfessionalsStats({ professionalsData = {} }) {
  const theme = useTheme();

  // Define canonical age ranges
  const canonicalAgeRanges = [
    "14-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"
  ];

  // Check if data is available
  const isDataAvailable = professionalsData && Object.keys(professionalsData).length > 0;
  
  // Default age groups matching the canonical structure
  const defaultAgeGroups = canonicalAgeRanges.reduce((acc, range) => {
    acc[range] = 0;
    return acc;
  }, {});

  // Example of populating defaultAgeGroups for mock data
  // This structure should ideally come from professionalsData if available
  const mockAgeGroupData = {
    "25-34": 15,
    "35-44": 18,
    "45-54": 8,
    "55-64": 4, // Assuming '56+' maps to '55-64' or '65+'
  };

  const {
    totalProfessionals = isDataAvailable ? professionalsData.totalProfessionals : 45,
    genderStats = isDataAvailable ? professionalsData.genderStats : {
      men: 18,
      women: 24,
      other: 3
    },
    // Process incoming ageGroups or use structured mock data
    ageGroupStats = isDataAvailable 
      ? professionalsData.ageGroups // Assuming professionalsData.ageGroups is an object like { "25-34": 15, ... }
      : mockAgeGroupData
  } = professionalsData;

  // Combine provided stats with canonical ranges, ensuring all ranges are present
  const processedAgeGroups = canonicalAgeRanges.map(range => ({
    range,
    count: (ageGroupStats && ageGroupStats[range]) || 0 // Use count from data or default to 0
  }));

  const getGenderPercentage = (count) => {
    return ((count / totalProfessionals) * 100).toFixed(1);
  };

  return (
    <Card sx={{
      height: "100%",
      borderTop: `3px solid ${theme.palette.info.main}`,
      transition: theme.transitions.create('box-shadow', {
        duration: theme.transitions.duration.short,
      }),
      '&:hover': {
        boxShadow: theme.shadows[8],
      },
    }}>
      <MDBox pt={2} px={2} display="flex" flexDirection="column" alignItems="center">
        <MDBox mb={0.5} color="info.main">
          <SupervisorAccountIcon fontSize="large"/>
        </MDBox>
        <MDTypography variant="h6" fontWeight="medium" textAlign="center">
          Professionals Statistics
        </MDTypography>
        {!isDataAvailable && (
          <MDTypography variant="caption" color="warning" display="block" mt={0.5} textAlign="center">
            ⚠️ Using mock data
          </MDTypography>
        )}
      </MDBox>
      <MDBox pt={1.5} pb={1.5} px={2}>
        {/* Total Professionals */}
        <MDBox mb={1} textAlign="center">
          <MDTypography variant="h3" fontWeight="bold" color="primary">
            {totalProfessionals}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Total Professionals
          </MDTypography>
        </MDBox>

        {/* Gender Distribution */}
        <MDBox 
          mb={1.5}
          p={1}
          borderRadius="md"
          sx={{
            backgroundColor: theme.palette.grey[50],
            border: `1px solid ${theme.palette.grey[200]}`
          }}
        >
          <MDTypography variant="overline" fontWeight="medium" color="text" mb={1.5} sx={{ textTransform: "uppercase" }}>
            Gender Distribution
          </MDTypography>
          
          {/* Men */}
          <MDBox mb={0.75}>
            <MDTypography variant="caption" color="text" display="block" mb={0.1}>
              Men
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <MDBox 
                width="70%"
                height="5px"
                borderRadius="sm"
                bgcolor="grey.300"
                position="relative"
                mr={1}
              >
                <MDBox
                  width={`${getGenderPercentage(genderStats.men)}%`}
                  height="100%"
                  borderRadius="sm"
                  bgcolor="info.main"
                />
              </MDBox>
              <MDTypography variant="caption" fontWeight="medium">
                {genderStats.men} ({getGenderPercentage(genderStats.men)}%)
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Women */}
          <MDBox mb={0.75}>
            <MDTypography variant="caption" color="text" display="block" mb={0.1}>
              Women
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <MDBox 
                width="70%" 
                height="5px" 
                borderRadius="sm"
                bgcolor="grey.300"
                position="relative"
                mr={1}
              >
                <MDBox
                  width={`${getGenderPercentage(genderStats.women)}%`}
                  height="100%"
                  borderRadius="sm"
                  bgcolor="primary.main"
                />
              </MDBox>
              <MDTypography variant="caption" fontWeight="medium">
                {genderStats.women} ({getGenderPercentage(genderStats.women)}%)
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Other */}
          <MDBox mb={0}>
            <MDTypography variant="caption" color="text" display="block" mb={0.1}>
              Other
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <MDBox 
                width="70%" 
                height="5px" 
                borderRadius="sm"
                bgcolor="grey.300"
                position="relative"
                mr={1}
              >
                <MDBox
                  width={`${getGenderPercentage(genderStats.other)}%`}
                  height="100%"
                  borderRadius="sm"
                  bgcolor="success.main"
                />
              </MDBox>
              <MDTypography variant="caption" fontWeight="medium">
                {genderStats.other} ({getGenderPercentage(genderStats.other)}%)
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Age Groups */}
        <MDBox>
          <MDTypography variant="overline" fontWeight="medium" color="text" mb={0.5} sx={{ textTransform: "uppercase" }}>
            Age Groups
          </MDTypography>
          {processedAgeGroups.map((group) => (
            <MDBox 
              key={group.range} 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              py={0.25}
              borderBottom={`1px solid ${theme.palette.grey[100]}`}
              sx={{ 
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              <MDTypography variant="caption" color="text" sx={{ fontSize: '0.7rem' }}>
                {group.range} yrs
              </MDTypography>
              <MDTypography variant="caption" fontWeight="medium" color="dark" sx={{ fontSize: '0.7rem' }}>
                {group.count}
              </MDTypography>
            </MDBox>
          ))}
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ProfessionalsStats; 