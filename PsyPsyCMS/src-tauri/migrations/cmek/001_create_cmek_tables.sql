-- Quebec Law 25 Compliant Customer-Managed Encryption Keys (CMEK) Database Schema
--
-- This migration creates tables for managing customer-controlled encryption keys
-- for all Firebase services in compliance with Quebec Law 25 requirements.
--
-- Created: 2025-01-14
-- Purpose: Support customer-managed encryption for healthcare data protection

-- CMEK Keys - Master key registry for all encryption keys
CREATE TABLE IF NOT EXISTS cmek_keys (
    id TEXT PRIMARY KEY NOT NULL,
    key_id TEXT NOT NULL UNIQUE,
    key_name TEXT NOT NULL, -- Full KMS resource name
    service TEXT NOT NULL CHECK (service IN (
        'firestore', 'storage', 'functions', 'backup', 'vertex_ai',
        'dlp', 'audit', 'logging', 'monitoring', 'bigquery'
    )),

    -- Key properties
    purpose TEXT NOT NULL CHECK (purpose IN (
        'ENCRYPT_DECRYPT', 'ASYMMETRIC_SIGN', 'ASYMMETRIC_DECRYPT', 'MAC'
    )),
    algorithm TEXT NOT NULL CHECK (algorithm IN (
        'GOOGLE_SYMMETRIC_ENCRYPTION', 'AES_128_GCM', 'AES_256_GCM',
        'RSA_SIGN_PKCS1_2048_SHA256', 'RSA_SIGN_PKCS1_4096_SHA512',
        'EC_SIGN_P256_SHA256', 'EC_SIGN_P384_SHA384'
    )),
    protection_level TEXT NOT NULL CHECK (protection_level IN (
        'SOFTWARE', 'HSM', 'EXTERNAL', 'EXTERNAL_VPC'
    )),
    state TEXT NOT NULL CHECK (state IN (
        'PENDING_GENERATION', 'ENABLED', 'DISABLED', 'DESTROYED',
        'PENDING_IMPORT', 'IMPORT_FAILED'
    )),

    -- Version management
    primary_version TEXT,
    total_versions INTEGER DEFAULT 1,
    enabled_versions INTEGER DEFAULT 1,

    -- Rotation configuration
    next_rotation_time DATETIME,
    rotation_period TEXT, -- ISO 8601 duration format
    auto_rotation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_rotation_time DATETIME,
    rotation_count INTEGER DEFAULT 0,

    -- Labels and metadata
    labels_json TEXT, -- JSON object for key labels
    description TEXT,
    key_usage_stats_json TEXT, -- Usage statistics

    -- Quebec Law 25 compliance
    quebec_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    data_residency_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_last_verified DATETIME,
    compliance_verification_method TEXT DEFAULT 'automated',

    -- Healthcare-specific fields
    healthcare_data_approved BOOLEAN NOT NULL DEFAULT TRUE,
    phi_encryption_capable BOOLEAN NOT NULL DEFAULT TRUE,
    medical_grade_encryption BOOLEAN NOT NULL DEFAULT TRUE,

    -- Audit and timestamps
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'system',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,

    -- Performance tracking
    encryption_operations_count INTEGER DEFAULT 0,
    decryption_operations_count INTEGER DEFAULT 0,
    last_used DATETIME,
    average_operation_latency_ms REAL DEFAULT 0.0
);

