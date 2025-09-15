# PsyPsy CMS - Theme & Internationalization Guide

## Overview

This guide explains how to use the centralized theme system and internationalization (i18n) in the PsyPsy CMS application for consistent styling and proper multilingual support.

## 🎨 Centralized Theme System

### 1. Theme Configuration

The theme system is located in `src/config/theme.js` and provides:

- **Colors**: Exact app color scheme with semantic naming
- **Typography**: App-specific font families (Josefin Sans, Quicksand, Romantically)
- **Spacing**: Consistent spacing values
- **Components**: Pre-defined component styles
- **Shadows & Effects**: Standardized shadows and visual effects

### 2. Accessing the Theme

#### Method 1: Direct Import
```javascript
import { THEME, componentStyles, styleHelpers } from 'config/theme';

// Use theme colors
const headerStyle = {
  backgroundColor: THEME.colors.mainColor,
  color: THEME.colors.txt,
  borderRadius: THEME.borderRadius.lg,
};

// Use component styles
<TextField sx={componentStyles.searchInput} />

// Use style helpers
const centeredBox = {
  ...styleHelpers.flexCenter,
  height: '100vh',
};
```

#### Method 2: Theme Provider (Recommended)
```javascript
import { useTheme } from 'components/ThemeProvider';

function MyComponent() {
  const { theme, componentStyles, styleHelpers } = useTheme();
  
  return (
    <MDBox sx={{ 
      backgroundColor: theme.colors.bgLight,
      padding: theme.spacing.lg 
    }}>
      {/* Component content */}
    </MDBox>
  );
}
```

### 3. Theme Structure

#### Colors - Exact App Color Scheme
```javascript
// Main Brand Colors
THEME.colors.mainColor          // "#899581" - Main brand color
THEME.colors.mainColorTxt       // "#899581" - Main color for text
THEME.colors.prevMainColor      // "#A9AC99" - Previous main color (lighter)
THEME.colors.mainDark           // "#000000" - Main dark color
THEME.colors.txt                // "#FFFFFF" - White text
THEME.colors.bgLight            // "#F2F0ED" - Light background
THEME.colors.bgLight2           // "#fbf4f7" - Light background variant 2
THEME.colors.mainMedium         // "#5d1c33" - Medium main color (burgundy)
THEME.colors.filledGreen        // "#1F650E" - Filled green
THEME.colors.mainLight          // "#F8F8EE" - Main light color
THEME.colors.btnNotSel          // "#F6F7F5" - Button not selected
THEME.colors.tableBgLight       // "#FAFAFA" - Table background light
THEME.colors.tableBgSuperLight  // "#F9F9F9" - Table background super light
THEME.colors.accent1            // "#3D314A" - Accent color 1 (purple)
THEME.colors.accent2            // "#B3B8A2" - Accent color 2 (grey-green)
THEME.colors.mTyStatus          // "#A7A7A7" - Status color
THEME.colors.hintTxt            // "#AD9E93" - Hint text color
THEME.colors.errorRed           // "#D00000" - Error red
THEME.colors.cancelBg           // "#FFCBCB" - Cancel background
THEME.colors.confirmGreen       // "#11BA73" - Confirm green
THEME.colors.noAnsYet           // "#A8A8A8" - No answer yet
THEME.colors.apptOffer          // "#A8A8A8" - Appointment offer
THEME.colors.apptApplied        // "#5d1c33" - Appointment applied
THEME.colors.closeHandle        // "#DADADA" - Close handle

// Legacy compatibility
THEME.colors.primary            // Maps to mainColor
THEME.colors.primaryLight       // Maps to prevMainColor
THEME.colors.secondary          // Maps to mainMedium
THEME.colors.accent             // Maps to accent1
```

#### Typography - App Font Structure
```javascript
// Font1 (Josefin Sans)
THEME.typography.font1.regular      // "JosefinSans-Regular"
THEME.typography.font1.light        // "JosefinSans-Light"
THEME.typography.font1.medium       // "JosefinSans-Medium"
THEME.typography.font1.lightItalic  // "JosefinSans-LightItalic"
THEME.typography.font1.bold         // "JosefinSans-Bold"

// Font2 (Quicksand)
THEME.typography.font2.regular      // "Quicksand-Regular"
THEME.typography.font2.light        // "Quicksand-Light"
THEME.typography.font2.medium       // "Quicksand-Medium"
THEME.typography.font2.semibold     // "Quicksand-SemiBold"
THEME.typography.font2.bold         // "Quicksand-Bold"

// Special Fonts
THEME.typography.fonts.logo         // "Romantically" - Logo font
THEME.typography.fonts.icons        // "icomoon" - Icon font

// Font Weights
THEME.typography.weightLight        // 300
THEME.typography.weightRegular      // 400
THEME.typography.weightMedium       // 500
THEME.typography.weightSemiBold     // 600
THEME.typography.weightBold         // 700

// Font Sizes
THEME.typography.sizeXS             // 12px
THEME.typography.sizeSM             // 14px
THEME.typography.sizeMD             // 16px
THEME.typography.sizeLG             // 18px
```

