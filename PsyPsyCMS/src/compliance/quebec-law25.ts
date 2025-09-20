/**
 * Quebec Law 25 Compliance Framework
 * Implements Quebec's privacy law requirements (effective September 22, 2024)
 *
 * Key Requirements:
 * - Consent management with granular control
 * - Data subject rights (access, rectification, erasure, portability)
 * - Breach notification protocols
 * - Privacy by design principles
 * - Cross-border transfer assessments
 */

export interface Law25Compliance {
  // Consent tracking
  consent: {
    obtained: Date;
    purpose: string[];
    granular: Map<DataType, boolean>;
    withdrawable: boolean;
    version: string; // Track consent policy version
  };

  // De-identification requirements
  deIdentification: {
    removeDirectIdentifiers: boolean;  // Names, addresses, IDs
    removeIndirectIdentifiers: boolean; // DOB, postal codes
    pseudonymization: boolean;          // Replace with pseudonyms
    level: DeidentificationLevel;
  };

  // Data retention
  retention: {
    activeAccountPolicy: "unlimited" | number; // Days
    deletedAccountPolicy: number;              // Days after deletion
    auditLogRetention: number;                 // Minimum 3 years
    medicalNotesRetention: number;             // Healthcare-specific retention
  };

  // Breach handling
  breachProtocol: {
    notificationTimeline: "immediate";
    caiNotification: boolean;     // Commission d'accès à l'information
    individualNotification: boolean;
    riskAssessment: "serious_injury" | "minimal";
    documentation: string[];      // Required breach documentation
  };
}

export enum DataType {
  PERSONAL_IDENTIFIERS = "personal_identifiers",
  MEDICAL_INFORMATION = "medical_information",
  FINANCIAL_DATA = "financial_data",
  CONTACT_INFORMATION = "contact_information",
  PROFESSIONAL_CREDENTIALS = "professional_credentials",
  APPOINTMENT_DATA = "appointment_data",
  SESSION_NOTES = "session_notes",
  INSURANCE_INFO = "insurance_info",
  EMERGENCY_CONTACTS = "emergency_contacts",
  RAMQ_INFORMATION = "ramq_information" // Quebec health card
}

export enum DeidentificationLevel {
  BASIC = "basic",           // Remove direct identifiers only
  STANDARD = "standard",     // Remove direct + some indirect identifiers
  ENHANCED = "enhanced",     // Comprehensive de-identification
  ANONYMOUS = "anonymous"    // Full anonymization (irreversible)
}

export interface ConsentRecord {
  id: string;
  userId: string;
  dataTypes: DataType[];
  purposes: string[];
  consentDate: Date;
  withdrawnDate?: Date;
  version: string;
  lawBasis: "consent" | "legitimate_interest" | "contract" | "legal_obligation";

  // Quebec Law 25 specific fields
  granularConsent: Record<DataType, boolean>;
  canadianResident: boolean;
  crossBorderTransfer: boolean;
  dataRetentionAgreed: boolean;
}

export interface DataSubjectRightsRequest {
  id: string;
  userId: string;
  requestType: DataSubjectRight;
  requestDate: Date;
  status: RequestStatus;
  completionDeadline: Date; // Max 30 days under Law 25
  responseDate?: Date;
  responseData?: any;

  // Documentation for compliance
  verificationMethod: string;
  requestDetails: string;
  processingNotes: string[];
}

export enum DataSubjectRight {
  ACCESS = "access",                    // Right to know what data is held
  RECTIFICATION = "rectification",      // Right to correct inaccurate data
  ERASURE = "erasure",                  // Right to be forgotten
  PORTABILITY = "portability",          // Right to data portability
  RESTRICTION = "restriction",          // Right to restrict processing
  WITHDRAW_CONSENT = "withdraw_consent", // Right to withdraw consent
  OBJECT = "object"                     // Right to object to processing
}

export enum RequestStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  REJECTED = "rejected",
  EXTENDED = "extended" // When 30-day limit needs extension
}