-- CMEK Key Versions - Track all versions of each key
CREATE TABLE IF NOT EXISTS cmek_key_versions (
    id TEXT PRIMARY KEY NOT NULL,
    version_id TEXT NOT NULL,
    key_id TEXT NOT NULL,

    -- Version properties
    state TEXT NOT NULL CHECK (state IN (
        'PENDING_GENERATION', 'ENABLED', 'DISABLED', 'DESTROYED',
        'PENDING_IMPORT', 'IMPORT_FAILED'
    )),
    algorithm TEXT NOT NULL,
    protection_level TEXT NOT NULL,

    -- Key material
    attestation TEXT, -- Hardware attestation data
    import_job TEXT, -- Import job reference if imported
    import_time DATETIME,
    import_failure_reason TEXT,

    -- External key options
    external_protection_level_options_json TEXT,
    external_key_uri TEXT,

    -- Lifecycle
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    destroy_time DATETIME,
    destroy_scheduled_time DATETIME,
    reimport_eligible BOOLEAN DEFAULT FALSE,

    -- Usage tracking
    primary_version BOOLEAN DEFAULT FALSE,
    operations_count INTEGER DEFAULT 0,
    first_used DATETIME,
    last_used DATETIME,

    -- Compliance
    quebec_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_verified DATETIME,

    -- Foreign key constraints
    FOREIGN KEY (key_id) REFERENCES cmek_keys(key_id) ON DELETE CASCADE
);

-- CMEK Service Configurations - Track which Firebase services use which keys
CREATE TABLE IF NOT EXISTS cmek_service_configs (
    id TEXT PRIMARY KEY NOT NULL,
    service_name TEXT NOT NULL CHECK (service_name IN (
        'firestore', 'storage', 'functions', 'backup', 'vertex_ai',
        'dlp', 'audit', 'logging', 'monitoring', 'bigquery'
    )),

    -- Encryption configuration
    cmek_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    key_name TEXT NOT NULL, -- Full KMS key resource name
    key_id TEXT NOT NULL,
    encryption_config_json TEXT, -- Service-specific encryption settings

    -- Configuration status
    configuration_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (configuration_status IN (
        'PENDING', 'CONFIGURING', 'CONFIGURED', 'FAILED', 'DISABLED'
    )),
    configuration_attempts INTEGER DEFAULT 0,
    last_configuration_attempt DATETIME,
    configuration_error TEXT,

    -- Service-specific settings
    database_id TEXT, -- For Firestore
    bucket_name TEXT, -- For Cloud Storage
    function_region TEXT, -- For Cloud Functions
    backup_schedule TEXT, -- For backup services

    -- Compliance verification
    compliance_verified BOOLEAN NOT NULL DEFAULT FALSE,
    compliance_verification_timestamp DATETIME,
    quebec_law25_compliant BOOLEAN NOT NULL DEFAULT TRUE,

    -- Audit tracking
    last_configured DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    configured_by TEXT NOT NULL DEFAULT 'system',
    configuration_version TEXT DEFAULT '1.0',

    -- Performance metrics
    encryption_performance_ms REAL DEFAULT 0.0,
    decryption_performance_ms REAL DEFAULT 0.0,
    availability_percentage REAL DEFAULT 100.0,

    -- Foreign key constraints
    FOREIGN KEY (key_id) REFERENCES cmek_keys(key_id) ON DELETE RESTRICT
);