#### Spacing & Layout
```javascript
// Spacing
THEME.spacing.xs    // 4px
THEME.spacing.sm    // 8px
THEME.spacing.md    // 16px
THEME.spacing.lg    // 24px
THEME.spacing.xl    // 32px

// Border Radius
THEME.borderRadius.sm   // 4px
THEME.borderRadius.md   // 8px
THEME.borderRadius.lg   // 12px

// Shadows
THEME.shadows.sm        // Small shadow
THEME.shadows.md        // Medium shadow
THEME.shadows.lg        // Large shadow
```

### 4. Component Styles

Pre-defined styles for common components:

```javascript
// Search Input
<TextField sx={componentStyles.searchInput} />

// Data Grid
<DataGrid sx={componentStyles.dataGrid} />

// Page Header
<MDBox sx={componentStyles.pageHeader}>
  <MDTypography variant="h5">Page Title</MDTypography>
</MDBox>

// Status Chips
<Chip sx={componentStyles.statusChip.active} />
<Chip sx={componentStyles.statusChip.applied} />
<Chip sx={componentStyles.statusChip.offer} />
<Chip sx={componentStyles.statusChip.noAnswer} />
```

### 5. Style Helpers

Utility functions for common styling patterns:

```javascript
// Centered flex container
const centeredStyle = styleHelpers.flexCenter;

// Text truncation
const truncatedText = styleHelpers.truncate(2); // 2 lines

// Hover transition
const hoverStyle = styleHelpers.hoverTransition('transform');

// Glass effect
const glassStyle = styleHelpers.glass(0.15); // 15% opacity

// Gradient background
const gradientStyle = {
  background: styleHelpers.gradient(
    THEME.colors.mainColor, 
    THEME.colors.prevMainColor
  )
};
```

## 🌍 Internationalization (i18n)

### 1. Setup

The i18n system uses `react-i18next` and is configured in `src/localization/i18n.js`.

Translation files are located in:
- `src/localization/locales/en/translation.json` (English)
- `src/localization/locales/fr/translation.json` (French)

### 2. Using Translations

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.dashboard')}</h1>
      <p>{t('common.search')}</p>
      
      {/* With interpolation */}
      <p>{t('strings.export', { count: 5 })}</p>
      
      {/* Change language */}
      <button onClick={() => i18n.changeLanguage('fr')}>
        French
      </button>
    </div>
  );
}
```

### 3. Translation Structure

Translations are organized by feature/section:

```json
{
  "common": {
    "search": "Search here",
    "logout": "Logout",
    "dashboard": "Dashboard"
  },
  "strings": {
    "title": "String Management",
    "searchPlaceholder": "Search strings...",
    "export": "Export {{count}} Changes"
  },
  "clients": {
    "title": "Client Management",
    "filters": {
      "gender": "Gender",
      "status": "Status"
    }
  }
}
```

### 4. Adding New Translations

1. Add the key-value pair to both English and French translation files
2. Use the translation in your component with `t('key')`

**English** (`src/localization/locales/en/translation.json`):
```json
{
  "mySection": {
    "newFeature": "New Feature",
    "description": "This is a new feature"
  }
}
```

**French** (`src/localization/locales/fr/translation.json`):
```json
{
  "mySection": {
    "newFeature": "Nouvelle Fonctionnalité", 
    "description": "Ceci est une nouvelle fonctionnalité"
  }
}
```

**Usage**:
```javascript
const { t } = useTranslation();
return (
  <div>
    <h2>{t('mySection.newFeature')}</h2>
    <p>{t('mySection.description')}</p>
  </div>
);
```

## 🚀 Best Practices

### Theme Usage

1. **Always use theme constants** instead of hardcoded values:
   ```javascript
   // ❌ Bad
   sx={{ backgroundColor: '#899581', padding: '16px' }}
   
   // ✅ Good
   sx={{ 
     backgroundColor: THEME.colors.mainColor,
     padding: THEME.spacing.md 
   }}
   ```

2. **Use app-specific color names**:
   ```javascript
   // ❌ Bad
   color="primary"
   
   // ✅ Good
   sx={{ color: THEME.colors.mainColorTxt }}
   ```

3. **Use app-specific fonts**:
   ```javascript
   // ❌ Bad
   fontFamily: 'Arial, sans-serif'
   
   // ✅ Good
   fontFamily: THEME.typography.font1.medium
   // or
   fontFamily: THEME.typography.font2.semibold
   ```

4. **Leverage component styles** for consistency:
   ```javascript
   // ❌ Bad - reinventing styles
   sx={{
     '& .MuiOutlinedInput-root': {
       borderRadius: '8px',
       '& fieldset': { borderColor: '#E0E0E0' }
     }
   }}
   
   // ✅ Good - using predefined styles
   sx={componentStyles.searchInput}
   ```

### Color Usage Examples

```javascript
// Backgrounds
backgroundColor: THEME.colors.bgLight          // Main background
backgroundColor: THEME.colors.bgLight2         // Accent background
backgroundColor: THEME.colors.mainLight        // Light variant
backgroundColor: THEME.colors.btnNotSel        // Button not selected

