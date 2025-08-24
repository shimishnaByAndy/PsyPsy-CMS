/**
 * VirtualizationThemeProvider - Theme integration for virtualized components
 * 
 * Provides consistent theming and performance settings for virtual scrolling
 * components with Material-UI integration.
 */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';

const VirtualizationThemeContext = createContext();

export const VirtualizationThemeProvider = ({ children }) => {
  const theme = useTheme();

  const virtualizationTheme = {
    // Row styling
    rowHeight: 52,
    headerHeight: 56,
    borderColor: theme.palette.divider,
    
    // Colors
    evenRowBackground: 'transparent',
    oddRowBackground: theme.palette.action.hover,
    hoverBackground: theme.palette.action.hover,
    selectedBackground: theme.palette.action.selected,
    
    // Text colors
    primaryText: theme.palette.text.primary,
    secondaryText: theme.palette.text.secondary,
    disabledText: theme.palette.text.disabled,
    
    // Header styling
    headerBackground: theme.palette.grey[50],
    headerText: theme.palette.text.primary,
    headerBorder: theme.palette.divider,
    
    // Spacing
    cellPadding: theme.spacing(2),
    rowPadding: theme.spacing(1),
    overscan: 10,
    
    // Performance settings
    cacheSize: 1000,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    debounceMs: 100,
    
    // Loading states
    loadingBackground: theme.palette.background.default,
    loadingText: theme.palette.text.secondary,
    
    // Scrollbar styling (for custom scrollbars)
    scrollbar: {
      width: 8,
      track: theme.palette.grey[100],
      thumb: theme.palette.grey[400],
      thumbHover: theme.palette.grey[600],
    },
    
    // Focus and accessibility
    focusColor: theme.palette.primary.main,
    focusOutline: `2px solid ${theme.palette.primary.main}`,
    
    // Status colors for data
    statusColors: {
      active: theme.palette.success.main,
      inactive: theme.palette.warning.main,
      error: theme.palette.error.main,
      pending: theme.palette.info.main,
    },
    
    // Breakpoints for responsive behavior
    breakpoints: theme.breakpoints.values,
  };

  return (
    <VirtualizationThemeContext.Provider value={virtualizationTheme}>
      {children}
    </VirtualizationThemeContext.Provider>
  );
};

VirtualizationThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access virtualization theme
 */
export const useVirtualizationTheme = () => {
  const context = useContext(VirtualizationThemeContext);
  if (!context) {
    throw new Error('useVirtualizationTheme must be used within VirtualizationThemeProvider');
  }
  return context;
};

/**
 * HOC to wrap components with virtualization theme
 */
export const withVirtualizationTheme = (Component) => {
  const WrappedComponent = (props) => (
    <VirtualizationThemeProvider>
      <Component {...props} />
    </VirtualizationThemeProvider>
  );

  WrappedComponent.displayName = `withVirtualizationTheme(${Component.displayName || Component.name})`;
  return WrappedComponent;
};