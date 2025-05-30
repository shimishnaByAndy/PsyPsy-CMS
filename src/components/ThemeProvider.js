/**
 * PsyPsy CMS - Enhanced Theme Provider
 * Provides theme context with dark mode support and centralized theme utilities
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useMaterialUIController } from 'context';
import { 
  THEME, 
  createDarkTheme, 
  createComponentStyles, 
  createThemeColors,
  styleHelpers 
} from 'config/theme';

// Create theme context
const ThemeContext = createContext();

/**
 * Theme Provider Component
 * Wraps the application and provides theme utilities based on current dark mode state
 */
export function PsyPsyThemeProvider({ children }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  // Memoize theme values to prevent unnecessary re-renders
  const themeValue = useMemo(() => {
    const currentTheme = darkMode ? createDarkTheme() : THEME;
    const componentStyles = createComponentStyles(darkMode);
    const themeColors = createThemeColors(darkMode);

    return {
      // Theme configuration
      theme: currentTheme,
      isDarkMode: darkMode,
      
      // Colors (theme-aware)
      colors: themeColors,
      
      // Component styles (theme-aware)
      componentStyles,
      
      // Style helpers
      styleHelpers,
      
      // Utility functions
      getThemeColor: (colorPath) => {
        const pathArray = colorPath.split('.');
        let value = themeColors;
        for (const key of pathArray) {
          value = value[key];
          if (value === undefined) break;
        }
        return value;
      },
      
      // Create theme-aware styles
      createStyles: (styleFunction) => {
        return typeof styleFunction === 'function' 
          ? styleFunction(themeColors, currentTheme, styleHelpers)
          : styleFunction;
      },
    };
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 * Provides access to theme configuration, colors, and utilities
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a PsyPsyThemeProvider');
  }
  
  return context;
}

/**
 * Higher-order component for theme-aware components
 * Injects theme props into wrapped component
 */
export function withTheme(Component) {
  return function ThemedComponent(props) {
    const themeProps = useTheme();
    return <Component {...props} {...themeProps} />;
  };
}

/**
 * Hook for creating theme-aware styles
 * Usage: const styles = useThemeStyles((colors, theme, helpers) => ({ ... }))
 */
export function useThemeStyles(styleFunction) {
  const { createStyles } = useTheme();
  return useMemo(() => createStyles(styleFunction), [createStyles, styleFunction]);
}

/**
 * Hook for accessing specific theme colors
 * Usage: const mainColor = useThemeColor('mainColor')
 */
export function useThemeColor(colorPath) {
  const { getThemeColor } = useTheme();
  return useMemo(() => getThemeColor(colorPath), [getThemeColor, colorPath]);
}

/**
 * Component for conditional rendering based on theme mode
 * Usage: <ThemeMode light={<LightComponent />} dark={<DarkComponent />} />
 */
export function ThemeMode({ light, dark, children }) {
  const { isDarkMode } = useTheme();
  
  if (children) {
    return typeof children === 'function' ? children(isDarkMode) : children;
  }
  
  return isDarkMode ? dark : light;
}

/**
 * Utility component for applying theme-aware styles
 * Usage: <ThemedBox sx={(colors) => ({ backgroundColor: colors.mainColor })} />
 */
export function ThemedBox({ sx, children, ...props }) {
  const { colors, theme, styleHelpers } = useTheme();
  
  const computedSx = useMemo(() => {
    if (typeof sx === 'function') {
      return sx(colors, theme, styleHelpers);
    }
    return sx;
  }, [sx, colors, theme, styleHelpers]);

  return (
    <div style={computedSx} {...props}>
      {children}
    </div>
  );
}

// Export theme utilities for direct use
export {
  THEME,
  createDarkTheme,
  createComponentStyles,
  createThemeColors,
  styleHelpers
} from 'config/theme';

export default PsyPsyThemeProvider; 