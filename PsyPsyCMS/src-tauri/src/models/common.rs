use serde::{Deserialize, Serialize};
use firestore::{FirestoreTimestamp};
use chrono::{DateTime, Utc};

/// Helper function to create a FirestoreTimestamp from current time
pub fn firestore_now() -> FirestoreTimestamp {
    FirestoreTimestamp::from(chrono::Utc::now())
}

/// Helper function to convert FirestoreTimestamp to string
pub fn firestore_timestamp_to_string(timestamp: &FirestoreTimestamp) -> String {
    let datetime: DateTime<Utc> = timestamp.0;
    datetime.to_rfc3339()
}

/// Address object used by clients and professionals
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AddressObject {
    pub street: String,
    pub city: String,
    pub state: String,
    pub zip_code: String,
    pub country: String,
}

/// Geographic point for location services
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GeoPoint {
    pub latitude: f64,
    pub longitude: f64,
}

/// Phone number structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PhoneNumber {
    pub country_code: String,
    pub number: String,
    pub formatted: Option<String>,
}

/// Expertise object for professionals
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ExpertiseObject {
    pub category: i32,
    pub subcategories: Vec<i32>,
    pub experience: i32,
    pub certification: Option<String>,
}

/// Service object for professionals
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ServiceObject {
    pub name: String,
    pub description: String,
    pub duration: i32, // minutes
    pub price: f64,
    pub currency: String,
}

/// Order information
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OrderInfo {
    pub order_number: String,
    pub status: String,
    pub created_at: FirestoreTimestamp,
}

/// User profile base structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserProfile {
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: Option<String>,
    pub gender: Option<i32>, // 0=not specified, 1=male, 2=female, 3=other
    pub profile_picture: Option<String>,
    pub bio: Option<String>,
    pub created_at: FirestoreTimestamp,
    pub updated_at: FirestoreTimestamp,
    pub is_active: bool,
}

/// Base user structure matching Firebase Auth
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BaseUser {
    pub object_id: String,
    pub email: String,
    pub username: String,
    pub user_type: UserType,
    pub created_at: FirestoreTimestamp,
    pub updated_at: FirestoreTimestamp,
    pub email_verified: bool,
}

/// User type enumeration
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum UserType {
    Client,
    Professional,
    HealthcareProvider,
    Admin,
}

impl TryFrom<u8> for UserType {
    type Error = String;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(UserType::Client),
            1 => Ok(UserType::Professional),
            2 => Ok(UserType::HealthcareProvider),
            3 => Ok(UserType::Admin),
            _ => Err(format!("Invalid user type: {}", value)),
        }
    }
}

impl From<UserType> for u8 {
    fn from(user_type: UserType) -> Self {
        match user_type {
            UserType::Client => 0,
            UserType::Professional => 1,
            UserType::HealthcareProvider => 2,
            UserType::Admin => 3,
        }
    }
}

/// Paginated response structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub page: u32,
    pub limit: u32,
    pub total: u32,
    pub has_next_page: bool,
    pub has_previous_page: bool,
}

/// Search filters
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SearchFilters {
    pub status: Option<String>,
    pub user_type: Option<UserType>,
    pub assigned_professional: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
    pub search_query: Option<String>,
}

/// Sort options
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SortOptions {
    pub field: String,
    pub direction: SortDirection,
}

/// Sort direction
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "UPPERCASE")]
pub enum SortDirection {
    Asc,
    Desc,
}

/// API Response wrapper
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<T>,
    pub errors: Option<std::collections::HashMap<String, Vec<String>>>,
    pub timestamp: DateTime<Utc>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            message: None,
            data: Some(data),
            errors: None,
            timestamp: Utc::now(),
        }
    }

    pub fn success_with_message(data: T, message: String) -> Self {
        Self {
            success: true,
            message: Some(message),
            data: Some(data),
            errors: None,
            timestamp: Utc::now(),
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            message: Some(message),
            data: None,
            errors: None,
            timestamp: Utc::now(),
        }
    }

    pub fn validation_error(errors: std::collections::HashMap<String, Vec<String>>) -> Self {
        Self {
            success: false,
            message: Some("Validation failed".to_string()),
            data: None,
            errors: Some(errors),
            timestamp: Utc::now(),
        }
    }
}

/// Dashboard statistics
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DashboardStats {
    pub total_clients: u32,
    pub active_clients: u32,
    pub total_professionals: u32,
    pub active_professionals: u32,
    pub total_appointments_today: u32,
    pub total_appointments_this_week: u32,
    pub total_appointments_this_month: u32,
    pub pending_appointments: u32,
    pub completed_appointments_today: u32,
    pub cancelled_appointments_today: u32,
    pub revenue_this_month: f64,
    pub average_session_duration: f64,
    pub client_satisfaction_rating: f64,
    pub professional_utilization_rate: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ClientStats {
    pub total: u32,
    pub active: u32,
    pub new_this_month: u32,
    pub average_age: f64,
    pub gender_distribution: std::collections::HashMap<String, u32>,
    pub retention_rate: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProfessionalStats {
    pub total: u32,
    pub active: u32,
    pub average_rating: f64,
    pub license_expiring_soon: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppointmentStats {
    pub total_today: u32,
    pub total_this_week: u32,
    pub total_this_month: u32,
    pub completed_today: u32,
    pub cancelled_today: u32,
    pub pending_today: u32,
    pub average_duration: f64,
    pub no_show_rate: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ActivityEntry {
    pub id: String,
    pub action: String,
    pub resource: String,
    pub user_name: String,
    pub timestamp: FirestoreTimestamp,
    pub details: Option<serde_json::Value>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_address_serialization() {
        let address = AddressObject {
            street: "123 Main St".to_string(),
            city: "Anytown".to_string(),
            state: "CA".to_string(),
            zip_code: "12345".to_string(),
            country: "USA".to_string(),
        };

        let serialized = serde_json::to_string(&address).unwrap();
        let deserialized: AddressObject = serde_json::from_str(&serialized).unwrap();

        assert_eq!(address.street, deserialized.street);
        assert_eq!(address.city, deserialized.city);
    }

    #[test]
    fn test_api_response() {
        let response = ApiResponse::success("test data");
        assert!(response.success);
        assert_eq!(response.data.unwrap(), "test data");

        let error_response: ApiResponse<String> = ApiResponse::error("test error".to_string());
        assert!(!error_response.success);
        assert_eq!(error_response.message.unwrap(), "test error");
    }
}