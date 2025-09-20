/**
 * Firebase Functions API Service for Tauri Backend
 *
 * This service acts as a bridge between Tauri commands and Firebase Functions,
 * providing environment-aware switching between dev and prod endpoints.
 */

use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::env;
use std::time::Duration;

use crate::security::audit::hipaa_audit_log;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: String,
    pub compliance: ComplianceInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceInfo {
    pub data_residency: String,
    pub standards: Vec<String>,
    pub audit_required: bool,
}

#[derive(Debug, Clone)]
pub struct EnvironmentConfig {
    pub name: String,
    pub functions_base_url: String,
    pub timeout_seconds: u64,
    pub max_retries: u32,
}

impl EnvironmentConfig {
    pub fn new() -> Self {
        // Check for explicit emulator override
        let use_emulator = env::var("FIREBASE_USE_EMULATOR")
            .unwrap_or_else(|_| "false".to_string())
            .parse::<bool>()
            .unwrap_or(false);

        // Check if we're in development mode
        let is_dev = env::var("PROFILE").unwrap_or_else(|_| "release".to_string()) == "debug";

        if use_emulator || is_dev {
            Self {
                name: "development".to_string(),
                functions_base_url: "http://127.0.0.1:8780/psypsy-dev-local/us-east4".to_string(),
                timeout_seconds: 30,
                max_retries: 2,
            }
        } else {
            let project_id = env::var("FIREBASE_PROJECT_ID")
                .expect("FIREBASE_PROJECT_ID must be set for production");

            Self {
                name: "production".to_string(),
                functions_base_url: format!("https://us-east4-{}.cloudfunctions.net", project_id),
                timeout_seconds: 60,
                max_retries: 3,
            }
        }
    }

    pub fn build_function_url(&self, function_name: &str) -> String {
        format!("{}/{}", self.functions_base_url, function_name)
    }
}

pub struct FirebaseFunctionsApi {
    client: Client,
    config: EnvironmentConfig,
}

impl FirebaseFunctionsApi {
    pub fn new() -> Self {
        let config = EnvironmentConfig::new();

        let client = Client::builder()
            .timeout(Duration::from_secs(config.timeout_seconds))
            .build()
            .expect("Failed to create HTTP client");

        tracing::info!("Firebase Functions API initialized for {} environment", config.name);
        tracing::info!("Base URL: {}", config.functions_base_url);

        Self { client, config }
    }

    /// Make a request to a Firebase Function with retry logic
    async fn call_function<T, R>(
        &self,
        function_name: &str,
        payload: Option<T>,
        contains_phi: bool,
    ) -> Result<ApiResponse<R>, Box<dyn std::error::Error + Send + Sync>>
    where
        T: Serialize + Send,
        R: for<'de> Deserialize<'de> + Send,
    {
        let url = self.config.build_function_url(function_name);

        // Audit the API call
        self.audit_api_call(function_name, contains_phi).await;

        let mut attempts = 0;
        let mut last_error = None;

        while attempts < self.config.max_retries {
            attempts += 1;

            let mut request = self.client.post(&url)
                .header("Content-Type", "application/json");

            if let Some(ref data) = payload {
                request = request.json(data);
            }

            match request.send().await {
                Ok(response) => {
                    if response.status().is_success() {
                        match response.json::<ApiResponse<R>>().await {
                            Ok(api_response) => {
                                self.audit_api_success(function_name, contains_phi).await;
                                return Ok(api_response);
                            }
                            Err(e) => {
                                last_error = Some(format!("JSON parse error: {}", e));
                            }
                        }
                    } else {
                        let status = response.status();
                        let error_text = response.text().await
                            .unwrap_or_else(|_| "Unknown error".to_string());
                        last_error = Some(format!("HTTP {}: {}", status, error_text));
                    }
                }
                Err(e) => {
                    last_error = Some(format!("Request error: {}", e));
                }
            }

            if attempts < self.config.max_retries {
                tracing::warn!("Attempt {} failed for {}, retrying...", attempts, function_name);
                tokio::time::sleep(Duration::from_millis(1000 * attempts as u64)).await;
            }
        }

        let error_msg = last_error.unwrap_or_else(|| "Unknown error".to_string());
        self.audit_api_error(function_name, &error_msg, contains_phi).await;

        Err(error_msg.into())
    }

