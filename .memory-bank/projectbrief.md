# PsyPsy CMS Project Brief

## Project Overview
PsyPsy CMS is an administrative content management system for a psychology platform that connects clients seeking psychological support with qualified professionals. The system serves as a control center for managing the entire platform's operations, user data, and content.

## Technical Foundation
- **Backend**: Parse Server 3.6.0 hosted on Sashido's cloud platform
- **Frontend**: React-based Single Page Application (SPA) with Material UI
- **State Management**: Redux or Context API
- **Routing**: React Router
- **Authentication**: Parse Server authentication with JWT, role-based access control

## Core Objectives
1. Provide comprehensive administrative tools for platform management
2. Enable monitoring and supervision of the appointment matching process
3. Offer analytics and reporting on platform usage and performance
4. Facilitate content management for static and dynamic platform content
5. Ensure secure access with appropriate permission levels

## Development Phases
1. **Phase 1**: Core Administration (Authentication, user management, basic dashboard)
2. **Phase 2**: Operational Tools (Appointment monitoring, professional verification)
3. **Phase 3**: Advanced Features (Analytics, content management, alerting)
4. **Phase 4**: Optimization (Performance, UX refinements, additional integrations)

## Security Requirements
- Admin-specific roles in Parse Server
- JWT-based authentication with short expiration
- IP restriction or 2FA for sensitive operations
- Comprehensive audit logging
- Secure handling of master key operations

## Critical Success Factors
- Intuitive interface for administrative operations
- Efficient data querying patterns for large datasets
- Responsive design for various admin devices
- Robust error handling and logging
- Scalable architecture as user base grows 