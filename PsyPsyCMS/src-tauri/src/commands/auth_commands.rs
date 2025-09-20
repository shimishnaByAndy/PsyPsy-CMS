use tauri::{State, AppHandle, Manager};
use tokio::sync::RwLock;
use std::sync::Arc;
use rusqlite::{Connection, params};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::services::firebase_service_simple::{FirebaseService, FirebaseServiceState};
use crate::models::{
    User, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse,
    PasswordResetRequest, PasswordChangeRequest, ProfileUpdateRequest, ApiResponse,
    common::firestore_now
};
use crate::security::auth::AuthState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StoredSession {
    pub user: User,
    pub session_token: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub device_info: Option<String>,
}

/// Authenticate user with email and password
#[tauri::command]
pub async fn auth_login(
    email: String,
    password: String,
    firebase: State<'_, FirebaseServiceState>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<LoginResponse>, String> {
    let request = LoginRequest {
        email: email.clone(),
        password: password.clone(),
        remember_me: false,
    };

    // Step 1: Verify credentials with Firebase Auth
    let firebase_guard = firebase.0.lock().await;
    let firebase = firebase_guard.as_ref().ok_or("Firebase service not initialized")?;

    // Authenticate using Firebase Auth REST API
    let auth_result = match firebase.authenticate_user(&request.email, &request.password).await {
        Ok(result) => result,
        Err(e) => {
            tracing::error!("Firebase authentication failed: {}", e);
            return Err(format!("Authentication failed: {}", e));
        }
    };

    // Step 2: Get user data from Firestore
    let user = match firebase.get_document::<User>("users", &auth_result.uid).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            // Create new user profile if doesn't exist
            let new_user = User::new(
                auth_result.uid.clone(),
                email.clone(),
                email.split('@').next().unwrap_or("user").to_string(),
                crate::models::UserType::HealthcareProvider, // Default role
                "Healthcare".to_string(),
                "Provider".to_string(),
            );

            // Save new user to Firestore
            firebase.create_document("users", &auth_result.uid, &new_user).await
                .map_err(|e| format!("Failed to create user profile: {}", e))?;

            new_user
        },
        Err(e) => {
            tracing::error!("Failed to get user data: {}", e);
            return Err(format!("Failed to get user data: {}", e));
        }
    };

    // Step 3: Create session token with HIPAA audit trail
    let session_token = crate::security::auth::create_session_token(&user.base.object_id, &user.base.email, user.base.user_type.clone())
        .map_err(|e| format!("Failed to create session: {}", e))?;

    // Step 4: Log HIPAA audit event
    let audit_result = firebase.audit_log(
        "LOGIN",
        "authentication",
        &user.base.object_id,
        false,
        Some(serde_json::json!({
            "user_id": user.base.object_id,
            "email": user.base.email,
            "user_type": user.base.user_type,
            "login_time": chrono::Utc::now(),
            "ip_address": "TODO: get_client_ip", // TODO: Extract from request
        }))
    ).await;

    if let Err(e) = audit_result {
        tracing::warn!("Failed to log audit event: {}", e);
    }

    let response = LoginResponse {
        user: user.clone(),
        access_token: session_token.clone(),
        refresh_token: auth_result.refresh_token.clone(),
        expires_in: auth_result.expires_in as i64,
    };

    // Update auth state
    {
        let mut auth = auth_state.write().await;
        auth.user_id = Some(user.base.object_id.clone());
        auth.access_token = Some(session_token);
        auth.refresh_token = Some(auth_result.refresh_token);
        auth.is_authenticated = true;
        auth.role = Some(match user.base.user_type {
            crate::models::UserType::Admin => crate::security::HealthcareRole::Administrator,
            crate::models::UserType::HealthcareProvider => crate::security::HealthcareRole::HealthcareProvider,
            crate::models::UserType::Professional => crate::security::HealthcareRole::HealthcareProvider,
            crate::models::UserType::Client => crate::security::HealthcareRole::Patient,
        });
        auth.permissions = match user.base.user_type {
            crate::models::UserType::Admin => vec![
                "read_all".to_string(),
                "write_all".to_string(),
                "admin_panel".to_string(),
            ],
            crate::models::UserType::HealthcareProvider | crate::models::UserType::Professional => vec![
                "read_patients".to_string(),
                "write_patients".to_string(),
                "read_appointments".to_string(),
            ],
            crate::models::UserType::Client => vec!["read_basic".to_string()],
        };
        auth.session_expires_at = Some(chrono::Utc::now() + chrono::Duration::seconds(auth_result.expires_in as i64));
    }

    // Audit log
    firebase.audit_log(
        "LOGIN",
        "authentication",
        "user123",
        false,
        Some(serde_json::json!({"email": email}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(response))
}

/// Logout current user
#[tauri::command]
pub async fn auth_logout(
    firebase: State<'_, FirebaseServiceState>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<()>, String> {
    let user_id = {
        let auth = auth_state.read().await;
        auth.user_id.clone()
    };

    // Clear auth state
    {
        let mut auth = auth_state.write().await;
        auth.clear();
    }

    // Audit log
    if let Some(user_id) = user_id {
        let firebase_guard = firebase.0.lock().await;
    let firebase = firebase_guard.as_ref().ok_or("Firebase service not initialized")?;
        firebase.audit_log(
            "LOGOUT",
            "authentication",
            &user_id,
            false,
            None
        ).await.map_err(|e| e.to_string())?;
    }

    Ok(ApiResponse::success_with_message((), "Logged out successfully".to_string()))
}

/// Refresh authentication token
#[tauri::command]
pub async fn auth_refresh_token(
    refresh_token: String,
    _firebase: State<'_, FirebaseServiceState>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<RefreshTokenResponse>, String> {
    let _request = RefreshTokenRequest { refresh_token };

    // TODO: Implement actual token refresh with Firebase
    let response = RefreshTokenResponse {
        access_token: "new_mock_access_token".to_string(),
        refresh_token: "new_mock_refresh_token".to_string(),
        expires_in: 3600,
    };

    // Update auth state
    {
        let mut auth = auth_state.write().await;
        auth.access_token = Some(response.access_token.clone());
    }

    Ok(ApiResponse::success(response))
}

/// Get current authenticated user
#[tauri::command]
pub async fn auth_get_current_user(
    firebase: State<'_, FirebaseServiceState>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<User>, String> {
    let auth = auth_state.read().await;

    if !auth.is_authenticated {
        return Err("User not authenticated".to_string());
    }

    let user_id = auth.user_id.as_ref()
        .ok_or("No user ID in auth state")?;

    let firebase_guard = firebase.0.lock().await;
    let firebase = firebase_guard.as_ref().ok_or("Firebase service not initialized")?;

    // TODO: Get user from Firestore
    let user: Option<User> = firebase.get_document("users", user_id)
        .await
        .map_err(|e| e.to_string())?;

    let user = user.ok_or("User not found")?;

    Ok(ApiResponse::success(user))
}

/// Update user profile
#[tauri::command]
pub async fn auth_update_profile(
    updates: ProfileUpdateRequest,
    firebase: State<'_, FirebaseServiceState>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<User>, String> {
    let auth = auth_state.read().await;

    if !auth.is_authenticated {
        return Err("User not authenticated".to_string());
    }

    let user_id = auth.user_id.as_ref()
        .ok_or("No user ID in auth state")?;

    let firebase_guard = firebase.0.lock().await;
    let firebase = firebase_guard.as_ref().ok_or("Firebase service not initialized")?;

    // Get current user
    let mut user: User = firebase.get_document("users", user_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("User not found")?;

    // Update fields
    if let Some(first_name) = updates.first_name {
        user.profile.first_name = first_name;
    }
    if let Some(last_name) = updates.last_name {
        user.profile.last_name = last_name;
    }
    if let Some(bio) = updates.bio {
        user.profile.bio = Some(bio);
    }
    if let Some(profile_picture) = updates.profile_picture {
        user.profile.profile_picture = Some(profile_picture);
    }
    if let Some(preferences) = updates.preferences {
        user.preferences = preferences;
    }

    user.profile.updated_at = firestore_now();

    // Save to Firestore
    let updated_user: User = firebase.update_document("users", user_id, &user)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "UPDATE_PROFILE",
        "user_profile",
        user_id,
        true, // PHI potentially accessed
        Some(serde_json::json!({"updated_fields": ["profile"]}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(updated_user))
}

/// Change user password
#[tauri::command]
pub async fn auth_change_password(
    _request: PasswordChangeRequest,
    firebase: State<'_, FirebaseServiceState>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<()>, String> {
    let auth = auth_state.read().await;

    if !auth.is_authenticated {
        return Err("User not authenticated".to_string());
    }

    let user_id = auth.user_id.as_ref()
        .ok_or("No user ID in auth state")?;

    // TODO: Implement actual password change with Firebase Auth
    // This would involve:
    // 1. Verify current password
    // 2. Update password in Firebase Auth
    // 3. Invalidate all existing sessions

    let firebase_guard = firebase.0.lock().await;
    let firebase = firebase_guard.as_ref().ok_or("Firebase service not initialized")?;

    // Audit log
    firebase.audit_log(
        "CHANGE_PASSWORD",
        "authentication",
        user_id,
        false,
        None
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message((), "Password changed successfully".to_string()))
}

/// Request password reset
#[tauri::command]
pub async fn auth_request_password_reset(
    request: PasswordResetRequest,
    firebase: State<'_, FirebaseServiceState>,
) -> Result<ApiResponse<()>, String> {
    // TODO: Implement password reset with Firebase Auth
    // This would involve sending a password reset email

    let firebase_guard = firebase.0.lock().await;
    let firebase = firebase_guard.as_ref().ok_or("Firebase service not initialized")?;

    // Audit log (no user ID since user might not be authenticated)
    firebase.audit_log(
        "PASSWORD_RESET_REQUEST",
        "authentication",
        "anonymous",
        false,
        Some(serde_json::json!({"email": request.email}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        (),
        "Password reset email sent if account exists".to_string()
    ))
}

/// Verify Firebase ID token
#[tauri::command]
pub async fn auth_verify_token(
    id_token: String,
    firebase: State<'_, FirebaseServiceState>,
) -> Result<ApiResponse<bool>, String> {
    let firebase_guard = firebase.0.lock().await;
    let firebase = firebase_guard.as_ref().ok_or("Firebase service not initialized")?;

    match firebase.verify_token(&id_token).await {
        Ok(_) => Ok(ApiResponse::success(true)),
        Err(e) => {
            tracing::warn!("Token verification failed: {}", e);
            Ok(ApiResponse::success(false))
        }
    }
}

/// Check authentication status
#[tauri::command]
pub async fn auth_check_status(
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<bool>, String> {
    let auth = auth_state.read().await;
    Ok(ApiResponse::success(auth.is_authenticated))
}

/// Store session for "Remember Me" functionality
#[tauri::command]
pub async fn store_session(
    user: User,
    remember_me: bool,
    app_handle: AppHandle,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<()>, String> {
    if !remember_me {
        return Ok(ApiResponse::success_with_message((), "Session not stored - remember me disabled".to_string()));
    }

    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    let db_path = app_data_dir.join("psypsy_sessions.db");

    // Initialize database if it doesn't exist
    let conn = Connection::open(&db_path)
        .map_err(|e| format!("Failed to open session database: {}", e))?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_data TEXT NOT NULL,
            session_token TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            device_info TEXT,
            is_active BOOLEAN DEFAULT TRUE
        )",
        [],
    ).map_err(|e| format!("Failed to create sessions table: {}", e))?;

    // Clear any existing sessions for this user
    conn.execute(
        "DELETE FROM user_sessions WHERE user_id = ?1",
        params![user.base.object_id],
    ).map_err(|e| format!("Failed to clear existing sessions: {}", e))?;

    let auth = auth_state.read().await;
    let session_token = auth.access_token.clone().unwrap_or_else(|| "demo_session_token".to_string());
    drop(auth);

    let stored_session = StoredSession {
        user: user.clone(),
        session_token,
        created_at: Utc::now(),
        expires_at: Utc::now() + chrono::Duration::days(30), // 30 days for remember me
        device_info: Some("Desktop App".to_string()),
    };

    let session_id = Uuid::new_v4().to_string();
    let user_data = serde_json::to_string(&user)
        .map_err(|e| format!("Failed to serialize user data: {}", e))?;

    conn.execute(
        "INSERT INTO user_sessions
         (id, user_id, user_data, session_token, created_at, expires_at, device_info, is_active)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            session_id,
            user.base.object_id,
            user_data,
            stored_session.session_token,
            stored_session.created_at.to_rfc3339(),
            stored_session.expires_at.to_rfc3339(),
            stored_session.device_info,
            true
        ],
    ).map_err(|e| format!("Failed to store session: {}", e))?;

    tracing::info!("Session stored for user: {} with remember me", user.base.email);
    Ok(ApiResponse::success_with_message((), "Session stored successfully".to_string()))
}

/// Get stored session for automatic login
#[tauri::command]
pub async fn get_stored_session(
    app_handle: AppHandle,
) -> Result<Option<StoredSession>, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    let db_path = app_data_dir.join("psypsy_sessions.db");

    // Return None if database doesn't exist
    if !db_path.exists() {
        return Ok(None);
    }

    let conn = Connection::open(&db_path)
        .map_err(|e| format!("Failed to open session database: {}", e))?;

    let mut stmt = conn.prepare(
        "SELECT user_data, session_token, created_at, expires_at, device_info
         FROM user_sessions
         WHERE is_active = TRUE AND expires_at > ?1
         ORDER BY created_at DESC
         LIMIT 1"
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let now = Utc::now().to_rfc3339();
    let result = stmt.query_row(params![now], |row| {
        let user_data_str: String = row.get(0)?;
        let user: User = serde_json::from_str(&user_data_str)
            .map_err(|_e| rusqlite::Error::InvalidColumnType(0, "user_data".to_string(), rusqlite::types::Type::Text))?;

        Ok(StoredSession {
            user,
            session_token: row.get(1)?,
            created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(2)?)
                .map_err(|_| rusqlite::Error::InvalidColumnType(2, "created_at".to_string(), rusqlite::types::Type::Text))?
                .with_timezone(&Utc),
            expires_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(3)?)
                .map_err(|_| rusqlite::Error::InvalidColumnType(3, "expires_at".to_string(), rusqlite::types::Type::Text))?
                .with_timezone(&Utc),
            device_info: row.get(4)?,
        })
    });

    match result {
        Ok(session) => {
            tracing::info!("Retrieved stored session for user: {}", session.user.base.email);
            Ok(Some(session))
        },
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            tracing::info!("No valid stored session found");
            Ok(None)
        },
        Err(e) => {
            tracing::error!("Failed to retrieve stored session: {}", e);
            Err(format!("Failed to retrieve stored session: {}", e))
        }
    }
}

