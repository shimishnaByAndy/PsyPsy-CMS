/**
 * PsyPsy CMS - Centralized Theme Configuration
 * This file contains all theme-related constants for consistent styling across the application
 * Now includes comprehensive dark mode support
 */

import colors from "assets/theme/base/colors";
import darkColors from "assets/theme-dark/base/colors";
import typography from "assets/theme/base/typography";
import pxToRem from "assets/theme/functions/pxToRem";

// Dark Mode Colors - Adapted from PsyPsy color scheme
const DARK_MODE_COLORS = {
  // Main Brand Colors - Dark Mode Adaptations
  mainColor: "#899581",        // Keep main brand color
  mainColorTxt: "#A9AC99",     // Lighter for better contrast on dark
  prevMainColor: "#B3B8A2",    // Lighter shade for dark mode
  mainDark: "#FFFFFF",         // White text for dark mode
  txt: "#FFFFFF",              // White text
  bgLight: "#1a1f1c",          // Dark background (dark green-grey)
  bgLight2: "#1f1a1d",         // Dark background variant 2
  mainMedium: "#7d2a47",       // Lighter burgundy for dark mode
  filledGreen: "#2F7A1E",      // Lighter green for dark mode
  mainLight: "#2a2f26",        // Dark variant of main light
  btnNotSel: "#2a2d29",        // Dark button not selected
  tableBgLight: "#1e1e1e",     // Dark table background
  tableBgSuperLight: "#252525", // Dark table background super light
  accent1: "#4D3E5A",          // Lighter purple for dark mode
  accent2: "#9BA085",          // Lighter grey-green for dark mode
  mTyStatus: "#B7B7B7",        // Lighter status color
  hintTxt: "#BD9E93",          // Lighter hint text
  errorRed: "#FF4444",         // Lighter error red for dark mode
  cancelBg: "#4A2A2A",         // Dark cancel background
  confirmGreen: "#21CA83",     // Lighter confirm green
  noAnsYet: "#B8B8B8",         // Lighter no answer color
  apptOffer: "#B8B8B8",        // Lighter appointment offer
  apptApplied: "#7d2a47",      // Same as mainMedium
  closeHandle: "#4A4A4A",      // Darker close handle
};

// Theme Mode System
export const createThemeColors = (isDarkMode = false) => {
  const baseColors = isDarkMode ? DARK_MODE_COLORS : colors.psypsy;
  
  return {
    // Main Brand Colors
    mainColor: baseColors.mainColor,
    mainColorTxt: baseColors.mainColorTxt,
    prevMainColor: baseColors.prevMainColor,
    mainDark: baseColors.mainDark,
    txt: baseColors.txt,
    bgLight: baseColors.bgLight,
    bgLight2: baseColors.bgLight2,
    mainMedium: baseColors.mainMedium,
    filledGreen: baseColors.filledGreen,
    mainLight: baseColors.mainLight,
    btnNotSel: baseColors.btnNotSel,
    tableBgLight: baseColors.tableBgLight,
    tableBgSuperLight: baseColors.tableBgSuperLight,
    accent1: baseColors.accent1,
    accent2: baseColors.accent2,
    mTyStatus: baseColors.mTyStatus,
    hintTxt: baseColors.hintTxt,
    errorRed: baseColors.errorRed,
    cancelBg: baseColors.cancelBg,
    confirmGreen: baseColors.confirmGreen,
    noAnsYet: baseColors.noAnsYet,
    apptOffer: baseColors.apptOffer,
    apptApplied: baseColors.apptApplied,
    closeHandle: baseColors.closeHandle,
    
    // Legacy compatibility (mapped to new colors)
    primary: baseColors.mainColor,
    primaryLight: baseColors.prevMainColor,
    secondary: baseColors.mainMedium,
    accent: baseColors.accent1,
    
    // Status Colors
    success: isDarkMode ? DARK_MODE_COLORS.filledGreen : colors.semantic.success,
    warning: "#FFC107", // Keep standard warning in both modes
    error: baseColors.errorRed,
    info: baseColors.mainColor,
    
    // Text Colors
    textPrimary: baseColors.mainDark,
    textSecondary: baseColors.mainColorTxt,
    textHint: baseColors.hintTxt,
    textDisabled: baseColors.mTyStatus,
    textWhite: baseColors.txt,
    
    // Background Colors
    backgroundDefault: baseColors.bgLight,
    backgroundPaper: isDarkMode ? DARK_MODE_COLORS.tableBgLight : colors.background.paper,
    backgroundLight: baseColors.mainLight,
    backgroundSubtle: baseColors.btnNotSel,
    backgroundAccent: baseColors.bgLight2,
    backgroundTableLight: baseColors.tableBgLight,
    
    // UI Colors
    border: isDarkMode ? "#4A4A4A" : colors.ui.border,
    borderLight: isDarkMode ? "#3A3A3A" : colors.ui.borderLight,
    borderDark: baseColors.accent2,
    shadow: isDarkMode ? "rgba(255, 255, 255, 0.1)" : colors.ui.shadow,
    overlay: isDarkMode ? "rgba(0, 0, 0, 0.7)" : colors.ui.overlay,
    
    // Status-specific colors
    statusActive: baseColors.filledGreen,
    statusInactive: baseColors.mTyStatus,
    statusPending: "#FFC107",
    statusSuspended: baseColors.errorRed,
    statusOnline: baseColors.confirmGreen,
    statusOffline: baseColors.mTyStatus,
    statusApplied: baseColors.apptApplied,
    statusOffer: baseColors.apptOffer,
    statusNoAnswer: baseColors.noAnsYet,
  };
};

