/**
 * AppointmentsStats component for PsyPsy CMS Dashboard
 * Displays appointment statistics: total, today, upcoming, completed
 * Enhanced with animated icons and gradient color schemes using PsyPsy theme
 */

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { keyframes } from "@mui/system";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// PsyPsy Theme System
import { useTheme, useThemeStyles } from "components/ThemeProvider";

// Custom Professional SVG Icons - 3 Style Options

// STYLE 1: Clean Minimal Appointments
const AppointmentsIconMinimal = ({ sx }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={sx}
  >
    {/* Simple calendar grid */}
    <rect x="12" y="12" width="32" height="32" rx="4" fill="currentColor" opacity="0.8"/>
    <rect x="12" y="8" width="32" height="8" rx="4" fill="currentColor"/>
    {/* Calendar rings */}
    <circle cx="20" cy="4" r="2" fill="currentColor"/>
    <circle cx="36" cy="4" r="2" fill="currentColor"/>
    {/* Clean appointment slots */}
    <rect x="16" y="20" width="6" height="4" rx="1" fill="white" opacity="0.9"/>
    <rect x="26" y="20" width="6" height="4" rx="1" fill="white" opacity="0.7"/>
    <rect x="36" y="20" width="6" height="4" rx="1" fill="white" opacity="0.5"/>
    <rect x="16" y="28" width="6" height="4" rx="1" fill="white" opacity="0.6"/>
    <rect x="26" y="28" width="6" height="4" rx="1" fill="white" opacity="0.8"/>
    <rect x="36" y="28" width="6" height="4" rx="1" fill="white" opacity="0.4"/>
    <rect x="16" y="36" width="6" height="4" rx="1" fill="white" opacity="0.3"/>
    <rect x="26" y="36" width="6" height="4" rx="1" fill="white" opacity="0.5"/>
  </svg>
);

// STYLE 2: Modern Geometric Appointments
const AppointmentsIconGeometric = ({ sx }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={sx}
  >
    {/* Geometric calendar base */}
    <path d="M28 8l12 7v14l-12 7-12-7V15l12-7z" fill="currentColor" opacity="0.8"/>
    {/* Time slots as geometric elements */}
    <circle cx="28" cy="20" r="3" fill="white"/>
    <circle cx="20" cy="24" r="2" fill="white" opacity="0.8"/>
    <circle cx="36" cy="24" r="2" fill="white" opacity="0.8"/>
    <circle cx="28" cy="28" r="2" fill="white" opacity="0.6"/>
    {/* Connection lines representing scheduling */}
    <path d="M20 24l8-4l8 4" stroke="white" strokeWidth="1.5" opacity="0.6"/>
    <path d="M20 24l8 4l8-4" stroke="white" strokeWidth="1.5" opacity="0.4"/>
    {/* Base platform */}
    <rect x="16" y="38" width="24" height="8" rx="4" fill="currentColor" opacity="0.6"/>
  </svg>
);

// STYLE 3: Clock-based Illustration
const AppointmentsIconIllustrative = ({ sx }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={sx}
  >
    {/* Clock face representing time management */}
    <circle cx="28" cy="28" r="18" fill="currentColor" opacity="0.3"/>
    <circle cx="28" cy="28" r="14" fill="currentColor" opacity="0.8"/>
    <circle cx="28" cy="28" r="10" fill="white"/>
    {/* Clock hands */}
    <path d="M28 28V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 28L32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="28" cy="28" r="1.5" fill="currentColor"/>
    {/* Hour markers */}
    <circle cx="28" cy="16" r="1" fill="currentColor"/>
    <circle cx="40" cy="28" r="1" fill="currentColor"/>
    <circle cx="28" cy="40" r="1" fill="currentColor"/>
    <circle cx="16" cy="28" r="1" fill="currentColor"/>
    {/* Appointment indicators around clock */}
    <circle cx="18" cy="18" r="2" fill="currentColor" opacity="0.6"/>
    <circle cx="38" cy="18" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="38" cy="38" r="2" fill="currentColor" opacity="0.7"/>
  </svg>
);

// Supporting icons - minimal style for consistency
const SessionIcon = ({ sx }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
  </svg>
);

const TimeIcon = ({ sx }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <circle cx="10" cy="10" r="8" fill="currentColor"/>
    <path d="M10 6v4l3 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CompletionIcon = ({ sx }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <circle cx="10" cy="10" r="8" fill="currentColor"/>
    <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Clock tick animation
const clockTick = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Floating animation for icons
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Pulse animation for completion
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

// Glow effect for total number
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(137, 149, 129, 0.3); }
  50% { box-shadow: 0 0 20px rgba(137, 149, 129, 0.6); }
