/**
 * NextUI Theme Configuration for PsyPsy CMS
 *
 * Integrates our comprehensive design token system with NextUI's theming capabilities.
 * Provides healthcare-optimized themes with WCAG AAA compliance.
 *
 * @see src/ui/design-tokens/index.ts for the underlying design token system
 */

import type { ConfigThemes } from '@nextui-org/react'
import { designTokens } from './design-tokens'

// =============================================================================
// HEALTHCARE LIGHT THEME
// =============================================================================

const healthcareLightTheme = {
  extend: 'light',
  colors: {
    // Background and surfaces
    background: designTokens.colors.background.primary,
    foreground: designTokens.colors.text.primary,
    content1: designTokens.colors.surface.primary,
    content2: designTokens.colors.surface.secondary,
    content3: designTokens.colors.surface.tertiary,
    content4: designTokens.colors.background.subtle,

    // Focus and overlay
    focus: designTokens.colors.interactive.primary,
    overlay: designTokens.colors.surface.overlay,
    divider: designTokens.colors.border.subtle,

    // Primary color scale (Healthcare professional blue)
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: designTokens.colors.interactive.primary, // #1976D2
      600: '#1565c0',
      700: '#0d47a1',
      800: '#0a3d91',
      900: '#063281',
      DEFAULT: designTokens.colors.interactive.primary,
      foreground: '#ffffff',
    },

    // Secondary color scale (Professional gray)
    secondary: {
      50: '#f8f9fa',
      100: '#f1f3f4',
      200: '#e8eaed',
      300: '#dadce0',
      400: '#bdc1c6',
      500: designTokens.colors.interactive.secondary, // #424242
      600: '#373737',
      700: '#2d2d2d',
      800: '#242424',
      900: '#1a1a1a',
      DEFAULT: designTokens.colors.interactive.secondary,
      foreground: '#ffffff',
    },

    // Success color scale (Healthcare green)
    success: {
      50: '#e8f5e8',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: designTokens.colors.alert.success, // #2E7D32
      600: '#2e7d32',
      700: '#2c6b2f',
      800: '#1b5e20',
      900: '#1b5e20',
      DEFAULT: designTokens.colors.alert.success,
      foreground: '#ffffff',
    },

    // Warning color scale (Healthcare orange)
    warning: {
      50: '#fff8e1',
      100: '#ffecb3',
      200: '#ffe082',
      300: '#ffd54f',
      400: '#ffca28',
      500: designTokens.colors.alert.warning, // #FF8F00
      600: '#ff8f00',
      700: '#ff6f00',
      800: '#e65100',
      900: '#bf360c',
      DEFAULT: designTokens.colors.alert.warning,
      foreground: '#000000',
    },

    // Danger color scale (Healthcare red)
    danger: {
      50: '#ffebee',
      100: '#ffcdd2',
      200: '#ef9a9a',
      300: '#e57373',
      400: '#ef5350',
      500: designTokens.colors.alert.critical, // #C62828
      600: '#c62828',
      700: '#b71c1c',
      800: '#a91b1b',
      900: '#8e1919',
      DEFAULT: designTokens.colors.alert.critical,
      foreground: '#ffffff',
    },

    // Default color scale (Neutral)
    default: {
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
      DEFAULT: '#f4f4f5',
      foreground: designTokens.colors.text.primary,
    },
  },
} as const

// =============================================================================
// HEALTHCARE DARK THEME
// =============================================================================

const healthcareDarkTheme = {
  extend: 'dark',
  colors: {
    // Background and surfaces
    background: designTokens.colorsDark.background.primary,
    foreground: designTokens.colorsDark.text.primary,
    content1: designTokens.colorsDark.surface.primary,
    content2: designTokens.colorsDark.surface.secondary,
    content3: designTokens.colorsDark.surface.tertiary,
    content4: designTokens.colorsDark.background.subtle,

    // Focus and overlay
    focus: designTokens.colorsDark.text.link,
    overlay: designTokens.colorsDark.surface.overlay,
    divider: designTokens.colorsDark.border.subtle,

    // Primary color scale (Light blue for dark mode)
    primary: {
      50: '#063281',
      100: '#0a3d91',
      200: '#0d47a1',
      300: '#1565c0',
      400: '#1976d2',
      500: designTokens.colorsDark.text.link, // #90CAF9
      600: '#64b5f6',
      700: '#42a5f5',
      800: '#2196f3',
      900: '#0d8bf2',
      DEFAULT: designTokens.colorsDark.text.link,
      foreground: designTokens.colorsDark.background.primary,
    },

    // Secondary color scale
    secondary: {
      50: '#1a1a1a',
      100: '#242424',
      200: '#2d2d2d',
      300: '#373737',
      400: '#424242',
      500: '#616161',
      600: '#757575',
      700: '#9e9e9e',
      800: '#bdbdbd',
      900: '#e0e0e0',
      DEFAULT: '#3f3f46',
      foreground: designTokens.colorsDark.text.primary,
    },

    // Success color scale (Light green for dark mode)
    success: {
      50: '#1b5e20',
      100: '#2c6b2f',
      200: '#2e7d32',
      300: '#388e3c',
      400: '#4caf50',
      500: designTokens.colorsDark.border.success, // #A5D6A7
      600: '#81c784',
      700: '#66bb6a',
      800: '#4caf50',
      900: '#2e7d32',
      DEFAULT: designTokens.colorsDark.border.success,
      foreground: designTokens.colorsDark.background.primary,
    },

    // Warning color scale
    warning: {
      50: '#bf360c',
      100: '#e65100',
      200: '#ff6f00',
      300: '#ff8f00',
      400: '#ffa000',
      500: '#ffb300',
      600: '#ffc107',
      700: '#ffd54f',
      800: '#ffe082',
      900: '#ffecb3',
      DEFAULT: '#fbbf24',
      foreground: designTokens.colorsDark.background.primary,
    },

    // Danger color scale (Light red for dark mode)
    danger: {
      50: '#8e1919',
      100: '#a91b1b',
      200: '#b71c1c',
      300: '#c62828',
      400: '#d32f2f',
      500: designTokens.colorsDark.border.error, // #F48FB1
      600: '#f06292',
      700: '#ec407a',
      800: '#e91e63',
      900: '#c2185b',
      DEFAULT: designTokens.colorsDark.border.error,
      foreground: designTokens.colorsDark.background.primary,
    },

    // Default color scale
    default: {
      50: '#212121',
      100: '#424242',
      200: '#616161',
      300: '#757575',
      400: '#9e9e9e',
      500: '#bdbdbd',
      600: '#e0e0e0',
      700: '#eeeeee',
      800: '#f5f5f5',
      900: '#fafafa',
      DEFAULT: '#27272a',
      foreground: designTokens.colorsDark.text.primary,
    },
  },
} as const

