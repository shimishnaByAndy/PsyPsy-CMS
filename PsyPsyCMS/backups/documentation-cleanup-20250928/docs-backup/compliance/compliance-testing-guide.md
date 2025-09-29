# PIPEDA and Quebec Law 25 Compliance Testing Guide

## Overview

This guide provides comprehensive instructions for testing PIPEDA (Personal Information Protection and Electronic Documents Act) and Quebec Law 25 compliance in the PsyPsy CMS healthcare management system using Firebase MCP tools.

## Compliance Frameworks Covered

- **PIPEDA**: Personal Information Protection and Electronic Documents Act (Canada)
- **Quebec Law 25**: An Act to modernize legislative provisions as regards the protection of personal information
- **Healthcare Standards**: Quebec healthcare professional licensing and PHI protection

## Prerequisites

### 1. Firebase Emulator Suite

Ensure Firebase emulators are running before executing compliance tests:

```bash
# Start Firebase emulators with seed data
firebase emulators:start --import=./seed-data --export-on-exit=./seed-data

# Verify emulator endpoints:
# - Firestore: http://127.0.0.1:9881
# - Auth: http://127.0.0.1:9880
# - Functions: http://127.0.0.1:8780
# - Database: http://127.0.0.1:9882
# - Emulator UI: http://127.0.0.1:8782
```

### 2. Development Environment

```bash
# Ensure application is running
npm run tauri:dev

# Verify application access
# - Frontend: http://localhost:5177
# - DevTools: Chrome Developer Tools integration enabled
```

### 3. Test Environment Setup

```bash
# Install test dependencies
npm install --save-dev vitest @vitest/ui

# Configure test environment
npm run test:setup
```

## Test Suite Structure

### 1. Core Compliance Tests (`pipeda-law25-compliance.test.ts`)

**Test Categories:**
- Consent Management and Explicit Consent Tracking
- Data Residency and Canadian Cloud Infrastructure
- Breach Notification Automation (72-hour rule)
- Audit Logging for PHI Data Access
- Professional Licensing and Healthcare Compliance
- Right to Deletion and Data Portability
- Privacy Impact Assessment Automation

### 2. Firebase MCP Integration (`firebase-mcp-integration.test.ts`)

**Integration Categories:**
- Patient Data Management with PIPEDA Compliance
- Professional Credential Management
- Appointment Scheduling with Conflict Prevention
- Security Incident and Breach Management
- Authentication and Authorization (RBAC)
- Data Export and Right to Deletion
- Compliance Metrics and Reporting

## Running Compliance Tests

### 1. Execute Complete Test Suite

```bash
# Run all compliance tests
npm run test:compliance

# Run with detailed output
npm run test:compliance -- --reporter=verbose

# Run with coverage
npm run test:compliance -- --coverage
```

### 2. Execute Specific Test Categories

```bash
# Test consent management only
npm run test -- --grep "Consent Management"

# Test data residency only
npm run test -- --grep "Data Residency"

# Test breach notification only
npm run test -- --grep "Breach Notification"

# Test professional licensing only
npm run test -- --grep "Professional Licensing"
```

### 3. Firebase MCP Integration Tests

```bash
# Run Firebase MCP integration tests
npm run test:firebase-mcp

# Run with emulator validation
npm run test:firebase-mcp -- --environment=emulator
```

## Test Scenarios and Validation Points

### Consent Management Compliance

**Scenario 1: Explicit Consent Collection**
```typescript
// Validates:
// - Explicit consent requirements
// - Consent record structure
// - Expiry date tracking
// - Jurisdiction compliance (Quebec)

const consentValidation = await firestore_query_collection({
  collection_path: "consent_records",
  filters: [{
    field: "consentType",
    op: "EQUAL",
    compare_value: { string_value: "explicit_consent" }
  }],
  use_emulator: true
})
```

