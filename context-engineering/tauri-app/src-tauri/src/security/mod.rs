// HIPAA Compliant Security Module for PsyPsy CMS
// Implements medical-grade security measures including AES-256-GCM encryption,
// role-based access control, comprehensive audit trails, and HIPAA compliance

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
    
    #[error("Authorization denied: {action} not permitted for role {role}")]
    AuthorizationDenied { action: String, role: String },
    
    #[error("Encryption error: {message}")]
    EncryptionFailed { message: String },
    
    #[error("Decryption error: {message}")]
    DecryptionFailed { message: String },
    
    #[error("Rate limit exceeded: {limit} requests per {window}")]
    RateLimitExceeded { limit: u32, window: String },
    
    #[error("Audit log error: {message}")]
    AuditLogFailed { message: String },
    
    #[error("HIPAA compliance violation: {violation}")]
    HipaaViolation { violation: String },
    
    #[error("Data validation failed: {field} - {reason}")]
    ValidationFailed { field: String, reason: String },
    
    #[error("Session expired at {expired_at}")]
    SessionExpired { expired_at: DateTime<Utc> },
    
    #[error("Invalid JWT token: {reason}")]
    InvalidToken { reason: String },
    
    #[error("Cryptographic operation failed: {operation}")]
    CryptoOperationFailed { operation: String },
}

/// Healthcare-specific user roles following HIPAA guidelines
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Hash)]
pub enum HealthcareRole {
    /// System administrator with full access
    SuperAdmin,
    /// Healthcare provider with patient access
    HealthcareProvider,
    /// Administrative staff with limited access
    AdministrativeStaff,
    /// Billing and insurance staff
    BillingStaff,
    /// IT support with system access but no PHI
    TechnicalSupport,
    /// Auditor with read-only access for compliance
    Auditor,
    /// Patient with access to own records only
    Patient,
    /// Guest with minimal access
    Guest,
}

impl fmt::Display for HealthcareRole {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            HealthcareRole::SuperAdmin => write!(f, "Super Administrator"),
            HealthcareRole::HealthcareProvider => write!(f, "Healthcare Provider"),
            HealthcareRole::AdministrativeStaff => write!(f, "Administrative Staff"),
            HealthcareRole::BillingStaff => write!(f, "Billing Staff"),
            HealthcareRole::TechnicalSupport => write!(f, "Technical Support"),
            HealthcareRole::Auditor => write!(f, "Auditor"),
            HealthcareRole::Patient => write!(f, "Patient"),
            HealthcareRole::Guest => write!(f, "Guest"),
        }
    }
}

/// HIPAA-compliant user session with comprehensive tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecuritySession {
    /// Unique session identifier
    pub session_id: Uuid,
    /// User identifier
    pub user_id: Uuid,
    /// User's healthcare role
    pub role: HealthcareRole,
    /// JWT access token
    pub access_token: String,
    /// JWT refresh token (encrypted)
    pub refresh_token: String,
    /// Session creation timestamp
    pub created_at: DateTime<Utc>,
    /// Last activity timestamp
    pub last_activity: DateTime<Utc>,
    /// Session expiration timestamp
    pub expires_at: DateTime<Utc>,
    /// IP address of the session
    pub ip_address: Option<String>,
    /// User agent information
    pub user_agent: Option<String>,
    /// Location information for audit (if available)
    pub location: Option<String>,
    /// Whether this session has elevated privileges
    pub is_elevated: bool,
    /// MFA verification status
    pub mfa_verified: bool,
    /// Permissions granted to this session
    pub permissions: Vec<String>,
    /// Additional security metadata
    pub security_metadata: serde_json::Value,
}

impl SecuritySession {
    /// Check if session is still valid
    pub fn is_valid(&self) -> bool {
        let now = Utc::now();
        now < self.expires_at
    }
    
    /// Check if session requires MFA for sensitive operations
    pub fn requires_mfa(&self, action: &str) -> bool {
        match action {
            "view_phi" | "modify_phi" | "export_data" | "delete_patient" => true,
            _ => false,
        }
    }
    
    /// Update last activity timestamp
    pub fn update_activity(&mut self) {
        self.last_activity = Utc::now();
    }
    
    /// Check if user has specific permission
    pub fn has_permission(&self, permission: &str) -> bool {
        self.permissions.contains(&permission.to_string())
    }
}

/// Medical data classification levels for encryption
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DataClassification {
    /// Public information (no encryption required)
    Public,
    /// Internal company data (standard encryption)
    Internal,
    /// Confidential business data (enhanced encryption)
    Confidential,
    /// Protected Health Information - HIPAA regulated (maximum encryption)
    PHI,
    /// Highly sensitive medical data (maximum encryption + additional controls)
    HighlySensitivePHI,
}

impl DataClassification {
    /// Get encryption requirements for data classification
    pub fn encryption_requirements(&self) -> EncryptionLevel {
        match self {
            DataClassification::Public => EncryptionLevel::None,
            DataClassification::Internal => EncryptionLevel::Standard,
            DataClassification::Confidential => EncryptionLevel::Enhanced,
            DataClassification::PHI => EncryptionLevel::Medical,
            DataClassification::HighlySensitivePHI => EncryptionLevel::Maximum,
        }
    }
    
    /// Check if data requires audit logging
    pub fn requires_audit(&self) -> bool {
        matches!(self, 
            DataClassification::Confidential |
            DataClassification::PHI |
            DataClassification::HighlySensitivePHI
        )
    }
}

