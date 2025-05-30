/**
 * ClientsStats component for PsyPsy CMS Dashboard
 * Displays client statistics: gender, age groups, and other metrics
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

// STYLE 1: Clean Minimal
const ClientsIconMinimal = ({ sx }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={sx}
  >
    {/* Clean circles for people */}
    <circle cx="28" cy="18" r="6" fill="currentColor" opacity="0.9"/>
    <circle cx="16" cy="22" r="4" fill="currentColor" opacity="0.7"/>
    <circle cx="40" cy="22" r="4" fill="currentColor" opacity="0.7"/>
    {/* Simple body shapes */}
    <ellipse cx="28" cy="38" rx="12" ry="8" fill="currentColor" opacity="0.6"/>
    <ellipse cx="16" cy="40" rx="8" ry="6" fill="currentColor" opacity="0.5"/>
    <ellipse cx="40" cy="40" rx="8" ry="6" fill="currentColor" opacity="0.5"/>
    {/* Minimal connection lines */}
    <line x1="22" y1="24" x2="34" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
  </svg>
);

// STYLE 2: Modern Geometric 
const ClientsIconGeometric = ({ sx }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={sx}
  >
    {/* Geometric hexagons */}
    <path d="M28 8l8 4.6v9.2l-8 4.6-8-4.6V12.6L28 8z" fill="currentColor" opacity="0.8"/>
    <path d="M16 20l4 2.3v4.6l-4 2.3-4-2.3v-4.6L16 20z" fill="currentColor" opacity="0.6"/>
    <path d="M40 20l4 2.3v4.6l-4 2.3-4-2.3v-4.6L40 20z" fill="currentColor" opacity="0.6"/>
    {/* Network connections */}
    <path d="M20 23h16M18 25h20" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
    {/* Base platform */}
    <rect x="14" y="36" width="28" height="12" rx="6" fill="currentColor" opacity="0.5"/>
    {/* Accent elements */}
    <circle cx="28" cy="14" r="2" fill="white"/>
    <circle cx="16" cy="23" r="1" fill="white"/>
    <circle cx="40" cy="23" r="1" fill="white"/>
  </svg>
);

// STYLE 3: Heart-based Illustration
const ClientsIconIllustrative = ({ sx }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={sx}
  >
    {/* Heart outline representing care */}
    <path d="M28 46C20 40 12 32 12 24c0-6 4-10 10-10 3 0 6 2 6 2s3-2 6-2c6 0 10 4 10 10 0 8-8 16-16 22z" 
          fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1"/>
    {/* People inside heart */}
    <circle cx="28" cy="22" r="3" fill="currentColor" opacity="0.9"/>
    <circle cx="22" cy="26" r="2" fill="currentColor" opacity="0.7"/>
    <circle cx="34" cy="26" r="2" fill="currentColor" opacity="0.7"/>
    {/* Simple body representations */}
    <rect x="25" y="26" width="6" height="8" rx="3" fill="currentColor" opacity="0.6"/>
    <rect x="20" y="29" width="4" height="6" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="32" y="29" width="4" height="6" rx="2" fill="currentColor" opacity="0.5"/>
    {/* Wellness plus symbols */}
    <g opacity="0.4">
      <path d="M16 16h2M17 15v2" stroke="currentColor" strokeWidth="1"/>
      <path d="M38 16h2M39 15v2" stroke="currentColor" strokeWidth="1"/>
    </g>
  </svg>
);

// Supporting icons - choosing minimal clean style for secondary icons
const WellnessIcon = ({ sx }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.8"/>
    <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SupportIcon = ({ sx }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <rect x="2" y="6" width="16" height="10" rx="2" fill="currentColor" opacity="0.7"/>
    <circle cx="6" cy="4" r="2" fill="currentColor"/>
    <circle cx="14" cy="4" r="2" fill="currentColor"/>
    <path d="M6 8v4M14 8v4" stroke="white" strokeWidth="1.5"/>
  </svg>
);

// Animated heart pulse keyframe
const heartPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Floating animation for icons
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Glow effect for total number
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(137, 149, 129, 0.3); }
  50% { box-shadow: 0 0 20px rgba(137, 149, 129, 0.6); }
