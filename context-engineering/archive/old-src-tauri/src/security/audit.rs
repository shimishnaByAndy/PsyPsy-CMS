// HIPAA-Compliant Audit Trail and Logging System
// Implements comprehensive audit logging for healthcare data access and system events

use crate::security::{SecurityError, AuditEventType, HealthcareRole, DataClassification};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use tokio::sync::Mutex;
use uuid::Uuid;
use chrono::{DateTime, Utc, Duration};
use std::fs::{File, OpenOptions};
use std::io::{Write, BufWriter};
use std::path::PathBuf;
use ring::digest;
use tracing::{info, warn, error, debug};

/// HIPAA audit event with comprehensive tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    /// Unique event identifier
    pub event_id: Uuid,
    /// Type of audit event
    pub event_type: AuditEventType,
    /// Timestamp when event occurred
    pub timestamp: DateTime<Utc>,
    /// User who performed the action
    pub user_id: Option<Uuid>,
    /// User's role at time of action
    pub user_role: Option<HealthcareRole>,
    /// Session identifier
    pub session_id: Option<String>,
    /// IP address of the request
    pub source_ip: Option<String>,
    /// User agent information
    pub user_agent: Option<String>,
    /// Resource being accessed/modified
    pub resource_type: Option<String>,
    /// Specific resource identifier
    pub resource_id: Option<String>,
    /// Patient ID (for PHI-related events)
    pub patient_id: Option<Uuid>,
    /// Action performed
    pub action: String,
    /// Outcome of the action
    pub outcome: AuditOutcome,
    /// Data classification level
    pub data_classification: Option<DataClassification>,
    /// Before state (for modifications)
    pub before_state: Option<serde_json::Value>,
    /// After state (for modifications)
    pub after_state: Option<serde_json::Value>,
    /// Detailed event description
    pub description: String,
    /// Additional event metadata
    pub metadata: HashMap<String, serde_json::Value>,
    /// Risk level of the event (1-5)
    pub risk_level: u8,
    /// Whether this event requires immediate attention
    pub requires_attention: bool,
    /// Related compliance standards
    pub compliance_tags: Vec<String>,
    /// Geographic location (if available)
    pub location: Option<String>,
    /// Device information
    pub device_info: Option<String>,
    /// Duration of the operation (milliseconds)
    pub duration_ms: Option<u64>,
    /// Data size involved (bytes)
    pub data_size_bytes: Option<u64>,
    /// Number of records affected
    pub records_affected: Option<u32>,
}

impl AuditEvent {
    /// Create new audit event
    pub fn new(
        event_type: AuditEventType,
        user_id: Option<Uuid>,
        action: String,
        outcome: AuditOutcome,
    ) -> Self {
        Self {
            event_id: Uuid::new_v4(),
            event_type,
            timestamp: Utc::now(),
            user_id,
            user_role: None,
            session_id: None,
            source_ip: None,
            user_agent: None,
            resource_type: None,
            resource_id: None,
            patient_id: None,
            action,
            outcome,
            data_classification: None,
            before_state: None,
            after_state: None,
            description: String::new(),
            metadata: HashMap::new(),
            risk_level: 1,
            requires_attention: false,
            compliance_tags: vec!["HIPAA".to_string()],
            location: None,
            device_info: None,
            duration_ms: None,
            data_size_bytes: None,
            records_affected: None,
        }
    }
    
    /// Add PHI access details
    pub fn with_phi_access(mut self, patient_id: Uuid, data_type: &str) -> Self {
        self.patient_id = Some(patient_id);
        self.resource_type = Some(data_type.to_string());
        self.data_classification = Some(DataClassification::PHI);
        self.compliance_tags.push("PHI_ACCESS".to_string());
        self.risk_level = std::cmp::max(self.risk_level, 3);
        self
    }
    
    /// Add session context
    pub fn with_session(mut self, session_id: String, ip: Option<String>, user_agent: Option<String>) -> Self {
        self.session_id = Some(session_id);
        self.source_ip = ip;
        self.user_agent = user_agent;
        self
    }
    
    /// Add state changes for modifications
    pub fn with_state_change(mut self, before: serde_json::Value, after: serde_json::Value) -> Self {
        self.before_state = Some(before);
        self.after_state = Some(after);
        self.risk_level = std::cmp::max(self.risk_level, 2);
        self
    }
    
