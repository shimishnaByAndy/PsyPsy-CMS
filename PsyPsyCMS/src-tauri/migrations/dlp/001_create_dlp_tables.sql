-- Quebec Law 25 Compliant Data Loss Prevention (DLP) Database Schema
--
-- This migration creates tables for tracking DLP scan requests, results, and compliance
-- in accordance with Quebec Law 25 requirements for healthcare data protection.
--
-- Created: 2025-01-14
-- Purpose: Support automatic PHI detection and protection workflows

-- DLP Scan Requests - Log all content scanning requests for audit compliance
CREATE TABLE IF NOT EXISTS dlp_scan_requests (
    id TEXT PRIMARY KEY NOT NULL,
    request_id TEXT NOT NULL,
    scan_id TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN (
        'text', 'medical_note', 'patient_record', 'lab_result',
        'prescription', 'appointment_note', 'assessment', 'diagnosis',
        'correspondence', 'form', 'report', 'document'
    )),
    content_length INTEGER NOT NULL,
    content_hash TEXT, -- SHA-256 hash for content integrity verification

    -- Patient and professional context
    patient_id TEXT,
    professional_id TEXT,
    session_id TEXT,
    appointment_id TEXT,
    note_id TEXT,

    -- Metadata and tags
    tags TEXT, -- JSON string of key-value pairs
    source_system TEXT, -- Origin system (web_app, mobile_app, api, import)
    user_agent TEXT,
    ip_address TEXT,

    -- Processing configuration
    enable_deidentification BOOLEAN NOT NULL DEFAULT FALSE,
    quebec_compliance_required BOOLEAN NOT NULL DEFAULT TRUE,
    audit_level TEXT NOT NULL DEFAULT 'standard' CHECK (audit_level IN (
        'minimal', 'standard', 'comprehensive', 'forensic'
    )),

    -- Quebec Law 25 compliance tracking
    quebec_law25_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    data_residency_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    consent_verified BOOLEAN NOT NULL DEFAULT TRUE,
    purpose_documented BOOLEAN NOT NULL DEFAULT TRUE,
    retention_period_days INTEGER DEFAULT 2557, -- 7 years for medical records

    -- Timestamps and audit
    request_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Indexing
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL
);

-- DLP Scan Results - Store findings and classification results
CREATE TABLE IF NOT EXISTS dlp_scan_results (
    id TEXT PRIMARY KEY NOT NULL,
    request_id TEXT NOT NULL,
    scan_id TEXT NOT NULL,

    -- Finding counts and classification
    finding_count INTEGER NOT NULL DEFAULT 0,
    high_risk_count INTEGER NOT NULL DEFAULT 0,
    medium_risk_count INTEGER NOT NULL DEFAULT 0,
    low_risk_count INTEGER NOT NULL DEFAULT 0,

    -- Quebec-specific finding counts
    quebec_ramq_count INTEGER NOT NULL DEFAULT 0,
    quebec_health_card_count INTEGER NOT NULL DEFAULT 0,
    canada_sin_count INTEGER NOT NULL DEFAULT 0,

    -- Medical finding counts
    medical_record_count INTEGER NOT NULL DEFAULT 0,
    diagnosis_count INTEGER NOT NULL DEFAULT 0,
    prescription_count INTEGER NOT NULL DEFAULT 0,
    person_name_count INTEGER NOT NULL DEFAULT 0,

    -- Risk classification
    classification TEXT NOT NULL DEFAULT 'safe' CHECK (classification IN (
        'safe', 'low_risk', 'medium_risk', 'high_risk', 'critical_risk'
    )),
    risk_score REAL DEFAULT 0.0, -- 0.0 to 10.0 scale

    -- Quebec compliance status
    quebec_compliance_status BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_issues TEXT, -- JSON array of compliance concerns

    -- Processing metrics
    processing_time_ms INTEGER NOT NULL,
    scan_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dlp_api_version TEXT DEFAULT 'mock-v1',

    -- Results data
    findings_json TEXT, -- Detailed findings as JSON
    recommendations_json TEXT, -- Recommendations as JSON array
    deidentified_content_hash TEXT, -- Hash of deidentified content if generated

    -- Error handling
    error_message TEXT,
    error_code TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (request_id) REFERENCES dlp_scan_requests(request_id) ON DELETE CASCADE
);

