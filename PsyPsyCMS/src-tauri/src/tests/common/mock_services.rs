// Mock services for testing Rust backend components
use mockall::mock;
use async_trait::async_trait;
use serde_json::Value;
use std::collections::HashMap;
use chrono::{DateTime, Utc};

// Custom error types for testing
#[derive(Debug, thiserror::Error)]
pub enum MockError {
    #[error("Network error: {0}")]
    Network(String),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Authentication error: {0}")]
    Authentication(String),
    #[error("Permission error: {0}")]
    Permission(String),
    #[error("Not found: {0}")]
    NotFound(String),
}

// Firebase service interface for mocking
#[async_trait]
pub trait FirebaseService: Send + Sync {
    async fn create_document(&self, collection: &str, data: Value) -> Result<String, MockError>;
    async fn get_document(&self, collection: &str, id: &str) -> Result<Value, MockError>;
    async fn update_document(&self, collection: &str, id: &str, data: Value) -> Result<(), MockError>;
    async fn delete_document(&self, collection: &str, id: &str) -> Result<(), MockError>;
    async fn query_collection(&self, collection: &str, filters: HashMap<String, Value>) -> Result<Vec<Value>, MockError>;
    async fn authenticate_user(&self, email: &str, password: &str) -> Result<String, MockError>;
}

mock! {
    pub FirebaseClient {}
    
    #[async_trait]
    impl FirebaseService for FirebaseClient {
        async fn create_document(&self, collection: &str, data: Value) -> Result<String, MockError>;
        async fn get_document(&self, collection: &str, id: &str) -> Result<Value, MockError>;
        async fn update_document(&self, collection: &str, id: &str, data: Value) -> Result<(), MockError>;
        async fn delete_document(&self, collection: &str, id: &str) -> Result<(), MockError>;
        async fn query_collection(&self, collection: &str, filters: HashMap<String, Value>) -> Result<Vec<Value>, MockError>;
        async fn authenticate_user(&self, email: &str, password: &str) -> Result<String, MockError>;
    }
}

// Database service interface for mocking
#[async_trait]
pub trait DatabaseService: Send + Sync {
    async fn execute_query(&self, query: &str, params: Vec<Value>) -> Result<Vec<Value>, MockError>;
    async fn begin_transaction(&self) -> Result<String, MockError>;
    async fn commit_transaction(&self, transaction_id: &str) -> Result<(), MockError>;
    async fn rollback_transaction(&self, transaction_id: &str) -> Result<(), MockError>;
    async fn migrate_schema(&self) -> Result<(), MockError>;
}

mock! {
    pub DatabaseClient {}
    
    #[async_trait]
    impl DatabaseService for DatabaseClient {
        async fn execute_query(&self, query: &str, params: Vec<Value>) -> Result<Vec<Value>, MockError>;
        async fn begin_transaction(&self) -> Result<String, MockError>;
        async fn commit_transaction(&self, transaction_id: &str) -> Result<(), MockError>;
        async fn rollback_transaction(&self, transaction_id: &str) -> Result<(), MockError>;
        async fn migrate_schema(&self) -> Result<(), MockError>;
    }
}

// Notification service interface for mocking
#[async_trait]
pub trait NotificationService: Send + Sync {
    async fn send_email(&self, to: &str, subject: &str, body: &str) -> Result<String, MockError>;
    async fn send_sms(&self, to: &str, message: &str) -> Result<String, MockError>;
    async fn send_push_notification(&self, user_id: &str, title: &str, body: &str) -> Result<String, MockError>;
    async fn schedule_reminder(&self, user_id: &str, reminder_time: DateTime<Utc>, message: &str) -> Result<String, MockError>;
}

mock! {
    pub NotificationClient {}
    
    #[async_trait]
    impl NotificationService for NotificationClient {
        async fn send_email(&self, to: &str, subject: &str, body: &str) -> Result<String, MockError>;
        async fn send_sms(&self, to: &str, message: &str) -> Result<String, MockError>;
        async fn send_push_notification(&self, user_id: &str, title: &str, body: &str) -> Result<String, MockError>;
        async fn schedule_reminder(&self, user_id: &str, reminder_time: DateTime<Utc>, message: &str) -> Result<String, MockError>;
    }
}

// Healthcare-specific service interfaces
#[async_trait]
pub trait AppointmentService: Send + Sync {
    async fn schedule_appointment(&self, appointment_data: Value) -> Result<String, MockError>;
    async fn check_availability(&self, professional_id: &str, start_time: DateTime<Utc>, end_time: DateTime<Utc>) -> Result<bool, MockError>;
    async fn get_appointments(&self, filters: HashMap<String, Value>) -> Result<Vec<Value>, MockError>;
    async fn update_appointment_status(&self, appointment_id: &str, status: &str) -> Result<(), MockError>;
    async fn cancel_appointment(&self, appointment_id: &str, reason: Option<&str>) -> Result<(), MockError>;
}

