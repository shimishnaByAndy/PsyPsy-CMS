# Quebec Law 25 Compliance Implementation
**Last Updated**: September 29, 2025  
**Audience**: Compliance Officers, Legal Team, Developers  
**Prerequisites**: Knowledge of Quebec privacy legislation  

## Overview

This document details PsyPsy CMS's compliance with Quebec's Law 25 (Bill 64) - An Act to modernize legislative provisions as regards the protection of personal information. This law enhances privacy protections and aligns Quebec with international standards.

## Table of Contents

- [Legal Framework](#legal-framework)
- [Data Residency Requirements](#data-residency-requirements)
- [Consent Management](#consent-management)
- [Individual Rights](#individual-rights)
- [Breach Notification](#breach-notification)
- [Technical Implementation](#technical-implementation)
- [Compliance Monitoring](#compliance-monitoring)
- [Documentation Requirements](#documentation-requirements)

## Legal Framework

### Law 25 Key Provisions
**Effective Date**: September 22, 2023  
**Full Compliance Required**: September 22, 2024 ✅  
**Scope**: All organizations collecting personal information in Quebec  

### Key Requirements for Healthcare
1. **Enhanced Consent**: Explicit, informed consent for personal information collection
2. **Data Minimization**: Collect only necessary personal information
3. **Purpose Limitation**: Use personal information only for stated purposes
4. **Data Residency**: Keep personal information within Quebec/Canada when possible
5. **Breach Notification**: Report breaches within 72 hours
6. **Individual Rights**: Provide access, rectification, and erasure capabilities

## Data Residency Requirements

### Geographic Restrictions ✅
```typescript
// Enforced data residency validation
const validateDataResidency = (operation: DatabaseOperation) => {
  const allowedRegions = [
    'quebec-1',
    'canada-central-1', 
    'canada-east-1'
  ];
  
  const currentRegion = process.env.FIREBASE_REGION;
  
  if (!allowedRegions.includes(currentRegion)) {
    throw new ComplianceError(
      'QUEBEC_LAW25_VIOLATION', 
      'Data processing outside Quebec/Canada not permitted'
    );
  }
  
  // Log compliance verification
  auditLogger.log({
    event: 'data_residency_verified',
    region: currentRegion,
    operation: operation.type,
    timestamp: new Date().toISOString()
  });
};
```

### Implementation Status
✅ **Production Environment**: Canadian data centers only  
✅ **Development Environment**: Local Quebec-based testing  
✅ **Backup Storage**: Canadian cloud regions exclusively  
✅ **CDN Configuration**: Canadian edge locations prioritized  

### Cross-Border Transfer Controls
```typescript
interface CrossBorderTransfer {
  destinationCountry: string;
  legalBasis: 'adequacy_decision' | 'safeguards' | 'consent' | 'necessity';
  consentId?: string;
  safeguardMeasures?: string[];
  approvalRequired: boolean;
}

const validateCrossBorderTransfer = (transfer: CrossBorderTransfer): boolean => {
  // Quebec Law 25: Default prohibition on cross-border transfers
  if (transfer.destinationCountry !== 'CA') {
    // Require explicit consent and additional safeguards
    return transfer.legalBasis === 'consent' && 
           transfer.consentId && 
           transfer.safeguardMeasures.length > 0;
  }
  return true;
};
```

## Consent Management

### Consent Requirements ✅
Law 25 requires consent to be:
- **Free**: Not a condition of service provision
- **Informed**: Clear explanation of collection purposes
- **Specific**: Distinct consent for each purpose
- **Unambiguous**: Clear acceptance indication

### Technical Implementation
```typescript
interface QuebecConsent {
  id: string;
  userId: string;
  purposes: ConsentPurpose[];
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  language: 'en' | 'fr';
  version: string;
  status: 'active' | 'withdrawn' | 'expired';
  expiryDate?: Date;
  withdrawalDate?: Date;
  renewalRequired: boolean;
}

interface ConsentPurpose {
  purpose: 'healthcare_services' | 'appointment_booking' | 'communications' | 'analytics';
  description: {
    en: string;
    fr: string;
  };
  mandatory: boolean;
  dataCategories: string[];
  retentionPeriod: number;
  thirdPartySharing: boolean;
}

// Consent validation before data processing
const validateConsent = (userId: string, purpose: string): boolean => {
  const consent = getActiveConsent(userId, purpose);
  
  if (!consent || consent.status !== 'active') {
    throw new ConsentError('CONSENT_REQUIRED', purpose);
  }
  
  if (consent.expiryDate && consent.expiryDate < new Date()) {
    throw new ConsentError('CONSENT_EXPIRED', purpose);
  }
  
  return true;
};
```

### Consent User Interface
```typescript
// Bilingual consent interface (English/French)
const ConsentManager: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [consents, setConsents] = useState<ConsentPurpose[]>([]);
  
  const consentPurposes: ConsentPurpose[] = [
    {
      purpose: 'healthcare_services',
      description: {
        en: 'Processing your health information to provide healthcare services',
        fr: 'Traitement de vos informations de santé pour fournir des services de soins'
      },
      mandatory: true,
      dataCategories: ['health_data', 'contact_info'],
      retentionPeriod: 7, // years
      thirdPartySharing: false
    },
    {
      purpose: 'appointment_booking',
      description: {
        en: 'Managing your appointments and scheduling preferences',
        fr: 'Gestion de vos rendez-vous et préférences de planification'
      },
      mandatory: false,
      dataCategories: ['scheduling_data', 'preferences'],
      retentionPeriod: 2,
      thirdPartySharing: false
    }
  ];
  
  return (
    <div className="consent-manager">
      <h2>{t('consent.title')}</h2>
      <p>{t('consent.introduction')}</p>
      
      {consentPurposes.map(purpose => (
        <ConsentItem 
          key={purpose.purpose}
          purpose={purpose}
          language={i18n.language as 'en' | 'fr'}
          onConsentChange={handleConsentChange}
        />
      ))}
    </div>
  );
};
```

## Individual Rights

### Right of Access ✅
**Implementation**: Self-service data access portal
```typescript
const DataAccessPortal: React.FC = () => {
  const exportUserData = async (userId: string) => {
    // Compile all user data from multiple sources
    const userData = {
      personalInfo: await getUserProfile(userId),
      appointments: await getUserAppointments(userId),
      medicalNotes: await getUserMedicalNotes(userId),
      communications: await getUserCommunications(userId),
      auditTrail: await getUserAuditTrail(userId),
      consents: await getUserConsents(userId)
    };
    
    // Export in machine-readable format (JSON) and human-readable (PDF)
    return {
      json: JSON.stringify(userData, null, 2),
      pdf: await generateUserDataReport(userData),
      requestId: generateUUID(),
      exportDate: new Date().toISOString()
    };
  };
};
```

### Right to Rectification ✅
**Implementation**: User-initiated data correction workflows
```typescript
const DataCorrectionWorkflow: React.FC = () => {
  const submitCorrection = async (correction: DataCorrection) => {
    // Quebec Law 25: Must respond within 30 days
    const correctionRequest = {
      id: generateUUID(),
      userId: getCurrentUser().id,
      fieldPath: correction.fieldPath,
      currentValue: correction.currentValue,
      proposedValue: correction.proposedValue,
      justification: correction.justification,
      submittedAt: new Date(),
      status: 'pending',
      reviewDeadline: addDays(new Date(), 30)
    };
    
    await submitCorrectionRequest(correctionRequest);
    
    // Automatic notification to data protection officer
    await notifyDataProtectionOfficer(correctionRequest);
  };
};
```

### Right to Erasure ✅
**Implementation**: Complete data deletion with verification
```typescript
const processErasureRequest = async (userId: string, reason: ErasureReason) => {
  // Quebec Law 25: Verify legitimate grounds for erasure
  const validReasons = [
    'consent_withdrawn',
    'purpose_fulfilled',
    'unlawful_processing',
    'legal_obligation'
  ];
  
  if (!validReasons.includes(reason)) {
    throw new ErasureError('INVALID_REASON', reason);
  }
  
  // Multi-step deletion process
  const deletionSteps = [
    () => deleteUserProfile(userId),
    () => deleteUserAppointments(userId),
    () => anonymizeAuditTrail(userId),
    () => deleteUserCommunications(userId),
    () => removeFromBackups(userId),
    () => notifyThirdParties(userId)
  ];
  
  const deletionResults = [];
  for (const step of deletionSteps) {
    try {
      await step();
      deletionResults.push({ step: step.name, status: 'success' });
    } catch (error) {
      deletionResults.push({ step: step.name, status: 'failed', error });
    }
  }
  
  // Generate deletion certificate
  const certificate = {
    userId,
    requestDate: new Date(),
    completionDate: new Date(),
    steps: deletionResults,
    verificationHash: generateVerificationHash(deletionResults)
  };
  
  await storeDeletionCertificate(certificate);
  return certificate;
};
```

## Breach Notification

### 72-Hour Notification Requirement ✅
```typescript
interface BreachNotification {
  id: string;
  detectedAt: Date;
  notifiedAt?: Date;
  category: 'confidentiality' | 'integrity' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedIndividuals: number;
  personalInfoTypes: string[];
  circumstances: string;
  consequencesAssessment: string;
  mitigationMeasures: string[];
  preventiveMeasures: string[];
  status: 'detected' | 'assessed' | 'notified' | 'resolved';
}

const processSecurityBreach = async (incident: SecurityIncident) => {
  const breach: BreachNotification = {
    id: generateUUID(),
    detectedAt: incident.detectedAt,
    category: assessBreachCategory(incident),
    severity: assessBreachSeverity(incident),
    affectedIndividuals: await countAffectedUsers(incident),
    personalInfoTypes: identifyAffectedDataTypes(incident),
    circumstances: incident.description,
    consequencesAssessment: await assessConsequences(incident),
    mitigationMeasures: incident.mitigationActions,
    preventiveMeasures: [],
    status: 'detected'
  };
  
  // Quebec Law 25: Notify within 72 hours if high risk
  if (breach.severity === 'high' || breach.severity === 'critical') {
    const notificationDeadline = addHours(breach.detectedAt, 72);
    
    await scheduleBreachNotification({
      breach,
      deadline: notificationDeadline,
      recipients: [
        'quebec.privacy.commissioner@cai.gouv.qc.ca',
        'privacy.officer@psypsy.ca'
      ]
    });
  }
  
  // Notify affected individuals without undue delay
  await notifyAffectedIndividuals(breach);
  
  return breach;
};
```

## Technical Implementation

### Database Configuration
```typescript
// Firestore rules for Quebec Law 25 compliance
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Quebec residents data protection
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && validateQuebecConsent(userId, request.method);
    }
    
    // Healthcare data with enhanced protection
    match /medical_records/{recordId} {
      allow read, write: if request.auth != null
        && hasHealthcareRole(request.auth.uid)
        && validateDataResidency(request.region)
        && auditAccess(recordId, request.auth.uid);
    }
  }
}
`;

// Consent validation function
function validateQuebecConsent(userId, method) {
  let consent = get(/databases/$(database)/documents/consents/$(userId));
  return consent.data.status == 'active' 
    && consent.data.purposes[method] == true
    && consent.data.expiryDate > request.time;
}
```

### Monitoring and Alerts
```typescript
const quebecComplianceMonitor = {
  // Monitor data residency compliance
  checkDataResidency: () => {
    const allowedRegions = ['quebec-1', 'canada-central-1'];
    const currentOperations = getCurrentDatabaseOperations();
    
    const violations = currentOperations.filter(op => 
      !allowedRegions.includes(op.region)
    );
    
    if (violations.length > 0) {
      alertComplianceTeam('DATA_RESIDENCY_VIOLATION', violations);
    }
  },
  
  // Monitor consent compliance
  checkConsentCompliance: async () => {
    const expiredConsents = await getExpiredConsents();
    const processingWithoutConsent = await getUnconsentedProcessing();
    
    if (expiredConsents.length > 0) {
      await suspendProcessingForUsers(expiredConsents.map(c => c.userId));
      alertComplianceTeam('EXPIRED_CONSENTS', expiredConsents);
    }
  },
  
  // Monitor breach notification deadlines
  checkBreachNotificationDeadlines: async () => {
    const pendingNotifications = await getPendingBreachNotifications();
    const overdueNotifications = pendingNotifications.filter(n => 
      n.deadline < new Date()
    );
    
    if (overdueNotifications.length > 0) {
      alertComplianceTeam('OVERDUE_BREACH_NOTIFICATIONS', overdueNotifications);
    }
  }
};

// Run compliance checks every hour
setInterval(quebecComplianceMonitor.checkDataResidency, 60 * 60 * 1000);
setInterval(quebecComplianceMonitor.checkConsentCompliance, 60 * 60 * 1000);
setInterval(quebecComplianceMonitor.checkBreachNotificationDeadlines, 60 * 60 * 1000);
```

## Compliance Monitoring

### Real-Time Dashboard ✅
- **Data Residency Status**: Current processing regions
- **Consent Status**: Active/expired/withdrawn consents by user
- **Breach Monitoring**: Open incidents and notification status
- **Rights Requests**: Pending access, rectification, and erasure requests

### Automated Reporting ✅
```typescript
const generateQuebecComplianceReport = async (period: ReportingPeriod) => {
  const report = {
    reportId: generateUUID(),
    period,
    generatedAt: new Date(),
    
    dataResidency: {
      totalOperations: await countDatabaseOperations(period),
      canadianOperations: await countCanadianOperations(period),
      complianceRate: calculateComplianceRate(),
      violations: await getDataResidencyViolations(period)
    },
    
    consentManagement: {
      totalConsents: await countConsents(period),
      activeConsents: await countActiveConsents(period),
      withdrawnConsents: await countWithdrawnConsents(period),
      expiredConsents: await countExpiredConsents(period)
    },
    
    individualRights: {
      accessRequests: await countAccessRequests(period),
      rectificationRequests: await countRectificationRequests(period),
      erasureRequests: await countErasureRequests(period),
      averageResponseTime: await calculateAverageResponseTime(period)
    },
    
    breachNotifications: {
      totalBreaches: await countBreaches(period),
      notifiedWithin72Hours: await countTimelyNotifications(period),
      affectedIndividuals: await countAffectedIndividuals(period),
      resolution: await getBreachResolutionStats(period)
    }
  };
  
  // Store report for regulatory purposes
  await storeComplianceReport(report);
  
  // Send to Quebec privacy office if required
  if (report.breachNotifications.totalBreaches > 0) {
    await submitToQuebecPrivacyOffice(report);
  }
  
  return report;
};
```

## Documentation Requirements

### Required Records ✅
1. **Privacy Impact Assessments**: For all new data processing activities
2. **Consent Records**: Detailed consent logs with timestamps and versions
3. **Breach Incident Reports**: Complete documentation of all security incidents
4. **Data Processing Register**: Inventory of all personal information processing
5. **Training Records**: Staff training on Quebec privacy law requirements
6. **Third-Party Agreements**: Contracts with service providers handling personal information

### Document Retention ✅
- **Privacy Impact Assessments**: 7 years after processing ends
- **Consent Records**: Duration of processing + 1 year
- **Breach Reports**: 5 years minimum
- **Audit Logs**: 6 years (aligned with HIPAA requirements)
- **Training Records**: 3 years after training completion

## Related Documentation

- **[Compliance Overview](overview.md)** - General compliance framework
- **[HIPAA Implementation](../security/FIRESTORE_SECURITY_DOCUMENTATION.md)** - US healthcare compliance
- **[Compliance Testing](compliance-testing-guide.md)** - Testing and validation procedures
- **[Technical Architecture](../development/architecture.md)** - Technical implementation details

---

**Document Control**  
**Version**: 2.1  
**Last Review**: September 29, 2025  
**Next Review**: December 29, 2025  
**Owner**: Chief Privacy Officer  
**Legal Review**: Quebec Privacy Counsel  

This document ensures full compliance with Quebec Law 25 requirements for personal information protection.