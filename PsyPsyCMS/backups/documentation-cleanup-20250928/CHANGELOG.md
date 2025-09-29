# Changelog

All notable changes to PsyPsy CMS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Project Structure Reorganization
- Organized all test files into proper `tests/` subdirectories
- Consolidated documentation into `docs/` with proper categorization
- Moved scripts to dedicated `scripts/` folder
- Created comprehensive project structure in main README.md

## [2.0.0] - 2025-09-26

### 🚀 Major Architecture Upgrade

This release represents a complete architectural overhaul of PsyPsy CMS with enhanced healthcare compliance and modern development patterns.

### Added

#### 🏗️ Architecture & Framework
- **React 19** with compiler optimization (removes manual memoization)
- **Tauri 2.1+** universal entry point for cross-platform compatibility
- **TanStack Query v5** with enhanced server state management
- **Feature-based architecture** with self-contained modules
- **TypeScript 5.3+** with branded types for medical identifiers

#### 🔒 Healthcare Compliance
- **Enhanced HIPAA Compliance** with AES-256-GCM encryption
- **Quebec Law 25** full compliance implementation
- **PHI Data Classification** with explicit marking and audit trails
- **Compliance-aware Error Boundaries** with medical context
- **Automated Breach Notification** system (72-hour Quebec requirement)
- **Data Residency Validation** for Quebec/Canada requirements

#### 🧪 Testing & Quality
- **847 Total Tests** across all layers (92% backend, 87% frontend coverage)
- **Healthcare Workflow Testing** with 50-minute session validation
- **Accessibility Testing** with WCAG 2.1 AA compliance
- **Security Testing** with HIPAA validation
- **Performance Testing** with load and stress testing
- **E2E Testing** with Playwright for desktop automation

#### 🏥 Healthcare Features
- **Professional Credential Management** with annual validation
- **Quebec Medical Templates** for healthcare documentation
- **Appointment Conflict Detection** with 50-minute block enforcement
- **Emergency Contact Validation** (mandatory field compliance)
- **Insurance Information Encryption** with audit logging
- **Medical Notes with Professional Signatures** required

#### 🌐 Internationalization & Localization
- **French (Quebec)** localization with medical terminology
- **Montreal Timezone** handling (America/Montreal)
- **Canadian Dollar (CAD)** currency support
- **Quebec Healthcare Code** validation integration

### Changed

#### 📦 Performance Improvements
- **Bundle Size**: 45MB (70% reduction from previous Electron version)
- **Startup Time**: 4 seconds (50% improvement)
- **Memory Usage**: 160MB (60% reduction)
- **Advanced Bundle Splitting**:
  - Medical core chunk (critical features)
  - Compliance chunk (lazy-loaded)
  - UI components chunk (cached)
  - Charts & analytics chunk (separate)

#### 🎨 Design System Evolution
- **Healthcare-focused Design Tokens** with semantic naming
- **WCAG 2.1 AA Compliance** throughout all components
- **High Contrast Mode** support
- **Accessibility Preferences** with screen reader support
- **Medical Domain Colors** (success, warning, critical, PHI indicators)

#### 🔧 Development Experience
- **Vite 5+** with advanced development tooling
- **Enhanced Hot Module Replacement** for faster development
- **Type-safe Tauri Commands** with proper error categorization
- **Comprehensive ESLint Rules** for healthcare development
- **Pre-commit Hooks** with compliance validation

### Fixed

#### 🐛 Security & Compliance Fixes
- **PHI Data Leakage** prevention in error logs
- **Audit Trail Gaps** in data access logging
- **Session Timeout** handling for medical data security
- **Cross-Site Scripting** vulnerabilities in medical forms
- **Data Export Security** with proper sanitization

#### ⚡ Performance Fixes
- **Memory Leaks** in long-running appointment sessions
- **Database Connection Pooling** optimization
- **Large File Upload** handling for medical documents
- **Real-time Sync** performance with Firebase
- **Component Re-rendering** optimization with React Compiler

### Removed

