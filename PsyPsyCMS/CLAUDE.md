---
description: "HIPAA-compliant healthcare management system built with Tauri 2.1+, React 19, and Rust"
allowed-tools: ["Read", "Edit", "MultiEdit", "Write", "Bash(npm:*)", "Bash(yarn:*)", "Bash(pnpm:*)", "Bash(cargo:*)", "Bash(tauri:*)", "Bash(git:*)", "Bash(tsc:*)", "WebSearch", "Glob", "Grep"]
model: claude-3-5-sonnet-20241022
---

# PsyPsy CMS - Healthcare Management System


## Serena MCP Integration

For detailed guidance on using Serena MCP tools with this project, see the project-specific usage guide:
- **[Serena MCP Usage Guide](docs/serena-mcp-usage.md)** - Project-specific tool usage and workflows

### Quick Reference
The Serena MCP server provides semantic code analysis and editing capabilities optimized for this project:
- **Code Analysis**: `get_symbols_overview`, `find_symbol`, `find_referencing_symbols`
- **Code Editing**: `replace_symbol_body`, `insert_after_symbol`, `insert_before_symbol`
- **Project Management**: `activate_project`, memory tools, file operations

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

## Firebase MCP Integration Rules

### Firebase Emulator Development Environment

**Current PsyPsy Emulator Configuration:**
```
┌────────────────┬────────────────┬──────────────────────────────────┐
│ Emulator       │ Host:Port      │ View in Emulator UI              │
├────────────────┼────────────────┼──────────────────────────────────┤
│ Authentication │ 127.0.0.1:9880 │ http://127.0.0.1:8782/auth       │
├────────────────┼────────────────┼──────────────────────────────────┤
│ Functions      │ 127.0.0.1:8780 │ http://127.0.0.1:8782/functions  │
├────────────────┼────────────────┼──────────────────────────────────┤
│ Firestore      │ 127.0.0.1:9881 │ http://127.0.0.1:8782/firestore  │
├────────────────┼────────────────┼──────────────────────────────────┤
│ Database       │ 127.0.0.1:9882 │ http://127.0.0.1:8782/database   │
├────────────────┼────────────────┼──────────────────────────────────┤
│ Hosting        │ 127.0.0.1:8781 │ n/a                              │
└────────────────┴────────────────┴──────────────────────────────────┘
```

**Emulator UI:** http://127.0.0.1:8782/

### Firebase MCP Usage Patterns (MANDATORY)

#### **FMCP-001: Always Use Emulator Flag in Development**
```javascript
// ✅ CORRECT: Always use use_emulator: true in development
await firestore_get_documents({
  paths: ["patients/patient-123", "appointments/appt-456"],
  use_emulator: true,
  database: "(default)"
});

// ❌ FORBIDDEN: Never omit emulator flag in development
await firestore_get_documents({
  paths: ["patients/patient-123"],
  // Missing use_emulator: true - will hit production!
});
```

#### **FMCP-002: PHI Data Testing Patterns**
```javascript
// ✅ CORRECT: Healthcare data queries with emulator
await firestore_query_collection({
  collection_path: "patients",
  filters: [{
    field: "emergencyContact.phone",
    op: "NOT_EQUAL",
    compare_value: { string_value: "" }
  }],
  use_emulator: true,
  limit: 10
});

// Test appointment scheduling (50-minute blocks)
await firestore_query_collection({
  collection_path: "appointments",
  filters: [{
    field: "duration",
    op: "EQUAL",
    compare_value: { integer_value: 50 }
  }, {
    field: "status",
    op: "IN",
    compare_value: {
      string_array_value: ["scheduled", "confirmed", "in-progress"]
    }
  }],
  use_emulator: true,
  order: {
    orderBy: "dateTime",
    orderByDirection: "ASCENDING"
  }
});
```

#### **FMCP-003: RBAC and Authentication Testing**
```javascript
// ✅ CORRECT: Test user roles for Quebec healthcare compliance
await auth_set_claim({
  uid: "prof-123",
  claim: "userType",
  value: 1  // PROFESSIONAL type
});

await auth_set_claim({
  uid: "client-456",
  claim: "userType",
  value: 2  // CLIENT type
});

// Test Quebec Law 25 consent tracking
await auth_set_claim({
  uid: "client-456",
  claim: "consentStatus",
  value: "explicit_consent_given"
});

await auth_set_claim({
  uid: "client-456",
  claim: "dataResidency",
  value: "quebec_canada"
});
```