-- DLP Findings Details - Detailed breakdown of individual findings
CREATE TABLE IF NOT EXISTS dlp_findings (
    id TEXT PRIMARY KEY NOT NULL,
    scan_id TEXT NOT NULL,
    finding_id TEXT NOT NULL, -- Unique identifier for this finding

    -- Finding classification
    info_type TEXT NOT NULL, -- QUEBEC_RAMQ_NUMBER, MEDICAL_DIAGNOSIS, etc.
    info_category TEXT NOT NULL CHECK (info_category IN (
        'quebec_identifier', 'medical_info', 'personal_info',
        'contact_info', 'financial_info', 'other'
    )),

    -- Confidence and location
    likelihood TEXT NOT NULL CHECK (likelihood IN (
        'VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'
    )),
    confidence_score REAL DEFAULT 0.0, -- 0.0 to 1.0

    -- Content location
    byte_start INTEGER,
    byte_end INTEGER,
    codepoint_start INTEGER,
    codepoint_end INTEGER,
    line_number INTEGER,
    column_number INTEGER,

    -- Content samples (redacted)
    quote TEXT, -- Redacted version of found content
    context_before TEXT, -- Surrounding context (redacted)
    context_after TEXT,

    -- Transformation applied
    transformation_type TEXT CHECK (transformation_type IN (
        'REDACT', 'MASK', 'REPLACE', 'HASH', 'DATE_SHIFT', 'NONE'
    )),
    masked_value TEXT,
    replacement_value TEXT,

    -- Quebec-specific fields
    quebec_specific BOOLEAN NOT NULL DEFAULT FALSE,
    quebec_regulation_reference TEXT, -- Reference to specific Quebec law/regulation

    -- Medical context
    medical_context TEXT, -- Additional medical context if applicable
    medical_specialty TEXT, -- Medical specialty associated with finding

    -- Timestamps
    detected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (scan_id) REFERENCES dlp_scan_results(scan_id) ON DELETE CASCADE
);

