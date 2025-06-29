/**
 * PsyPsy CMS - Global Theme System
 * 
 * A comprehensive theme system that defines all design tokens for consistent
 * styling across the entire application. This is the single source of truth
 * for colors, typography, spacing, shadows, borders, and component styles.
 */

import { createTheme } from '@mui/material/styles';

// Import legacy theme functions for backward compatibility
import boxShadow from 'assets/theme/functions/boxShadow';
import linearGradient from 'assets/theme/functions/linearGradient';
import pxToRem from 'assets/theme/functions/pxToRem';
import rgba from 'assets/theme/functions/rgba';

// ==========================================
// DESIGN TOKENS
// ==========================================

// Color Palette - PsyPsy Brand Colors
const brandColors = {
  // Primary Brand Colors (from PsyPsy specification)
  primary: {
    main: '#899581',
    light: '#a4b695',
    dark: '#6d7766',
    contrastText: '#ffffff'
  },
  
  secondary: {
    main: '#5d1c33',
    light: '#7d2a47', 
    dark: '#3d1021',
    contrastText: '#ffffff'
  },
  
  // Semantic Colors
  success: {
    main: '#11BA73',
    light: '#4dd796',
    dark: '#0c9559',
    contrastText: '#ffffff'
  },
  
  warning: {
    main: '#FF6B00',
    light: '#ff8533',
    dark: '#cc5500',
    contrastText: '#ffffff'
  },
  
  error: {
    main: '#D00000',
    light: '#d93333',
    dark: '#a60000',
    contrastText: '#ffffff'
  },
  
  info: {
    main: '#899581',
    light: '#a4b695',
    dark: '#6d7766',
    contrastText: '#ffffff'
  },
  
  // Neutral Colors
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    main: '#9e9e9e', // Legacy support - add main property
    contrastText: '#ffffff'
  },
  
  // Legacy Material Dashboard color properties - ESSENTIAL for compatibility
  white: {
    main: '#ffffff',
    focus: '#ffffff',
    contrastText: '#000000'
  },
  
  black: {
    main: '#000000',
    focus: '#000000',
    contrastText: '#ffffff'
  },
  
  dark: {
    main: '#344767',
    focus: '#2d3748',
    contrastText: '#ffffff'
  },
  
  light: {
    main: '#ffffff',
    focus: '#f5f5f5',
    contrastText: '#000000'
  },
  
  transparent: {
    main: 'transparent',
    focus: 'transparent',
    contrastText: '#000000'
  },
  
  // Legacy text color - ESSENTIAL for text.main compatibility
  text: {
    main: '#344767',
    focus: '#2d3748',
    primary: '#344767',
    secondary: '#7b809a',
    disabled: '#a0a0a0',
    contrastText: '#ffffff'
  }
};

// Semantic Colors
const semanticColors = {
  text: {
    primary: '#000000', // mainDark
    secondary: '#899581', // mainColorTxt
    disabled: '#A7A7A7', // mTyStatus
    hint: '#AD9E93' // hintTxt
  },
  
  background: {
    default: '#F2F0ED', // bgLight
    paper: '#FFFFFF', // txt (white for paper)
    light: '#F8F8EE', // mainLight
    dark: '#F9F9F9', // tableBgSuperLight
    // Specific sidenav background for Material Dashboard compatibility
    sidenav: `linear-gradient(to bottom, 
      rgba(51, 15, 28, 1) 0%, 
      rgba(78, 23, 43, 0.95) 15%, 
      rgba(93, 28, 51, 0.9) 30%, 
      rgba(93, 28, 51, 1) 100%)`
  },
  
  divider: '#DADADA', // closeHandle
  
  action: {
    active: '#899581', // mainColor
    hover: 'rgba(137, 149, 129, 0.04)', // mainColor with opacity
    selected: 'rgba(137, 149, 129, 0.08)', // mainColor with opacity
    disabled: 'rgba(167, 167, 167, 0.26)', // mTyStatus with opacity
    disabledBackground: 'rgba(167, 167, 167, 0.12)' // mTyStatus with opacity
  }
};

