/**
 * Global Theme Provider for PsyPsy CMS
 * 
 * This component wraps the entire application with our global theme system,
 * providing consistent design tokens and theme switching capabilities.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMaterialUIController } from 'context';
import GlobalTheme, { 
  createLightTheme, 
  createDarkTheme,
  brandColors,
  semanticColors,
  darkModeColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  transitions
} from 'config/globalTheme';

// Create theme context for easy access throughout the app
const GlobalThemeContext = createContext();

/**
 * Global Theme Provider Component
 */
export function GlobalThemeProvider({ children }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  // Create the Material-UI theme based on dark mode setting
  const muiTheme = useMemo(() => {
    return darkMode ? createDarkTheme() : createLightTheme();
  }, [darkMode]);

  // Create theme value with all design tokens and utilities
  const themeValue = useMemo(() => {
    const currentColors = darkMode ? darkModeColors : semanticColors;
    
    return {
      // Current theme mode
      isDarkMode: darkMode,
      mode: darkMode ? 'dark' : 'light',
      
      // Material-UI theme instance
      muiTheme,
      
      // Design tokens
      colors: {
        brand: brandColors,
        ...currentColors
      },
      typography,
      spacing,
      borderRadius,
      shadows,
      zIndex,
      breakpoints,
      transitions,
      
      // Utility functions
      getColor: (path) => {
        const pathArray = path.split('.');
        let value = darkMode ? darkModeColors : semanticColors;
        
        // Check brand colors first
        if (pathArray[0] === 'brand') {
          value = brandColors;
          pathArray.shift(); // Remove 'brand' from path
        }
        
        for (const key of pathArray) {
          value = value[key];
          if (value === undefined) break;
        }
        return value;
      },
      
      getSpacing: (value) => {
        if (typeof value === 'number') {
          return spacing[value] || `${value * 8}px`;
        }
        return spacing[value] || value;
      },
      
      getShadow: (level) => {
        return shadows[level] || shadows.sm;
      },
      
      getBorderRadius: (size) => {
        return borderRadius[size] || borderRadius.md;
      },
      
      // Theme-aware style creator
      createStyles: (styleFunction) => {
        if (typeof styleFunction === 'function') {
          return styleFunction({
            colors: darkMode ? darkModeColors : semanticColors,
            brand: brandColors,
            typography,
            spacing,
            borderRadius,
            shadows,
            zIndex,
            breakpoints,
            transitions,
            isDarkMode: darkMode
          });
        }
        return styleFunction;
      }
    };
  }, [darkMode, muiTheme]);

  return (
    <GlobalThemeContext.Provider value={themeValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </GlobalThemeContext.Provider>
  );
}

/**
 * Hook to access the global theme
 */
export function useGlobalTheme() {
  const context = useContext(GlobalThemeContext);
  
  if (!context) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  
  return context;
}

/**
 * Hook for creating theme-aware styles
 * 
 * @param {Function} styleFunction - Function that receives theme tokens and returns styles
 * @returns {Object} - Computed styles
 * 
 * @example
 * const styles = useThemeStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.background.paper,
 *     padding: theme.getSpacing(4),
 *     borderRadius: theme.getBorderRadius('lg'),
 *     boxShadow: theme.getShadow('md')
 *   }
 * }));
 */
export function useThemeStyles(styleFunction) {
  const theme = useGlobalTheme();
  
  return useMemo(() => {
    return theme.createStyles(styleFunction);
  }, [theme, styleFunction]);
}

/**
 * Hook for accessing theme colors
 * 
 * @param {string} colorPath - Dot notation path to color (e.g., 'brand.primary.main', 'text.primary')
 * @returns {string} - Color value
 * 
 * @example
 * const primaryColor = useThemeColor('brand.primary.main');
 * const textColor = useThemeColor('text.primary');
 */
export function useThemeColor(colorPath) {
  const theme = useGlobalTheme();
  
  return useMemo(() => {
    return theme.getColor(colorPath);
  }, [theme, colorPath]);
}

/**
 * Higher-order component for theme injection
 */
export function withGlobalTheme(Component) {
  return function ThemedComponent(props) {
    const theme = useGlobalTheme();
    return <Component {...props} theme={theme} />;
  };
}

/**
 * Component for conditional rendering based on theme mode
 */
export function ThemeMode({ light, dark, children }) {
  const { isDarkMode } = useGlobalTheme();
  
  if (children) {
    return typeof children === 'function' ? children(isDarkMode) : children;
  }
  
  return isDarkMode ? dark : light;
}

/**
 * Styled Box component with theme-aware styles
 */
export function ThemedBox({ 
  sx, 
  children, 
  component = 'div',
  ...props 
}) {
  const theme = useGlobalTheme();
  
  const computedSx = useMemo(() => {
    if (typeof sx === 'function') {
      return sx(theme);
    }
    return sx;
  }, [sx, theme]);

  const Component = component;

  return (
    <Component 
      sx={computedSx}
      {...props}
    >
      {children}
    </Component>
  );
}

export default GlobalThemeProvider; 