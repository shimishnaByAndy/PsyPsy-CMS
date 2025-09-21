// HIPAA Compliant Security Module for PsyPsy CMS
// Implements medical-grade security measures including AES-256-GCM encryption,
// role-based access control, comprehensive audit trails, and HIPAA compliance

// Allow dead code for comprehensive healthcare security architecture
#![allow(dead_code)]

pub mod auth;
pub mod crypto;
pub mod audit;
pub mod rbac;
pub mod rate_limit;
pub mod validation;
pub mod compliance;

use serde::{Deserialize, Serialize};
use std::fmt;
use thiserror::Error;
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// HIPAA Security Error Types
#[derive(Error, Debug, Clone, Serialize, Deserialize)]
pub enum SecurityError {
    #[error("Authentication failed: {reason}")]
    AuthenticationFailed { reason: String },
    #[error("Authorization denied: {reason}")]
    AuthorizationDenied { reason: String },
    #[error("Encryption error: {reason}")]
    EncryptionError { reason: String },
    #[error("Audit log error: {reason}")]
    AuditError { reason: String },
    #[error("Rate limit exceeded: {reason}")]
    RateLimitExceeded { reason: String },
    #[error("Input validation failed: {reason}")]
    ValidationFailed { reason: String },
    #[error("HIPAA compliance violation: {reason}")]
    ComplianceViolation { reason: String },
    #[error("Session expired at {expired_at}: {reason}")]
    SessionExpired { expired_at: DateTime<Utc>, reason: String },
    #[error("Invalid token: {reason}")]
    InvalidToken { reason: String },
    #[error("MFA required: {reason}")]
    MfaRequired { reason: String },
    #[error("Cryptographic operation failed: {reason}")]
    CryptographicError { reason: String },
    #[error("Configuration error: {reason}")]
    ConfigurationError { reason: String },
    #[error("Resource not found: {reason}")]
    NotFound { reason: String },
    #[error("Access denied: {reason}")]
    AccessDenied { reason: String },
    #[error("Cryptographic operation failed: {reason}")]
    CryptoOperationFailed { reason: String },
    #[error("Decryption failed: {reason}")]
    DecryptionFailed { reason: String },
    #[error("Encryption failed: {reason}")]
    EncryptionFailed { reason: String },
    #[error("HIPAA violation: {reason}")]
    HipaaViolation { reason: String },
    #[error("Audit log failed: {reason}")]
    AuditLogFailed { reason: String },
}

/// Data classification levels for HIPAA compliance
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DataClassification {
    /// Public data that can be freely shared
    Public,
    /// Internal data for organization use only
    Internal,
    /// Confidential data requiring protection
    Confidential,
    /// Protected Health Information (PHI) under HIPAA
    Phi,
    /// Highly sensitive medical data requiring maximum protection
    MedicalSensitive,
}

impl DataClassification {
    /// Get encryption requirements for data classification
    pub fn encryption_requirements(&self) -> EncryptionLevel {
        match self {
            DataClassification::Public => EncryptionLevel::None,
            DataClassification::Internal => EncryptionLevel::Standard,
            DataClassification::Confidential => EncryptionLevel::Strong,
            DataClassification::Phi => EncryptionLevel::Medical,
            DataClassification::MedicalSensitive => EncryptionLevel::Maximum,
        }
    }

    /// Check if this classification requires audit logging
    pub fn requires_audit(&self) -> bool {
        matches!(self, DataClassification::Phi | DataClassification::MedicalSensitive | DataClassification::Confidential)
    }
}

/// Encryption levels matching data classification requirements
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EncryptionLevel {
    None,
    Standard,   // AES-128
    Strong,     // AES-256
    Medical,    // AES-256-GCM with PBKDF2
    Maximum,    // Layered encryption with ChaCha20-Poly1305 + AES-256-GCM
}

/// Healthcare role types for Quebec healthcare system
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum HealthcareRole {
    SuperAdmin,
    Administrator, // Added missing variant for authentication mapping
    HealthcareProvider,
    AdminStaff,
    AdministrativeStaff, // Alias for AdminStaff
    BillingStaff,
    Patient,
    Guardian,
    EmergencyContact,
    ReadOnlyAccess,
    TechnicalSupport,
    Auditor,
    Guest,
}

