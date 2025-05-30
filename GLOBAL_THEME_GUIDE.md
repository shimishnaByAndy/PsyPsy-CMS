# PsyPsy CMS - Global Theme System Guide

## 🎨 Overview

The PsyPsy CMS global theme system provides a comprehensive, consistent design language across the entire application. It includes:

- **Design Tokens**: Colors, typography, spacing, shadows, borders
- **Theme Modes**: Light and dark mode support with automatic switching
- **Component Styles**: Pre-built styles for common UI patterns
- **Utility Functions**: Helper functions for common styling tasks
- **React Hooks**: Easy-to-use hooks for theme integration

## 🚀 Quick Start

### 1. Basic Usage

```jsx
import { useGlobalTheme, useThemeStyles } from 'components/GlobalThemeProvider';

function MyComponent() {
  const theme = useGlobalTheme();
  
  const styles = useThemeStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background.paper,
      padding: theme.getSpacing(4),
      borderRadius: theme.getBorderRadius('lg'),
      boxShadow: theme.getShadow('md')
    }
  }));

  return <div style={styles.container}>Hello PsyPsy!</div>;
}
```

## 🎯 Available Hooks

### `useGlobalTheme()`

Returns the complete theme object with all design tokens and utilities.

```jsx
const theme = useGlobalTheme();
console.log(theme.isDarkMode); // true/false
console.log(theme.colors.brand.primary.main); // "#899581"
```

### `useThemeStyles(styleFunction)`

Creates theme-aware styles using a function that receives theme tokens.

```jsx
const styles = useThemeStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.brand.primary.main,
    padding: `${theme.getSpacing(3)} ${theme.getSpacing(6)}`,
    borderRadius: theme.getBorderRadius('md'),
    boxShadow: theme.getShadow('sm'),
    '&:hover': {
      backgroundColor: theme.colors.brand.primary.dark,
      boxShadow: theme.getShadow('md')
    }
  }
}));
```

### `useThemeColor(colorPath)`

Get specific colors using dot notation.

```jsx
const primaryColor = useThemeColor('brand.primary.main');
const textColor = useThemeColor('text.primary');
const backgroundColor = useThemeColor('background.paper');
```

## 🎨 Design Tokens

### Colors

The theme provides a comprehensive color system:

#### Brand Colors
```jsx
// Primary brand color (PsyPsy green)
theme.colors.brand.primary.main     // "#899581"
theme.colors.brand.primary.light    // "#b3c4ab"
theme.colors.brand.primary.dark     // "#55624e"

// Secondary brand color (burgundy)
theme.colors.brand.secondary.main   // "#7d2a47"
theme.colors.brand.secondary.light  // "#be3456"
theme.colors.brand.secondary.dark   // "#5a1d33"

// Accent colors
theme.colors.brand.accent.main      // "#9b8ba7"
```

#### Semantic Colors
```jsx
// Text colors (auto-adjust for dark mode)
theme.colors.text.primary           // "#1a1a1a" (light) / "#ffffff" (dark)
theme.colors.text.secondary         // "#666666" (light) / "#b3b3b3" (dark)
theme.colors.text.disabled          // "#9e9e9e" (light) / "#666666" (dark)

// Background colors
theme.colors.background.default     // "#fafafa" (light) / "#121212" (dark)
theme.colors.background.paper       // "#ffffff" (light) / "#1e1e1e" (dark)
theme.colors.background.light       // "#f5f5f5" (light) / "#2a2a2a" (dark)

// Status colors
theme.colors.brand.success.main     // "#21CA83"
theme.colors.brand.warning.main     // "#FFC107"
theme.colors.brand.error.main       // "#FF4444"
theme.colors.brand.info.main        // "#2563eb"
```

### Typography

