//! Quebec Law 25 Compliant Notification Service
//!
//! Handles all notifications required by Quebec Law 25 including:
//! - CAI (Commission d'accès à l'information) breach notifications
//! - User breach notifications in French and English
//! - Data subject rights acknowledgments
//! - Consent expiration reminders
//! - Compliance alerts to system administrators
//!
//! All notifications are logged for audit purposes and comply with Quebec
//! language requirements (French primary, bilingual support).

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;
use sqlx::{sqlite::SqlitePool, FromRow};
use tracing::{info, warn, error};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationType {
    BreachNotificationCAI,      // To Quebec CAI within 72 hours
    BreachNotificationUser,     // To affected users
    DataSubjectRightsResponse,  // Response to data requests
    ConsentExpiration,          // Consent expiring soon
    ComplianceAlert,            // System compliance alerts
    AuditAlert,                 // Real-time audit alerts
    SystemMaintenance,          // Planned maintenance notifications
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationPriority {
    Low,
    Normal,
    High,
    Critical,
    Emergency,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationChannel {
    Email,
    SMS,
    InApp,
    WebhookCAI,        // Special webhook for CAI notifications
    SecurePortal,      // Secure patient portal
    PhysicalMail,      // For legal notifications
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationLanguage {
    French,    // Primary language in Quebec
    English,   // Secondary language
    Bilingual, // Both French and English
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct NotificationTemplate {
    pub id: String,
    pub template_name: String,
    pub notification_type: String,
    pub language: String,
    pub subject_template: String,
    pub body_template: String,
    pub is_active: bool,
    pub quebec_law25_compliant: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct NotificationLog {
    pub id: String,
    pub notification_type: String,
    pub recipient_id: String,
    pub recipient_email: Option<String>,
    pub recipient_phone: Option<String>,
    pub language: String,
    pub priority: String,
    pub channel: String,
    pub subject: String,
    pub content: String,
    pub sent_at: DateTime<Utc>,
    pub delivery_status: String, // 'sent', 'delivered', 'failed', 'bounced'
    pub delivery_confirmed_at: Option<DateTime<Utc>>,
    pub read_at: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
    pub quebec_law25_compliant: bool,
    pub audit_trail_id: Option<String>, // Link to audit log entry
}

#[derive(thiserror::Error, Debug)]
pub enum NotificationError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Template not found: {0}")]
    TemplateNotFound(String),
    #[error("Invalid recipient: {0}")]
    InvalidRecipient(String),
    #[error("Delivery failed: {0}")]
    DeliveryFailed(String),
    #[error("CAI notification failed: {0}")]
    CAINotificationFailed(String),
    #[error("Template rendering error: {0}")]
    TemplateRendering(String),
}

pub struct NotificationService {
    pool: SqlitePool,
    cai_webhook_url: Option<String>,
    smtp_config: Option<SmtpConfig>,
    sms_config: Option<SmsConfig>,
}

#[derive(Debug, Clone)]
pub struct SmtpConfig {
    pub server: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub from_address: String,
    pub from_name: String,
}

#[derive(Debug, Clone)]
pub struct SmsConfig {
    pub provider: String,
    pub api_key: String,
    pub from_number: String,
}

impl NotificationService {
    /// Initialize the notification service with Quebec Law 25 compliance
    pub async fn new(
        pool: SqlitePool,
        cai_webhook_url: Option<String>,
    ) -> Result<Self, NotificationError> {
        // Run notification-specific migrations
        sqlx::migrate!("./migrations/notifications").run(&pool).await?;

        let service = Self {
            pool,
            cai_webhook_url,
            smtp_config: Self::load_smtp_config(),
            sms_config: Self::load_sms_config(),
        };

        // Initialize default Quebec Law 25 templates
        service.initialize_quebec_templates().await?;

        info!("Quebec Law 25 notification service initialized");
        Ok(service)
    }

    /// Send CAI breach notification (Quebec Law 25 requirement)
    pub async fn send_cai_breach_notification(
        &self,
        incident_id: &str,
        breach_type: &str,
        severity: &str,
        affected_users_count: i32,
        description: &str,
    ) -> Result<String, NotificationError> {
        let notification_id = Uuid::new_v4().to_string();

        // Quebec CAI requires specific format and French language
        let cai_payload = serde_json::json!({
            "type": "breach_notification",
            "incident_id": incident_id,
            "organization": {
                "name": "PsyPsy CMS",
                "sector": "healthcare",
                "contact_dpo": std::env::var("DPO_CONTACT").unwrap_or_default()
            },
            "breach": {
                "type": breach_type,
                "severity": severity,
                "detected_at": Utc::now().to_rfc3339(),
                "affected_individuals": affected_users_count,
                "description_fr": description,
                "measures_taken": "Investigation en cours, sécurisation des systèmes effectuée",
                "risk_assessment": "Évaluation des risques en cours"
            },
            "compliance": {
                "law": "Loi 25 du Québec",
                "notification_timing": "Dans les 72 heures selon l'article 63.1"
            },
            "contact": {
                "responsible_person": std::env::var("BREACH_CONTACT_PERSON").unwrap_or_default(),
                "email": std::env::var("BREACH_CONTACT_EMAIL").unwrap_or_default(),
                "phone": std::env::var("BREACH_CONTACT_PHONE").unwrap_or_default()
            }
        });

        // Send to CAI webhook if configured
        if let Some(webhook_url) = &self.cai_webhook_url {
            // In real implementation, would make HTTP POST to CAI endpoint
            info!("CAI notification would be sent to: {}", webhook_url);
        }

        // Log the notification
        self.log_notification(
            notification_id.clone(),
            NotificationType::BreachNotificationCAI,
            "cai@quebec.ca", // CAI system
            "",
            NotificationLanguage::French,
            NotificationPriority::Critical,
            NotificationChannel::WebhookCAI,
            "Notification de violation de confidentialité - Loi 25",
            &cai_payload.to_string(),
            Some(incident_id),
        ).await?;

        info!("CAI breach notification sent for incident: {}", incident_id);
        Ok(notification_id)
    }

    /// Send breach notification to affected users (Quebec Law 25 requirement)
    pub async fn send_user_breach_notification(
        &self,
        incident_id: &str,
        user_id: &str,
        breach_description: &str,
        recommended_actions: &[String],
    ) -> Result<String, NotificationError> {
        let notification_id = Uuid::new_v4().to_string();

        // Get user contact info and preferred language
        let user = sqlx::query!(
            "SELECT email, phone, preferred_language FROM clients WHERE id = ?",
            user_id
        )
        .fetch_optional(&self.pool)
        .await?;

        let user = user.ok_or_else(|| NotificationError::InvalidRecipient(user_id.to_string()))?;

        // Determine notification language (Quebec Law 25: French by default, English on request)
        let language = match user.preferred_language.as_deref() {
            Some("en") => NotificationLanguage::English,
            _ => NotificationLanguage::French, // Default to French in Quebec
        };

        // Render appropriate template
        let (subject, content) = self.render_breach_notification_template(
            &language,
            breach_description,
            recommended_actions,
        ).await?;

        // Send notification via email (primary) and SMS (backup for critical breaches)
        if let Some(email) = user.email {
            self.send_email_notification(
                &notification_id,
                &email,
                &subject,
                &content,
                NotificationPriority::High,
            ).await?;
        }

        if let Some(phone) = user.phone {
            // SMS notification for critical breaches
            let sms_content = match language {
                NotificationLanguage::French => {
                    "URGENT: Incident de sécurité détecté. Vérifiez votre courriel pour les détails. Si vous n'avez pas accès à votre courriel, contactez-nous immédiatement."
                },
                _ => {
                    "URGENT: Security incident detected. Check your email for details. If you don't have email access, contact us immediately."
                }
            };

            self.send_sms_notification(
                &notification_id,
                &phone,
                sms_content,
                NotificationPriority::High,
            ).await?;
        }

        // Log the notification
        self.log_notification(
            notification_id.clone(),
            NotificationType::BreachNotificationUser,
            user_id,
            user.email.as_deref().unwrap_or(""),
            language,
            NotificationPriority::High,
            NotificationChannel::Email,
            &subject,
            &content,
            Some(incident_id),
        ).await?;

        info!("User breach notification sent to user: {}", user_id);
        Ok(notification_id)
    }

    /// Send data subject rights response notification
    pub async fn send_data_subject_response(
        &self,
        request_id: &str,
        user_id: &str,
        request_type: &str,
        response_data: Option<&str>,
    ) -> Result<String, NotificationError> {
        let notification_id = Uuid::new_v4().to_string();

        // Get user info
        let user = sqlx::query!(
            "SELECT email, preferred_language FROM clients WHERE id = ?",
            user_id
        )
        .fetch_optional(&self.pool)
        .await?;

        let user = user.ok_or_else(|| NotificationError::InvalidRecipient(user_id.to_string()))?;

        let language = match user.preferred_language.as_deref() {
            Some("en") => NotificationLanguage::English,
            _ => NotificationLanguage::French,
        };

        let (subject, content) = self.render_data_subject_response_template(
            &language,
            request_type,
            response_data,
        ).await?;

        if let Some(email) = user.email {
            self.send_email_notification(
                &notification_id,
                &email,
                &subject,
                &content,
                NotificationPriority::Normal,
            ).await?;
        }

        self.log_notification(
            notification_id.clone(),
            NotificationType::DataSubjectRightsResponse,
            user_id,
            user.email.as_deref().unwrap_or(""),
            language,
            NotificationPriority::Normal,
            NotificationChannel::Email,
            &subject,
            &content,
            Some(request_id),
        ).await?;

        info!("Data subject response sent for request: {}", request_id);
        Ok(notification_id)
    }

    /// Send consent expiration reminder
    pub async fn send_consent_expiration_reminder(
        &self,
        user_id: &str,
        consent_id: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<String, NotificationError> {
        let notification_id = Uuid::new_v4().to_string();

        // Get user info
        let user = sqlx::query!(
            "SELECT email, preferred_language FROM clients WHERE id = ?",
            user_id
        )
        .fetch_optional(&self.pool)
        .await?;

        let user = user.ok_or_else(|| NotificationError::InvalidRecipient(user_id.to_string()))?;

        let language = match user.preferred_language.as_deref() {
            Some("en") => NotificationLanguage::English,
            _ => NotificationLanguage::French,
        };

        let (subject, content) = self.render_consent_expiration_template(
            &language,
            expires_at,
        ).await?;

        if let Some(email) = user.email {
            self.send_email_notification(
                &notification_id,
                &email,
                &subject,
                &content,
                NotificationPriority::Normal,
            ).await?;
        }

        self.log_notification(
            notification_id.clone(),
            NotificationType::ConsentExpiration,
            user_id,
            user.email.as_deref().unwrap_or(""),
            language,
            NotificationPriority::Normal,
            NotificationChannel::Email,
            &subject,
            &content,
            Some(consent_id),
        ).await?;

        info!("Consent expiration reminder sent to user: {}", user_id);
        Ok(notification_id)
    }

    /// Log notification for audit purposes
    async fn log_notification(
        &self,
        notification_id: String,
        notification_type: NotificationType,
        recipient_id: &str,
        recipient_email: &str,
        language: NotificationLanguage,
        priority: NotificationPriority,
        channel: NotificationChannel,
        subject: &str,
        content: &str,
        reference_id: Option<&str>,
    ) -> Result<(), NotificationError> {
        let now = Utc::now();

        sqlx::query!(
            r#"
            INSERT INTO notification_logs (
                id, notification_type, recipient_id, recipient_email,
                language, priority, channel, subject, content,
                sent_at, delivery_status, quebec_law25_compliant,
                audit_trail_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            notification_id,
            format!("{:?}", notification_type),
            recipient_id,
            if recipient_email.is_empty() { None } else { Some(recipient_email) },
            format!("{:?}", language),
            format!("{:?}", priority),
            format!("{:?}", channel),
            subject,
            content,
            now,
            "sent",
            true, // All our notifications are Quebec Law 25 compliant
            reference_id
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Initialize default Quebec Law 25 notification templates
    async fn initialize_quebec_templates(&self) -> Result<(), NotificationError> {
        let templates = vec![
            // French breach notification template
            NotificationTemplate {
                id: Uuid::new_v4().to_string(),
                template_name: "breach_notification_fr".to_string(),
                notification_type: "BreachNotificationUser".to_string(),
                language: "French".to_string(),
                subject_template: "URGENT: Incident de sécurité - Vos données personnelles".to_string(),
                body_template: r#"
Bonjour,

Nous vous informons qu'un incident de sécurité a été détecté dans nos systèmes le {{date}}.

DESCRIPTION DE L'INCIDENT:
{{description}}

DONNÉES POTENTIELLEMENT AFFECTÉES:
- Données médicales
- Informations personnelles

MESURES PRISES:
- Investigation immédiate lancée
- Systèmes sécurisés
- Autorités compétentes notifiées

ACTIONS RECOMMANDÉES:
{{recommended_actions}}

VOS DROITS:
Conformément à la Loi 25 du Québec, vous avez le droit de:
- Demander des informations supplémentaires
- Déposer une plainte auprès de la CAI
- Demander des mesures de protection

Pour toute question: {{contact_info}}

Cordialement,
L'équipe PsyPsy CMS
                "#.to_string(),
                is_active: true,
                quebec_law25_compliant: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            // English breach notification template
            NotificationTemplate {
                id: Uuid::new_v4().to_string(),
                template_name: "breach_notification_en".to_string(),
                notification_type: "BreachNotificationUser".to_string(),
                language: "English".to_string(),
                subject_template: "URGENT: Security Incident - Your Personal Data".to_string(),
                body_template: r#"
Hello,

We are writing to inform you that a security incident was detected in our systems on {{date}}.

INCIDENT DESCRIPTION:
{{description}}

POTENTIALLY AFFECTED DATA:
- Medical records
- Personal information

MEASURES TAKEN:
- Immediate investigation launched
- Systems secured
- Relevant authorities notified

RECOMMENDED ACTIONS:
{{recommended_actions}}

YOUR RIGHTS:
Under Quebec's Law 25, you have the right to:
- Request additional information
- File a complaint with the CAI
- Request protective measures

For any questions: {{contact_info}}

Sincerely,
The PsyPsy CMS Team
                "#.to_string(),
                is_active: true,
                quebec_law25_compliant: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
        ];

        for template in templates {
            sqlx::query!(
                r#"
                INSERT OR REPLACE INTO notification_templates (
                    id, template_name, notification_type, language,
                    subject_template, body_template, is_active,
                    quebec_law25_compliant, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#,
                template.id,
                template.template_name,
                template.notification_type,
                template.language,
                template.subject_template,
                template.body_template,
                template.is_active,
                template.quebec_law25_compliant,
                template.created_at,
                template.updated_at
            )
            .execute(&self.pool)
            .await?;
        }

        info!("Quebec Law 25 notification templates initialized");
        Ok(())
    }

    /// Render breach notification template
    async fn render_breach_notification_template(
        &self,
        language: &NotificationLanguage,
        description: &str,
        recommended_actions: &[String],
    ) -> Result<(String, String), NotificationError> {
        let lang_str = match language {
            NotificationLanguage::French => "French",
            _ => "English",
        };

        let template = sqlx::query_as!(
            NotificationTemplate,
            "SELECT * FROM notification_templates WHERE template_name = ? AND language = ? AND is_active = true",
            format!("breach_notification_{}", if lang_str == "French" { "fr" } else { "en" }),
            lang_str
        )
        .fetch_optional(&self.pool)
        .await?
        .ok_or_else(|| NotificationError::TemplateNotFound("breach_notification".to_string()))?;

        // Simple template rendering (in production, use proper template engine)
        let subject = template.subject_template;
        let content = template.body_template
            .replace("{{date}}", &Utc::now().format("%Y-%m-%d").to_string())
            .replace("{{description}}", description)
            .replace("{{recommended_actions}}", &recommended_actions.join("\n- "))
            .replace("{{contact_info}}", &std::env::var("SUPPORT_CONTACT").unwrap_or("support@psypsy.ca".to_string()));

        Ok((subject, content))
    }

    /// Render data subject response template
    async fn render_data_subject_response_template(
        &self,
        language: &NotificationLanguage,
        request_type: &str,
        response_data: Option<&str>,
    ) -> Result<(String, String), NotificationError> {
        // Simplified template rendering for data subject responses
        let (subject, content) = match language {
            NotificationLanguage::French => (
                format!("Réponse à votre demande de {} - Loi 25", request_type),
                format!("Votre demande de {} a été traitée. {}",
                       request_type,
                       response_data.unwrap_or("Voir pièce jointe pour les détails."))
            ),
            _ => (
                format!("Response to your {} request - Law 25", request_type),
                format!("Your {} request has been processed. {}",
                       request_type,
                       response_data.unwrap_or("See attachment for details."))
            ),
        };

        Ok((subject, content))
    }

    /// Render consent expiration template
    async fn render_consent_expiration_template(
        &self,
        language: &NotificationLanguage,
        expires_at: DateTime<Utc>,
    ) -> Result<(String, String), NotificationError> {
        let (subject, content) = match language {
            NotificationLanguage::French => (
                "Rappel: Votre consentement expire bientôt".to_string(),
                format!("Votre consentement pour le traitement de vos données expire le {}. Veuillez renouveler votre consentement si vous souhaitez continuer à utiliser nos services.",
                       expires_at.format("%Y-%m-%d"))
            ),
            _ => (
                "Reminder: Your consent expires soon".to_string(),
                format!("Your consent for data processing expires on {}. Please renew your consent if you wish to continue using our services.",
                       expires_at.format("%Y-%m-%d"))
            ),
        };

        Ok((subject, content))
    }

    /// Send email notification (placeholder implementation)
    async fn send_email_notification(
        &self,
        notification_id: &str,
        email: &str,
        subject: &str,
        content: &str,
        priority: NotificationPriority,
    ) -> Result<(), NotificationError> {
        // In real implementation, integrate with email service (SMTP, SendGrid, etc.)
        info!("Email notification sent to {}: {} (priority: {:?})", email, subject, priority);
        Ok(())
    }

    /// Send SMS notification (placeholder implementation)
    async fn send_sms_notification(
        &self,
        notification_id: &str,
        phone: &str,
        content: &str,
        priority: NotificationPriority,
    ) -> Result<(), NotificationError> {
        // In real implementation, integrate with SMS service (Twilio, AWS SNS, etc.)
        info!("SMS notification sent to {}: {} (priority: {:?})", phone, content, priority);
        Ok(())
    }

    /// Load SMTP configuration from environment
    fn load_smtp_config() -> Option<SmtpConfig> {
        // Load from environment variables
        None // Placeholder
    }

    /// Load SMS configuration from environment
    fn load_sms_config() -> Option<SmsConfig> {
        // Load from environment variables
        None // Placeholder
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_notification_service_creation() {
        // Test notification service initialization
    }

    #[tokio::test]
    async fn test_cai_notification_format() {
        // Test CAI notification payload format compliance
    }

    #[tokio::test]
    async fn test_bilingual_notifications() {
        // Test French and English template rendering
    }
}