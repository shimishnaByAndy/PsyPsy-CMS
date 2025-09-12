/**
 * Modern Theme Provider - 2025 Edition
 * 
 * Enhanced theme system with:
 * - Dynamic color schemes
 * - Animation preferences
 * - Responsive design tokens
 * - Accessibility features
 * - Performance optimizations
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { colors, shadows, borderRadius, spacing, typography } from '../lib/utils';

// Theme context
const ModernThemeContext = createContext();

// Initial theme state with 2025 patterns
const initialState = {
  // Core theme settings
  mode: 'light', // 'light' | 'dark' | 'auto'
  primaryColor: 'primary', // Support for dynamic primary colors
  accentColor: 'blue', // Secondary accent color
  
  // Visual preferences
  borderRadius: 'md', // 'none' | 'sm' | 'md' | 'lg' | 'xl'
  density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
  animations: 'enabled', // 'enabled' | 'reduced' | 'disabled'
  shadows: 'enabled', // 'enabled' | 'reduced' | 'disabled'
  
  // Layout preferences
  sidebarCollapsed: false,
  sidebarWidth: 280,
  headerHeight: 64,
  
  // Feature flags for 2025 patterns
  features: {
    glassmorphism: true,
    neuomorphism: false,
    gradients: true,
    blurEffects: true,
    smoothScrolling: true,
    parallax: false,
    particles: false
  },
  
  // Performance settings
  performance: {
    reducedMotion: false,
    prefersHighContrast: false,
    prefersColorScheme: 'no-preference'
  },
  
  // Custom properties
  custom: {
    brandGradient: 'linear-gradient(135deg, #37925c 0%, #2a7847 100%)',
    surfaceGradient: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
    cardGradient: 'linear-gradient(145deg, #ffffff 0%, #fefefe 50%, #f8f9fa 100%)'
  }
};

// Theme reducer for state management
function themeReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    
    case 'SET_PRIMARY_COLOR':
      return { ...state, primaryColor: action.payload };
    
    case 'SET_ACCENT_COLOR':
      return { ...state, accentColor: action.payload };
    
    case 'SET_BORDER_RADIUS':
      return { ...state, borderRadius: action.payload };
    
    case 'SET_DENSITY':
      return { ...state, density: action.payload };
    
    case 'SET_ANIMATIONS':
      return { ...state, animations: action.payload };
    
    case 'SET_SHADOWS':
      return { ...state, shadows: action.payload };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case 'SET_SIDEBAR_WIDTH':
      return { ...state, sidebarWidth: action.payload };
    
    case 'UPDATE_FEATURE':
      return {
        ...state,
        features: { ...state.features, [action.feature]: action.payload }
      };
    
    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: { ...state.performance, ...action.payload }
      };
    
    case 'UPDATE_CUSTOM':
      return {
        ...state,
        custom: { ...state.custom, ...action.payload }
      };
    
    case 'RESET_THEME':
      return { ...initialState };
    
    case 'LOAD_THEME':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

// Color scheme generator
function generateColorScheme(mode, primaryColor, accentColor) {
  const isDark = mode === 'dark';
  
  return {
    // Background colors
    background: {
      primary: isDark ? colors.neutral[900] : colors.neutral[50],
      secondary: isDark ? colors.neutral[800] : colors.neutral[100],
      tertiary: isDark ? colors.neutral[700] : colors.neutral[200],
      elevated: isDark ? colors.neutral[800] : '#ffffff',
      overlay: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'
    },
    
    // Surface colors
    surface: {
      primary: isDark ? colors.neutral[800] : '#ffffff',
      secondary: isDark ? colors.neutral[700] : colors.neutral[50],
      tertiary: isDark ? colors.neutral[600] : colors.neutral[100],
      inverse: isDark ? '#ffffff' : colors.neutral[900]
    },
    
    // Text colors
    text: {
      primary: isDark ? colors.neutral[50] : colors.neutral[900],
      secondary: isDark ? colors.neutral[300] : colors.neutral[600],
      tertiary: isDark ? colors.neutral[400] : colors.neutral[500],
      inverse: isDark ? colors.neutral[900] : colors.neutral[50],
      disabled: isDark ? colors.neutral[600] : colors.neutral[400]
    },
    
    // Border colors
    border: {
      primary: isDark ? colors.neutral[700] : colors.neutral[200],
      secondary: isDark ? colors.neutral[600] : colors.neutral[300],
      focus: colors[primaryColor][500],
      error: colors.error[500]
    },
    
    // Brand colors
    brand: {
      primary: colors[primaryColor][500],
      primaryHover: colors[primaryColor][600],
      primaryActive: colors[primaryColor][700],
      accent: colors[accentColor] || colors.info[500],
      accentHover: colors[accentColor] || colors.info[600]
    },
    
    // Status colors
    status: {
      success: colors.success[500],
      warning: colors.warning[500],
      error: colors.error[500],
      info: colors.info[500]
    }
  };
}

// Design tokens generator
function generateDesignTokens(state) {
  const { density, borderRadius: radiusKey, shadows: shadowsEnabled } = state;
  
  // Density-based spacing
  const densityMultipliers = {
    compact: 0.75,
    comfortable: 1,
    spacious: 1.25
  };
  
  const multiplier = densityMultipliers[density];
  
  return {
    // Spacing tokens
    spacing: Object.fromEntries(
      Object.entries(spacing).map(([key, value]) => [
        key,
        `${parseFloat(value) * multiplier}rem`
      ])
    ),
    
    // Typography with density scaling
    typography: Object.fromEntries(
      Object.entries(typography).map(([key, value]) => [
        key,
        {
          fontSize: value.fontSize,
          lineHeight: `${parseFloat(value.lineHeight) * multiplier}rem`
        }
      ])
    ),
    
    // Border radius
    borderRadius: borderRadius[radiusKey],
    
    // Shadows (conditional)
    shadows: shadowsEnabled === 'enabled' ? shadows : 
             shadowsEnabled === 'reduced' ? { sm: shadows.sm, base: shadows.base } : 
             {},
    
    // Component heights
    components: {
      button: {
        sm: `${2 * multiplier}rem`,
        md: `${2.5 * multiplier}rem`,
        lg: `${3 * multiplier}rem`
      },
      input: {
        sm: `${2 * multiplier}rem`,
        md: `${2.5 * multiplier}rem`,
        lg: `${3 * multiplier}rem`
      },
      card: {
        padding: `${1.5 * multiplier}rem`
      }
    }
  };
}

// CSS variables generator
function generateCSSVariables(colorScheme, tokens, customProperties) {
  const cssVars = {};
  
  // Color variables
  Object.entries(colorScheme).forEach(([category, colors]) => {
    Object.entries(colors).forEach(([name, value]) => {
      cssVars[`--color-${category}-${name}`] = value;
    });
  });
  
  // Spacing variables
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });
  
  // Component variables
  Object.entries(tokens.components).forEach(([component, sizes]) => {
    if (typeof sizes === 'object') {
      Object.entries(sizes).forEach(([size, value]) => {
        cssVars[`--${component}-${size}`] = value;
      });
    } else {
      cssVars[`--${component}`] = sizes;
    }
  });
  
  // Shadow variables
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });
  
  // Custom properties
  Object.entries(customProperties).forEach(([key, value]) => {
    cssVars[`--${key}`] = value;
  });
  
  // Border radius
  cssVars['--border-radius'] = tokens.borderRadius;
  
  return cssVars;
}

// Modern Theme Provider component
export function ModernThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);
  
  // Detect system preferences
  useEffect(() => {
    const mediaQueries = {
      prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)'),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      prefersHighContrast: window.matchMedia('(prefers-contrast: high)')
    };
    
    const updatePreferences = () => {
      dispatch({
        type: 'UPDATE_PERFORMANCE',
        payload: {
          prefersColorScheme: mediaQueries.prefersColorScheme.matches ? 'dark' : 'light',
          reducedMotion: mediaQueries.prefersReducedMotion.matches,
          prefersHighContrast: mediaQueries.prefersHighContrast.matches
        }
      });
    };
    
    // Initial check
    updatePreferences();
    
    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updatePreferences);
    });
    
    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updatePreferences);
      });
    };
  }, []);
  
  // Auto mode handling
  const effectiveMode = useMemo(() => {
    if (state.mode === 'auto') {
      return state.performance.prefersColorScheme === 'dark' ? 'dark' : 'light';
    }
    return state.mode;
  }, [state.mode, state.performance.prefersColorScheme]);
  
  // Generate theme tokens
  const colorScheme = useMemo(
    () => generateColorScheme(effectiveMode, state.primaryColor, state.accentColor),
    [effectiveMode, state.primaryColor, state.accentColor]
  );
  
  const designTokens = useMemo(
    () => generateDesignTokens(state),
    [state.density, state.borderRadius, state.shadows]
  );
  
  const cssVariables = useMemo(
    () => generateCSSVariables(colorScheme, designTokens, state.custom),
    [colorScheme, designTokens, state.custom]
  );
  
  // Apply CSS variables to root
  useEffect(() => {
    const root = document.documentElement;
    
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Apply theme class
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${effectiveMode}`);
    
    // Apply feature classes
    Object.entries(state.features).forEach(([feature, enabled]) => {
      if (enabled) {
        root.classList.add(`feature-${feature}`);
      } else {
        root.classList.remove(`feature-${feature}`);
      }
    });
    
    // Apply performance classes
    if (state.performance.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    if (state.performance.prefersHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [cssVariables, effectiveMode, state.features, state.performance]);
  
  // Save theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('psypsy-theme', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [state]);
  
  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('psypsy-theme');
      if (saved) {
        const savedTheme = JSON.parse(saved);
        dispatch({ type: 'LOAD_THEME', payload: savedTheme });
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, []);
  
  // Context value
  const contextValue = useMemo(() => ({
    // Current state
    ...state,
    mode: effectiveMode,
    
    // Generated tokens
    colors: colorScheme,
    tokens: designTokens,
    cssVars: cssVariables,
    
    // Actions
    setMode: (mode) => dispatch({ type: 'SET_MODE', payload: mode }),
    setPrimaryColor: (color) => dispatch({ type: 'SET_PRIMARY_COLOR', payload: color }),
    setAccentColor: (color) => dispatch({ type: 'SET_ACCENT_COLOR', payload: color }),
    setBorderRadius: (radius) => dispatch({ type: 'SET_BORDER_RADIUS', payload: radius }),
    setDensity: (density) => dispatch({ type: 'SET_DENSITY', payload: density }),
    setAnimations: (animations) => dispatch({ type: 'SET_ANIMATIONS', payload: animations }),
    setShadows: (shadows) => dispatch({ type: 'SET_SHADOWS', payload: shadows }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    setSidebarWidth: (width) => dispatch({ type: 'SET_SIDEBAR_WIDTH', payload: width }),
    updateFeature: (feature, enabled) => dispatch({ 
      type: 'UPDATE_FEATURE', 
      feature, 
      payload: enabled 
    }),
    updateCustom: (properties) => dispatch({ type: 'UPDATE_CUSTOM', payload: properties }),
    resetTheme: () => dispatch({ type: 'RESET_THEME' })
  }), [state, effectiveMode, colorScheme, designTokens, cssVariables]);
  
  return (
    <ModernThemeContext.Provider value={contextValue}>
      {children}
    </ModernThemeContext.Provider>
  );
}

// Hook to use theme context
export function useModernTheme() {
  const context = useContext(ModernThemeContext);
  if (!context) {
    throw new Error('useModernTheme must be used within ModernThemeProvider');
  }
  return context;
}

// Higher-order component for theme-aware components
export function withModernTheme(Component) {
  return function ThemedComponent(props) {
    const theme = useModernTheme();
    return <Component {...props} theme={theme} />;
  };
}

export default ModernThemeProvider;