#### **FMCP-004: Compliance Audit Testing**
```javascript
// ✅ CORRECT: Test audit trails for PIPEDA compliance
await firestore_query_collection({
  collection_path: "audit_logs",
  filters: [{
    field: "dataType",
    op: "EQUAL",
    compare_value: { string_value: "PHI" }
  }, {
    field: "action",
    op: "IN",
    compare_value: {
      string_array_value: ["read", "write", "delete", "export"]
    }
  }, {
    field: "timestamp",
    op: "GREATER_THAN",
    compare_value: { string_value: "2025-01-01T00:00:00Z" }
  }],
  use_emulator: true,
  order: {
    orderBy: "timestamp",
    orderByDirection: "DESCENDING"
  },
  limit: 100
});

// Test Law 25 breach notification requirements (72-hour rule)
await firestore_query_collection({
  collection_path: "security_incidents",
  filters: [{
    field: "severity",
    op: "GREATER_THAN_OR_EQUAL",
    compare_value: { string_value: "high" }
  }, {
    field: "notificationStatus",
    op: "EQUAL",
    compare_value: { string_value: "pending" }
  }],
  use_emulator: true
});
```

#### **FMCP-005: Real-time Database for Live Updates**
```javascript
// ✅ CORRECT: Test appointment availability in real-time
await database_get_data({
  path: "/availability/prof-123/2025-01-20",
  databaseUrl: "http://localhost:9882/psypsy-dev-local-default-rtdb"
});

// Test conflict prevention for double-booking
await database_set_data({
  path: "/appointments/live-updates/appt-456",
  data: JSON.stringify({
    status: "booking_in_progress",
    timestamp: new Date().toISOString(),
    professionalId: "prof-123",
    clientId: "client-456",
    lockExpiry: new Date(Date.now() + 300000).toISOString() // 5-minute lock
  }),
  databaseUrl: "http://localhost:9882/psypsy-dev-local-default-rtdb"
});
```

#### **FMCP-006: Professional Credential Validation**
```javascript
// ✅ CORRECT: Test professional licensing and specialization
await firestore_query_collection({
  collection_path: "professionals",
  filters: [{
    field: "licenseStatus",
    op: "EQUAL",
    compare_value: { string_value: "active" }
  }, {
    field: "specialization",
    op: "IN",
    compare_value: {
      string_array_value: [
        "Clinical Psychology",
        "Counseling Psychology",
        "Psychiatry",
        "Social Work"
      ]
    }
  }, {
    field: "jurisdiction",
    op: "EQUAL",
    compare_value: { string_value: "Quebec" }
  }],
  use_emulator: true
});

// Test credential expiry tracking
await firestore_query_collection({
  collection_path: "professional_credentials",
  filters: [{
    field: "expiryDate",
    op: "LESS_THAN",
    compare_value: {
      string_value: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    }
  }],
  use_emulator: true,
  order: {
    orderBy: "expiryDate",
    orderByDirection: "ASCENDING"
  }
});
```

### Firebase MCP Environment Setup

#### **Required Environment Variables**
```bash
# Automatically set when emulators are running
FIRESTORE_EMULATOR_HOST=localhost:9881
FIREBASE_DATABASE_EMULATOR_HOST=localhost:9882
FIREBASE_AUTH_EMULATOR_HOST=localhost:9880
FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:8780
FIREBASE_EMULATOR_HUB=localhost:4400
```

#### **Pre-Development Checklist**
1. ✅ Start emulators: `firebase emulators:start --import=./seed-data`
2. ✅ Verify connectivity: Test each emulator endpoint
3. ✅ Load seed data: Import typical PsyPsy scenarios
4. ✅ Set project directory: Use `firebase_update_environment`

### Development Workflow Integration

#### **Daily Development Loop**
```bash
# 1. Start emulators with data persistence
firebase emulators:start --import=./seed-data --export-on-exit=./seed-data

# 2. Use Firebase MCP tools for testing
# Always include use_emulator: true for development

# 3. Export data for reproducible testing
firebase emulators:export ./test-scenarios/$(date +%Y%m%d)
```

