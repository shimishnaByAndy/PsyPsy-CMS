-- Quebec Law 25 Notification Service Tables
-- Migration 001: Create notification templates and logging tables

-- Notification templates table for Quebec Law 25 compliant messaging
CREATE TABLE IF NOT EXISTS notification_templates (
    id TEXT PRIMARY KEY NOT NULL,
    template_name TEXT NOT NULL, -- 'breach_notification_fr', 'data_subject_response_en', etc.
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'BreachNotificationCAI', 'BreachNotificationUser', 'DataSubjectRightsResponse',
        'ConsentExpiration', 'ComplianceAlert', 'AuditAlert', 'SystemMaintenance'
    )),
    language TEXT NOT NULL CHECK (language IN ('French', 'English', 'Bilingual')),

    -- Template content
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,

    -- Status and compliance
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    quebec_law25_compliant BOOLEAN NOT NULL DEFAULT TRUE,

    -- Template metadata
    template_version TEXT NOT NULL DEFAULT '1.0',
    approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'approved', 'archived')),
    approved_by TEXT, -- Staff member who approved the template
    approved_at DATETIME,

    -- Legal compliance fields
    legal_review_required BOOLEAN NOT NULL DEFAULT TRUE,
    legal_reviewed_by TEXT,
    legal_reviewed_at DATETIME,
    retention_period_days INTEGER NOT NULL DEFAULT 2555, -- 7 years for legal notifications

    -- Temporal tracking
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Ensure unique template per type/language combination
    UNIQUE(template_name, language),

    FOREIGN KEY (approved_by) REFERENCES professionals(id),
    FOREIGN KEY (legal_reviewed_by) REFERENCES professionals(id)
);

-- Notification logs table for audit and compliance tracking
CREATE TABLE IF NOT EXISTS notification_logs (
    id TEXT PRIMARY KEY NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'BreachNotificationCAI', 'BreachNotificationUser', 'DataSubjectRightsResponse',
        'ConsentExpiration', 'ComplianceAlert', 'AuditAlert', 'SystemMaintenance'
    )),

    -- Recipient information
    recipient_id TEXT NOT NULL, -- Could be user_id, 'cai', 'system_admin', etc.
    recipient_email TEXT,
    recipient_phone TEXT,
    recipient_type TEXT NOT NULL DEFAULT 'user' CHECK (recipient_type IN (
        'user', 'cai', 'system_admin', 'professional', 'external_authority'
    )),

    -- Message details
    language TEXT NOT NULL CHECK (language IN ('French', 'English', 'Bilingual')),
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Normal', 'High', 'Critical', 'Emergency')),
    channel TEXT NOT NULL CHECK (channel IN (
        'Email', 'SMS', 'InApp', 'WebhookCAI', 'SecurePortal', 'PhysicalMail'
    )),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Delivery tracking
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_status TEXT NOT NULL DEFAULT 'sent' CHECK (delivery_status IN (
        'pending', 'sent', 'delivered', 'failed', 'bounced', 'rejected'
    )),
    delivery_confirmed_at DATETIME,
    delivery_attempts INTEGER NOT NULL DEFAULT 1,
    max_delivery_attempts INTEGER NOT NULL DEFAULT 3,

    -- User interaction tracking
    read_at DATETIME,
    read_receipt_requested BOOLEAN NOT NULL DEFAULT FALSE,
    user_acknowledged_at DATETIME,
    user_response TEXT, -- If user responds to the notification

    -- Error handling
    error_message TEXT,
    retry_scheduled_at DATETIME,

    -- Quebec Law 25 compliance
    quebec_law25_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    cai_notification_required BOOLEAN NOT NULL DEFAULT FALSE,
    user_rights_included BOOLEAN NOT NULL DEFAULT TRUE, -- Whether user rights info was included
    french_language_provided BOOLEAN NOT NULL DEFAULT TRUE, -- Quebec language requirement

    -- Audit and reference tracking
    audit_trail_id TEXT, -- Link to quebec_audit_logs
    reference_id TEXT, -- Link to breach_incidents, data_subject_requests, etc.
    related_incident_id TEXT,
    related_request_id TEXT,

    -- Legal and compliance metadata
    legal_hold BOOLEAN NOT NULL DEFAULT FALSE, -- For litigation holds
    retention_until DATETIME, -- Calculated retention date
    disposed_at DATETIME, -- When notification was disposed of

    FOREIGN KEY (audit_trail_id) REFERENCES quebec_audit_logs(id),
    FOREIGN KEY (related_incident_id) REFERENCES breach_incidents(id),
    FOREIGN KEY (related_request_id) REFERENCES data_subject_requests(id)
);

