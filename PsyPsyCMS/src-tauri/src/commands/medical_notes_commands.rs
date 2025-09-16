use crate::services::encrypted_storage::{EncryptedNoteStorage, MedicalNote, QuebecComplianceMetadata, SyncStatus, AuditEntry};
use tokio::sync::Mutex;
use tauri::{AppHandle, State};
use chrono::Utc;

// Global storage instance
pub type StorageState = Mutex<Option<EncryptedNoteStorage>>;

#[derive(serde::Serialize)]
pub struct CommandResult<T> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

impl<T> CommandResult<T> {
    fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
        }
    }
}

/// Initialize encrypted storage with user passphrase
#[tauri::command]
pub async fn initialize_encrypted_storage(
    app_handle: AppHandle,
    storage_state: State<'_, StorageState>,
    passphrase: String,
) -> Result<CommandResult<String>, String> {
    match EncryptedNoteStorage::new(&app_handle, &passphrase) {
        Ok(storage) => {
            let mut state = storage_state.lock().await;
            *state = Some(storage);
            Ok(CommandResult::success("Storage initialized successfully".to_string()))
        }
        Err(e) => Ok(CommandResult::error(format!("Failed to initialize storage: {}", e))),
    }
}

/// Save a medical note with encryption
#[tauri::command]
pub async fn save_medical_note(
    storage_state: State<'_, StorageState>,
    note: MedicalNote,
    user_id: String,
) -> Result<CommandResult<String>, String> {
    let storage_guard = storage_state.lock().await;

    if let Some(storage) = storage_guard.as_ref() {
        match storage.save_note(note, &user_id).await {
            Ok(note_id) => Ok(CommandResult::success(note_id)),
            Err(e) => Ok(CommandResult::error(format!("Failed to save note: {}", e))),
        }
    } else {
        Ok(CommandResult::error("Storage not initialized".to_string()))
    }
}

/// Retrieve a medical note by ID
#[tauri::command]
pub async fn get_medical_note(
    storage_state: State<'_, StorageState>,
    note_id: String,
    user_id: String,
) -> Result<CommandResult<Option<MedicalNote>>, String> {
    let storage_guard = storage_state.lock().await;

    if let Some(storage) = storage_guard.as_ref() {
        match storage.get_note(&note_id, &user_id).await {
            Ok(note) => Ok(CommandResult::success(note)),
            Err(e) => Ok(CommandResult::error(format!("Failed to get note: {}", e))),
        }
    } else {
        Ok(CommandResult::error("Storage not initialized".to_string()))
    }
}

/// List medical notes for a patient
#[tauri::command]
pub async fn list_patient_notes(
    storage_state: State<'_, StorageState>,
    patient_id: String,
    user_id: String,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<CommandResult<Vec<MedicalNote>>, String> {
    let storage_guard = storage_state.lock().await;

    if let Some(storage) = storage_guard.as_ref() {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        match storage.list_notes_for_patient(&patient_id, &user_id, limit, offset).await {
            Ok(notes) => Ok(CommandResult::success(notes)),
            Err(e) => Ok(CommandResult::error(format!("Failed to list notes: {}", e))),
        }
    } else {
        Ok(CommandResult::error("Storage not initialized".to_string()))
    }
}

/// Delete a medical note
#[tauri::command]
pub async fn delete_medical_note(
    storage_state: State<'_, StorageState>,
    note_id: String,
    user_id: String,
) -> Result<CommandResult<String>, String> {
    let storage_guard = storage_state.lock().await;

    if let Some(storage) = storage_guard.as_ref() {
        match storage.delete_note(&note_id, &user_id).await {
            Ok(_) => Ok(CommandResult::success("Note deleted successfully".to_string())),
            Err(e) => Ok(CommandResult::error(format!("Failed to delete note: {}", e))),
        }
    } else {
        Ok(CommandResult::error("Storage not initialized".to_string()))
    }
}

/// Get audit trail for compliance
#[tauri::command]
pub async fn get_audit_trail(
    storage_state: State<'_, StorageState>,
    note_id: Option<String>,
    user_id: String,
) -> Result<CommandResult<Vec<AuditEntry>>, String> {
    let storage_guard = storage_state.lock().await;

    if let Some(storage) = storage_guard.as_ref() {
        match storage.get_audit_trail(note_id.as_deref(), &user_id).await {
            Ok(audit_entries) => Ok(CommandResult::success(audit_entries)),
            Err(e) => Ok(CommandResult::error(format!("Failed to get audit trail: {}", e))),
        }
    } else {
        Ok(CommandResult::error("Storage not initialized".to_string()))
    }
}

/// Create a new medical note with Quebec compliance defaults
#[tauri::command]
pub async fn create_medical_note(
    patient_id: String,
    template_type: String,
    user_id: String,
) -> Result<CommandResult<MedicalNote>, String> {
    let note = MedicalNote {
        id: String::new(), // Will be generated on save
        patient_id,
        content: String::new(),
        template_type,
        created_at: Utc::now(),
        modified_at: Utc::now(),
        consent_obtained: false, // Must be explicitly set by user
        encrypted: true,
        deidentified: true,
        sync_status: SyncStatus::Local,
        quebec_compliance: QuebecComplianceMetadata {
            law_25_consent: false, // Must be explicitly set by user
            data_minimization: true,
            retention_period_days: 2555, // 7 years as per Quebec medical record requirements
            professional_order: None,
            audit_trail: Vec::new(),
        },
    };

    Ok(CommandResult::success(note))
}

/// Validate note compliance before saving
#[tauri::command]
pub async fn validate_note_compliance(note: MedicalNote) -> Result<CommandResult<Vec<String>>, String> {
    let mut violations = Vec::new();

    if !note.consent_obtained {
        violations.push("Law 25: Patient consent is required for processing personal health information".to_string());
    }

    if !note.quebec_compliance.law_25_consent {
        violations.push("Law 25: Explicit consent flag must be set".to_string());
    }

    if !note.quebec_compliance.data_minimization {
        violations.push("Law 25: Data minimization principle must be enforced".to_string());
    }

    if note.quebec_compliance.retention_period_days == 0 {
        violations.push("Law 25: Retention period must be specified".to_string());
    }

    if note.content.trim().is_empty() {
        violations.push("Note content cannot be empty".to_string());
    }

    if note.patient_id.trim().is_empty() {
        violations.push("Patient ID is required".to_string());
    }

    if note.template_type.trim().is_empty() {
        violations.push("Template type is required".to_string());
    }

    Ok(CommandResult::success(violations))
}

/// Check storage status
#[tauri::command]
pub async fn storage_status(
    storage_state: State<'_, StorageState>,
) -> Result<CommandResult<bool>, String> {
    let storage_guard = storage_state.lock().await;
    let is_initialized = storage_guard.is_some();
    Ok(CommandResult::success(is_initialized))
}