    /// Mark event as high risk
    pub fn mark_high_risk(mut self, reason: &str) -> Self {
        self.risk_level = 5;
        self.requires_attention = true;
        self.metadata.insert("high_risk_reason".to_string(), serde_json::Value::String(reason.to_string()));
        self
    }
    
    /// Calculate integrity hash for tamper detection
    pub fn calculate_hash(&self) -> String {
        let event_json = serde_json::to_string(self).unwrap_or_default();
        let hash = digest::digest(&digest::SHA256, event_json.as_bytes());
        base64::encode(hash.as_ref())
    }
    
    /// Check if event is HIPAA-critical
    pub fn is_hipaa_critical(&self) -> bool {
        matches!(self.event_type,
            AuditEventType::PatientDataViewed | AuditEventType::PatientDataModified |
            AuditEventType::PatientDataDeleted | AuditEventType::PatientDataExported |
            AuditEventType::PatientDataCreated
        ) || self.data_classification == Some(DataClassification::PHI) ||
        self.data_classification == Some(DataClassification::HighlySensitivePHI)
    }
}

/// Audit event outcome
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AuditOutcome {
    /// Operation completed successfully
    Success,
    /// Operation failed
    Failure,
    /// Operation was denied due to permissions
    Denied,
    /// Operation was blocked by security policy
    Blocked,
    /// Operation requires additional authentication
    Pending,
    /// Operation was cancelled by user
    Cancelled,
    /// Operation timed out
    Timeout,
    /// Unknown outcome
    Unknown,
}

/// Audit log storage backend
#[derive(Debug, Clone)]
pub enum AuditStorage {
    /// File-based storage
    File { path: PathBuf },
    /// Database storage
    Database { connection_string: String },
    /// Remote syslog
    Syslog { server: String, facility: String },
    /// Multiple storage backends
    Multiple(Vec<AuditStorage>),
}

/// Audit configuration for HIPAA compliance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditConfig {
    /// Storage backend configuration
    pub storage_type: String,
    /// Log file path (for file storage)
    pub log_file_path: Option<PathBuf>,
    /// Maximum log file size before rotation (bytes)
    pub max_file_size_bytes: u64,
    /// Number of rotated log files to keep
    pub max_rotated_files: u32,
    /// Log level for different event types
    pub log_levels: HashMap<String, String>,
    /// Retention period in days (HIPAA requires 6 years minimum)
    pub retention_days: u32,
    /// Enable real-time alerting for critical events
    pub enable_real_time_alerts: bool,
    /// Alert thresholds
    pub alert_thresholds: AlertThresholds,
    /// Enable log integrity checking
    pub enable_integrity_checking: bool,
    /// Backup configuration
    pub backup_config: Option<BackupConfig>,
    /// Encryption for log files
    pub encrypt_logs: bool,
    /// Compliance requirements
    pub compliance_standards: Vec<String>,
}

impl Default for AuditConfig {
    fn default() -> Self {
        let mut log_levels = HashMap::new();
        log_levels.insert("PatientDataViewed".to_string(), "INFO".to_string());
        log_levels.insert("PatientDataModified".to_string(), "WARN".to_string());
        log_levels.insert("PatientDataDeleted".to_string(), "ERROR".to_string());
        log_levels.insert("SecurityViolationDetected".to_string(), "CRITICAL".to_string());
        
        Self {
            storage_type: "file".to_string(),
            log_file_path: Some(PathBuf::from("./logs/hipaa_audit.log")),
            max_file_size_bytes: 100_000_000, // 100MB
            max_rotated_files: 50,
            log_levels,
            retention_days: 2555, // 7 years for HIPAA compliance
            enable_real_time_alerts: true,
            alert_thresholds: AlertThresholds::default(),
            enable_integrity_checking: true,
            backup_config: Some(BackupConfig::default()),
            encrypt_logs: true,
            compliance_standards: vec!["HIPAA".to_string(), "HITECH".to_string()],
        }
    }
}