-- CAI notification tracking table (Commission d'accès à l'information du Québec)
CREATE TABLE IF NOT EXISTS cai_notifications (
    id TEXT PRIMARY KEY NOT NULL,
    breach_incident_id TEXT NOT NULL,
    notification_log_id TEXT NOT NULL,

    -- CAI specific fields
    cai_reference_number TEXT, -- Assigned by CAI system
    notification_method TEXT NOT NULL DEFAULT 'webhook' CHECK (notification_method IN (
        'webhook', 'email', 'portal', 'physical_mail'
    )),

    -- Content details
    organization_info TEXT NOT NULL, -- JSON with organization details
    breach_details TEXT NOT NULL, -- JSON with breach specifics
    affected_individuals_count INTEGER NOT NULL,
    risk_assessment TEXT NOT NULL, -- JSON with risk evaluation
    mitigation_measures TEXT NOT NULL, -- JSON with measures taken

    -- Timing and compliance
    legally_required BOOLEAN NOT NULL DEFAULT TRUE,
    notification_due_date DATETIME NOT NULL, -- 72 hours from breach detection
    sent_at DATETIME,
    acknowledged_by_cai BOOLEAN NOT NULL DEFAULT FALSE,
    cai_response_received_at DATETIME,
    cai_response_content TEXT,

    -- Follow-up tracking
    follow_up_required BOOLEAN NOT NULL DEFAULT FALSE,
    follow_up_due_date DATETIME,
    follow_up_completed BOOLEAN NOT NULL DEFAULT FALSE,
    final_report_required BOOLEAN NOT NULL DEFAULT FALSE,
    final_report_sent_at DATETIME,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'acknowledged', 'under_review', 'closed', 'escalated'
    )),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (breach_incident_id) REFERENCES breach_incidents(id),
    FOREIGN KEY (notification_log_id) REFERENCES notification_logs(id)
);

-- Notification delivery statistics and performance tracking
CREATE TABLE IF NOT EXISTS notification_delivery_stats (
    id TEXT PRIMARY KEY NOT NULL,
    date DATE NOT NULL DEFAULT (DATE('now')),
    notification_type TEXT NOT NULL,
    channel TEXT NOT NULL,

    -- Volume statistics
    total_sent INTEGER NOT NULL DEFAULT 0,
    successful_deliveries INTEGER NOT NULL DEFAULT 0,
    failed_deliveries INTEGER NOT NULL DEFAULT 0,
    bounced_deliveries INTEGER NOT NULL DEFAULT 0,

    -- Performance metrics
    average_delivery_time_seconds REAL,
    max_delivery_time_seconds REAL,
    min_delivery_time_seconds REAL,

    -- User engagement
    total_opened INTEGER NOT NULL DEFAULT 0,
    total_acknowledged INTEGER NOT NULL DEFAULT 0,
    total_responded INTEGER NOT NULL DEFAULT 0,

    -- Compliance metrics
    quebec_law25_compliant_notifications INTEGER NOT NULL DEFAULT 0,
    cai_notifications_sent INTEGER NOT NULL DEFAULT 0,
    overdue_notifications INTEGER NOT NULL DEFAULT 0,

    -- Error analysis
    error_rate_percent REAL NOT NULL DEFAULT 0.0,
    most_common_error TEXT,
    error_count INTEGER NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(date, notification_type, channel)
);

-- Indexes for performance optimization

-- Notification templates indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_type_language
ON notification_templates(notification_type, language, is_active);

CREATE INDEX IF NOT EXISTS idx_notification_templates_approval
ON notification_templates(approval_status, quebec_law25_compliant);

