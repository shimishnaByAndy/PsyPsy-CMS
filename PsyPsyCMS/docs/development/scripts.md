# PsyPsy CMS Scripts Documentation
**Last Updated**: September 29, 2025  
**Audience**: Developers, DevOps Engineers  
**Prerequisites**: Node.js 18+, npm knowledge  
**Categories**: Development, Scripts, Automation  
**Topics**: Build Scripts, Testing, Development Environment, Automation  

## Overview

This document provides comprehensive documentation for all scripts available in the PsyPsy CMS project, including build scripts, test runners, environment management, and development utilities.

## Table of Contents

- [Package.json Scripts](#packagejson-scripts)
- [Custom Scripts](#custom-scripts)
- [Development Workflow](#development-workflow)
- [Environment Management](#environment-management)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)

## Package.json Scripts

### Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `vite` | Start Vite development server |
| `npm run tauri:dev` | `tauri dev` | Start Tauri development mode with hot reload |
| `npm run debug:tauri` | `tauri dev --debug` | Start Tauri with debug mode enabled |
| `npm run debug:webview` | `tauri dev --debug --port 1420` | Debug webview on specific port |

### Build Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run build` | `vite build` | Build frontend for production |
| `npm run build:check` | `tsc && vite build` | Type check then build |
| `npm run build:prod` | `npm run type-check && npm run lint && vite build` | Full production build with validation |
| `npm run tauri:build` | `npm run build:prod && tauri build` | Build complete Tauri application |
| `npm run tauri:build:debug` | `npm run build:check && tauri build --debug` | Build debug version |

### Testing Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm test` | `vitest` | Run unit tests with Vitest |
| `npm run test:ui` | `vitest --ui` | Run tests with UI interface |
| `npm run test:coverage` | `vitest --coverage` | Generate test coverage report |
| `npm run test:accessibility` | `vitest --run tests/accessibility/` | Run accessibility tests |
| `npm run test:a11y` | `npm run test:accessibility` | Alias for accessibility tests |
| `npm run test:all` | `npm run test:coverage && npm run e2e && npm run test:accessibility` | Run all test suites |
| `npm run e2e` | `playwright test` | Run end-to-end tests with Playwright |
| `npm run e2e:accessibility` | `playwright test tests/e2e/accessibility/` | Run E2E accessibility tests |

### Quality Assurance Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run lint` | `eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0` | Lint TypeScript files |
| `npm run lint:fix` | `eslint src --ext ts,tsx --fix` | Auto-fix linting issues |
| `npm run type-check` | `tsc --noEmit` | Type check without compilation |
| `npm run quality` | `npm run type-check && npm run lint && npm run test:coverage` | Complete quality check |

### Environment Management Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run switch:dev` | `node scripts/switch-environment.js dev` | Switch to development environment |
| `npm run switch:prod` | `node scripts/switch-environment.js prod` | Switch to production environment |
| `npm run switch:status` | `node scripts/switch-environment.js status` | Show current environment status |
| `npm run setup:dev` | `npm run switch:dev && npm run test:firebase` | Complete development setup |
| `npm run setup:prod` | `npm run switch:prod` | Setup production environment |

### Utility Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run preview` | `vite preview` | Preview production build locally |
| `npm run test:firebase` | `node scripts/test-firebase-connection.js` | Test Firebase emulator connection |

## Custom Scripts

### Automated Test Runner (`scripts/automated-test-runner.js`)

**Purpose**: Comprehensive automated testing across all system categories

**Usage**:
```bash
node scripts/automated-test-runner.js
```

**Features**:
- **System Architecture Tests**: Build validation, dependency analysis, security audits
- **Compliance Tests**: HIPAA, Quebec Law 25, healthcare standards
- **Security Tests**: Authentication, Firestore rules, PHI protection
- **UI/Accessibility Tests**: Component testing, WCAG compliance
- **Data Management Tests**: Medical notes, API functionality, performance
- **Integration Tests**: Client-professional workflows, meeting systems
- **Error Handling Tests**: Resilience, error boundaries, recovery

**Output**:
- JSON report: `test-results/automated-test-report.json`
- Human-readable report: `test-results/automated-test-report.md`

**Categories Tested**:
1. Core System Architecture
2. Healthcare Compliance
3. Security & Authentication
4. User Interface & Accessibility
5. Data Management & Performance
6. Integration & API
7. Error Handling & Resilience

### Environment Switcher (`scripts/switch-environment.js`)

**Purpose**: Seamlessly switch between development and production environments

**Usage**:
```bash
# Switch to development (emulators)
npm run switch:dev

# Switch to production
npm run switch:prod

# Check current status
npm run switch:status
```

**Environments**:

#### Development Environment
- **Firebase Emulators**: Local Firebase services
- **Endpoints**:
  - Functions: `http://127.0.0.1:8780/psypsy-dev-local/us-east4`
  - Emulator UI: `http://127.0.0.1:8782`
  - Auth: `http://127.0.0.1:9880`
  - Firestore: `http://127.0.0.1:9881`

#### Production Environment
- **Live Firebase**: Production Firebase services
- **Requires**: Valid Firebase project configuration
- **Security**: Enhanced validation for production switches

**Features**:
- Automatic `.env` file management
- Environment validation
- Backup creation before switching
- Health checks after switching

### Firebase Connection Tester (`scripts/test-firebase-connection.js`)

**Purpose**: Validate Firebase emulator connectivity and service availability

**Usage**:
```bash
npm run test:firebase
```

**Tests**:
- Emulator UI accessibility
- Auth emulator status
- Functions emulator connectivity
- Firestore emulator availability
- Service health checks

**Output**: Detailed connectivity report with recommendations

### Load Seed Data (`scripts/load-seed-data.js`)

**Purpose**: Load test data into Firebase emulators for development

**Usage**:
```bash
node scripts/load-seed-data.js
```

**Data Loaded**:
- Test user accounts (professionals, clients, admins)
- Sample healthcare data (appointments, notes)
- Quebec-compliant test data
- Accessibility test cases

### Design Token Exporter (`scripts/export-design-tokens.js`)

**Purpose**: Export design tokens from design system for documentation

**Usage**:
```bash
node scripts/export-design-tokens.js
```

**Exports**:
- Color palette (healthcare-compliant colors)
- Typography scales
- Spacing system
- Component tokens
- Accessibility tokens

## Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Setup development environment
npm run setup:dev

# Verify Firebase connection
npm run test:firebase
```

### 2. Daily Development
```bash
# Start development server
npm run tauri:dev

# Run tests (in separate terminal)
npm run test:ui

# Check code quality
npm run quality
```

### 3. Before Commit
```bash
# Full quality check
npm run quality

# Run comprehensive tests
npm run test:all

# Automated test suite
node scripts/automated-test-runner.js
```

### 4. Production Build
```bash
# Switch to production environment
npm run switch:prod

# Build for production
npm run tauri:build

# Switch back to development
npm run switch:dev
```

## Environment Management

### Environment Variables

#### Development (`.env`)
```bash
VITE_USE_FIREBASE_EMULATOR=true
FIREBASE_USE_EMULATOR=true
VITE_FIREBASE_PROJECT_ID=psypsy-dev-local
```

#### Production (`.env`)
```bash
VITE_USE_FIREBASE_EMULATOR=false
FIREBASE_USE_EMULATOR=false
VITE_FIREBASE_PROJECT_ID=your-production-project-id
```

### Switching Environments

**Best Practices**:
1. Always check status before switching: `npm run switch:status`
2. Backup important work before switching environments
3. Verify connection after switching: `npm run test:firebase`
4. Use development environment for all regular development
5. Only use production for final testing and deployment

## Testing & Quality Assurance

### Test Types

#### Unit Tests (Vitest)
```bash
npm test                    # Run all unit tests
npm run test:coverage      # With coverage report
npm run test:ui            # Interactive UI
```

#### Integration Tests
```bash
npm run e2e                # End-to-end tests
npm run test:accessibility # Accessibility tests
```

#### Comprehensive Testing
```bash
node scripts/automated-test-runner.js
```

### Quality Metrics

**Target Coverage**:
- **Frontend**: 85%+ test coverage
- **Backend**: 90%+ test coverage
- **E2E**: Critical user flows covered
- **Accessibility**: WCAG 2.1 AA compliance

**Quality Gates**:
- Zero TypeScript errors
- Zero ESLint warnings
- All tests passing
- No security vulnerabilities

## Build & Deployment

### Build Types

#### Development Build
```bash
npm run build:check        # Type check + build
```

#### Production Build
```bash
npm run build:prod         # Full validation + build
npm run tauri:build        # Complete Tauri app
```

### Build Outputs

- **Frontend**: `dist/` directory
- **Tauri App**: `src-tauri/target/release/` (platform-specific)
- **Test Reports**: `test-results/` directory
- **Coverage**: `coverage/` directory

### Deployment Checklist

1. ✅ Switch to production environment
2. ✅ Run comprehensive test suite
3. ✅ Verify all quality gates pass
4. ✅ Build production application
5. ✅ Test production build locally
6. ✅ Deploy to target platforms
7. ✅ Verify deployment health
8. ✅ Switch back to development

## Troubleshooting

### Common Issues

#### Firebase Emulator Issues
```bash
# Check emulator status
npm run test:firebase

# Restart emulators
firebase emulators:start

# Clear emulator data
firebase emulators:exec --only=firestore "node -e 'console.log(\"cleared\")'"
```

#### Build Issues
```bash
# Clear build cache
rm -rf dist/
rm -rf node_modules/
npm install

# Clear Tauri cache
cd src-tauri
cargo clean
```

#### Test Issues
```bash
# Clear test cache
npm test -- --clear-cache

# Run tests in isolation
npm test -- --no-coverage --run
```

#### Environment Issues
```bash
# Reset environment
npm run switch:status
npm run switch:dev
npm run test:firebase
```

### Getting Help

1. **Check Environment Status**: `npm run switch:status`
2. **Run Diagnostics**: `node scripts/automated-test-runner.js`
3. **Review Logs**: Check console output for specific error messages
4. **Verify Dependencies**: `npm audit` and `npm outdated`
5. **Check Documentation**: Review related docs in `docs/` directory

### Performance Optimization

#### Script Performance
- Use `npm run test:coverage` instead of full test suite during development
- Prefer `npm run build:check` over `npm run build:prod` for quick validation
- Use `npm run debug:tauri` for Tauri-specific debugging

#### Development Performance
- Keep Firebase emulators running in the background
- Use `npm run test:ui` for interactive testing
- Leverage Vite's hot reload for rapid iteration

---

## Related Documentation

- [Architecture Guide](architecture.md) - System design and technical architecture
- [Firebase Setup](../setup/setup-firebase-emulator.md) - Firebase emulator configuration
- [Testing Strategy](../testing/TESTING_STRATEGY.md) - Comprehensive testing approach
- [Compliance Overview](../compliance/overview.md) - Healthcare compliance requirements

---

*For additional script-related questions, check the `scripts/` directory for inline documentation within each script file.*