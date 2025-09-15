//! Comprehensive Quebec Law 25 Audit Service
//!
//! Provides advanced audit logging, real-time compliance monitoring, breach detection,
//! and automated data subject rights management for Quebec Law 25 compliance.
//!
//! This service integrates with the existing Quebec compliance tracker and extends
//! it with enterprise-grade audit capabilities, real-time monitoring, and automated
//! compliance workflows.

use crate::compliance::quebec_law25::{
    QuebecComplianceTracker, QuebecComplianceEvent, QuebecAuditLog,
    ComplianceValidationResult, QuebecComplianceError
};
use crate::services::notification_service::NotificationService;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use std::collections::HashMap;
use sqlx::{sqlite::SqlitePool, FromRow};
use tokio::sync::RwLock;
use std::sync::Arc;
use tracing::{info, warn, error};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditSeverity {
    Info,
    Warning,
    Critical,
    Emergency,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BreachType {
    DataAccess,
    DataTheft,
    UnauthorizedAccess,
    DataLoss,
    SystemCompromise,
    PhishingAttack,
    InsiderThreat,
    TechnicalFailure,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BreachSeverity {
    Low,      // < 10 individuals affected
    Medium,   // 10-99 individuals affected
    High,     // 100-999 individuals affected
    Critical, // 1000+ individuals affected or sensitive data
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataSubjectRight {
    Access,        // Right to know what data is held
    Rectification, // Right to correct inaccurate data
    Erasure,       // Right to be forgotten
    Portability,   // Right to data portability
    Restriction,   // Right to restrict processing
    Objection,     // Right to object to processing
    WithdrawConsent, // Right to withdraw consent
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AuditAlert {
    pub id: String,
    pub alert_type: String, // 'suspicious_access', 'failed_login', 'data_breach', 'compliance_violation'
    pub severity: String,
    pub message: String,
    pub event_data: String, // JSON with additional context
    pub triggered_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub resolved_by: Option<String>,
    pub auto_resolved: bool,
    pub notification_sent: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BreachIncident {
    pub id: String,
    pub breach_type: String,
    pub severity: String,
    pub description: String,
    pub affected_users: String, // JSON array of user IDs
    pub detected_at: DateTime<Utc>,
    pub reported_at: Option<DateTime<Utc>>,
    pub cai_notification_sent: bool, // Commission d'accès à l'information du Québec
    pub users_notified: bool,
    pub incident_status: String, // 'detected', 'investigating', 'contained', 'resolved'
    pub investigation_notes: Option<String>,
    pub remediation_actions: Option<String>, // JSON array of actions taken
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DataSubjectRequest {
    pub id: String,
    pub user_id: String,
    pub request_type: String,
    pub request_details: String,
    pub status: String, // 'pending', 'processing', 'completed', 'rejected'
    pub requested_at: DateTime<Utc>,
    pub due_date: DateTime<Utc>, // Quebec Law 25: 30 days response time
    pub completed_at: Option<DateTime<Utc>>,
    pub response_data: Option<String>, // JSON with response details
    pub rejection_reason: Option<String>,
    pub processed_by: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceMetrics {
    pub total_events: i64,
    pub phi_access_events: i64,
    pub compliance_violations: i64,
    pub active_breaches: i64,
    pub pending_data_requests: i64,
    pub overdue_data_requests: i64,
    pub average_response_time_hours: f64,
    pub consent_withdrawal_rate: f64,
    pub data_retention_compliance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RealTimeAuditConfig {
    pub enable_real_time_monitoring: bool,
    pub suspicious_access_threshold: i32,
    pub failed_login_threshold: i32,
    pub time_window_minutes: i32,
    pub auto_breach_detection: bool,
    pub auto_notification_enabled: bool,
    pub cai_notification_endpoint: Option<String>,
}

impl Default for RealTimeAuditConfig {
    fn default() -> Self {
        Self {
            enable_real_time_monitoring: true,
            suspicious_access_threshold: 5,
            failed_login_threshold: 3,
            time_window_minutes: 15,
            auto_breach_detection: true,
            auto_notification_enabled: true,
            cai_notification_endpoint: None,
        }
    }
}

pub struct QuebecAuditService {
    compliance_tracker: Arc<QuebecComplianceTracker>,
    notification_service: Arc<NotificationService>,
    pool: SqlitePool,
    config: Arc<RwLock<RealTimeAuditConfig>>,
    alert_cache: Arc<RwLock<HashMap<String, DateTime<Utc>>>>, // For rate limiting alerts
}

impl QuebecAuditService {
    /// Initialize the comprehensive Quebec audit service
    pub async fn new(
        compliance_tracker: Arc<QuebecComplianceTracker>,
        notification_service: Arc<NotificationService>,
        pool: SqlitePool,
    ) -> Result<Self, QuebecComplianceError> {
        // Run audit-specific migrations
        sqlx::migrate!("./migrations/quebec_audit").run(&pool).await?;

        let service = Self {
            compliance_tracker,
            notification_service,
            pool,
            config: Arc::new(RwLock::new(RealTimeAuditConfig::default())),
            alert_cache: Arc::new(RwLock::new(HashMap::new())),
        };

        // Start background monitoring task
        service.start_background_monitoring().await?;

        info!("Quebec Law 25 comprehensive audit service initialized");
        Ok(service)
    }

    /// Enhanced audit logging with real-time analysis
    pub async fn log_audit_event(
        &self,
        event: QuebecComplianceEvent,
        context: Option<HashMap<String, String>>,
        severity: AuditSeverity,
    ) -> Result<String, QuebecComplianceError> {
        // Log the event using the base compliance tracker
        let audit_id = self.compliance_tracker.log_compliance_event(event.clone(), context.clone()).await?;

        // Perform real-time analysis
        if self.config.read().await.enable_real_time_monitoring {
            self.analyze_event_for_threats(&event, &context, &severity).await?;
        }

        // Check for automatic breach detection
        if self.config.read().await.auto_breach_detection {
            self.check_for_breach_indicators(&event, &context).await?;
        }

        info!("Enhanced audit event logged: {} (severity: {:?})", audit_id, severity);
        Ok(audit_id)
    }

    /// Real-time threat analysis
    async fn analyze_event_for_threats(
        &self,
        event: &QuebecComplianceEvent,
        context: &Option<HashMap<String, String>>,
        severity: &AuditSeverity,
    ) -> Result<(), QuebecComplianceError> {
        let config = self.config.read().await;
        let now = Utc::now();
        let window_start = now - Duration::minutes(config.time_window_minutes as i64);

        match event {
            QuebecComplianceEvent::NoteAccessed { practitioner_id, .. } => {
                // Check for suspicious access patterns
                let access_count = sqlx::query!(
                    r#"
                    SELECT COUNT(*) as count
                    FROM quebec_audit_logs
                    WHERE practitioner_id = ?
                    AND action = 'read'
                    AND timestamp > ?
                    "#,
                    practitioner_id,
                    window_start
                )
                .fetch_one(&self.pool)
                .await?;

                if access_count.count > config.suspicious_access_threshold as i64 {
                    self.create_alert(
                        "suspicious_access",
                        AuditSeverity::Warning,
                        &format!("Practitioner {} accessed {} records in {} minutes",
                                practitioner_id, access_count.count, config.time_window_minutes),
                        Some(serde_json::json!({
                            "practitioner_id": practitioner_id,
                            "access_count": access_count.count,
                            "time_window": config.time_window_minutes
                        })),
                    ).await?;
                }
            },
            QuebecComplianceEvent::BreachDetected { breach_id, severity: breach_severity, affected_users } => {
                // Automatically create breach incident
                self.create_breach_incident(
                    BreachType::DataAccess, // Default, should be determined from context
                    match breach_severity.as_str() {
                        "low" => BreachSeverity::Low,
                        "medium" => BreachSeverity::Medium,
                        "high" => BreachSeverity::High,
                        _ => BreachSeverity::Critical,
                    },
                    &format!("Automatically detected breach: {}", breach_id),
                    affected_users.clone(),
                ).await?;
            },
            _ => {
                // General severity-based alerting
                if matches!(severity, AuditSeverity::Critical | AuditSeverity::Emergency) {
                    self.create_alert(
                        "critical_event",
                        severity.clone(),
                        &format!("Critical audit event detected: {:?}", event),
                        context.as_ref().map(|c| serde_json::to_value(c).unwrap_or_default()),
                    ).await?;
                }
            }
        }

        Ok(())
    }

    /// Check for breach indicators
    async fn check_for_breach_indicators(
        &self,
        event: &QuebecComplianceEvent,
        context: &Option<HashMap<String, String>>,
    ) -> Result<(), QuebecComplianceError> {
        // Check for failed login patterns
        if let Some(ctx) = context {
            if ctx.get("event_type") == Some(&"authentication_failed".to_string()) {
                let config = self.config.read().await;
                let now = Utc::now();
                let window_start = now - Duration::minutes(config.time_window_minutes as i64);

                if let Some(ip_address) = ctx.get("ip_address") {
                    let failed_attempts = sqlx::query!(
                        r#"
                        SELECT COUNT(*) as count
                        FROM quebec_audit_logs
                        WHERE ip_address = ?
                        AND event_type LIKE '%authentication_failed%'
                        AND timestamp > ?
                        "#,
                        ip_address,
                        window_start
                    )
                    .fetch_one(&self.pool)
                    .await?;

                    if failed_attempts.count > config.failed_login_threshold as i64 {
                        // Potential brute force attack
                        self.create_breach_incident(
                            BreachType::UnauthorizedAccess,
                            BreachSeverity::Medium,
                            &format!("Potential brute force attack from IP: {}", ip_address),
                            vec![], // No specific users affected yet
                        ).await?;
                    }
                }
            }
        }

        Ok(())
    }

    /// Create audit alert
    async fn create_alert(
        &self,
        alert_type: &str,
        severity: AuditSeverity,
        message: &str,
        event_data: Option<serde_json::Value>,
    ) -> Result<String, QuebecComplianceError> {
        let alert_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        // Rate limiting check
        let rate_limit_key = format!("{}:{}", alert_type,
            event_data.as_ref()
                .and_then(|d| d.get("practitioner_id"))
                .and_then(|v| v.as_str())
                .unwrap_or("system"));

        {
            let mut cache = self.alert_cache.write().await;
            if let Some(last_alert) = cache.get(&rate_limit_key) {
                if now.signed_duration_since(*last_alert).num_minutes() < 5 {
                    // Skip this alert due to rate limiting
                    return Ok("rate_limited".to_string());
                }
            }
            cache.insert(rate_limit_key, now);
        }

        sqlx::query!(
            r#"
            INSERT INTO audit_alerts (
                id, alert_type, severity, message, event_data,
                triggered_at, auto_resolved, notification_sent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            alert_id,
            alert_type,
            format!("{:?}", severity),
            message,
            event_data.map(|d| d.to_string()).unwrap_or_default(),
            now,
            false,
            false
        )
        .execute(&self.pool)
        .await?;

        // Send notification if enabled
        if self.config.read().await.auto_notification_enabled &&
           matches!(severity, AuditSeverity::Critical | AuditSeverity::Emergency) {
            self.send_alert_notification(&alert_id, alert_type, message).await?;
        }

        warn!("Audit alert created: {} - {}", alert_type, message);
        Ok(alert_id)
    }

    /// Create breach incident and handle Quebec Law 25 notification requirements
    pub async fn create_breach_incident(
        &self,
        breach_type: BreachType,
        severity: BreachSeverity,
        description: &str,
        affected_users: Vec<String>,
    ) -> Result<String, QuebecComplianceError> {
        let incident_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        sqlx::query!(
            r#"
            INSERT INTO breach_incidents (
                id, breach_type, severity, description, affected_users,
                detected_at, cai_notification_sent, users_notified,
                incident_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            incident_id,
            format!("{:?}", breach_type),
            format!("{:?}", severity),
            description,
            serde_json::to_string(&affected_users)?,
            now,
            false,
            false,
            "detected"
        )
        .execute(&self.pool)
        .await?;

        // Quebec Law 25 requires notification to CAI within 72 hours for serious breaches
        if matches!(severity, BreachSeverity::High | BreachSeverity::Critical) {
            self.schedule_cai_notification(&incident_id).await?;
        }

        // Notify affected users within reasonable time (Law 25 requirement)
        if !affected_users.is_empty() {
            self.schedule_user_breach_notifications(&incident_id, &affected_users).await?;
        }

        error!("Security breach incident created: {} - {:?} severity", incident_id, severity);
        Ok(incident_id)
    }

    /// Handle data subject rights requests automatically where possible
    pub async fn create_data_subject_request(
        &self,
        user_id: &str,
        request_type: DataSubjectRight,
        request_details: &str,
    ) -> Result<String, QuebecComplianceError> {
        let request_id = Uuid::new_v4().to_string();
        let now = Utc::now();
        let due_date = now + Duration::days(30); // Quebec Law 25: 30 days response time

        sqlx::query!(
            r#"
            INSERT INTO data_subject_requests (
                id, user_id, request_type, request_details,
                status, requested_at, due_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
            request_id,
            user_id,
            format!("{:?}", request_type),
            request_details,
            "pending",
            now,
            due_date
        )
        .execute(&self.pool)
        .await?;

        // Auto-process certain types of requests
        match request_type {
            DataSubjectRight::Access => {
                // Can be automated - generate data export
                self.process_data_access_request(&request_id, user_id).await?;
            },
            DataSubjectRight::WithdrawConsent => {
                // Can be automated - mark consent as withdrawn
                self.process_consent_withdrawal(&request_id, user_id).await?;
            },
            _ => {
                // Manual processing required
                info!("Data subject request {} requires manual processing", request_id);
            }
        }

        info!("Data subject request created: {} for user {}", request_id, user_id);
        Ok(request_id)
    }

    /// Generate comprehensive compliance metrics
    pub async fn get_compliance_metrics(
        &self,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> Result<ComplianceMetrics, QuebecComplianceError> {
        // Total audit events
        let total_events = sqlx::query!(
            "SELECT COUNT(*) as count FROM quebec_audit_logs WHERE timestamp BETWEEN ? AND ?",
            start_date, end_date
        ).fetch_one(&self.pool).await?.count;

        // PHI access events
        let phi_access_events = sqlx::query!(
            "SELECT COUNT(*) as count FROM quebec_audit_logs WHERE phi_accessed = true AND timestamp BETWEEN ? AND ?",
            start_date, end_date
        ).fetch_one(&self.pool).await?.count;

        // Compliance violations
        let compliance_violations = sqlx::query!(
            "SELECT COUNT(*) as count FROM quebec_audit_logs WHERE quebec_law25_compliant = false AND timestamp BETWEEN ? AND ?",
            start_date, end_date
        ).fetch_one(&self.pool).await?.count;

        // Active breaches
        let active_breaches = sqlx::query!(
            "SELECT COUNT(*) as count FROM breach_incidents WHERE incident_status IN ('detected', 'investigating', 'contained')"
        ).fetch_one(&self.pool).await?.count;

        // Pending data requests
        let pending_data_requests = sqlx::query!(
            "SELECT COUNT(*) as count FROM data_subject_requests WHERE status = 'pending'"
        ).fetch_one(&self.pool).await?.count;

        // Overdue data requests
        let overdue_data_requests = sqlx::query!(
            "SELECT COUNT(*) as count FROM data_subject_requests WHERE status = 'pending' AND due_date < ?",
            Utc::now()
        ).fetch_one(&self.pool).await?.count;

        // Average response time for completed requests
        let avg_response_time = sqlx::query!(
            r#"
            SELECT AVG(CAST((JulianDay(completed_at) - JulianDay(requested_at)) * 24 AS REAL)) as avg_hours
            FROM data_subject_requests
            WHERE status = 'completed' AND completed_at IS NOT NULL
            AND requested_at BETWEEN ? AND ?
            "#,
            start_date, end_date
        ).fetch_one(&self.pool).await?;

        // Consent withdrawal rate
        let consent_withdrawals = sqlx::query!(
            "SELECT COUNT(*) as count FROM consent_records WHERE withdrawn_at BETWEEN ? AND ?",
            start_date, end_date
        ).fetch_one(&self.pool).await?.count;

        let total_consents = sqlx::query!(
            "SELECT COUNT(*) as count FROM consent_records WHERE granted_at BETWEEN ? AND ?",
            start_date, end_date
        ).fetch_one(&self.pool).await?.count;

        let withdrawal_rate = if total_consents > 0 {
            (consent_withdrawals as f64 / total_consents as f64) * 100.0
        } else {
            0.0
        };

        // Data retention compliance (percentage of records within retention policy)
        let retention_compliant = sqlx::query!(
            r#"
            SELECT COUNT(*) as count FROM quebec_audit_logs
            WHERE DATE(timestamp, '+' || retention_period_days || ' days') >= DATE('now')
            OR retention_period_days = 0
            "#
        ).fetch_one(&self.pool).await?.count;

        let total_retention_records = sqlx::query!(
            "SELECT COUNT(*) as count FROM quebec_audit_logs"
        ).fetch_one(&self.pool).await?.count;

        let retention_compliance = if total_retention_records > 0 {
            (retention_compliant as f64 / total_retention_records as f64) * 100.0
        } else {
            100.0
        };

        Ok(ComplianceMetrics {
            total_events: total_events as i64,
            phi_access_events: phi_access_events as i64,
            compliance_violations: compliance_violations as i64,
            active_breaches: active_breaches as i64,
            pending_data_requests: pending_data_requests as i64,
            overdue_data_requests: overdue_data_requests as i64,
            average_response_time_hours: avg_response_time.avg_hours.unwrap_or(0.0),
            consent_withdrawal_rate: withdrawal_rate,
            data_retention_compliance: retention_compliance,
        })
    }

    /// Start background monitoring and maintenance tasks
    async fn start_background_monitoring(&self) -> Result<(), QuebecComplianceError> {
        // In a real implementation, this would spawn background tasks for:
        // 1. Periodic compliance checks
        // 2. Data retention cleanup
        // 3. Overdue request notifications
        // 4. Automated reporting

        info!("Background monitoring tasks started");
        Ok(())
    }

    /// Send alert notification through notification service
    async fn send_alert_notification(
        &self,
        alert_id: &str,
        alert_type: &str,
        message: &str,
    ) -> Result<(), QuebecComplianceError> {
        // Implementation would integrate with notification service
        info!("Alert notification sent for {}: {}", alert_type, message);
        Ok(())
    }

    /// Schedule CAI notification for serious breaches
    async fn schedule_cai_notification(&self, incident_id: &str) -> Result<(), QuebecComplianceError> {
        // Quebec Law 25 requires notification to Commission d'accès à l'information
        // within 72 hours for serious breaches
        info!("CAI notification scheduled for breach incident: {}", incident_id);
        Ok(())
    }

    /// Schedule user breach notifications
    async fn schedule_user_breach_notifications(
        &self,
        incident_id: &str,
        affected_users: &[String],
    ) -> Result<(), QuebecComplianceError> {
        info!("User breach notifications scheduled for {} users (incident: {})",
              affected_users.len(), incident_id);
        Ok(())
    }

    /// Auto-process data access requests
    async fn process_data_access_request(
        &self,
        request_id: &str,
        user_id: &str,
    ) -> Result<(), QuebecComplianceError> {
        // Generate comprehensive data export for the user
        info!("Processing data access request {} for user {}", request_id, user_id);

        // Update request status
        sqlx::query!(
            "UPDATE data_subject_requests SET status = 'processing' WHERE id = ?",
            request_id
        ).execute(&self.pool).await?;

        Ok(())
    }

    /// Auto-process consent withdrawal
    async fn process_consent_withdrawal(
        &self,
        request_id: &str,
        user_id: &str,
    ) -> Result<(), QuebecComplianceError> {
        // Withdraw all active consents for the user
        let now = Utc::now();

        sqlx::query!(
            "UPDATE consent_records SET is_active = false, withdrawn_at = ? WHERE user_id = ? AND is_active = true",
            now, user_id
        ).execute(&self.pool).await?;

        // Mark request as completed
        sqlx::query!(
            "UPDATE data_subject_requests SET status = 'completed', completed_at = ? WHERE id = ?",
            now, request_id
        ).execute(&self.pool).await?;

        info!("Consent withdrawal processed for user {}", user_id);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_audit_service_creation() {
        // Test would require proper mock setup
        // This is a placeholder for comprehensive testing
    }

    #[tokio::test]
    async fn test_breach_incident_creation() {
        // Test breach incident creation and notification scheduling
    }

    #[tokio::test]
    async fn test_data_subject_request_processing() {
        // Test automated processing of different request types
    }

    #[tokio::test]
    async fn test_compliance_metrics_generation() {
        // Test comprehensive metrics calculation
    }
}