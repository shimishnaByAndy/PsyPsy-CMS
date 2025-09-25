use futures_util::{SinkExt, StreamExt};
use log::{debug, error, info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio::sync::Mutex;
use tokio_tungstenite::{accept_hdr_async, tungstenite::handshake::server::Request, tungstenite::handshake::server::Response, tungstenite::Message};
use uuid::Uuid;

pub type Clients = Arc<Mutex<HashMap<String, tokio::sync::mpsc::UnboundedSender<Message>>>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevToolsMessage {
    pub msg_type: String,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogMessage {
    pub id: String,
    pub timestamp: u64,
    pub level: String,
    pub target: String,
    pub message: String,
    pub file: Option<String>,
    pub line: Option<u32>,
    pub module_path: Option<String>,
    pub fields: HashMap<String, String>,
}

pub struct DevToolsServer {
    port: u16,
    clients: Clients,
    broadcast_tx: broadcast::Sender<DevToolsMessage>,
}

impl DevToolsServer {
    pub fn new(port: u16) -> Self {
        let clients = Arc::new(Mutex::new(HashMap::new()));
        let (broadcast_tx, _) = broadcast::channel::<DevToolsMessage>(1000);

        Self {
            port,
            clients,
            broadcast_tx,
        }
    }

    pub fn get_broadcast_sender(&self) -> broadcast::Sender<DevToolsMessage> {
        self.broadcast_tx.clone()
    }

    pub async fn start(self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let addr = format!("127.0.0.1:{}", self.port);
        let listener = TcpListener::bind(&addr).await?;
        info!("🚀 DevTools WebSocket server listening on ws://{}", addr);

        let clients = self.clients.clone();
        let broadcast_tx = self.broadcast_tx.clone();

        // Spawn broadcast task
        let clients_for_broadcast = clients.clone();
        let mut broadcast_rx = broadcast_tx.subscribe();
        tokio::spawn(async move {
            while let Ok(message) = broadcast_rx.recv().await {
                let clients_guard = clients_for_broadcast.lock().await;
                let message_json = serde_json::to_string(&message).unwrap_or_default();
                let ws_message = Message::Text(message_json);

                for (client_id, sender) in clients_guard.iter() {
                    if let Err(e) = sender.send(ws_message.clone()) {
                        warn!("Failed to send message to client {}: {}", client_id, e);
                    }
                }
            }
        });

        // Accept connections
        while let Ok((stream, addr)) = listener.accept().await {
            let clients = clients.clone();
            let broadcast_tx = broadcast_tx.clone();
            tokio::spawn(handle_connection(stream, addr, clients, broadcast_tx));
        }

        Ok(())
    }
}

async fn handle_connection(
    stream: TcpStream,
    addr: SocketAddr,
    clients: Clients,
    broadcast_tx: broadcast::Sender<DevToolsMessage>,
) {
    info!("🔗 New WebSocket connection from: {}", addr);

    // Handle WebSocket handshake with CORS headers
    let ws_stream = match accept_hdr_async(stream, |req: &Request, mut response: Response| {
        // Add CORS headers for cross-origin requests
        response.headers_mut()
            .insert("Access-Control-Allow-Origin", "*".parse().unwrap());
        response.headers_mut()
            .insert("Access-Control-Allow-Methods", "GET, POST, OPTIONS".parse().unwrap());
        response.headers_mut()
            .insert("Access-Control-Allow-Headers", "Content-Type, Authorization".parse().unwrap());

        debug!("WebSocket handshake request: {:?}", req);
        Ok(response)
    }).await {
        Ok(ws) => ws,
        Err(e) => {
            error!("❌ WebSocket handshake failed for {}: {}", addr, e);
            return;
        }
    };

    let client_id = Uuid::new_v4().to_string();
    info!("✅ WebSocket connection established for client: {} ({})", client_id, addr);

    // Create channel for this client
    let (client_tx, mut client_rx) = tokio::sync::mpsc::unbounded_channel::<Message>();

    // Add client to the registry
    {
        let mut clients_guard = clients.lock().await;
        clients_guard.insert(client_id.clone(), client_tx);
    }

    // Send welcome message
    let welcome_msg = DevToolsMessage {
        msg_type: "welcome".to_string(),
        data: serde_json::json!({
            "client_id": client_id,
            "server": "PsyPsy CMS Debugger",
            "version": "1.0.0",
            "features": [
                "console_capture",
                "react_error_categorization",
                "healthcare_context",
                "hipaa_compliance_tracking"
            ]
        }),
    };

    if let Err(e) = broadcast_tx.send(welcome_msg) {
        warn!("Failed to send welcome message: {}", e);
    }

    // Split the WebSocket stream
    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    // Spawn task to handle outgoing messages to this client
    let client_id_for_sender = client_id.clone();
    tokio::spawn(async move {
        while let Some(message) = client_rx.recv().await {
            if let Err(e) = ws_sender.send(message).await {
                warn!("Failed to send message to client {}: {}", client_id_for_sender, e);
                break;
            }
        }
        debug!("Outgoing message handler closed for client: {}", client_id_for_sender);
    });

    // Handle incoming messages from this client
    let client_id_for_receiver = client_id.clone();
    let clients_for_receiver = clients.clone();
    tokio::spawn(async move {
        while let Some(msg) = ws_receiver.next().await {
            match msg {
                Ok(Message::Text(text)) => {
                    debug!("📥 Received message from {}: {}", client_id_for_receiver, text);

                    // Try to parse as DevTools message
                    if let Ok(devtools_msg) = serde_json::from_str::<DevToolsMessage>(&text) {
                        match devtools_msg.msg_type.as_str() {
                            "ping" => {
                                // Respond to ping with pong
                                let pong_msg = DevToolsMessage {
                                    msg_type: "pong".to_string(),
                                    data: serde_json::json!({
                                        "timestamp": chrono::Utc::now().timestamp_millis()
                                    }),
                                };
                                let _ = broadcast_tx.send(pong_msg);
                            }
                            "request_status" => {
                                // Respond with server status
                                let status_msg = DevToolsMessage {
                                    msg_type: "status".to_string(),
                                    data: serde_json::json!({
                                        "connected_clients": clients_for_receiver.lock().await.len(),
                                        "server_uptime": std::time::SystemTime::now()
                                            .duration_since(std::time::UNIX_EPOCH)
                                            .unwrap_or_default()
                                            .as_secs(),
                                        "features_enabled": [
                                            "console_capture",
                                            "react_error_categorization",
                                            "healthcare_analytics"
                                        ]
                                    }),
                                };
                                let _ = broadcast_tx.send(status_msg);
                            }
                            _ => {
                                debug!("Unknown message type: {}", devtools_msg.msg_type);
                            }
                        }
                    }
                }
                Ok(Message::Binary(_)) => {
                    debug!("📥 Received binary message from {}", client_id_for_receiver);
                }
                Ok(Message::Ping(_payload)) => {
                    debug!("📥 Received ping from {}", client_id_for_receiver);
                    // WebSocket will automatically send pong
                }
                Ok(Message::Pong(_)) => {
                    debug!("📥 Received pong from {}", client_id_for_receiver);
                }
                Ok(Message::Close(_)) => {
                    info!("👋 Client {} disconnected", client_id_for_receiver);
                    break;
                }
                Ok(Message::Frame(_)) => {
                    debug!("📥 Received frame message from {}", client_id_for_receiver);
                    // Frame messages are handled automatically by the WebSocket protocol
                }
                Err(e) => {
                    warn!("❌ WebSocket error for client {}: {}", client_id_for_receiver, e);
                    break;
                }
            }
        }

        // Remove client from registry when connection closes
        {
            let mut clients_guard = clients_for_receiver.lock().await;
            clients_guard.remove(&client_id_for_receiver);
        }
        info!("🔌 Client {} disconnected and cleaned up", client_id_for_receiver);
    });
}

// Custom tracing layer to forward logs to DevTools
pub struct DevToolsTracingLayer {
    broadcast_tx: broadcast::Sender<DevToolsMessage>,
}

impl DevToolsTracingLayer {
    pub fn new(broadcast_tx: broadcast::Sender<DevToolsMessage>) -> Self {
        Self { broadcast_tx }
    }
}

impl<S> tracing_subscriber::Layer<S> for DevToolsTracingLayer
where
    S: tracing::Subscriber,
{
    fn on_event(
        &self,
        event: &tracing::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        use tracing_subscriber::field::Visit;

        struct FieldVisitor {
            fields: HashMap<String, String>,
            message: String,
        }

        impl Visit for FieldVisitor {
            fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
                if field.name() == "message" {
                    self.message = format!("{:?}", value);
                } else {
                    self.fields.insert(field.name().to_string(), format!("{:?}", value));
                }
            }

            fn record_str(&mut self, field: &tracing::field::Field, value: &str) {
                if field.name() == "message" {
                    self.message = value.to_string();
                } else {
                    self.fields.insert(field.name().to_string(), value.to_string());
                }
            }
        }

        let mut visitor = FieldVisitor {
            fields: HashMap::new(),
            message: String::new(),
        };

        event.record(&mut visitor);

        let log_msg = LogMessage {
            id: Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            level: event.metadata().level().to_string().to_lowercase(),
            target: event.metadata().target().to_string(),
            message: visitor.message,
            file: event.metadata().file().map(|f| f.to_string()),
            line: event.metadata().line(),
            module_path: event.metadata().module_path().map(|m| m.to_string()),
            fields: visitor.fields,
        };

        let devtools_msg = DevToolsMessage {
            msg_type: "log".to_string(),
            data: serde_json::to_value(log_msg).unwrap_or(serde_json::json!({})),
        };

        // Send to WebSocket clients (fire and forget)
        let _ = self.broadcast_tx.send(devtools_msg);
    }
}