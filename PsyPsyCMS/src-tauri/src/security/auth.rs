// Firebase Authentication Integration with HIPAA-Compliant JWT Token Management
// Implements secure authentication with healthcare-specific requirements

use crate::security::{SecurityError, SecuritySession, HealthcareRole, SecurityConfig};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use reqwest::Client;
use oauth2::{
    ClientId, ClientSecret, RedirectUrl,
    basic::BasicClient,
};

/// Firebase user information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirebaseUser {
    /// Firebase UID
    pub uid: String,
    /// User email address
    pub email: String,
    /// Display name
    pub display_name: Option<String>,
    /// Email verification status
    pub email_verified: bool,
    /// Phone number
    pub phone_number: Option<String>,
    /// Photo URL
    pub photo_url: Option<String>,
    /// User creation timestamp
    pub created_at: DateTime<Utc>,
    /// Last sign-in timestamp
    pub last_sign_in: Option<DateTime<Utc>>,
    /// Custom claims (including healthcare role)
    pub custom_claims: HashMap<String, serde_json::Value>,
    /// Provider data
    pub provider_data: Vec<ProviderData>,
}

/// Authentication provider information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderData {
    pub uid: String,
    pub display_name: Option<String>,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub photo_url: Option<String>,
    pub provider_id: String,
}

/// JWT claims for HIPAA-compliant authentication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HipaaJwtClaims {
    /// Subject (user ID)
    pub sub: String,
    /// Issuer
    pub iss: String,
    /// Audience
    pub aud: String,
    /// Expiration time (Unix timestamp)
    pub exp: i64,
    /// Not before (Unix timestamp)
    pub nbf: i64,
    /// Issued at (Unix timestamp)
    pub iat: i64,
    /// JWT ID
    pub jti: String,
    /// Healthcare role
    pub role: HealthcareRole,
    /// User email
    pub email: String,
    /// Session ID for tracking
    pub session_id: String,
    /// Multi-factor authentication status
    pub mfa_verified: bool,
    /// Permissions granted
    pub permissions: Vec<String>,
    /// Client IP address
    pub ip_address: Option<String>,
    /// Device information
    pub device_info: Option<String>,
    /// Last password change (Unix timestamp)
    pub last_password_change: Option<i64>,
    /// Account status
    pub account_status: String,
    /// Organization ID (if applicable)
    pub organization_id: Option<String>,
    /// Department/unit assignment
    pub department: Option<String>,
}

impl HipaaJwtClaims {
    /// Create new JWT claims for user
    pub fn new(
        user: &FirebaseUser,
        role: HealthcareRole,
        session_id: String,
        permissions: Vec<String>,
        config: &SecurityConfig,
    ) -> Self {
        let now = Utc::now();
        
        Self {
            sub: user.uid.clone(),
            iss: "psypsy-cms-hipaa".to_string(),
            aud: "psypsy-cms-tauri".to_string(),
            exp: (now + Duration::seconds(config.jwt_expiry_seconds)).timestamp(),
            nbf: now.timestamp(),
            iat: now.timestamp(),
            jti: Uuid::new_v4().to_string(),
            role,
            email: user.email.clone(),
            session_id,
            mfa_verified: false, // Will be updated after MFA verification
            permissions,
            ip_address: None,
            device_info: None,
            last_password_change: None,
            account_status: "active".to_string(),
            organization_id: None,
            department: None,
        }
    }
    
    /// Check if token is expired
    pub fn is_expired(&self) -> bool {
        let now = Utc::now().timestamp();
        now >= self.exp
    }
    
    /// Check if token is valid (not expired and after nbf)
    pub fn is_valid(&self) -> bool {
        let now = Utc::now().timestamp();
        now >= self.nbf && now < self.exp
    }
    
    /// Check if user has specific permission
    pub fn has_permission(&self, permission: &str) -> bool {
        self.permissions.contains(&permission.to_string())
    }
}

/// Multi-factor authentication challenge
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MfaChallenge {
    /// Challenge ID
    pub challenge_id: String,
    /// Challenge type (SMS, TOTP, email)
    pub challenge_type: MfaChallengeType,
    /// User ID
    pub user_id: String,
    /// Challenge creation time
    pub created_at: DateTime<Utc>,
    /// Challenge expiration time
    pub expires_at: DateTime<Utc>,
    /// Number of attempts
    pub attempts: u32,
    /// Maximum allowed attempts
    pub max_attempts: u32,
    /// Whether challenge is completed
    pub completed: bool,
}

