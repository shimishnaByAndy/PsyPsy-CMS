// PsyPsy CMS - HIPAA Compliant Healthcare Management System
// Tauri 2.0 Main Library with Medical-Grade Security

pub mod security;

use security::{
    initialize_security, SecurityError, SecuritySession, HealthcareRole,
    auth::FirebaseAuthService,
    crypto::CryptoService,
    audit::{AuditService, log_authentication, log_phi_access},
    rbac::{RbacService, PermissionContext},
    rate_limit::{RateLimitService, RateLimitContext},
    compliance::ComplianceMonitoringService,
    validation::SanitizationService,
    DataClassification, AuditEventType, AuditOutcome,
};

use tauri::{
    command, State, AppHandle, Manager,
    generate_handler, generate_context,
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use tokio::sync::RwLock;

/// Global application state for security services
pub struct AppState {
    /// Firebase authentication service
    pub firebase_auth: Arc<RwLock<FirebaseAuthService>>,
    /// Cryptographic service
    pub crypto_service: Arc<RwLock<CryptoService>>,
    /// Audit logging service
    pub audit_service: Arc<RwLock<AuditService>>,
    /// Role-based access control service
    pub rbac_service: Arc<RwLock<RbacService>>,
    /// Rate limiting service
    pub rate_limit_service: Arc<RwLock<RateLimitService>>,
    /// Compliance monitoring service
    pub compliance_service: Arc<RwLock<ComplianceMonitoringService>>,
    /// Input sanitization service
    pub sanitization_service: Arc<RwLock<SanitizationService>>,
    /// Active user sessions
    pub active_sessions: Arc<RwLock<HashMap<String, SecuritySession>>>,
}

impl AppState {
    /// Create new application state with initialized security services
    pub async fn new() -> Result<Self, SecurityError> {
        // Initialize all security services
        let firebase_auth = Arc::new(RwLock::new(
            FirebaseAuthService::new(
                "psypsy-cms-hipaa".to_string(),
                "your-firebase-api-key".to_string(),
                b"your-jwt-secret-key-32-bytes-long",
            )
        ));
        
        let crypto_service = Arc::new(RwLock::new(CryptoService::new()));
        
        let audit_config = security::audit::AuditConfig::default();
        let audit_service = Arc::new(RwLock::new(
            AuditService::new(audit_config)?
        ));
        
        let rbac_service = Arc::new(RwLock::new(RbacService::new()));
        
        let rate_limit_config = security::rate_limit::RateLimitConfig::default();
        let rate_limit_service = Arc::new(RwLock::new(
            RateLimitService::new(rate_limit_config)
        ));
        
        let compliance_config = security::compliance::ComplianceConfig::default();
        let compliance_service = Arc::new(RwLock::new(
            ComplianceMonitoringService::new(compliance_config)
        ));
        
        let sanitization_service = Arc::new(RwLock::new(
            SanitizationService::new()?
        ));
        
        let active_sessions = Arc::new(RwLock::new(HashMap::new()));
        
        Ok(Self {
            firebase_auth,
            crypto_service,
            audit_service,
            rbac_service,
            rate_limit_service,
            compliance_service,
            sanitization_service,
            active_sessions,
        })
    }
}

/// Authentication request structure
#[derive(Debug, Serialize, Deserialize)]
pub struct AuthRequest {
    pub firebase_token: String,
    pub role: HealthcareRole,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

/// Authentication response structure
#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
    pub session_id: Option<String>,
    pub access_token: Option<String>,
    pub user_info: Option<UserInfo>,
    pub permissions: Vec<String>,
    pub error: Option<String>,
}

/// User information structure
#[derive(Debug, Serialize, Deserialize)]
pub struct UserInfo {
    pub user_id: String,
    pub email: String,
    pub display_name: Option<String>,
    pub role: HealthcareRole,
    pub email_verified: bool,
    pub mfa_enabled: bool,
}

/// Patient data request with validation
#[derive(Debug, Serialize, Deserialize)]
pub struct PatientDataRequest {
    pub patient_id: String,
    pub data_type: String,
    pub session_id: String,
}

/// Encrypted data response
#[derive(Debug, Serialize, Deserialize)]
pub struct EncryptedDataResponse {
    pub success: bool,
    pub encrypted_data: Option<String>,
    pub error: Option<String>,
}

// Tauri Commands

/// Authenticate user with Firebase and create secure session
#[command]
pub async fn authenticate_user(
    request: AuthRequest,
    state: State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<AuthResponse, String> {
    let start_time = std::time::Instant::now();
    
    // Rate limiting check
    let rate_context = RateLimitContext {
        user_id: None,
        user_role: None,
        ip_address: request.ip_address.as_ref()
            .and_then(|ip| ip.parse().ok())
            .unwrap_or("127.0.0.1".parse().unwrap()),
        endpoint: "/api/auth/login".to_string(),
        method: "POST".to_string(),
        user_agent: request.user_agent.clone(),
        session_id: None,
        accesses_phi: false,
        is_data_export: false,
        mfa_verified: false,
        timestamp: Utc::now(),
    };
    
    let rate_result = state.rate_limit_service.read().await.check_rate_limit(rate_context).await;
    if !rate_result.allowed {
        // Log failed authentication attempt
        let _ = log_authentication(
            &*state.audit_service.read().await,
            None,
            AuditEventType::LoginFailed,
            AuditOutcome::Blocked,
            request.ip_address.clone(),
            request.user_agent.clone(),
        ).await;
        
        return Err("Rate limit exceeded".to_string());
    }
    
    // Authenticate with Firebase
    let firebase_user = match state.firebase_auth.read().await
        .authenticate_with_firebase(&request.firebase_token).await {
        Ok(user) => user,
        Err(e) => {
            // Log failed authentication
            let _ = log_authentication(
                &*state.audit_service.read().await,
                None,
                AuditEventType::LoginFailed,
                AuditOutcome::Failure,
                request.ip_address.clone(),
                request.user_agent.clone(),
            ).await;
            
            return Err(format!("Authentication failed: {:?}", e));
        }
    };
    
    // Create secure session
    let session = match state.firebase_auth.read().await
        .create_session(&firebase_user, request.role.clone(), request.ip_address.clone(), request.user_agent.clone()).await {
        Ok(session) => session,
        Err(e) => {
            return Err(format!("Session creation failed: {:?}", e));
        }
    };
    
    // Store session
    state.active_sessions.write().await.insert(session.session_id.to_string(), session.clone());
    
    // Log successful authentication
    let _ = log_authentication(
        &*state.audit_service.read().await,
        Some(session.user_id),
        AuditEventType::UserLogin,
        AuditOutcome::Success,
        request.ip_address.clone(),
        request.user_agent.clone(),
    ).await;
    
    log::info!("User authenticated successfully: {} ({}ms)", 
        firebase_user.email, start_time.elapsed().as_millis());
    
    Ok(AuthResponse {
        success: true,
        session_id: Some(session.session_id.to_string()),
        access_token: Some(session.access_token.clone()),
        user_info: Some(UserInfo {
            user_id: firebase_user.uid,
            email: firebase_user.email,
            display_name: firebase_user.display_name,
            role: session.role,
            email_verified: firebase_user.email_verified,
            mfa_enabled: session.mfa_verified,
        }),
        permissions: session.permissions,
        error: None,
    })
}

/// Logout user and terminate session
#[command]
pub async fn logout_user(
    session_id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    if let Some(session) = state.active_sessions.write().await.remove(&session_id) {
        // End Firebase session
        let _ = state.firebase_auth.read().await.end_session(&session_id).await;
        
        // Log logout event
        let _ = log_authentication(
            &*state.audit_service.read().await,
            Some(session.user_id),
            AuditEventType::UserLogout,
            AuditOutcome::Success,
            session.ip_address.clone(),
            session.user_agent.clone(),
        ).await;
        
        log::info!("User logged out: {}", session.user_id);
        Ok(true)
    } else {
        Err("Session not found".to_string())
    }
}

/// Access patient data with full HIPAA compliance
#[command]
pub async fn access_patient_data(
    request: PatientDataRequest,
    state: State<'_, AppState>,
) -> Result<EncryptedDataResponse, String> {
    // Validate session
    let session = match state.active_sessions.read().await.get(&request.session_id) {
        Some(session) => session.clone(),
        None => return Err("Invalid session".to_string()),
    };
    
    // Check session validity
    if !session.is_valid() {
        return Err("Session expired".to_string());
    }
    
    // Parse patient ID
    let patient_id = match Uuid::parse_str(&request.patient_id) {
        Ok(id) => id,
        Err(_) => return Err("Invalid patient ID".to_string()),
    };
    
    // Check permissions
    let permission_context = PermissionContext {
        user_id: session.user_id,
        role: session.role.clone(),
        permission: security::rbac::Permission::ViewPHI,
        resource_id: Some(request.data_type.clone()),
        patient_id: Some(patient_id),
        ip_address: session.ip_address.clone(),
        timestamp: Utc::now(),
        session_id: request.session_id.clone(),
        mfa_verified: session.mfa_verified,
        metadata: HashMap::new(),
    };
    
    let permission_result = match state.rbac_service.read().await
        .check_permission(permission_context).await {
        Ok(result) => result,
        Err(e) => return Err(format!("Permission check failed: {:?}", e)),
    };
    
    if !permission_result.granted {
        // Log denied access attempt
        let _ = log_phi_access(
            &*state.audit_service.read().await,
            session.user_id,
            patient_id,
            "access_patient_data",
            AuditOutcome::Denied,
            request.session_id.clone(),
        ).await;
        
        return Err(format!("Access denied: {:?}", permission_result.denial_reason));
    }
    
    // Check MFA requirement for PHI access
    if permission_result.mfa_required && !session.mfa_verified {
        return Err("Multi-factor authentication required for PHI access".to_string());
    }
    
    // Rate limiting for PHI access
    let rate_context = RateLimitContext {
        user_id: Some(session.user_id),
        user_role: Some(session.role.clone()),
        ip_address: session.ip_address.as_ref()
            .and_then(|ip| ip.parse().ok())
            .unwrap_or("127.0.0.1".parse().unwrap()),
        endpoint: "/api/patients/data".to_string(),
        method: "GET".to_string(),
        user_agent: session.user_agent.clone(),
        session_id: Some(request.session_id.clone()),
        accesses_phi: true,
        is_data_export: false,
        mfa_verified: session.mfa_verified,
        timestamp: Utc::now(),
    };
    
    let rate_result = state.rate_limit_service.read().await.check_rate_limit(rate_context).await;
    if !rate_result.allowed {
        return Err("Rate limit exceeded for PHI access".to_string());
    }
    
    // Simulate fetching patient data (in production, would fetch from database)
    let patient_data = format!(
        r#"{{
            "patient_id": "{}",
            "data_type": "{}",
            "sensitive_info": "This is protected health information",
            "timestamp": "{}"
        }}"#,
        request.patient_id,
        request.data_type,
        Utc::now().to_rfc3339()
    );
    
    // Encrypt the data
    let encrypted_data = match state.crypto_service.read().await
        .encrypt(patient_data.as_bytes(), DataClassification::PHI, None).await {
        Ok(data) => data,
        Err(e) => return Err(format!("Encryption failed: {:?}", e)),
    };
    
    // Log PHI access
    let _ = log_phi_access(
        &*state.audit_service.read().await,
        session.user_id,
        patient_id,
        "access_patient_data",
        AuditOutcome::Success,
        request.session_id.clone(),
    ).await;
    
    log::info!("PHI data accessed: patient {} by user {}", patient_id, session.user_id);
    
    Ok(EncryptedDataResponse {
        success: true,
        encrypted_data: Some(serde_json::to_string(&encrypted_data).unwrap()),
        error: None,
    })
}