`;

function AppointmentsStats({ appointmentsData = {} }) {
  const { colors, isDarkMode } = useTheme();

  // Theme-aware styles
  const styles = useThemeStyles((colors, theme) => ({
    card: {
      height: "100%",
      background: `linear-gradient(135deg, ${colors.backgroundSubtle} 0%, ${colors.backgroundLight} 100%)`,
      borderTop: `4px solid ${colors.mainColor}`,
      borderRadius: theme.borderRadius.lg,
      transition: theme.transitions.normal,
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows.lg,
      },
      '&:hover .total-number': {
        animation: `${glow} 2s ease-in-out infinite`,
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(45deg, ${colors.mainColor}15, transparent)`,
        pointerEvents: 'none',
      }
    },
    iconContainer: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      '& .main-icon': {
        color: colors.mainColor,
        animation: `${float} 3s ease-in-out infinite`,
        filter: `drop-shadow(0 4px 8px ${colors.mainColor}40)`,
        width: '64px',
        height: '64px',
      }
    },
    totalNumber: {
      background: `linear-gradient(135deg, ${colors.mainColor}, ${colors.prevMainColor})`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontFamily: theme.typography.font1.bold,
      textShadow: `0 0 10px ${colors.mainMedium}40`,
    },
    cardTitle: {
      color: colors.textPrimary,
      fontFamily: theme.typography.font1.medium,
      textShadow: `0 1px 3px ${colors.mainColor}20`
    },
    sectionTitle: {
      textTransform: "uppercase",
      color: colors.textSecondary,
      fontFamily: theme.typography.font2.medium,
      letterSpacing: '1px'
    },
    totalLabel: {
      color: colors.textSecondary,
      fontFamily: theme.typography.font2.medium,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontWeight: theme.typography.weightMedium
    },
    demoWarning: {
      color: colors.statusPending,
      backgroundColor: `${colors.statusPending}10`,
      fontFamily: theme.typography.font2.regular,
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: theme.typography.sizeXS
    },
    statItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: colors.backgroundSubtle,
      border: `1px solid ${colors.borderLight}`,
      transition: theme.transitions.fast,
      '&:hover': {
        backgroundColor: colors.backgroundAccent,
        transform: 'translateX(5px)',
      }
    },
    statIcon: {
      fontSize: '1.5rem',
      marginRight: theme.spacing.sm,
      color: colors.mainColor,
    },
    statLabel: {
      color: colors.textSecondary,
      fontFamily: theme.typography.font2.regular,
      fontWeight: theme.typography.weightMedium,
      flexGrow: 1,
    },
    statValue: {
      color: colors.textPrimary,
      fontFamily: theme.typography.font1.medium,
      fontWeight: theme.typography.weightBold,
      fontSize: theme.typography.sizeMD,
    },
    completionRate: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: colors.backgroundAccent,
      border: `1px solid ${colors.confirmGreen}40`,
      textAlign: 'center',
      marginTop: theme.spacing.md,
      backdropFilter: 'blur(10px)',
    },
    completionPercentage: {
      background: `linear-gradient(135deg, ${colors.confirmGreen}, ${colors.accent1})`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontFamily: theme.typography.font1.bold,
      fontSize: theme.typography.sizeLG,
    }
  }));

  // Check if data is available
  const isDataAvailable = appointmentsData && Object.keys(appointmentsData).length > 0;

  const {
    totalAppointments = isDataAvailable ? appointmentsData.totalAppointments : 892,
    todayAppointments = isDataAvailable ? appointmentsData.todayAppointments : 24,
    upcomingAppointments = isDataAvailable ? appointmentsData.upcomingAppointments : 156,
    completedAppointments = isDataAvailable ? appointmentsData.completedAppointments : 712,
  } = appointmentsData;

  const completionRate = ((completedAppointments / totalAppointments) * 100).toFixed(1);

  return (
    <Card sx={styles.card}>
      <MDBox pt={2} px={2} display="flex" flexDirection="column" alignItems="center">
        <MDBox mb={1} sx={styles.iconContainer}>
          <AppointmentsIconMinimal className="main-icon" sx={{ 
            color: colors.mainColor,
            width: '64px',
            height: '64px',
            display: 'block'
          }} />
        </MDBox>
        <MDTypography 
          variant="h6" 
          fontWeight="medium" 
          textAlign="center"
          sx={styles.cardTitle}
        >
          Appointments Statistics
        </MDTypography>
        {!isDataAvailable && (
          <MDTypography 
            variant="caption" 
            display="block" 
            mt={0.5} 
            textAlign="center"
            sx={styles.demoWarning}
          >
            ⚠️ Demo Data
          </MDTypography>
        )}
      </MDBox>
      
      <MDBox pt={1.5} pb={1.5} px={2}>
        {/* Total Appointments */}
        <MDBox mb={1.5} textAlign="center">
          <MDTypography 
            variant="h2" 
            fontWeight="bold" 
            className="total-number"
            sx={styles.totalNumber}
          >
            {totalAppointments.toLocaleString()}
          </MDTypography>
          <MDTypography 
            variant="caption" 
            sx={styles.totalLabel}
          >
            Total Appointments
          </MDTypography>
        </MDBox>

        {/* Appointment Statistics */}
        <MDBox>
          {/* Today */}
          <MDBox sx={styles.statItem}>
            <TimeIcon sx={styles.statIcon} />
            <MDTypography sx={styles.statLabel}>
              Today
            </MDTypography>
            <MDTypography sx={styles.statValue}>
              {todayAppointments}
            </MDTypography>
          </MDBox>

          {/* Upcoming */}
          <MDBox sx={styles.statItem}>
            <AppointmentsIconMinimal sx={{ ...styles.statIcon, fontSize: '1.2rem' }} />
            <MDTypography sx={styles.statLabel}>
              Upcoming
            </MDTypography>
            <MDTypography sx={styles.statValue}>
              {upcomingAppointments}
            </MDTypography>
          </MDBox>

          {/* Completed */}
          <MDBox sx={styles.statItem}>
            <CompletionIcon sx={{ ...styles.statIcon, fontSize: '1.2rem' }} />
            <MDTypography sx={styles.statLabel}>
              Completed
            </MDTypography>
            <MDTypography sx={styles.statValue}>
              {completedAppointments}
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Completion Rate */}
        <MDBox sx={styles.completionRate}>
          <MDTypography 
            variant="overline" 
            fontWeight="medium" 
            mb={0.5} 
            sx={styles.sectionTitle}
          >
            Completion Rate
          </MDTypography>
          <MDTypography 
            variant="h3" 
            fontWeight="bold"
            sx={styles.completionPercentage}
          >
            {completionRate}%
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default AppointmentsStats; 