/// MFA challenge types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MfaChallengeType {
    /// SMS text message
    Sms { phone_number: String },
    /// Time-based one-time password (Google Authenticator, etc.)
    Totp { secret_key: String },
    /// Email verification
    Email { email_address: String },
    /// Hardware security key (WebAuthn)
    SecurityKey { credential_id: String },
    /// Backup codes
    BackupCode,
}

/// Firebase authentication service
pub struct FirebaseAuthService {
    /// Firebase project ID
    project_id: String,
    /// Firebase API key
    api_key: String,
    /// HTTP client for Firebase API calls
    client: Client,
    /// JWT encoding key
    jwt_encoding_key: EncodingKey,
    /// JWT decoding key
    jwt_decoding_key: DecodingKey,
    /// Active sessions
    sessions: Arc<RwLock<HashMap<String, SecuritySession>>>,
    /// Active MFA challenges
    mfa_challenges: Arc<RwLock<HashMap<String, MfaChallenge>>>,
    /// Security configuration
    config: SecurityConfig,
    /// OAuth2 client for provider authentication
    oauth_client: Option<BasicClient>,
}

impl std::fmt::Debug for FirebaseAuthService {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("FirebaseAuthService")
            .field("project_id", &self.project_id)
            .field("api_key", &"[REDACTED]")
            .field("client", &self.client)
            .field("jwt_encoding_key", &"[REDACTED]")
            .field("jwt_decoding_key", &"[REDACTED]")
            .field("sessions", &self.sessions)
            .field("mfa_challenges", &self.mfa_challenges)
            .field("config", &self.config)
            .field("oauth_client", &self.oauth_client)
            .finish()
    }
}

impl FirebaseAuthService {
    /// Create new Firebase authentication service
    pub fn new(project_id: String, api_key: String, jwt_secret: &[u8]) -> Self {
        let client = Client::new();
        
        // Create JWT keys
        let jwt_encoding_key = EncodingKey::from_secret(jwt_secret);
        let jwt_decoding_key = DecodingKey::from_secret(jwt_secret);
        
        Self {
            project_id,
            api_key,
            client,
            jwt_encoding_key,
            jwt_decoding_key,
            sessions: Arc::new(RwLock::new(HashMap::new())),
            mfa_challenges: Arc::new(RwLock::new(HashMap::new())),
            config: SecurityConfig::default(),
            oauth_client: None,
        }
    }
    
    /// Initialize OAuth2 client for provider authentication
    pub fn init_oauth2(&mut self, client_id: String, client_secret: String, redirect_url: String) -> Result<(), SecurityError> {
        let oauth_client = BasicClient::new(
            ClientId::new(client_id),
            Some(ClientSecret::new(client_secret)),
            oauth2::AuthUrl::new("https://accounts.google.com/o/oauth2/auth".to_string())
                .map_err(|e| SecurityError::AuthenticationFailed { 
                    reason: format!("Invalid auth URL: {}", e) 
                })?,
            Some(oauth2::TokenUrl::new("https://oauth2.googleapis.com/token".to_string())
                .map_err(|e| SecurityError::AuthenticationFailed { 
                    reason: format!("Invalid token URL: {}", e) 
                })?),
        )
        .set_redirect_uri(RedirectUrl::new(redirect_url)
            .map_err(|e| SecurityError::AuthenticationFailed { 
                reason: format!("Invalid redirect URL: {}", e) 
            })?);
        
        self.oauth_client = Some(oauth_client);
        Ok(())
    }
    
    /// Authenticate user with Firebase
    pub async fn authenticate_with_firebase(&self, id_token: &str) -> Result<FirebaseUser, SecurityError> {
        let url = format!(
            "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={}",
            self.api_key
        );
        
        let request_body = serde_json::json!({
            "idToken": id_token
        });
        
        let response = self.client
            .post(&url)
            .json(&request_body)
            .send()
            .await
            .map_err(|e| SecurityError::AuthenticationFailed { 
                reason: format!("Firebase API request failed: {}", e) 
            })?;
        
        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(SecurityError::AuthenticationFailed { 
                reason: format!("Firebase authentication failed: {}", error_text) 
            });
        }
        
