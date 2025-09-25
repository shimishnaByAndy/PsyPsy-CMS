/**
 * Healthcare Design Tokens for PsyPsy CMS
 *
 * Design tokens based on research from CMS Design System, Gravity Design System,
 * and Better Design System, optimized for healthcare applications and WCAG AAA compliance.
 *
 * @see docs/design-system/research.md for detailed research findings
 */

// =============================================================================
// COLOR TOKENS
// =============================================================================

/**
 * Healthcare Status Colors
 * Designed for clinical workflows with accessibility considerations
 */
export const healthcareColors = {
  // Status indicators (multi-modal: color + icon + text)
  status: {
    available: '#2E7D32',      // Calming green - professional available
    busy: '#F9A825',           // Attention yellow - currently occupied
    offline: '#9E9E9E',        // Neutral gray - not available
    break: '#FF8F00',          // Orange - on break
    emergency: '#C62828',      // Red - emergency/urgent only
  },

  // Alert and notification colors
  alert: {
    critical: '#C62828',       // Critical errors, emergency situations
    warning: '#FF8F00',        // Warnings, attention needed
    info: '#1976D2',           // Informational messages
    success: '#2E7D32',        // Success confirmations
    caution: '#F57C00',        // Procedural cautions
  },

  // PHI and compliance indicators
  compliance: {
    phi: '#7B1FA2',            // Purple - PHI data marking
    encrypted: '#388E3C',      // Green - encrypted data
    audit: '#5D4037',          // Brown - audit trail
    consent: '#1565C0',        // Blue - consent status
    restricted: '#D32F2F',     // Red - restricted access
  },

  // Background and surface colors
  background: {
    primary: '#F8F9FA',        // Light, calming main background
    secondary: '#FFFFFF',      // Clean white background
    elevated: '#FFFFFF',       // Elevated surfaces (cards, modals)
    subtle: '#F5F5F5',         // Subtle background variations
    disabled: '#FAFAFA',       // Disabled state background
  },

  // Surface colors for different contexts
  surface: {
    primary: '#FFFFFF',        // Primary surface color
    secondary: '#F8F9FA',      // Secondary surface
    tertiary: '#F5F5F5',       // Tertiary surface
    overlay: 'rgba(0, 0, 0, 0.6)', // Modal overlays
    glass: 'rgba(255, 255, 255, 0.9)', // Glass morphism
  },

  // Border colors
  border: {
    subtle: '#E0E0E0',         // Subtle borders
    emphasis: '#BDBDBD',       // Emphasized borders
    strong: '#9E9E9E',         // Strong borders
    focus: '#1976D2',          // Focus indicators
    error: '#C62828',          // Error borders
    success: '#2E7D32',        // Success borders
  },

  // Text colors with WCAG AAA compliance
  text: {
    primary: '#212121',        // Primary text (7:1 contrast)
    secondary: '#616161',      // Secondary text (4.5:1 contrast)
    tertiary: '#757575',       // Tertiary text
    disabled: '#9E9E9E',       // Disabled text
    inverse: '#FFFFFF',        // Inverse text (on dark backgrounds)
    link: '#1976D2',           // Link text
    linkHover: '#1565C0',      // Link hover state
  },

  // Interactive element colors
  interactive: {
    primary: '#1976D2',        // Primary buttons, links
    primaryHover: '#1565C0',   // Primary hover state
    secondary: '#424242',      // Secondary buttons
    secondaryHover: '#303030', // Secondary hover state
    accent: '#7B1FA2',         // Accent color for highlights
    accentHover: '#6A1B9A',    // Accent hover state
  },
} as const;

/**
 * Dark theme color overrides
 * Maintains WCAG AAA compliance in dark mode
 */
export const healthcareColorsDark = {
  background: {
    primary: '#121212',        // Dark primary background
    secondary: '#1E1E1E',      // Dark secondary background
    elevated: '#2D2D2D',       // Elevated surfaces in dark mode
    subtle: '#1A1A1A',         // Subtle dark background
    disabled: '#0F0F0F',       // Disabled state background
  },

  surface: {
    primary: '#1E1E1E',        // Dark primary surface
    secondary: '#2D2D2D',      // Dark secondary surface
    tertiary: '#424242',       // Dark tertiary surface
    overlay: 'rgba(0, 0, 0, 0.8)', // Darker overlays
    glass: 'rgba(30, 30, 30, 0.9)', // Dark glass morphism
  },

  text: {
    primary: '#FFFFFF',        // White text on dark (7:1 contrast)
    secondary: '#E0E0E0',      // Secondary text on dark
    tertiary: '#BDBDBD',       // Tertiary text on dark
    disabled: '#757575',       // Disabled text on dark
    inverse: '#212121',        // Inverse text (on light backgrounds)
    link: '#90CAF9',           // Light blue links
    linkHover: '#BBDEFB',      // Light blue link hover
  },

  border: {
    subtle: '#424242',         // Subtle borders in dark mode
    emphasis: '#616161',       // Emphasized borders in dark mode
    strong: '#757575',         // Strong borders in dark mode
    focus: '#90CAF9',          // Focus indicators in dark mode
    error: '#F48FB1',          // Error borders in dark mode
    success: '#A5D6A7',        // Success borders in dark mode
  },
} as const;

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