#### **Testing Healthcare Scenarios**
```javascript
// Test complete patient registration flow
async function testPatientRegistrationFlow() {
  // 1. Create patient with mandatory emergency contact
  await firestore_get_documents({
    paths: ["patients/new-patient-123"],
    use_emulator: true
  });

  // 2. Verify PHI encryption and audit logging
  await firestore_query_collection({
    collection_path: "audit_logs",
    filters: [{
      field: "resourceId",
      op: "EQUAL",
      compare_value: { string_value: "patients/new-patient-123" }
    }, {
      field: "action",
      op: "EQUAL",
      compare_value: { string_value: "create" }
    }],
    use_emulator: true,
    limit: 1
  });

  // 3. Test appointment scheduling (50-minute blocks)
  await firestore_query_collection({
    collection_path: "appointments",
    filters: [{
      field: "clientId",
      op: "EQUAL",
      compare_value: { string_value: "new-patient-123" }
    }],
    use_emulator: true
  });
}
```

### Security and Compliance Testing

#### **PIPEDA/Law 25 Validation Patterns**
```javascript
// Test data residency compliance
await firestore_query_collection({
  collection_path: "data_residency_logs",
  filters: [{
    field: "region",
    op: "EQUAL",
    compare_value: { string_value: "quebec-canada" }
  }, {
    field: "dataType",
    op: "EQUAL",
    compare_value: { string_value: "PHI" }
  }],
  use_emulator: true
});

// Test consent management and renewal
await firestore_query_collection({
  collection_path: "consent_records",
  filters: [{
    field: "consentType",
    op: "EQUAL",
    compare_value: { string_value: "explicit_consent" }
  }, {
    field: "expiryDate",
    op: "GREATER_THAN",
    compare_value: { string_value: new Date().toISOString() }
  }],
  use_emulator: true
});
```

### Forbidden Patterns (NEVER DO THESE)

❌ **Omitting emulator flag in development**
❌ **Testing with production Firebase project during development**
❌ **Hardcoding emulator ports (use environment variables)**
❌ **Bypassing audit logging in test scenarios**
❌ **Testing without proper RBAC role assignment**
❌ **Creating test data without PHI encryption simulation**

---

**Firebase MCP Compliance Level**: PIPEDA + Quebec Law 25
**Last Updated**: September 2025
**Emulator Environment**: PsyPsy Development Suite

## Task Master AI MCP Integration Rules

### Task Master AI Development Workflow (MANDATORY)

**Task Master AI** provides comprehensive task management for PsyPsy CMS development with AI-powered task generation, expansion, and progress tracking.

#### **TMCP-001: Essential Task Master AI Commands**

```bash
# Core Project Management
task-master init                                    # Initialize Task Master in project
task-master parse-prd .taskmaster/docs/prd.txt      # Generate tasks from PRD
task-master models --setup                        # Configure AI models

# Daily Development Workflow
task-master list                                   # Show all tasks with status
task-master next                                   # Get next available task
task-master show <id>                             # View task details (e.g., task-master show 1.2)
task-master set-status --id=<id> --status=done    # Mark task complete

# Task Management
task-master add-task --prompt="description" --research        # Add new task with AI
task-master expand --id=<id> --research --force              # Break into subtasks
task-master update-task --id=<id> --prompt="changes"         # Update specific task
task-master update-subtask --id=<id> --prompt="notes"        # Add implementation notes
```

#### **TMCP-002: MCP Tool Usage Patterns**

```javascript
// ✅ CORRECT: Use MCP tools for task management
await mcp__task_master_ai__get_tasks({
  projectRoot: "/absolute/path/to/project",
  status: "pending",
  withSubtasks: true
});

// Get next task for development
await mcp__task_master_ai__next_task({
  projectRoot: "/absolute/path/to/project"
});

// Update task with progress notes
await mcp__task_master_ai__update_subtask({
  projectRoot: "/absolute/path/to/project",
  id: "1.2",
  prompt: "Implemented authentication middleware with JWT validation. Added unit tests for login/logout flows."
});

// Mark task complete
await mcp__task_master_ai__set_task_status({
  projectRoot: "/absolute/path/to/project",
  id: "1.2",
  status: "done"
});
```

