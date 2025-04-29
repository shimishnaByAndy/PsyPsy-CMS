# Technical Context

## Frontend Architecture
- **Framework**: React.js with functional components and hooks
- **UI Library**: Material Dashboard 2 React (based on MUI v5)
- **State Management**: React Context API and useState/useEffect hooks
- **Routing**: React Router v6 for navigation and route protection
- **Styling**: 
  - Material UI styling system with sx prop
  - Custom component styles defined in separate files
  - Theme customization via provider

## Component Architecture
- **Layout Components**:
  - DashboardLayout: Main layout wrapper with sidebar and navbar
  - PageLayout: Simpler layout for authentication and landing pages
- **Core Components**:
  - MDBox: Extended Box component with theme awareness
  - MDTypography: Typography with theme integration
  - MDInput: Customized input fields
  - MDButton: Styled button components
- **Navigation Components**:
  - DashboardNavbar: Top navigation with user menu
  - Sidenav: Side navigation with collapsible menu
  - Breadcrumbs: Path navigation
- **Data Display**:
  - DataTable: For displaying tabular data with sorting and pagination
  - Cards: Various card components for dashboard widgets

## Backend Integration
- **Parse Server**: 
  - Authentication and user management
  - Data storage and retrieval
  - Cloud functions for business logic
- **API Structure**:
  - RESTful endpoints
  - Parse SDK for React integration
  - Service files for API communication

## Internationalization
- **i18next**: Translation framework
- **Language Switching**: Dynamic language change support
- **Translation Files**: JSON-based language resources

## Theming & Styling
- **Theme Provider**: Context-based theme switching
- **Dark/Light Modes**: Complete theme switching
- **Color System**: Based on Material Design color system
- **Responsive Design**: Mobile-first approach with breakpoints

## Build & Deployment
- **Package Manager**: npm
- **Build System**: Create React App (not ejected)
- **Deployment Target**: Web hosting with optional Electron desktop app

## Code Conventions
- **Component Structure**:
  - Functional components with hooks
  - Props validation with PropTypes
  - Default props defined
- **File Organization**:
  - Feature-based structure
  - Shared components in components/ directory
  - Layouts in examples/ directory (legacy naming)
  - Views/pages in layouts/ directory (legacy naming)
- **Naming Conventions**:
  - PascalCase for components
  - camelCase for functions and variables
  - Component files named index.js within their directory
  - Style files paired with components

## Technical Debt & Constraints
- Some legacy naming conventions from the Material Dashboard template
- Need for improved error handling and loading states
- Opportunity for better code splitting and performance optimizations

## Current Implementation Focus
- User management with filtering by user type
- Navbar and UI component refinements
- Table data display and filtering functionality 