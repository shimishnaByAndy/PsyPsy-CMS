// Debug Commands for PsyPsy CMS
// Provides console capture and debugging integration with cms-debugger

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, tungstenite::Message};
use futures_util::{SinkExt, StreamExt};

#[derive(Debug, Serialize, Deserialize)]
pub struct DevToolsLogData {
    pub level: String,
    pub message: String,
    pub timestamp: u64,
    pub source: Option<String>,
    pub stack: Option<String>,
    pub component_stack: Option<String>,
    pub error_boundary: Option<bool>,
    pub file: Option<String>,
    pub line: Option<u32>,
    pub column: Option<u32>,
}

#[derive(Debug, Default)]
pub struct DevToolsState {
    pub connected: bool,
    pub port: u16,
}

/// Send log data to external DevTools via WebSocket (cms-debugger)
#[tauri::command]
pub async fn log_to_devtools(
    level: String,
    message: String,
    timestamp: Option<u64>,
    source: Option<String>,
    stack: Option<String>,
    component_stack: Option<String>,
    error_boundary: Option<bool>,
    file: Option<String>,
    line: Option<u32>,
    column: Option<u32>,
    _devtools_state: State<'_, Arc<std::sync::RwLock<DevToolsState>>>,
) -> Result<(), String> {
    let log_data = DevToolsLogData {
        level: level.clone(),
        message: message.clone(),
        timestamp: timestamp.unwrap_or_else(|| {
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64
        }),
        source,
        stack,
        component_stack,
        error_boundary,
        file,
        line,
        column,
    };

    // Send to WebSocket DevTools server (cms-debugger on port 9223)
    tokio::spawn(async move {
        if let Err(e) = send_to_devtools_websocket(log_data).await {
            eprintln!("[DevTools] Failed to send log to cms-debugger: {}", e);
        }
    });

    // Also log locally for debugging
    match level.as_str() {
        "error" => eprintln!("[DevTools Error] {}", message),
        "warn" => eprintln!("[DevTools Warn] {}", message),
        "info" => println!("[DevTools Info] {}", message),
        "debug" => println!("[DevTools Debug] {}", message),
        _ => println!("[DevTools {}] {}", level, message),
    }

    Ok(())
}

async fn send_to_devtools_websocket(log_data: DevToolsLogData) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Connect to cms-debugger WebSocket server
    let ws_url = "ws://127.0.0.1:9223";

    match connect_async(ws_url).await {
        Ok((mut ws_stream, _)) => {
            // Send the log data as JSON
            let json_message = serde_json::to_string(&log_data)?;
            ws_stream.send(Message::Text(json_message)).await?;
            ws_stream.close(None).await?;
            Ok(())
        }
        Err(e) => {
            // cms-debugger not running - this is normal, don't spam errors
            if log_data.level == "error" {
                eprintln!("[DevTools] cms-debugger not available: {}", e);
            }
            Err(Box::new(e))
        }
    }
}

/// Initialize DevTools integration
#[tauri::command]
pub async fn initialize_devtools(
    devtools_state: State<'_, Arc<std::sync::RwLock<DevToolsState>>>,
) -> Result<(), String> {
    // Test connection to cms-debugger
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
            println!("[DevTools] cms-debugger not available (this is normal if not debugging)");
            Ok(())
        }
    }
}

/// Get DevTools connection status
#[tauri::command]
pub async fn get_devtools_status(
    devtools_state: State<'_, Arc<std::sync::RwLock<DevToolsState>>>,
) -> Result<serde_json::Value, String> {
    let state = devtools_state.read().unwrap();
    Ok(serde_json::json!({
        "connected": state.connected,
        "port": state.port,
        "target": "cms-debugger"
    }))
}