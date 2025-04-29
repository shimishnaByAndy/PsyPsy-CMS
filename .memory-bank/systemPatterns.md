# System Patterns

## Authentication & Authorization

### Parse Authentication
The application uses Parse Server authentication with JWT tokens. The AuthGuard component (`src/components/AuthGuard.js`) protects routes requiring authentication.

Key patterns:
- Protected routes are wrapped with the `ProtectedRoute` component
- `AuthGuard` checks authentication status using `ParseAuth.isAuthenticated()`
- Unauthenticated users are redirected to the login page
- Loading states are managed during authentication checks

## Routing Structure

The application uses a centralized routing configuration in `src/routes.js` with separation between protected and public routes:

```jsx
// Define which routes should be protected and which should be public
const protectedRoutes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <ProtectedRoute component={<Dashboard />} />,
  },
  // Other protected routes...
];

// Public routes - accessible without authentication
const publicRoutes = [
  {
    type: "collapse",
    name: "Login",
    key: "login",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/login",
    component: <Login />,
  },
  // Other public routes...
];

// Combine all routes
const routes = [...protectedRoutes, ...publicRoutes];
```

This pattern enables:
- Automatic navigation generation
- Consistent protection of restricted routes
- Clear separation between public and private areas

## Theming System

The application uses a context-based theming system with three primary customization options:
- Theme mode (light/dark)
- Theme skin (default/bordered/glass)
- Layout type (vertical/horizontal)

Implementation components:
- `ThemeContext` (`src/darkone/context/ThemeContext.jsx`) - Context provider
- `ThemeProvider` - Manages theme state and localStorage persistence
- Constants defined in `src/darkone/context/constants.js`

## Darkone UI Reference Implementation

The project includes a Darkone UI template located in `src/darkone/` directory. This is a **reference implementation only** and must never be directly imported into the application code. 

### Key Points:
- Darkone components should be used as reference/inspiration only
- Always create your own components based on Darkone patterns
- Direct imports from `src/darkone` are prohibited and will cause build errors
- A cursor rule has been established in `.cursor/rules/standards/darkone-usage.md`

### Reference Resources:
- `src/darkone/README.md` - Contains detailed usage guidance
- `src/darkone/context/ThemeContext.jsx` - Example of theme context implementation
- `src/darkone/context/constants.js` - Theme constants reference

### Implementation Guidelines:
1. Study the Darkone component implementation
2. Create your own component with similar functionality
3. Follow project conventions for the new component
4. Reference the Darkone implementation in comments if helpful

### Example of Correct Pattern:
```jsx
// After studying src/darkone/components/Spinner.jsx
// Created our own implementation following project patterns
import React from 'react';

function AppSpinner() {
  return (
    <div className="spinner-container">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

export default AppSpinner;
```

## Data Fetching Pattern

Data from the Parse Server is fetched using the Parse JavaScript SDK following these patterns:

```javascript
// Class query pattern
const query = new Parse.Query('ClassName');
query.equalTo('field', value);
query.include('relatedField');
const results = await query.find();

// Object fetching pattern
const object = await new Parse.Object('ClassName').get(objectId);

// Creating objects pattern
const newObject = new Parse.Object('ClassName');
newObject.set('field', value);
await newObject.save();
```

When displaying Parse data in components:
- Always handle loading states with skeleton loaders or spinners
- Implement proper error handling with user-friendly messages
- Use try/catch blocks for all asynchronous Parse operations
- Consider implementing query pagination for large datasets

## Layout Components

The application uses a consistent layout structure:
- Sidebar navigation (`Sidenav` component)
- Top navigation bar with authentication status
- Main content area with route-specific components
- Footer with application information

Layouts are composed in the `layouts` directory with specific implementations for various sections of the application. 