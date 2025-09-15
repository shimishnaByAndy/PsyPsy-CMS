-- Quebec Law 25 Compliance Audit Logs
-- Migration 001: Create comprehensive audit logging system

CREATE TABLE IF NOT EXISTS quebec_audit_logs (
    id TEXT PRIMARY KEY NOT NULL,
    event_type TEXT NOT NULL,
    event_data TEXT NOT NULL, -- JSON serialized event details

    -- Identity and access tracking
    practitioner_id TEXT,
    client_id TEXT,

    -- Resource tracking
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'access', 'transform')),

    -- Temporal tracking
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Network and session tracking
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,

    -- Quebec Law 25 compliance flags
    quebec_law25_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    phi_accessed BOOLEAN NOT NULL DEFAULT FALSE,
    retention_period_days INTEGER NOT NULL DEFAULT 365,

    -- Foreign key constraints for referential integrity
    FOREIGN KEY (practitioner_id) REFERENCES professionals(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Performance and compliance indexes
CREATE INDEX IF NOT EXISTS idx_quebec_audit_resource
ON quebec_audit_logs(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_quebec_audit_timestamp
ON quebec_audit_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_quebec_audit_practitioner
ON quebec_audit_logs(practitioner_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_quebec_audit_client
ON quebec_audit_logs(client_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_quebec_audit_phi
ON quebec_audit_logs(phi_accessed, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_quebec_audit_event_type
ON quebec_audit_logs(event_type, timestamp DESC);

-- Quebec Law 25 specific indexes for compliance reporting
CREATE INDEX IF NOT EXISTS idx_quebec_audit_compliance
ON quebec_audit_logs(quebec_law25_compliant, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_quebec_audit_retention
ON quebec_audit_logs(retention_period_days, timestamp);

-- Session tracking for breach detection
CREATE INDEX IF NOT EXISTS idx_quebec_audit_session
ON quebec_audit_logs(session_id, timestamp) WHERE session_id IS NOT NULL;

-- Create consent records table if it doesn't exist (referenced by medical notes)
CREATE TABLE IF NOT EXISTS consent_records (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    data_types TEXT NOT NULL, -- JSON array of data types
    purposes TEXT NOT NULL, -- JSON array of purposes
    granular_choices TEXT NOT NULL, -- JSON object of specific choices
    consent_method TEXT NOT NULL, -- 'explicit', 'implicit', 'opt_in', 'opt_out'

    -- Quebec Law 25 specific fields
    language_provided TEXT NOT NULL DEFAULT 'fr', -- French is primary in Quebec
    clear_and_simple_language BOOLEAN NOT NULL DEFAULT TRUE,
    specific_purpose_explained BOOLEAN NOT NULL DEFAULT TRUE,

    -- Temporal tracking
    granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME, -- Quebec Law 25 allows consent expiration
    withdrawn_at DATETIME,

    -- Status tracking
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    withdrawal_reason TEXT,

    -- Audit trail
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES clients(id)
);

-- Consent records indexes
CREATE INDEX IF NOT EXISTS idx_consent_user_active
ON consent_records(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_consent_expiry
ON consent_records(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_consent_granted_date
ON consent_records(granted_at DESC);

-- Consent update trigger
CREATE TRIGGER IF NOT EXISTS update_consent_timestamp
    AFTER UPDATE ON consent_records
    FOR EACH ROW
BEGIN
    UPDATE consent_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Consent audit trigger for Quebec Law 25 compliance
CREATE TRIGGER IF NOT EXISTS consent_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON consent_records
    FOR EACH ROW
BEGIN
    INSERT INTO quebec_audit_logs (
        id, event_type, event_data, client_id, resource_type,
        resource_id, action, timestamp, quebec_law25_compliant,
        phi_accessed, retention_period_days
    ) VALUES (
        lower(hex(randomblob(16))),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'consent_granted'
            WHEN TG_OP = 'UPDATE' THEN 'consent_modified'
            WHEN TG_OP = 'DELETE' THEN 'consent_deleted'
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN json_object('deleted_consent_id', OLD.id)
            ELSE json_object(
                'consent_id', COALESCE(NEW.id, OLD.id),
                'data_types', COALESCE(NEW.data_types, OLD.data_types),
                'is_active', COALESCE(NEW.is_active, OLD.is_active)
            )
        END,
        COALESCE(NEW.user_id, OLD.user_id),
        'consent_record',
        COALESCE(NEW.id, OLD.id),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        CURRENT_TIMESTAMP,
        1, -- Quebec Law 25 compliant
        0, -- Consent records themselves don't contain PHI
        2555 -- 7 years retention for consent records
    );
END;

-- Data retention cleanup view for Quebec Law 25 compliance
CREATE VIEW IF NOT EXISTS quebec_audit_retention_view AS
SELECT
    id,
    event_type,
    timestamp,
    retention_period_days,
    DATE(timestamp, '+' || retention_period_days || ' days') as disposal_date,
    CASE
        WHEN DATE(timestamp, '+' || retention_period_days || ' days') < DATE('now')
        THEN 'eligible_for_disposal'
        ELSE 'active_retention'
    END as retention_status
FROM quebec_audit_logs
ORDER BY disposal_date;