**Scenario 2: Consent Renewal Workflows**
```typescript
// Validates:
// - Automatic renewal reminders
// - 30-day advance notification
// - Consent expiry management

const renewalCheck = await firestore_query_collection({
  collection_path: "consent_records",
  filters: [{
    field: "expiryDate",
    op: "LESS_THAN",
    compare_value: { string_value: thirtyDaysFromNow }
  }],
  use_emulator: true
})
```

### Data Residency Compliance

**Scenario 1: Quebec Data Residency**
```typescript
// Validates:
// - Data stored in Quebec/Canada
// - Cloud provider compliance
// - Cross-border transfer restrictions

const residencyCheck = await firestore_query_collection({
  collection_path: "data_residency_logs",
  filters: [{
    field: "region",
    op: "EQUAL",
    compare_value: { string_value: "quebec_canada" }
  }],
  use_emulator: true
})
```

### Breach Notification Compliance

**Scenario 1: 72-Hour Notification Rule**
```typescript
// Validates:
// - Automatic breach detection
// - 72-hour notification timeline
// - Impact assessment automation

const breachCheck = await firestore_query_collection({
  collection_path: "security_incidents",
  filters: [{
    field: "notificationStatus",
    op: "IN",
    compare_value: {
      string_array_value: ["notified_within_72h", "notification_sent"]
    }
  }],
  use_emulator: true
})
```

### Professional Licensing Compliance

**Scenario 1: Quebec Professional Validation**
```typescript
// Validates:
// - Active professional licenses
// - Quebec jurisdiction requirements
// - Specialization verification
// - License expiry tracking

const professionalCheck = await firestore_query_collection({
  collection_path: "professionals",
  filters: [{
    field: "licenseStatus",
    op: "EQUAL",
    compare_value: { string_value: "active" }
  }, {
    field: "jurisdiction",
    op: "EQUAL",
    compare_value: { string_value: "Quebec" }
  }],
  use_emulator: true
})
```

### Audit Logging Compliance

**Scenario 1: PHI Access Auditing**
```typescript
// Validates:
// - All PHI access logged
// - 7-year retention requirement
// - Audit trail integrity

const auditCheck = await firestore_query_collection({
  collection_path: "audit_logs",
  filters: [{
    field: "dataType",
    op: "EQUAL",
    compare_value: { string_value: "PHI" }
  }],
  use_emulator: true
})
```

## Appointment System Compliance

### Real-time Conflict Prevention

**Scenario 1: Double-booking Prevention**
```typescript
// Validates:
// - Real-time booking locks
// - 50-minute session blocks
// - Quebec timezone handling

const conflictCheck = await database_get_data({
  path: "/appointments/booking-locks/prof-123",
  databaseUrl: "http://localhost:9882/psypsy-dev-local-default-rtdb"
})
```

### Session Duration Compliance

**Scenario 1: 50-Minute Sessions**
```typescript
// Validates:
// - Standard 50-minute therapy sessions
// - Appointment type validation
// - Duration compliance tracking

const sessionCheck = await firestore_query_collection({
  collection_path: "appointments",
  filters: [{
    field: "duration",
    op: "EQUAL",
    compare_value: { integer_value: 50 }
  }],
  use_emulator: true
})
```

## Authentication and Authorization Testing

### Role-Based Access Control (RBAC)

**Professional User Testing**
```typescript
// Validates:
// - Professional role assignment
// - Access permission validation
// - Quebec licensing verification

const professionalAuth = await auth_set_claim({
  uid: "prof-123",
  claim: "userType",
  value: 1 // PROFESSIONAL type
})
```

**Client User Testing**
```typescript
// Validates:
// - Client role assignment
// - Consent status tracking
// - Data access restrictions

const clientAuth = await auth_set_claim({
  uid: "client-456",
  claim: "userType",
  value: 2 // CLIENT type
})
```

## Data Export and Deletion Rights

### Data Portability Testing

**Export Functionality**
```typescript
// Validates:
// - Complete data export
// - Multiple format support (JSON, CSV, PDF, XML)
// - Data integrity verification

const exportCheck = await firestore_query_collection({
  collection_path: "data_export_requests",
  filters: [{
    field: "exportStatus",
    op: "EQUAL",
    compare_value: { string_value: "completed" }
  }],
  use_emulator: true
})
```

