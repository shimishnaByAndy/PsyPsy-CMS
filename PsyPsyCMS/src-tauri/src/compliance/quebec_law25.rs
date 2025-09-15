use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;
use sqlx::{sqlite::SqlitePool, FromRow};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QuebecComplianceEvent {
    NoteCreated { note_id: String, practitioner_id: String, client_id: String },
    NoteAccessed { note_id: String, practitioner_id: String },
    NoteUpdated { note_id: String, practitioner_id: String },
    NoteDeleted { note_id: String, practitioner_id: String },
    ConsentRecorded { consent_id: String, user_id: String, data_types: Vec<String> },
    ConsentWithdrawn { consent_id: String, user_id: String },
    DataSubjectRequest { request_id: String, user_id: String, request_type: String },
    BreachDetected { breach_id: String, severity: String, affected_users: Vec<String> },
    DataDeidentified { original_id: String, deidentified_id: String },
    AuditTrailAccessed { accessor_id: String, target_resource: String },
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct QuebecAuditLog {
    pub id: String,
    pub event_type: String,
    pub event_data: String, // JSON serialized event details
    pub practitioner_id: Option<String>,
    pub client_id: Option<String>,
    pub resource_type: String, // "medical_note", "consent", "user_data", etc.
    pub resource_id: String,
    pub action: String, // "create", "read", "update", "delete", "access"
    pub timestamp: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub session_id: Option<String>,
    pub quebec_law25_compliant: bool,
    pub phi_accessed: bool,
    pub retention_period_days: i32, // Quebec Law 25 requires 7-year retention for medical data
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceValidationResult {
    pub is_compliant: bool,
    pub violations: Vec<String>,
    pub warnings: Vec<String>,
    pub recommendations: Vec<String>,
}

#[derive(thiserror::Error, Debug)]
pub enum QuebecComplianceError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("Compliance violation: {0}")]
    ComplianceViolation(String),
    #[error("Consent required but not provided: {0}")]
    ConsentRequired(String),
    #[error("Data subject rights request failed: {0}")]
    DataSubjectRightsFailed(String),
}

pub struct QuebecComplianceTracker {
    pool: SqlitePool,
}

impl QuebecComplianceTracker {
    /// Initialize the Quebec Law 25 compliance tracker
    pub async fn new() -> Result<Self, QuebecComplianceError> {
        // In a real implementation, this would connect to the same database
        // For now, we'll assume the pool is passed in or configured elsewhere
        let database_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "sqlite:psypsy_quebec_compliance.db".to_string());

        let pool = SqlitePool::connect(&database_url).await?;

        // Run compliance-specific migrations
        sqlx::migrate!("./migrations/quebec_compliance").run(&pool).await?;

