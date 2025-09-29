// Debug Commands for PsyPsy CMS
// Provides DevTools state management and initialization

use std::sync::Arc;
use tauri::State;

#[derive(Debug, Default)]
pub struct DevToolsState {
    pub connected: bool,
    pub port: u16,
}

/// Initialize DevTools integration
#[tauri::command]
pub async fn initialize_devtools(
    devtools_state: State<'_, Arc<std::sync::RwLock<DevToolsState>>>,
) -> Result<(), String> {
    // Always mark as connected in development since DevTools auto-open
    #[cfg(debug_assertions)]
    {
        let mut state = devtools_state.write().unwrap();
        state.connected = true;
        state.port = 9223; // Default port for cms-debugger compatibility
        println!("[DevTools] DevTools integration initialized (development mode)");
        return Ok(());
    }

    // In production, test connection to cms-debugger
    #[cfg(not(debug_assertions))]
    {
        match TcpStream::connect("127.0.0.1:9223").await {
            Ok(_) => {
                let mut state = devtools_state.write().unwrap();
                state.connected = true;
                state.port = 9223;
                println!("[DevTools] Connected to cms-debugger on port 9223");
                Ok(())
            }
            Err(_) => {
                let mut state = devtools_state.write().unwrap();
                state.connected = false;
                println!("[DevTools] cms-debugger not available (production mode)");
                Ok(())
            }
        }
    }
}