// Dark Mode Colors
const darkModeColors = {
  text: {
    primary: '#FFFFFF', // txt (white text in dark mode)
    secondary: '#A9AC99', // prevMainColor
    disabled: '#A7A7A7', // mTyStatus
    hint: '#AD9E93' // hintTxt
  },
  
  background: {
    default: '#000000', // mainDark
    paper: '#3D314A', // accent1
    light: '#5d1c33', // mainMedium
    dark: '#000000', // mainDark
    // Specific sidenav background for Material Dashboard compatibility
    sidenav: `linear-gradient(to bottom, 
      rgba(51, 15, 28, 1) 0%, 
      rgba(78, 23, 43, 0.95) 15%, 
      rgba(93, 28, 51, 0.9) 30%, 
      rgba(93, 28, 51, 1) 100%)`
  },
  
  divider: '#DADADA', // closeHandle
  
  action: {
    active: '#899581', // mainColor
    hover: 'rgba(255, 255, 255, 0.08)', // white with opacity for dark mode
    selected: 'rgba(255, 255, 255, 0.12)', // white with opacity for dark mode
    disabled: 'rgba(167, 167, 167, 0.30)', // mTyStatus with opacity
    disabledBackground: 'rgba(167, 167, 167, 0.12)' // mTyStatus with opacity
  }
};

// Typography Scale
const typography = {
  fontFamily: {
    primary: '"JosefinSans-Regular", "Josefin Sans", sans-serif',
    secondary: '"Quicksand-Regular", "Quicksand", sans-serif',
    code: '"Fira Code", "Monaco", "Consolas", monospace'
  },
  
  // PsyPsy Font Families - exact from user spec
  font1: {
    regular: '"JosefinSans-Regular", "Josefin Sans", sans-serif',
    light: '"JosefinSans-Light", "Josefin Sans", sans-serif',
    medium: '"JosefinSans-Medium", "Josefin Sans", sans-serif',
    lightItalic: '"JosefinSans-LightItalic", "Josefin Sans", sans-serif',
    bold: '"JosefinSans-Bold", "Josefin Sans", sans-serif'
  },
  
  font2: {
    regular: '"Quicksand-Regular", "Quicksand", sans-serif',
    light: '"Quicksand-Light", "Quicksand", sans-serif',
    medium: '"Quicksand-Medium", "Quicksand", sans-serif',
    semibold: '"Quicksand-SemiBold", "Quicksand", sans-serif',
    bold: '"Quicksand-Bold", "Quicksand", sans-serif'
  },
  
  fonts: {
    logo: '"Romantically", cursive',
    icons: '"icomoon"'
  },
  
  // PsyPsy Font Sizes - exact from user spec
  fontSize: {
    font11: '11px',
    font12: '12px',
    font13: '13px',
    font14: '14px',
    font15: '15px',
    font16: '16px',
    font17: '17px',
    font18: '18px',
    font19: '19px',
    font20: '20px',
    font21: '21px',
    font22: '22px',
    font23: '23px',
    font24: '24px',
    font25: '25px',
    font26: '26px',
    font27: '27px',
    // Standard sizes for compatibility
    xs: '12px',    // font12
    sm: '14px',    // font14
    base: '16px',  // font16
    lg: '18px',    // font18
    xl: '20px',    // font20
    '2xl': '24px', // font24
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
  },
  
  // Legacy size object for Material Dashboard compatibility
  size: {
    xxs: '11px',   // font11
    xs: '12px',    // font12
    sm: '14px',    // font14
    md: '16px',    // font16
    lg: '18px',    // font18
    xl: '20px',    // font20
    '2xl': '24px', // font24
    '3xl': '27px', // font27
    '4xl': '36px',
    '5xl': '48px',
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  
  // Legacy font weights for Material Dashboard compatibility
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
};

// Spacing Scale (8pt grid system)
const spacing = {
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
  40: '10rem',   // 160px
  48: '12rem',   // 192px
  56: '14rem',   // 224px
  64: '16rem',   // 256px
};

// Border Radius
const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

// Shadows
const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none'
};

// Z-Index Scale
const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
};

// Breakpoints
const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '900px',
  lg: '1200px',
  xl: '1536px'
};

// Transitions
const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  },
  
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  }
};

// ==========================================
// BACKWARD COMPATIBILITY - LEGACY THEME STRUCTURE
// ==========================================