-- CMEK Operations - Comprehensive audit log of all key operations
CREATE TABLE IF NOT EXISTS cmek_operations (
    id TEXT PRIMARY KEY NOT NULL,
    operation_id TEXT NOT NULL UNIQUE,
    operation_type TEXT NOT NULL CHECK (operation_type IN (
        'CREATE_KEY', 'CREATE_KEY_VERSION', 'ROTATE_KEY', 'ENABLE_KEY', 'DISABLE_KEY',
        'DESTROY_KEY', 'ENCRYPT', 'DECRYPT', 'SIGN', 'VERIFY', 'MAC_SIGN', 'MAC_VERIFY',
        'CONFIGURE_SERVICE', 'UPDATE_CONFIG', 'IMPORT_KEY', 'EXPORT_KEY',
        'GRANT_ACCESS', 'REVOKE_ACCESS', 'AUDIT_ACCESS', 'HEALTH_CHECK'
    )),

    -- Operation context
    key_id TEXT NOT NULL,
    key_version_id TEXT,
    service TEXT NOT NULL,
    operation_scope TEXT DEFAULT 'single_key', -- single_key, multiple_keys, service_wide

    -- User and session context
    initiated_by TEXT NOT NULL,
    user_id TEXT,
    professional_id TEXT,
    session_id TEXT,
    client_ip TEXT,
    user_agent TEXT,

    -- Operation details
    operation_parameters_json TEXT, -- Parameters passed to operation
    operation_metadata_json TEXT, -- Additional metadata
    data_size_bytes INTEGER, -- Size of data operated on
    batch_operation BOOLEAN DEFAULT FALSE,
    batch_size INTEGER DEFAULT 1,

    -- Timing and performance
    initiated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    duration_ms INTEGER,
    queue_time_ms INTEGER,
    processing_time_ms INTEGER,

    -- Status and results
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'TIMEOUT', 'CANCELLED'
    )),
    result_code TEXT,
    result_message TEXT,
    error_message TEXT,
    error_code TEXT,
    retry_count INTEGER DEFAULT 0,
    retry_reason TEXT,

    -- Compliance and audit
    quebec_compliance_verified BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_check_duration_ms INTEGER,
    audit_logged BOOLEAN NOT NULL DEFAULT TRUE,
    audit_log_id TEXT,
    compliance_violation BOOLEAN DEFAULT FALSE,
    compliance_violation_reason TEXT,

    -- Security context
    authorization_method TEXT, -- oauth2, service_account, emergency
    access_grant_id TEXT,
    emergency_access BOOLEAN DEFAULT FALSE,
    justification TEXT,

    -- Request tracing
    trace_id TEXT,
    span_id TEXT,
    parent_operation_id TEXT,
    correlation_id TEXT
);

-- CMEK Access Requests - Manage access to encryption keys
CREATE TABLE IF NOT EXISTS cmek_access_requests (
    id TEXT PRIMARY KEY NOT NULL,
    request_id TEXT NOT NULL UNIQUE,

    -- Requestor information
    user_id TEXT NOT NULL,
    professional_id TEXT,
    role TEXT,
    department TEXT,

    -- Access details
    key_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN (
        'encrypt', 'decrypt', 'rotate', 'admin', 'read_metadata', 'configure'
    )),
    purpose TEXT NOT NULL,
    scope TEXT DEFAULT 'single_operation', -- single_operation, time_limited, ongoing

    -- Medical context
    patient_id TEXT,
    case_id TEXT,
    medical_record_id TEXT,
    appointment_id TEXT,
    emergency_context TEXT,

    -- Request metadata
    session_id TEXT,
    justification TEXT NOT NULL,
    emergency_access BOOLEAN NOT NULL DEFAULT FALSE,
    supervisor_approval_required BOOLEAN DEFAULT FALSE,
    break_glass_access BOOLEAN DEFAULT FALSE,

    -- Timing
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    required_by DATETIME,
    expires_at DATETIME NOT NULL,
    auto_expire BOOLEAN DEFAULT TRUE,

    -- Approval workflow
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by TEXT,
    approved_at DATETIME,
    approval_method TEXT, -- manual, automatic, emergency, supervisor
    approval_conditions TEXT, -- JSON array of conditions
    approval_notes TEXT,

    -- Rejection tracking
    rejected BOOLEAN DEFAULT FALSE,
    rejected_by TEXT,
    rejected_at DATETIME,
    rejection_reason TEXT,

    -- Compliance tracking
    compliance_check_passed BOOLEAN DEFAULT FALSE,
    compliance_check_details TEXT,
    quebec_law25_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    audit_trail_id TEXT NOT NULL,

    -- Risk assessment
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN (
        'low', 'medium', 'high', 'critical'
    )),
    risk_factors TEXT, -- JSON array of risk factors
    mitigation_measures TEXT, -- JSON array of mitigations

    -- Foreign key constraints
    FOREIGN KEY (key_id) REFERENCES cmek_keys(key_id) ON DELETE CASCADE
);

