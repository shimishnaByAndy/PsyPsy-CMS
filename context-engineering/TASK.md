# TASK.md - PsyPsy CMS Tauri Migration

## 🎯 Current Sprint: Phase 0 - Preparation & Setup (Weeks 1-2)

### Week 1: Environment Setup
- [ ] **Install Rust toolchain and Tauri CLI** - 2025-09-12
  - Install rustup and configure Rust environment
  - Install tauri-cli: `cargo install tauri-cli`
  - Verify installation with `cargo tauri --version`

- [ ] **Create new Tauri project structure** - 2025-09-12
  - Run `cargo tauri init` in new project directory
  - Configure project metadata and bundle identifier
  - Set up src-tauri directory structure

- [ ] **Configure Vite + React + TypeScript** - 2025-09-12
  - Set up Vite build system with React template
  - Configure TypeScript with strict mode
  - Set up path aliases for clean imports (@/ mapping)

- [ ] **Set up shadcn/ui component system** - 2025-09-12
  - Run `npx shadcn@latest init`
  - Configure components.json for PsyPsy theme
  - Install initial components (Button, Input, Card, Table)

- [ ] **Configure Tailwind CSS with PsyPsy theme** - 2025-09-12
  - Set up Tailwind config with custom PsyPsy colors (#899581)
  - Configure CSS variables for light/dark theme
  - Create custom component variants

- [ ] **Set up comprehensive testing frameworks** - 2025-09-12
  - Configure Vitest for frontend unit tests
  - Set up Playwright for E2E testing
  - Configure Rust test framework with cargo test
  - Set up test database and mocking utilities

### Week 2: Core Infrastructure Foundation
- [ ] **Implement basic Tauri commands structure** - 2025-09-12
  - Create commands module structure (auth, clients, professionals, appointments)
  - Implement basic CRUD command templates
  - Set up command error handling and response types

- [ ] **Set up Parse Server HTTP client in Rust** - 2025-09-12
  - Configure reqwest HTTP client with Parse Server endpoints
  - Implement authentication header management
  - Create Parse Server service with basic CRUD operations

- [ ] **Configure TanStack Query with offline persistence** - 2025-09-12
  - Set up React Query client with offline configuration
  - Configure query persistence with localStorage
  - Implement query key factory pattern

- [ ] **Create shared TypeScript type definitions** - 2025-09-12
  - Define core data models (User, Client, Professional, Appointment)
  - Set up shared types between Rust and TypeScript
  - Configure type generation from Rust to TypeScript

- [ ] **Set up SQLite database with migrations** - 2025-09-12
  - Configure sqlx with SQLite support
  - Create initial database schema
  - Set up migration system and seed data

- [ ] **Implement basic authentication flow** - 2025-09-12
  - Create login/logout Tauri commands
  - Implement session management with Parse Server
  - Set up protected route system in React

## 🔄 Upcoming Phases

### Phase 1: Core Infrastructure (Weeks 3-6) - Planned
- Data layer implementation with comprehensive Parse Server integration
- Firebase backend integration and push notification setup
- Foundation UI components migration from Material-UI to shadcn/ui
- Complete offline-first architecture with background sync

### Phase 2: Feature Migration (Weeks 7-12) - Planned  
- Client management system migration
- Professional management system migration
- **Smart calendar implementation with AI-powered scheduling**
- **Push notification reminders system**
- Main dashboard with real-time insights

### Phase 3: Advanced Features & Polish (Weeks 13-16) - Planned
- **Smart notes tab with rich text editor and AI suggestions**
- **Voice-to-text note taking functionality**
- Charts and analytics migration with smart insights
- Internationalization system migration to react-i18next
- System settings and user preference management

### Phase 4: Testing, Optimization & Deployment (Weeks 17-20) - Planned
- Comprehensive testing suite completion including Firebase integration
- Performance optimization and security audit
- Push notification testing and calendar functionality validation
- Production deployment and user migration

## ✅ Completed Tasks
*No tasks completed yet - project starting 2025-09-12*

## 🔍 Discovered During Work
*Tasks discovered during development will be added here*

## 📋 Notes & Reminders
- **Always use deepwiki MCP for repository questions** - Ask one question at a time about specific git repositories
- **Use kit MCP for repository structure analysis** - When need to explore file structure or search for patterns
- **Follow 500-line file limit** - Refactor into modules if approaching limit  
- **Maintain test coverage >90%** - Write tests for all new functionality
- **Update README.md** - Keep documentation current with new features and setup changes

## 🎯 Success Criteria for Phase 0
- [ ] Complete development environment setup verified
- [ ] Basic Tauri commands working end-to-end  
- [ ] TanStack Query configured with offline support
- [ ] shadcn/ui components rendering correctly
- [ ] Authentication flow functional with Parse Server
- [ ] Test framework setup and first tests passing
- [ ] CI/CD pipeline configured and running

*Last updated: 2025-09-12*