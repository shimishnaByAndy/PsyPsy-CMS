# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PsyPsy CMS is an Electron-based desktop application built with React and Material-UI, serving as an administrative content management system for a psychology platform. The system connects clients with qualified professionals and provides comprehensive platform management tools.

**Technical Stack:**
- **Frontend**: React 18, Material-UI v5, Material Dashboard 2 React template
- **Desktop**: Electron 36.0.0 with custom preload scripts
- **Backend**: Parse Server 3.6.0 (hosted on Sashido cloud platform)
- **State Management**: React Context API with Material-UI controller
- **Charts**: Chart.js, ApexCharts, React ApexCharts
- **Internationalization**: i18next with browser language detection
- **Styling**: Material-UI theme system with custom PsyPsy theming

## Common Development Commands

### Development Workflow
```bash
# Start development server (React only)
npm start

# Start Electron app in development mode
npm run electron:dev

# Alternative Electron dev command with wait-on
npm run electron:dev-alt

# Restart Electron only (React server must be running)
npm run electron:restart
```

### Build & Package
```bash
# Build React app for production
npm run build

# Build Electron app
npm run electron:build

# Package for all platforms (Mac, Windows, Linux)
npm run package
```

### Testing & Utilities
```bash
# Run React tests
npm test

# Create admin user (Parse Server utility)
npm run create-admin

# Sync internationalization strings
npm run sync-i18n
```

### Development Ports
- React dev server: `http://localhost:3022`
- Parse Server: `http://localhost:1337/parse` (development)

## Application Architecture

### Core Structure
```
src/
├── components/          # Reusable UI components (MDBox, MDButton, etc.)
├── context/            # Material-UI controller and global state
├── examples/           # Template components (Sidenav, Navbar, etc.)
├── layouts/            # Page layouts (dashboard, authentication, etc.)
├── routes/             # React Router configuration
├── services/           # Parse Server integration and data services
├── localization/       # i18n configuration and translations
├── assets/             # Images, themes, fonts
└── utils/              # Utility functions
```

### Key Components

**Material Dashboard Components** (prefix: MD):
- `MDBox`: Styled Box component with theme integration
- `MDButton`: Themed button with multiple variants
- `MDInput`: Styled input with validation support
- `MDTypography`: Typography with theme consistency
- `MDAlert`, `MDBadge`, `MDProgress`: UI feedback components

**Layout System**:
- `DashboardLayout`: Main admin interface with sidebar navigation
- `AuthLayout`: Authentication pages (login, lock screen)
- `Sidenav`: Collapsible sidebar with route navigation
- `DashboardNavbar`: Top navigation with user controls

**Data Components**:
- `ClientsDataGrid`: Client management with MUI DataGrid
- `ProfessionalsDataGrid`: Professional management interface
- `AppointmentsDataGrid`: Appointment scheduling system
- `StringsDataGrid`: Internationalization string management

### Route Structure
```
/dashboard              # Main dashboard with statistics
/clients               # Client management
/professionals         # Professional management  
/appointments          # Appointment scheduling
/strings               # i18n string management
/settings              # Application settings
/authentication/login  # Login page
/authentication/lock   # Lock screen
```

### Parse Server Integration

**Configuration**: `src/config/parseConfig.js`
- Development: `localhost:1337/parse`
- Production: Environment variable based
- Authentication: JWT with role-based access control

**Service Pattern**: `src/services/`
- `parseService.js`: Base Parse operations
- `clientService.js`: Client-specific operations
- `professionalService.js`: Professional management
- `appointmentService.js`: Appointment handling
- `dashboardService.js`: Dashboard statistics

**Authentication Flow**:
- `ParseInitializer`: Initialize Parse SDK on app start
- `AuthGuard`: Protect routes requiring authentication
- `ProtectedRoute`: Wrapper component for authenticated routes
- `AuthenticatedRedirect`: Handle login redirects

### Theme System

**Multi-Theme Architecture**:
- `GlobalThemeProvider`: Main theme provider with dark/light mode
- `PsyPsyThemeProvider`: Custom PsyPsy-specific theming
- Material-UI theme customization in `src/assets/theme/`
- Custom color scheme: Primary green `#899581`

**Theme Configuration**:
- Light/dark mode switching
- Custom Material-UI component overrides
- PsyPsy brand colors and typography
- Responsive breakpoints and spacing

### Internationalization

**Setup**: `src/localization/i18n.js`
- Supported languages: English (en), French (fr)
- Browser language detection
- Translation files: `src/localization/locales/`
- String management interface at `/strings`

## Development Patterns

### Component Creation
```javascript
// Use Material Dashboard patterns
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Follow the existing component structure
const NewComponent = ({ title, children }) => {
  return (
    <MDBox p={3}>
      <MDTypography variant="h6">{title}</MDTypography>
      {children}
    </MDBox>
  );
};
```

### Parse Server Operations
```javascript
// Use service pattern
import { clientService } from "services/clientService";

// Async/await with error handling
const fetchClients = async () => {
  try {
    const clients = await clientService.getAll();
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};
```

### Route Protection
```javascript
// Protect sensitive routes
import ProtectedRoute from "routes/ProtectedRoute";

const route = {
  path: "/sensitive-page",
  component: <ProtectedRoute component={<SensitivePage />} />
};
```

### Context Usage
```javascript
// Material-UI controller for global state
import { useMaterialUIController, setMiniSidenav } from "context";

const [controller, dispatch] = useMaterialUIController();
const { miniSidenav, darkMode } = controller;
```

## Data Models

### Core Parse Server Classes
- `_User`: Parse authentication users
- `Client`: Client profiles with user reference
- `Professional`: Professional profiles with credentials
- `Appointment`: Appointment scheduling and status
- `TimeSlotOffer`: Professional availability slots

### Relationships
- One-to-one: `_User` ↔ `Client`/`Professional`
- Many-to-many: `Client` ↔ `Professional` via `Appointment`
- One-to-many: `Professional` → `TimeSlotOffer`

## Security Considerations

- Master Key operations through Cloud Functions only
- Role-based access control in Parse Server
- JWT authentication with session management
- Input validation on both client and server
- Secure environment variable handling
- No sensitive keys in client-side code

## Development Best Practices

### Code Organization
- Follow Material Dashboard component patterns
- Use service layer for Parse Server operations
- Implement proper error handling with user feedback
- Maintain consistent naming conventions (MD prefix for components)
- Use TypeScript-style JSDoc comments for better IDE support

### Performance
- Use React.memo() for expensive renders
- Implement pagination for large datasets
- Leverage Parse Server query optimization
- Use Material-UI's sx prop for styling performance
- Minimize re-renders with proper dependency arrays

### Error Handling
- Graceful Parse Server error handling
- User-friendly error messages
- Console logging for development debugging
- Fallback UI states for loading/error conditions
- Session expiry handling with auto-logout

## Electron-Specific

**Main Process**: `electron/main.js`
- Window management and application lifecycle
- Security settings and CSP configuration
- Development vs production environment handling

**Build Configuration**:
- App ID: `com.psypsy.cms`
- Multi-platform builds (macOS, Windows, Linux)
- Asset bundling in `assets/` directory
- Auto-updater configuration ready

## Testing

- React Testing Library setup via `react-scripts test`
- Component testing patterns follow Material-UI guidelines
- Parse Server operations should be mocked in tests
- E2E testing considerations for Electron application

## Deployment

### Development
- React dev server on port 3022
- Hot reloading enabled
- Source maps for debugging
- Development Parse Server configuration

### Production
- Optimized React build
- Electron packaging for distribution
- Environment-based Parse Server configuration
- Asset optimization and minification