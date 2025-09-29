# Firestore Security Rules Documentation
**Last Updated**: September 29, 2025  
**Audience**: Security Engineers, Developers, Compliance Officers  
**Prerequisites**: Firestore knowledge, HIPAA/Quebec Law 25 understanding  
**Categories**: Security, Database, Compliance, Firebase  
**Topics**: Firestore Rules, Access Control, PHI Protection, Audit Trails  

## Overview

This document provides comprehensive documentation for the Firestore security rules implemented in PsyPsy CMS, designed to ensure full compliance with HIPAA, PIPEDA, and Quebec Law 25 requirements for healthcare data protection.

### Related Documentation
- [Compliance Overview](../compliance/overview.md) - High-level compliance requirements and status
- [Quebec Law 25 Guide](../compliance/quebec-law25.md) - Detailed Quebec privacy law implementation
- [Architecture Guide](../development/architecture.md) - System design with security considerations
- [Firebase Setup](../setup/setup-firebase-emulator.md) - Local development security testing

## Table of Contents

- [Compliance Framework](#compliance-framework)
- [Security Rules Structure](#security-rules-structure)
- [Access Control Patterns](#access-control-patterns)
- [Data Validation](#data-validation)
- [Audit Requirements](#audit-requirements)
- [Implementation Examples](#implementation-examples)

## Compliance Framework

### Legal Standards Implemented

- **HIPAA (Health Insurance Portability and Accountability Act)**
  - PHI (Protected Health Information) access controls
  - Audit trail requirements
  - Minimum necessary standard
  - Administrative, physical, and technical safeguards

- **PIPEDA (Personal Information Protection and Electronic Documents Act)**
  - Consent requirements for personal information collection
  - Individual access rights
  - Breach notification procedures
  - Cross-border data transfer restrictions

- **Quebec Law 25 (An Act to modernize legislative provisions)**
  - Enhanced consent requirements
  - Data residency in Quebec/Canada
  - Privacy by design implementation
  - Individual rights strengthening (access, rectification, erasure, portability)
  - 72-hour breach notification rule

## Security Architecture

### Role-Based Access Control (RBAC)

The security rules implement a hierarchical user type system:

```typescript
User Types (userType custom claim):
- 0: admin           - System administrators
- 1: professional    - Healthcare professionals
- 2: client          - Patients/clients
- 3: receptionist    - Administrative staff
- 4: guest           - Limited access users (default)
```

### Authentication Requirements

All access requires:
1. **Valid Firebase Authentication** - No anonymous access permitted
2. **Custom Claims** - User type and permissions set in JWT tokens
3. **Consent Validation** - Quebec Law 25 and PIPEDA consent confirmed
4. **Data Residency** - User must be validated for Quebec/Canada data processing

### PHI Access Controls

Protected Health Information access requires:
- Valid healthcare professional license (Quebec jurisdiction)
- Active license status (not expired)
- Quebec Law 25 consent
- PIPEDA consent for healthcare data
- Data residency compliance (Quebec/Canada)

## Collection-Level Security Rules

### 1. Users Collection (`/users/{userId}`)

**Purpose**: Core user account information

**Access Controls**:
- **Read**: Users can read own profile, professionals can read client profiles, admins read all
- **Write**: Users update own profile (with consent), admins update any profile
- **Create**: Only admins can create user accounts
- **Delete**: Only admins with audit trail

**Compliance Features**:
- Quebec Law 25 consent required for profile updates
- Audit trail mandatory for all admin operations
- Data residency validation for new accounts

### 2. User Profiles Collection (`/user_profiles/{userId}`)

**Purpose**: Extended user profile information including personal details

**Access Controls**:
- **Read**: Same as users collection
- **Write**: PHI data requires special handling and full consent
- **Create**: Owner or admin with Quebec compliance

**PHI Handling**:
- Emergency contact information marked as PHI
- Health card numbers encrypted and audited
- Insurance information requires maximum security level

### 3. Professionals Collection (`/professionals/{professionalId}`)

**Purpose**: Healthcare professional credentials and licensing

**Access Controls**:
- **Read**: Professionals read own data, admins and receptionists read all
- **Write**: Self-updates or admin modifications with audit
- **Create**: Admin-only creation with license validation

**License Validation**:
- Quebec jurisdiction requirement
- Active license status verification
- License expiry date validation
- Specialization verification

### 4. Clients Collection (`/clients/{clientId}`)

**Purpose**: Patient/client healthcare information

**Access Controls**:
- **Read**: Self-access or full PHI permissions required
- **Write**: PHI compliance with dual consent (Quebec + PIPEDA)
- **Create**: Only professionals with valid licenses

**PHI Protection**:
- All client data treated as PHI
- Mandatory encryption for sensitive fields
- Comprehensive audit trails
- Professional signature requirements

### 5. Appointments Collection (`/appointments/{appointmentId}`)

**Purpose**: Healthcare appointment scheduling and management

**Access Controls**:
- **Read**: Appointment participants and authorized professionals
- **Write**: Participants can update with Quebec consent
- **Create**: Authenticated users with consent

**Business Rules**:
- 50-minute duration validation for therapy sessions
- Conflict prevention mechanisms
- Real-time availability tracking
- Quebec timezone compliance

### 6. Medical Notes Collection (`/medical_notes/{noteId}`)

**Purpose**: Clinical notes and session documentation

**Access Controls**:
- **Read**: Only professionals with full PHI access
- **Write**: Creating professional or admins only
- **Create**: Licensed professionals with valid signatures

**Clinical Requirements**:
- Professional signature mandatory
- PHI marking and encryption required
- Comprehensive audit trails
- Immutable after professional signature

### 7. Consent Records Collection (`/consent_records/{consentId}`)

**Purpose**: Quebec Law 25 and PIPEDA consent tracking

**Access Controls**:
- **Read**: Users read own consents, admins read all
- **Write**: Immutable after creation (admin modifications only)
- **Create**: Users create own consent records

**Compliance Features**:
- Quebec Law 25 compliance flags
- PIPEDA compliance validation
- Audit trail for all consent actions
- Expiry date tracking and renewal workflows

### 8. Audit Logs Collection (`/audit_logs/{logId}`)

**Purpose**: Comprehensive access and operation logging

**Access Controls**:
- **Read**: Admin-only access
- **Write**: Immutable after creation
- **Create**: System-generated logs only

**Audit Requirements**:
- 7-year retention compliance
- Quebec data residency validation
- Comprehensive action tracking
- PHI access monitoring

### 9. Security Incidents Collection (`/security_incidents/{incidentId}`)

**Purpose**: Security breach detection and 72-hour notification compliance

**Access Controls**:
- **Read**: Admin-only access
- **Write**: Admin status updates only
- **Create**: System-generated incidents

**Breach Notification**:
- Automatic severity assessment
- 72-hour notification timeline tracking
- Impact assessment automation
- Regulatory reporting integration

### 10. Data Export/Deletion Requests Collections

**Purpose**: Quebec Law 25 individual rights (portability and erasure)

**Access Controls**:
- **Read**: Users read own requests, admins read all
- **Write**: Admin processing only
- **Create**: User-initiated requests

**Rights Implementation**:
- Data portability (multiple format support)
- Right to erasure with verification
- Request status tracking
- Compliance timeline monitoring

## Helper Functions

### Authentication Functions

```typescript
isAuthenticated()           // Validates Firebase authentication
getUserType()              // Retrieves user type from custom claims
getUserRole()              // Retrieves specific role information
isOwner(userId)            // Validates resource ownership
```

### Consent and Compliance Functions

```typescript
hasQuebecConsent()         // Quebec Law 25 consent validation
hasPIPEDAConsent()         // PIPEDA healthcare consent validation
isDataResidencyCompliant() // Quebec/Canada residency validation
```

### Professional Licensing Functions

```typescript
hasValidLicense()          // Active Quebec license validation
isLicenseValid()           // License expiry date validation
isProfessional()           // Professional user type validation
```

### PHI Protection Functions

```typescript
canAccessPHI()             // Comprehensive PHI access validation
isPHIDataValid(data)       // PHI marking and encryption validation
hasAuditTrail(data)        // Audit trail requirement validation
```

## Security Patterns

### Principle of Least Privilege

- Users receive minimum necessary access for their role
- PHI access requires multiple validation layers
- Admin privileges limited to necessary functions
- Audit trails for all privileged operations

### Defense in Depth

1. **Authentication Layer**: Firebase Auth with custom claims
2. **Authorization Layer**: Role-based access controls
3. **Data Protection Layer**: PHI encryption and marking
4. **Audit Layer**: Comprehensive logging and monitoring
5. **Compliance Layer**: Quebec Law 25 and PIPEDA validation

### Fail-Safe Defaults

- Default user type is guest (minimal access)
- Undefined collections explicitly denied
- Missing consent defaults to access denial
- Expired licenses default to access revocation

## Testing and Validation

### Test Coverage

The security rules include comprehensive test coverage with 35 test cases covering:

- Authentication requirements (5 tests)
- Role-based access control (15 tests)
- PHI data protection (8 tests)
- Quebec Law 25 compliance (4 tests)
- Professional licensing (3 tests)

### Test Categories

1. **Authentication Tests**
   - Unauthenticated access denial
   - Valid token requirements
   - Custom claims validation

2. **RBAC Tests**
   - Admin privileges and limitations
   - Professional license validation
   - Client self-access controls
   - Receptionist administrative access

3. **PHI Protection Tests**
   - Encryption requirements
   - Audit trail validation
   - Consent verification
   - Data residency compliance

4. **Compliance Tests**
   - Quebec Law 25 consent workflows
   - PIPEDA healthcare data requirements
   - 72-hour breach notification
   - Data export and deletion rights

5. **Integration Tests**
   - End-to-end healthcare workflows
   - Cross-collection access patterns
   - Compliance validation chains

## Deployment Considerations

### Development vs Production

The security rules are designed for production use and replace the development-only open access rules. Key differences:

**Development (Previous)**:
```javascript
allow read, write: if true; // Open access for testing
```

**Production (Current)**:
```javascript
// Comprehensive RBAC with compliance validation
allow read: if isAuthenticated() &&
            hasQuebecConsent() &&
            canAccessResource(userId);
```

### Firebase Emulator Testing

The rules support Firebase emulator testing with:
- Mock authentication and custom claims
- Simulated consent and licensing states
- Audit trail validation
- Data residency testing

### Monitoring and Alerting

Implement monitoring for:
- Failed authentication attempts
- Unauthorized access attempts
- PHI access without proper consent
- License expiry warnings
- Data residency violations

## Compliance Audit Trail

### Audit Log Structure

```json
{
  "id": "audit-log-id",
  "timestamp": "2025-01-01T00:00:00Z",
  "action": "phi_access",
  "userId": "user-123",
  "performedBy": "prof-456",
  "details": {
    "collection": "clients",
    "documentId": "client-789",
    "dataType": "PHI"
  },
  "ipAddress": "127.0.0.1",
  "userAgent": "PsyPsy-CMS/2.0",
  "dataSubject": "client-789",
  "legalBasis": "Quebec Law 25 - Healthcare Treatment",
  "processingPurpose": "medical_treatment",
  "dataResidency": "quebec_canada"
}
```

### Retention Requirements

- **Audit Logs**: 7 years (HIPAA requirement)
- **Consent Records**: Permanent with update history
- **Security Incidents**: 7 years minimum
- **Professional Credentials**: Until license expiry + 2 years

## Security Rule Maintenance

### Regular Reviews

1. **Monthly**: License expiry validation
2. **Quarterly**: Compliance regulation updates
3. **Annually**: Complete security audit
4. **As-needed**: Incident response updates

### Update Procedures

1. Test rule changes in Firebase emulator
2. Run comprehensive test suite
3. Validate with compliance requirements
4. Deploy with audit trail documentation
5. Monitor for access pattern changes

### Documentation Updates

Maintain current documentation for:
- Rule change rationale
- Compliance mapping updates
- New collection security patterns
- Helper function modifications

## Emergency Procedures

### Security Incident Response

1. **Detection**: Automated monitoring alerts
2. **Assessment**: Severity and impact evaluation
3. **Containment**: Immediate access restriction
4. **Notification**: 72-hour Quebec Law 25 compliance
5. **Recovery**: System restoration and validation
6. **Lessons Learned**: Rule improvement implementation

### License Expiry Handling

1. **90-day Warning**: Automated notifications
2. **30-day Warning**: Access restriction warnings
3. **Expiry Date**: Immediate PHI access revocation
4. **Grace Period**: 7-day administrative access only
5. **Full Restriction**: Complete access denial

### Data Breach Protocols

1. **Immediate**: Access logging and restriction
2. **1 Hour**: Incident team notification
3. **24 Hours**: Impact assessment completion
4. **72 Hours**: Regulatory notification (Quebec Law 25)
5. **30 Days**: Comprehensive incident report

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Next Review**: April 2025
**Compliance Level**: HIPAA + PIPEDA + Quebec Law 25

**Approved By**: Security Team, Compliance Officer, Technical Lead
**Status**: Production Ready