// Centralized Theme Constants
export const THEME = {
  // Colors - Using exact app color scheme (light mode by default)
  colors: createThemeColors(false),

  // Typography - Using exact app font structure
  typography: {
    // Font Families - Font1 (Josefin Sans)
    font1: {
      regular: '"JosefinSans-Regular", "Josefin Sans", sans-serif',
      light: '"JosefinSans-Light", "Josefin Sans", sans-serif',
      medium: '"JosefinSans-Medium", "Josefin Sans", sans-serif',
      lightItalic: '"JosefinSans-LightItalic", "Josefin Sans", sans-serif',
      bold: '"JosefinSans-Bold", "Josefin Sans", sans-serif',
    },
    
    // Font Families - Font2 (Quicksand)
    font2: {
      regular: '"Quicksand-Regular", "Quicksand", sans-serif',
      light: '"Quicksand-Light", "Quicksand", sans-serif',
      medium: '"Quicksand-Medium", "Quicksand", sans-serif',
      semibold: '"Quicksand-SemiBold", "Quicksand", sans-serif',
      bold: '"Quicksand-Bold", "Quicksand", sans-serif',
    },
    
    // Special Fonts
    fonts: {
      logo: '"Romantically", cursive',
      icons: '"icomoon"',
    },
    
    // Legacy compatibility
    fontPrimary: '"JosefinSans-Regular", "Josefin Sans", sans-serif',
    fontJosefinSans: '"Josefin Sans", sans-serif',
    fontQuicksand: '"Quicksand", sans-serif',
    fontRomantically: '"Romantically", cursive',
    
    // Font Weights
    weightLight: 300,
    weightRegular: 400,
    weightMedium: 500,
    weightSemiBold: 600,
    weightBold: 700,
    
    // Font Sizes (using pxToRem for consistency)
    sizeXXS: pxToRem(10),
    sizeXS: pxToRem(12),
    sizeSM: pxToRem(14),
    sizeMD: pxToRem(16),
    sizeLG: pxToRem(18),
    sizeXL: pxToRem(20),
    size2XL: pxToRem(24),
    size3XL: pxToRem(30),
    size4XL: pxToRem(36),
    size5XL: pxToRem(48),
  },

  // Spacing - Consistent spacing values
  spacing: {
    xs: pxToRem(4),
    sm: pxToRem(8),
    md: pxToRem(16),
    lg: pxToRem(24),
    xl: pxToRem(32),
    xxl: pxToRem(48),
    xxxl: pxToRem(64),
  },

  // Border Radius
  borderRadius: {
    xs: pxToRem(2),
    sm: pxToRem(4),
    md: pxToRem(8),
    lg: pxToRem(12),
    xl: pxToRem(16),
    xxl: pxToRem(24),
    round: "50%",
  },

  // Shadows
  shadows: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    md: "0 4px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)",
    colored: colors.coloredShadows,
  },

  // Component-specific styles
  components: {
    // Header styles
    header: {
      backgroundColor: colors.psypsy.mainColor,
      textColor: colors.psypsy.txt,
      height: pxToRem(72),
      padding: `${pxToRem(16)} ${pxToRem(24)}`,
    },

    // Card styles
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: pxToRem(12),
      padding: pxToRem(24),
      shadow: "0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.1)",
    },

    // Button styles
    button: {
      borderRadius: pxToRem(8),
      paddingX: pxToRem(24),
      paddingY: pxToRem(12),
      fontWeight: 500,
      fontSize: pxToRem(14),
    },

    // Input styles
    input: {
      borderRadius: pxToRem(8),
      borderColor: colors.ui.border,
      focusBorderColor: colors.psypsy.mainColor,
      padding: `${pxToRem(12)} ${pxToRem(16)}`,
    },

    // Table styles
    table: {
      headerBackgroundColor: colors.psypsy.mainLight,
      borderColor: colors.ui.borderLight,
      hoverBackgroundColor: colors.background.subtle,
      stripedBackgroundColor: colors.psypsy.tableBgLight,
    },

    // Language toggle styles
    languageToggle: {
      containerWidth: pxToRem(280),
      containerHeight: pxToRem(48),
      borderRadius: pxToRem(30),
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      indicatorColor: "rgba(255, 255, 255, 0.15)",
      textColor: colors.psypsy.txt,
      transition: "all 0.3s ease",
    },

    // Modal styles
    modal: {
      backgroundColor: colors.background.paper,
      borderRadius: pxToRem(16),
      padding: pxToRem(32),
      shadow: "0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)",
      overlayColor: colors.ui.overlay,
    },

    // Badge styles
    badge: {
      borderRadius: pxToRem(12),
      paddingX: pxToRem(8),
      paddingY: pxToRem(4),
      fontSize: pxToRem(10),
      fontWeight: 700,
    },

    // Filter styles
    filter: {
      backgroundColor: colors.background.subtle,
      borderColor: colors.ui.border,
      borderRadius: pxToRem(8),
      padding: pxToRem(16),
      activeChipColor: colors.psypsy.mainColor,
    },
  },

  // Animation & Transitions
  transitions: {
    fast: "0.15s ease",
    normal: "0.3s ease",
    slow: "0.5s ease",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  },

  // Breakpoints (matching Material-UI)
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },

  // Z-index levels
  zIndex: {
    tooltip: 1500,
    modal: 1300,
    snackbar: 1400,
    drawer: 1200,
    appBar: 1100,
    overlay: 1000,
  },
};