    // === AUTHENTICATION FUNCTIONS ===

    pub async fn authenticate_user(
        &self,
        email: &str,
        password: &str,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let payload = serde_json::json!({
            "email": email,
            "password": password
        });

        self.call_function("authenticateUser", Some(payload), true).await
    }

    pub async fn create_user_account(
        &self,
        user_data: Value,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        self.call_function("createUserAccount", Some(user_data), true).await
    }

    pub async fn reset_password(
        &self,
        email: &str,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let payload = serde_json::json!({
            "email": email
        });

        self.call_function("resetPassword", Some(payload), false).await
    }

    // === PROFESSIONAL FUNCTIONS ===

    pub async fn get_professionals(
        &self,
        filters: Option<Value>,
    ) -> Result<ApiResponse<Vec<Value>>, Box<dyn std::error::Error + Send + Sync>> {
        self.call_function("getProfessionals", filters, true).await
    }

    pub async fn create_professional(
        &self,
        professional_data: Value,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        self.call_function("createProfessional", Some(professional_data), true).await
    }

    pub async fn update_professional(
        &self,
        professional_id: &str,
        updates: Value,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let mut payload = updates;
        payload["professionalId"] = professional_id.into();

        self.call_function("updateProfessional", Some(payload), true).await
    }

    pub async fn delete_professional(
        &self,
        professional_id: &str,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let payload = serde_json::json!({
            "professionalId": professional_id
        });

        self.call_function("deleteProfessional", Some(payload), false).await
    }

    // === CLIENT FUNCTIONS ===

    pub async fn get_clients(
        &self,
        filters: Option<Value>,
    ) -> Result<ApiResponse<Vec<Value>>, Box<dyn std::error::Error + Send + Sync>> {
        self.call_function("getClients", filters, true).await
    }

    pub async fn create_client(
        &self,
        client_data: Value,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        self.call_function("createClient", Some(client_data), true).await
    }

    pub async fn update_client(
        &self,
        client_id: &str,
        updates: Value,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let mut payload = updates;
        payload["clientId"] = client_id.into();

        self.call_function("updateClient", Some(payload), true).await
    }

    pub async fn delete_client(
        &self,
        client_id: &str,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let payload = serde_json::json!({
            "clientId": client_id
        });

        self.call_function("deleteClient", Some(payload), false).await
    }

    pub async fn search_clients(
        &self,
        query: &str,
        filters: Option<Value>,
    ) -> Result<ApiResponse<Vec<Value>>, Box<dyn std::error::Error + Send + Sync>> {
        let mut payload = serde_json::json!({
            "query": query
        });

        if let Some(filters) = filters {
            payload["filters"] = filters;
        }

        self.call_function("searchClients", Some(payload), true).await
    }

    // === APPOINTMENT FUNCTIONS ===

    pub async fn create_appointment(
        &self,
        appointment_data: Value,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        self.call_function("createAppointment", Some(appointment_data), true).await
    }

    pub async fn get_appointments(
        &self,
        filters: Option<Value>,
    ) -> Result<ApiResponse<Vec<Value>>, Box<dyn std::error::Error + Send + Sync>> {
        self.call_function("getAppointments", filters, true).await
    }

    pub async fn update_appointment(
        &self,
        appointment_id: &str,
        updates: Value,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let mut payload = updates;
        payload["appointmentId"] = appointment_id.into();

        self.call_function("updateAppointment", Some(payload), true).await
    }

