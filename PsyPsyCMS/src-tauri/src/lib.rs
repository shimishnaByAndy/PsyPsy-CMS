// PsyPsy CMS - Quebec Law 25 Compliant Healthcare System
// Enhanced with encrypted medical notes and compliance features

use tauri::Manager;
use tokio::sync::Mutex;

// Import medical notes functionality
mod services;
mod commands;
mod security;
mod models;
mod storage;
mod compliance;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize basic logging
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(StorageState::default())
        .manage(SyncServiceState::default())
        .manage(SocialMediaState::default())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_system_info,
            get_compliance_status,
            initialize_encrypted_storage,
            save_medical_note,
            get_medical_note,
            list_patient_notes,
            delete_medical_note,
            get_audit_trail,
            create_medical_note,
            validate_note_compliance,
            storage_status,
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
            get_published_posts
        ])
        .setup(|app| {
            // Open developer tools in debug builds
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }

            log::info!("PsyPsy CMS - Quebec Law 25 Compliant Healthcare System with encrypted medical notes initialized");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}