#### **TMCP-003: Healthcare Development Integration**

```javascript
// ✅ CORRECT: Healthcare-specific task management
await mcp__task_master_ai__add_task({
  projectRoot: "/absolute/path/to/project",
  prompt: "Implement PIPEDA consent tracking for patient data access with 72-hour breach notification system",
  research: true
});

// Expand healthcare compliance tasks
await mcp__task_master_ai__expand_task({
  projectRoot: "/absolute/path/to/project",
  id: "5",
  research: true,
  prompt: "Focus on Quebec Law 25 specific requirements for healthcare data processing"
});

// Track PHI implementation progress
await mcp__task_master_ai__update_task({
  projectRoot: "/absolute/path/to/project",
  id: "3",
  prompt: "Added AES-256-GCM encryption for all PHI fields. Implemented audit logging for data access. Need to add automatic consent renewal workflows."
});
```

#### **TMCP-004: Research-Backed Task Generation**

```javascript
// ✅ CORRECT: Use research for complex healthcare tasks
await mcp__task_master_ai__research({
  projectRoot: "/absolute/path/to/project",
  query: "Quebec Law 25 specific requirements for healthcare management systems and PIPEDA compliance integration",
  saveTo: "5.2", // Save research to specific subtask
  detailLevel: "high"
});

// Analyze task complexity for healthcare features
await mcp__task_master_ai__analyze_project_complexity({
  projectRoot: "/absolute/path/to/project",
  research: true,
  threshold: 7 // High complexity threshold for medical features
});
```

#### **TMCP-005: Task Hierarchy and Dependencies**

```javascript
// ✅ CORRECT: Manage healthcare development dependencies
await mcp__task_master_ai__add_dependency({
  projectRoot: "/absolute/path/to/project",
  id: "5", // Patient management
  dependsOn: "2" // Database encryption must be completed first
});

// Move tasks between development phases
await mcp__task_master_ai__move_task({
  projectRoot: "/absolute/path/to/project",
  from: "8",
  to: "3", // Move compliance task earlier in priority
  withDependencies: true
});
```

### Task Master AI Environment Configuration

#### **Required API Keys for PsyPsy Development**
```bash
# .env configuration (configure with your own keys)
PERPLEXITY_API_KEY=your_perplexity_key_here
# Optional: Add additional providers for redundancy
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
```

#### **Model Configuration for Healthcare Development**
```bash
# Configure AI models for healthcare-specific tasks
task-master models --set-main claude-3-5-sonnet-20241022
task-master models --set-research sonar-pro  # Perplexity for research
task-master models --set-fallback gpt-4o-mini
```

### PsyPsy-Specific Task Management Patterns

#### **Healthcare Task Categories**
```javascript
// Security and Compliance Tasks
await mcp__task_master_ai__add_task({
  prompt: "Implement Quebec healthcare data residency requirements with Canadian cloud infrastructure",
  priority: "high",
  dependencies: "1,2" // Database and auth dependencies
});

// Professional Credential Management
await mcp__task_master_ai__add_task({
  prompt: "Build professional license tracking with annual renewal reminders for Quebec medical professionals",
  research: true
});

// Patient Privacy and Consent
await mcp__task_master_ai__add_task({
  prompt: "Create Law 25 compliant consent management with explicit consent tracking and renewal workflows"
});
```

#### **Development Workflow Integration**

```bash
# Start development session
task-master next                           # Get next task
task-master show 3.1                      # Review subtask details

# During implementation
task-master update-subtask --id=3.1 --prompt="Added Firebase Auth integration. Testing RBAC permissions."

# Complete and move to next
task-master set-status --id=3.1 --status=done
task-master next                           # Get next available task
```

#### **Task Master AI File Structure**

```
.taskmaster/
├── tasks/
│   ├── tasks.json              # Main task database
│   ├── task-1.md              # Individual task files
│   ├── task-2.md
│   └── ...
├── docs/
│   ├── prd.txt                # Product requirements document
│   └── research/              # Research outputs
├── reports/
│   └── task-complexity-report.json
├── config.json                # AI model configuration
└── CLAUDE.md                  # Task Master integration guide
```