/// Encryption levels corresponding to data classifications
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum EncryptionLevel {
    /// No encryption required
    None,
    /// AES-128-GCM standard encryption
    Standard,
    /// AES-256-GCM enhanced encryption
    Enhanced,
    /// AES-256-GCM with additional key derivation (medical grade)
    Medical,
    /// ChaCha20-Poly1305 + AES-256-GCM layered encryption (maximum security)
    Maximum,
}

/// HIPAA audit event types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditEventType {
    // Authentication Events
    UserLogin,
    UserLogout,
    LoginFailed,
    PasswordChanged,
    MFAEnabled,
    MFADisabled,
    
    // Authorization Events
    AccessGranted,
    AccessDenied,
    PermissionChanged,
    RoleChanged,
    
    // Data Access Events
    PatientDataViewed,
    PatientDataModified,
    PatientDataDeleted,
    PatientDataExported,
    PatientDataCreated,
    
    // System Events
    SystemStartup,
    SystemShutdown,
    ConfigurationChanged,
    BackupCreated,
    BackupRestored,
    
    // Security Events
    SecurityViolationDetected,
    EncryptionKeyRotated,
    IntrusionAttempt,
    AnomalousActivity,
    
    // Administrative Events
    UserCreated,
    UserDeactivated,
    UserReactivated,
    AdminActionPerformed,
}

/// Initialize security subsystem with HIPAA compliance
pub async fn initialize_security() -> Result<(), SecurityError> {
    // Initialize cryptographic systems
    crypto::initialize_crypto_system().await?;
    
    // Initialize audit logging
    audit::initialize_audit_system().await?;
    
    // Initialize rate limiting
    rate_limit::initialize_rate_limiter().await?;
    
    // Initialize RBAC system
    rbac::initialize_rbac_system().await?;
    
    // Initialize HIPAA compliance monitoring
    compliance::initialize_hipaa_monitoring().await?;
    
    log::info!("HIPAA-compliant security system initialized successfully");
    Ok(())
}

/// Security configuration for HIPAA compliance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    /// JWT token expiration time in seconds (default: 15 minutes)
    pub jwt_expiry_seconds: i64,
    /// Refresh token expiration time in seconds (default: 7 days)
    pub refresh_token_expiry_seconds: i64,
    /// Maximum failed login attempts before account lockout
    pub max_failed_logins: u32,
    /// Account lockout duration in seconds
    pub lockout_duration_seconds: i64,
    /// Password minimum length
    pub password_min_length: usize,
    /// Password complexity requirements
    pub password_require_uppercase: bool,
    pub password_require_lowercase: bool,
    pub password_require_numbers: bool,
    pub password_require_symbols: bool,
    /// MFA requirement for sensitive operations
    pub mfa_required_for_phi: bool,
    /// Session timeout for inactivity (seconds)
    pub session_timeout_seconds: i64,
    /// Audit log retention period (days)
    pub audit_retention_days: u32,
    /// Encryption key rotation interval (days)
    pub key_rotation_interval_days: u32,
    /// Rate limiting configuration
    pub rate_limit_requests_per_minute: u32,
    /// HIPAA compliance mode
    pub hipaa_compliance_enabled: bool,
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            jwt_expiry_seconds: 900,        // 15 minutes
            refresh_token_expiry_seconds: 604800, // 7 days
            max_failed_logins: 5,
            lockout_duration_seconds: 1800, // 30 minutes
            password_min_length: 12,        // HIPAA recommendation
            password_require_uppercase: true,
            password_require_lowercase: true,
            password_require_numbers: true,
            password_require_symbols: true,
            mfa_required_for_phi: true,
            session_timeout_seconds: 1800,  // 30 minutes
            audit_retention_days: 2555,     // 7 years (HIPAA requirement)
            key_rotation_interval_days: 90, // Quarterly rotation
            rate_limit_requests_per_minute: 60,
            hipaa_compliance_enabled: true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_healthcare_role_display() {
        assert_eq!(HealthcareRole::SuperAdmin.to_string(), "Super Administrator");
        assert_eq!(HealthcareRole::HealthcareProvider.to_string(), "Healthcare Provider");
        assert_eq!(HealthcareRole::Patient.to_string(), "Patient");
    }
    
    #[test]
    fn test_data_classification_encryption_requirements() {
        assert_eq!(DataClassification::Public.encryption_requirements(), EncryptionLevel::None);
        assert_eq!(DataClassification::PHI.encryption_requirements(), EncryptionLevel::Medical);
        assert_eq!(DataClassification::HighlySensitivePHI.encryption_requirements(), EncryptionLevel::Maximum);
    }
    
    #[test]
    fn test_session_validation() {
        let mut session = SecuritySession {
            session_id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            role: HealthcareRole::HealthcareProvider,
            access_token: "test_token".to_string(),
            refresh_token: "test_refresh".to_string(),
            created_at: Utc::now(),
            last_activity: Utc::now(),
            expires_at: Utc::now() + chrono::Duration::hours(1),
            ip_address: Some("127.0.0.1".to_string()),
            user_agent: Some("PsyPsy CMS".to_string()),
            location: None,
            is_elevated: false,
            mfa_verified: true,
            permissions: vec!["view_phi".to_string()],
            security_metadata: serde_json::json!({}),
        };
        
        assert!(session.is_valid());
        assert!(session.requires_mfa("view_phi"));
        assert!(session.has_permission("view_phi"));
        assert!(!session.has_permission("delete_patient"));
    }
}