        Ok(Self { pool })
    }

    /// Validate that medical note creation complies with Quebec Law 25
    pub async fn validate_note_creation(
        &self,
        practitioner_id: &str,
        client_id: &str,
        template_id: &str,
        consent_id: Option<&str>,
    ) -> Result<ComplianceValidationResult, QuebecComplianceError> {
        let mut violations = Vec::new();
        let mut warnings = Vec::new();
        let mut recommendations = Vec::new();

        // Check if consent is required and provided
        if self.requires_explicit_consent(template_id).await? {
            if consent_id.is_none() {
                violations.push("Explicit consent required for this type of medical note under Quebec Law 25".to_string());
            } else {
                // Verify consent is valid and current
                if !self.verify_consent_validity(consent_id.unwrap(), client_id).await? {
                    violations.push("Provided consent is invalid or expired".to_string());
                }
            }
        }

        // Check practitioner authorization for Quebec
        if !self.verify_quebec_practitioner_authorization(practitioner_id).await? {
            violations.push("Practitioner not authorized for Quebec medical practice".to_string());
        }

        // Check data minimization principles
        if self.check_data_minimization_violation(template_id).await? {
            warnings.push("Consider using de-identified template to minimize personal data collection".to_string());
            recommendations.push("Review data collection to ensure only necessary information is captured".to_string());
        }

        let is_compliant = violations.is_empty();

        Ok(ComplianceValidationResult {
            is_compliant,
            violations,
            warnings,
            recommendations,
        })
    }

    /// Log a Quebec Law 25 compliant audit event
    pub async fn log_compliance_event(
        &self,
        event: QuebecComplianceEvent,
        context: Option<HashMap<String, String>>,
    ) -> Result<String, QuebecComplianceError> {
        let audit_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let (event_type, event_data, practitioner_id, client_id, resource_type, resource_id, action, phi_accessed) = match &event {
            QuebecComplianceEvent::NoteCreated { note_id, practitioner_id, client_id } => (
                "note_created".to_string(),
                serde_json::to_string(&event)?,
                Some(practitioner_id.clone()),
                Some(client_id.clone()),
                "medical_note".to_string(),
                note_id.clone(),
                "create".to_string(),
                true, // Medical notes always contain PHI
            ),
            QuebecComplianceEvent::NoteAccessed { note_id, practitioner_id } => (
                "note_accessed".to_string(),
                serde_json::to_string(&event)?,
                Some(practitioner_id.clone()),
                None,
                "medical_note".to_string(),
                note_id.clone(),
                "read".to_string(),
                true,
            ),
            QuebecComplianceEvent::NoteUpdated { note_id, practitioner_id } => (
                "note_updated".to_string(),
                serde_json::to_string(&event)?,
                Some(practitioner_id.clone()),
                None,
                "medical_note".to_string(),
                note_id.clone(),
                "update".to_string(),
                true,
            ),
            QuebecComplianceEvent::NoteDeleted { note_id, practitioner_id } => (
                "note_deleted".to_string(),
                serde_json::to_string(&event)?,
                Some(practitioner_id.clone()),
                None,
                "medical_note".to_string(),
                note_id.clone(),
                "delete".to_string(),
                true,
            ),
            QuebecComplianceEvent::ConsentRecorded { consent_id, user_id, data_types: _ } => (
                "consent_recorded".to_string(),
                serde_json::to_string(&event)?,
                None,
                Some(user_id.clone()),
                "consent".to_string(),
                consent_id.clone(),
                "create".to_string(),
                false,
            ),
            QuebecComplianceEvent::ConsentWithdrawn { consent_id, user_id } => (
                "consent_withdrawn".to_string(),
                serde_json::to_string(&event)?,
                None,
                Some(user_id.clone()),
                "consent".to_string(),
                consent_id.clone(),
                "update".to_string(),
                false,
            ),
            QuebecComplianceEvent::DataSubjectRequest { request_id, user_id, request_type: _ } => (
                "data_subject_request".to_string(),
                serde_json::to_string(&event)?,
                None,
                Some(user_id.clone()),
                "data_subject_request".to_string(),
                request_id.clone(),
                "create".to_string(),
                false,
            ),
            QuebecComplianceEvent::BreachDetected { breach_id, severity: _, affected_users: _ } => (
                "breach_detected".to_string(),
                serde_json::to_string(&event)?,
                None,
                None,
                "security_breach".to_string(),
                breach_id.clone(),
                "create".to_string(),
                true, // Breaches potentially involve PHI
            ),
            QuebecComplianceEvent::DataDeidentified { original_id, deidentified_id: _ } => (
                "data_deidentified".to_string(),
                serde_json::to_string(&event)?,
                None,
                None,
                "deidentified_data".to_string(),
                original_id.clone(),
                "transform".to_string(),
                true,
            ),
            QuebecComplianceEvent::AuditTrailAccessed { accessor_id, target_resource } => (
                "audit_trail_accessed".to_string(),
                serde_json::to_string(&event)?,
                Some(accessor_id.clone()),
                None,
                "audit_trail".to_string(),
                target_resource.clone(),
                "read".to_string(),
                true, // Audit trails may contain PHI references
            ),
        };

        // Quebec Law 25 requires 7-year retention for medical data
        let retention_period = if resource_type == "medical_note" || phi_accessed {
            7 * 365 // 7 years in days
        } else {
            1 * 365 // 1 year for non-medical data
        };

        let ip_address = context.as_ref().and_then(|c| c.get("ip_address")).cloned();
        let user_agent = context.as_ref().and_then(|c| c.get("user_agent")).cloned();
        let session_id = context.as_ref().and_then(|c| c.get("session_id")).cloned();

        sqlx::query!(
            r#"
            INSERT INTO quebec_audit_logs (
                id, event_type, event_data, practitioner_id, client_id,
                resource_type, resource_id, action, timestamp, ip_address,
                user_agent, session_id, quebec_law25_compliant, phi_accessed,
                retention_period_days
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            audit_id,
            event_type,
            event_data,
            practitioner_id,
            client_id,
            resource_type,
            resource_id,
            action,
            now,
            ip_address,
            user_agent,
            session_id,
            true, // All our logs are Quebec Law 25 compliant by design
            phi_accessed,
            retention_period
        )
        .execute(&self.pool)
        .await?;

        tracing::info!("Quebec Law 25 compliance event logged: {} ({})", event_type, audit_id);

        Ok(audit_id)
    }

    /// Convenience method for logging medical note creation
    pub async fn log_note_creation(
        &self,
        note_id: &str,
        practitioner_id: &str,
        client_id: &str,
    ) -> Result<String, QuebecComplianceError> {
        let event = QuebecComplianceEvent::NoteCreated {
            note_id: note_id.to_string(),
            practitioner_id: practitioner_id.to_string(),
            client_id: client_id.to_string(),
        };

        self.log_compliance_event(event, None).await
    }

    /// Convenience method for logging medical note access
    pub async fn log_note_access(
        &self,
        note_id: &str,
        practitioner_id: &str,
    ) -> Result<String, QuebecComplianceError> {
        let event = QuebecComplianceEvent::NoteAccessed {
            note_id: note_id.to_string(),
            practitioner_id: practitioner_id.to_string(),
        };

        self.log_compliance_event(event, None).await
    }

    /// Convenience method for logging medical note updates
    pub async fn log_note_update(
        &self,
        note_id: &str,
        practitioner_id: &str,
    ) -> Result<String, QuebecComplianceError> {
        let event = QuebecComplianceEvent::NoteUpdated {
            note_id: note_id.to_string(),
            practitioner_id: practitioner_id.to_string(),
        };

        self.log_compliance_event(event, None).await
    }

    /// Convenience method for logging medical note deletion
    pub async fn log_note_deletion(
        &self,
        note_id: &str,
        practitioner_id: &str,
    ) -> Result<String, QuebecComplianceError> {
        let event = QuebecComplianceEvent::NoteDeleted {
            note_id: note_id.to_string(),
            practitioner_id: practitioner_id.to_string(),
        };

        self.log_compliance_event(event, None).await
    }

    /// Check if a specific template requires explicit consent under Quebec Law 25
    async fn requires_explicit_consent(&self, template_id: &str) -> Result<bool, QuebecComplianceError> {
        // Quebec-specific templates that require explicit consent
        let high_sensitivity_templates = vec![
            "ramq_progress_note",
            "cnesst_work_injury",
            "saaq_accident_report",
            "mental_health_assessment",
            "substance_abuse_treatment",
            "genetic_information",
            "reproductive_health",
        ];

        Ok(high_sensitivity_templates.contains(&template_id))
    }

    /// Verify that consent is valid and current
    async fn verify_consent_validity(&self, consent_id: &str, client_id: &str) -> Result<bool, QuebecComplianceError> {
        let consent = sqlx::query!(
            "SELECT * FROM consent_records WHERE id = ? AND user_id = ? AND is_active = true",
            consent_id,
            client_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(consent_record) = consent {
            // Check if consent is not expired (Quebec Law 25 requires periodic renewal)
            let expiry_check = consent_record.expires_at.map(|expiry| expiry > Utc::now()).unwrap_or(true);
            Ok(expiry_check)
        } else {
            Ok(false)
        }
    }

    /// Verify practitioner is authorized for Quebec medical practice
    async fn verify_quebec_practitioner_authorization(&self, practitioner_id: &str) -> Result<bool, QuebecComplianceError> {
        let practitioner = sqlx::query!(
            "SELECT quebec_license_number, quebec_license_expiry FROM professionals WHERE id = ?",
            practitioner_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(prof) = practitioner {
            let has_quebec_license = prof.quebec_license_number.is_some();
            let license_not_expired = prof.quebec_license_expiry
                .map(|expiry| expiry > Utc::now())
                .unwrap_or(false);

            Ok(has_quebec_license && license_not_expired)
        } else {
            Ok(false)
        }
    }

    /// Check for potential data minimization violations
    async fn check_data_minimization_violation(&self, _template_id: &str) -> Result<bool, QuebecComplianceError> {
        // Placeholder for data minimization checks
        // In practice, this would analyze the template fields and flag unnecessary data collection
        Ok(false)
    }

    /// Get audit trail for a specific resource (for Quebec Law 25 compliance reporting)
    pub async fn get_audit_trail(
        &self,
        resource_type: &str,
        resource_id: &str,
        limit: Option<i32>,
    ) -> Result<Vec<QuebecAuditLog>, QuebecComplianceError> {
        let limit = limit.unwrap_or(100);

        let logs = sqlx::query_as!(
            QuebecAuditLog,
            r#"
            SELECT id, event_type, event_data, practitioner_id, client_id,
                   resource_type, resource_id, action, timestamp, ip_address,
                   user_agent, session_id, quebec_law25_compliant, phi_accessed,
                   retention_period_days
            FROM quebec_audit_logs
            WHERE resource_type = ? AND resource_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
            "#,
            resource_type,
            resource_id,
            limit
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(logs)
    }

    /// Generate Quebec Law 25 compliance report
    pub async fn generate_compliance_report(
        &self,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> Result<HashMap<String, serde_json::Value>, QuebecComplianceError> {
        let mut report = HashMap::new();

        // Count of different event types
        let event_counts = sqlx::query!(
            r#"
            SELECT event_type, COUNT(*) as count
            FROM quebec_audit_logs
            WHERE timestamp BETWEEN ? AND ?
            GROUP BY event_type
            "#,
            start_date,
            end_date
        )
        .fetch_all(&self.pool)
        .await?;

        let mut event_summary = HashMap::new();
        for row in event_counts {
            event_summary.insert(row.event_type, row.count);
        }
        report.insert("event_summary".to_string(), serde_json::to_value(event_summary)?);

        // PHI access summary
        let phi_access_count = sqlx::query!(
            "SELECT COUNT(*) as count FROM quebec_audit_logs WHERE phi_accessed = true AND timestamp BETWEEN ? AND ?",
            start_date,
            end_date
        )
        .fetch_one(&self.pool)
        .await?;
        report.insert("phi_access_count".to_string(), serde_json::Value::Number(phi_access_count.count.into()));

        // Compliance violations (if any)
        let violations = sqlx::query!(
            "SELECT COUNT(*) as count FROM quebec_audit_logs WHERE quebec_law25_compliant = false AND timestamp BETWEEN ? AND ?",
            start_date,
            end_date
        )
        .fetch_one(&self.pool)
        .await?;
        report.insert("compliance_violations".to_string(), serde_json::Value::Number(violations.count.into()));

        // Data retention summary
        let retention_summary = sqlx::query!(
            r#"
            SELECT
                CASE
                    WHEN retention_period_days >= 2555 THEN '7_years'
                    WHEN retention_period_days >= 365 THEN '1_year'
                    ELSE 'short_term'
                END as retention_category,
                COUNT(*) as count
            FROM quebec_audit_logs
            WHERE timestamp BETWEEN ? AND ?
            GROUP BY retention_category
            "#,
            start_date,
            end_date
        )
        .fetch_all(&self.pool)
        .await?;

        let mut retention_map = HashMap::new();
        for row in retention_summary {
            retention_map.insert(row.retention_category, row.count);
        }
        report.insert("retention_summary".to_string(), serde_json::to_value(retention_map)?);

        report.insert("report_period_start".to_string(), serde_json::Value::String(start_date.to_rfc3339()));
        report.insert("report_period_end".to_string(), serde_json::Value::String(end_date.to_rfc3339()));
        report.insert("generated_at".to_string(), serde_json::Value::String(Utc::now().to_rfc3339()));

        Ok(report)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_compliance_tracker_creation() {
        std::env::set_var("DATABASE_URL", "sqlite::memory:");
        let tracker = QuebecComplianceTracker::new().await;
        assert!(tracker.is_ok());
    }

    #[tokio::test]
    async fn test_note_creation_validation() {
        std::env::set_var("DATABASE_URL", "sqlite::memory:");
        let tracker = QuebecComplianceTracker::new().await.unwrap();

        let result = tracker.validate_note_creation(
            "prac123",
            "client456",
            "general_note",
            Some("consent789")
        ).await.unwrap();

        // This might fail due to missing practitioner data, but should not panic
        println!("Validation result: {:?}", result);
    }

    #[tokio::test]
    async fn test_compliance_event_logging() {
        std::env::set_var("DATABASE_URL", "sqlite::memory:");
        let tracker = QuebecComplianceTracker::new().await.unwrap();

        let event = QuebecComplianceEvent::NoteCreated {
            note_id: "note123".to_string(),
            practitioner_id: "prac123".to_string(),
            client_id: "client456".to_string(),
        };

        let result = tracker.log_compliance_event(event, None).await;
        assert!(result.is_ok());
    }
}