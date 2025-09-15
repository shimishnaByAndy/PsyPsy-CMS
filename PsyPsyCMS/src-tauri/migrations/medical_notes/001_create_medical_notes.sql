-- Quebec Law 25 Compliant Medical Notes Storage
-- Migration 001: Create medical_notes table with encryption support

CREATE TABLE IF NOT EXISTS medical_notes (
    id TEXT PRIMARY KEY NOT NULL,
    practitioner_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    template_id TEXT NOT NULL,

    -- Encrypted content storage
    encrypted_content BLOB NOT NULL,
    content_hash TEXT NOT NULL,
    encryption_key_id TEXT NOT NULL,

    -- Quebec Law 25 compliance fields
    consent_id TEXT,
    quebec_organization TEXT,

    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Sync and conflict resolution
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'deleted')),
    sync_version INTEGER NOT NULL DEFAULT 1,

    -- De-identification and compliance
    is_deidentified BOOLEAN NOT NULL DEFAULT FALSE,
    compliance_flags TEXT NOT NULL DEFAULT '{}', -- JSON metadata

    -- Indexes for performance
    FOREIGN KEY (practitioner_id) REFERENCES professionals(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (consent_id) REFERENCES consent_records(id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_medical_notes_practitioner_client
ON medical_notes(practitioner_id, client_id);

CREATE INDEX IF NOT EXISTS idx_medical_notes_created_at
ON medical_notes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_medical_notes_sync_status
ON medical_notes(sync_status);

CREATE INDEX IF NOT EXISTS idx_medical_notes_template
ON medical_notes(template_id);

CREATE INDEX IF NOT EXISTS idx_medical_notes_quebec_org
ON medical_notes(quebec_organization);

-- Quebec Law 25 specific indexes
CREATE INDEX IF NOT EXISTS idx_medical_notes_consent
ON medical_notes(consent_id) WHERE consent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_medical_notes_deidentified
ON medical_notes(is_deidentified, created_at);

-- Update trigger for updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_medical_notes_timestamp
    AFTER UPDATE ON medical_notes
    FOR EACH ROW
BEGIN
    UPDATE medical_notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Quebec Law 25 audit trigger
CREATE TRIGGER IF NOT EXISTS medical_notes_audit_trigger
    AFTER UPDATE ON medical_notes
    FOR EACH ROW
    WHEN OLD.sync_status != NEW.sync_status OR OLD.is_deidentified != NEW.is_deidentified
BEGIN
    INSERT INTO quebec_audit_logs (
        id, event_type, event_data, practitioner_id, client_id,
        resource_type, resource_id, action, timestamp, quebec_law25_compliant,
        phi_accessed, retention_period_days
    ) VALUES (
        lower(hex(randomblob(16))),
        'medical_note_status_change',
        json_object(
            'old_sync_status', OLD.sync_status,
            'new_sync_status', NEW.sync_status,
            'old_deidentified', OLD.is_deidentified,
            'new_deidentified', NEW.is_deidentified
        ),
        NEW.practitioner_id,
        NEW.client_id,
        'medical_note',
        NEW.id,
        'update',
        CURRENT_TIMESTAMP,
        1, -- Quebec Law 25 compliant
        1, -- PHI accessed
        2555 -- 7 years retention in days
    );
END;