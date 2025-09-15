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

/**
 * PsyPsy CMS Enhanced Color System
 * Centralized color palette with semantic naming for consistent theming
 */

// PsyPsy Brand Colors - Using exact app color scheme
const psypsyColors = {
  mainColor: "#899581",        // Main brand color
  mainColorTxt: "#899581",     // Main color for text
  prevMainColor: "#A9AC99",    // Previous main color (lighter shade)
  mainDark: "#000000",         // Main dark color
  txt: "#FFFFFF",              // White text
  bgLight: "#F2F0ED",          // Light background
  bgLight2: "#fbf4f7",         // Light background variant 2
  mainMedium: "#5d1c33",       // Medium main color (burgundy)
  filledGreen: "#1F650E",      // Filled green
  mainLight: "#F8F8EE",        // Main light color
  btnNotSel: "#F6F7F5",        // Button not selected
  tableBgLight: "#FAFAFA",     // Table background light
  tableBgSuperLight: "#F9F9F9", // Table background super light
  accent1: "#3D314A",          // Accent color 1 (purple)
  accent2: "#B3B8A2",          // Accent color 2 (grey-green)
  mTyStatus: "#A7A7A7",        // Status color
  hintTxt: "#AD9E93",          // Hint text color
  errorRed: "#D00000",         // Error red
  cancelBg: "#FFCBCB",         // Cancel background
  confirmGreen: "#11BA73",     // Confirm green
  noAnsYet: "#A8A8A8",         // No answer yet
  apptOffer: "#A8A8A8",        // Appointment offer
  apptApplied: "#5d1c33",      // Appointment applied
  closeHandle: "#DADADA",      // Close handle
};

// Semantic Colors - Mapped to app colors
const semanticColors = {
  success: psypsyColors.filledGreen,      // Success green
  confirmSuccess: psypsyColors.confirmGreen, // Confirmation green
  warning: "#FFC107",                     // Warning yellow (keeping standard)
  error: psypsyColors.errorRed,           // Error red
  info: psypsyColors.mainColor,           // Info using main color
  
  // Text colors
  textPrimary: psypsyColors.mainDark,     // Main text (black)
  textSecondary: psypsyColors.mainColorTxt, // Secondary text (main color)
  textHint: psypsyColors.hintTxt,         // Hint text
  textDisabled: psypsyColors.mTyStatus,   // Disabled text
  textWhite: psypsyColors.txt,            // White text
};

// Background Colors - Mapped to app colors
const backgroundColors = {
  default: psypsyColors.bgLight,          // Main background
  paper: psypsyColors.txt,                // Card/paper background (white)
  light: psypsyColors.mainLight,          // Light background
  superLight: psypsyColors.tableBgSuperLight, // Super light background
  subtle: psypsyColors.btnNotSel,         // Subtle background
  accent: psypsyColors.bgLight2,          // Accent background
  tableLight: psypsyColors.tableBgLight,  // Table light background
};

// Status Colors - Mapped to app colors
const statusColors = {
  active: psypsyColors.filledGreen,       // Active status
  inactive: psypsyColors.mTyStatus,       // Inactive status
  pending: "#FFC107",                     // Pending status (warning yellow)
  suspended: psypsyColors.errorRed,       // Suspended status
  online: psypsyColors.confirmGreen,      // Online indicator
  offline: psypsyColors.mTyStatus,        // Offline indicator
  applied: psypsyColors.apptApplied,      // Applied status
  offer: psypsyColors.apptOffer,          // Offer status
  noAnswer: psypsyColors.noAnsYet,        // No answer status
};

// UI Element Colors - Mapped to app colors
const uiColors = {
  border: "#E0E0E0",                      // Default border (keeping standard)
  borderLight: "#F0F0F0",                 // Light border (keeping standard)
  borderDark: psypsyColors.accent2,       // Dark border
  shadow: "rgba(0, 0, 0, 0.1)",          // Default shadow
  overlay: "rgba(0, 0, 0, 0.5)",         // Overlay background
  closeHandle: psypsyColors.closeHandle,  // Close handle color
  cancelBg: psypsyColors.cancelBg,        // Cancel background
};