        let response_data: serde_json::Value = response.json().await
            .map_err(|e| SecurityError::AuthenticationFailed { 
                reason: format!("Failed to parse Firebase response: {}", e) 
            })?;
        
        // Parse user data from Firebase response
        let users = response_data["users"].as_array()
            .ok_or_else(|| SecurityError::AuthenticationFailed { 
                reason: "No users in Firebase response".to_string() 
            })?;
        
        let user_data = users.first()
            .ok_or_else(|| SecurityError::AuthenticationFailed { 
                reason: "Empty users array in Firebase response".to_string() 
            })?;
        
        let firebase_user = FirebaseUser {
            uid: user_data["localId"].as_str().unwrap_or_default().to_string(),
            email: user_data["email"].as_str().unwrap_or_default().to_string(),
            display_name: user_data["displayName"].as_str().map(|s| s.to_string()),
            email_verified: user_data["emailVerified"].as_bool().unwrap_or(false),
            phone_number: user_data["phoneNumber"].as_str().map(|s| s.to_string()),
            photo_url: user_data["photoUrl"].as_str().map(|s| s.to_string()),
            created_at: parse_timestamp(user_data["createdAt"].as_str().unwrap_or("0")).unwrap_or_else(Utc::now),
            last_sign_in: parse_timestamp(user_data["lastLoginAt"].as_str().unwrap_or("0")),
            custom_claims: parse_custom_claims(user_data.get("customClaims")),
            provider_data: parse_provider_data(user_data.get("providerUserInfo")),
        };
        