// Text Colors
color: THEME.colors.mainColorTxt               // Main text color
color: THEME.colors.hintTxt                    // Hint text
color: THEME.colors.txt                        // White text

// Status Colors
backgroundColor: THEME.colors.filledGreen      // Success/Active
backgroundColor: THEME.colors.confirmGreen     // Confirmation
backgroundColor: THEME.colors.errorRed         // Error
backgroundColor: THEME.colors.mTyStatus        // Inactive/Disabled

// Appointment/Application Colors
backgroundColor: THEME.colors.apptApplied      // Applied status
backgroundColor: THEME.colors.apptOffer        // Offer status
backgroundColor: THEME.colors.noAnsYet         // No answer status
```

### Font Usage Examples

```javascript
// Headers and Titles
fontFamily: THEME.typography.font1.bold        // Bold Josefin Sans
fontFamily: THEME.typography.font1.medium      // Medium Josefin Sans

// Body Text
fontFamily: THEME.typography.font2.regular     // Regular Quicksand
fontFamily: THEME.typography.font2.medium      // Medium Quicksand

// Logo
fontFamily: THEME.typography.fonts.logo        // Romantically

// Light Text
fontFamily: THEME.typography.font1.light       // Light Josefin Sans
fontFamily: THEME.typography.font2.light       // Light Quicksand
```

### Internationalization

1. **Never hardcode text**:
   ```javascript
   // ❌ Bad
   <MDTypography>String Management</MDTypography>
   
   // ✅ Good
   <MDTypography>{t('strings.title')}</MDTypography>
   ```

2. **Use proper key organization**:
   ```javascript
   // ❌ Bad - unclear organization
   t('buttonSave')
   
   // ✅ Good - clear hierarchy
   t('common.save')
   t('strings.actions.save')
   ```

3. **Handle pluralization**:
   ```javascript
   // ✅ Good
   t('strings.export', { count: modificationCount })
   ```

## 📁 File Structure

```
src/
├── config/
│   └── theme.js                 # Centralized theme configuration
├── assets/theme/base/
│   └── colors.js                # Color definitions
├── components/
│   └── ThemeProvider.js         # Theme context provider
├── localization/
│   ├── i18n.js                  # i18n configuration
│   └── locales/
│       ├── en/
│       │   └── translation.json # English translations
│       └── fr/
│           └── translation.json # French translations
└── layouts/
    └── strings/
        └── index.js             # Example usage of theme + i18n
```

## 🔄 Migration Guide

### Converting Existing Components

1. **Replace hardcoded colors**:
   ```javascript
   // Before
   sx={{ backgroundColor: '#899581' }}
   
   // After
   import { THEME } from 'config/theme';
   sx={{ backgroundColor: THEME.colors.mainColor }}
   ```

2. **Replace hardcoded fonts**:
   ```javascript
   // Before
   sx={{ fontFamily: 'Josefin Sans, sans-serif' }}
   
   // After
   sx={{ fontFamily: THEME.typography.font1.medium }}
   ```

3. **Replace hardcoded text**:
   ```javascript
   // Before
   <MDTypography>Dashboard</MDTypography>
   
   // After
   import { useTranslation } from 'react-i18next';
   const { t } = useTranslation();
   <MDTypography>{t('common.dashboard')}</MDTypography>
   ```

4. **Use component styles**:
   ```javascript
   // Before
   <DataGrid sx={{ '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' } }} />
   
   // After
   import { componentStyles } from 'config/theme';
   <DataGrid sx={componentStyles.dataGrid} />
   ```

This centralized approach ensures:
- **Consistency** across all components using your exact color scheme
- **Easy maintenance** and updates to your brand colors
- **Proper internationalization** for all user-facing text
- **Brand compliance** with your specific PsyPsy design guidelines
- **Developer efficiency** with reusable patterns matching your app structure 