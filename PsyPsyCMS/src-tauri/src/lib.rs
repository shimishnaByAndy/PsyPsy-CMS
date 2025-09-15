// PsyPsy CMS - Tauri 2.0 + Firebase Healthcare Management System
use tauri::Manager;
use tokio::sync::{Mutex, RwLock};
use std::sync::Arc;

// Module declarations
pub mod services;
pub mod models;
pub mod commands;
pub mod security;
pub mod storage;
pub mod compliance;

use services::{FirebaseService, OfflineService};
use security::auth::AuthState;
use commands::*;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_system_info() -> serde_json::Value {
    serde_json::json!({
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "version": env!("CARGO_PKG_VERSION"),
        "firebase_integrated": true,
        "hipaa_compliant": true,
    })
}

/// Initialize Firebase service
async fn initialize_firebase() -> Result<FirebaseService, Box<dyn std::error::Error + Send + Sync>> {
    let project_id = std::env::var("FIREBASE_PROJECT_ID")
        .unwrap_or_else(|_| "psypsy-cms-dev".to_string());

    let service_account_path = std::env::var("FIREBASE_SERVICE_ACCOUNT_PATH")
        .unwrap_or_else(|_| "firebase-service-account.json".to_string());

    FirebaseService::new(&project_id, &service_account_path).await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)
}

/// Initialize offline service
async fn initialize_offline() -> Result<OfflineService, Box<dyn std::error::Error + Send + Sync>> {
    let db_path = std::env::var("SQLITE_DB_PATH")
        .unwrap_or_else(|_| "psypsy_cms.db".to_string());

    OfflineService::new(&db_path).await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize tracing for logging
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // System commands
            greet,
            get_system_info,

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

            // Client management commands
            get_clients,
            get_client,
            create_client,
            update_client,
            delete_client,
            search_clients,
            get_client_appointments,
            assign_professional_to_client,
            get_client_stats,

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

            // Dashboard management commands
            get_dashboard_stats,
            get_client_dashboard_stats,
            get_professional_dashboard_stats,
            get_appointment_dashboard_stats,
            get_system_health_stats,
        ])
        .setup(|app| {
            // Initialize async runtime for services
            let handle = app.handle().clone();
            let handle_for_auth = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                match initialize_firebase().await {
                    Ok(firebase_service) => {
                        tracing::info!("Firebase service initialized successfully");

                        // Store Firebase service in app state
                        handle.manage(Arc::new(Mutex::new(firebase_service)));

                        // Initialize offline service
                        match initialize_offline().await {
                            Ok(offline_service) => {
                                tracing::info!("Offline service initialized successfully");
                                handle.manage(Arc::new(Mutex::new(offline_service)));
                            }
                            Err(e) => {
                                tracing::error!("Failed to initialize offline service: {}", e);
                            }
                        }
                    }
                    Err(e) => {
                        tracing::error!("Failed to initialize Firebase service: {}", e);

                        // In production, you might want to show an error dialog
                        // For development, continue with mock services
                        #[cfg(debug_assertions)]
                        {
                            tracing::warn!("Running in development mode without Firebase");
                        }
                    }
                }
            });

            // Initialize authentication state
            handle_for_auth.manage(Arc::new(RwLock::new(AuthState::new())));

            // Open developer tools in debug builds
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }

            tracing::info!("PsyPsy CMS Tauri application initialized");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}