---
description: "HIPAA-compliant healthcare management system built with Tauri 2.1+, React 19, and Rust"
allowed-tools: ["Read", "Edit", "MultiEdit", "Write", "Bash(npm:*)", "Bash(yarn:*)", "Bash(pnpm:*)", "Bash(cargo:*)", "Bash(tauri:*)", "Bash(git:*)", "Bash(tsc:*)", "WebSearch", "Glob", "Grep"]
model: claude-3-5-sonnet-20241022
---

# PsyPsy CMS - Healthcare Management System

## Project Context & Overview

This is a **HIPAA-compliant healthcare management system** built for medical professionals to manage clients, appointments, and professional credentials with enterprise-grade security and compliance.

### Technology Stack (September 2025)
- **Frontend**: React 19 + TypeScript 5.3+ + Vite 5+
- **Desktop Framework**: Tauri 2.1+ (Rust backend)
- **Styling**: Tailwind CSS 3.4+ + shadcn/ui + Radix UI
- **State Management**: TanStack Query v5 + Zustand
- **Build**: Vite 5+ with advanced chunking strategy
- **Testing**: Vitest + Playwright E2E
- **Package Manager**: npm (primary) / bun (alternative)

### Critical Domain Context
- **Compliance**: HIPAA + Quebec Law 25
- **Data Classification**: PHI (Protected Health Information) handling
- **Security**: AES-256-GCM encryption, comprehensive audit trails
- **Healthcare Workflows**: 50-minute sessions, professional licensing, insurance management

## 🚨 MANDATORY DEVELOPMENT RULES

**BEFORE WRITING ANY CODE, YOU MUST FOLLOW:**

@DEVELOPMENT_RULES_2025.md

**Key Enforcement Points:**
1. ✅ **React 19**: Never use manual `memo`/`useMemo`/`useCallback` (React Compiler handles this)
2. ✅ **TanStack Query v5**: Use `isPending` (not `isLoading`), `throwOnError` (not `useErrorBoundary`)
3. ✅ **Tauri 2.1+**: Universal entry point pattern for mobile/desktop compatibility
4. ✅ **Feature-Based Architecture**: Self-contained feature modules (AR-001)
5. ✅ **HIPAA Compliance**: Enhanced error boundaries with audit logging
6. ✅ **Type Safety**: Branded types for medical IDs (TS-001)
7. ✅ **Security**: All PHI data must be explicitly marked and audited

## Project Architecture

### Feature-Based Structure (MANDATORY - Rule AR-001)
```
src/
├── features/                    # Business domain features
│   ├── authentication/         # Self-contained feature modules
│   ├── patients/              # Patient management
│   ├── appointments/          # Appointment scheduling
│   ├── medical-notes/         # Medical notes with Quebec templates
│   ├── professionals/         # Professional credential management
│   └── compliance/            # HIPAA/Quebec Law 25 compliance
├── shared/                      # Cross-feature shared code ONLY
│   ├── components/ui/         # shadcn/ui base components (DO NOT MODIFY)
│   ├── hooks/                 # Generic custom hooks
│   ├── services/              # Common API services
│   ├── utils/                 # Utility functions
│   └── types/                 # Global type definitions
├── app/                        # Application-level code
│   ├── providers/             # Context providers
│   ├── router/                # Routing configuration
│   └── store/                 # Global state management
└── assets/                     # Static assets
```

### Tauri Backend Structure
```
src-tauri/src/
├── commands/                   # Tauri command handlers (by domain)
├── services/                   # Business logic services
├── models/                     # Data models
├── security/                   # HIPAA compliance & encryption
├── plugins/                    # Custom Tauri plugins
├── lib.rs                     # Universal entry point
└── main.rs                    # Application entry point
```

## Development Workflows

### Code Style & Standards
- **ES Modules**: Use `type: "module"` syntax
- **Async/Await**: Prefer over callbacks
- **TypeScript Strict**: All new code must use strict mode
- **File Size**: Maximum 300 lines per file
- **Path Aliases**: MUST use `@/components`, `@/hooks`, etc.

### Import Order (MANDATORY)
1. External libraries (`react`, `@tauri-apps/*`)
2. Internal modules (`@/components`, `@/hooks`)
3. Local files (`./utils`)
4. Styles/assets (`@/assets`)