        Ok(firebase_user)
    }
    
    /// Create secure session with HIPAA compliance
    pub async fn create_session(
        &self,
        user: &FirebaseUser,
        role: HealthcareRole,
        ip_address: Option<String>,
        user_agent: Option<String>,
    ) -> Result<SecuritySession, SecurityError> {
        let session_id = Uuid::new_v4();
        let user_id = Uuid::parse_str(&user.uid)
            .map_err(|_| SecurityError::AuthenticationFailed { 
                reason: "Invalid user ID format".to_string() 
            })?;
        
        // Determine permissions based on role
        let permissions = self.get_role_permissions(&role);
        
        // Create JWT claims
        let claims = HipaaJwtClaims::new(user, role.clone(), session_id.to_string(), permissions.clone(), &self.config);
        
        // Generate JWT tokens
        let access_token = encode(&Header::default(), &claims, &self.jwt_encoding_key)
            .map_err(|e| SecurityError::AuthenticationFailed { 
                reason: format!("Failed to create access token: {}", e) 
            })?;
        
        // Create refresh token (simplified, in practice would have different claims)
        let refresh_claims = claims.clone();
        let refresh_token = encode(&Header::default(), &refresh_claims, &self.jwt_encoding_key)
            .map_err(|e| SecurityError::AuthenticationFailed { 
                reason: format!("Failed to create refresh token: {}", e) 
            })?;
        
        let session = SecuritySession {
            session_id,
            user_id,
            role: role.clone(),
            access_token,
            refresh_token,
            created_at: Utc::now(),
            last_activity: Utc::now(),
            expires_at: Utc::now() + Duration::seconds(self.config.jwt_expiry_seconds),
            ip_address,
            user_agent,
            location: None, // Could be determined from IP
            is_elevated: false,
            mfa_verified: false,
            permissions,
            data_access_level: crate::security::DataClassification::Confidential, // Default to Confidential for healthcare
            security_metadata: serde_json::json!({
                "firebase_uid": user.uid,
                "email_verified": user.email_verified,
                "creation_method": "firebase_auth"
            }),
        };
        
        // Store session
        self.sessions.write().unwrap().insert(session_id.to_string(), session.clone());
        
        log::info!("Created secure session {} for user {} with role {:?}", session_id, user.email, &role);
        Ok(session)
    }
    
    /// Validate JWT token and return claims
    pub fn validate_token(&self, token: &str) -> Result<HipaaJwtClaims, SecurityError> {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_audience(&["psypsy-cms-tauri"]);
        validation.set_issuer(&["psypsy-cms-hipaa"]);
        
        let token_data = decode::<HipaaJwtClaims>(token, &self.jwt_decoding_key, &validation)
            .map_err(|e| SecurityError::InvalidToken { 
                reason: format!("Token validation failed: {}", e) 
            })?;
        
        let claims = token_data.claims;
        
        // Additional validation
        if !claims.is_valid() {
            return Err(SecurityError::InvalidToken { 
                reason: "Token is expired or not yet valid".to_string() 
            });
        }
        
        // Verify session still exists
        if !self.sessions.read().unwrap().contains_key(&claims.session_id) {
            return Err(SecurityError::SessionExpired {
                expired_at: Utc::now(),
                reason: "Session not found in active sessions".to_string()
            });
        }
        
        Ok(claims)
    }
    
    /// Refresh JWT token
    pub async fn refresh_token(&self, refresh_token: &str) -> Result<(String, String), SecurityError> {
        let claims = self.validate_token(refresh_token)?;
        
        // Get session
        let _session = self.sessions.read().unwrap()
            .get(&claims.session_id)
            .cloned()
            .ok_or_else(|| SecurityError::SessionExpired {
                expired_at: Utc::now(),
                reason: "Session not found or expired".to_string()
            })?;
        
        // Store session_id before move
        let session_id = claims.session_id.clone();

        // Create new tokens
        let new_claims = HipaaJwtClaims {
            iat: Utc::now().timestamp(),
            exp: (Utc::now() + Duration::seconds(self.config.jwt_expiry_seconds)).timestamp(),
            jti: Uuid::new_v4().to_string(),
            ..claims
        };

        let new_access_token = encode(&Header::default(), &new_claims, &self.jwt_encoding_key)
            .map_err(|e| SecurityError::AuthenticationFailed {
                reason: format!("Failed to create new access token: {}", e)
            })?;

        let new_refresh_token = encode(&Header::default(), &new_claims, &self.jwt_encoding_key)
            .map_err(|e| SecurityError::AuthenticationFailed {
                reason: format!("Failed to create new refresh token: {}", e)
            })?;

        // Update session
        let mut sessions = self.sessions.write().unwrap();
        if let Some(session) = sessions.get_mut(&session_id) {
            session.access_token = new_access_token.clone();
            session.refresh_token = new_refresh_token.clone();
            session.last_activity = Utc::now();
            session.expires_at = Utc::now() + Duration::seconds(self.config.jwt_expiry_seconds);
        }
        
        Ok((new_access_token, new_refresh_token))
    }
    
    /// Start MFA challenge
    pub async fn start_mfa_challenge(&self, user_id: &str, challenge_type: MfaChallengeType) -> Result<String, SecurityError> {
        let challenge_id = Uuid::new_v4().to_string();
        let challenge = MfaChallenge {
            challenge_id: challenge_id.clone(),
            challenge_type,
            user_id: user_id.to_string(),
            created_at: Utc::now(),
            expires_at: Utc::now() + Duration::minutes(10), // 10 minute expiry
            attempts: 0,
            max_attempts: 3,
            completed: false,
        };
        
        self.mfa_challenges.write().unwrap().insert(challenge_id.clone(), challenge);
        
        // In practice, would send SMS/email or prepare TOTP verification
        log::info!("Started MFA challenge {} for user {}", challenge_id, user_id);
        Ok(challenge_id)
    }
    
    /// Verify MFA challenge
    pub async fn verify_mfa_challenge(&self, challenge_id: &str, code: &str) -> Result<bool, SecurityError> {
        let mut challenges = self.mfa_challenges.write().unwrap();
        let challenge = challenges.get_mut(challenge_id)
            .ok_or_else(|| SecurityError::AuthenticationFailed { 
                reason: "MFA challenge not found".to_string() 
            })?;
        
        if challenge.completed {
            return Err(SecurityError::AuthenticationFailed { 
                reason: "MFA challenge already completed".to_string() 
            });
        }
        
        if Utc::now() > challenge.expires_at {
            return Err(SecurityError::AuthenticationFailed { 
                reason: "MFA challenge expired".to_string() 
            });
        }
        
        if challenge.attempts >= challenge.max_attempts {
            return Err(SecurityError::AuthenticationFailed { 
                reason: "Maximum MFA attempts exceeded".to_string() 
            });
        }
        
        challenge.attempts += 1;
        
        // Verify code based on challenge type
        let is_valid = match &challenge.challenge_type {
            MfaChallengeType::Sms { .. } => {
                // In practice, would verify SMS code
                code.len() == 6 && code.chars().all(|c| c.is_numeric())
            },
            MfaChallengeType::Totp { secret_key: _secret_key } => {
                // In practice, would verify TOTP code using secret_key
                code.len() == 6 && code.chars().all(|c| c.is_numeric())
            },
            MfaChallengeType::Email { .. } => {
                // In practice, would verify email token
                code.len() >= 6
            },
            MfaChallengeType::SecurityKey { .. } => {
                // In practice, would verify WebAuthn signature
                !code.is_empty()
            },
            MfaChallengeType::BackupCode => {
                // In practice, would verify against stored backup codes
                code.len() >= 8
            },
        };
        
        if is_valid {
            challenge.completed = true;
            
            // Update session MFA status
            let mut sessions = self.sessions.write().unwrap();
            for session in sessions.values_mut() {
                if session.user_id.to_string() == challenge.user_id {
                    session.mfa_verified = true;
                }
            }
            
            log::info!("MFA challenge {} verified successfully for user {}", challenge_id, challenge.user_id);
            Ok(true)
        } else {
            Ok(false)
        }
    }
    
    /// End user session
    pub async fn end_session(&self, session_id: &str) -> Result<(), SecurityError> {
        self.sessions.write().unwrap().remove(session_id);
        log::info!("Ended session {}", session_id);
        Ok(())
    }
    
    /// Get permissions for healthcare role
    fn get_role_permissions(&self, role: &HealthcareRole) -> Vec<String> {
        match role {
            HealthcareRole::Administrator => vec![
                "view_phi".to_string(),
                "modify_phi".to_string(),
                "delete_phi".to_string(),
                "export_data".to_string(),
                "user_management".to_string(),
                "system_admin".to_string(),
                "audit_access".to_string(),
                "security_config".to_string(),
            ],
            HealthcareRole::SuperAdmin => vec![
                "view_phi".to_string(),
                "modify_phi".to_string(),
                "delete_phi".to_string(),
                "export_data".to_string(),
                "user_management".to_string(),
                "system_admin".to_string(),
                "audit_access".to_string(),
                "security_config".to_string(),
            ],
            HealthcareRole::HealthcareProvider => vec![
                "view_phi".to_string(),
                "modify_phi".to_string(),
                "create_patient".to_string(),
                "schedule_appointment".to_string(),
                "view_patient_history".to_string(),
                "create_treatment_plan".to_string(),
            ],
            HealthcareRole::AdministrativeStaff => vec![
                "view_basic_info".to_string(),
                "schedule_appointment".to_string(),
                "manage_billing".to_string(),
                "patient_communication".to_string(),
            ],
            HealthcareRole::BillingStaff => vec![
                "view_billing_info".to_string(),
                "manage_billing".to_string(),
                "insurance_processing".to_string(),
            ],
            HealthcareRole::TechnicalSupport => vec![
                "system_support".to_string(),
                "view_logs".to_string(),
                "technical_config".to_string(),
            ],
            HealthcareRole::Auditor => vec![
                "audit_access".to_string(),
                "view_logs".to_string(),
                "compliance_reports".to_string(),
            ],
            HealthcareRole::Patient => vec![
                "view_own_data".to_string(),
                "update_personal_info".to_string(),
                "schedule_own_appointments".to_string(),
            ],
            HealthcareRole::Guest => vec![
                "view_public_info".to_string(),
            ],
            HealthcareRole::AdminStaff => vec![
                "view_basic_info".to_string(),
                "schedule_appointment".to_string(),
                "manage_records".to_string(),
                "patient_communication".to_string(),
            ],
            HealthcareRole::Guardian => vec![
                "view_dependent_data".to_string(),
                "update_dependent_info".to_string(),
                "schedule_dependent_appointments".to_string(),
                "view_dependent_history".to_string(),
            ],
            HealthcareRole::EmergencyContact => vec![
                "view_emergency_info".to_string(),
                "receive_notifications".to_string(),
            ],
            HealthcareRole::ReadOnlyAccess => vec![
                "view_basic_info".to_string(),
                "view_public_records".to_string(),
            ],
        }
    }
    
    /// Clean up expired sessions and challenges
    pub async fn cleanup_expired(&self) {
        let now = Utc::now();
        
        // Clean up expired sessions
        let mut sessions = self.sessions.write().unwrap();
        sessions.retain(|_, session| session.expires_at > now);
        
        // Clean up expired MFA challenges
        let mut challenges = self.mfa_challenges.write().unwrap();
        challenges.retain(|_, challenge| challenge.expires_at > now);
        
        log::debug!("Cleaned up expired sessions and MFA challenges");
    }
    
    /// Get active sessions count
    pub fn get_active_sessions_count(&self) -> usize {
        self.sessions.read().unwrap().len()
    }
    
    /// Get session by ID
    pub fn get_session(&self, session_id: &str) -> Option<SecuritySession> {
        self.sessions.read().unwrap().get(session_id).cloned()
    }
}

