// Services using sqlx are temporarily commented out to resolve dependency conflicts
// pub mod firebase_service;  // Commented out temporarily for compilation
pub mod firebase_service_simple;
// pub mod offline_service;  // Uses sqlx - temporarily disabled
pub mod encrypted_storage;
pub mod offline_sync;
// pub mod quebec_audit_service;  // Uses sqlx - temporarily disabled
// pub mod notification_service;  // Uses sqlx - temporarily disabled
// pub mod quebec_compliance_service;  // Uses sqlx - temporarily disabled
// pub mod vertex_ai_service;  // Uses sqlx - temporarily disabled
// pub mod gcp_security_service;  // Uses sqlx - temporarily disabled
// pub mod dlp_service;  // Uses sqlx - temporarily disabled
// pub mod firebase_cmek_service;  // Uses sqlx - temporarily disabled
// pub mod social_media_service;  // Uses sqlx - temporarily disabled
// pub mod compliance_validation_service;  // Uses sqlx - temporarily disabled

// Use simple Firebase service for initial compilation
pub use firebase_service_simple::FirebaseService;
// pub use offline_service::OfflineService;
// pub use quebec_audit_service::QuebecAuditService;
// pub use notification_service::NotificationService;
// pub use quebec_compliance_service::QuebecComplianceService;
// pub use vertex_ai_service::VertexAIService;
// pub use gcp_security_service::GCPSecurityService;
// pub use dlp_service::DLPService;
// pub use firebase_cmek_service::FirebaseCMEKService;
// pub use social_media_service::SocialMediaService;
// pub use compliance_validation_service::ComplianceValidationService;