-- CMEK Access Grants - Track approved access to keys
CREATE TABLE IF NOT EXISTS cmek_access_grants (
    id TEXT PRIMARY KEY NOT NULL,
    grant_id TEXT NOT NULL UNIQUE,
    request_id TEXT NOT NULL,

    -- Grant recipient
    user_id TEXT NOT NULL,
    professional_id TEXT,
    grant_recipient_name TEXT,

    -- Grant scope
    key_id TEXT NOT NULL,
    operations_allowed_json TEXT NOT NULL, -- JSON array of allowed operations
    scope_restrictions_json TEXT, -- JSON object of restrictions

    -- Grant lifecycle
    granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    auto_revoke BOOLEAN DEFAULT TRUE,

    -- Revocation tracking
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at DATETIME,
    revoked_by TEXT,
    revocation_reason TEXT,
    revocation_method TEXT, -- manual, automatic, emergency, expired

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    first_used DATETIME,
    last_used DATETIME,
    usage_limit INTEGER, -- Max number of uses allowed
    usage_within_hours INTEGER, -- Must be used within N hours

    -- Conditions and monitoring
    conditions_json TEXT, -- JSON array of grant conditions
    monitoring_enabled BOOLEAN DEFAULT TRUE,
    alert_on_usage BOOLEAN DEFAULT FALSE,
    supervisor_notification BOOLEAN DEFAULT FALSE,

    -- Compliance tracking
    compliance_verified BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_verification_timestamp DATETIME,
    quebec_law25_compliant BOOLEAN NOT NULL DEFAULT TRUE,

    -- Foreign key constraints
    FOREIGN KEY (request_id) REFERENCES cmek_access_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (key_id) REFERENCES cmek_keys(key_id) ON DELETE CASCADE
);

-- CMEK Key Usage Log - Detailed usage tracking for compliance
CREATE TABLE IF NOT EXISTS cmek_key_usage_log (
    id TEXT PRIMARY KEY NOT NULL,
    usage_id TEXT NOT NULL UNIQUE,

    -- Key and operation details
    key_id TEXT NOT NULL,
    key_version_id TEXT,
    operation_type TEXT NOT NULL,
    operation_id TEXT,

    -- User context
    user_id TEXT NOT NULL,
    professional_id TEXT,
    grant_id TEXT,
    session_id TEXT,

    -- Usage context
    service_name TEXT NOT NULL,
    data_classification TEXT, -- public, internal, confidential, restricted
    patient_id TEXT,
    medical_record_type TEXT,

    -- Technical details
    data_size_bytes INTEGER,
    encryption_algorithm TEXT,
    encryption_mode TEXT,
    key_derivation_method TEXT,

    -- Performance metrics
    operation_start_time DATETIME NOT NULL,
    operation_end_time DATETIME,
    operation_duration_ms INTEGER,
    cpu_time_ms INTEGER,
    memory_usage_mb REAL,

    -- Success/failure tracking
    operation_successful BOOLEAN NOT NULL,
    error_code TEXT,
    error_message TEXT,
    retry_attempt INTEGER DEFAULT 0,

    -- Compliance and audit
    quebec_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_check_timestamp DATETIME,
    audit_logged BOOLEAN NOT NULL DEFAULT TRUE,
    audit_correlation_id TEXT,

    -- Location and network
    client_ip TEXT,
    server_region TEXT DEFAULT 'northamerica-northeast1',
    data_residency_confirmed BOOLEAN NOT NULL DEFAULT TRUE,

    -- Foreign key constraints
    FOREIGN KEY (key_id) REFERENCES cmek_keys(key_id) ON DELETE CASCADE,
    FOREIGN KEY (grant_id) REFERENCES cmek_access_grants(grant_id) ON DELETE SET NULL
);