    pub async fn delete_appointment(
        &self,
        appointment_id: &str,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let payload = serde_json::json!({
            "appointmentId": appointment_id
        });

        self.call_function("deleteAppointment", Some(payload), false).await
    }

    pub async fn get_professional_appointments(
        &self,
        professional_id: &str,
        filters: Option<Value>,
    ) -> Result<ApiResponse<Vec<Value>>, Box<dyn std::error::Error + Send + Sync>> {
        let mut payload = serde_json::json!({
            "professionalId": professional_id
        });

        if let Some(filters) = filters {
            for (key, value) in filters.as_object().unwrap() {
                payload[key] = value.clone();
            }
        }

        self.call_function("getProfessionalAppointments", Some(payload), true).await
    }

    pub async fn get_client_appointments(
        &self,
        client_id: &str,
        filters: Option<Value>,
    ) -> Result<ApiResponse<Vec<Value>>, Box<dyn std::error::Error + Send + Sync>> {
        let mut payload = serde_json::json!({
            "clientId": client_id
        });

        if let Some(filters) = filters {
            for (key, value) in filters.as_object().unwrap() {
                payload[key] = value.clone();
            }
        }

        self.call_function("getClientAppointments", Some(payload), true).await
    }

    // === NOTIFICATION FUNCTIONS ===

    pub async fn send_push_notification(
        &self,
        recipient_id: &str,
        message: &str,
        data: Option<Value>,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let mut payload = serde_json::json!({
            "recipientId": recipient_id,
            "message": message
        });

        if let Some(data) = data {
            payload["data"] = data;
        }

        self.call_function("sendPushNotification", Some(payload), false).await
    }

    pub async fn send_sms(
        &self,
        phone_number: &str,
        message: &str,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let payload = serde_json::json!({
            "phoneNumber": phone_number,
            "message": message
        });

        self.call_function("sendSMS", Some(payload), true).await
    }

    pub async fn send_combined_notification(
        &self,
        recipient_id: &str,
        message: &str,
        data: Option<Value>,
    ) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        let mut payload = serde_json::json!({
            "recipientId": recipient_id,
            "message": message
        });

        if let Some(data) = data {
            payload["data"] = data;
        }

        self.call_function("sendCombinedNotification", Some(payload), true).await
    }

    // === UTILITY FUNCTIONS ===

    pub async fn test_connection(&self) -> Result<ApiResponse<Value>, Box<dyn std::error::Error + Send + Sync>> {
        self.call_function::<Value, Value>("helloWorld", None, false).await
    }

    // === AUDIT HELPERS ===

    async fn audit_api_call(&self, function_name: &str, contains_phi: bool) {
        tracing::info!("API call: {} (environment: {}, PHI: {})",
            function_name, self.config.name, contains_phi);
    }

    async fn audit_api_success(&self, function_name: &str, contains_phi: bool) {
        tracing::info!("API success: {} (environment: {}, PHI: {})",
            function_name, self.config.name, contains_phi);
    }

    async fn audit_api_error(&self, function_name: &str, error: &str, contains_phi: bool) {
        tracing::error!("API error: {} - {} (environment: {}, PHI: {})",
            function_name, error, self.config.name, contains_phi);
    }

    pub fn get_environment_info(&self) -> HashMap<String, String> {
        let mut info = HashMap::new();
        info.insert("environment".to_string(), self.config.name.clone());
        info.insert("base_url".to_string(), self.config.functions_base_url.clone());
        info.insert("timeout".to_string(), self.config.timeout_seconds.to_string());
        info.insert("max_retries".to_string(), self.config.max_retries.to_string());
        info
    }
}

// Thread-safe singleton for Tauri state management
use std::sync::Arc;
use tokio::sync::Mutex;

pub type FirebaseFunctionsApiState = Arc<Mutex<FirebaseFunctionsApi>>;

impl Default for FirebaseFunctionsApiState {
    fn default() -> Self {
        Arc::new(Mutex::new(FirebaseFunctionsApi::new()))
    }
}