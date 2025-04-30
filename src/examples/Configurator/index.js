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

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// @mui material components
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDProgress from "components/MDProgress";

// Custom styles for the Configurator
import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setOpenConfigurator,
  setDarkMode,
} from "context";

function Configurator({ stats = {}, userType = "clients" }) {
  const [controller, dispatch] = useMaterialUIController();
  const { t } = useTranslation();
  const {
    openConfigurator,
    darkMode,
  } = controller;
  
  // Stats configurator states
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [showPercentages, setShowPercentages] = useState(true);

  // Handle closing the configurator
  const handleCloseConfigurator = () => {
    setOpenConfigurator(dispatch, false);
  };

  // Handle dark mode toggle
  const handleDarkMode = () => {
    setDarkMode(dispatch, !darkMode);
  };

  // Gender mapping with translation keys
  const genderMap = {
    1: t("statistics.distributions.gender.woman"),
    2: t("statistics.distributions.gender.man"),
    3: t("statistics.distributions.gender.other"),
    4: t("statistics.distributions.gender.notDisclosed"),
  };
  
  // Default stats if none provided
  const defaultStats = {
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    newUsersThisYear: 0,
    total: 0,
    genderCounts: {
      1: 0, // Woman
      2: 0, // Man
      3: 0, // Other
      4: 0, // Not Disclosed
    },
    ageRanges: {
      "14-17": 0,
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55-64": 0,
      "65+": 0
    }
  };

  // Merge provided stats with default stats
  const displayStats = { ...defaultStats, ...stats };
  
  // Calculate total gender count for percentages
  const totalGenderCount = Object.values(displayStats.genderCounts).reduce((a, b) => a + b, 0);
  
  // Generate color mapping for gender types
  const genderColors = {
    1: "success", // Woman - green
    2: "info",    // Man - blue
    3: "warning", // Other - orange/yellow
    4: "dark",    // Not Disclosed - gray/dark
  };
  
  // Display the appropriate title based on userType
  const getTitle = () => {
    switch (userType) {
      case 'professionals':
        return t("statistics.professionalTitle");
      case 'clients':
        return t("statistics.clientTitle");
      default:
        return t("statistics.title");
    }
  };

  return (
    <ConfiguratorRoot variant="permanent" ownerState={{ openConfigurator }}>
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        pt={4}
        pb={0.5}
        px={3}
      >
        <MDBox>
          <MDTypography variant="h5">{getTitle()}</MDTypography>
          <MDTypography variant="body2" color="text">
            {t("statistics.subtitle")}
          </MDTypography>
        </MDBox>

        <Icon
          sx={({ typography: { size }, palette: { dark, white } }) => ({
            fontSize: `${size.lg} !important`,
            color: darkMode ? white.main : dark.main,
            stroke: "currentColor",
            strokeWidth: "2px",
            cursor: "pointer",
            transform: "translateY(5px)",
          })}
          onClick={handleCloseConfigurator}
        >
          close
        </Icon>
      </MDBox>

      <Divider />

      <MDBox pt={1.5} pb={3} px={3}>
        {/* Total Users - Moved to top */}
        <MDBox 
          bgColor={darkMode ? "dark" : "light"}
          color={darkMode ? "white" : "dark"}
          p={2} 
          mb={3}
          borderRadius="lg"
          boxShadow="md"
          textAlign="center"
        >
          <MDTypography variant="h6">
            {userType === 'professionals' 
              ? t("statistics.totalProfessionals") 
              : t("statistics.totalClients")}
          </MDTypography>
          <MDTypography variant="h1" fontWeight="bold" mt={1}>
            {displayStats.total}
          </MDTypography>
        </MDBox>

        {/* New User Stats */}
        <MDBox>
          <MDTypography variant="h6">{t("statistics.newUsers")}</MDTypography>
          
          <MDBox mt={2}>
            <MDBox mb={1}>
              <MDBox display="flex" alignItems="center" justifyContent="space-between">
                <MDTypography variant="button" fontWeight="regular" color="text">
                  {t("statistics.timeframes.thisWeek")}
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold">
                  {displayStats.newUsersThisWeek}
                </MDTypography>
              </MDBox>
            </MDBox>
            
            <MDBox mb={1}>
              <MDBox display="flex" alignItems="center" justifyContent="space-between">
                <MDTypography variant="button" fontWeight="regular" color="text">
                  {t("statistics.timeframes.thisMonth")}
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold">
                  {displayStats.newUsersThisMonth}
                </MDTypography>
              </MDBox>
            </MDBox>
            
            <MDBox>
              <MDBox display="flex" alignItems="center" justifyContent="space-between">
                <MDTypography variant="button" fontWeight="regular" color="text">
                  {t("statistics.timeframes.thisYear")}
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold">
                  {displayStats.newUsersThisYear}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Gender Distribution */}
        <MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h6">{t("statistics.distributions.gender.title")}</MDTypography>
          </MDBox>

          <MDBox mt={2}>
            {Object.entries(displayStats.genderCounts).map(([key, count]) => {
              const gender = genderMap[key];
              const percentage = totalGenderCount > 0 ? Math.round((count / totalGenderCount) * 100) : 0;
              
              return (
                <MDBox key={key} mb={1}>
                  <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      {gender}
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {count}
                      {` (${percentage}%)`}
                    </MDTypography>
                  </MDBox>
                  <MDProgress
                    variant="gradient"
                    color={genderColors[key]}
                    value={percentage}
                  />
                </MDBox>
              );
            })}
          </MDBox>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Age Distribution */}
        <MDBox>
          <MDTypography variant="h6">{t("statistics.distributions.age.title")}</MDTypography>
          
          <MDBox mt={2}>
            {Object.entries(displayStats.ageRanges).map(([range, count]) => {
              const total = Object.values(displayStats.ageRanges).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              
              // Map range to translation key
              const getRangeKey = (range) => {
                switch(range) {
                  case "14-17": return "range14_17";
                  case "18-24": return "range18_24";
                  case "25-34": return "range25_34";
                  case "35-44": return "range35_44";
                  case "45-54": return "range45_54";
                  case "55-64": return "range55_64";
                  case "65+": return "range65Plus";
                  default: return range;
                }
              };
              
              return (
                <MDBox key={range} mb={1}>
                  <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      {t(`statistics.distributions.age.${getRangeKey(range)}`)}
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {count}
                      {` (${percentage}%)`}
                    </MDTypography>
                  </MDBox>
                  <MDProgress
                    variant="gradient"
                    color="primary"
                    value={percentage}
                  />
                </MDBox>
              );
            })}
          </MDBox>
        </MDBox>
      </MDBox>
    </ConfiguratorRoot>
  );
}

export default Configurator;