-- CMEK Compliance Reports - Regular compliance assessments
CREATE TABLE IF NOT EXISTS cmek_compliance_reports (
    id TEXT PRIMARY KEY NOT NULL,
    report_id TEXT NOT NULL UNIQUE,
    report_type TEXT NOT NULL CHECK (report_type IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'audit', 'incident'
    )),

    -- Report period
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    timezone TEXT DEFAULT 'America/Montreal',

    -- Key management metrics
    total_keys INTEGER NOT NULL DEFAULT 0,
    active_keys INTEGER NOT NULL DEFAULT 0,
    rotated_keys INTEGER NOT NULL DEFAULT 0,
    overdue_rotation_keys INTEGER NOT NULL DEFAULT 0,
    disabled_keys INTEGER NOT NULL DEFAULT 0,

    -- Access management metrics
    total_access_requests INTEGER NOT NULL DEFAULT 0,
    approved_requests INTEGER NOT NULL DEFAULT 0,
    rejected_requests INTEGER NOT NULL DEFAULT 0,
    emergency_access_requests INTEGER NOT NULL DEFAULT 0,
    access_violations INTEGER NOT NULL DEFAULT 0,

    -- Usage metrics
    total_operations INTEGER NOT NULL DEFAULT 0,
    encryption_operations INTEGER NOT NULL DEFAULT 0,
    decryption_operations INTEGER NOT NULL DEFAULT 0,
    failed_operations INTEGER NOT NULL DEFAULT 0,
    average_operation_time_ms REAL DEFAULT 0.0,

    -- Compliance metrics
    quebec_compliance_rate REAL NOT NULL DEFAULT 100.0,
    data_residency_violations INTEGER NOT NULL DEFAULT 0,
    audit_compliance_rate REAL NOT NULL DEFAULT 100.0,
    access_control_violations INTEGER NOT NULL DEFAULT 0,

    -- Service-specific metrics
    firestore_encryption_rate REAL DEFAULT 100.0,
    storage_encryption_rate REAL DEFAULT 100.0,
    functions_encryption_rate REAL DEFAULT 100.0,
    backup_encryption_rate REAL DEFAULT 100.0,

    -- Performance and availability
    average_key_availability REAL DEFAULT 100.0,
    kms_service_uptime REAL DEFAULT 100.0,
    encryption_latency_p95_ms REAL DEFAULT 0.0,
    decryption_latency_p95_ms REAL DEFAULT 0.0,

    -- Issues and recommendations
    critical_issues INTEGER NOT NULL DEFAULT 0,
    medium_issues INTEGER NOT NULL DEFAULT 0,
    low_issues INTEGER NOT NULL DEFAULT 0,
    recommendations_json TEXT, -- JSON array of recommendations

    -- Report metadata
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by TEXT NOT NULL DEFAULT 'system',
    report_format TEXT DEFAULT 'json',
    report_data_json TEXT, -- Full report data
    report_status TEXT DEFAULT 'completed' CHECK (report_status IN (
        'pending', 'generating', 'completed', 'failed'
    )),

    -- Distribution and approval
    distributed_to TEXT, -- JSON array of recipients
    approved_by TEXT,
    approved_at DATETIME,
    approval_required BOOLEAN DEFAULT FALSE
);