mock! {
    pub AppointmentClient {}
    
    #[async_trait]
    impl AppointmentService for AppointmentClient {
        async fn schedule_appointment(&self, appointment_data: Value) -> Result<String, MockError>;
        async fn check_availability(&self, professional_id: &str, start_time: DateTime<Utc>, end_time: DateTime<Utc>) -> Result<bool, MockError>;
        async fn get_appointments(&self, filters: HashMap<String, Value>) -> Result<Vec<Value>, MockError>;
        async fn update_appointment_status(&self, appointment_id: &str, status: &str) -> Result<(), MockError>;
        async fn cancel_appointment(&self, appointment_id: &str, reason: Option<&str>) -> Result<(), MockError>;
    }
}

#[async_trait]
pub trait ClientService: Send + Sync {
    async fn create_client(&self, client_data: Value) -> Result<String, MockError>;
    async fn get_client(&self, client_id: &str) -> Result<Value, MockError>;
    async fn update_client(&self, client_id: &str, updates: Value) -> Result<(), MockError>;
    async fn get_client_appointments(&self, client_id: &str) -> Result<Vec<Value>, MockError>;
    async fn validate_hipaa_compliance(&self, client_data: &Value) -> Result<bool, MockError>;
}

mock! {
    pub ClientManagementService {}
    
    #[async_trait]
    impl ClientService for ClientManagementService {
        async fn create_client(&self, client_data: Value) -> Result<String, MockError>;
        async fn get_client(&self, client_id: &str) -> Result<Value, MockError>;
        async fn update_client(&self, client_id: &str, updates: Value) -> Result<(), MockError>;
        async fn get_client_appointments(&self, client_id: &str) -> Result<Vec<Value>, MockError>;
        async fn validate_hipaa_compliance(&self, client_data: &Value) -> Result<bool, MockError>;
    }
}

// Pre-configured mock service builders
pub struct MockServiceBuilder;

impl MockServiceBuilder {
    pub fn firebase_service() -> MockFirebaseClient {
        let mut mock = MockFirebaseClient::new();
        
        // Default successful responses
        mock.expect_create_document()
            .returning(|_, _| Ok("mock_document_id".to_string()));
            
        mock.expect_get_document()
            .returning(|collection, id| {
                if collection == "clients" && id == "test_client" {
                    Ok(serde_json::json!({
                        "id": id,
                        "email": "test@example.com",
                        "first_name": "Test",
                        "last_name": "User"
                    }))
                } else {
                    Err(MockError::NotFound(format!("Document {}/{} not found", collection, id)))
                }
            });
            
        mock.expect_authenticate_user()
            .returning(|email, password| {
                if email == "admin@psypsy.com" && password == "password123" {
                    Ok("mock_auth_token".to_string())
                } else {
                    Err(MockError::Authentication("Invalid credentials".to_string()))
                }
            });
        
        mock
    }
    
    pub fn appointment_service() -> MockAppointmentClient {
        let mut mock = MockAppointmentClient::new();
        
        mock.expect_check_availability()
            .returning(|professional_id, start_time, end_time| {
                // Mock availability logic - assume available if not conflicting
                if professional_id == "busy_professional" {
                    Ok(false) // Always busy for testing conflicts
                } else {
                    Ok(true) // Available
                }
            });
            
        mock.expect_schedule_appointment()
            .returning(|_| Ok("mock_appointment_id".to_string()));
            
        mock.expect_update_appointment_status()
            .returning(|_, status| {
                if ["scheduled", "completed", "cancelled", "no_show"].contains(&status) {
                    Ok(())
                } else {
                    Err(MockError::Validation(format!("Invalid status: {}", status)))
                }
            });
        
        mock
    }
    
    pub fn client_service() -> MockClientManagementService {
        let mut mock = MockClientManagementService::new();
        
        mock.expect_create_client()
            .returning(|client_data| {
                // Validate required fields
                if !client_data.get("email").is_some() {
                    return Err(MockError::Validation("Email is required".to_string()));
                }
                if !client_data.get("first_name").is_some() {
                    return Err(MockError::Validation("First name is required".to_string()));
                }
                Ok("mock_client_id".to_string())
            });
            
        mock.expect_validate_hipaa_compliance()
            .returning(|client_data| {
                // Check for HIPAA violations
                let data_str = client_data.to_string().to_lowercase();
                if data_str.contains("ssn") || data_str.contains("diagnosis") {
                    Ok(false) // HIPAA violation detected
                } else {
                    Ok(true) // Compliant
                }
            });
        
        mock
    }
    
