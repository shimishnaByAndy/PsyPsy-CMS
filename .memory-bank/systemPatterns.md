# System Patterns

## Architectural Patterns

### Component-Based Architecture
The PsyPsy CMS uses a component-based architecture where the UI is broken down into reusable, independent components. This promotes:
- **Reusability**: Components can be reused throughout the application
- **Maintainability**: Changes to one component don't affect others
- **Testability**: Components can be tested in isolation
- **Separation of concerns**: Each component has a specific responsibility

### Context-Based State Management
Rather than using Redux or other external state management libraries, the application uses React's Context API for state management:
- **Theme Context**: Manages application theme (dark/light mode)
- **Auth Context**: Handles authentication state
- **UI Controller Context**: Manages UI state like sidebar visibility
- **Internationalization Context**: Manages language selection

### Service Pattern
Backend communication is abstracted through service modules:
- **ParseService**: Handles Parse Server API interactions
- **AuthService**: Manages authentication flows
- **DataService**: Handles data fetching and mutation

## Component Patterns

### Material Components Extension
The application extends Material UI components with custom styling and behavior:
- **MD Components**: Enhanced MUI components with consistent styling
- **Consistent Props API**: Common props interface across components
- **Theme Integration**: Components automatically adapt to theme changes

### Layout Composition
Layouts are composed through nested components:
- **DashboardLayout**: Main application layout with navigation
- **Card-Based Content**: Content organized in card components
- **Grid System**: Responsive grid for layout organization

### Container/Presentation Pattern
Many components follow the container/presentation pattern:
- **Container Components**: Handle logic and data fetching
- **Presentation Components**: Focus on rendering UI
- **Props Drilling**: Used for passing data down the component tree

## UI Patterns

### Responsive Design
The application uses responsive design patterns:
- **Mobile-First Approach**: Layouts designed for mobile then expanded
- **Breakpoint System**: MUI breakpoints for responsive behavior
- **Flexible Layouts**: Adapts to different screen sizes

### Navigation Patterns
Navigation follows established patterns:
- **Sidebar Navigation**: Primary navigation in collapsible sidebar
- **Top Bar Actions**: User-specific actions in top navigation
- **Breadcrumbs**: Show navigation hierarchy

### Data Display Patterns
Consistent patterns for displaying data:
- **Data Tables**: For tabular data with sorting and pagination
- **Cards**: For summary information and metrics
- **Status Indicators**: Visual indicators for status (online/offline)
- **Progress Bars**: Visual representation of completion

## Code Patterns

### Functional Components with Hooks
All React components use the functional component pattern with hooks:
- **useState**: For component-local state
- **useEffect**: For side effects and lifecycle management
- **useContext**: For consuming context-based state
- **Custom Hooks**: For reusable logic

### Prop Validation
Components use PropTypes for prop validation:
- **Required Props**: Clearly marked required props
- **Type Checking**: Specific type definitions
- **Default Props**: Sensible defaults provided

### Naming Conventions
Consistent naming conventions throughout the codebase:
- **PascalCase**: For component names
- **camelCase**: For variables, functions, and props
- **index.js**: Main component file in its directory
- **styles.js**: Style definitions for components

## Data Flow Patterns

### Unidirectional Data Flow
The application follows React's unidirectional data flow:
- **Props Down**: Data passed down from parent to child
- **Events Up**: Child components trigger events handled by parents
- **Context for Global State**: Global state managed through context

### API Data Management
Pattern for handling API data:
- **Loading States**: Explicit handling of loading states
- **Error Handling**: Centralized error handling
- **Data Caching**: Minimizing redundant API calls

## Anti-Patterns to Avoid

### Direct DOM Manipulation
- Avoid using direct DOM manipulation
- Use React refs when DOM access is necessary

### Prop Drilling Beyond 3 Levels
- When props need to be passed through more than 3 levels, consider context
- Keep component hierarchy shallow when possible

### Large Monolithic Components
- Break down components larger than 300 lines
- Separate logical concerns into multiple components

### Inconsistent Styling
- Avoid mixing styling approaches (sx props vs. styled components)
- Use the established styling pattern for consistency 