// Legacy box shadows for backward compatibility
const legacyBoxShadows = {
  xs: boxShadow([0, 2], [9, -5], '#000000', 0.15),
  sm: boxShadow([0, 5], [10, 0], '#000000', 0.12),
  md: `${boxShadow([0, 4], [6, -1], '#000000', 0.1)}, ${boxShadow([0, 2], [4, -1], '#000000', 0.06)}`,
  lg: `${boxShadow([0, 10], [15, -3], '#000000', 0.1)}, ${boxShadow([0, 4], [6, -2], '#000000', 0.05)}`,
  xl: `${boxShadow([0, 20], [25, -5], '#000000', 0.1)}, ${boxShadow([0, 10], [10, -5], '#000000', 0.04)}`,
  xxl: boxShadow([0, 20], [27, 0], '#000000', 0.05),
  inset: boxShadow([0, 1], [2, 0], '#000000', 0.075, "inset"),
  colored: {
    primary: `${boxShadow([0, 4], [20, 0], '#000000', 0.14)}, ${boxShadow([0, 7], [10, -5], brandColors.primary.main, 0.4)}`,
    secondary: `${boxShadow([0, 4], [20, 0], '#000000', 0.14)}, ${boxShadow([0, 7], [10, -5], brandColors.secondary.main, 0.4)}`,
    info: `${boxShadow([0, 4], [20, 0], '#000000', 0.14)}, ${boxShadow([0, 7], [10, -5], brandColors.info.main, 0.4)}`,
    success: `${boxShadow([0, 4], [20, 0], '#000000', 0.14)}, ${boxShadow([0, 7], [10, -5], brandColors.success.main, 0.4)}`,
    warning: `${boxShadow([0, 4], [20, 0], '#000000', 0.14)}, ${boxShadow([0, 7], [10, -5], brandColors.warning.main, 0.4)}`,
    error: `${boxShadow([0, 4], [20, 0], '#000000', 0.14)}, ${boxShadow([0, 7], [10, -5], brandColors.error.main, 0.4)}`,
    light: `${boxShadow([0, 4], [20, 0], '#000000', 0.14)}, ${boxShadow([0, 7], [10, -5], '#ffffff', 0.4)}`,
    dark: `${boxShadow([0, 4], [20, 0], '#000000', 0.14)}, ${boxShadow([0, 7], [10, -5], '#000000', 0.4)}`
  },
  navbarBoxShadow: `${boxShadow([0, 0], [1, 1], '#ffffff', 0.9, "inset")}, ${boxShadow([0, 20], [27, 0], '#000000', 0.05)}`,
  sliderBoxShadow: {
    thumb: boxShadow([0, 1], [13, 0], '#000000', 0.2),
  },
  tabsBoxShadow: {
    indicator: boxShadow([0, 1], [5, 1], brandColors.info.main, 1),
  },
};

// Legacy gradients for backward compatibility
const legacyGradients = {
  primary: {
    main: brandColors.primary.main,
    state: brandColors.primary.light,
  },
  secondary: {
    main: brandColors.secondary.main,
    state: brandColors.secondary.light,
  },
  info: {
    main: brandColors.info.main,
    state: brandColors.info.light,
  },
  success: {
    main: brandColors.success.main,
    state: brandColors.success.light,
  },
  warning: {
    main: brandColors.warning.main,
    state: brandColors.warning.light,
  },
  error: {
    main: brandColors.error.main,
    state: brandColors.error.light,
  },
  light: {
    main: '#ffffff',
    state: '#f5f5f5',
  },
  dark: {
    main: '#1a1a1a',
    state: '#333333',
  },
};

// Legacy functions for backward compatibility
const legacyFunctions = {
  boxShadow,
  linearGradient,
  pxToRem,
  rgba
};

// Legacy borders for backward compatibility
const legacyBorders = {
  borderColor: '#e0e0e0',
  borderWidth: {
    0: 0,
    1: '0.0625rem', // 1px
    2: '0.125rem',  // 2px
    3: '0.1875rem', // 3px
    4: '0.25rem',   // 4px
    5: '0.3125rem', // 5px
  },
  borderRadius: {
    xs: '0.1rem',   // 1.6px
    sm: '0.125rem', // 2px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    xxl: '1rem',    // 16px
    section: '10rem', // 160px
  },
};