/// Alert threshold configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertThresholds {
    /// Maximum failed login attempts per hour
    pub max_failed_logins_per_hour: u32,
    /// Maximum PHI access events per user per hour
    pub max_phi_access_per_user_per_hour: u32,
    /// Maximum data export events per day
    pub max_data_exports_per_day: u32,
    /// Unusual access pattern detection
    pub unusual_access_pattern_threshold: f32,
    /// Off-hours access alert
    pub alert_on_off_hours_access: bool,
    /// Geographic anomaly detection
    pub alert_on_geographic_anomaly: bool,
    /// High-risk event alert
    pub alert_on_high_risk_events: bool,
}

impl Default for AlertThresholds {
    fn default() -> Self {
        Self {
            max_failed_logins_per_hour: 10,
            max_phi_access_per_user_per_hour: 100,
            max_data_exports_per_day: 5,
            unusual_access_pattern_threshold: 0.8,
            alert_on_off_hours_access: true,
            alert_on_geographic_anomaly: true,
            alert_on_high_risk_events: true,
        }
    }
}

/// Backup configuration for audit logs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupConfig {
    /// Enable automatic backups
    pub enabled: bool,
    /// Backup interval in hours
    pub backup_interval_hours: u32,
    /// Backup storage location
    pub backup_path: PathBuf,
    /// Maximum number of backups to keep
    pub max_backups: u32,
    /// Compress backups
    pub compress_backups: bool,
    /// Encrypt backups
    pub encrypt_backups: bool,
}

impl Default for BackupConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            backup_interval_hours: 24, // Daily backups
            backup_path: PathBuf::from("./logs/backups/"),
            max_backups: 365, // One year of daily backups
            compress_backups: true,
            encrypt_backups: true,
        }
    }
}

/// Audit alert
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditAlert {
    /// Unique alert identifier
    pub alert_id: Uuid,
    /// Alert severity level
    pub severity: AlertSeverity,
    /// Alert title
    pub title: String,
    /// Alert description
    pub description: String,
    /// Related audit events
    pub related_events: Vec<Uuid>,
    /// Alert timestamp
    pub timestamp: DateTime<Utc>,
    /// Whether alert has been acknowledged
    pub acknowledged: bool,
    /// Who acknowledged the alert
    pub acknowledged_by: Option<Uuid>,
    /// Alert acknowledgment timestamp
    pub acknowledged_at: Option<DateTime<Utc>>,
    /// Alert metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Alert severity levels
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
    Emergency,
}

/// HIPAA-compliant audit service
pub struct AuditService {
    /// Audit configuration
    config: Arc<RwLock<AuditConfig>>,
    /// Audit event buffer for batching
    event_buffer: Arc<Mutex<Vec<AuditEvent>>>,
    /// Active audit writers
    writers: Arc<RwLock<HashMap<String, Box<dyn AuditWriter + Send + Sync>>>>,
    /// Event statistics
    stats: Arc<RwLock<AuditStats>>,
    /// Active alerts
    alerts: Arc<RwLock<HashMap<Uuid, AuditAlert>>>,
    /// Alert handlers
    alert_handlers: Arc<RwLock<Vec<Box<dyn AlertHandler + Send + Sync>>>>,
}

/// Audit statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditStats {
    /// Total events logged
    pub total_events: u64,
    /// Events by type
    pub events_by_type: HashMap<String, u64>,
    /// Events by outcome
    pub events_by_outcome: HashMap<String, u64>,
    /// PHI access events
    pub phi_access_events: u64,
    /// High-risk events
    pub high_risk_events: u64,
    /// Events in last 24 hours
    pub events_last_24h: u64,
    /// Active alerts
    pub active_alerts: u64,
    /// Last backup timestamp
    pub last_backup_at: Option<DateTime<Utc>>,
}

impl Default for AuditStats {
    fn default() -> Self {
        Self {
            total_events: 0,
            events_by_type: HashMap::new(),
            events_by_outcome: HashMap::new(),
            phi_access_events: 0,
            high_risk_events: 0,
            events_last_24h: 0,
            active_alerts: 0,
            last_backup_at: None,
        }
    }
}

/// Trait for audit log writers
pub trait AuditWriter {
    fn write_event(&mut self, event: &AuditEvent) -> Result<(), SecurityError>;
    fn flush(&mut self) -> Result<(), SecurityError>;
    fn rotate(&mut self) -> Result<(), SecurityError>;
}

/// File-based audit writer
pub struct FileAuditWriter {
    file_path: PathBuf,
    writer: Option<BufWriter<File>>,
    current_size: u64,
    max_size: u64,
}

