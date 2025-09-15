# PsyPsy CMS - Tauri Desktop Application

## Project Overview
HIPAA-compliant healthcare management system built with Tauri 2.0, React 18, and Rust for medical professionals to manage clients, appointments, and professional credentials.

## Technology Stack
- Language: TypeScript 5.3
- Framework: React 18 + Tauri 2.0
- Styling: Tailwind CSS 3.4 + Radix UI
- State: Zustand + TanStack Query
- Package Manager: npm/bun
- Runtime: Node.js 18+, Rust 1.70+
- Build Tool: Vite 5

## Project Structure
```
PsyPsyCMS/
├── src/                 # React frontend source
│   ├── components/      # UI components (Radix UI + shadcn)
│   ├── pages/           # Route pages
│   ├── services/        # API services (Tauri IPC)
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React context providers
│   ├── types/           # TypeScript definitions
│   ├── localization/    # i18n translations (en/fr)
│   └── lib/             # Utility functions
├── src-tauri/           # Rust backend (Tauri)
│   ├── src/             # Rust source code
│   └── tauri.conf.json  # Tauri configuration
├── tests/               # Test suites
│   ├── e2e/             # Playwright E2E tests
│   ├── security/        # HIPAA compliance tests
│   └── performance/     # Load testing
└── public/              # Static assets
```

## Development Standards

### Code Style
- IMPORTANT: Use ES modules syntax (type: "module")
- Prefer async/await over callbacks
- Use TypeScript strict mode for all new code
- Maximum file size: 300 lines
- YOU MUST use path aliases (@/components, @/hooks, etc.)

### Naming Conventions
- Files: kebab-case (user-profile.tsx)
- Components: PascalCase (UserProfile.tsx)
- Variables: camelCase (userProfile)
- Constants: UPPER_SNAKE_CASE (MAX_RETRIES)
- Types/Interfaces: PascalCase with prefix (IUser, TStatus)

### Import Order
1. External libraries (react, tauri-apps)
2. Internal modules (@/components, @/hooks)
3. Local files (./utils)
4. Styles/assets (@/assets)

## Key Commands
- `npm run dev`: Start Vite dev server
- `npm run tauri:dev`: Start Tauri development
- `npm run tauri:build`: Build production app
- `npm run test`: Run Vitest test suite
- `npm run e2e`: Run Playwright E2E tests
- `npm run lint`: Check ESLint rules
- `npm run type-check`: TypeScript validation
- `npm run test:coverage`: Test coverage report

## Testing Requirements
- Framework: Vitest + Playwright
- Coverage: Minimum 80% for new code
- YOU MUST run type-check before committing
- YOU MUST test Tauri IPC communications
- Prefer unit tests over integration tests
- Test HIPAA compliance features thoroughly

## Workflow Guidelines
- ALWAYS run type-check after code changes
- Read relevant files before writing code
- Create a plan before implementing features
- Commit messages: type(scope): description
- Test both frontend and Tauri backend
- Validate i18n translations (en/fr)

## Error Handling
- Never silently catch errors
- Log errors with full context to Tauri logs
- Provide user-friendly error messages via toast
- YOU MUST handle all async Tauri operations
- Implement retry logic for network failures
- Use zod for runtime validation

## Performance Considerations
- Lazy load heavy components (React.lazy)
- Optimize bundle size (<500KB initial)
- Cache Tauri IPC responses with TanStack Query
- Use React.memo for expensive renders
- Profile Rust backend performance
- Virtualize large lists (appointments, clients)

## Security Guidelines
- Never commit secrets or API keys
- Validate all user inputs with zod schemas
- Use Tauri's secure IPC for sensitive operations
- YOU MUST encrypt sensitive data (AES-256-GCM)
- Implement RBAC with proper permissions
- Maintain HIPAA compliance audit logs (7 years)
- Sanitize all database queries

## Documentation Standards
- Document complex business logic inline
- Update README for API changes
- Use JSDoc for public APIs
- Include examples in documentation
- Document Tauri commands thoroughly

## Component Patterns
- Use shadcn/ui components as base
- Implement compound components pattern
- Use React Hook Form for forms
- Leverage Radix UI for accessibility
- YOU MUST maintain WCAG 2.1 AA compliance

## State Management
- Zustand for global state (auth, theme)
- TanStack Query for server state
- React Hook Form for form state
- Local state for UI-only concerns
- YOU MUST invalidate queries after mutations

## Tauri Integration
- Commands in src-tauri/src/commands/
- Use #[tauri::command] for IPC
- Implement proper error handling in Rust
- YOU MUST validate inputs in both frontend and backend
- Use Tauri events for real-time updates

## HIPAA Compliance
- Encrypt all PHI data at rest and in transit
- Implement access controls and user authentication
- Maintain comprehensive audit logs
- Ensure data backup and recovery procedures
- YOU MUST test security features regularly
- Regular vulnerability assessments required

## Known Issues & Gotchas
- Tauri 2.0 migration may have breaking changes
- React Query devtools only in development
- Bun compatibility issues with some deps
- HIPAA audit logs require 7-year retention
- French translations need validation

## Domain-Specific Requirements
- Client sessions must be 50-minute blocks
- Professional credentials require annual validation
- Appointment conflicts must be prevented
- Insurance information requires encryption
- Emergency contacts are mandatory
- Session notes require professional signature

## Quick Reference
- Main entry: src/main.tsx
- App root: src/App.tsx
- Tauri config: src-tauri/tauri.conf.json
- API commands: src-tauri/src/commands/
- Types: src/types/index.ts
- Auth context: src/context/AuthProvider.tsx
- Theme: tailwind.config.js