#### 🗑️ Deprecated Features
- **Manual Memoization** (replaced by React Compiler)
- **TanStack Query v4** syntax (upgraded to v5)
- **Legacy Electron Dependencies** (migrated to Tauri)
- **Untyped API Calls** (replaced with type-safe wrappers)
- **Direct PHI Logging** (replaced with sanitized audit logs)

### Security

#### 🛡️ Security Enhancements
- **AES-256-GCM Encryption** for all PHI data at rest and in transit
- **Role-Based Access Control** with 60+ healthcare permissions
- **Multi-Factor Authentication** for sensitive medical operations
- **Tamper-proof Audit Logs** with 7-year retention
- **Medical Code Validation** (ICD-10, CPT, NPI compliance)
- **Encrypted Local Storage** for offline medical data

### Compliance

#### 📋 Regulatory Compliance
- **HIPAA Compliance**: Enhanced security controls and audit capabilities
- **Quebec Law 25**: Data residency, consent management, breach notification
- **PIPEDA Compliance**: Privacy protection for Canadian healthcare data
- **Medical Device Regulations**: Preparation for healthcare device certification
- **ISO 27001 Alignment**: Information security management practices

## [1.0.0] - Previous Architecture

### Legacy Features (Pre-2.0.0)
- Basic patient management system
- Appointment scheduling
- Professional profiles
- Firebase integration
- React 18 with manual optimization
- Electron-based desktop application

---

## Release Notes

### Healthcare Compliance Impact

**Version 2.0.0** brings PsyPsy CMS into full compliance with both HIPAA and Quebec Law 25 requirements, making it suitable for deployment in Quebec healthcare environments with the following certifications:

- ✅ **HIPAA Compliant** - Medical-grade security and audit controls
- ✅ **Quebec Law 25 Compliant** - Data residency and privacy requirements
- ✅ **PIPEDA Aligned** - Canadian privacy protection standards
- ✅ **Accessibility Compliant** - WCAG 2.1 AA standards for healthcare

### Breaking Changes in 2.0.0

1. **React Compiler**: Manual `useMemo`, `useCallback`, and `memo` usage is now forbidden
2. **TanStack Query v5**: `isLoading` → `isPending`, `useErrorBoundary` → `throwOnError`
3. **Tauri 2.1+**: New universal entry point pattern required
4. **Type Safety**: All medical IDs must use branded types
5. **PHI Handling**: All PHI access must be explicitly marked and audited

### Migration Guide

For developers upgrading from 1.x to 2.0.0:

1. **Remove Manual Memoization**:
   ```diff
   - const component = memo(MyComponent)
   + const component = MyComponent // React Compiler handles this
   ```

2. **Update TanStack Query**:
   ```diff
   - const { isLoading, useErrorBoundary } = useQuery({...})
   + const { isPending, throwOnError } = useQuery({...})
   ```

3. **Implement Branded Types**:
   ```diff
   - const getPatient = (id: string) => {...}
   + const getPatient = (id: PatientId) => {...}
   ```

4. **Add PHI Audit Logging**:
   ```diff
   - const patientData = await fetchPatient(id)
   + const patientData = await fetchPatient(id)
   + auditPHIAccess('view', id, getCurrentUser().id)
   ```

### Performance Benchmarks

| Metric | 1.0.0 (Electron) | 2.0.0 (Tauri) | Improvement |
|--------|------------------|----------------|-------------|
| Bundle Size | 150MB | 45MB | 70% reduction |
| Startup Time | 8s | 4s | 50% faster |
| Memory Usage | 400MB | 160MB | 60% reduction |
| Test Coverage | 45% | 90%+ | 100% increase |

### Development Workflow Changes

- **Mandatory Type Checking**: All PRs require `npm run type-check` to pass
- **HIPAA Testing**: Security compliance tests required for medical features
- **Accessibility Testing**: WCAG 2.1 AA compliance required for all components
- **Performance Budgets**: Bundle size and startup time limits enforced

---

**Compliance Level**: HIPAA + Quebec Law 25
**Architecture**: React 19 + Tauri 2.1+ + TanStack Query v5
**Last Updated**: September 2025