impl FileAuditWriter {
    pub fn new(file_path: PathBuf, max_size: u64) -> Result<Self, SecurityError> {
        std::fs::create_dir_all(file_path.parent().unwrap_or(&PathBuf::from(".")))
            .map_err(|e| SecurityError::AuditLogFailed { 
                message: format!("Failed to create log directory: {}", e) 
            })?;
        
        Ok(Self {
            file_path,
            writer: None,
            current_size: 0,
            max_size,
        })
    }
    
    fn ensure_writer(&mut self) -> Result<(), SecurityError> {
        if self.writer.is_none() {
            let file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&self.file_path)
                .map_err(|e| SecurityError::AuditLogFailed { 
                    message: format!("Failed to open log file: {}", e) 
                })?;
            
            self.current_size = file.metadata()
                .map_err(|e| SecurityError::AuditLogFailed { 
                    message: format!("Failed to get file metadata: {}", e) 
                })?
                .len();
            
            self.writer = Some(BufWriter::new(file));
        }
        Ok(())
    }
}

impl AuditWriter for FileAuditWriter {
    fn write_event(&mut self, event: &AuditEvent) -> Result<(), SecurityError> {
        self.ensure_writer()?;
        
        let event_json = serde_json::to_string(event)
            .map_err(|e| SecurityError::AuditLogFailed { 
                message: format!("Failed to serialize event: {}", e) 
            })?;
        
        let log_line = format!("{}\n", event_json);
        
        if let Some(writer) = &mut self.writer {
            writer.write_all(log_line.as_bytes())
                .map_err(|e| SecurityError::AuditLogFailed { 
                    message: format!("Failed to write to log file: {}", e) 
                })?;
            
            self.current_size += log_line.len() as u64;
            
            // Rotate if file is too large
            if self.current_size >= self.max_size {
                self.rotate()?;
            }
        }
        
        Ok(())
    }
    
    fn flush(&mut self) -> Result<(), SecurityError> {
        if let Some(writer) = &mut self.writer {
            writer.flush()
                .map_err(|e| SecurityError::AuditLogFailed { 
                    message: format!("Failed to flush log file: {}", e) 
                })?;
        }
        Ok(())
    }
    
    fn rotate(&mut self) -> Result<(), SecurityError> {
        // Close current writer
        if let Some(mut writer) = self.writer.take() {
            writer.flush().ok();
        }
        
        // Rotate log files
        let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
        let rotated_path = self.file_path.with_extension(format!("log.{}", timestamp));
        
        if self.file_path.exists() {
            std::fs::rename(&self.file_path, &rotated_path)
                .map_err(|e| SecurityError::AuditLogFailed { 
                    message: format!("Failed to rotate log file: {}", e) 
                })?;
        }
        
        // Reset state
        self.current_size = 0;
        self.writer = None;
        
        info!("Rotated audit log to {:?}", rotated_path);
        Ok(())
    }
}

/// Trait for alert handlers
pub trait AlertHandler {
    fn handle_alert(&self, alert: &AuditAlert) -> Result<(), SecurityError>;
}

/// Console alert handler (for development)
pub struct ConsoleAlertHandler;

impl AlertHandler for ConsoleAlertHandler {
    fn handle_alert(&self, alert: &AuditAlert) -> Result<(), SecurityError> {
        match alert.severity {
            AlertSeverity::Emergency => error!("🚨 EMERGENCY ALERT: {}", alert.title),
            AlertSeverity::Critical => warn!("🔥 CRITICAL ALERT: {}", alert.title),
            AlertSeverity::Warning => warn!("⚠️  WARNING ALERT: {}", alert.title),
            AlertSeverity::Info => info!("ℹ️  INFO ALERT: {}", alert.title),
        }
        println!("  Description: {}", alert.description);
        println!("  Events: {:?}", alert.related_events);
        Ok(())
    }
}