impl fmt::Display for HealthcareRole {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            HealthcareRole::SuperAdmin => write!(f, "Super Administrator"),
            HealthcareRole::Administrator => write!(f, "Administrator"),
            HealthcareRole::HealthcareProvider => write!(f, "Healthcare Provider"),
            HealthcareRole::AdminStaff => write!(f, "Administrative Staff"),
            HealthcareRole::AdministrativeStaff => write!(f, "Administrative Staff"),
            HealthcareRole::BillingStaff => write!(f, "Billing Staff"),
            HealthcareRole::Patient => write!(f, "Patient"),
            HealthcareRole::Guardian => write!(f, "Guardian"),
            HealthcareRole::EmergencyContact => write!(f, "Emergency Contact"),
            HealthcareRole::ReadOnlyAccess => write!(f, "Read-Only Access"),
            HealthcareRole::TechnicalSupport => write!(f, "Technical Support"),
            HealthcareRole::Auditor => write!(f, "Auditor"),
            HealthcareRole::Guest => write!(f, "Guest"),
        }
    }
}

/// Security session information for HIPAA audit trails
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecuritySession {
    pub session_id: Uuid,
    pub user_id: Uuid,
    pub role: HealthcareRole,
    pub access_token: String,
    pub refresh_token: String,
    pub created_at: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub location: Option<String>,
    pub is_elevated: bool,
    pub mfa_verified: bool,
    pub permissions: Vec<String>,
    pub data_access_level: DataClassification,
    pub security_metadata: serde_json::Value,
}

impl SecuritySession {
    /// Check if session is still valid
    pub fn is_valid(&self) -> bool {
        let now = Utc::now();
        let session_timeout = chrono::Duration::hours(8); // 8-hour sessions for healthcare
        now.signed_duration_since(self.last_activity) < session_timeout
    }

    /// Check if MFA is required for a specific action
    pub fn requires_mfa(&self, action: &str) -> bool {
        // High-risk actions always require MFA
        let high_risk_actions = ["delete_patient", "export_phi", "modify_audit_log", "admin_override"];
        high_risk_actions.contains(&action) || matches!(self.role, HealthcareRole::SuperAdmin)
    }

    /// Update last activity timestamp
    pub fn update_activity(&mut self) {
        self.last_activity = Utc::now();
    }

    /// Check if session has specific permission
    pub fn has_permission(&self, permission: &str) -> bool {
        self.permissions.contains(&permission.to_string())
    }
}

/// Security configuration for the application
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub jwt_secret: String,
    pub jwt_expiry_seconds: i64,
    pub session_timeout_hours: u64,
    pub mfa_required_for_admin: bool,
    pub audit_log_path: String,
    pub encryption_key_rotation_days: u32,
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            jwt_secret: "default-dev-secret-change-in-production".to_string(),
            jwt_expiry_seconds: 3600, // 1 hour
            session_timeout_hours: 8,
            mfa_required_for_admin: true,
            audit_log_path: "./logs/audit.log".to_string(),
            encryption_key_rotation_days: 90,
        }
    }
}

/// Audit event types for healthcare compliance
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AuditEventType {
    Authentication,
    Authorization,
    DataAccess,
    DataModification,
    DataDeletion,
    DataExport,
    AdminAction,
    SecurityViolation,
    SecurityViolationDetected,
    IntrusionAttempt,
    SystemEvent,
    SystemStartup,
    ComplianceEvent,
    PatientDataViewed,
    PatientDataModified,
    PatientDataDeleted,
    PatientDataExported,
    PatientDataCreated,
    LoginFailed,
    UserLogin,
}

/// Initialize security subsystem
pub async fn initialize_security() -> Result<(), SecurityError> {
    log::info!("Initializing HIPAA-compliant security subsystem...");

    // Initialize crypto system
    crypto::initialize_crypto_system().await
        .map_err(|e| SecurityError::ConfigurationError { reason: format!("Crypto initialization failed: {}", e) })?;

    // Initialize audit system
    audit::initialize_audit_system().await
        .map_err(|e| SecurityError::ConfigurationError { reason: format!("Audit initialization failed: {}", e) })?;

    // Initialize RBAC system
    rbac::initialize_rbac_system().await
        .map_err(|e| SecurityError::ConfigurationError { reason: format!("RBAC initialization failed: {}", e) })?;

    // Initialize rate limiting
    rate_limit::initialize_rate_limiter().await
        .map_err(|e| SecurityError::ConfigurationError { reason: format!("Rate limiter initialization failed: {}", e) })?;

    // Initialize HIPAA monitoring
    compliance::initialize_hipaa_monitoring().await
        .map_err(|e| SecurityError::ConfigurationError { reason: format!("HIPAA monitoring initialization failed: {}", e) })?;

    log::info!("HIPAA-compliant security subsystem initialized successfully");
    Ok(())
}