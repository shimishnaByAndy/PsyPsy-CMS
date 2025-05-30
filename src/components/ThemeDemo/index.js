/**
 * PsyPsy CMS - Theme Demo Component
 * Demonstrates the complete theme system with all colors and components
 */

import React from 'react';

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// PsyPsy Theme System
import { useTheme, useThemeStyles, ThemeMode } from "components/ThemeProvider";

// Icons
import PaletteIcon from '@mui/icons-material/Palette';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

function ThemeDemo() {
  const { colors, isDarkMode, theme } = useTheme();

  // Theme-aware styles
  const styles = useThemeStyles((colors, theme) => ({
    demoContainer: {
      backgroundColor: colors.backgroundDefault,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
    },
    colorCard: {
      backgroundColor: colors.backgroundPaper,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${colors.border}`,
      marginBottom: theme.spacing.md,
    },
    colorSwatch: {
      width: '40px',
      height: '40px',
      borderRadius: theme.borderRadius.sm,
      border: `2px solid ${colors.border}`,
      marginRight: theme.spacing.md,
    },
    colorRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      '&:hover': {
        backgroundColor: colors.backgroundSubtle,
      },
    },
    statusChip: {
      margin: theme.spacing.xs,
      fontWeight: theme.typography.weightMedium,
    },
    themeToggleDemo: {
      backgroundColor: colors.backgroundPaper,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      border: `2px solid ${colors.mainColor}`,
      textAlign: 'center',
    },
  }));

  // Color categories for demonstration
  const colorCategories = [
    {
      title: 'Brand Colors',
      colors: [
        { name: 'Main Color', value: colors.mainColor, description: 'Primary brand color' },
        { name: 'Main Color Text', value: colors.mainColorTxt, description: 'Text variant of main color' },
        { name: 'Previous Main Color', value: colors.prevMainColor, description: 'Lighter brand shade' },
        { name: 'Main Medium', value: colors.mainMedium, description: 'Burgundy accent' },
        { name: 'Main Light', value: colors.mainLight, description: 'Light background variant' },
      ]
    },
    {
      title: 'Status Colors',
      colors: [
        { name: 'Success Green', value: colors.filledGreen, description: 'Success states' },
        { name: 'Confirm Green', value: colors.confirmGreen, description: 'Confirmation actions' },
        { name: 'Error Red', value: colors.errorRed, description: 'Error states' },
        { name: 'Warning', value: colors.statusPending, description: 'Warning states' },
      ]
    },
    {
      title: 'Text Colors',
      colors: [
        { name: 'Primary Text', value: colors.textPrimary, description: 'Main text color' },
        { name: 'Secondary Text', value: colors.textSecondary, description: 'Secondary text' },
        { name: 'Hint Text', value: colors.hintTxt, description: 'Placeholder text' },
        { name: 'Disabled Text', value: colors.textDisabled, description: 'Disabled elements' },
      ]
    },
    {
      title: 'Background Colors',
      colors: [
        { name: 'Default Background', value: colors.backgroundDefault, description: 'Main background' },
        { name: 'Paper Background', value: colors.backgroundPaper, description: 'Card backgrounds' },
        { name: 'Light Background', value: colors.backgroundLight, description: 'Light sections' },
        { name: 'Subtle Background', value: colors.backgroundSubtle, description: 'Hover states' },
      ]
    },
  ];

  const statusChips = [
    { label: 'Active', color: colors.statusActive },
    { label: 'Inactive', color: colors.statusInactive },
    { label: 'Pending', color: colors.statusPending },
    { label: 'Suspended', color: colors.statusSuspended },
    { label: 'Applied', color: colors.statusApplied },
    { label: 'Offer', color: colors.statusOffer },
  ];

  return (
    <MDBox sx={styles.demoContainer}>
      {/* Header */}
      <MDBox mb={4} sx={styles.themeToggleDemo}>
        <MDBox display="flex" alignItems="center" justifyContent="center" mb={2}>
          <PaletteIcon sx={{ color: colors.mainColor, fontSize: '2rem', mr: 1 }} />
          <MDTypography 
            variant="h4" 
            sx={{ 
              color: colors.textPrimary,
              fontWeight: 'bold' 
            }}
          >
            PsyPsy Theme System
          </MDTypography>
        </MDBox>
        
        <MDBox display="flex" alignItems="center" justifyContent="center" mb={2}>
          <ThemeMode
            light={<LightModeIcon sx={{ color: colors.mainColor, mr: 1 }} />}
            dark={<DarkModeIcon sx={{ color: colors.mainColor, mr: 1 }} />}
          />
          <MDTypography 
            variant="h6" 
            sx={{ color: colors.textSecondary }}
          >
            Currently in {isDarkMode ? 'Dark' : 'Light'} Mode
          </MDTypography>
        </MDBox>

        <MDTypography 
          variant="body1" 
          sx={{ color: colors.textSecondary }}
        >
          This demo showcases the complete PsyPsy color scheme and theme system.
          Use the theme toggle in the sidebar to switch between light and dark modes.
        </MDTypography>
      </MDBox>

      {/* Color Categories */}
      <Grid container spacing={3}>
        {colorCategories.map((category, categoryIndex) => (
          <Grid item xs={12} md={6} key={categoryIndex}>
            <Card sx={styles.colorCard}>
              <MDTypography 
                variant="h6" 
                sx={{ 
                  color: colors.textPrimary,
                  mb: 2,
                  fontWeight: 'bold'
                }}
              >
                {category.title}
              </MDTypography>
              
              {category.colors.map((colorItem, colorIndex) => (
                <MDBox key={colorIndex} sx={styles.colorRow}>
                  <MDBox 
                    sx={{
                      ...styles.colorSwatch,
                      backgroundColor: colorItem.value,
                    }}
                  />
                  <MDBox flex={1}>
                    <MDTypography 
                      variant="body2" 
                      sx={{ 
                        color: colors.textPrimary,
                        fontWeight: 'medium'
                      }}
                    >
                      {colorItem.name}
                    </MDTypography>
                    <MDTypography 
                      variant="caption" 
                      sx={{ color: colors.textSecondary }}
                    >
                      {colorItem.description}
                    </MDTypography>
                    <MDTypography 
                      variant="caption" 
                      sx={{ 
                        color: colors.hintTxt,
                        fontFamily: 'monospace',
                        display: 'block'
                      }}
                    >
                      {colorItem.value}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              ))}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Status Chips Demo */}
      <MDBox mt={4}>
        <Card sx={styles.colorCard}>
          <MDTypography 
            variant="h6" 
            sx={{ 
              color: colors.textPrimary,
              mb: 2,
              fontWeight: 'bold'
            }}
          >
            Status Chips
          </MDTypography>
          
          <MDBox display="flex" flexWrap="wrap" gap={1}>
            {statusChips.map((chip, index) => (
              <Chip
                key={index}
                label={chip.label}
                sx={{
                  ...styles.statusChip,
                  backgroundColor: chip.color,
                  color: colors.txt,
                }}
              />
            ))}
          </MDBox>
        </Card>
      </MDBox>

      {/* Button Demo */}
      <MDBox mt={4}>
        <Card sx={styles.colorCard}>
          <MDTypography 
            variant="h6" 
            sx={{ 
              color: colors.textPrimary,
              mb: 2,
              fontWeight: 'bold'
            }}
          >
            Button Styles
          </MDTypography>
          
          <MDBox display="flex" flexWrap="wrap" gap={2}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.mainColor,
                color: colors.txt,
                '&:hover': {
                  backgroundColor: colors.prevMainColor,
                },
              }}
            >
              Primary Button
            </Button>
            
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.mainMedium,
                color: colors.txt,
                '&:hover': {
                  backgroundColor: colors.accent1,
                },
              }}
            >
              Secondary Button
            </Button>
            
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.filledGreen,
                color: colors.txt,
                '&:hover': {
                  backgroundColor: colors.confirmGreen,
                },
              }}
            >
              Success Button
            </Button>
            
            <Button
              variant="outlined"
              sx={{
                borderColor: colors.border,
                color: colors.textPrimary,
                '&:hover': {
                  borderColor: colors.mainColor,
                  backgroundColor: colors.backgroundSubtle,
                },
              }}
            >
              Outlined Button
            </Button>
          </MDBox>
        </Card>
      </MDBox>

      {/* Theme Information */}
      <MDBox mt={4}>
        <Card sx={styles.colorCard}>
          <MDTypography 
            variant="h6" 
            sx={{ 
              color: colors.textPrimary,
              mb: 2,
              fontWeight: 'bold'
            }}
          >
            Theme Information
          </MDTypography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MDTypography 
                variant="body2" 
                sx={{ color: colors.textSecondary }}
              >
                <strong>Mode:</strong> {isDarkMode ? 'Dark' : 'Light'}
              </MDTypography>
              <MDTypography 
                variant="body2" 
                sx={{ color: colors.textSecondary }}
              >
                <strong>Primary Font:</strong> {theme.typography.font1.regular}
              </MDTypography>
              <MDTypography 
                variant="body2" 
                sx={{ color: colors.textSecondary }}
              >
                <strong>Secondary Font:</strong> {theme.typography.font2.regular}
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDTypography 
                variant="body2" 
                sx={{ color: colors.textSecondary }}
              >
                <strong>Border Radius:</strong> {theme.borderRadius.md}
              </MDTypography>
              <MDTypography 
                variant="body2" 
                sx={{ color: colors.textSecondary }}
              >
                <strong>Transition:</strong> {theme.transitions.normal}
              </MDTypography>
              <MDTypography 
                variant="body2" 
                sx={{ color: colors.textSecondary }}
              >
                <strong>Spacing Unit:</strong> {theme.spacing.md}
              </MDTypography>
            </Grid>
          </Grid>
        </Card>
      </MDBox>
    </MDBox>
  );
}

export default ThemeDemo; 