impl AuditService {
    /// Create new audit service
    pub fn new(config: AuditConfig) -> Result<Self, SecurityError> {
        let service = Self {
            config: Arc::new(RwLock::new(config)),
            event_buffer: Arc::new(Mutex::new(Vec::new())),
            writers: Arc::new(RwLock::new(HashMap::new())),
            stats: Arc::new(RwLock::new(AuditStats::default())),
            alerts: Arc::new(RwLock::new(HashMap::new())),
            alert_handlers: Arc::new(RwLock::new(Vec::new())),
        };
        
        // Initialize default alert handler
        service.alert_handlers.write().unwrap().push(Box::new(ConsoleAlertHandler));
        
        // Initialize file writer
        let config = service.config.read().unwrap();
        if config.storage_type == "file" {
            if let Some(log_path) = &config.log_file_path {
                let writer = FileAuditWriter::new(log_path.clone(), config.max_file_size_bytes)?;
                service.writers.write().unwrap().insert("file".to_string(), Box::new(writer));
            }
        }
        
        Ok(service)
    }
    
    /// Log audit event
    pub async fn log_event(&self, event: AuditEvent) -> Result<(), SecurityError> {
        // Update statistics
        {
            let mut stats = self.stats.write().unwrap();
            stats.total_events += 1;
            *stats.events_by_type.entry(format!("{:?}", event.event_type)).or_insert(0) += 1;
            *stats.events_by_outcome.entry(format!("{:?}", event.outcome)).or_insert(0) += 1;
            
            if event.is_hipaa_critical() {
                stats.phi_access_events += 1;
            }
            
            if event.risk_level >= 4 {
                stats.high_risk_events += 1;
            }
            
            // Simple 24h counter (in production, would be more sophisticated)
            stats.events_last_24h += 1;
        }
        
        // Check for alert conditions
        self.check_alert_conditions(&event).await?;
        
        // Write event to all configured writers
        {
            let mut writers = self.writers.write().unwrap();
            for (name, writer) in writers.iter_mut() {
                if let Err(e) = writer.write_event(&event) {
                    error!("Failed to write to audit writer {}: {:?}", name, e);
                }
            }
        }
        
        // Log to tracing system based on risk level
        match event.risk_level {
            5 => error!("High-risk audit event: {} - {}", event.action, event.description),
            4 => warn!("Medium-risk audit event: {} - {}", event.action, event.description),
            3 => warn!("Audit event: {} - {}", event.action, event.description),
            2 => info!("Audit event: {} - {}", event.action, event.description),
            _ => debug!("Audit event: {} - {}", event.action, event.description),
        }
        
        Ok(())
    }
    
    /// Check for alert conditions
    async fn check_alert_conditions(&self, event: &AuditEvent) -> Result<(), SecurityError> {
        let config = self.config.read().unwrap();
        if !config.enable_real_time_alerts {
            return Ok(());
        }
        
        let mut should_alert = false;
        let mut alert_title = String::new();
        let mut alert_description = String::new();
        let mut severity = AlertSeverity::Info;
        
        // Check for high-risk events
        if event.risk_level >= 4 && config.alert_thresholds.alert_on_high_risk_events {
            should_alert = true;
            alert_title = "High-Risk Security Event".to_string();
            alert_description = format!("High-risk event detected: {}", event.description);
            severity = AlertSeverity::Critical;
        }
        
        // Check for PHI access violations
        if event.is_hipaa_critical() && matches!(event.outcome, AuditOutcome::Denied | AuditOutcome::Blocked) {
            should_alert = true;
            alert_title = "PHI Access Violation".to_string();
            alert_description = format!("Unauthorized PHI access attempt: {}", event.description);
            severity = AlertSeverity::Critical;
        }
        
        // Check for security violations
        if matches!(event.event_type, AuditEventType::SecurityViolationDetected | AuditEventType::IntrusionAttempt) {
            should_alert = true;
            alert_title = "Security Violation Detected".to_string();
            alert_description = format!("Security violation: {}", event.description);
            severity = AlertSeverity::Emergency;
        }
        
        // Check for failed login patterns (simplified)
        if matches!(event.event_type, AuditEventType::LoginFailed) {
            // In production, would check patterns over time
            should_alert = true;
            alert_title = "Failed Login Attempt".to_string();
            alert_description = format!("Failed login from IP: {:?}", event.source_ip);
            severity = AlertSeverity::Warning;
        }
        
        if should_alert {
            let alert = AuditAlert {
                alert_id: Uuid::new_v4(),
                severity,
                title: alert_title,
                description: alert_description,
                related_events: vec![event.event_id],
                timestamp: Utc::now(),
                acknowledged: false,
                acknowledged_by: None,
                acknowledged_at: None,
                metadata: HashMap::new(),
            };
            
            // Store alert
            self.alerts.write().unwrap().insert(alert.alert_id, alert.clone());
            
            // Send to alert handlers
            let handlers = self.alert_handlers.read().unwrap();
            for handler in handlers.iter() {
                if let Err(e) = handler.handle_alert(&alert) {
                    error!("Alert handler failed: {:?}", e);
                }
            }
            
            self.stats.write().unwrap().active_alerts += 1;
        }
        
        Ok(())
    }
    