    pub fn notification_service() -> MockNotificationClient {
        let mut mock = MockNotificationClient::new();
        
        mock.expect_send_email()
            .returning(|to, subject, body| {
                if to.contains("@") {
                    Ok("mock_email_id".to_string())
                } else {
                    Err(MockError::Validation("Invalid email address".to_string()))
                }
            });
            
        mock.expect_send_push_notification()
            .returning(|user_id, title, body| {
                if !user_id.is_empty() {
                    Ok("mock_notification_id".to_string())
                } else {
                    Err(MockError::Validation("User ID is required".to_string()))
                }
            });
        
        mock
    }
    
    pub fn database_service() -> MockDatabaseClient {
        let mut mock = MockDatabaseClient::new();
        
        mock.expect_execute_query()
            .returning(|query, params| {
                if query.to_lowercase().contains("select") {
                    Ok(vec![serde_json::json!({
                        "id": 1,
                        "result": "mock_data"
                    })])
                } else if query.to_lowercase().contains("insert") {
                    Ok(vec![serde_json::json!({"rows_affected": 1})])
                } else {
                    Err(MockError::Validation("Invalid query".to_string()))
                }
            });
            
        mock.expect_begin_transaction()
            .returning(|| Ok("mock_transaction_id".to_string()));
            
        mock.expect_commit_transaction()
            .returning(|_| Ok(()));
        
        mock
    }
}

// Error simulation helpers
pub struct ErrorSimulator;

impl ErrorSimulator {
    pub fn network_timeout_firebase() -> MockFirebaseClient {
        let mut mock = MockFirebaseClient::new();
        mock.expect_get_document()
            .returning(|_, _| Err(MockError::Network("Connection timeout".to_string())));
        mock
    }
    
    pub fn validation_error_client_service() -> MockClientManagementService {
        let mut mock = MockClientManagementService::new();
        mock.expect_create_client()
            .returning(|_| Err(MockError::Validation("Invalid client data".to_string())));
        mock
    }
    
    pub fn authentication_failure_firebase() -> MockFirebaseClient {
        let mut mock = MockFirebaseClient::new();
        mock.expect_authenticate_user()
            .returning(|_, _| Err(MockError::Authentication("Invalid credentials".to_string())));
        mock
    }
    
    pub fn permission_denied_service() -> MockFirebaseClient {
        let mut mock = MockFirebaseClient::new();
        mock.expect_delete_document()
            .returning(|_, _| Err(MockError::Permission("Insufficient permissions".to_string())));
        mock
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_test;
    use mockall::predicate::*;
    
    #[tokio_test]
    async fn test_mock_firebase_service() {
        let mock = MockServiceBuilder::firebase_service();
        
        // Test successful authentication
        let result = mock.authenticate_user("admin@psypsy.com", "password123").await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "mock_auth_token");
        
        // Test failed authentication
        let result = mock.authenticate_user("invalid@example.com", "wrong").await;
        assert!(result.is_err());
    }
    
    #[tokio_test]
    async fn test_mock_appointment_service() {
        let mock = MockServiceBuilder::appointment_service();
        
        // Test availability check
        let available = mock.check_availability(
            "available_prof",
            Utc::now(),
            Utc::now() + chrono::Duration::hours(1)
        ).await;
        assert!(available.unwrap());
        
        // Test busy professional
        let busy = mock.check_availability(
            "busy_professional",
            Utc::now(),
            Utc::now() + chrono::Duration::hours(1)
        ).await;
        assert!(!busy.unwrap());
    }
    
    #[tokio_test]
    async fn test_mock_client_service_validation() {
        let mock = MockServiceBuilder::client_service();
        
        // Test missing email
        let invalid_client = serde_json::json!({
            "first_name": "Test"
        });
        let result = mock.create_client(invalid_client).await;
        assert!(result.is_err());
        
        // Test valid client
        let valid_client = serde_json::json!({
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User"
        });
        let result = mock.create_client(valid_client).await;
        assert!(result.is_ok());
    }
    
    #[tokio_test]
    async fn test_hipaa_compliance_validation() {
        let mock = MockServiceBuilder::client_service();
        
        // Test HIPAA violation
        let violation_data = serde_json::json!({
            "email": "test@example.com",
            "ssn": "123-45-6789"
        });
        let result = mock.validate_hipaa_compliance(&violation_data).await;
        assert!(!result.unwrap()); // Should detect violation
        
        // Test compliant data
        let compliant_data = serde_json::json!({
            "email": "test@example.com",
            "encrypted_ssn": "encrypted_data"
        });
        let result = mock.validate_hipaa_compliance(&compliant_data).await;
        assert!(result.unwrap()); // Should be compliant
    }
    
    #[tokio_test]
    async fn test_error_simulation() {
        let mock = ErrorSimulator::network_timeout_firebase();
        let result = mock.get_document("clients", "test_id").await;
        assert!(matches!(result.unwrap_err(), MockError::Network(_)));
    }
}