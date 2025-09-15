// pub mod firebase_service;  // Commented out temporarily for compilation
pub mod firebase_service_simple;
pub mod offline_service;
pub mod quebec_audit_service;
pub mod notification_service;
pub mod quebec_compliance_service;
pub mod vertex_ai_service;
pub mod gcp_security_service;
pub mod dlp_service;
pub mod firebase_cmek_service;
pub mod social_media_service;
pub mod compliance_validation_service;

// Use simple Firebase service for initial compilation
pub use firebase_service_simple::FirebaseService;
pub use offline_service::OfflineService;
pub use quebec_audit_service::QuebecAuditService;
pub use notification_service::NotificationService;
pub use quebec_compliance_service::QuebecComplianceService;
pub use vertex_ai_service::VertexAIService;
pub use gcp_security_service::GCPSecurityService;
pub use dlp_service::DLPService;
pub use firebase_cmek_service::FirebaseCMEKService;
pub use social_media_service::SocialMediaService;
pub use compliance_validation_service::ComplianceValidationService;