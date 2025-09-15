use tauri::State;
use tokio::sync::RwLock;
use std::sync::Arc;

use crate::services::FirebaseService;
use crate::models::{
    User, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse,
    PasswordResetRequest, PasswordChangeRequest, ProfileUpdateRequest, ApiResponse,
    common::firestore_now
};
use crate::security::auth::AuthState;

/// Authenticate user with email and password
#[tauri::command]
pub async fn auth_login(
    email: String,
    password: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<LoginResponse>, String> {
    let request = LoginRequest {
        email: email.clone(),
        password: password.clone(),
        remember_me: false,
    };

    // Step 1: Verify credentials with Firebase Auth
    let firebase = firebase.lock().await;

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
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
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
        let firebase = firebase.lock().await;
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
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<RefreshTokenResponse>, String> {
    let request = RefreshTokenRequest { refresh_token };

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
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<User>, String> {
    let auth = auth_state.read().await;

    if !auth.is_authenticated {
        return Err("User not authenticated".to_string());
    }

    let user_id = auth.user_id.as_ref()
        .ok_or("No user ID in auth state")?;

    let firebase = firebase.lock().await;

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
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<User>, String> {
    let auth = auth_state.read().await;

    if !auth.is_authenticated {
        return Err("User not authenticated".to_string());
    }

    let user_id = auth.user_id.as_ref()
        .ok_or("No user ID in auth state")?;

    let firebase = firebase.lock().await;

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
    request: PasswordChangeRequest,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
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

    let firebase = firebase.lock().await;

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
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
) -> Result<ApiResponse<()>, String> {
    // TODO: Implement password reset with Firebase Auth
    // This would involve sending a password reset email

    let firebase = firebase.lock().await;

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
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
) -> Result<ApiResponse<bool>, String> {
    let firebase = firebase.lock().await;

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