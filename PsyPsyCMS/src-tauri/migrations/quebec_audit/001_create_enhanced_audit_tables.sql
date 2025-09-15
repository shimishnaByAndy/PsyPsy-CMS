-- Enhanced Quebec Law 25 Audit Service Tables
-- Migration 001: Create comprehensive audit monitoring, breach detection, and data subject rights tables

-- Audit alerts table for real-time monitoring
CREATE TABLE IF NOT EXISTS audit_alerts (
    id TEXT PRIMARY KEY NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'suspicious_access', 'failed_login', 'data_breach', 'compliance_violation',
        'critical_event', 'unauthorized_access', 'data_export', 'system_anomaly'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('Info', 'Warning', 'Critical', 'Emergency')),
    message TEXT NOT NULL,
    event_data TEXT NOT NULL DEFAULT '{}', -- JSON with additional context

    -- Temporal tracking
    triggered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    resolved_by TEXT, -- ID of the person who resolved the alert

    -- Status tracking
    auto_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    notification_sent BOOLEAN NOT NULL DEFAULT FALSE,

    -- Indexes for performance
    FOREIGN KEY (resolved_by) REFERENCES professionals(id)
);

-- Breach incidents table for Quebec Law 25 breach reporting
CREATE TABLE IF NOT EXISTS breach_incidents (
    id TEXT PRIMARY KEY NOT NULL,
    breach_type TEXT NOT NULL CHECK (breach_type IN (
        'DataAccess', 'DataTheft', 'UnauthorizedAccess', 'DataLoss',
        'SystemCompromise', 'PhishingAttack', 'InsiderThreat', 'TechnicalFailure'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    description TEXT NOT NULL,
    affected_users TEXT NOT NULL DEFAULT '[]', -- JSON array of user IDs

    -- Temporal tracking
    detected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reported_at DATETIME, -- When reported to CAI

    -- Quebec Law 25 notification requirements
    cai_notification_sent BOOLEAN NOT NULL DEFAULT FALSE, -- Commission d'accès à l'information
    cai_notification_due DATETIME, -- 72 hours from detection for serious breaches
    users_notified BOOLEAN NOT NULL DEFAULT FALSE,
    user_notification_due DATETIME, -- Reasonable time for user notification

    -- Incident management
    incident_status TEXT NOT NULL DEFAULT 'detected' CHECK (incident_status IN (
        'detected', 'investigating', 'contained', 'resolved', 'reported'
    )),
    investigation_notes TEXT,
    remediation_actions TEXT, -- JSON array of actions taken

    -- Assigned investigator
    assigned_investigator TEXT,
    escalated_to_management BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (assigned_investigator) REFERENCES professionals(id)
);

-- Data subject requests table for Quebec Law 25 data rights
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN (
        'Access', 'Rectification', 'Erasure', 'Portability',
        'Restriction', 'Objection', 'WithdrawConsent'
    )),
    request_details TEXT NOT NULL,

    -- Status and timing
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'rejected', 'cancelled'
    )),
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME NOT NULL, -- Quebec Law 25: 30 days response time
    completed_at DATETIME,

    -- Response handling
    response_data TEXT, -- JSON with response details or exported data location
    rejection_reason TEXT,
    processed_by TEXT, -- ID of staff member who processed the request

    -- Priority and complexity
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    complexity TEXT NOT NULL DEFAULT 'simple' CHECK (complexity IN ('simple', 'moderate', 'complex')),
    estimated_hours REAL, -- Estimated processing time
    actual_hours REAL, -- Actual time spent

    -- Communication
    communication_log TEXT DEFAULT '[]', -- JSON array of communications with user
    user_notified_of_completion BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (user_id) REFERENCES clients(id),
    FOREIGN KEY (processed_by) REFERENCES professionals(id)
);

