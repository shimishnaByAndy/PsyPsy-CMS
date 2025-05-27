/**
 * StatsConfigurator - A side panel component to display user statistics
 */

import { useState, useEffect } from "react";

// @mui material components
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDProgress from "components/MDProgress";

// Custom styles for the StatsConfigurator
const StatsConfiguratorRoot = styled(Drawer)(({ theme, ownerState }) => ({
  [theme.breakpoints.up("lg")]: {
    width: "22rem",
    position: "fixed",
    height: "100vh",
    right: 0,
    boxShadow: theme.shadows[5],
    borderRadius: "0",
    opacity: ownerState.openConfigurator ? 1 : 0,
    transform: ownerState.openConfigurator ? "translateX(0)" : "translateX(22rem)",
    visibility: ownerState.openConfigurator ? "visible" : "hidden",
    zIndex: 1200,
    transition: "all 300ms ease-in-out",
  },

  [theme.breakpoints.down("lg")]: {
    width: "20rem",
  },
}));

function StatsConfigurator({ open, onClose, stats, userType }) {
  // Configuration state
  const [openConfigurator, setOpenConfigurator] = useState(open);

  // Stats configurator states
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [showPercentages, setShowPercentages] = useState(true);

  // Handle configurator state
  useEffect(() => {
    setOpenConfigurator(open);
  }, [open]);

  // Display the appropriate title based on userType
  const getTitle = () => {
    switch (userType) {
      case 1:
        return "Professional Stats";
      case 2:
        return "Client Stats";
      default:
        return "User Statistics";
    }
  };

  return (
    <StatsConfiguratorRoot
      variant="permanent"
      anchor="right"
      open={openConfigurator}
      ownerState={{ openConfigurator }}
    >
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
            See our dashboard statistics.
          </MDTypography>
        </MDBox>

        <Icon
          sx={({ typography: { size }, palette: { dark, white } }) => ({
            fontSize: `${size.lg} !important`,
            color: dark.main,
            stroke: "currentColor",
            strokeWidth: "2px",
            cursor: "pointer",
            transform: "translateY(5px)",
          })}
          onClick={onClose}
        >
          close
        </Icon>
      </MDBox>

      <Divider />

      <MDBox pt={1.5} pb={3} px={3}>
        {/* Time Period */}
        <MDBox>
          <MDTypography variant="h6">Time Period</MDTypography>

          <MDBox display="flex" mt={2}>
            <MDButton
              color="dark"
              variant={selectedPeriod === "week" ? "gradient" : "outlined"}
              onClick={() => setSelectedPeriod("week")}
              fullWidth
              sx={{ mr: 1 }}
            >
              Week
            </MDButton>
            <MDButton
              color="dark"
              variant={selectedPeriod === "month" ? "gradient" : "outlined"}
              onClick={() => setSelectedPeriod("month")}
              fullWidth
              sx={{ mx: 1 }}
            >
              Month
            </MDButton>
            <MDButton
              color="dark"
              variant={selectedPeriod === "year" ? "gradient" : "outlined"}
              onClick={() => setSelectedPeriod("year")}
              fullWidth
              sx={{ ml: 1 }}
            >
              Year
            </MDButton>
          </MDBox>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* New User Stats */}
        <MDBox>
          <MDTypography variant="h6">New Users</MDTypography>
          
          <MDBox mt={2}>
            <MDBox mb={1}>
              <MDBox display="flex" alignItems="center" justifyContent="space-between">
                <MDTypography variant="button" fontWeight="regular" color="text">
                  This Week
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold">
                  {stats?.newUsersThisWeek || 0}
                </MDTypography>
              </MDBox>
            </MDBox>
            
            <MDBox mb={1}>
              <MDBox display="flex" alignItems="center" justifyContent="space-between">
                <MDTypography variant="button" fontWeight="regular" color="text">
                  This Month
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold">
                  {stats?.newUsersThisMonth || 0}
                </MDTypography>
              </MDBox>
            </MDBox>
            
            <MDBox>
              <MDBox display="flex" alignItems="center" justifyContent="space-between">
                <MDTypography variant="button" fontWeight="regular" color="text">
                  This Year
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold">
                  {stats?.newUsersThisYear || 0}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Gender Distribution */}
        <MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h6">Gender Distribution</MDTypography>
          </MDBox>

          <MDBox mt={2}>
            <MDBox mb={1}>
              <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                <MDTypography variant="button" fontWeight="regular" color="text">
                  Male
                </MDTypography>
                <MDTypography variant="button" fontWeight="medium">
                  {stats?.genderCounts?.male || 0}
                  {showPercentages && stats?.genderCounts?.male ? 
                    ` (${Math.round(stats.genderCounts.male / (stats.genderCounts.male + stats.genderCounts.female + stats.genderCounts.other) * 100)}%)` : ''}
                </MDTypography>
              </MDBox>
              <MDProgress
                variant="gradient"
                color="info"
                value={stats?.genderCounts?.male ? 
                  (stats.genderCounts.male / (stats.genderCounts.male + stats.genderCounts.female + stats.genderCounts.other) * 100) : 0
                }
              />
            </MDBox>
            
            <MDBox mb={1}>
              <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                <MDTypography variant="button" fontWeight="regular" color="text">
                  Female
                </MDTypography>
                <MDTypography variant="button" fontWeight="medium">
                  {stats?.genderCounts?.female || 0}
                  {showPercentages && stats?.genderCounts?.female ? 
                    ` (${Math.round(stats.genderCounts.female / (stats.genderCounts.male + stats.genderCounts.female + stats.genderCounts.other) * 100)}%)` : ''}
                </MDTypography>
              </MDBox>
              <MDProgress
                variant="gradient"
                color="success"
                value={stats?.genderCounts?.female ? 
                  (stats.genderCounts.female / (stats.genderCounts.male + stats.genderCounts.female + stats.genderCounts.other) * 100) : 0
                }
              />
            </MDBox>
            
            <MDBox>
              <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                <MDTypography variant="button" fontWeight="regular" color="text">
                  Other
                </MDTypography>
                <MDTypography variant="button" fontWeight="medium">
                  {stats?.genderCounts?.other || 0}
                  {showPercentages && stats?.genderCounts?.other ? 
                    ` (${Math.round(stats.genderCounts.other / (stats.genderCounts.male + stats.genderCounts.female + stats.genderCounts.other) * 100)}%)` : ''}
                </MDTypography>
              </MDBox>
              <MDProgress
                variant="gradient"
                color="warning"
                value={stats?.genderCounts?.other ? 
                  (stats.genderCounts.other / (stats.genderCounts.male + stats.genderCounts.female + stats.genderCounts.other) * 100) : 0
                }
              />
            </MDBox>
          </MDBox>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Age Distribution */}
        <MDBox>
          <MDTypography variant="h6">Age Distribution</MDTypography>
          
          <MDBox mt={2}>
            {Object.entries(stats?.ageRanges || {}).map(([range, count]) => {
              const total = Object.values(stats?.ageRanges || {}).reduce((a, b) => a + b, 0);
              const percentage = count && total ? Math.round((count / total) * 100) : 0;
              
              return (
                <MDBox key={range} mb={1}>
                  <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <MDTypography variant="button" fontWeight="regular" color="text">
                      {range}
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {count || 0}
                      {showPercentages ? ` (${percentage}%)` : ''}
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

        <Divider sx={{ my: 3 }} />

        {/* Show Percentages Toggle */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6">Show Percentages</MDTypography>
          <Switch checked={showPercentages} onChange={() => setShowPercentages(!showPercentages)} />
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Total Users */}
        <MDBox textAlign="center">
          <MDTypography variant="h6">Total {userType === 'professionals' ? 'Professionals' : 'Clients'}</MDTypography>
          <MDTypography variant="h2" fontWeight="bold" mt={1}>
            {stats?.total || 0}
          </MDTypography>
        </MDBox>
      </MDBox>
    </StatsConfiguratorRoot>
  );
}

export default StatsConfigurator; 