### Development Best Practices

#### **TMCP-006: Healthcare Task Documentation**

```javascript
// ✅ CORRECT: Document healthcare implementation details
await mcp__task_master_ai__update_subtask({
  projectRoot: "/absolute/path/to/project",
  id: "4.3",
  prompt: `
  Implemented patient appointment scheduling with 50-minute blocks:
  - Added conflict detection to prevent double-booking
  - Integrated Quebec timezone handling (America/Montreal)
  - Created audit logs for all appointment modifications
  - Added emergency contact validation (mandatory field)
  - Next: Implement appointment reminder system with SMS/push notifications
  `
});
```

#### **TMCP-007: Compliance Progress Tracking**

```javascript
// Track PIPEDA compliance implementation
await mcp__task_master_ai__plan({
  projectRoot: "/absolute/path/to/project",
  id: "6",
  research: true // Use research for up-to-date compliance requirements
});

// Generate compliance-focused expansion
await mcp__task_master_ai__expand_task({
  projectRoot: "/absolute/path/to/project",
  id: "6",
  num: "8", // More detailed subtasks for compliance
  research: true,
  prompt: "Focus on Montreal healthcare regulations and Quebec Law 25 requirements"
});
```

### Integration with Firebase MCP Tools

#### **TMCP-008: Combined Workflow Pattern**

```javascript
// 1. Use Task Master AI to plan
const nextTask = await mcp__task_master_ai__next_task({
  projectRoot: "/absolute/path/to/project"
});

// 2. Implement using Firebase MCP tools
await firestore_query_collection({
  collection_path: "patients",
  filters: [{ field: "status", op: "EQUAL", compare_value: { string_value: "active" }}],
  use_emulator: true
});

// 3. Update task progress
await mcp__task_master_ai__update_subtask({
  projectRoot: "/absolute/path/to/project",
  id: nextTask.id,
  prompt: "Tested patient query functionality with Firebase emulator. All active patients retrieved successfully."
});

// 4. Mark complete and get next
await mcp__task_master_ai__set_task_status({
  projectRoot: "/absolute/path/to/project",
  id: nextTask.id,
  status: "done"
});
```

### Task Master AI Compliance Tracking

#### **PIPEDA/Law 25 Task Templates**

```javascript
// Quebec-specific compliance tasks
const complianceTasks = [
  "Implement explicit consent collection and tracking",
  "Add 72-hour breach notification automation",
  "Create data portability export functionality",
  "Build right-to-deletion workflows",
  "Add Quebec data residency validation",
  "Implement privacy impact assessment automation"
];

// Generate tasks for each compliance requirement
for (const taskPrompt of complianceTasks) {
  await mcp__task_master_ai__add_task({
    projectRoot: "/absolute/path/to/project",
    prompt: taskPrompt,
    research: true,
    priority: "high"
  });
}
```

### Forbidden Task Master AI Patterns

❌ **Using relative paths** (always use absolute projectRoot paths)
❌ **Skipping research flag** for complex healthcare tasks
❌ **Not updating subtask progress** during implementation
❌ **Creating tasks without proper dependencies**
❌ **Marking tasks complete** without proper validation
❌ **Ignoring task complexity analysis** for medical features

---

**Task Master AI Integration Level**: Healthcare Development Optimized
**Research Capability**: Perplexity-powered for up-to-date compliance
**Last Updated**: September 2025

## Project Organization Rules (MANDATORY)

### **ORG-001: File Organization Standards**

**CRITICAL**: All agents MUST maintain the organized project structure:

