/**
 * ProfessionalsStats component for PsyPsy CMS Dashboard
 * Displays professional statistics: gender, age groups, and other metrics
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

// Custom Brain with Mental Health Flower Icon
const BrainFlowerIcon = ({ sx }) => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={sx}
  >
    {/* Brain outline */}
    <path 
      d="M32 8c10 0 20 8 20 18 0 4-1 7-3 10 1 2 1 5 0 7-1 4-4 6-8 7-3 1-5 2-7 2s-4-1-7-2c-4-1-7-3-8-7-1-2-1-5 0-7-2-3-3-6-3-10 0-10 10-18 20-18z" 
      fill="currentColor" 
      opacity="0.7"
    />
    
    {/* Brain hemisphere division */}
    <path 
      d="M32 10v44" 
      stroke="white" 
      strokeWidth="1" 
      opacity="0.4"
    />
    
    {/* Mental Health Flower in center */}
    <g transform="translate(32, 32)">
      {/* Flower petals - 5 petals around center */}
      <g opacity="0.9">
        {/* Top petal */}
        <ellipse cx="0" cy="-8" rx="3" ry="6" fill="white" opacity="0.8"/>
        {/* Top-right petal */}
        <ellipse cx="6" cy="-4" rx="3" ry="6" fill="white" opacity="0.8" transform="rotate(72)"/>
        {/* Bottom-right petal */}
        <ellipse cx="6" cy="-4" rx="3" ry="6" fill="white" opacity="0.8" transform="rotate(144)"/>
        {/* Bottom-left petal */}
        <ellipse cx="6" cy="-4" rx="3" ry="6" fill="white" opacity="0.8" transform="rotate(216)"/>
        {/* Top-left petal */}
        <ellipse cx="6" cy="-4" rx="3" ry="6" fill="white" opacity="0.8" transform="rotate(288)"/>
      </g>
      
      {/* Flower center */}
      <circle cx="0" cy="0" r="2.5" fill="white" opacity="1"/>
      <circle cx="0" cy="0" r="1.5" fill="currentColor" opacity="0.6"/>
      
      {/* Small sparkles around flower */}
      <circle cx="-10" cy="-5" r="1" fill="white" opacity="0.6"/>
      <circle cx="10" cy="-3" r="1" fill="white" opacity="0.6"/>
      <circle cx="-8" cy="8" r="1" fill="white" opacity="0.6"/>
      <circle cx="8" cy="6" r="1" fill="white" opacity="0.6"/>
    </g>
    
    {/* Subtle brain texture lines */}
    <path d="M20 20c3 2 6 3 8 2" stroke="white" strokeWidth="1" opacity="0.3" fill="none"/>
    <path d="M36 22c3 1 5 3 6 5" stroke="white" strokeWidth="1" opacity="0.3" fill="none"/>
    <path d="M22 35c4 1 6 2 8 1" stroke="white" strokeWidth="1" opacity="0.3" fill="none"/>
    <path d="M38 38c2 2 4 3 5 2" stroke="white" strokeWidth="1" opacity="0.3" fill="none"/>
  </svg>
);

function ProfessionalsStats({ professionalsData = {} }) {
  const { colors, isDarkMode } = useTheme();

  // Theme-aware styles
  const styles = useThemeStyles((colors, theme) => ({
    card: {
      height: "100%",
      background: `linear-gradient(135deg, ${colors.backgroundAccent} 0%, ${colors.backgroundSubtle} 100%)`,
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
        fontSize: '4rem !important',
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
  const isDataAvailable = professionalsData && Object.keys(professionalsData).length > 0;

  // Example of populating defaultAgeGroups for mock data
  const mockAgeGroupData = {
    "25-34": 15,
    "35-44": 18,
    "45-54": 8,
    "55-64": 4,
  };

  const {
    totalProfessionals = isDataAvailable ? professionalsData.totalProfessionals : 45,
    genderStats = isDataAvailable ? professionalsData.genderStats : {
      men: 18,
      women: 24,
      other: 3
    },
    ageGroupStats = isDataAvailable 
      ? professionalsData.ageGroups
      : mockAgeGroupData
  } = professionalsData;

  // Combine provided stats with canonical ranges, ensuring all ranges are present
  const processedAgeGroups = canonicalAgeRanges.map(range => ({
    range,
    count: (ageGroupStats && ageGroupStats[range]) || 0
  }));

  const getGenderPercentage = (count) => {
    return ((count / totalProfessionals) * 100).toFixed(1);
  };

  return (
    <Card sx={styles.card}>
      <MDBox pt={2} px={2} display="flex" flexDirection="column" alignItems="center">
        <MDBox mb={1} sx={styles.iconContainer}>
          <BrainFlowerIcon className="main-icon" sx={{ 
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
          Professionals Statistics
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
        {/* Total Professionals */}
        <MDBox mb={1.5} textAlign="center">
          <MDTypography 
            variant="h2" 
            fontWeight="bold" 
            className="total-number"
            sx={styles.totalNumber}
          >
            {totalProfessionals.toLocaleString()}
          </MDTypography>
          <MDTypography 
            variant="caption" 
            sx={styles.totalLabel}
          >
            Total Professionals
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

export default ProfessionalsStats; 