/**
 * Typography scale based on healthcare interface requirements
 * Minimum 16px for accessibility, clear hierarchy for clinical data
 */
export const typography = {
  // Font families
  fontFamily: {
    primary: ['Inter', 'Roboto', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
    monospace: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
    display: ['Inter', 'system-ui', 'sans-serif'],
  },

  // Font sizes (minimum 16px for body text)
  fontSize: {
    xs: '12px',          // Captions, metadata (use sparingly)
    sm: '14px',          // Secondary text, labels
    base: '16px',        // Body text (accessibility minimum)
    lg: '18px',          // Large body text, comfortable reading
    xl: '20px',          // Subheadings, emphasized text
    '2xl': '24px',       // Section headings
    '3xl': '30px',       // Page headings
    '4xl': '36px',       // Display headings
    '5xl': '48px',       // Hero headings
    '6xl': '60px',       // Large display text
  },

  // Font weights
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',       // Default body weight
    medium: '500',       // Emphasized text
    semibold: '600',     // Subheadings
    bold: '700',         // Headings, strong emphasis
    extrabold: '800',    // Display text
    black: '900',        // Maximum emphasis
  },

  // Line heights for readability
  lineHeight: {
    tight: '1.25',       // Dense layouts, headings
    snug: '1.375',       // Comfortable headings
    normal: '1.5',       // Body text default
    relaxed: '1.625',    // Comfortable reading
    loose: '2',          // Maximum spacing
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// =============================================================================
// SPACING TOKENS
// =============================================================================

/**
 * Spacing scale based on 8px grid system
 * Consistent spacing for healthcare interfaces
 */
export const spacing = {
  // Base spacing units (8px grid)
  px: '1px',
  0: '0',
  0.5: '2px',
  1: '4px',          // Extra tight
  2: '8px',          // Base unit
  3: '12px',         // Small spacing
  4: '16px',         // Base spacing
  5: '20px',         // Medium spacing
  6: '24px',         // Large spacing
  7: '28px',         // Extra large spacing
  8: '32px',         // Section spacing
  9: '36px',         // Large section spacing
  10: '40px',        // Extra large section spacing
  12: '48px',        // Component spacing
  14: '56px',        // Large component spacing
  16: '64px',        // Page-level spacing
  20: '80px',        // Large page spacing
  24: '96px',        // Hero spacing
  32: '128px',       // Maximum spacing
  40: '160px',       // Extra large spacing
  48: '192px',       // Hero sections
  56: '224px',       // Maximum hero spacing
  64: '256px',       // Ultra-wide spacing
} as const;

// =============================================================================
// SHADOW TOKENS
// =============================================================================

/**
 * Shadow system for depth and elevation
 * Subtle shadows for healthcare interfaces
 */
export const shadows = {
  // Elevation levels
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',           // Subtle depth
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',  // Cards
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Default elevation
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',  // Modals
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Dropdowns
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',     // Large modals
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',  // Maximum elevation

  // Colored shadows for status
  success: '0 4px 6px -1px rgba(46, 125, 50, 0.1)',
  warning: '0 4px 6px -1px rgba(255, 143, 0, 0.1)',
  error: '0 4px 6px -1px rgba(198, 40, 40, 0.1)',
  info: '0 4px 6px -1px rgba(25, 118, 210, 0.1)',

  // Focus shadows
  focusRing: '0 0 0 3px rgba(25, 118, 210, 0.3)',
  focusRingError: '0 0 0 3px rgba(198, 40, 40, 0.3)',
  focusRingSuccess: '0 0 0 3px rgba(46, 125, 50, 0.3)',
} as const;

// =============================================================================
// BORDER RADIUS TOKENS
// =============================================================================

/**
 * Border radius system
 * Professional appearance for healthcare interfaces
 */
export const borderRadius = {
  none: '0',
  xs: '2px',         // Subtle rounding
  sm: '4px',         // Small elements
  base: '6px',       // Default rounding
  md: '8px',         // Cards, buttons
  lg: '12px',        // Large cards
  xl: '16px',        // Prominent elements
  '2xl': '24px',     // Hero elements
  '3xl': '32px',     // Maximum rounding
  full: '9999px',    // Circular elements
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

/**
 * Responsive breakpoints for healthcare interfaces
 * Mobile-first approach with healthcare workflow considerations
 */
export const breakpoints = {
  xs: '320px',       // Small mobile
  sm: '640px',       // Mobile
  md: '768px',       // Tablet
  lg: '1024px',      // Small desktop
  xl: '1280px',      // Desktop
  '2xl': '1536px',   // Large desktop
  '3xl': '1920px',   // Ultra-wide
} as const;

// =============================================================================
// Z-INDEX TOKENS
// =============================================================================

/**
 * Z-index scale for layering
 * Consistent layering for healthcare interfaces
 */
export const zIndex = {
  auto: 'auto',
  base: 0,
  below: -1,
  normal: 1,
  tooltip: 10,
  dropdown: 20,
  sticky: 30,
  modal: 40,
  popover: 50,
  overlay: 60,
  max: 9999,
} as const;

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

/**
 * Animation and transition tokens
 * Subtle, purposeful animations for healthcare interfaces
 */
export const animation = {
  // Durations
  duration: {
    fast: '150ms',     // Quick interactions
    base: '200ms',     // Default transitions
    slow: '300ms',     // Gentle transitions
    slower: '500ms',   // Deliberate transitions
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common transitions
  transition: {
    colors: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// =============================================================================
// COMPONENT DEFAULTS
// =============================================================================

/**
 * Default configurations for healthcare components
 * Based on research findings for optimal clinical workflows
 */
export const componentDefaults = {
  button: {
    size: 'md',
    radius: 'md',
    variant: 'solid',
    minHeight: '44px',     // Touch accessibility
  },

  card: {
    radius: 'lg',
    shadow: 'sm',
    padding: spacing[4],
    isBlurred: false,
  },

  input: {
    size: 'md',
    radius: 'md',
    variant: 'bordered',
    minHeight: '44px',     // Touch accessibility
  },

  table: {
    color: 'default',
    selectionMode: 'single',
    isCompact: false,
  },

  modal: {
    size: 'lg',
    backdrop: 'opaque',
    scrollBehavior: 'inside',
  },

  // Healthcare-specific defaults
  patientCard: {
    padding: spacing[4],
    radius: borderRadius.lg,
    shadow: shadows.sm,
    borderWidth: '1px',
  },

  professionalCard: {
    padding: spacing[4],
    radius: borderRadius.md,
    shadow: shadows.xs,
    borderWidth: '1px',
  },

  statusIndicator: {
    size: 'sm',
    radius: borderRadius.full,
    minWidth: '12px',
    minHeight: '12px',
  },
} as const;

// =============================================================================
// ACCESSIBILITY TOKENS
// =============================================================================

/**
 * Accessibility-focused tokens
 * WCAG AAA compliance requirements
 */
export const accessibility = {
  // Minimum touch targets
  minTouchTarget: '44px',

  // Focus ring specifications
  focusRing: {
    width: '3px',
    color: healthcareColors.interactive.primary,
    offset: '2px',
    style: 'solid',
  },

  // High contrast ratios (WCAG AAA)
  contrastRatios: {
    normal: 7.0,           // 7:1 for normal text
    large: 4.5,            // 4.5:1 for large text
    graphics: 3.0,         // 3:1 for graphics and UI components
  },

  // Animation preferences
  reducedMotion: {
    duration: '0ms',
    easing: 'linear',
  },
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Complete design token system export
 */
export const designTokens = {
  colors: healthcareColors,
  colorsDark: healthcareColorsDark,
  typography,
  spacing,
  shadows,
  borderRadius,
  breakpoints,
  zIndex,
  animation,
  componentDefaults,
  accessibility,
} as const;

/**
 * Type definitions for design tokens
 */
export type HealthcareColors = typeof healthcareColors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Shadows = typeof shadows;
export type BorderRadius = typeof borderRadius;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;
export type Animation = typeof animation;
export type ComponentDefaults = typeof componentDefaults;
export type Accessibility = typeof accessibility;
export type DesignTokens = typeof designTokens;

/**
 * Default export for convenience
 */
export default designTokens;