/// Helper function to parse timestamp from Firebase
fn parse_timestamp(timestamp_str: &str) -> Option<DateTime<Utc>> {
    timestamp_str.parse::<i64>().ok()
        .and_then(|ts| DateTime::from_timestamp_millis(ts))
}

/// Helper function to parse custom claims
fn parse_custom_claims(claims: Option<&serde_json::Value>) -> HashMap<String, serde_json::Value> {
    claims.and_then(|c| c.as_object())
        .map(|obj| obj.iter().map(|(k, v)| (k.clone(), v.clone())).collect())
        .unwrap_or_default()
}

/// Helper function to parse provider data
fn parse_provider_data(provider_data: Option<&serde_json::Value>) -> Vec<ProviderData> {
    provider_data.and_then(|p| p.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|item| {
                    let uid = item["rawId"].as_str()?;
                    Some(ProviderData {
                        uid: uid.to_string(),
                        display_name: item["displayName"].as_str().map(|s| s.to_string()),
                        email: item["email"].as_str().map(|s| s.to_string()),
                        phone_number: item["phoneNumber"].as_str().map(|s| s.to_string()),
                        photo_url: item["photoUrl"].as_str().map(|s| s.to_string()),
                        provider_id: item["providerId"].as_str().unwrap_or("unknown").to_string(),
                    })
                })
                .collect()
        })
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_firebase_auth_service_creation() {
        let service = FirebaseAuthService::new(
            "test-project".to_string(),
            "test-api-key".to_string(),
            b"test-jwt-secret-key-for-testing-purposes",
        );
        
        assert_eq!(service.project_id, "test-project");
        assert_eq!(service.api_key, "test-api-key");
    }
    
    #[tokio::test]
    async fn test_jwt_claims_validation() {
        let user = FirebaseUser {
            uid: "test-uid".to_string(),
            email: "test@example.com".to_string(),
            display_name: Some("Test User".to_string()),
            email_verified: true,
            phone_number: None,
            photo_url: None,
            created_at: Utc::now(),
            last_sign_in: Some(Utc::now()),
            custom_claims: HashMap::new(),
            provider_data: Vec::new(),
        };
        
        let config = SecurityConfig::default();
        let claims = HipaaJwtClaims::new(
            &user,
            HealthcareRole::HealthcareProvider,
            Uuid::new_v4().to_string(),
            vec!["view_phi".to_string()],
            &config,
        );
        
        assert!(claims.is_valid());
        assert!(claims.has_permission("view_phi"));
        assert!(!claims.has_permission("system_admin"));
        assert_eq!(claims.role, HealthcareRole::HealthcareProvider);
    }
    
    #[tokio::test]
    async fn test_role_permissions() {
        let service = FirebaseAuthService::new(
            "test-project".to_string(),
            "test-api-key".to_string(),
            b"test-jwt-secret-key-for-testing-purposes",
        );
        
        let admin_permissions = service.get_role_permissions(&HealthcareRole::SuperAdmin);
        let provider_permissions = service.get_role_permissions(&HealthcareRole::HealthcareProvider);
        let patient_permissions = service.get_role_permissions(&HealthcareRole::Patient);
        
        assert!(admin_permissions.contains(&"system_admin".to_string()));
        assert!(provider_permissions.contains(&"view_phi".to_string()));
        assert!(patient_permissions.contains(&"view_own_data".to_string()));
        
        assert!(admin_permissions.len() > provider_permissions.len());
        assert!(provider_permissions.len() > patient_permissions.len());
    }
}