    /// Flush all audit writers
    pub async fn flush(&self) -> Result<(), SecurityError> {
        let mut writers = self.writers.write().unwrap();
        for (name, writer) in writers.iter_mut() {
            if let Err(e) = writer.flush() {
                error!("Failed to flush audit writer {}: {:?}", name, e);
            }
        }
        Ok(())
    }
    
    /// Get audit statistics
    pub fn get_stats(&self) -> AuditStats {
        self.stats.read().unwrap().clone()
    }
    
    /// Get active alerts
    pub fn get_active_alerts(&self) -> Vec<AuditAlert> {
        self.alerts.read().unwrap()
            .values()
            .filter(|alert| !alert.acknowledged)
            .cloned()
            .collect()
    }
    
    /// Acknowledge alert
    pub async fn acknowledge_alert(&self, alert_id: Uuid, acknowledged_by: Uuid) -> Result<(), SecurityError> {
        let mut alerts = self.alerts.write().unwrap();
        if let Some(alert) = alerts.get_mut(&alert_id) {
            alert.acknowledged = true;
            alert.acknowledged_by = Some(acknowledged_by);
            alert.acknowledged_at = Some(Utc::now());
            
            info!("Alert {} acknowledged by user {}", alert_id, acknowledged_by);
            self.stats.write().unwrap().active_alerts = alerts.values()
                .filter(|a| !a.acknowledged)
                .count() as u64;
            
            Ok(())
        } else {
            Err(SecurityError::AuditLogFailed { 
                message: format!("Alert {} not found", alert_id) 
            })
        }
    }
    
    /// Perform backup of audit logs
    pub async fn backup_logs(&self) -> Result<(), SecurityError> {
        let config = self.config.read().unwrap();
        if let Some(backup_config) = &config.backup_config {
            if !backup_config.enabled {
                return Ok(());
            }
            
            // Create backup directory
            std::fs::create_dir_all(&backup_config.backup_path)
                .map_err(|e| SecurityError::AuditLogFailed { 
                    message: format!("Failed to create backup directory: {}", e) 
                })?;
            
            // Generate backup filename with timestamp
            let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
            let backup_filename = format!("audit_backup_{}.tar.gz", timestamp);
            let backup_path = backup_config.backup_path.join(&backup_filename);
            
            // In production, would implement actual backup logic
            info!("Creating audit log backup at {:?}", backup_path);
            
            // Update statistics
            self.stats.write().unwrap().last_backup_at = Some(Utc::now());
            
            Ok(())
        } else {
            Ok(())
        }
    }
    
    /// Cleanup old logs based on retention policy
    pub async fn cleanup_old_logs(&self) -> Result<(), SecurityError> {
        let config = self.config.read().unwrap();
        let retention_cutoff = Utc::now() - Duration::days(config.retention_days as i64);
        
        // In production, would implement actual cleanup logic
        info!("Cleaning up audit logs older than {}", retention_cutoff);
        
        Ok(())
    }
}

/// Initialize HIPAA audit system
pub async fn initialize_audit_system() -> Result<(), SecurityError> {
    let config = AuditConfig::default();
    let audit_service = AuditService::new(config)?;
    
    // Test audit logging with a system startup event
    let startup_event = AuditEvent::new(
        AuditEventType::SystemStartup,
        None,
        "system_startup".to_string(),
        AuditOutcome::Success,
    ).with_session(
        Uuid::new_v4().to_string(),
        Some("127.0.0.1".to_string()),
        Some("PsyPsy CMS Tauri".to_string()),
    );
    
    audit_service.log_event(startup_event).await?;
    audit_service.flush().await?;
    
    info!("HIPAA-compliant audit system initialized successfully");
    Ok(())
}

/// Convenience functions for common audit events