// ==========================================
// COMPONENT STYLES
// ==========================================

// Button Styles
const buttonStyles = {
  primary: {
    backgroundColor: brandColors.primary.main,
    color: brandColors.primary.contrastText,
    '&:hover': {
      backgroundColor: brandColors.primary.dark,
      transform: 'translateY(-1px)',
      boxShadow: shadows.md
    },
    '&:active': {
      transform: 'translateY(0px)'
    }
  },
  
  secondary: {
    backgroundColor: brandColors.secondary.main,
    color: brandColors.secondary.contrastText,
    '&:hover': {
      backgroundColor: brandColors.secondary.dark,
      transform: 'translateY(-1px)',
      boxShadow: shadows.md
    }
  },
  
  outlined: {
    border: `2px solid ${brandColors.primary.main}`,
    backgroundColor: 'transparent',
    color: brandColors.primary.main,
    '&:hover': {
      backgroundColor: brandColors.primary.main,
      color: brandColors.primary.contrastText
    }
  }
};

// Card Styles
const cardStyles = {
  default: {
    backgroundColor: semanticColors.background.paper,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${semanticColors.divider}`,
    '&:hover': {
      boxShadow: shadows.md,
      transform: 'translateY(-2px)'
    }
  },
  
  elevated: {
    backgroundColor: semanticColors.background.paper,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.lg,
    border: 'none'
  }
};

// Input Styles
const inputStyles = {
  default: {
    borderRadius: borderRadius.md,
    border: `1px solid ${semanticColors.divider}`,
    '&:focus': {
      borderColor: brandColors.primary.main,
      boxShadow: `0 0 0 3px ${brandColors.primary.main}20`
    },
    '&:hover': {
      borderColor: brandColors.primary.light
    }
  }
};

// ==========================================
// THEME CREATION FUNCTIONS
// ==========================================

/**
 * Create light theme
 */
export const createLightTheme = () => {
  return createTheme({
    palette: {
      mode: 'light',
      primary: brandColors.primary,
      secondary: brandColors.secondary,
      success: brandColors.success,
      warning: brandColors.warning,
      error: brandColors.error,
      info: brandColors.info,
      background: semanticColors.background,
      divider: semanticColors.divider,
      action: semanticColors.action,
      // Legacy compatibility - essential for Material Dashboard components
      white: brandColors.white,
      dark: brandColors.dark,
      transparent: brandColors.transparent,
      black: brandColors.black,
      grey: brandColors.grey,
      text: brandColors.text, // Legacy text structure with .main property
      gradients: legacyGradients
    },
    
    typography: {
      fontFamily: typography.fontFamily.primary,
      // Legacy Material Dashboard properties
      size: typography.size,
      fontWeightLight: typography.fontWeightLight,
      fontWeightRegular: typography.fontWeightRegular,
      fontWeightMedium: typography.fontWeightMedium,
      fontWeightBold: typography.fontWeightBold,
      // Standard MUI typography
      h1: {
        fontSize: typography.fontSize['5xl'],
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight
      },
      h2: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight
      },
      h3: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.snug
      },
      h4: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.snug
      },
      h5: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.medium,
        lineHeight: typography.lineHeight.normal
      },
      h6: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.medium,
        lineHeight: typography.lineHeight.normal
      },
      body1: {
        fontSize: typography.fontSize.base,
        lineHeight: typography.lineHeight.relaxed
      },
      body2: {
        fontSize: typography.fontSize.sm,
        lineHeight: typography.lineHeight.normal
      },
      caption: {
        fontSize: typography.fontSize.xs,
        lineHeight: typography.lineHeight.normal
      }
    },
    
    spacing: (factor) => spacing[factor] || `${factor * 8}px`,
    
    shape: {
      borderRadius: parseInt(borderRadius.md)
    },
    
    shadows: [
      'none',
      shadows.xs,
      shadows.sm,
      shadows.base,
      shadows.md,
      shadows.lg,
      shadows.xl,
      shadows['2xl'],
      shadows.lg,
      shadows.xl,
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl'],
      shadows['2xl']
    ],
    
    zIndex: zIndex,
    
    transitions: {
      duration: transitions.duration,
      easing: transitions.easing,
      create: (props, options) => {
        const duration = options?.duration || transitions.duration.standard;
        const easing = options?.easing || transitions.easing.easeInOut;
        return `${Array.isArray(props) ? props.join(',') : props} ${duration}ms ${easing}`;
      }
    },
    
    // Legacy compatibility - add the old theme structure
    boxShadows: legacyBoxShadows,
    functions: legacyFunctions,
    borders: legacyBorders,
    
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            borderRadius: borderRadius.md,
            padding: `${spacing[3]} ${spacing[6]}`,
            transition: 'all 0.2s ease-in-out'
          },
          containedPrimary: buttonStyles.primary,
          containedSecondary: buttonStyles.secondary,
          outlined: buttonStyles.outlined
        }
      },
      
      MuiCard: {
        styleOverrides: {
          root: cardStyles.default
        }
      },
      
      MuiTextField: {
        styleOverrides: {
          root: {
            // Remove conflicting border styles to prevent double borders
            '& .MuiOutlinedInput-root': {
              borderRadius: borderRadius.lg,
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
                borderRadius: borderRadius.lg,
                transition: 'border-color 0.3s ease',
              },
              '&:hover fieldset': {
                borderColor: brandColors.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: brandColors.primary.main,
                borderWidth: '2px'
              }
            },
            // Animated floating label styling
            '& .MuiInputLabel-root': {
              transition: 'all 0.3s ease',
              color: 'rgba(0, 0, 0, 0.6)',
              '&.Mui-focused': {
                color: brandColors.primary.main,
              },
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
                backgroundColor: 'white',
                padding: '0 4px',
              }
            },
            // Input text styling
            '& .MuiOutlinedInput-input': {
              transition: 'all 0.3s ease',
            }
          }
        }
      },
      
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${semanticColors.divider}`,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: semanticColors.background.light,
              borderBottom: `2px solid ${semanticColors.divider}`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: semanticColors.action.hover,
            }
          }
        }
      }
    }
  });
};