-- DLP Deidentification Logs - Track all deidentification operations
CREATE TABLE IF NOT EXISTS dlp_deidentification_logs (
    id TEXT PRIMARY KEY NOT NULL,
    scan_id TEXT NOT NULL,
    request_id TEXT NOT NULL,

    -- Original content metadata
    original_content_hash TEXT NOT NULL,
    original_length INTEGER NOT NULL,

    -- Deidentified content metadata
    deidentified_content_hash TEXT NOT NULL,
    deidentified_length INTEGER NOT NULL,

    -- Transformation summary
    transformations_applied INTEGER NOT NULL DEFAULT 0,
    masking_operations INTEGER NOT NULL DEFAULT 0,
    redaction_operations INTEGER NOT NULL DEFAULT 0,
    replacement_operations INTEGER NOT NULL DEFAULT 0,

    -- Configuration used
    masking_character TEXT DEFAULT '*',
    preserve_length BOOLEAN DEFAULT TRUE,
    preserve_quebec_formats BOOLEAN DEFAULT TRUE,

    -- Quality metrics
    information_loss_percentage REAL DEFAULT 0.0,
    utility_preservation_score REAL DEFAULT 1.0,

    -- Quebec compliance verification
    quebec_compliance_verified BOOLEAN NOT NULL DEFAULT TRUE,
    compliance_verification_timestamp DATETIME,
    verification_method TEXT DEFAULT 'automated',

    -- Processing metrics
    processing_time_ms INTEGER NOT NULL,
    deidentify_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Reversibility (for authorized re-identification)
    reversible BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_key_id TEXT, -- Reference to encryption key for reversal
    reversal_authorized_roles TEXT, -- JSON array of authorized roles

    -- Error handling
    error_message TEXT,
    warnings TEXT, -- JSON array of warnings

    -- Audit
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (scan_id) REFERENCES dlp_scan_results(scan_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES dlp_scan_requests(request_id) ON DELETE CASCADE
);

-- DLP Compliance Reports - Generate compliance summaries
CREATE TABLE IF NOT EXISTS dlp_compliance_reports (
    id TEXT PRIMARY KEY NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'on_demand'
    )),

    -- Report period
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,

    -- Scan statistics
    total_scans INTEGER NOT NULL DEFAULT 0,
    total_findings INTEGER NOT NULL DEFAULT 0,
    high_risk_scans INTEGER NOT NULL DEFAULT 0,
    quebec_phi_detections INTEGER NOT NULL DEFAULT 0,
    medical_phi_detections INTEGER NOT NULL DEFAULT 0,

    -- Compliance metrics
    compliance_rate REAL NOT NULL DEFAULT 100.0,
    non_compliant_scans INTEGER NOT NULL DEFAULT 0,
    data_residency_violations INTEGER NOT NULL DEFAULT 0,
    consent_violations INTEGER NOT NULL DEFAULT 0,

    -- Performance metrics
    average_processing_time_ms REAL DEFAULT 0.0,
    error_rate REAL DEFAULT 0.0,
    total_errors INTEGER DEFAULT 0,

    -- Deidentification statistics
    deidentification_requests INTEGER NOT NULL DEFAULT 0,
    successful_deidentifications INTEGER NOT NULL DEFAULT 0,
    failed_deidentifications INTEGER NOT NULL DEFAULT 0,
    average_information_loss REAL DEFAULT 0.0,

    -- Quebec Law 25 specific metrics
    ramq_detections INTEGER NOT NULL DEFAULT 0,
    quebec_health_card_detections INTEGER NOT NULL DEFAULT 0,
    law25_compliance_score REAL DEFAULT 100.0,

    -- Report metadata
    generated_by TEXT, -- User or system that generated report
    report_format TEXT DEFAULT 'json', -- json, csv, pdf
    report_data TEXT, -- Detailed report data as JSON

    -- Timestamps
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- DLP Configuration History - Track configuration changes
CREATE TABLE IF NOT EXISTS dlp_configuration_history (
    id TEXT PRIMARY KEY NOT NULL,
    configuration_version TEXT NOT NULL,

    -- Configuration details
    project_id TEXT NOT NULL,
    location TEXT NOT NULL,
    inspect_template_name TEXT,
    deidentify_template_name TEXT,
    job_trigger_name TEXT,

    -- Info types configuration
    quebec_info_types TEXT, -- JSON array
    medical_info_types TEXT, -- JSON array
    sensitivity_threshold TEXT,
    masking_character TEXT,

    -- Feature flags
    enable_quebec_compliance BOOLEAN NOT NULL DEFAULT TRUE,
    audit_all_scans BOOLEAN NOT NULL DEFAULT TRUE,
    enable_auto_deidentification BOOLEAN DEFAULT FALSE,

    -- Performance settings
    max_findings_per_request INTEGER DEFAULT 1000,
    timeout_seconds INTEGER DEFAULT 30,
    batch_size INTEGER DEFAULT 10,

    -- Change tracking
    changed_by TEXT NOT NULL,
    change_reason TEXT,
    change_description TEXT,
    previous_version TEXT,

    -- Timestamps
    effective_from DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_until DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- DLP Performance Metrics - Track service performance over time
CREATE TABLE IF NOT EXISTS dlp_performance_metrics (
    id TEXT PRIMARY KEY NOT NULL,
    metric_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Performance counters
    scans_per_minute REAL DEFAULT 0.0,
    average_response_time_ms REAL DEFAULT 0.0,
    p95_response_time_ms REAL DEFAULT 0.0,
    p99_response_time_ms REAL DEFAULT 0.0,

    -- Error rates
    error_rate_percent REAL DEFAULT 0.0,
    timeout_rate_percent REAL DEFAULT 0.0,
    authentication_error_rate REAL DEFAULT 0.0,

    -- Resource utilization
    cpu_usage_percent REAL DEFAULT 0.0,
    memory_usage_mb REAL DEFAULT 0.0,
    network_throughput_mbps REAL DEFAULT 0.0,

    -- API quotas and limits
    api_calls_remaining INTEGER,
    quota_reset_timestamp DATETIME,
    rate_limit_hits INTEGER DEFAULT 0,

    -- Quebec compliance performance
    compliance_validation_time_ms REAL DEFAULT 0.0,
    quebec_specific_detection_accuracy REAL DEFAULT 1.0,

    -- Collection metadata
    collection_method TEXT DEFAULT 'automated',
    data_source TEXT DEFAULT 'dlp_service',

    -- Aggregation period
    aggregation_window TEXT DEFAULT '1_minute' CHECK (aggregation_window IN (
        '1_minute', '5_minutes', '15_minutes', '1_hour', '1_day'
    ))
);

-- Indexes for optimal query performance

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_dlp_scan_requests_request_id ON dlp_scan_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_dlp_scan_requests_scan_id ON dlp_scan_requests(scan_id);
CREATE INDEX IF NOT EXISTS idx_dlp_scan_requests_timestamp ON dlp_scan_requests(request_timestamp);
CREATE INDEX IF NOT EXISTS idx_dlp_scan_requests_patient ON dlp_scan_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_dlp_scan_requests_professional ON dlp_scan_requests(professional_id);

CREATE INDEX IF NOT EXISTS idx_dlp_scan_results_scan_id ON dlp_scan_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_dlp_scan_results_classification ON dlp_scan_results(classification);
CREATE INDEX IF NOT EXISTS idx_dlp_scan_results_timestamp ON dlp_scan_results(scan_timestamp);
CREATE INDEX IF NOT EXISTS idx_dlp_scan_results_risk_score ON dlp_scan_results(risk_score);

CREATE INDEX IF NOT EXISTS idx_dlp_findings_scan_id ON dlp_findings(scan_id);
CREATE INDEX IF NOT EXISTS idx_dlp_findings_info_type ON dlp_findings(info_type);
CREATE INDEX IF NOT EXISTS idx_dlp_findings_likelihood ON dlp_findings(likelihood);
CREATE INDEX IF NOT EXISTS idx_dlp_findings_quebec ON dlp_findings(quebec_specific);

-- Compliance and audit indexes
CREATE INDEX IF NOT EXISTS idx_dlp_requests_compliance ON dlp_scan_requests(quebec_law25_compliant, data_residency_confirmed);
CREATE INDEX IF NOT EXISTS idx_dlp_results_compliance ON dlp_scan_results(quebec_compliance_status);
CREATE INDEX IF NOT EXISTS idx_dlp_deidentification_compliance ON dlp_deidentification_logs(quebec_compliance_verified);

-- Performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_dlp_results_processing_time ON dlp_scan_results(processing_time_ms);
CREATE INDEX IF NOT EXISTS idx_dlp_findings_detection_time ON dlp_findings(detected_at);
CREATE INDEX IF NOT EXISTS idx_dlp_metrics_timestamp ON dlp_performance_metrics(metric_timestamp);

-- Compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_dlp_requests_patient_timestamp ON dlp_scan_requests(patient_id, request_timestamp);
CREATE INDEX IF NOT EXISTS idx_dlp_results_classification_timestamp ON dlp_scan_results(classification, scan_timestamp);
CREATE INDEX IF NOT EXISTS idx_dlp_findings_type_likelihood ON dlp_findings(info_type, likelihood);

-- Quebec-specific reporting indexes
CREATE INDEX IF NOT EXISTS idx_dlp_findings_quebec_category ON dlp_findings(quebec_specific, info_category);
CREATE INDEX IF NOT EXISTS idx_dlp_results_quebec_counts ON dlp_scan_results(quebec_ramq_count, quebec_health_card_count);

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_dlp_scan_requests_timestamp
    AFTER UPDATE ON dlp_scan_requests
    FOR EACH ROW
    BEGIN
        UPDATE dlp_scan_requests
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_dlp_scan_results_timestamp
    AFTER UPDATE ON dlp_scan_results
    FOR EACH ROW
    BEGIN
        UPDATE dlp_scan_results
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

-- Views for common reporting queries

-- Quebec compliance summary view
CREATE VIEW IF NOT EXISTS dlp_quebec_compliance_summary AS
SELECT
    DATE(request_timestamp) as report_date,
    COUNT(*) as total_scans,
    SUM(CASE WHEN quebec_law25_compliant = 1 THEN 1 ELSE 0 END) as compliant_scans,
    SUM(CASE WHEN data_residency_confirmed = 1 THEN 1 ELSE 0 END) as residency_confirmed_scans,
    AVG(CASE WHEN quebec_law25_compliant = 1 THEN 100.0 ELSE 0.0 END) as compliance_rate,
    COUNT(DISTINCT patient_id) as unique_patients_scanned,
    COUNT(DISTINCT professional_id) as unique_professionals_scanning
FROM dlp_scan_requests
GROUP BY DATE(request_timestamp)
ORDER BY report_date DESC;

-- High-risk findings summary view
CREATE VIEW IF NOT EXISTS dlp_high_risk_summary AS
SELECT
    DATE(r.scan_timestamp) as report_date,
    r.classification,
    COUNT(*) as scan_count,
    AVG(r.risk_score) as average_risk_score,
    SUM(r.quebec_ramq_count) as total_ramq_detections,
    SUM(r.medical_record_count) as total_medical_record_detections,
    AVG(r.processing_time_ms) as average_processing_time
FROM dlp_scan_results r
WHERE r.classification IN ('high_risk', 'critical_risk')
GROUP BY DATE(r.scan_timestamp), r.classification
ORDER BY report_date DESC, average_risk_score DESC;

-- Medical PHI detection trends view
CREATE VIEW IF NOT EXISTS dlp_medical_phi_trends AS
SELECT
    DATE(f.detected_at) as detection_date,
    f.info_type,
    f.info_category,
    COUNT(*) as detection_count,
    AVG(f.confidence_score) as average_confidence,
    COUNT(CASE WHEN f.likelihood = 'VERY_LIKELY' THEN 1 END) as high_confidence_detections
FROM dlp_findings f
WHERE f.info_category = 'medical_info'
GROUP BY DATE(f.detected_at), f.info_type, f.info_category
ORDER BY detection_date DESC, detection_count DESC;

-- Quebec-specific PHI detection view
CREATE VIEW IF NOT EXISTS dlp_quebec_phi_detections AS
SELECT
    DATE(f.detected_at) as detection_date,
    f.info_type,
    COUNT(*) as detection_count,
    COUNT(CASE WHEN f.likelihood IN ('LIKELY', 'VERY_LIKELY') THEN 1 END) as reliable_detections,
    AVG(f.confidence_score) as average_confidence
FROM dlp_findings f
WHERE f.quebec_specific = 1
GROUP BY DATE(f.detected_at), f.info_type
ORDER BY detection_date DESC, detection_count DESC;

-- Performance monitoring view
CREATE VIEW IF NOT EXISTS dlp_performance_overview AS
SELECT
    DATE(metric_timestamp) as metric_date,
    AVG(scans_per_minute) as avg_scans_per_minute,
    AVG(average_response_time_ms) as avg_response_time_ms,
    MAX(p99_response_time_ms) as max_p99_response_time_ms,
    AVG(error_rate_percent) as avg_error_rate_percent,
    AVG(compliance_validation_time_ms) as avg_compliance_validation_time_ms,
    AVG(quebec_specific_detection_accuracy) as avg_quebec_detection_accuracy
FROM dlp_performance_metrics
GROUP BY DATE(metric_timestamp)
ORDER BY metric_date DESC;

-- Insert initial configuration
INSERT OR IGNORE INTO dlp_configuration_history (
    id, configuration_version, project_id, location,
    inspect_template_name, deidentify_template_name, job_trigger_name,
    quebec_info_types, medical_info_types, sensitivity_threshold,
    masking_character, enable_quebec_compliance, audit_all_scans,
    changed_by, change_reason, change_description
) VALUES (
    'config-001',
    'v1.0.0',
    'psypsy-cms-quebec',
    'northamerica-northeast1',
    'projects/psypsy-cms-quebec/locations/northamerica-northeast1/inspectTemplates/quebec-phi-inspector',
    'projects/psypsy-cms-quebec/locations/northamerica-northeast1/deidentifyTemplates/quebec-phi-deidentifier',
    'projects/psypsy-cms-quebec/locations/northamerica-northeast1/jobTriggers/quebec-phi-trigger',
    '["QUEBEC_RAMQ_NUMBER", "QUEBEC_HEALTH_CARD", "QUEBEC_MEDICARE_NUMBER", "CANADA_SOCIAL_INSURANCE_NUMBER"]',
    '["MEDICAL_RECORD_NUMBER", "PRESCRIPTION_NUMBER", "ICD_10_CA_CODE", "DSM_5_TR_CODE", "MEDICAL_DIAGNOSIS"]',
    'POSSIBLE',
    '*',
    1,
    1,
    'system',
    'initial_setup',
    'Initial DLP configuration for Quebec Law 25 compliance'
);

-- Insert initial performance baseline
INSERT OR IGNORE INTO dlp_performance_metrics (
    id, scans_per_minute, average_response_time_ms, error_rate_percent,
    compliance_validation_time_ms, quebec_specific_detection_accuracy,
    collection_method, data_source
) VALUES (
    'perf-baseline-001',
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    'initialization',
    'dlp_service_setup'
);