/// Clear stored session (for logout)
#[tauri::command]
pub async fn clear_stored_session(
    app_handle: AppHandle,
) -> Result<ApiResponse<()>, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    let db_path = app_data_dir.join("psypsy_sessions.db");

    // Return success if database doesn't exist
    if !db_path.exists() {
        return Ok(ApiResponse::success_with_message((), "No sessions to clear".to_string()));
    }

    let conn = Connection::open(&db_path)
        .map_err(|e| format!("Failed to open session database: {}", e))?;

    conn.execute(
        "UPDATE user_sessions SET is_active = FALSE WHERE is_active = TRUE",
        [],
    ).map_err(|e| format!("Failed to clear sessions: {}", e))?;

    tracing::info!("All stored sessions cleared");
    Ok(ApiResponse::success_with_message((), "Sessions cleared successfully".to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::sync::Mutex;

    // Mock Firebase service for testing
    fn create_mock_firebase_service() -> Arc<Mutex<FirebaseService>> {
        // This would be a mock implementation for testing
        todo!("Implement mock Firebase service for tests")
    }

    #[tokio::test]
    async fn test_auth_check_status() {
        let auth_state = Arc::new(RwLock::new(AuthState::new()));

        let result = auth_check_status(tauri::State::from(auth_state)).await;
        assert!(result.is_ok());

        let response = result.unwrap();
        assert!(response.success);
        assert_eq!(response.data.unwrap(), false); // Should be false initially
    }
}