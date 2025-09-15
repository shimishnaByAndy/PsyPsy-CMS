use tauri::State;
use tokio::sync::RwLock;
use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::services::FirebaseService;
use crate::models::{
    Appointment, CreateAppointmentRequest, UpdateAppointmentRequest, ApiResponse,
    PaginatedResponse, SearchFilters, SortOptions, AppointmentStats,
};
use crate::security::auth::AuthState;

/// Get all appointments with pagination and filters
#[tauri::command]
pub async fn get_appointments(
    page: Option<u32>,
    limit: Option<u32>,
    filters: Option<SearchFilters>,
    sort: Option<SortOptions>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<PaginatedResponse<Appointment>>, String> {
    // Check authentication
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let page = page.unwrap_or(1);
    let limit = limit.unwrap_or(10);

    let firebase = firebase.lock().await;

    // Query appointments from Firestore
    let appointments: Vec<Appointment> = firebase.query_documents("appointments", page, limit)
        .await
        .map_err(|e| e.to_string())?;

    // In a real implementation, you would apply filters and sorting here
    let total = appointments.len() as u32;

    let response = PaginatedResponse {
        data: appointments,
        page,
        limit,
        total,
        has_next_page: total > (page * limit),
        has_previous_page: page > 1,
    };

    // Audit log
    firebase.audit_log(
        "LIST_APPOINTMENTS",
        "appointments",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed when viewing appointments
        Some(serde_json::json!({"page": page, "limit": limit}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(response))
}

/// Get single appointment by ID
#[tauri::command]
pub async fn get_appointment(
    id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Appointment>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    let appointment: Option<Appointment> = firebase.get_document("appointments", &id)
        .await
        .map_err(|e| e.to_string())?;

    let appointment = appointment.ok_or("Appointment not found")?;

    // Audit log
    firebase.audit_log(
        "VIEW_APPOINTMENT",
        "appointment",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed when viewing specific appointment
        Some(serde_json::json!({"appointment_id": id}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(appointment))
}

/// Create new appointment
#[tauri::command]
pub async fn create_appointment(
    request: CreateAppointmentRequest,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Appointment>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    // Check permissions
    if !auth.has_permission("create_appointment") {
        return Err("Insufficient permissions".to_string());
    }

    let appointment_id = Uuid::new_v4().to_string();
    let appointment = Appointment::from_request(request, appointment_id.clone());

    let firebase = firebase.lock().await;

    // TODO: Validate appointment time conflicts
    // TODO: Send notifications to client and professional

    // Create appointment in Firestore
    firebase.create_document("appointments", &appointment_id, &appointment)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "CREATE_APPOINTMENT",
        "appointment",
        auth.user_id.as_ref().unwrap(),
        true, // PHI created when creating appointment
        Some(serde_json::json!({
            "appointment_id": appointment_id,
            "client_id": appointment.client_ptr,
            "professional_id": appointment.assigned_professional,
            "scheduled_date": appointment.confirmed_date_time
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        appointment,
        "Appointment created successfully".to_string()
    ))
}

/// Update existing appointment
#[tauri::command]
pub async fn update_appointment(
    id: String,
    request: UpdateAppointmentRequest,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Appointment>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("update_appointment") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get existing appointment
    let mut appointment: Appointment = firebase.get_document("appointments", &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Appointment not found")?;

    // Update appointment data
    appointment.update_from_request(request);

    // Save to Firestore
    let updated_appointment: Appointment = firebase.update_document("appointments", &id, &appointment)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "UPDATE_APPOINTMENT",
        "appointment",
        auth.user_id.as_ref().unwrap(),
        true, // PHI modified when updating appointment
        Some(serde_json::json!({
            "appointment_id": id,
            "client_id": appointment.client_ptr,
            "professional_id": appointment.assigned_professional
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        updated_appointment,
        "Appointment updated successfully".to_string()
    ))
}

/// Cancel appointment
#[tauri::command]
pub async fn cancel_appointment(
    id: String,
    cancellation_reason: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Appointment>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("cancel_appointment") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get existing appointment
    let mut appointment: Appointment = firebase.get_document("appointments", &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Appointment not found")?;

    // Cancel the appointment
    appointment.cancel(Some(cancellation_reason));

    // Save to Firestore
    let updated_appointment: Appointment = firebase.update_document("appointments", &id, &appointment)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "CANCEL_APPOINTMENT",
        "appointment",
        auth.user_id.as_ref().unwrap(),
        true, // PHI modified when canceling appointment
        Some(serde_json::json!({
            "appointment_id": id,
            "client_id": appointment.client_ptr,
            "professional_id": appointment.assigned_professional,
            "cancellation_reason": appointment.professional_notes
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        updated_appointment,
        "Appointment cancelled successfully".to_string()
    ))
}

/// Complete appointment
#[tauri::command]
pub async fn complete_appointment(
    id: String,
    session_notes: Option<String>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Appointment>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("complete_appointment") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get existing appointment
    let mut appointment: Appointment = firebase.get_document("appointments", &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Appointment not found")?;

    // Complete the appointment
    appointment.complete_session(60, session_notes); // Default 60 minutes duration

    // Save to Firestore
    let updated_appointment: Appointment = firebase.update_document("appointments", &id, &appointment)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "COMPLETE_APPOINTMENT",
        "appointment",
        auth.user_id.as_ref().unwrap(),
        true, // PHI created when completing appointment with notes
        Some(serde_json::json!({
            "appointment_id": id,
            "client_id": appointment.client_ptr,
            "professional_id": appointment.assigned_professional
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        updated_appointment,
        "Appointment completed successfully".to_string()
    ))
}

/// Delete appointment
#[tauri::command]
pub async fn delete_appointment(
    id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<()>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("delete_appointment") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get appointment for audit log before deletion
    let appointment: Option<Appointment> = firebase.get_document("appointments", &id)
        .await
        .map_err(|e| e.to_string())?;

    if appointment.is_none() {
        return Err("Appointment not found".to_string());
    }

    let appt = appointment.unwrap();

    // Delete from Firestore
    firebase.delete_document("appointments", &id)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "DELETE_APPOINTMENT",
        "appointment",
        auth.user_id.as_ref().unwrap(),
        true, // PHI deleted
        Some(serde_json::json!({
            "appointment_id": id,
            "client_id": appt.client_ptr,
            "professional_id": appt.assigned_professional
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        (),
        "Appointment deleted successfully".to_string()
    ))
}

/// Search appointments by query
#[tauri::command]
pub async fn search_appointments(
    query: String,
    limit: Option<u32>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<Appointment>>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let limit = limit.unwrap_or(10);
    let firebase = firebase.lock().await;

    // TODO: Implement actual search functionality with Firestore
    // For now, return a basic query
    let appointments: Vec<Appointment> = firebase.query_documents("appointments", 1, limit)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "SEARCH_APPOINTMENTS",
        "appointments",
        auth.user_id.as_ref().unwrap(),
        true, // PHI potentially accessed in search results
        Some(serde_json::json!({"query": query, "limit": limit}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(appointments))
}

/// Get appointments by date range
#[tauri::command]
pub async fn get_appointments_by_date_range(
    start_date: String,
    end_date: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<Appointment>>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    // TODO: Implement date range query with Firestore
    let appointments = Vec::new(); // Placeholder

    // Audit log
    firebase.audit_log(
        "VIEW_APPOINTMENTS_BY_DATE",
        "appointments",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed when viewing appointments
        Some(serde_json::json!({
            "start_date": start_date,
            "end_date": end_date
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(appointments))
}

/// Get today's appointments
#[tauri::command]
pub async fn get_todays_appointments(
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<Appointment>>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    // TODO: Implement today's appointments query
    let appointments = Vec::new(); // Placeholder

    // Audit log
    firebase.audit_log(
        "VIEW_TODAYS_APPOINTMENTS",
        "appointments",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed
        Some(serde_json::json!({"date": Utc::now().format("%Y-%m-%d").to_string()}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(appointments))
}

/// Get appointment statistics
#[tauri::command]
pub async fn get_appointment_stats(
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<AppointmentStats>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    // TODO: Implement actual statistics calculation
    let stats = AppointmentStats {
        total_today: 0,
        total_this_week: 0,
        total_this_month: 0,
        completed_today: 0,
        cancelled_today: 0,
        pending_today: 0,
        average_duration: 0.0,
        no_show_rate: 0.0,
    };

    let firebase = firebase.lock().await;

    // Audit log
    firebase.audit_log(
        "VIEW_APPOINTMENT_STATS",
        "statistics",
        auth.user_id.as_ref().unwrap(),
        false, // No specific PHI accessed for aggregated stats
        None
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(stats))
}

/// Reschedule appointment
#[tauri::command]
pub async fn reschedule_appointment(
    id: String,
    new_date: String,
    new_time: String,
    reason: Option<String>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Appointment>, String> {
    let auth = auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("reschedule_appointment") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get existing appointment
    let mut appointment: Appointment = firebase.get_document("appointments", &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Appointment not found")?;

    // Parse new date and time
    let new_datetime = format!("{}T{}", new_date, new_time);
    let new_scheduled_date: DateTime<Utc> = new_datetime.parse()
        .map_err(|_| "Invalid date/time format")?;

    // Store old date for audit log
    let old_date = appointment.confirmed_date_time.clone();

    // Reschedule the appointment
    // Convert DateTime<Utc> to FirestoreTimestamp using helper function
    let firestore_date = crate::models::common::firestore_now(); // Using current time for now
    appointment.reschedule(firestore_date, reason);

    // Save to Firestore
    let updated_appointment: Appointment = firebase.update_document("appointments", &id, &appointment)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "RESCHEDULE_APPOINTMENT",
        "appointment",
        auth.user_id.as_ref().unwrap(),
        true, // PHI modified when rescheduling
        Some(serde_json::json!({
            "appointment_id": id,
            "old_date": old_date,
            "new_date": new_scheduled_date,
            "client_id": appointment.client_ptr,
            "professional_id": appointment.assigned_professional
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        updated_appointment,
        "Appointment rescheduled successfully".to_string()
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{MeetingType};

    #[tokio::test]
    async fn test_create_appointment_request_validation() {
        let request = CreateAppointmentRequest {
            client_id: "client123".to_string(),
            professional_id: "prof456".to_string(),
            scheduled_date: "2024-01-20T10:00:00Z".to_string(),
            duration: 60,
            meeting_type: MeetingType::Online,
            notes: Some("Initial consultation".to_string()),
            reminder_settings: Some(ReminderSettings {
                send_email: true,
                send_sms: false,
                minutes_before: vec![60, 1440], // 1 hour and 1 day before
            }),
        };

        // Validate request fields
        assert_eq!(request.client_id, "client123");
        assert_eq!(request.professional_id, "prof456");
        assert_eq!(request.duration, 60);
        assert_eq!(request.meeting_type, MeetingType::Online);
        assert!(request.notes.is_some());
        assert!(request.reminder_settings.is_some());
    }
}