`;

function ClientsStats({ clientsData = {} }) {
  const { colors, isDarkMode } = useTheme();

  // Theme-aware styles
  const styles = useThemeStyles((colors, theme) => ({
    card: {
      height: "100%",
      background: `linear-gradient(135deg, ${colors.backgroundLight} 0%, ${colors.backgroundTableLight} 100%)`,
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
    genderSection: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: colors.backgroundSubtle,
      border: `1px solid ${colors.borderLight}`,
      backdropFilter: 'blur(10px)',
    },
    progressBar: {
      width: "70%",
      height: "8px",
      borderRadius: theme.borderRadius.sm,
      backgroundColor: colors.backgroundLight,
      position: "relative",
      marginRight: theme.spacing.sm,
      overflow: 'hidden',
    },
    progressFill: {
      height: "100%",
      borderRadius: theme.borderRadius.sm,
      background: `linear-gradient(90deg, ${colors.mainColor}, ${colors.prevMainColor})`,
      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        animation: 'shimmer 2s infinite',
      }
    },
    genderLabel: {
      color: colors.textSecondary,
      fontFamily: theme.typography.font2.regular,
      fontWeight: theme.typography.weightMedium
    },
    genderValue: {
      color: colors.textPrimary,
      fontFamily: theme.typography.font1.medium,
      minWidth: '60px'
    },
    ageGroupItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${theme.spacing.xs} 0`,
      borderBottom: `1px solid ${colors.borderLight}40`,
      transition: theme.transitions.fast,
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:hover': {
        backgroundColor: `${colors.borderLight}20`,
        borderRadius: theme.borderRadius.sm,
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      },
    },
    ageLabel: {
      color: colors.textSecondary,
      fontFamily: theme.typography.font2.regular,
      fontWeight: theme.typography.weightMedium
    },
    ageValue: {
      color: colors.textPrimary,
      fontFamily: theme.typography.font1.medium
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
    }
  }));

  // Define canonical age ranges
  const canonicalAgeRanges = [
    "14-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"
  ];

  // Check if data is available
  const isDataAvailable = clientsData && Object.keys(clientsData).length > 0;
  
  // Example of populating defaultAgeGroups for mock data
  const mockAgeGroupData = {
    "18-24": 45,
    "25-34": 78,
    "35-44": 62,
    "45-54": 38,
    "55-64": 24,
  };

  const {
    totalClients = isDataAvailable ? clientsData.totalClients : 247,
    genderStats = isDataAvailable ? clientsData.genderStats : {
      men: 87,
      women: 144,
      other: 16
    },
    ageGroupStats = isDataAvailable 
      ? clientsData.ageGroups
      : mockAgeGroupData
  } = clientsData;

  // Combine provided stats with canonical ranges, ensuring all ranges are present
  const processedAgeGroups = canonicalAgeRanges.map(range => ({
    range,
    count: (ageGroupStats && ageGroupStats[range]) || 0
  }));

  const getGenderPercentage = (count) => {
    return ((count / totalClients) * 100).toFixed(1);
  };

  return (
    <Card sx={styles.card}>
      <MDBox pt={2} px={2} display="flex" flexDirection="column" alignItems="center">
        <MDBox mb={1} sx={styles.iconContainer}>
          <ClientsIconMinimal className="main-icon" sx={{ 
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
          Clients Statistics
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
        {/* Total Clients */}
        <MDBox mb={1.5} textAlign="center">
          <MDTypography 
            variant="h2" 
            fontWeight="bold" 
            className="total-number"
            sx={styles.totalNumber}
          >
            {totalClients.toLocaleString()}
          </MDTypography>
          <MDTypography 
            variant="caption" 
            sx={styles.totalLabel}
          >
            Total Clients
          </MDTypography>
        </MDBox>

        {/* Gender Distribution */}
        <MDBox mb={1.5} sx={styles.genderSection}>
          <MDTypography 
            variant="overline" 
            fontWeight="medium" 
            mb={1.5} 
            sx={styles.sectionTitle}
          >
            <SupportIcon sx={{ fontSize: '1.3rem', mr: 0.5, verticalAlign: 'middle' }} />
            Gender Distribution
          </MDTypography>
          
          {/* Men */}
          <MDBox mb={1}>
            <MDTypography 
              variant="caption" 
              display="block" 
              mb={0.5}
              sx={styles.genderLabel}
            >
              Men
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <MDBox sx={styles.progressBar}>
                <MDBox
                  sx={{
                    ...styles.progressFill,
                    width: `${getGenderPercentage(genderStats.men)}%`,
                  }}
                />
              </MDBox>
              <MDTypography 
                variant="caption" 
                fontWeight="bold"
                sx={styles.genderValue}
              >
                {genderStats.men} ({getGenderPercentage(genderStats.men)}%)
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Women */}
          <MDBox mb={1}>
            <MDTypography 
              variant="caption" 
              display="block" 
              mb={0.5}
              sx={styles.genderLabel}
            >
              Women
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <MDBox sx={styles.progressBar}>
                <MDBox
                  sx={{
                    ...styles.progressFill,
                    width: `${getGenderPercentage(genderStats.women)}%`,
                  }}
                />
              </MDBox>
              <MDTypography 
                variant="caption" 
                fontWeight="bold"
                sx={styles.genderValue}
              >
                {genderStats.women} ({getGenderPercentage(genderStats.women)}%)
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Other */}
          <MDBox>
            <MDTypography 
              variant="caption" 
              display="block" 
              mb={0.5}
              sx={styles.genderLabel}
            >
              Other
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <MDBox sx={styles.progressBar}>
                <MDBox
                  sx={{
                    ...styles.progressFill,
                    width: `${getGenderPercentage(genderStats.other)}%`,
                  }}
                />
              </MDBox>
              <MDTypography 
                variant="caption" 
                fontWeight="bold"
                sx={styles.genderValue}
              >
                {genderStats.other} ({getGenderPercentage(genderStats.other)}%)
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Age Groups */}
        <MDBox>
          <MDTypography 
            variant="overline" 
            fontWeight="medium" 
            mb={1} 
            sx={styles.sectionTitle}
          >
            Age Groups
          </MDTypography>
          {processedAgeGroups.filter(group => group.count > 0).map((group, index) => (
            <MDBox key={index} sx={styles.ageGroupItem}>
              <MDTypography 
                variant="caption" 
                sx={styles.ageLabel}
              >
                {group.range}
              </MDTypography>
              <MDTypography 
                variant="caption" 
                fontWeight="bold"
                sx={styles.ageValue}
              >
                {group.count}
              </MDTypography>
            </MDBox>
          ))}
        </MDBox>
      </MDBox>
      
      <style>
        {`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}
      </style>
    </Card>
  );
}

export default ClientsStats; 