-- Notification logs indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient
ON notification_logs(recipient_id, notification_type, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_delivery_status
ON notification_logs(delivery_status, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_priority_type
ON notification_logs(priority, notification_type, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_cai_required
ON notification_logs(cai_notification_required, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_reference
ON notification_logs(reference_id, related_incident_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_retention
ON notification_logs(retention_until) WHERE retention_until IS NOT NULL;

-- CAI notifications indexes
CREATE INDEX IF NOT EXISTS idx_cai_notifications_breach
ON cai_notifications(breach_incident_id, status);

CREATE INDEX IF NOT EXISTS idx_cai_notifications_due_date
ON cai_notifications(notification_due_date, status);

CREATE INDEX IF NOT EXISTS idx_cai_notifications_follow_up
ON cai_notifications(follow_up_required, follow_up_due_date);

-- Delivery stats indexes
CREATE INDEX IF NOT EXISTS idx_notification_delivery_stats_date
ON notification_delivery_stats(date DESC, notification_type);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_stats_performance
ON notification_delivery_stats(channel, error_rate_percent);

-- Triggers for automated processing

-- Update notification template timestamp
CREATE TRIGGER IF NOT EXISTS update_notification_template_timestamp
    AFTER UPDATE ON notification_templates
    FOR EACH ROW
BEGIN
    UPDATE notification_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Calculate retention date for notification logs
CREATE TRIGGER IF NOT EXISTS notification_log_retention_trigger
    AFTER INSERT ON notification_logs
    FOR EACH ROW
BEGIN
    UPDATE notification_logs
    SET retention_until = DATETIME(NEW.sent_at, '+2555 days') -- 7 years
    WHERE id = NEW.id AND NEW.quebec_law25_compliant = TRUE;
END;

-- Auto-update CAI notification timestamp
CREATE TRIGGER IF NOT EXISTS update_cai_notification_timestamp
    AFTER UPDATE ON cai_notifications
    FOR EACH ROW
BEGIN
    UPDATE cai_notifications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Auto-create CAI notification due date
CREATE TRIGGER IF NOT EXISTS cai_notification_due_date_trigger
    AFTER INSERT ON cai_notifications
    FOR EACH ROW
    WHEN NEW.notification_due_date IS NULL
BEGIN
    UPDATE cai_notifications
    SET notification_due_date = DATETIME(NEW.created_at, '+72 hours')
    WHERE id = NEW.id;
END;

-- Update delivery statistics
CREATE TRIGGER IF NOT EXISTS notification_delivery_stats_trigger
    AFTER UPDATE OF delivery_status ON notification_logs
    FOR EACH ROW
    WHEN NEW.delivery_status != OLD.delivery_status
BEGIN
    -- Update daily statistics
    INSERT OR REPLACE INTO notification_delivery_stats (
        id, date, notification_type, channel,
        total_sent, successful_deliveries, failed_deliveries,
        quebec_law25_compliant_notifications
    ) VALUES (
        DATE('now') || '_' || NEW.notification_type || '_' || NEW.channel,
        DATE('now'),
        NEW.notification_type,
        NEW.channel,
        COALESCE((SELECT total_sent FROM notification_delivery_stats
                 WHERE date = DATE('now') AND notification_type = NEW.notification_type
                 AND channel = NEW.channel), 0) +
                 CASE WHEN OLD.delivery_status = 'pending' THEN 1 ELSE 0 END,
        COALESCE((SELECT successful_deliveries FROM notification_delivery_stats
                 WHERE date = DATE('now') AND notification_type = NEW.notification_type
                 AND channel = NEW.channel), 0) +
                 CASE WHEN NEW.delivery_status = 'delivered' THEN 1 ELSE 0 END,
        COALESCE((SELECT failed_deliveries FROM notification_delivery_stats
                 WHERE date = DATE('now') AND notification_type = NEW.notification_type
                 AND channel = NEW.channel), 0) +
                 CASE WHEN NEW.delivery_status IN ('failed', 'bounced') THEN 1 ELSE 0 END,
        COALESCE((SELECT quebec_law25_compliant_notifications FROM notification_delivery_stats
                 WHERE date = DATE('now') AND notification_type = NEW.notification_type
                 AND channel = NEW.channel), 0) +
                 CASE WHEN NEW.quebec_law25_compliant THEN 1 ELSE 0 END
    );
END;

-- View for notification compliance dashboard
CREATE VIEW IF NOT EXISTS notification_compliance_dashboard AS
SELECT
    -- Today's notification summary
    (SELECT COUNT(*) FROM notification_logs WHERE DATE(sent_at) = DATE('now')) as notifications_sent_today,
    (SELECT COUNT(*) FROM notification_logs
     WHERE DATE(sent_at) = DATE('now') AND delivery_status = 'delivered') as successful_deliveries_today,
    (SELECT COUNT(*) FROM notification_logs
     WHERE DATE(sent_at) = DATE('now') AND delivery_status IN ('failed', 'bounced')) as failed_deliveries_today,

    -- CAI notifications status
    (SELECT COUNT(*) FROM cai_notifications WHERE status = 'pending') as pending_cai_notifications,
    (SELECT COUNT(*) FROM cai_notifications
     WHERE notification_due_date < DATETIME('now') AND status = 'pending') as overdue_cai_notifications,

    -- User breach notifications
    (SELECT COUNT(*) FROM notification_logs
     WHERE notification_type = 'BreachNotificationUser' AND DATE(sent_at) = DATE('now')) as user_breach_notifications_today,

    -- Compliance metrics
    (SELECT COUNT(*) FROM notification_logs
     WHERE quebec_law25_compliant = FALSE) as non_compliant_notifications,
    (SELECT COUNT(*) FROM notification_logs
     WHERE french_language_provided = FALSE AND recipient_type = 'user') as missing_french_notifications,

    -- Performance metrics (last 7 days)
    (SELECT AVG(
        CASE delivery_status
            WHEN 'delivered' THEN 1.0
            ELSE 0.0
        END) * 100
     FROM notification_logs
     WHERE sent_at > DATETIME('now', '-7 days')) as delivery_success_rate_percent,

    -- Recent activity
    (SELECT COUNT(*) FROM notification_logs
     WHERE sent_at > DATETIME('now', '-24 hours')) as notifications_last_24h,
    (SELECT COUNT(*) FROM cai_notifications
     WHERE created_at > DATETIME('now', '-7 days')) as cai_notifications_last_7d;