-- CMEK Configuration History - Track all configuration changes
CREATE TABLE IF NOT EXISTS cmek_configuration_history (
    id TEXT PRIMARY KEY NOT NULL,
    configuration_id TEXT NOT NULL,
    configuration_version TEXT NOT NULL,

    -- Configuration scope
    scope TEXT NOT NULL CHECK (scope IN (
        'global', 'service', 'key', 'access_policy'
    )),
    target_service TEXT,
    target_key_id TEXT,

    -- Configuration details
    configuration_type TEXT NOT NULL CHECK (configuration_type IN (
        'key_creation', 'key_rotation', 'service_config', 'access_policy',
        'compliance_setting', 'performance_tuning', 'security_hardening'
    )),
    configuration_data_json TEXT NOT NULL,
    previous_configuration_json TEXT,

    -- Change management
    change_reason TEXT NOT NULL,
    change_description TEXT,
    change_impact_assessment TEXT,
    rollback_plan TEXT,
    testing_completed BOOLEAN DEFAULT FALSE,

    -- Approval workflow
    requested_by TEXT NOT NULL,
    approved_by TEXT,
    approval_required BOOLEAN DEFAULT TRUE,
    approved_at DATETIME,
    approval_notes TEXT,

    -- Implementation
    implemented_by TEXT,
    implemented_at DATETIME,
    implementation_status TEXT DEFAULT 'pending' CHECK (implementation_status IN (
        'pending', 'implementing', 'completed', 'failed', 'rolled_back'
    )),
    implementation_notes TEXT,

    -- Compliance verification
    compliance_verified BOOLEAN DEFAULT FALSE,
    compliance_verification_by TEXT,
    compliance_verification_at DATETIME,
    quebec_law25_impact_assessed BOOLEAN DEFAULT TRUE,

    -- Effective period
    effective_from DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_until DATETIME,
    superseded_by TEXT,

    -- Audit trail
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal query performance

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_cmek_keys_key_id ON cmek_keys(key_id);
CREATE INDEX IF NOT EXISTS idx_cmek_keys_service ON cmek_keys(service);
CREATE INDEX IF NOT EXISTS idx_cmek_keys_state ON cmek_keys(state);
CREATE INDEX IF NOT EXISTS idx_cmek_keys_rotation ON cmek_keys(next_rotation_time);

CREATE INDEX IF NOT EXISTS idx_cmek_key_versions_key_id ON cmek_key_versions(key_id);
CREATE INDEX IF NOT EXISTS idx_cmek_key_versions_state ON cmek_key_versions(state);
CREATE INDEX IF NOT EXISTS idx_cmek_key_versions_primary ON cmek_key_versions(primary_version);

CREATE INDEX IF NOT EXISTS idx_cmek_service_configs_service ON cmek_service_configs(service_name);
CREATE INDEX IF NOT EXISTS idx_cmek_service_configs_key ON cmek_service_configs(key_id);
CREATE INDEX IF NOT EXISTS idx_cmek_service_configs_status ON cmek_service_configs(configuration_status);

-- Operations and performance indexes
CREATE INDEX IF NOT EXISTS idx_cmek_operations_operation_id ON cmek_operations(operation_id);
CREATE INDEX IF NOT EXISTS idx_cmek_operations_key_id ON cmek_operations(key_id);
CREATE INDEX IF NOT EXISTS idx_cmek_operations_type ON cmek_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_cmek_operations_timestamp ON cmek_operations(initiated_at);
CREATE INDEX IF NOT EXISTS idx_cmek_operations_user ON cmek_operations(initiated_by);
CREATE INDEX IF NOT EXISTS idx_cmek_operations_status ON cmek_operations(status);

-- Access control indexes
CREATE INDEX IF NOT EXISTS idx_cmek_access_requests_user ON cmek_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cmek_access_requests_key ON cmek_access_requests(key_id);
CREATE INDEX IF NOT EXISTS idx_cmek_access_requests_timestamp ON cmek_access_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_cmek_access_requests_approval ON cmek_access_requests(approved);
CREATE INDEX IF NOT EXISTS idx_cmek_access_requests_emergency ON cmek_access_requests(emergency_access);

CREATE INDEX IF NOT EXISTS idx_cmek_access_grants_user ON cmek_access_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_cmek_access_grants_key ON cmek_access_grants(key_id);
CREATE INDEX IF NOT EXISTS idx_cmek_access_grants_expiry ON cmek_access_grants(expires_at);
CREATE INDEX IF NOT EXISTS idx_cmek_access_grants_revoked ON cmek_access_grants(revoked);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_cmek_usage_log_key_id ON cmek_key_usage_log(key_id);
CREATE INDEX IF NOT EXISTS idx_cmek_usage_log_user ON cmek_key_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_cmek_usage_log_timestamp ON cmek_key_usage_log(operation_start_time);
CREATE INDEX IF NOT EXISTS idx_cmek_usage_log_service ON cmek_key_usage_log(service_name);
CREATE INDEX IF NOT EXISTS idx_cmek_usage_log_patient ON cmek_key_usage_log(patient_id);

-- Compliance and audit indexes
CREATE INDEX IF NOT EXISTS idx_cmek_keys_compliance ON cmek_keys(quebec_compliant, data_residency_confirmed);
CREATE INDEX IF NOT EXISTS idx_cmek_operations_compliance ON cmek_operations(quebec_compliance_verified);
CREATE INDEX IF NOT EXISTS idx_cmek_usage_compliance ON cmek_key_usage_log(quebec_compliant);
CREATE INDEX IF NOT EXISTS idx_cmek_reports_period ON cmek_compliance_reports(period_start, period_end);

-- Compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cmek_keys_service_state ON cmek_keys(service, state);
CREATE INDEX IF NOT EXISTS idx_cmek_operations_key_timestamp ON cmek_operations(key_id, initiated_at);
CREATE INDEX IF NOT EXISTS idx_cmek_access_user_timestamp ON cmek_access_requests(user_id, requested_at);
CREATE INDEX IF NOT EXISTS idx_cmek_usage_key_timestamp ON cmek_key_usage_log(key_id, operation_start_time);

-- Quebec-specific indexes
CREATE INDEX IF NOT EXISTS idx_cmek_keys_quebec_compliance ON cmek_keys(quebec_compliant, compliance_last_verified);
CREATE INDEX IF NOT EXISTS idx_cmek_operations_quebec_compliance ON cmek_operations(quebec_compliance_verified, compliance_violation);

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_cmek_keys_timestamp
    AFTER UPDATE ON cmek_keys
    FOR EACH ROW
    BEGIN
        UPDATE cmek_keys
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_cmek_service_configs_timestamp
    AFTER UPDATE ON cmek_service_configs
    FOR EACH ROW
    BEGIN
        UPDATE cmek_service_configs
        SET last_configured = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_cmek_configuration_history_timestamp
    AFTER UPDATE ON cmek_configuration_history
    FOR EACH ROW
    BEGIN
        UPDATE cmek_configuration_history
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

-- Views for common reporting queries

-- CMEK Service Overview
CREATE VIEW IF NOT EXISTS cmek_service_overview AS
SELECT
    s.service_name,
    s.cmek_enabled,
    s.configuration_status,
    k.state as key_state,
    k.protection_level,
    k.last_rotation_time,
    k.next_rotation_time,
    s.compliance_verified,
    s.quebec_law25_compliant,
    s.last_configured
FROM cmek_service_configs s
LEFT JOIN cmek_keys k ON s.key_id = k.key_id
ORDER BY s.service_name;

-- Key Rotation Status
CREATE VIEW IF NOT EXISTS cmek_key_rotation_status AS
SELECT
    k.key_id,
    k.service,
    k.state,
    k.last_rotation_time,
    k.next_rotation_time,
    k.rotation_count,
    k.auto_rotation_enabled,
    CASE
        WHEN k.next_rotation_time IS NULL THEN 'NO_SCHEDULE'
        WHEN k.next_rotation_time < datetime('now') THEN 'OVERDUE'
        WHEN k.next_rotation_time < datetime('now', '+7 days') THEN 'DUE_SOON'
        ELSE 'CURRENT'
    END as rotation_status,
    CAST((julianday(k.next_rotation_time) - julianday('now')) AS INTEGER) as days_until_rotation
FROM cmek_keys k
WHERE k.state = 'ENABLED'
ORDER BY k.next_rotation_time ASC;

-- Access Request Summary
CREATE VIEW IF NOT EXISTS cmek_access_request_summary AS
SELECT
    DATE(r.requested_at) as request_date,
    r.operation,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN r.approved = 1 THEN 1 END) as approved_requests,
    COUNT(CASE WHEN r.emergency_access = 1 THEN 1 END) as emergency_requests,
    COUNT(CASE WHEN r.rejected = 1 THEN 1 END) as rejected_requests,
    AVG(CASE WHEN r.approved_at IS NOT NULL THEN
        (julianday(r.approved_at) - julianday(r.requested_at)) * 24 * 60
    END) as avg_approval_time_minutes