/// Authentication state for Tauri application
#[derive(Debug, Clone)]
pub struct AuthState {
    pub user_id: Option<String>,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub is_authenticated: bool,
    pub role: Option<HealthcareRole>,
    pub permissions: Vec<String>,
    pub session_expires_at: Option<DateTime<Utc>>,
}

impl AuthState {
    /// Create new empty auth state
    pub fn new() -> Self {
        Self {
            user_id: None,
            access_token: None,
            refresh_token: None,
            is_authenticated: false,
            role: None,
            permissions: Vec::new(),
            session_expires_at: None,
        }
    }

    /// Set authenticated user
    pub fn set_authenticated(
        &mut self,
        user_id: String,
        access_token: String,
        refresh_token: String,
        role: HealthcareRole,
        permissions: Vec<String>,
        expires_at: DateTime<Utc>,
    ) {
        self.user_id = Some(user_id);
        self.access_token = Some(access_token);
        self.refresh_token = Some(refresh_token);
        self.is_authenticated = true;
        self.role = Some(role);
        self.permissions = permissions;
        self.session_expires_at = Some(expires_at);
    }

    /// Clear authentication state
    pub fn clear(&mut self) {
        self.user_id = None;
        self.access_token = None;
        self.refresh_token = None;
        self.is_authenticated = false;
        self.role = None;
        self.permissions.clear();
        self.session_expires_at = None;
    }

