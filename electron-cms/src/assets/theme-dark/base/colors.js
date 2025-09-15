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
 * PsyPsy CMS Dark Theme Colors
 * Dark mode adaptation of the exact app color scheme
 */

// PsyPsy Brand Colors - Dark Mode Adaptations
const psypsyDarkColors = {
  // Main brand colors adapted for dark mode
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

const colors = {
  background: {
    default: psypsyDarkColors.bgLight,      // "#1a1f1c" - Dark green-grey
    sidenav: "#1f2420",                     // Slightly different for sidenav
    card: psypsyDarkColors.tableBgLight,    // "#1e1e1e" - Dark card background
  },

  text: {
    main: psypsyDarkColors.mainDark,        // "#FFFFFF" - White text
    focus: psypsyDarkColors.mainDark,       // "#FFFFFF" - White text
  },

  transparent: {
    main: "rgba(0, 0, 0, 0)",
  },

  white: {
    main: psypsyDarkColors.txt,             // "#FFFFFF"
    focus: psypsyDarkColors.txt,            // "#FFFFFF"
  },

  black: {
    light: "#000000",
    main: "#000000",
    focus: "#000000",
  },

  primary: {
    main: psypsyDarkColors.mainColor,       // "#899581" - Main brand color
    focus: psypsyDarkColors.prevMainColor,  // "#B3B8A2" - Lighter for focus
  },

  secondary: {
    main: psypsyDarkColors.mainMedium,      // "#7d2a47" - Burgundy
    focus: psypsyDarkColors.accent1,        // "#4D3E5A" - Purple accent
  },

  info: {
    main: psypsyDarkColors.mainColor,       // "#899581" - Using main color for info
    focus: psypsyDarkColors.prevMainColor,  // "#B3B8A2" - Lighter for focus
  },

  success: {
    main: psypsyDarkColors.filledGreen,     // "#2F7A1E" - Success green
    focus: psypsyDarkColors.confirmGreen,   // "#21CA83" - Confirm green
  },

  warning: {
    main: "#FFC107",                        // Keep standard warning yellow
    focus: psypsyDarkColors.hintTxt,        // "#BD9E93" - Hint text for focus
  },

  error: {
    main: psypsyDarkColors.errorRed,        // "#FF4444" - Error red
    focus: psypsyDarkColors.cancelBg,       // "#4A2A2A" - Cancel background
  },

  light: {
    main: psypsyDarkColors.mainLight,       // "#2a2f26" - Dark light variant
    focus: psypsyDarkColors.bgLight,        // "#1a1f1c" - Background
  },

  dark: {
    main: psypsyDarkColors.mainDark,        // "#FFFFFF" - White for dark mode
    focus: psypsyDarkColors.accent1,        // "#4D3E5A" - Purple accent
  },

  grey: {
    100: psypsyDarkColors.tableBgSuperLight, // "#252525"
    200: psypsyDarkColors.tableBgLight,      // "#1e1e1e"
    300: psypsyDarkColors.btnNotSel,         // "#2a2d29"
    400: psypsyDarkColors.mainLight,         // "#2a2f26"
    500: psypsyDarkColors.closeHandle,       // "#4A4A4A"
    600: psypsyDarkColors.mTyStatus,         // "#B7B7B7"
    700: psypsyDarkColors.accent2,           // "#9BA085"
    800: psypsyDarkColors.hintTxt,           // "#BD9E93"
    900: psypsyDarkColors.noAnsYet,          // "#B8B8B8"
  },

  gradients: {
    primary: {
      main: psypsyDarkColors.mainColor,     // "#899581"
      state: psypsyDarkColors.prevMainColor, // "#B3B8A2"
    },

    secondary: {
      main: psypsyDarkColors.mainMedium,    // "#7d2a47"
      state: psypsyDarkColors.accent1,      // "#4D3E5A"
    },

    psypsy: {
      main: psypsyDarkColors.mainMedium,    // "#7d2a47"
      state: "#8d3a57",                     // Slightly lighter burgundy
    },

    info: {
      main: psypsyDarkColors.mainColor,     // "#899581"
      state: psypsyDarkColors.prevMainColor, // "#B3B8A2"
    },

    success: {
      main: psypsyDarkColors.filledGreen,   // "#2F7A1E"
      state: psypsyDarkColors.confirmGreen, // "#21CA83"
    },

    warning: {
      main: "#FFC107",                      // Standard warning
      state: psypsyDarkColors.hintTxt,      // "#BD9E93"
    },

    error: {
      main: psypsyDarkColors.errorRed,      // "#FF4444"
      state: psypsyDarkColors.cancelBg,     // "#4A2A2A"
    },

    light: {
      main: psypsyDarkColors.mainLight,     // "#2a2f26"
      state: psypsyDarkColors.bgLight,      // "#1a1f1c"
    },

    dark: {
      main: psypsyDarkColors.mainDark,      // "#FFFFFF"
      state: psypsyDarkColors.accent1,      // "#4D3E5A"
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
      background: psypsyDarkColors.mainColor,     // "#899581"
      text: psypsyDarkColors.txt,                 // "#FFFFFF"
    },

    secondary: {
      background: psypsyDarkColors.mainMedium,    // "#7d2a47"
      text: psypsyDarkColors.txt,                 // "#FFFFFF"
    },

    info: {
      background: psypsyDarkColors.mainColor,     // "#899581"
      text: psypsyDarkColors.txt,                 // "#FFFFFF"
    },

    success: {
      background: psypsyDarkColors.filledGreen,   // "#2F7A1E"
      text: psypsyDarkColors.txt,                 // "#FFFFFF"
    },

    warning: {
      background: "#FFC107",                      // Standard warning
      text: psypsyDarkColors.mainDark,            // "#FFFFFF"
    },

    error: {
      background: psypsyDarkColors.errorRed,      // "#FF4444"
      text: psypsyDarkColors.txt,                 // "#FFFFFF"
    },

    light: {
      background: psypsyDarkColors.mainLight,     // "#2a2f26"
      text: psypsyDarkColors.mainDark,            // "#FFFFFF"
    },

    dark: {
      background: psypsyDarkColors.mainDark,      // "#FFFFFF"
      text: "#000000",                            // Black text on white
    },
  },

  coloredShadows: {
    primary: "#899581",
    secondary: "#7d2a47", 
    info: "#899581",
    success: "#2F7A1E",
    warning: "#FFC107",
    error: "#FF4444",
    light: "#2a2f26",
    dark: "#FFFFFF",
  },

  inputBorderColor: "#4A4A4A",
  tabs: {
    indicator: { boxShadow: "#899581" },
  },
};

export default colors;
