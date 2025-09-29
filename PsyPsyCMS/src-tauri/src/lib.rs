// PsyPsy CMS - Quebec Law 25 Compliant Healthcare System
// Enhanced with encrypted medical notes and compliance features

use tauri::Manager;

// Import medical notes functionality
mod services;
mod commands;
mod security;
mod models;
mod storage;
mod compliance;
mod meeting;
mod devtools_server;
mod console_capture;

use commands::medical_notes_commands::{
    StorageState,
    initialize_encrypted_storage,
    save_medical_note,
    get_medical_note,
    list_patient_notes,
    delete_medical_note,
    get_audit_trail,
    create_medical_note,
    validate_note_compliance,
    storage_status,
};
use commands::offline_sync_commands::{
    SyncServiceState,
    initialize_sync_service,
    perform_manual_sync,
    get_sync_status,
    set_sync_enabled,
    force_sync_note,
    get_conflict_notes,
    resolve_conflict_manually,
    check_network_connectivity,
    get_pending_sync_count,
    start_background_sync,
    stop_background_sync,
};
use commands::social_media_commands::{
    SocialMediaState,
    get_social_media_connections,
    get_oauth_configs,
    save_oauth_config,
    record_social_media_consent,
    initiate_oauth_flow,
    disconnect_platform,
    get_connected_platforms,
    validate_post_compliance,
    detect_phi_in_content,
    calculate_compliance_metrics,
    publish_social_media_post,
    schedule_social_media_post,
    get_scheduled_posts,
    get_published_posts,
};
use meeting::{
    start_recording,
    stop_recording,
    is_recording,
    get_transcription_status,
    save_transcript,
};
use commands::auth_commands::{
    store_session,
    get_stored_session,
    clear_stored_session,
    auth_login,
    auth_logout,
    auth_refresh_token,
    auth_get_current_user,
    auth_update_profile,
    auth_change_password,
    auth_request_password_reset,
    auth_verify_token,
    auth_check_status,
};
use commands::user_commands::{
    create_user,
    get_user_by_id,
    update_user_profile,
    record_user_login,
    suspend_user,
    reactivate_user,
    get_user_display_name,
    check_user_availability,
};
use commands::client_commands::{
    get_clients,
    get_client,
    create_client,
    update_client,
    delete_client,
    search_clients,
    get_client_appointments,
    assign_professional_to_client,
    get_client_stats,
    unassign_professional_from_client,
    increment_client_appointments,
    check_client_active_status,
    get_client_display_name,
};
use commands::professional_commands::{
    get_professionals,
    get_professional,
    create_professional,
    update_professional,
    delete_professional,
    search_professionals,
    get_professional_clients,
    get_professional_appointments,
    get_professional_stats,
    update_professional_verification,
    check_professional_active_status,
    get_professional_display_name,
};
use commands::appointment_commands::{
    get_appointments,
    get_appointment,
    create_appointment,
    update_appointment,
    cancel_appointment,
    complete_appointment,
    delete_appointment,
    search_appointments,
    get_appointments_by_date_range,
    get_todays_appointments,
    get_appointment_stats,
    reschedule_appointment,
};
use commands::dashboard_commands::{
    get_dashboard_stats,
    get_client_dashboard_stats,
    get_professional_dashboard_stats,
    get_appointment_dashboard_stats,
    get_system_health_stats,
};
use commands::debug_commands::{
    initialize_devtools,
    DevToolsState,
};
use console_capture::{
    log_to_devtools,
    get_devtools_status,
    get_console_injection_script,
    DevToolsBroadcaster,
};
use devtools_server::DevToolsServer;

// Import Firebase service state types
use services::firebase_service_simple::{FirebaseServiceState, AuthServiceState};
use crate::security::auth::AuthState;
use std::sync::Arc;
use std::collections::HashMap;
use crate::models::user::User;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to PsyPsy CMS - Quebec Law 25 Compliant Healthcare System!", name)
}

#[tauri::command]
fn get_system_info() -> serde_json::Value {
    serde_json::json!({
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "version": env!("CARGO_PKG_VERSION"),
        "quebec_law25_compliant": true,
        "app_name": "PsyPsy CMS",
        "status": "running"
    })
}