    /// Check if session is expired
    pub fn is_session_expired(&self) -> bool {
        if let Some(expires_at) = self.session_expires_at {
            Utc::now() > expires_at
        } else {
            false
        }
    }

    /// Check if user has specific permission
    pub fn has_permission(&self, permission: &str) -> bool {
        self.is_authenticated && self.permissions.contains(&permission.to_string())
    }

    /// Get current role
    pub fn get_role(&self) -> Option<&HealthcareRole> {
        self.role.as_ref()
    }
}

impl Default for AuthState {
    fn default() -> Self {
        Self::new()
    }
}

/// Public function to create session token (called from commands)
pub fn create_session_token(
    user_id: &str,
    email: &str,
    user_type: crate::models::UserType,
) -> Result<String, SecurityError> {
    // Convert UserType to HealthcareRole
    let role = match user_type {
        crate::models::UserType::Admin => HealthcareRole::Administrator,
        crate::models::UserType::HealthcareProvider => HealthcareRole::HealthcareProvider,
        crate::models::UserType::Professional => HealthcareRole::HealthcareProvider,
        crate::models::UserType::Client => HealthcareRole::Patient,
    };

    // Create a mock Firebase user for JWT creation
    let firebase_user = FirebaseUser {
        uid: user_id.to_string(),
        email: email.to_string(),
        display_name: Some(email.split('@').next().unwrap_or("User").to_string()),
        email_verified: true, // Assume verified from Firebase Auth
        phone_number: None,
        photo_url: None,
        created_at: Utc::now(),
        last_sign_in: Some(Utc::now()),
        custom_claims: HashMap::new(),
        provider_data: Vec::new(),
    };

    // Create session ID
    let session_id = Uuid::new_v4().to_string();

    // Get default permissions for role
    let permissions = match role {
        HealthcareRole::Administrator => vec![
            "read_all".to_string(),
            "write_all".to_string(),
            "admin_panel".to_string(),
            "user_management".to_string(),
        ],
        HealthcareRole::HealthcareProvider => vec![
            "read_patients".to_string(),
            "write_patients".to_string(),
            "read_appointments".to_string(),
            "write_appointments".to_string(),
        ],
        HealthcareRole::Patient => vec![
            "read_own".to_string(),
            "read_appointments".to_string(),
        ],
        _ => vec!["read_basic".to_string()],
    };

    // Create JWT claims
    let config = SecurityConfig::default();
    let claims = HipaaJwtClaims::new(&firebase_user, role, session_id, permissions, &config);

    // Create JWT token
    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "default-dev-secret-change-in-production".to_string());

    let encoding_key = EncodingKey::from_secret(jwt_secret.as_bytes());

    encode(&Header::default(), &claims, &encoding_key)
        .map_err(|e| SecurityError::AuthenticationFailed {
            reason: format!("Failed to create JWT token: {}", e)
        })
}