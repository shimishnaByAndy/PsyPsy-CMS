# Technical Context

## Technology Stack

### Backend
- **Parse Server 3.6.0**: Core backend framework handling data storage, authentication, and business logic
- **Sashido Cloud Hosting**: Cloud platform hosting the Parse Server instance
- **Cloud Functions**: JavaScript functions running server-side for complex operations
- **Parse Dashboard**: Admin interface for direct database manipulation (separate from CMS)

### Frontend
- **React**: UI library for building the component-based interface
- **Material UI**: React component library implementing Material Design
- **React Router**: Handles routing within the SPA
- **Redux/Context API**: State management solutions

### Authentication
- **Parse Authentication**: Built-in user management with session tokens
- **JWT**: JSON Web Tokens for frontend-backend communication
- **Role-Based Access Control**: Permission system based on user roles

### External Services
- **APNs**: Apple Push Notification service for iOS notifications
- **FCM**: Firebase Cloud Messaging for Android notifications

## Data Architecture

### Core Parse Classes
- **_User**: Standard Parse authentication class with customizations
- **Client**: Profiles for service seekers (linked to _User)
- **Professional**: Profiles for psychology professionals (linked to _User)
- **Appointment**: Records of service requests and matches
- **TimeSlotOffer**: Proposed appointment times from professionals

### Data Security
- **ACLs**: Object-level access control lists
- **CLPs**: Class-level permissions
- **Master Key**: Used only for specific administrative operations

## Integration Points

### Mobile Applications
- iOS and Android apps consume the same Parse Server backend
- Push notifications for appointment updates

### Third-Party Services
- Payment processing (if applicable)
- Email delivery for notifications
- SMS services for critical alerts

## Environment Configuration
- Development, staging, and production environments
- Environment-specific variables and settings
- Separation of concerns between mobile backend and admin CMS

## Technical Constraints
- Parse Server version compatibility requirements
- Parse JavaScript SDK limitations
- Master key usage constraints for security
- Query performance considerations for large datasets 