/// Validate user session
#[command]
pub async fn validate_session(
    session_id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    if let Some(session) = state.active_sessions.read().await.get(&session_id) {
        Ok(session.is_valid())
    } else {
        Ok(false)
    }
}

/// Get compliance dashboard data
#[command]
pub async fn get_compliance_dashboard(
    session_id: String,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    // Validate session and permissions
    let session = match state.active_sessions.read().await.get(&session_id) {
        Some(session) => session.clone(),
        None => return Err("Invalid session".to_string()),
    };
    
    // Check if user has audit access permission
    let permission_context = PermissionContext {
        user_id: session.user_id,
        role: session.role.clone(),
        permission: security::rbac::Permission::ViewAuditLogs,
        resource_id: None,
        patient_id: None,
        ip_address: session.ip_address.clone(),
        timestamp: Utc::now(),
        session_id,
        mfa_verified: session.mfa_verified,
        metadata: HashMap::new(),
    };
    
    let permission_result = match state.rbac_service.read().await
        .check_permission(permission_context).await {
        Ok(result) => result,
        Err(e) => return Err(format!("Permission check failed: {:?}", e)),
    };
    
    if !permission_result.granted {
        return Err("Access denied to compliance dashboard".to_string());
    }
    
    // Get compliance dashboard data
    let dashboard = state.compliance_service.read().await.get_compliance_dashboard();
    
    Ok(serde_json::to_value(dashboard).unwrap())
}