/**
 * Create dark theme
 */
export const createDarkTheme = () => {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: brandColors.primary,
      secondary: brandColors.secondary,
      success: brandColors.success,
      warning: brandColors.warning,
      error: brandColors.error,
      info: brandColors.info,
      background: darkModeColors.background,
      divider: darkModeColors.divider,
      action: darkModeColors.action,
      // Legacy compatibility - essential for Material Dashboard components
      white: brandColors.white,
      dark: brandColors.dark,
      transparent: brandColors.transparent,
      black: brandColors.black,
      grey: brandColors.grey,
      text: brandColors.text, // Legacy text structure with .main property
      gradients: legacyGradients
    },
    
    typography: {
      fontFamily: typography.fontFamily.primary,
      // Legacy Material Dashboard properties
      size: typography.size,
      fontWeightLight: typography.fontWeightLight,
      fontWeightRegular: typography.fontWeightRegular,
      fontWeightMedium: typography.fontWeightMedium,
      fontWeightBold: typography.fontWeightBold,
      // Standard MUI typography
      h1: {
        fontSize: typography.fontSize['5xl'],
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight,
        color: darkModeColors.text.primary
      },
      h2: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight,
        color: darkModeColors.text.primary
      },
      h3: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.snug,
        color: darkModeColors.text.primary
      },
      h4: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.snug,
        color: darkModeColors.text.primary
      },
      h5: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.medium,
        lineHeight: typography.lineHeight.normal,
        color: darkModeColors.text.primary
      },
      h6: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.medium,
        lineHeight: typography.lineHeight.normal,
        color: darkModeColors.text.primary
      },
      body1: {
        fontSize: typography.fontSize.base,
        lineHeight: typography.lineHeight.relaxed,
        color: darkModeColors.text.primary
      },
      body2: {
        fontSize: typography.fontSize.sm,
        lineHeight: typography.lineHeight.normal,
        color: darkModeColors.text.secondary
      },
      caption: {
        fontSize: typography.fontSize.xs,
        lineHeight: typography.lineHeight.normal,
        color: darkModeColors.text.secondary
      }
    },
    
    spacing: (factor) => spacing[factor] || `${factor * 8}px`,
    
    shape: {
      borderRadius: parseInt(borderRadius.md)
    },
    
    shadows: [
      'none',
      '0 1px 3px rgba(0,0,0,0.4)',
      '0 4px 6px rgba(0,0,0,0.4)',
      '0 5px 15px rgba(0,0,0,0.4)',
      '0 10px 24px rgba(0,0,0,0.4)',
      '0 15px 35px rgba(0,0,0,0.4)',
      '0 20px 40px rgba(0,0,0,0.4)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)',
      '0 25px 50px rgba(0,0,0,0.5)'
    ],
    
    zIndex: zIndex,
    
    transitions: {
      duration: transitions.duration,
      easing: transitions.easing,
      create: (props, options) => {
        const duration = options?.duration || transitions.duration.standard;
        const easing = options?.easing || transitions.easing.easeInOut;
        return `${Array.isArray(props) ? props.join(',') : props} ${duration}ms ${easing}`;
      }
    },
    
    // Legacy compatibility - add the old theme structure
    boxShadows: legacyBoxShadows,
    functions: legacyFunctions,
    borders: legacyBorders,
    
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            borderRadius: borderRadius.md,
            padding: `${spacing[3]} ${spacing[6]}`,
            transition: 'all 0.2s ease-in-out'
          },
          containedPrimary: {
            ...buttonStyles.primary,
            backgroundColor: brandColors.primary.main,
            '&:hover': {
              backgroundColor: brandColors.primary.light
            }
          },
          containedSecondary: {
            ...buttonStyles.secondary,
            backgroundColor: brandColors.secondary.main,
            '&:hover': {
              backgroundColor: brandColors.secondary.light
            }
          },
          outlined: {
            ...buttonStyles.outlined,
            borderColor: brandColors.primary.main,
            color: brandColors.primary.main,
            '&:hover': {
              backgroundColor: `${brandColors.primary.main}20`,
              borderColor: brandColors.primary.light
            }
          }
        }
      },
      
      MuiCard: {
        styleOverrides: {
          root: {
            ...cardStyles.default,
            backgroundColor: darkModeColors.background.paper,
            borderColor: darkModeColors.divider
          }
        }
      },
      
      MuiTextField: {
        styleOverrides: {
          root: {
            // Remove conflicting border styles to prevent double borders
            '& .MuiOutlinedInput-root': {
              borderRadius: borderRadius.lg,
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
                borderRadius: borderRadius.lg,
                transition: 'border-color 0.3s ease',
              },
              '&:hover fieldset': {
                borderColor: brandColors.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: brandColors.primary.main,
                borderWidth: '2px'
              }
            },
            // Animated floating label styling
            '& .MuiInputLabel-root': {
              transition: 'all 0.3s ease',
              color: 'rgba(0, 0, 0, 0.6)',
              '&.Mui-focused': {
                color: brandColors.primary.main,
              },
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
                backgroundColor: 'white',
                padding: '0 4px',
              }
            },
            // Input text styling
            '& .MuiOutlinedInput-input': {
              transition: 'all 0.3s ease',
            }
          }
        }
      },
      
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            backgroundColor: darkModeColors.background.paper,
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${darkModeColors.divider}`,
              color: darkModeColors.text.primary
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: darkModeColors.background.light,
              borderBottom: `2px solid ${darkModeColors.divider}`,
              color: darkModeColors.text.primary
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: darkModeColors.action.hover,
            }
          }
        }
      }
    }
  });
};

// ==========================================
// EXPORT DESIGN TOKENS AND THEMES
// ==========================================

export {
  brandColors,
  semanticColors,
  darkModeColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  transitions,
  buttonStyles,
  cardStyles,
  inputStyles,
  // Legacy exports for backward compatibility
  legacyBoxShadows,
  legacyGradients,
  legacyFunctions,
  legacyBorders
};

const globalThemeExport = {
  brandColors,
  semanticColors,
  darkModeColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  transitions,
  buttonStyles,
  cardStyles,
  inputStyles,
  createLightTheme,
  createDarkTheme,
  // Legacy compatibility
  boxShadows: legacyBoxShadows,
  functions: legacyFunctions,
  gradients: legacyGradients,
  borders: legacyBorders
};

export default globalThemeExport; 