export interface BreachRecord {
  id: string;
  detectedDate: Date;
  reportedDate: Date;
  breachType: BreachType;
  severity: BreachSeverity;
  affectedRecords: number;
  affectedUsers: string[];

  // Law 25 required fields
  caiNotified: boolean;
  caiNotificationDate?: Date;
  individualsNotified: boolean;
  individualNotificationDate?: Date;
  riskAssessment: string;
  mitigationActions: string[];

  // Documentation
  incidentReport: string;
  forensicDetails: string;
  preventionMeasures: string;
}

export enum BreachType {
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  DATA_THEFT = "data_theft",
  ACCIDENTAL_DISCLOSURE = "accidental_disclosure",
  SYSTEM_COMPROMISE = "system_compromise",
  RANSOMWARE = "ransomware",
  EMPLOYEE_ERROR = "employee_error",
  THIRD_PARTY_BREACH = "third_party_breach"
}

export enum BreachSeverity {
  LOW = "low",          // Minimal risk to individuals
  MEDIUM = "medium",    // Some risk to individuals
  HIGH = "high",        // Significant risk to individuals
  CRITICAL = "critical" // Serious injury risk (Law 25 threshold)
}

export class Law25ComplianceManager {

  /**
   * Record consent for a specific user and data types
   */
  async recordConsent(
    userId: string,
    dataTypes: DataType[],
    purposes: string[],
    granularChoices: Record<DataType, boolean>
  ): Promise<ConsentRecord> {

    const consentRecord: ConsentRecord = {
      id: crypto.randomUUID(),
      userId,
      dataTypes,
      purposes,
      consentDate: new Date(),
      version: "2024.1", // Track policy version
      lawBasis: "consent",
      granularConsent: granularChoices,
      canadianResident: true, // Assume Quebec residents
      crossBorderTransfer: false, // Will be assessed per use case
      dataRetentionAgreed: true
    };

    // Store in secure audit trail
    await this.storeConsentRecord(consentRecord);
    await this.logComplianceEvent("CONSENT_RECORDED", userId, consentRecord);

    return consentRecord;
  }

  /**
   * Handle data subject rights requests
   */
  async processDataSubjectRequest(
    userId: string,
    requestType: DataSubjectRight,
    requestDetails: string
  ): Promise<DataSubjectRightsRequest> {

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30); // Law 25: 30-day response time

    const request: DataSubjectRightsRequest = {
      id: crypto.randomUUID(),
      userId,
      requestType,
      requestDate: new Date(),
      status: RequestStatus.PENDING,
      completionDeadline: deadline,
      verificationMethod: "email_verification", // Could be enhanced
      requestDetails,
      processingNotes: []
    };

    // Auto-process certain requests
    switch (requestType) {
      case DataSubjectRight.ACCESS:
        return await this.processDataAccessRequest(request);
      case DataSubjectRight.ERASURE:
        return await this.processDataErasureRequest(request);
      case DataSubjectRight.PORTABILITY:
        return await this.processDataPortabilityRequest(request);
      default:
        // Manual processing required
        await this.queueForManualReview(request);
    }

