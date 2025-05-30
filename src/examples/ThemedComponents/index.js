/**
 * PsyPsy CMS - Themed Components Examples
 * 
 * This file demonstrates how to use the global theme system
 * for consistent styling across the application.
 */

import React from 'react';
import { Card, Button, TextField, Typography, Box } from '@mui/material';
import { 
  useGlobalTheme, 
  useThemeStyles, 
  useThemeColor, 
  ThemeMode,
  ThemedBox 
} from 'components/GlobalThemeProvider';

/**
 * Example 1: Using useThemeStyles hook
 */
export function StyledCard({ children, title }) {
  const styles = useThemeStyles((theme) => ({
    card: {
      backgroundColor: theme.colors.background.paper,
      padding: theme.getSpacing(6),
      borderRadius: theme.getBorderRadius('lg'),
      boxShadow: theme.getShadow('md'),
      border: `1px solid ${theme.colors.divider}`,
      transition: `all ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
      '&:hover': {
        boxShadow: theme.getShadow('lg'),
        transform: 'translateY(-2px)'
      }
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      marginBottom: theme.getSpacing(4),
      fontFamily: theme.typography.fontFamily.primary
    }
  }));

  return (
    <Box sx={styles.card}>
      {title && <Typography sx={styles.title}>{title}</Typography>}
      {children}
    </Box>
  );
}

/**
 * Example 2: Using useThemeColor hook
 */
export function ColoredButton({ children, variant = 'primary', ...props }) {
  const primaryColor = useThemeColor('brand.primary.main');
  const primaryDark = useThemeColor('brand.primary.dark');
  const secondaryColor = useThemeColor('brand.secondary.main');
  const theme = useGlobalTheme();

  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: primaryColor,
          color: 'white',
          '&:hover': {
            backgroundColor: primaryDark,
            transform: 'translateY(-1px)',
            boxShadow: theme.getShadow('md')
          }
        };
      case 'secondary':
        return {
          backgroundColor: secondaryColor,
          color: 'white',
          '&:hover': {
            backgroundColor: useThemeColor('brand.secondary.dark'),
            transform: 'translateY(-1px)',
            boxShadow: theme.getShadow('md')
          }
        };
      case 'outlined':
        return {
          border: `2px solid ${primaryColor}`,
          backgroundColor: 'transparent',
          color: primaryColor,
          '&:hover': {
            backgroundColor: primaryColor,
            color: 'white'
          }
        };
      default:
        return {};
    }
  };

  return (
    <Button
      sx={{
        ...getButtonStyles(),
        borderRadius: theme.getBorderRadius('md'),
        padding: `${theme.getSpacing(3)} ${theme.getSpacing(6)}`,
        textTransform: 'none',
        fontWeight: theme.typography.fontWeight.medium,
        transition: 'all 0.2s ease-in-out'
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Example 3: Using ThemeMode for conditional rendering
 */
export function ThemeAwareIcon() {
  return (
    <ThemeMode
      light={<span>☀️ Light Mode</span>}
      dark={<span>🌙 Dark Mode</span>}
    />
  );
}

/**
 * Example 4: Using ThemedBox component
 */
export function ResponsiveContainer({ children }) {
  return (
    <ThemedBox
      sx={(theme) => ({
        maxWidth: '1200px',
        margin: '0 auto',
        padding: theme.getSpacing(4),
        [theme.breakpoints.md]: {
          padding: theme.getSpacing(6)
        },
        [theme.breakpoints.lg]: {
          padding: theme.getSpacing(8)
        }
      })}
    >
      {children}
    </ThemedBox>
  );
}

/**
 * Example 5: Custom form component with theme integration
 */
export function ThemedForm({ onSubmit, children }) {
  const styles = useThemeStyles((theme) => ({
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.getSpacing(4),
      padding: theme.getSpacing(6),
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.getBorderRadius('xl'),
      boxShadow: theme.getShadow('lg'),
      border: `1px solid ${theme.colors.divider}`
    },
    submitButton: {
      marginTop: theme.getSpacing(4),
      backgroundColor: theme.colors.brand.primary.main,
      color: 'white',
      padding: `${theme.getSpacing(3)} ${theme.getSpacing(6)}`,
      borderRadius: theme.getBorderRadius('md'),
      border: 'none',
      fontWeight: theme.typography.fontWeight.medium,
      fontSize: theme.typography.fontSize.base,
      cursor: 'pointer',
      transition: `all ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
      '&:hover': {
        backgroundColor: theme.colors.brand.primary.dark,
        transform: 'translateY(-1px)',
        boxShadow: theme.getShadow('md')
      }
    }
  }));

  return (
    <form onSubmit={onSubmit} style={styles.form}>
      {children}
      <button type="submit" style={styles.submitButton}>
        Submit
      </button>
    </form>
  );
}