### Key Commands
```bash
npm run dev                    # Start Vite dev server
bun run tauri dev             # Start Tauri development (PREFERRED)
npm run tauri:dev             # Alternative Tauri development
npm run tauri:build           # Build production app
npm run test                  # Run Vitest test suite
npm run e2e                   # Run Playwright E2E tests
npm run lint                  # Check ESLint rules
npm run type-check            # TypeScript validation (MANDATORY before commits)
npm run test:coverage         # Test coverage report
```

## HIPAA Compliance Requirements

### Security Standards
- **Encryption**: AES-256-GCM for all PHI data
- **Audit Logging**: 7-year retention requirement
- **Access Control**: Role-based permissions (RBAC)
- **Data Classification**: All PHI must be explicitly marked
- **Error Handling**: Compliance-aware error boundaries

### PHI Data Handling Pattern (MANDATORY - Rule SEC-002)
```typescript
// ✅ CORRECT: PHI-aware data handling
const handlePatientData = (data: PatientData) => {
  const sanitizedData = {
    ...data,
    ssn: markAsPHI(data.ssn),
    medicalHistory: markAsPHI(data.medicalHistory),
    // Non-PHI fields remain unmarked
    name: data.name,
    id: data.id
  }

  // MANDATORY: Audit all PHI access
  auditPHIAccess('view', sanitizedData.id, getCurrentUser().id)

  return sanitizedData
}
```

## Healthcare Domain Requirements

### Business Rules
- **Sessions**: Must be 50-minute blocks
- **Professional Credentials**: Annual validation required
- **Appointments**: Conflict prevention mandatory
- **Insurance**: All information requires encryption
- **Emergency Contacts**: Mandatory field
- **Medical Notes**: Professional signature required

### Quebec Law 25 Compliance
- **Consent Management**: Explicit consent tracking
- **Data Residency**: Data must remain in Quebec/Canada
- **Breach Notification**: 72-hour reporting requirement
- **Right to Erasure**: Complete data deletion capability

## Performance & Quality Standards

### Bundle Optimization (Rule P-001)
- **Medical Core**: Separate chunk for critical features
- **Compliance**: Lazy-loaded compliance features
- **UI Components**: Cached UI component chunks
- **Charts**: Separate chunk for data visualization

### Testing Requirements
- **Coverage**: Minimum 80% for new code
- **E2E Tests**: All critical healthcare workflows
- **HIPAA Tests**: Compliance validation in test suite
- **Security Tests**: PHI handling and audit logging

### Error Handling Standards
- **Never Silent**: All errors must be logged with context
- **User-Friendly**: Provide clear error messages via toast
- **Retry Logic**: Implement for network failures
- **Validation**: Use Zod for runtime validation
- **Audit Trail**: All errors involving PHI must be audited

## Quick Reference

### Key Files & Directories
- **Main Entry**: `src/main.tsx`
- **App Root**: `src/App.tsx`
- **Tauri Config**: `src-tauri/tauri.conf.json`
- **Commands**: `src-tauri/src/commands/`
- **Types**: `src/types/index.ts`
- **Rules**: `DEVELOPMENT_RULES_2025.md`

### Migration Priorities (September 2025)
1. ✅ Update to React 19 + remove manual memoization
2. ✅ Update TanStack Query to v5 syntax (`isPending`, `throwOnError`)
3. ⏳ Implement feature-based architecture
4. ⏳ Add type-safe Tauri command wrappers
5. ⏳ Enhance HIPAA compliance error boundaries
6. ⏳ Add proper bundle splitting configuration

## Forbidden Patterns (DO NOT USE)

❌ **Manual memoization** with React Compiler enabled
❌ **TanStack Query v4 syntax** (`isLoading`, `useErrorBoundary`)
❌ **Direct PHI logging** (`console.log(patient.ssn)`)
❌ **Deep feature imports** (`.../components/internal/helper`)
❌ **Untyped Tauri commands** (raw `invoke()` without types)
❌ **Modifying shadcn/ui** components directly
❌ **Unaudited PHI access** (database queries without audit)

---

**Compliance Level**: HIPAA + Quebec Law 25
**Last Updated**: September 2025
**Tech Stack Version**: React 19 + Tauri 2.1+ + TanStack Query v5

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