// =============================================================================
// QUEBEC PROFESSIONAL THEME (Light variant with Quebec-specific branding)
// =============================================================================

const quebecProfessionalTheme = {
  extend: 'light',
  colors: {
    ...healthcareLightTheme.colors,

    // Quebec-inspired primary color (based on provincial colors)
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Quebec professional blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      DEFAULT: '#0ea5e9',
      foreground: '#ffffff',
    },

    // Professional accent color
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Quebec professional gray
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      DEFAULT: '#64748b',
      foreground: '#ffffff',
    },
  },
} as const

// =============================================================================
// EMERGENCY THEME (High contrast, critical alerts)
// =============================================================================

const emergencyTheme = {
  extend: 'light',
  colors: {
    ...healthcareLightTheme.colors,

    // High contrast emergency colors
    primary: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: designTokens.colors.alert.critical, // #C62828
      600: '#c62828',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      DEFAULT: designTokens.colors.alert.critical,
      foreground: '#ffffff',
    },

    // Emergency warning background
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      DEFAULT: '#f59e0b',
      foreground: '#000000',
    },
  },
} as const

// =============================================================================
// THEME EXPORTS
// =============================================================================

/**
 * Complete NextUI theme configuration for PsyPsy CMS
 * Supports multiple healthcare-optimized themes with accessibility compliance
 */
export const nextUIThemes: ConfigThemes = {
  'healthcare-light': healthcareLightTheme,
  'healthcare-dark': healthcareDarkTheme,
  'quebec-professional': quebecProfessionalTheme,
  'emergency': emergencyTheme,
} as const

/**
 * Default theme selection based on context
 */
export const defaultTheme = 'healthcare-light'
export const defaultDarkTheme = 'healthcare-dark'

/**
 * Theme utilities for dynamic theme switching
 */
export const themeUtils = {
  /**
   * Get appropriate theme based on user role and context
   */
  getThemeForContext: (context: {
    isDark?: boolean
    isEmergency?: boolean
    userRole?: 'patient' | 'professional' | 'admin'
    locale?: 'en' | 'fr'
  }) => {
    const { isDark = false, isEmergency = false, userRole = 'patient', locale = 'en' } = context

    if (isEmergency) {
      return 'emergency'
    }

    if (isDark) {
      return 'healthcare-dark'
    }

    if (userRole === 'professional' && locale === 'fr') {
      return 'quebec-professional'
    }

    return 'healthcare-light'
  },

  /**
   * Get semantic color values from current theme
   */
  getSemanticColors: (theme: keyof typeof nextUIThemes) => {
    const selectedTheme = nextUIThemes[theme]
    return {
      primary: selectedTheme.colors.primary.DEFAULT,
      success: selectedTheme.colors.success.DEFAULT,
      warning: selectedTheme.colors.warning.DEFAULT,
      danger: selectedTheme.colors.danger.DEFAULT,
      background: selectedTheme.colors.background,
      foreground: selectedTheme.colors.foreground,
    }
  },
}

/**
 * CSS custom properties for theme integration
 * Can be used to inject theme values into CSS
 */
export const generateThemeCSS = (themeName: keyof typeof nextUIThemes) => {
  const theme = nextUIThemes[themeName]

  return `
    :root[data-theme="${themeName}"] {
      --healthcare-primary: ${theme.colors.primary.DEFAULT};
      --healthcare-success: ${theme.colors.success.DEFAULT};
      --healthcare-warning: ${theme.colors.warning.DEFAULT};
      --healthcare-danger: ${theme.colors.danger.DEFAULT};
      --healthcare-background: ${theme.colors.background};
      --healthcare-foreground: ${theme.colors.foreground};
      --healthcare-focus: ${theme.colors.focus};
      --healthcare-divider: ${theme.colors.divider};
    }
  `
}

/**
 * Type definitions for theme system
 */
export type HealthcareTheme = keyof typeof nextUIThemes
export type ThemeContext = Parameters<typeof themeUtils.getThemeForContext>[0]

/**
 * Re-export design tokens for convenience
 */
export { designTokens }

/**
 * Default export for easy import
 */
export default {
  themes: nextUIThemes,
  defaultTheme,
  defaultDarkTheme,
  utils: themeUtils,
}