    await this.logComplianceEvent("DATA_SUBJECT_REQUEST", userId, request);
    return request;
  }

  /**
   * Report a data breach according to Law 25 requirements
   */
  async reportBreach(
    breachType: BreachType,
    affectedUsers: string[],
    severity: BreachSeverity,
    incidentReport: string
  ): Promise<BreachRecord> {

    const breach: BreachRecord = {
      id: crypto.randomUUID(),
      detectedDate: new Date(),
      reportedDate: new Date(),
      breachType,
      severity,
      affectedRecords: affectedUsers.length,
      affectedUsers,
      caiNotified: false,
      individualsNotified: false,
      riskAssessment: this.assessBreachRisk(severity, breachType),
      mitigationActions: [],
      incidentReport,
      forensicDetails: "",
      preventionMeasures: ""
    };

    // Law 25: Immediate notification to CAI for serious breaches
    if (severity === BreachSeverity.CRITICAL || severity === BreachSeverity.HIGH) {
      await this.notifyCAI(breach);
      breach.caiNotified = true;
      breach.caiNotificationDate = new Date();
    }

    // Notify individuals if risk of serious injury
    if (this.requiresIndividualNotification(breach)) {
      await this.notifyAffectedIndividuals(breach);
      breach.individualsNotified = true;
      breach.individualNotificationDate = new Date();
    }

    await this.storeBreachRecord(breach);
    await this.logComplianceEvent("BREACH_REPORTED", "system", breach);

    return breach;
  }

  /**
   * Validate cross-border data transfer compliance
   */
  async validateCrossBorderTransfer(
    dataTypes: DataType[],
    destinationCountry: string,
    transferPurpose: string
  ): Promise<{approved: boolean, conditions?: string[], riskAssessment: string}> {

    // Law 25 requires impact assessment for cross-border transfers
    const riskAssessment = await this.assessTransferRisk(
      dataTypes,
      destinationCountry,
      transferPurpose
    );

    // For medical data, extra scrutiny required
    const containsMedicalData = dataTypes.some(type =>
      [DataType.MEDICAL_INFORMATION, DataType.SESSION_NOTES, DataType.RAMQ_INFORMATION]
        .includes(type)
    );

    if (containsMedicalData && !this.isAdequateProtectionCountry(destinationCountry)) {
      return {
        approved: false,
        riskAssessment: "Medical data transfer to non-adequate country rejected"
      };
    }

    // Add contractual safeguards for approved transfers
    const conditions = this.generateTransferConditions(dataTypes, destinationCountry);

    await this.logComplianceEvent("CROSS_BORDER_ASSESSMENT", "system", {
      dataTypes,
      destinationCountry,
      transferPurpose,
      approved: true,
      riskAssessment
    });

    return {
      approved: true,
      conditions,
      riskAssessment
    };
  }

  // Private helper methods
  private async storeConsentRecord(record: ConsentRecord): Promise<void> {
    // Implementation would store in encrypted database
    console.log("Storing consent record:", record.id);
  }

  private async storeBreachRecord(record: BreachRecord): Promise<void> {
    // Implementation would store in tamper-proof audit system
    console.log("Storing breach record:", record.id);
  }

  private async logComplianceEvent(
    eventType: string,
    userId: string,
    data: any
  ): Promise<void> {
    // Implementation creates immutable audit log entry per Quebec Law 25
    const auditEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      data: this.sanitizeAuditData(data),
      jurisdiction: 'Quebec',
      compliance: 'Law 25',
      retention: '7 years'
    };

    console.log(`Law 25 Event: ${eventType} for user ${userId}`, auditEntry);

    // In production, this would store to secure audit database
    // await this.storeAuditLog(auditEntry);
  }

  private sanitizeAuditData(data: any): any {
    // Remove sensitive data but keep audit trail information
    if (!data) return {};

    // Remove potential PHI while preserving audit context
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.ssn;
    delete sanitized.medicalRecord;

    return {
      ...sanitized,
      dataTypes: Object.keys(data),
      hasPersonalInfo: this.containsPersonalInfo(data)
    };
  }

  private containsPersonalInfo(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    const personalInfoFields = [
      'email', 'phone', 'address', 'birthdate', 'ssn',
      'medicalRecord', 'healthInfo', 'patientId'
    ];

    return personalInfoFields.some(field =>
      Object.keys(data).some(key =>
        key.toLowerCase().includes(field.toLowerCase())
      )
    );
  }

  private async processDataAccessRequest(
    request: DataSubjectRightsRequest
  ): Promise<DataSubjectRightsRequest> {
    // Implementation would gather all user data
    request.status = RequestStatus.COMPLETED;
    request.responseDate = new Date();
    return request;
  }

  private async processDataErasureRequest(
    request: DataSubjectRightsRequest
  ): Promise<DataSubjectRightsRequest> {
    // Implementation would securely delete user data
    request.status = RequestStatus.COMPLETED;
    request.responseDate = new Date();
    return request;
  }

  private async processDataPortabilityRequest(
    request: DataSubjectRightsRequest
  ): Promise<DataSubjectRightsRequest> {
    // Implementation would export user data in portable format
    request.status = RequestStatus.COMPLETED;
    request.responseDate = new Date();
    return request;
  }

  private async queueForManualReview(
    request: DataSubjectRightsRequest
  ): Promise<void> {
    // Implementation would add to manual review queue
    console.log("Queued for manual review:", request.id);
  }

  private assessBreachRisk(severity: BreachSeverity, type: BreachType): string {
    // Implementation would provide detailed risk assessment
    return `${severity} severity ${type} breach - Law 25 compliance assessment required`;
  }

  private requiresIndividualNotification(breach: BreachRecord): boolean {
    // Law 25: Notify individuals if risk of "serious injury"
    return breach.severity === BreachSeverity.CRITICAL ||
           breach.severity === BreachSeverity.HIGH;
  }

  private async notifyCAI(breach: BreachRecord): Promise<void> {
    // Implementation would send notification to Commission d'accès à l'information
    console.log("Notifying CAI of breach:", breach.id);
  }

  private async notifyAffectedIndividuals(breach: BreachRecord): Promise<void> {
    // Implementation would notify affected users
    console.log("Notifying affected individuals of breach:", breach.id);
  }

  private async assessTransferRisk(
    dataTypes: DataType[],
    country: string,
    purpose: string
  ): Promise<string> {
    // Assess transfer risk based on data types, destination, and purpose
    const isAdequateCountry = this.isAdequateProtectionCountry(country);
    const containsSensitiveData = dataTypes.some(type =>
      type === DataType.HEALTH || type === DataType.BIOMETRIC
    );

    let riskLevel = 'LOW';
    let riskFactors: string[] = [];

    // Risk assessment based on destination country
    if (!isAdequateCountry) {
      riskLevel = 'HIGH';
      riskFactors.push(`Transfer to non-adequate protection country: ${country}`);
    }

    // Risk assessment based on data sensitivity
    if (containsSensitiveData) {
      riskLevel = riskLevel === 'HIGH' ? 'CRITICAL' : 'MEDIUM';
      riskFactors.push('Contains sensitive health/biometric data');
    }

    // Risk assessment based on purpose
    const highRiskPurposes = ['marketing', 'profiling', 'research'];
    if (highRiskPurposes.some(riskPurpose => purpose.toLowerCase().includes(riskPurpose))) {
      riskLevel = riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      riskFactors.push(`High-risk processing purpose: ${purpose}`);
    }

    return `Transfer Risk Assessment: ${riskLevel}
    Data Types: ${dataTypes.join(', ')} (${dataTypes.length} types)
    Destination: ${country} (${isAdequateCountry ? 'Adequate' : 'Non-adequate'} protection)
    Purpose: ${purpose}
    Risk Factors: ${riskFactors.join('; ') || 'None identified'}
    Compliance Status: ${riskLevel === 'CRITICAL' ? 'BLOCKED - Manual approval required' : 'REQUIRES_SAFEGUARDS'}`;
  }

  private isAdequateProtectionCountry(country: string): boolean {
    // Countries with adequate data protection (similar to GDPR adequacy decisions)
    const adequateCountries = ["CA", "US", "EU", "UK", "CH", "NZ", "JP"];
    return adequateCountries.includes(country);
  }

  private generateTransferConditions(
    dataTypes: DataType[],
    country: string
  ): string[] {
    return [
      "Data must be encrypted in transit and at rest",
      "Processor must comply with Quebec Law 25 requirements",
      "Data retention limited to specified purpose",
      "Individual rights must be preserved",
      "Breach notification required within 24 hours"
    ];
  }
}

// Export singleton instance
export const law25Compliance = new Law25ComplianceManager();