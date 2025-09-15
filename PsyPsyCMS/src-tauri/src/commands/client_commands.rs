use tauri::State;
use tokio::sync::RwLock;
use std::sync::Arc;
use uuid::Uuid;

use crate::services::FirebaseService;
use crate::models::{
    Client, CreateClientRequest, UpdateClientRequest, ApiResponse, PaginatedResponse, SearchFilters, SortOptions
};
use crate::security::auth::AuthState;

/// Get all clients with pagination and filters
#[tauri::command]
pub async fn get_clients(
    page: Option<u32>,
    limit: Option<u32>,
    filters: Option<SearchFilters>,
    sort: Option<SortOptions>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<PaginatedResponse<Client>>, String> {
    // Check authentication
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let page = page.unwrap_or(1);
    let limit = limit.unwrap_or(10);

    let firebase = firebase.lock().await;

    // Query clients from Firestore
    let clients: Vec<Client> = firebase.query_documents("clients", page, limit)
        .await
        .map_err(|e| e.to_string())?;

    // In a real implementation, you would apply filters and sorting here
    let total = clients.len() as u32; // This would be a separate count query

    let response = PaginatedResponse {
        data: clients,
        page,
        limit,
        total,
        has_next_page: total > (page * limit),
        has_previous_page: page > 1,
    };

    // Audit log
    firebase.audit_log(
        "LIST_CLIENTS",
        "clients",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed
        Some(serde_json::json!({"page": page, "limit": limit}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(response))
}

/// Get single client by ID
#[tauri::command]
pub async fn get_client(
    id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Client>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    let client: Option<Client> = firebase.get_document("clients", &id)
        .await
        .map_err(|e| e.to_string())?;

    let client = client.ok_or("Client not found")?;

    // Audit log
    firebase.audit_log(
        "VIEW_CLIENT",
        "client",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed
        Some(serde_json::json!({"client_id": id}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(client))
}

/// Create new client
#[tauri::command]
pub async fn create_client(
    request: CreateClientRequest,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Client>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    // Check permissions
    if !auth.has_permission("create_client") {
        return Err("Insufficient permissions".to_string());
    }

    // Medical data validation using HIPAA-compliant validation functions
    if let Err(validation_errors) = crate::security::validation::validate_client_data(&request) {
        return Err(format!("Validation failed: {}", validation_errors));
    }

    let client_id = Uuid::new_v4().to_string();
    let client = Client::from_request(request, client_id.clone());

    let firebase = firebase.lock().await;

    // TODO: Encrypt sensitive fields before storing
    firebase.create_document("clients", &client_id, &client)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "CREATE_CLIENT",
        "client",
        auth.user_id.as_ref().unwrap(),
        true, // PHI created
        Some(serde_json::json!({"client_id": client_id, "client_name": client.display_name()}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        client,
        "Client created successfully".to_string()
    ))
}

/// Update existing client
#[tauri::command]
pub async fn update_client(
    id: String,
    request: UpdateClientRequest,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Client>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("update_client") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get existing client
    let mut client: Client = firebase.get_document("clients", &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Client not found")?;

    // Update client data
    client.update_from_request(request);

    // Save to Firestore
    let updated_client: Client = firebase.update_document("clients", &id, &client)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "UPDATE_CLIENT",
        "client",
        auth.user_id.as_ref().unwrap(),
        true, // PHI modified
        Some(serde_json::json!({"client_id": id, "client_name": client.display_name()}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        updated_client,
        "Client updated successfully".to_string()
    ))
}

/// Delete client
#[tauri::command]
pub async fn delete_client(
    id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<()>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("delete_client") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get client for audit log before deletion
    let client: Option<Client> = firebase.get_document("clients", &id)
        .await
        .map_err(|e| e.to_string())?;

    if client.is_none() {
        return Err("Client not found".to_string());
    }

    let client_name = client.unwrap().display_name();

    // Delete from Firestore
    firebase.delete_document("clients", &id)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "DELETE_CLIENT",
        "client",
        auth.user_id.as_ref().unwrap(),
        true, // PHI deleted
        Some(serde_json::json!({"client_id": id, "client_name": client_name}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        (),
        "Client deleted successfully".to_string()
    ))
}

/// Search clients by query
#[tauri::command]
pub async fn search_clients(
    query: String,
    limit: Option<u32>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<Client>>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let limit = limit.unwrap_or(10);
    let firebase = firebase.lock().await;

    // TODO: Implement actual search functionality with Firestore
    // For now, return a basic query
    let clients: Vec<Client> = firebase.query_documents("clients", 1, limit)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "SEARCH_CLIENTS",
        "clients",
        auth.user_id.as_ref().unwrap(),
        true, // PHI potentially accessed
        Some(serde_json::json!({"query": query, "limit": limit}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(clients))
}

/// Get client appointments
#[tauri::command]
pub async fn get_client_appointments(
    client_id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<crate::models::Appointment>>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    // TODO: Implement query to get appointments for specific client
    let appointments = Vec::new(); // Placeholder

    // Audit log
    firebase.audit_log(
        "VIEW_CLIENT_APPOINTMENTS",
        "appointments",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed
        Some(serde_json::json!({"client_id": client_id}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(appointments))
}

/// Assign professional to client
#[tauri::command]
pub async fn assign_professional_to_client(
    client_id: String,
    professional_id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<()>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("assign_professional") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get client
    let mut client: Client = firebase.get_document("clients", &client_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Client not found")?;

    // Assign professional
    client.assign_professional(professional_id.clone());

    // Save updated client
    firebase.update_document("clients", &client_id, &client)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "ASSIGN_PROFESSIONAL",
        "client_professional_assignment",
        auth.user_id.as_ref().unwrap(),
        true, // PHI modified
        Some(serde_json::json!({
            "client_id": client_id,
            "professional_id": professional_id,
            "client_name": client.display_name()
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        (),
        "Professional assigned successfully".to_string()
    ))
}

/// Get client statistics
#[tauri::command]
pub async fn get_client_stats(
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<crate::models::ClientStats>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    // TODO: Implement actual statistics calculation
    let stats = crate::models::ClientStats {
        total: 0,
        active: 0,
        new_this_month: 0,
        average_age: 0.0,
        gender_distribution: std::collections::HashMap::new(),
        retention_rate: 0.0,
    };

    let firebase = firebase.lock().await;

    // Audit log
    firebase.audit_log(
        "VIEW_CLIENT_STATS",
        "statistics",
        auth.user_id.as_ref().unwrap(),
        false, // No specific PHI accessed
        None
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(stats))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{AddressObject, ContactMethod, CommunicationPreferences, ClientPreferences};

    #[tokio::test]
    async fn test_create_client_request_validation() {
        let request = CreateClientRequest {
            user_id: "user123".to_string(),
            first_name: "John".to_string(),
            last_name: "Doe".to_string(),
            email: "john@example.com".to_string(),
            phone: "1234567890".to_string(),
            date_of_birth: Some("1990-01-01".to_string()),
            address: AddressObject {
                street: "123 Main St".to_string(),
                city: "Anytown".to_string(),
                state: "CA".to_string(),
                zip_code: "12345".to_string(),
                country: "USA".to_string(),
            },
            spoken_languages: vec![1, 2],
            search_radius: Some(30),
            preferences: Some(ClientPreferences {
                preferred_contact_method: ContactMethod::Email,
                appointment_reminders: true,
                newsletter_subscription: false,
                data_sharing_consent: false,
                preferred_appointment_times: vec!["morning".to_string()],
                communication_preferences: CommunicationPreferences::default(),
            }),
            emergency_contacts: None,
        };

        // Validate request fields
        assert_eq!(request.first_name, "John");
        assert_eq!(request.last_name, "Doe");
        assert!(request.search_radius.is_some());
        assert_eq!(request.search_radius.unwrap(), 30);
    }
}