// Dark Mode Theme - Dynamic theme creation
export const createDarkTheme = () => ({
  ...THEME,
  colors: createThemeColors(true),
  components: {
    ...THEME.components,
    // Override component styles for dark mode
    header: {
      ...THEME.components.header,
      backgroundColor: DARK_MODE_COLORS.mainColor,
      textColor: DARK_MODE_COLORS.txt,
    },
    card: {
      ...THEME.components.card,
      backgroundColor: DARK_MODE_COLORS.tableBgLight,
      shadow: "0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)",
    },
    input: {
      ...THEME.components.input,
      borderColor: DARK_MODE_COLORS.closeHandle,
      focusBorderColor: DARK_MODE_COLORS.mainColor,
    },
    table: {
      ...THEME.components.table,
      headerBackgroundColor: DARK_MODE_COLORS.mainLight,
      borderColor: DARK_MODE_COLORS.closeHandle,
      hoverBackgroundColor: DARK_MODE_COLORS.btnNotSel,
      stripedBackgroundColor: DARK_MODE_COLORS.tableBgSuperLight,
    },
    modal: {
      ...THEME.components.modal,
      backgroundColor: DARK_MODE_COLORS.tableBgLight,
      overlayColor: "rgba(0, 0, 0, 0.8)",
    },
    filter: {
      ...THEME.components.filter,
      backgroundColor: DARK_MODE_COLORS.btnNotSel,
      borderColor: DARK_MODE_COLORS.closeHandle,
      activeChipColor: DARK_MODE_COLORS.mainColor,
    },
  },
  shadows: {
    ...THEME.shadows,
    colored: darkColors.coloredShadows,
  },
});

