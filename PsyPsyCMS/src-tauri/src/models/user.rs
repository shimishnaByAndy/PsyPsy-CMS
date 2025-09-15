use serde::{Deserialize, Serialize};
use firestore::{FirestoreTimestamp};
use chrono::{DateTime, Utc};

use super::common::{BaseUser, UserType, UserProfile};

/// Complete user structure combining BaseUser and UserProfile
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct User {
    #[serde(flatten)]
    pub base: BaseUser,
    #[serde(flatten)]
    pub profile: UserProfile,
    pub last_login: Option<FirestoreTimestamp>,
    pub login_count: i32,
    pub is_suspended: bool,
    pub suspension_reason: Option<String>,
    pub preferences: UserPreferences,
}

/// User preferences and settings
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserPreferences {
    pub language: String,
    pub timezone: String,
    pub notifications: NotificationSettings,
    pub privacy: PrivacySettings,
    pub accessibility: AccessibilitySettings,
}

/// Notification settings
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NotificationSettings {
    pub email_notifications: bool,
    pub sms_notifications: bool,
    pub push_notifications: bool,
    pub appointment_reminders: bool,
    pub marketing_emails: bool,
}

/// Privacy settings
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PrivacySettings {
    pub profile_visibility: ProfileVisibility,
    pub show_online_status: bool,
    pub allow_search_by_email: bool,
    pub data_sharing_consent: bool,
}

/// Profile visibility levels
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ProfileVisibility {
    Public,
    Professional,
    Private,
}

/// Accessibility settings
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AccessibilitySettings {
    pub high_contrast: bool,
    pub large_text: bool,
    pub screen_reader: bool,
    pub keyboard_navigation: bool,
}

/// User session information
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserSession {
    pub user_id: String,
    pub session_id: String,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub is_active: bool,
}

/// Authentication request/response structures
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
    pub remember_me: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
    pub user: User,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RefreshTokenResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PasswordResetRequest {
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PasswordChangeRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProfileUpdateRequest {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub bio: Option<String>,
    pub profile_picture: Option<String>,
    pub preferences: Option<UserPreferences>,
}

impl Default for UserPreferences {
    fn default() -> Self {
        Self {
            language: "en".to_string(),
            timezone: "UTC".to_string(),
            notifications: NotificationSettings::default(),
            privacy: PrivacySettings::default(),
            accessibility: AccessibilitySettings::default(),
        }
    }
}

impl Default for NotificationSettings {
    fn default() -> Self {
        Self {
            email_notifications: true,
            sms_notifications: false,
            push_notifications: true,
            appointment_reminders: true,
            marketing_emails: false,
        }
    }
}

impl Default for PrivacySettings {
    fn default() -> Self {
        Self {
            profile_visibility: ProfileVisibility::Professional,
            show_online_status: true,
            allow_search_by_email: false,
            data_sharing_consent: false,
        }
    }
}

impl Default for AccessibilitySettings {
    fn default() -> Self {
        Self {
            high_contrast: false,
            large_text: false,
            screen_reader: false,
            keyboard_navigation: false,
        }
    }
}

impl User {
    /// Create a new user with default preferences
    pub fn new(
        object_id: String,
        email: String,
        username: String,
        user_type: UserType,
        first_name: String,
        last_name: String,
    ) -> Self {
        let now = FirestoreTimestamp::from(Utc::now());

        Self {
            base: BaseUser {
                object_id,
                email,
                username,
                user_type,
                created_at: now.clone(),
                updated_at: now.clone(),
                email_verified: false,
            },
            profile: UserProfile {
                first_name,
                last_name,
                date_of_birth: None,
                gender: None,
                profile_picture: None,
                bio: None,
                created_at: now.clone(),
                updated_at: now,
                is_active: true,
            },
            last_login: None,
            login_count: 0,
            is_suspended: false,
            suspension_reason: None,
            preferences: UserPreferences::default(),
        }
    }

    /// Get full display name
    pub fn display_name(&self) -> String {
        format!("{} {}", self.profile.first_name, self.profile.last_name)
    }

    /// Check if user is active and not suspended
    pub fn is_available(&self) -> bool {
        self.profile.is_active && !self.is_suspended
    }

    /// Update last login information
    pub fn record_login(&mut self) {
        self.last_login = Some(FirestoreTimestamp::from(Utc::now()));
        self.login_count += 1;
        self.profile.updated_at = FirestoreTimestamp::from(Utc::now());
    }

    /// Suspend user account
    pub fn suspend(&mut self, reason: String) {
        self.is_suspended = true;
        self.suspension_reason = Some(reason);
        self.profile.updated_at = FirestoreTimestamp::from(Utc::now());
    }

    /// Reactivate suspended user account
    pub fn reactivate(&mut self) {
        self.is_suspended = false;
        self.suspension_reason = None;
        self.profile.updated_at = FirestoreTimestamp::from(Utc::now());
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_creation() {
        let user = User::new(
            "user123".to_string(),
            "test@example.com".to_string(),
            "testuser".to_string(),
            UserType::Client,
            "John".to_string(),
            "Doe".to_string(),
        );

        assert_eq!(user.base.object_id, "user123");
        assert_eq!(user.base.email, "test@example.com");
        assert_eq!(user.display_name(), "John Doe");
        assert!(user.is_available());
    }

    #[test]
    fn test_user_suspension() {
        let mut user = User::new(
            "user123".to_string(),
            "test@example.com".to_string(),
            "testuser".to_string(),
            UserType::Client,
            "John".to_string(),
            "Doe".to_string(),
        );

        user.suspend("Policy violation".to_string());
        assert!(!user.is_available());
        assert_eq!(user.suspension_reason.unwrap(), "Policy violation");

        user.reactivate();
        assert!(user.is_available());
        assert!(user.suspension_reason.is_none());
    }

    #[test]
    fn test_login_tracking() {
        let mut user = User::new(
            "user123".to_string(),
            "test@example.com".to_string(),
            "testuser".to_string(),
            UserType::Client,
            "John".to_string(),
            "Doe".to_string(),
        );

        assert_eq!(user.login_count, 0);
        assert!(user.last_login.is_none());

        user.record_login();
        assert_eq!(user.login_count, 1);
        assert!(user.last_login.is_some());
    }
}