### Right to Deletion Testing

**Deletion Workflows**
```typescript
// Validates:
// - Complete data erasure
// - Selective deletion options
// - Anonymization alternatives

const deletionCheck = await firestore_query_collection({
  collection_path: "deletion_requests",
  filters: [{
    field: "verificationStatus",
    op: "EQUAL",
    compare_value: { string_value: "verified_deleted" }
  }],
  use_emulator: true
})
```

## Compliance Reporting

### Automated Report Generation

The test suite automatically generates comprehensive compliance reports including:

- **Test Execution Summary**
- **Compliance Framework Coverage**
- **Pass/Fail Status for Each Category**
- **Recommended Actions**
- **Next Review Schedule**

### Sample Compliance Report

```json
{
  "reportId": "compliance-report-1632825600000",
  "generatedAt": "2025-09-21T07:00:00.000Z",
  "reportingPeriod": "2025-Q3",
  "complianceFrameworks": ["PIPEDA", "Quebec Law 25"],
  "testResults": {
    "consentManagement": "PASS",
    "dataResidency": "PASS",
    "breachNotification": "PASS",
    "auditLogging": "PASS",
    "professionalLicensing": "PASS",
    "appointmentCompliance": "PASS",
    "rbacAuthentication": "PASS",
    "dataExportPortability": "PASS",
    "rightToDeletion": "PASS"
  },
  "overallStatus": "COMPLIANT",
  "recommendedActions": [
    "Continue quarterly compliance reviews",
    "Update consent renewal processes",
    "Monitor credential expiry dates",
    "Validate data residency monthly"
  ]
}
```

## Troubleshooting

### Common Issues

**1. Firebase Emulator Not Running**
```bash
# Error: Connection refused to emulator
# Solution: Start Firebase emulators
firebase emulators:start --import=./seed-data
```

**2. Test Environment Configuration**
```bash
# Error: Test environment not configured
# Solution: Set up test environment
npm run test:setup
```

**3. Missing Seed Data**
```bash
# Error: No test data available
# Solution: Import seed data
firebase emulators:start --import=./seed-data
```

### Debugging Tips

1. **Enable Verbose Logging**
   ```bash
   npm run test:compliance -- --reporter=verbose
   ```

2. **Check Emulator Status**
   ```bash
   # Visit Emulator UI
   open http://127.0.0.1:8782
   ```

3. **Validate Firebase Configuration**
   ```bash
   firebase projects:list
   firebase use psypsy-cms-dev
   ```

## Best Practices

### 1. Regular Compliance Testing

- Run compliance tests before each release
- Execute quarterly comprehensive audits
- Monitor test results in CI/CD pipeline

### 2. Test Data Management

- Use realistic but anonymized test data
- Maintain consistent seed data across environments
- Regularly update test scenarios

### 3. Documentation Updates

- Keep compliance documentation current
- Update test scenarios for regulation changes
- Maintain audit trail for compliance reports

## Compliance Checklist

### Pre-Release Validation

- [ ] All consent management tests pass
- [ ] Data residency requirements validated
- [ ] Breach notification automation tested
- [ ] Audit logging comprehensive
- [ ] Professional licensing current
- [ ] Appointment system compliant
- [ ] RBAC properly implemented
- [ ] Data export/deletion functional
- [ ] Compliance report generated

### Quarterly Reviews

- [ ] Update compliance test scenarios
- [ ] Review regulation changes
- [ ] Validate professional credentials
- [ ] Test data residency compliance
- [ ] Audit log retention verified
- [ ] Consent renewal processes tested
- [ ] Breach notification timing validated
- [ ] Generate quarterly compliance report

---

**Compliance Level**: PIPEDA + Quebec Law 25 Compliant
**Last Updated**: September 2025
**Next Review**: December 2025

This testing guide ensures PsyPsy CMS maintains the highest standards of healthcare data protection and regulatory compliance for Quebec healthcare professionals.