FROM cmek_access_requests r
GROUP BY DATE(r.requested_at), r.operation
ORDER BY request_date DESC, r.operation;

-- Key Usage Statistics
CREATE VIEW IF NOT EXISTS cmek_key_usage_statistics AS
SELECT
    u.key_id,
    k.service,
    COUNT(*) as total_operations,
    COUNT(CASE WHEN u.operation_successful = 1 THEN 1 END) as successful_operations,
    COUNT(CASE WHEN u.operation_type = 'encrypt' THEN 1 END) as encryption_operations,
    COUNT(CASE WHEN u.operation_type = 'decrypt' THEN 1 END) as decryption_operations,
    AVG(u.operation_duration_ms) as avg_operation_duration_ms,
    SUM(u.data_size_bytes) as total_data_processed_bytes,
    COUNT(DISTINCT u.user_id) as unique_users,
    COUNT(DISTINCT u.patient_id) as unique_patients,
    MIN(u.operation_start_time) as first_use,
    MAX(u.operation_start_time) as last_use
FROM cmek_key_usage_log u
LEFT JOIN cmek_keys k ON u.key_id = k.key_id
GROUP BY u.key_id, k.service
ORDER BY total_operations DESC;

-- Quebec Compliance Dashboard
CREATE VIEW IF NOT EXISTS cmek_quebec_compliance_dashboard AS
SELECT
    'Keys' as compliance_area,
    COUNT(*) as total_items,
    COUNT(CASE WHEN quebec_compliant = 1 THEN 1 END) as compliant_items,
    COUNT(CASE WHEN data_residency_confirmed = 1 THEN 1 END) as residency_confirmed_items,
    ROUND(
        (COUNT(CASE WHEN quebec_compliant = 1 AND data_residency_confirmed = 1 THEN 1 END) * 100.0) / COUNT(*),
        2
    ) as compliance_percentage
