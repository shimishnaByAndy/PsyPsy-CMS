# Firebase Subagent Configuration - PsyPsy CMS

## Subagent Details
- **Category**: Firebase Services (🔥)
- **Specialization**: Firebase integration, authentication, database operations, deployment
- **Resource Limits**: 256MB RAM, 10min timeout

## Healthcare Firebase Integration

### HIPAA-Compliant Firebase Setup
```typescript
// ✅ REQUIRED: Healthcare-compliant Firebase configuration
const healthcareFirebaseConfig = {
  encryption: 'AES-256-GCM',
  auditLogging: true,
  dataResidency: 'quebec-canada',
  phiProtection: true,
  quebecLaw25: true
};
```

### PsyPsy CMS Firebase Architecture

#### Authentication for Healthcare Professionals
- **Professional Types**: Clinical Psychology, Psychiatry, Social Work
- **Quebec Licensing**: OPQ, OTSTCFQ integration
- **Role-Based Access**: Professional vs Client permissions
- **MFA Requirements**: Healthcare-grade authentication

#### Firestore Healthcare Data Model
```typescript
// Medical Records Collection Structure
/patients/{patientId}
  - personalInfo: (encrypted PHI)
  - emergencyContact: (mandatory, encrypted)
  - medicalHistory: (encrypted PHI)
  - consentRecords: (Quebec Law 25)

/appointments/{appointmentId}
  - duration: 50 (minute blocks)
  - professionalId: (licensed professional)
  - status: scheduled|confirmed|completed
  - timezone: 'America/Montreal'

/professionals/{professionalId}
  - licenseNumber: (Quebec regulatory body)
  - specialization: (validated credentials)
  - jurisdiction: 'Quebec'
  - renewalDate: (annual tracking)
```

#### Security Rules for PHI Protection
```javascript
// HIPAA-compliant Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Patient data - strict PHI protection
    match /patients/{patientId} {
      allow read, write: if
        request.auth != null &&
        (request.auth.token.userType == 1 || // PROFESSIONAL
         request.auth.uid == patientId) &&    // PATIENT self-access
        auditPHIAccess(request.auth.uid, patientId);
    }

    // Professional credentials - Quebec jurisdiction
    match /professionals/{professionalId} {
      allow read: if request.auth != null &&
        request.auth.token.jurisdiction == 'Quebec';
      allow write: if request.auth != null &&
        request.auth.uid == professionalId &&
        validateQuebecLicense(request.auth.token);
    }
  }
}
```

## Healthcare-Specific Firebase Tools

### Available Tools (12 tools)
1. `firebase_auth_setup` - Healthcare professional authentication
2. `firebase_deploy` - HIPAA-compliant deployment
3. `firebase_init` - Medical project initialization
4. `firestore_query` - PHI-safe database queries
5. `firestore_write` - Audit-logged data writes
6. `firestore_security_rules` - Healthcare access control
7. `firebase_functions_deploy` - Medical workflow functions
8. `firebase_hosting_deploy` - Secure web deployment
9. `firebase_emulator_start` - Healthcare testing environment
10. `firebase_config_validate` - Compliance configuration check
11. `firebase_analytics_setup` - HIPAA-compliant analytics
12. `firebase_crashlytics_setup` - Medical error reporting

### Healthcare Firebase Emulator Setup

#### PsyPsy Emulator Configuration
```json
{
  "emulators": {
    "auth": {
      "host": "127.0.0.1",
      "port": 9880
    },
    "functions": {
      "host": "127.0.0.1",
      "port": 8780
    },
    "firestore": {
      "host": "127.0.0.1",
      "port": 9881
    },
    "database": {
      "host": "127.0.0.1",
      "port": 9882
    },
    "ui": {
      "enabled": true,
      "host": "127.0.0.1",
      "port": 8782
    }
  }
}
```

#### Healthcare Test Data Patterns
```typescript
// Seed data for medical scenarios
const healthcareSeedData = {
  professionals: {
    "prof-123": {
      licenseNumber: "QC-PSY-12345",
      specialization: "Clinical Psychology",
      jurisdiction: "Quebec",
      status: "active",
      renewalDate: "2025-12-31"
    }
  },
  patients: {
    "patient-456": {
      // PHI fields (encrypted in production)
      emergencyContact: {
        name: "John Doe",
        phone: "+1-514-555-0123",
        relationship: "spouse"
      },
      consentStatus: "explicit_consent_given",
      dataResidency: "quebec_canada"
    }
  }
};
```