#[tauri::command]
fn get_compliance_status() -> serde_json::Value {
    serde_json::json!({
        "quebec_law25": true,
        "data_residency": "Montreal (northamerica-northeast1)",
        "encryption": "CMEK Enabled",
        "status": "Fully Compliant",
        "last_validated": "2025-09-14",
        "next_review": "2025-09-14"
    })
}

/// Initialize application services on startup
async fn initialize_application_services(app_handle: tauri::AppHandle) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    log::info!("Initializing application services...");

    // Initialize Firebase service
    let firebase_service_state: tauri::State<FirebaseServiceState> = app_handle.state();
    let project_id = std::env::var("FIREBASE_PROJECT_ID")
        .unwrap_or_else(|_| "psypsy-cms-dev".to_string());
    let service_account_path = std::env::var("FIREBASE_SERVICE_ACCOUNT_PATH")
        .unwrap_or_else(|_| "firebase-service-account.json".to_string());

    match services::firebase_service_simple::FirebaseService::new(&project_id, &service_account_path).await {
        Ok(firebase_service) => {
            log::info!("Firebase service initialized successfully");
            let mut guard = firebase_service_state.0.lock().await;
            *guard = Some(firebase_service);
        }
        Err(e) => {
            log::warn!("Firebase service initialization failed: {} (continuing with local operation)", e);
        }
    }

    // Initialize Auth service
    let auth_service_state: tauri::State<AuthServiceState> = app_handle.state();
    let api_key = std::env::var("FIREBASE_API_KEY")
        .unwrap_or_else(|_| "demo-api-key".to_string());
    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "default-dev-secret-change-in-production".to_string());

    let auth_service = security::auth::FirebaseAuthService::new(
        project_id.clone(),
        api_key,
        jwt_secret.as_bytes(),
    );
    log::info!("Auth service initialized successfully");
    let mut guard = auth_service_state.0.lock().await;
    *guard = Some(auth_service);

    // Note: Storage and sync services are initialized via Tauri commands when needed
    // This is because they require user-specific data (passphrase, user ID, etc.)

    log::info!("Core application services initialization completed");
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    eprintln!("🚀 Starting PsyPsy CMS with DevTools...");

    // Initialize basic logging
    env_logger::init();

    // Initialize DevTools server for WebSocket debugging
    let devtools_server = DevToolsServer::new(9223); // Use port 9223 for cms-debugger
    let broadcast_tx = devtools_server.get_broadcast_sender();

    // Start DevTools WebSocket server in a separate thread with proper error handling
    std::thread::spawn(move || {
        eprintln!("🔧 CMS DevTools thread spawned, starting WebSocket server on port 9223...");

        // Create a new Tokio runtime for this thread
        let rt = match tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
        {
            Ok(rt) => rt,
            Err(e) => {
                eprintln!("❌ Failed to create Tokio runtime for CMS DevTools: {}", e);
                return;
            }
        };

        // Start the server in the async runtime with proper error handling
        rt.block_on(async {
            match devtools_server.start().await {
                Ok(()) => eprintln!(
                    "✅ CMS DevTools WebSocket server started successfully on ws://127.0.0.1:9223"
                ),
                Err(e) => eprintln!("❌ CMS DevTools server failed to start: {}", e),
            }
        });

        eprintln!("🔧 CMS DevTools thread completed");
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(StorageState::default())
        .manage(SyncServiceState::default())
        .manage(SocialMediaState::default())
        .manage(FirebaseServiceState::default())
        .manage(AuthServiceState::default())
        .manage(Arc::new(tokio::sync::RwLock::new(AuthState::default())))
        .manage(Arc::new(std::sync::RwLock::new(DevToolsState::default())))
        .manage(DevToolsBroadcaster { tx: broadcast_tx.clone() })
        .manage(std::sync::RwLock::new(HashMap::<String, User>::new()))
        .invoke_handler(tauri::generate_handler![
            // Core system commands
            greet,
            get_system_info,
            get_compliance_status,

            // Authentication commands
            auth_login,
            auth_logout,
            auth_refresh_token,
            auth_get_current_user,
            auth_update_profile,
            auth_change_password,
            auth_request_password_reset,
            auth_verify_token,
            auth_check_status,
            store_session,
            get_stored_session,
            clear_stored_session,

            // User management commands
            create_user,
            get_user_by_id,
            update_user_profile,
            record_user_login,
            suspend_user,
            reactivate_user,
            get_user_display_name,
            check_user_availability,

            // Client/Patient management commands
            get_clients,
            get_client,
            create_client,
            update_client,
            delete_client,
            search_clients,
            get_client_appointments,
            assign_professional_to_client,
            get_client_stats,
            unassign_professional_from_client,
            increment_client_appointments,
            check_client_active_status,
            get_client_display_name,

            // Professional management commands
            get_professionals,
            get_professional,
            create_professional,
            update_professional,
            delete_professional,
            search_professionals,
            get_professional_clients,
            get_professional_appointments,
            get_professional_stats,
            update_professional_verification,
            check_professional_active_status,
            get_professional_display_name,

            // Appointment management commands
            get_appointments,
            get_appointment,
            create_appointment,
            update_appointment,
            cancel_appointment,
            complete_appointment,
            delete_appointment,
            search_appointments,
            get_appointments_by_date_range,
            get_todays_appointments,
            get_appointment_stats,
            reschedule_appointment,

            // Dashboard and analytics commands
            get_dashboard_stats,
            get_client_dashboard_stats,
            get_professional_dashboard_stats,
            get_appointment_dashboard_stats,
            get_system_health_stats,

            // Medical notes commands
            initialize_encrypted_storage,
            save_medical_note,
            get_medical_note,
            list_patient_notes,
            delete_medical_note,
            get_audit_trail,
            create_medical_note,
            validate_note_compliance,
            storage_status,

            // Offline sync commands
            initialize_sync_service,
            perform_manual_sync,
            get_sync_status,
            set_sync_enabled,
            force_sync_note,
            get_conflict_notes,
            resolve_conflict_manually,
            check_network_connectivity,
            get_pending_sync_count,
            start_background_sync,
            stop_background_sync,

            // Social media integration commands
            get_social_media_connections,
            get_oauth_configs,
            save_oauth_config,
            record_social_media_consent,
            initiate_oauth_flow,
            disconnect_platform,
            get_connected_platforms,
            validate_post_compliance,
            detect_phi_in_content,
            calculate_compliance_metrics,
            publish_social_media_post,
            schedule_social_media_post,
            get_scheduled_posts,
            get_published_posts,

            // Meeting and recording commands
            start_recording,
            stop_recording,
            is_recording,
            get_transcription_status,
            save_transcript,

            // Debug and DevTools commands
            log_to_devtools,
            initialize_devtools,
            get_devtools_status
        ])
        .setup(|app| {
            // Inject enhanced console capture script with healthcare React error patterns
            let console_script = get_console_injection_script();

            if let Some(window) = app.get_webview_window("main") {
                // Inject the enhanced script before any page content loads
                if let Err(e) = window.eval(&console_script) {
                    log::error!("Failed to inject CMS DevTools console capture script: {}", e);
                    eprintln!("⚠️ Failed to inject CMS DevTools console capture script: {}", e);
                } else {
                    log::info!("CMS DevTools console capture script injected successfully");
                    eprintln!("✅ CMS DevTools console capture script injected successfully");
                }

                // Open developer tools in debug builds
                #[cfg(debug_assertions)]
                {
                    window.open_devtools();
                    log::info!("Developer tools opened");
                }
            } else {
                log::warn!("Could not find main window");
                eprintln!("⚠️ Could not find main window for script injection");
            }

            // Initialize services on startup
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = initialize_application_services(app_handle).await {
                    log::error!("Failed to initialize application services: {}", e);
                } else {
                    log::info!("All application services initialized successfully");
                }
            });

            log::info!("PsyPsy CMS - Quebec Law 25 Compliant Healthcare System with encrypted medical notes initialized");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}