const colors = {
  // PsyPsy brand system
  psypsy: psypsyColors,
  semantic: semanticColors,
  background: backgroundColors,
  status: statusColors,
  ui: uiColors,

  // Legacy Material-UI compatibility
  background: {
    default: backgroundColors.default,
  },

  text: {
    main: semanticColors.textSecondary,
    focus: semanticColors.textSecondary,
  },

  transparent: {
    main: "rgba(0, 0, 0, 0)",
  },

  white: {
    main: psypsyColors.txt,
    focus: psypsyColors.txt,
  },

  black: {
    light: psypsyColors.mainDark,
    main: psypsyColors.mainDark,
    focus: psypsyColors.mainDark,
  },

  primary: {
    main: psypsyColors.mainColor,
    focus: psypsyColors.prevMainColor,
    light: psypsyColors.prevMainColor,
    dark: psypsyColors.mainMedium,
  },

  secondary: {
    main: psypsyColors.mainMedium,
    focus: psypsyColors.accent1,
    light: psypsyColors.prevMainColor,
    dark: psypsyColors.accent1,
  },

  info: {
    main: psypsyColors.mainColor,
    focus: psypsyColors.prevMainColor,
    light: psypsyColors.prevMainColor,
    dark: psypsyColors.mainMedium,
  },

  success: {
    main: semanticColors.success,
    focus: semanticColors.confirmSuccess,
    light: "#C8E6C9",
    dark: "#2E7D32",
  },

  warning: {
    main: semanticColors.warning,
    focus: psypsyColors.hintTxt,
    light: "#FFF3CD",
    dark: "#F57C00",
  },

  error: {
    main: semanticColors.error,
    focus: psypsyColors.cancelBg,
    light: "#FFEBEE",
    dark: "#C62828",
  },

  light: {
    main: backgroundColors.light,
    focus: backgroundColors.default,
  },

  dark: {
    main: semanticColors.textPrimary,
    focus: psypsyColors.accent1,
  },

  grey: {
    100: backgroundColors.light,
    200: backgroundColors.default,
    300: backgroundColors.accent,
    400: backgroundColors.subtle,
    500: backgroundColors.superLight,
    600: backgroundColors.tableLight,
    700: psypsyColors.accent2,
    800: semanticColors.textDisabled,
    900: psypsyColors.noAnsYet,
  },

  gradients: {
    primary: {
      main: psypsyColors.mainColor,
      state: psypsyColors.prevMainColor,
    },

    secondary: {
      main: psypsyColors.mainMedium,
      state: psypsyColors.accent1,
    },

    psypsy: {
      main: psypsyColors.mainMedium,
      state: "#732141",
    },

    info: {
      main: psypsyColors.mainColor,
      state: psypsyColors.prevMainColor,
    },

    success: {
      main: semanticColors.success,
      state: semanticColors.confirmSuccess,
    },

    warning: {
      main: semanticColors.warning,
      state: psypsyColors.hintTxt,
    },

    error: {
      main: semanticColors.error,
      state: psypsyColors.cancelBg,
    },

    light: {
      main: backgroundColors.light,
      state: backgroundColors.default,
    },

    dark: {
      main: semanticColors.textPrimary,
      state: psypsyColors.accent1,
    },
  },

  socialMediaColors: {
    facebook: {
      main: "#3b5998",
      dark: "#344e86",
    },

    twitter: {
      main: "#55acee",
      dark: "#3ea1ec",
    },

    instagram: {
      main: "#125688",
      dark: "#0e456d",
    },

    linkedin: {
      main: "#0077b5",
      dark: "#00669c",
    },

    pinterest: {
      main: "#cc2127",
      dark: "#b21d22",
    },

    youtube: {
      main: "#e52d27",
      dark: "#d41f1a",
    },

    vimeo: {
      main: "#1ab7ea",
      dark: "#13a3d2",
    },

    slack: {
      main: "#3aaf85",
      dark: "#329874",
    },

    dribbble: {
      main: "#ea4c89",
      dark: "#e73177",
    },

    github: {
      main: "#24292e",
      dark: "#171a1d",
    },

    reddit: {
      main: "#ff4500",
      dark: "#e03d00",
    },

    tumblr: {
      main: "#35465c",
      dark: "#2a3749",
    },
  },

  badgeColors: {
    primary: {
      background: psypsyColors.mainColor,
      text: psypsyColors.txt,
    },

    secondary: {
      background: psypsyColors.mainMedium,
      text: psypsyColors.txt,
    },

    info: {
      background: psypsyColors.mainColor,
      text: psypsyColors.txt,
    },

    success: {
      background: semanticColors.success,
      text: psypsyColors.txt,
    },

    warning: {
      background: semanticColors.warning,
      text: psypsyColors.mainDark,
    },

    error: {
      background: semanticColors.error,
      text: psypsyColors.txt,
    },

    light: {
      background: backgroundColors.light,
      text: semanticColors.textPrimary,
    },

    dark: {
      background: semanticColors.textPrimary,
      text: psypsyColors.txt,
    },
  },

  coloredShadows: {
    primary: "#899581",
    secondary: "#5d1c33", 
    info: "#899581",
    success: "#1F650E",
    warning: "#FFC107",
    error: "#D00000",
    light: "#F8F8EE",
    dark: "#000000",
  },

  inputBorderColor: uiColors.border,
  tabs: {
    indicator: { boxShadow: "#899581" },
  },
};

export default colors;