-- Quebec-specific compliance monitoring table
CREATE TABLE IF NOT EXISTS quebec_compliance_monitoring (
    id TEXT PRIMARY KEY NOT NULL,
    monitoring_date DATE NOT NULL DEFAULT (DATE('now')),

    -- Daily compliance metrics
    total_audit_events INTEGER NOT NULL DEFAULT 0,
    phi_access_events INTEGER NOT NULL DEFAULT 0,
    compliance_violations INTEGER NOT NULL DEFAULT 0,

    -- Breach and incident metrics
    new_breaches INTEGER NOT NULL DEFAULT 0,
    resolved_breaches INTEGER NOT NULL DEFAULT 0,
    overdue_breach_notifications INTEGER NOT NULL DEFAULT 0,

    -- Data subject rights metrics
    new_data_requests INTEGER NOT NULL DEFAULT 0,
    completed_data_requests INTEGER NOT NULL DEFAULT 0,
    overdue_data_requests INTEGER NOT NULL DEFAULT 0,

    -- Consent metrics
    new_consents INTEGER NOT NULL DEFAULT 0,
    withdrawn_consents INTEGER NOT NULL DEFAULT 0,
    expired_consents INTEGER NOT NULL DEFAULT 0,

    -- System health
    system_availability_percent REAL NOT NULL DEFAULT 100.0,
    encryption_status TEXT NOT NULL DEFAULT 'healthy' CHECK (encryption_status IN ('healthy', 'warning', 'critical')),
    backup_status TEXT NOT NULL DEFAULT 'healthy' CHECK (backup_status IN ('healthy', 'warning', 'critical')),

    -- Automated assessment
    overall_compliance_score REAL NOT NULL DEFAULT 100.0, -- Percentage score
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),

    -- Next actions required
    action_items TEXT DEFAULT '[]', -- JSON array of required actions

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes for audit alerts
CREATE INDEX IF NOT EXISTS idx_audit_alerts_type_severity
ON audit_alerts(alert_type, severity, triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_alerts_triggered
ON audit_alerts(triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_alerts_unresolved
ON audit_alerts(resolved_at) WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_alerts_severity
ON audit_alerts(severity, triggered_at DESC);

-- Performance indexes for breach incidents
CREATE INDEX IF NOT EXISTS idx_breach_incidents_status
ON breach_incidents(incident_status, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_breach_incidents_severity
ON breach_incidents(severity, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_breach_incidents_cai_notification
ON breach_incidents(cai_notification_sent, cai_notification_due);

CREATE INDEX IF NOT EXISTS idx_breach_incidents_user_notification
ON breach_incidents(users_notified, user_notification_due);

CREATE INDEX IF NOT EXISTS idx_breach_incidents_investigator
ON breach_incidents(assigned_investigator, incident_status);

-- Performance indexes for data subject requests
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_user
ON data_subject_requests(user_id, status, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status
ON data_subject_requests(status, due_date);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_overdue
ON data_subject_requests(due_date, status) WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_type
ON data_subject_requests(request_type, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_priority
ON data_subject_requests(priority, status, due_date);

-- Performance indexes for compliance monitoring
CREATE INDEX IF NOT EXISTS idx_quebec_compliance_monitoring_date
ON quebec_compliance_monitoring(monitoring_date DESC);

CREATE INDEX IF NOT EXISTS idx_quebec_compliance_monitoring_risk
ON quebec_compliance_monitoring(risk_level, monitoring_date DESC);

-- Create trigger for automatic breach incident CAI notification scheduling
CREATE TRIGGER IF NOT EXISTS breach_cai_notification_trigger
    AFTER INSERT ON breach_incidents
    FOR EACH ROW
    WHEN NEW.severity IN ('High', 'Critical')
BEGIN
    -- Quebec Law 25: CAI notification required within 72 hours for serious breaches
    UPDATE breach_incidents
    SET cai_notification_due = DATETIME(NEW.detected_at, '+72 hours')
    WHERE id = NEW.id;
END;

-- Create trigger for automatic user notification scheduling
CREATE TRIGGER IF NOT EXISTS breach_user_notification_trigger
    AFTER INSERT ON breach_incidents
    FOR EACH ROW
    WHEN JSON_ARRAY_LENGTH(NEW.affected_users) > 0
BEGIN
    -- Quebec Law 25: User notification in reasonable time (24-48 hours)
    UPDATE breach_incidents
    SET user_notification_due = DATETIME(NEW.detected_at, '+24 hours')
    WHERE id = NEW.id;
END;

-- Create trigger for data subject request due date calculation
CREATE TRIGGER IF NOT EXISTS data_request_due_date_trigger
    AFTER INSERT ON data_subject_requests
    FOR EACH ROW
BEGIN
    -- Quebec Law 25: 30 days response time for data subject requests
    UPDATE data_subject_requests
    SET due_date = DATETIME(NEW.requested_at, '+30 days')
    WHERE id = NEW.id AND NEW.due_date IS NULL;
END;

-- Create trigger for automatic compliance monitoring updates
CREATE TRIGGER IF NOT EXISTS compliance_monitoring_audit_trigger
    AFTER INSERT ON quebec_audit_logs
    FOR EACH ROW
BEGIN
    -- Update or insert today's compliance monitoring record
    INSERT OR REPLACE INTO quebec_compliance_monitoring (
        id, monitoring_date, total_audit_events, phi_access_events, compliance_violations
    ) VALUES (
        DATE('now'),
        DATE('now'),
        COALESCE((SELECT total_audit_events FROM quebec_compliance_monitoring WHERE monitoring_date = DATE('now')), 0) + 1,
        COALESCE((SELECT phi_access_events FROM quebec_compliance_monitoring WHERE monitoring_date = DATE('now')), 0) +
            CASE WHEN NEW.phi_accessed THEN 1 ELSE 0 END,
        COALESCE((SELECT compliance_violations FROM quebec_compliance_monitoring WHERE monitoring_date = DATE('now')), 0) +
            CASE WHEN NOT NEW.quebec_law25_compliant THEN 1 ELSE 0 END
    );
END;

-- Create view for compliance dashboard
CREATE VIEW IF NOT EXISTS quebec_compliance_dashboard AS
SELECT
    m.monitoring_date,
    m.total_audit_events,
    m.phi_access_events,
    m.compliance_violations,
    m.overall_compliance_score,
    m.risk_level,

    -- Active alerts count
    (SELECT COUNT(*) FROM audit_alerts WHERE resolved_at IS NULL) as active_alerts,

    -- Active breaches count
    (SELECT COUNT(*) FROM breach_incidents WHERE incident_status IN ('detected', 'investigating', 'contained')) as active_breaches,

    -- Overdue items count
    (SELECT COUNT(*) FROM breach_incidents WHERE cai_notification_due < DATETIME('now') AND NOT cai_notification_sent) as overdue_cai_notifications,
    (SELECT COUNT(*) FROM breach_incidents WHERE user_notification_due < DATETIME('now') AND NOT users_notified) as overdue_user_notifications,
    (SELECT COUNT(*) FROM data_subject_requests WHERE due_date < DATETIME('now') AND status IN ('pending', 'processing')) as overdue_data_requests,

    -- Recent activity (last 7 days)
    (SELECT COUNT(*) FROM quebec_audit_logs WHERE timestamp > DATETIME('now', '-7 days')) as recent_audit_events,
    (SELECT COUNT(*) FROM breach_incidents WHERE detected_at > DATETIME('now', '-7 days')) as recent_breaches,
    (SELECT COUNT(*) FROM data_subject_requests WHERE requested_at > DATETIME('now', '-7 days')) as recent_data_requests

FROM quebec_compliance_monitoring m
WHERE m.monitoring_date = (SELECT MAX(monitoring_date) FROM quebec_compliance_monitoring);