```
PsyPsyCMS/
├── 📂 tests/                        # ALL test files organized by type
│   ├── 📂 e2e/                      # End-to-end tests
│   │   ├── 📂 healthcare/           # Healthcare workflow tests
│   │   └── 📂 accessibility/        # Accessibility E2E tests
│   ├── 📂 integration/              # Integration tests (.cjs, .js files)
│   ├── 📂 security/                 # Security & HIPAA tests
│   ├── 📂 performance/              # Performance & load tests
│   └── 📂 utilities/                # Test utilities & HTML test files
│       └── 📂 html/                 # HTML-based test utilities
├── 📂 docs/                         # ALL documentation centralized
│   ├── 📂 testing/                  # Testing strategies & guides
│   ├── 📂 compliance/               # HIPAA & Quebec Law 25 docs
│   ├── 📂 setup/                    # Setup & configuration guides
│   ├── 📂 security/                 # Security documentation
│   └── 📂 design-system/            # Design system documentation
├── 📂 scripts/                      # Build & utility scripts ONLY
└── 📋 ROOT FILES (Keep minimal)
    ├── README.md                    # SINGLE comprehensive project overview
    ├── CLAUDE.md                    # Agent instructions
    ├── DEVELOPMENT_RULES_2025.md    # Development patterns
    └── Configuration files only
```

### **ORG-002: Documentation Hierarchy Rules**

**MANDATORY**: Keep only ONE main documentation file at the root:

✅ **ALLOWED at root:**
- `README.md` - Complete project overview and structure
- `CLAUDE.md` - Agent instructions (this file)
- `DEVELOPMENT_RULES_2025.md` - Development patterns
- `CHANGELOG.md` - Version history

❌ **FORBIDDEN at root:**
- Test files (*.test.*, test-*, autonomous-*)
- Implementation docs (move to `docs/`)
- Setup guides (move to `docs/setup/`)
- Compliance reports (move to `docs/compliance/`)
- Strategy documents (move to `docs/testing/` or appropriate folder)

### **ORG-003: Test File Naming Conventions**

**MANDATORY**: Follow these naming patterns:

```
tests/
├── integration/
│   ├── auth-connection.test.cjs
│   ├── firebase-connection.test.cjs
│   ├── professionals-api.test.js
│   └── client-professional.test.cjs
├── e2e/healthcare/
│   ├── medical-notes.test.cjs
│   └── quebec-healthcare.test.cjs
└── utilities/
    ├── error-injection.test.js
    └── html/
        ├── test-error-patterns.html
        └── validate-error-categorization.html
```

### **ORG-004: Agent Responsibilities**

**CRITICAL**: Every agent MUST:

1. **✅ Before adding ANY file to root:**
   - Check if it belongs in `docs/`, `tests/`, or `scripts/`
   - Use the appropriate subfolder structure

2. **✅ When creating test files:**
   - Place in correct `tests/` subfolder
   - Use proper naming conventions
   - Update test documentation if needed

3. **✅ When adding documentation:**
   - Place in `docs/` with appropriate subfolder
   - Reference from main `README.md` if needed
   - Keep root minimal and organized

4. **✅ When creating scripts:**
   - Place in `scripts/` folder
   - Update `package.json` scripts if needed

### **ORG-005: Change Tracking Requirements**

**MANDATORY**: All significant changes MUST:

1. **Update CHANGELOG.md** with:
   - Version number
   - Change category (Added, Changed, Fixed, Removed)
   - Healthcare compliance impact
   - Breaking changes notation

2. **Update README.md** if:
   - New major features added
   - Architecture changes
   - New dependencies or requirements

3. **Maintain file organization**:
   - No loose files in root
   - Proper categorization in subfolders
   - Clear naming conventions

### **ORG-006: Documentation Cross-References**

**REQUIRED**: Maintain these links in `README.md`:

- Link to all major documentation in `docs/`
- Reference HIPAA compliance docs
- Point to testing strategies
- Include setup guides
- Reference design system docs

### **ORG-007: Cleanup Responsibilities**

**AGENTS MUST**: When finding disorganized files:

1. **Immediate action**:
   - Move files to proper folders
   - Update references if needed
   - Clean up broken links

2. **Report to user**:
   - What was reorganized
   - Why the change was needed
   - Impact on project structure

### **ORG-008: Version Control Integration**

**REQUIRED**: Changes that affect:

- Project structure → Update README.md
- Test organization → Update testing docs
- Documentation → Update cross-references
- Scripts → Update package.json references

**ENFORCEMENT**: Any agent that creates files outside the organized structure will be considered non-compliant with healthcare development standards.

**COMPLIANCE LEVEL**: Healthcare Organization Standards
**Enforcement**: Automatic for all AI agents
**Review**: Monthly organizational audit