```jsx
// Font families
theme.typography.fontFamily.primary    // "Josefin Sans"
theme.typography.fontFamily.secondary  // "Quicksand"
theme.typography.fontFamily.code       // "Fira Code"

// Font sizes (rem units)
theme.typography.fontSize.xs           // 0.75rem (12px)
theme.typography.fontSize.sm           // 0.875rem (14px)
theme.typography.fontSize.base         // 1rem (16px)
theme.typography.fontSize.lg           // 1.125rem (18px)
theme.typography.fontSize.xl           // 1.25rem (20px)
theme.typography.fontSize['2xl']       // 1.5rem (24px)
theme.typography.fontSize['3xl']       // 1.875rem (30px)

// Font weights
theme.typography.fontWeight.light      // 300
theme.typography.fontWeight.normal     // 400
theme.typography.fontWeight.medium     // 500
theme.typography.fontWeight.semibold   // 600
theme.typography.fontWeight.bold       // 700
```

### Spacing (8pt Grid System)

```jsx
theme.spacing[0]    // "0px"
theme.spacing[1]    // "0.25rem" (4px)
theme.spacing[2]    // "0.5rem" (8px)
theme.spacing[3]    // "0.75rem" (12px)
theme.spacing[4]    // "1rem" (16px)
theme.spacing[6]    // "1.5rem" (24px)
theme.spacing[8]    // "2rem" (32px)
theme.spacing[12]   // "3rem" (48px)
theme.spacing[16]   // "4rem" (64px)

// Helper function
theme.getSpacing(4) // "1rem"
theme.getSpacing(6) // "1.5rem"
```

### Border Radius

```jsx
theme.borderRadius.none    // "0px"
theme.borderRadius.sm      // "0.125rem" (2px)
theme.borderRadius.base    // "0.25rem" (4px)
theme.borderRadius.md      // "0.375rem" (6px)
theme.borderRadius.lg      // "0.5rem" (8px)
theme.borderRadius.xl      // "0.75rem" (12px)
theme.borderRadius['2xl']  // "1rem" (16px)
theme.borderRadius.full    // "9999px"

// Helper function
theme.getBorderRadius('lg') // "0.5rem"
```

### Shadows

```jsx
theme.shadows.xs     // Subtle shadow
theme.shadows.sm     // Small shadow
theme.shadows.base   // Default shadow
theme.shadows.md     // Medium shadow
theme.shadows.lg     // Large shadow
theme.shadows.xl     // Extra large shadow

// Helper function
theme.getShadow('md') // Returns shadow value
```

## 🧩 Component Patterns

### Card Pattern

```jsx
const styles = useThemeStyles((theme) => ({
  card: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.getSpacing(6),
    borderRadius: theme.getBorderRadius('lg'),
    boxShadow: theme.getShadow('sm'),
    border: `1px solid ${theme.colors.divider}`,
    transition: `all ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
    '&:hover': {
      boxShadow: theme.getShadow('md'),
      transform: 'translateY(-2px)'
    }
  }
}));
```

### Button Pattern

```jsx
const styles = useThemeStyles((theme) => ({
  primaryButton: {
    backgroundColor: theme.colors.brand.primary.main,
    color: 'white',
    padding: `${theme.getSpacing(3)} ${theme.getSpacing(6)}`,
    borderRadius: theme.getBorderRadius('md'),
    border: 'none',
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.colors.brand.primary.dark,
      transform: 'translateY(-1px)',
      boxShadow: theme.getShadow('md')
    }
  }
}));
```

### Form Pattern

```jsx
const styles = useThemeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.getSpacing(4),
    padding: theme.getSpacing(6),
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.getBorderRadius('xl'),
    boxShadow: theme.getShadow('lg')
  },
  input: {
    padding: theme.getSpacing(3),
    borderRadius: theme.getBorderRadius('md'),
    border: `1px solid ${theme.colors.divider}`,
    fontSize: theme.typography.fontSize.base,
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.brand.primary.main,
      boxShadow: `0 0 0 3px ${theme.colors.brand.primary.main}20`
    }
  }
}));
```

## 🌙 Dark Mode

The theme automatically switches between light and dark modes based on the Material Dashboard controller state.

### Conditional Rendering

```jsx
import { ThemeMode } from 'components/GlobalThemeProvider';

function MyComponent() {
  return (
    <ThemeMode
      light={<span>☀️ Light content</span>}
      dark={<span>🌙 Dark content</span>}
    />
  );
}