FROM cmek_keys
WHERE state = 'ENABLED'

UNION ALL

SELECT
    'Operations (Today)' as compliance_area,
    COUNT(*) as total_items,
    COUNT(CASE WHEN quebec_compliance_verified = 1 THEN 1 END) as compliant_items,
    COUNT(CASE WHEN compliance_violation = 0 OR compliance_violation IS NULL THEN 1 END) as residency_confirmed_items,
    ROUND(
        (COUNT(CASE WHEN quebec_compliance_verified = 1 THEN 1 END) * 100.0) / COUNT(*),
        2
    ) as compliance_percentage
FROM cmek_operations
WHERE DATE(initiated_at) = DATE('now')

UNION ALL

SELECT
    'Usage Log (Today)' as compliance_area,
    COUNT(*) as total_items,
    COUNT(CASE WHEN quebec_compliant = 1 THEN 1 END) as compliant_items,
    COUNT(CASE WHEN data_residency_confirmed = 1 THEN 1 END) as residency_confirmed_items,
    ROUND(
        (COUNT(CASE WHEN quebec_compliant = 1 AND data_residency_confirmed = 1 THEN 1 END) * 100.0) / COUNT(*),
        2
    ) as compliance_percentage
FROM cmek_key_usage_log
WHERE DATE(operation_start_time) = DATE('now');

-- Insert initial configuration
INSERT OR IGNORE INTO cmek_configuration_history (
    id, configuration_id, configuration_version, scope, configuration_type,
    configuration_data_json, change_reason, change_description,
    requested_by, approved_by, approved_at, implemented_by, implemented_at,
    implementation_status, compliance_verified, quebec_law25_impact_assessed
) VALUES (
    'config-cmek-001',
    'cmek-initial-setup',
    'v1.0.0',
    'global',
    'key_creation',
    '{"project_id": "psypsy-cms-quebec", "location": "northamerica-northeast1", "key_ring_id": "firebase-cmek-keyring", "enable_automatic_rotation": true, "rotation_period_days": 90, "quebec_compliance_required": true}',
    'initial_setup',
    'Initial CMEK configuration for Quebec Law 25 compliance',
    'system',
    'system',
    CURRENT_TIMESTAMP,
    'system',
    CURRENT_TIMESTAMP,
    'completed',
    1,
    1
);