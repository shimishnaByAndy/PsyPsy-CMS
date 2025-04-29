# Darkone UI Reference

This directory contains components, layouts, and utilities from the Darkone UI template. It is intended **ONLY as a reference** for implementing your own components.

## Important Usage Notes

⚠️ **DO NOT IMPORT COMPONENTS DIRECTLY FROM THIS DIRECTORY**

The Darkone components are not meant to be used directly in your application. Instead:

1. Use these components as reference/inspiration
2. Create your own components based on the patterns and designs
3. Implement them in your own project structure

## Directory Structure

- `components/` - UI components (buttons, cards, forms, etc.)
- `context/` - React context providers (theme, layout, etc.)
- `hooks/` - Custom React hooks
- `utils/` - Helper functions and utilities

## Example Usage Pattern

**❌ INCORRECT:**
```jsx
// DON'T DO THIS
import { DarkoneFooter } from 'src/darkone';

function MyComponent() {
  return <DarkoneFooter />;
}
```

**✅ CORRECT:**
```jsx
// DO THIS - Create your own components inspired by Darkone
import React from 'react';

// After studying Darkone's Footer component
function MyFooter() {
  return (
    <footer className="my-footer">
      {/* Your implementation */}
    </footer>
  );
}

export default MyFooter;
```

## Theme Context

The `context/ThemeContext.jsx` provides a good example of how to implement theme switching in your application. Study this implementation to create your own theme context provider.

## Constants

Constants defined in `context/constants.js` can be referenced when implementing your own theming system. 