/// Initialize application with security services
pub async fn initialize_app() -> Result<AppState, SecurityError> {
    log::info!("Initializing PsyPsy CMS with HIPAA compliance...");
    
    // Initialize security subsystem
    initialize_security().await?;
    
    // Create application state
    let app_state = AppState::new().await?;
    
    log::info!("PsyPsy CMS initialized successfully with medical-grade security");
    
    Ok(app_state)
}

/// Main application entry point
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging
    env_logger::init();
    
    tauri::Builder::default()
        .setup(|app| {
            // Initialize application state
            let rt = tokio::runtime::Runtime::new().unwrap();
            let app_state = rt.block_on(async {
                initialize_app().await.expect("Failed to initialize application")
            });
            
            app.manage(app_state);
            
            log::info!("PsyPsy CMS Tauri application started");
            Ok(())
        })
        .invoke_handler(generate_handler![
            authenticate_user,
            logout_user,
            access_patient_data,
            validate_session,
            get_compliance_dashboard,
        ])
        .run(generate_context!())
        .expect("Error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_app_state_creation() {
        let app_state = AppState::new().await.unwrap();
        assert!(app_state.active_sessions.read().await.is_empty());
    }
    
    #[tokio::test]
    async fn test_authentication_flow() {
        let app_state = AppState::new().await.unwrap();
        
        // Test authentication request structure
        let auth_request = AuthRequest {
            firebase_token: "test_token".to_string(),
            role: HealthcareRole::HealthcareProvider,
            ip_address: Some("192.168.1.100".to_string()),
            user_agent: Some("PsyPsy CMS Test".to_string()),
        };
        
        // Verify request structure
        assert_eq!(auth_request.role, HealthcareRole::HealthcareProvider);
        assert!(auth_request.ip_address.is_some());
    }
}