/**
 * Example 6: Data display card with theme-aware styling
 */
export function StatCard({ title, value, subtitle, icon, trend }) {
  const theme = useGlobalTheme();
  
  const styles = useThemeStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background.paper,
      padding: theme.getSpacing(6),
      borderRadius: theme.getBorderRadius('lg'),
      boxShadow: theme.getShadow('sm'),
      border: `1px solid ${theme.colors.divider}`,
      transition: `all ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
      cursor: 'pointer',
      '&:hover': {
        boxShadow: theme.getShadow('md'),
        transform: 'translateY(-2px)',
        borderColor: theme.colors.brand.primary.light
      }
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.getSpacing(3)
    },
    title: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    icon: {
      color: theme.colors.brand.primary.main,
      fontSize: '24px'
    },
    value: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.tight,
      marginBottom: theme.getSpacing(2)
    },
    subtitle: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      display: 'flex',
      alignItems: 'center',
      gap: theme.getSpacing(2)
    },
    trend: {
      color: trend === 'up' ? theme.colors.brand.success.main : theme.colors.brand.error.main,
      fontWeight: theme.typography.fontWeight.medium
    }
  }));

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography sx={styles.title}>{title}</Typography>
        {icon && <Box sx={styles.icon}>{icon}</Box>}
      </Box>
      
      <Typography sx={styles.value}>{value}</Typography>
      
      {subtitle && (
        <Box sx={styles.subtitle}>
          <span>{subtitle}</span>
          {trend && (
            <span style={styles.trend}>
              {trend === 'up' ? '↗' : '↘'}
            </span>
          )}
        </Box>
      )}
    </Box>
  );
}

/**
 * Example 7: Navigation component with theme integration
 */
export function ThemedNavigation({ items, activeItem, onItemClick }) {
  const styles = useThemeStyles((theme) => ({
    nav: {
      display: 'flex',
      gap: theme.getSpacing(2),
      padding: theme.getSpacing(4),
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.getBorderRadius('lg'),
      boxShadow: theme.getShadow('sm'),
      border: `1px solid ${theme.colors.divider}`
    },
    item: {
      padding: `${theme.getSpacing(3)} ${theme.getSpacing(4)}`,
      borderRadius: theme.getBorderRadius('md'),
      cursor: 'pointer',
      transition: `all ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeInOut}`,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      border: 'none',
      backgroundColor: 'transparent'
    },
    activeItem: {
      backgroundColor: theme.colors.brand.primary.main,
      color: 'white',
      boxShadow: theme.getShadow('sm')
    },
    inactiveItem: {
      color: theme.colors.text.secondary,
      '&:hover': {
        backgroundColor: theme.colors.action.hover,
        color: theme.colors.text.primary
      }
    }
  }));

  return (
    <nav style={styles.nav}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          style={{
            ...styles.item,
            ...(activeItem === item.id ? styles.activeItem : styles.inactiveItem)
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default {
  StyledCard,
  ColoredButton,
  ThemeAwareIcon,
  ResponsiveContainer,
  ThemedForm,
  StatCard,
  ThemedNavigation
}; 