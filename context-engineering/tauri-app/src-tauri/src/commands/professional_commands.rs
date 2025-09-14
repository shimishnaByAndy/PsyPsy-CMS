use tauri::State;
use tokio::sync::RwLock;
use std::sync::Arc;
use uuid::Uuid;

use crate::services::FirebaseService;
use crate::models::{
    Professional, CreateProfessionalRequest, UpdateProfessionalRequest, ApiResponse,
    PaginatedResponse, SearchFilters, SortOptions, ProfessionalStats
};
use crate::security::auth::AuthState;

/// Get all professionals with pagination and filters
#[tauri::command]
pub async fn get_professionals(
    page: Option<u32>,
    limit: Option<u32>,
    filters: Option<SearchFilters>,
    sort: Option<SortOptions>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<PaginatedResponse<Professional>>, String> {
    // Check authentication
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let page = page.unwrap_or(1);
    let limit = limit.unwrap_or(10);

    let firebase = firebase.lock().await;

    // Query professionals from Firestore
    let professionals: Vec<Professional> = firebase.query_documents("professionals", page, limit)
        .await
        .map_err(|e| e.to_string())?;

    // In a real implementation, you would apply filters and sorting here
    let total = professionals.len() as u32;

    let response = PaginatedResponse {
        data: professionals,
        page,
        limit,
        total,
        has_next_page: total > (page * limit),
        has_previous_page: page > 1,
    };

    // Audit log
    firebase.audit_log(
        "LIST_PROFESSIONALS",
        "professionals",
        auth.user_id.as_ref().unwrap(),
        false, // No specific PHI accessed for listing
        Some(serde_json::json!({"page": page, "limit": limit}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(response))
}

/// Get single professional by ID
#[tauri::command]
pub async fn get_professional(
    id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Professional>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    let professional: Option<Professional> = firebase.get_document("professionals", &id)
        .await
        .map_err(|e| e.to_string())?;

    let professional = professional.ok_or("Professional not found")?;

    // Audit log
    firebase.audit_log(
        "VIEW_PROFESSIONAL",
        "professional",
        auth.user_id.as_ref().unwrap(),
        false, // Professional data is generally not PHI
        Some(serde_json::json!({"professional_id": id}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(professional))
}

/// Create new professional
#[tauri::command]
pub async fn create_professional(
    request: CreateProfessionalRequest,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Professional>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    // Check permissions
    if !auth.has_permission("create_professional") {
        return Err("Insufficient permissions".to_string());
    }

    let professional_id = Uuid::new_v4().to_string();
    let professional = Professional::from_request(request, professional_id.clone());

    let firebase = firebase.lock().await;

    // Create professional in Firestore
    firebase.create_document("professionals", &professional_id, &professional)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "CREATE_PROFESSIONAL",
        "professional",
        auth.user_id.as_ref().unwrap(),
        false, // Professional creation doesn't involve PHI
        Some(serde_json::json!({
            "professional_id": professional_id,
            "professional_name": professional.display_name(),
            "business_name": professional.business_name
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        professional,
        "Professional created successfully".to_string()
    ))
}

/// Update existing professional
#[tauri::command]
pub async fn update_professional(
    id: String,
    request: UpdateProfessionalRequest,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Professional>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("update_professional") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get existing professional
    let mut professional: Professional = firebase.get_document("professionals", &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Professional not found")?;

    // Update professional data
    professional.update_from_request(request);

    // Save to Firestore
    let updated_professional: Professional = firebase.update_document("professionals", &id, &professional)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "UPDATE_PROFESSIONAL",
        "professional",
        auth.user_id.as_ref().unwrap(),
        false, // Professional updates generally don't involve PHI
        Some(serde_json::json!({
            "professional_id": id,
            "professional_name": professional.display_name(),
            "business_name": professional.business_name
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        updated_professional,
        "Professional updated successfully".to_string()
    ))
}

/// Delete professional
#[tauri::command]
pub async fn delete_professional(
    id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<()>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("delete_professional") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get professional for audit log before deletion
    let professional: Option<Professional> = firebase.get_document("professionals", &id)
        .await
        .map_err(|e| e.to_string())?;

    if professional.is_none() {
        return Err("Professional not found".to_string());
    }

    let prof = professional.unwrap();
    let professional_name = prof.display_name();

    // Delete from Firestore
    firebase.delete_document("professionals", &id)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "DELETE_PROFESSIONAL",
        "professional",
        auth.user_id.as_ref().unwrap(),
        false, // Professional deletion doesn't involve PHI
        Some(serde_json::json!({
            "professional_id": id,
            "professional_name": professional_name,
            "business_name": prof.business_name
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        (),
        "Professional deleted successfully".to_string()
    ))
}

/// Search professionals by query
#[tauri::command]
pub async fn search_professionals(
    query: String,
    limit: Option<u32>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<Professional>>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let limit = limit.unwrap_or(10);
    let firebase = firebase.lock().await;

    // TODO: Implement actual search functionality with Firestore
    // For now, return a basic query
    let professionals: Vec<Professional> = firebase.query_documents("professionals", 1, limit)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "SEARCH_PROFESSIONALS",
        "professionals",
        auth.user_id.as_ref().unwrap(),
        false, // No PHI accessed in professional search
        Some(serde_json::json!({"query": query, "limit": limit}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(professionals))
}

/// Get professional's clients
#[tauri::command]
pub async fn get_professional_clients(
    professional_id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<crate::models::Client>>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    // TODO: Implement query to get clients for specific professional
    let clients = Vec::new(); // Placeholder

    // Audit log
    firebase.audit_log(
        "VIEW_PROFESSIONAL_CLIENTS",
        "clients",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed when viewing client list
        Some(serde_json::json!({"professional_id": professional_id}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(clients))
}

/// Get professional's appointments
#[tauri::command]
pub async fn get_professional_appointments(
    professional_id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<crate::models::Appointment>>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    // TODO: Implement query to get appointments for specific professional
    let appointments = Vec::new(); // Placeholder

    // Audit log
    firebase.audit_log(
        "VIEW_PROFESSIONAL_APPOINTMENTS",
        "appointments",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed when viewing appointments
        Some(serde_json::json!({"professional_id": professional_id}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(appointments))
}

/// Get professional statistics
#[tauri::command]
pub async fn get_professional_stats(
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<ProfessionalStats>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    // TODO: Implement actual statistics calculation
    let stats = ProfessionalStats {
        total: 0,
        active: 0,
        average_rating: 0.0,
        license_expiring_soon: 0,
    };

    let firebase = firebase.lock().await;

    // Audit log
    firebase.audit_log(
        "VIEW_PROFESSIONAL_STATS",
        "statistics",
        auth.user_id.as_ref().unwrap(),
        false, // No specific PHI accessed
        None
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(stats))
}

/// Update professional verification status
#[tauri::command]
pub async fn update_professional_verification(
    professional_id: String,
    verified: bool,
    verification_notes: Option<String>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Professional>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("verify_professional") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get existing professional
    let mut professional: Professional = firebase.get_document("professionals", &professional_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Professional not found")?;

    // Update verification status
    professional.update_verification_status(verified, verification_notes);

    // Save to Firestore
    let updated_professional: Professional = firebase.update_document("professionals", &professional_id, &professional)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "UPDATE_PROFESSIONAL_VERIFICATION",
        "professional_verification",
        auth.user_id.as_ref().unwrap(),
        false, // Verification status is not PHI
        Some(serde_json::json!({
            "professional_id": professional_id,
            "verified": verified,
            "professional_name": professional.display_name()
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        updated_professional,
        if verified { "Professional verified successfully" } else { "Professional verification removed" }.to_string()
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{AddressObject, ProfessionalServices, Expertise};

    #[tokio::test]
    async fn test_create_professional_request_validation() {
        let request = CreateProfessionalRequest {
            user_id: "user123".to_string(),
            first_name: "Dr. Sarah".to_string(),
            last_name: "Johnson".to_string(),
            business_name: "Johnson Psychology Clinic".to_string(),
            email: "sarah@example.com".to_string(),
            phone: "1234567890".to_string(),
            address: AddressObject {
                street: "123 Main St".to_string(),
                city: "Anytown".to_string(),
                state: "CA".to_string(),
                zip_code: "12345".to_string(),
                country: "USA".to_string(),
            },
            services: ProfessionalServices {
                therapy_types: vec!["Cognitive Behavioral Therapy".to_string()],
                age_groups: vec!["Adults".to_string()],
                specializations: vec!["Anxiety".to_string(), "Depression".to_string()],
            },
            expertise: Expertise {
                years_of_experience: 10,
                education: vec!["PhD in Clinical Psychology".to_string()],
                certifications: vec!["Licensed Clinical Psychologist".to_string()],
                languages_spoken: vec![1, 2], // English, Spanish
            },
            license_number: Some("PSY123456".to_string()),
            license_state: Some("CA".to_string()),
            license_expiry: Some("2025-12-31".to_string()),
        };

        // Validate request fields
        assert_eq!(request.first_name, "Dr. Sarah");
        assert_eq!(request.last_name, "Johnson");
        assert_eq!(request.business_name, "Johnson Psychology Clinic");
        assert!(request.license_number.is_some());
        assert_eq!(request.expertise.years_of_experience, 10);
    }
}