// Or with a function
function MyComponent() {
  return (
    <ThemeMode>
      {(isDarkMode) => (
        <span>{isDarkMode ? '🌙 Dark' : '☀️ Light'}</span>
      )}
    </ThemeMode>
  );
}
```

### Theme-Aware Styles

Colors automatically adjust for dark mode:

```jsx
const styles = useThemeStyles((theme) => ({
  container: {
    // This will be white in light mode, dark in dark mode
    backgroundColor: theme.colors.background.paper,
    // This will be black in light mode, white in dark mode
    color: theme.colors.text.primary
  }
}));
```

## 🎛️ Utility Components

### ThemedBox

A wrapper component with theme-aware styling:

```jsx
import { ThemedBox } from 'components/GlobalThemeProvider';

<ThemedBox
  sx={(theme) => ({
    padding: theme.getSpacing(4),
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.getBorderRadius('lg')
  })}
>
  Content here
</ThemedBox>
```

## 📱 Responsive Design

Use breakpoints for responsive design:

```jsx
const styles = useThemeStyles((theme) => ({
  container: {
    padding: theme.getSpacing(4),
    // Medium screens and up
    [`@media (min-width: ${theme.breakpoints.md})`]: {
      padding: theme.getSpacing(6)
    },
    // Large screens and up
    [`@media (min-width: ${theme.breakpoints.lg})`]: {
      padding: theme.getSpacing(8)
    }
  }
}));
```

## 🔧 Migration from Old Theme

### Before (Old Theme System)

```jsx
// Old way
import { useTheme } from 'components/ThemeProvider';

const { colors } = useTheme();
const mainColor = colors.mainColor;
```

### After (New Global Theme System)

```jsx
// New way
import { useThemeColor } from 'components/GlobalThemeProvider';

const mainColor = useThemeColor('brand.primary.main');
```

## 🎨 Best Practices

### 1. Use Design Tokens

❌ **Don't hardcode values:**
```jsx
const styles = {
  button: {
    backgroundColor: '#899581',
    padding: '12px 24px',
    borderRadius: '8px'
  }
};
```

✅ **Use design tokens:**
```jsx
const styles = useThemeStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.brand.primary.main,
    padding: `${theme.getSpacing(3)} ${theme.getSpacing(6)}`,
    borderRadius: theme.getBorderRadius('md')
  }
}));
```

### 2. Use Theme-Aware Colors

❌ **Don't use fixed colors:**
```jsx
color: '#000000' // Won't work in dark mode
```

✅ **Use theme-aware colors:**
```jsx
color: theme.colors.text.primary // Automatically adjusts for dark mode
```

### 3. Use Consistent Spacing

❌ **Don't use arbitrary spacing:**
```jsx
margin: '13px',
padding: '7px 19px'
```

✅ **Use the 8pt grid system:**
```jsx
margin: theme.getSpacing(2),        // 8px
padding: `${theme.getSpacing(1)} ${theme.getSpacing(3)}` // 4px 12px
```

### 4. Leverage Utility Functions

```jsx
const styles = useThemeStyles((theme) => ({
  card: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.getSpacing(6),
    borderRadius: theme.getBorderRadius('lg'),
    boxShadow: theme.getShadow('md'),
    transition: `all ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`
  }
}));
```

## 🔍 Examples

Check out `src/examples/ThemedComponents/index.js` for complete examples of:

- ✅ Styled cards with hover effects
- ✅ Theme-aware buttons
- ✅ Responsive containers
- ✅ Form components
- ✅ Data display cards
- ✅ Navigation components

## 🎉 Benefits

1. **Consistency**: All components use the same design tokens
2. **Maintainability**: Change colors/spacing in one place
3. **Dark Mode**: Automatic theme switching with proper contrast
4. **Performance**: Memoized styles prevent unnecessary re-renders
5. **Developer Experience**: TypeScript-like intellisense with clear APIs
6. **Accessibility**: Built-in contrast ratios and focus states
7. **Responsive**: Built-in breakpoint system

## 📚 Next Steps

1. Update existing components to use the new theme system
2. Remove old theme dependencies
3. Test dark mode functionality across all components
4. Create component library documentation
5. Set up design token tooling for designers

---

**Happy Theming! 🎨** 