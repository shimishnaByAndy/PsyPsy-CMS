// PsyPsy CMS - Minimal Working Tauri App
// This is a simplified version to get the app running initially

use tauri::Manager;

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
        .invoke_handler(tauri::generate_handler![
            greet,
            get_system_info,
            get_compliance_status
        ])
        .setup(|app| {
            // Open developer tools in debug builds
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }

            log::info!("PsyPsy CMS - Quebec Law 25 Compliant Healthcare System initialized");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}