// Helper functions for common styling patterns
export const styleHelpers = {
  // Create gradient background
  gradient: (startColor, endColor, direction = "135deg") =>
    `linear-gradient(${direction}, ${startColor}, ${endColor})`,

  // Create responsive font size
  responsiveFont: (minSize, maxSize) => ({
    fontSize: `clamp(${pxToRem(minSize)}, 2.5vw, ${pxToRem(maxSize)})`,
  }),

  // Create centered flex
  flexCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Create hover transition
  hoverTransition: (property = "all") => ({
    transition: `${property} ${THEME.transitions.normal}`,
  }),

  // Create truncated text
  truncate: (lines = 1) => ({
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),

  // Create glass effect
  glass: (opacity = 0.1) => ({
    backgroundColor: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: "blur(10px)",
    border: `1px solid rgba(255, 255, 255, ${opacity * 2})`,
  }),
};

// Common component style presets - Theme-aware
export const createComponentStyles = (isDarkMode = false) => {
  const themeColors = createThemeColors(isDarkMode);
  
  return {
    // Page header
    pageHeader: {
      backgroundColor: themeColors.mainColor,
      color: themeColors.txt,
      borderRadius: THEME.borderRadius.lg,
      padding: THEME.spacing.lg,
      marginBottom: THEME.spacing.xl,
      boxShadow: isDarkMode 
        ? "0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)"
        : "0 8px 26px -4px rgba(137, 149, 129, 0.15), 0 8px 9px -5px rgba(137, 149, 129, 0.06)",
      minHeight: '80px',
      overflow: 'visible',
      '& > *': {
        flexShrink: 0
      }
    },

    // Search input
    searchInput: {
      "& .MuiOutlinedInput-root": {
        borderRadius: THEME.borderRadius.md,
        backgroundColor: themeColors.backgroundPaper,
        "& fieldset": {
          borderColor: themeColors.border,
        },
        "&:hover fieldset": {
          borderColor: themeColors.mainColor,
        },
        "&.Mui-focused fieldset": {
          borderColor: themeColors.mainColor,
        },
      },
    },

    // Data grid
    dataGrid: {
      "& .MuiDataGrid-cell": {
        borderBottom: `1px solid ${themeColors.borderLight}`,
        color: themeColors.textPrimary,
      },
      "& .MuiDataGrid-columnHeaders": {
        backgroundColor: themeColors.backgroundLight,
        borderBottom: `2px solid ${themeColors.border}`,
        color: themeColors.textPrimary,
      },
      "& .MuiDataGrid-row:hover": {
        backgroundColor: themeColors.backgroundSubtle,
      },
      "& .MuiDataGrid-root": {
        backgroundColor: themeColors.backgroundPaper,
        color: themeColors.textPrimary,
      },
    },

    // Status chip
    statusChip: {
      active: {
        backgroundColor: themeColors.statusActive,
        color: themeColors.txt,
      },
      inactive: {
        backgroundColor: themeColors.statusInactive,
        color: themeColors.txt,
      },
      pending: {
        backgroundColor: themeColors.statusPending,
        color: isDarkMode ? themeColors.textPrimary : "#000000",
      },
      suspended: {
        backgroundColor: themeColors.statusSuspended,
        color: themeColors.txt,
      },
      applied: {
        backgroundColor: themeColors.statusApplied,
        color: themeColors.txt,
      },
      offer: {
        backgroundColor: themeColors.statusOffer,
        color: themeColors.txt,
      },
      noAnswer: {
        backgroundColor: themeColors.statusNoAnswer,
        color: themeColors.txt,
      },
    },
  };
};

// Legacy export for backward compatibility
export const componentStyles = createComponentStyles(false);

export default THEME; 