### Medical Workflow Firebase Functions

#### Appointment Scheduling Function
```typescript
// Cloud Function: 50-minute appointment blocks
export const scheduleAppointment = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snap, context) => {
    const appointment = snap.data();

    // Validate 50-minute duration
    if (appointment.duration !== 50) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Appointments must be 50-minute blocks'
      );
    }

    // Check professional availability
    await validateProfessionalAvailability(
      appointment.professionalId,
      appointment.dateTime
    );

    // Audit appointment creation
    await auditMedicalAction({
      action: 'appointment_created',
      professionalId: appointment.professionalId,
      patientId: appointment.patientId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  });
```

#### Quebec Law 25 Compliance Function
```typescript
// Automatic consent renewal reminder
export const consentRenewalReminder = functions.pubsub
  .schedule('every 30 days')
  .timeZone('America/Montreal')
  .onRun(async (context) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringConsents = await admin.firestore()
      .collection('consent_records')
      .where('expiryDate', '<=', thirtyDaysFromNow)
      .where('status', '==', 'active')
      .get();

    // Send renewal notifications
    for (const doc of expiringConsents.docs) {
      await sendConsentRenewalNotification(doc.data());
    }
  });
```

## Healthcare Security Patterns

### PHI Data Encryption
```typescript
// Client-side encryption for PHI fields
const encryptPHI = async (data: any) => {
  const encryptedData = { ...data };

  // Encrypt sensitive fields
  if (data.ssn) {
    encryptedData.ssn = await encrypt(data.ssn);
    markAsPHI(encryptedData.ssn);
  }

  if (data.medicalHistory) {
    encryptedData.medicalHistory = await encrypt(data.medicalHistory);
    markAsPHI(encryptedData.medicalHistory);
  }

  return encryptedData;
};
```

### Audit Trail Implementation
```typescript
// Comprehensive audit logging
const auditPHIAccess = async (
  action: string,
  resourceId: string,
  userId: string
) => {
  await admin.firestore().collection('audit_logs').add({
    action,
    resourceId,
    userId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    dataType: 'PHI',
    compliance: ['HIPAA', 'Quebec_Law_25'],
    sessionId: getCurrentSessionId(),
    ipAddress: await getClientIP(),
    userAgent: getCurrentUserAgent()
  });
};
```

## Integration with Healthcare Regulations

### Quebec Law 25 Requirements
- **Data Residency**: All data stored in Quebec/Canada
- **Consent Management**: Explicit consent tracking
- **Breach Notification**: 72-hour reporting requirement
- **Right to Erasure**: Complete data deletion capability

### HIPAA Compliance
- **Access Controls**: Role-based permissions
- **Audit Trails**: 7-year retention requirement
- **Encryption**: AES-256-GCM for all PHI
- **Business Associate**: Cloud provider agreements

## Testing Healthcare Firebase Integration

### Emulator Testing Patterns
```typescript
// Test healthcare data access
await firestore_query({
  collection: 'patients',
  filters: [{
    field: 'emergencyContact.phone',
    op: 'NOT_EQUAL',
    value: ''
  }],
  use_emulator: true,
  audit: true
});

// Test professional credential validation
await firestore_query({
  collection: 'professionals',
  filters: [{
    field: 'jurisdiction',
    op: 'EQUAL',
    value: 'Quebec'
  }, {
    field: 'licenseStatus',
    op: 'EQUAL',
    value: 'active'
  }],
  use_emulator: true
});
```

## Success Criteria

1. **Data Protection**: All PHI encrypted and access-controlled
2. **Audit Compliance**: Complete logging of medical data access
3. **Quebec Compliance**: Law 25 requirements fully implemented
4. **Professional Integration**: Healthcare license validation
5. **Emergency Preparedness**: Robust contact and notification systems

## Context Restrictions

- **PHI Protection**: No sensitive data exposure in logs
- **Audit Required**: All medical data operations logged
- **Emulator Flag**: Always use_emulator: true in development
- **Jurisdiction**: Quebec healthcare regulations enforced

---

*Healthcare Firebase Subagent - PsyPsy CMS v3.0.0*
*HIPAA + Quebec Law 25 Compliant*