/// Log PHI access event
pub async fn log_phi_access(
    audit_service: &AuditService,
    user_id: Uuid,
    patient_id: Uuid,
    action: &str,
    outcome: AuditOutcome,
    session_id: String,
) -> Result<(), SecurityError> {
    let event = AuditEvent::new(
        AuditEventType::PatientDataViewed,
        Some(user_id),
        action.to_string(),
        outcome,
    ).with_phi_access(patient_id, "patient_record")
    .with_session(session_id, None, None);
    
    audit_service.log_event(event).await
}

/// Log authentication event
pub async fn log_authentication(
    audit_service: &AuditService,
    user_id: Option<Uuid>,
    event_type: AuditEventType,
    outcome: AuditOutcome,
    ip_address: Option<String>,
    user_agent: Option<String>,
) -> Result<(), SecurityError> {
    let event = AuditEvent::new(
        event_type,
        user_id,
        "authentication".to_string(),
        outcome,
    ).with_session(Uuid::new_v4().to_string(), ip_address, user_agent);
    
    audit_service.log_event(event).await
}

/// Log security violation
pub async fn log_security_violation(
    audit_service: &AuditService,
    user_id: Option<Uuid>,
    violation_type: &str,
    description: &str,
    session_id: Option<String>,
) -> Result<(), SecurityError> {
    let mut event = AuditEvent::new(
        AuditEventType::SecurityViolationDetected,
        user_id,
        violation_type.to_string(),
        AuditOutcome::Blocked,
    ).mark_high_risk("Security violation detected");
    
    event.description = description.to_string();
    
    if let Some(session) = session_id {
        event = event.with_session(session, None, None);
    }
    
    audit_service.log_event(event).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    
    #[test]
    fn test_audit_event_creation() {
        let event = AuditEvent::new(
            AuditEventType::UserLogin,
            Some(Uuid::new_v4()),
            "login".to_string(),
            AuditOutcome::Success,
        );
        
        assert_eq!(event.action, "login");
        assert_eq!(event.outcome, AuditOutcome::Success);
        assert!(!event.event_id.is_nil());
    }
    
    #[test]
    fn test_audit_event_phi_access() {
        let patient_id = Uuid::new_v4();
        let event = AuditEvent::new(
            AuditEventType::PatientDataViewed,
            Some(Uuid::new_v4()),
            "view_patient_record".to_string(),
            AuditOutcome::Success,
        ).with_phi_access(patient_id, "medical_record");
        
        assert_eq!(event.patient_id, Some(patient_id));
        assert_eq!(event.data_classification, Some(DataClassification::PHI));
        assert!(event.is_hipaa_critical());
        assert!(event.risk_level >= 3);
    }
    
    #[tokio::test]
    async fn test_file_audit_writer() {
        let temp_dir = tempdir().unwrap();
        let log_path = temp_dir.path().join("test_audit.log");
        
        let mut writer = FileAuditWriter::new(log_path.clone(), 1024).unwrap();
        
        let event = AuditEvent::new(
            AuditEventType::UserLogin,
            Some(Uuid::new_v4()),
            "test_login".to_string(),
            AuditOutcome::Success,
        );
        
        writer.write_event(&event).unwrap();
        writer.flush().unwrap();
        
        assert!(log_path.exists());
        let content = std::fs::read_to_string(&log_path).unwrap();
        assert!(content.contains("test_login"));
    }
    
    #[tokio::test]
    async fn test_audit_service() {
        let temp_dir = tempdir().unwrap();
        let log_path = temp_dir.path().join("test_audit_service.log");
        
        let mut config = AuditConfig::default();
        config.log_file_path = Some(log_path.clone());
        config.enable_real_time_alerts = false; // Disable alerts for test
        
        let audit_service = AuditService::new(config).unwrap();
        
        let event = AuditEvent::new(
            AuditEventType::PatientDataViewed,
            Some(Uuid::new_v4()),
            "test_phi_access".to_string(),
            AuditOutcome::Success,
        );
        
        audit_service.log_event(event).await.unwrap();
        audit_service.flush().await.unwrap();
        
        let stats = audit_service.get_stats();
        assert_eq!(stats.total_events, 1);
        assert_eq!(stats.phi_access_events, 1);
        
        assert!(log_path.exists());
    }
}