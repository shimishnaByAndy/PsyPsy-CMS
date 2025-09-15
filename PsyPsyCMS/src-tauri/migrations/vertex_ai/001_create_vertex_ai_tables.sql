-- Google Vertex AI Service Tables - Quebec Law 25 Compliant
-- Migration 001: Create AI request/response logging and compliance tracking

-- Vertex AI requests table for comprehensive audit logging
CREATE TABLE IF NOT EXISTS vertex_ai_requests (
    id TEXT PRIMARY KEY NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN (
        'MedicalNoteAnalysis', 'ClinicalDecisionSupport', 'MedicalCoding',
        'RiskAssessment', 'QualityAssurance', 'NaturalLanguageProcessing',
        'PatternDetection', 'DocumentSummarization'
    )),

    -- User and context tracking
    practitioner_id TEXT NOT NULL,
    client_id TEXT, -- Optional for aggregate analysis
    session_id TEXT,

    -- Request details
    prompt_hash TEXT NOT NULL, -- SHA-256 hash of the de-identified prompt
    original_language TEXT NOT NULL DEFAULT 'fr-CA', -- Quebec French default
    target_language TEXT NOT NULL DEFAULT 'fr-CA',

    -- Quebec compliance fields
    deidentified BOOLEAN NOT NULL DEFAULT TRUE,
    quebec_law25_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    data_residency_confirmed BOOLEAN NOT NULL DEFAULT TRUE, -- Montreal region
    vpc_isolated BOOLEAN NOT NULL DEFAULT TRUE, -- VPC Service Controls
    cmek_encrypted BOOLEAN NOT NULL DEFAULT TRUE, -- Customer-managed encryption

    -- Processing metadata
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled'
    )),

    -- Audit and compliance
    compliance_validated BOOLEAN NOT NULL DEFAULT FALSE,
    audit_trail_id TEXT,

    -- Cost and performance tracking
    estimated_tokens INTEGER,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    FOREIGN KEY (practitioner_id) REFERENCES professionals(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (audit_trail_id) REFERENCES quebec_audit_logs(id)
);

-- Vertex AI responses table for complete interaction logging
CREATE TABLE IF NOT EXISTS vertex_ai_responses (
    id TEXT PRIMARY KEY NOT NULL,
    request_id TEXT NOT NULL,

    -- Response content (de-identified)
    response_text TEXT NOT NULL,
    confidence_score REAL NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),

    -- Processing metrics
    processing_time_ms INTEGER NOT NULL,
    tokens_used INTEGER NOT NULL,
    model_version TEXT NOT NULL,

    -- Quality and validation
    compliance_validated BOOLEAN NOT NULL DEFAULT TRUE,
    quality_score REAL CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
    warnings TEXT DEFAULT '[]', -- JSON array of warnings

    -- Quebec-specific fields
    quebec_terminology_used BOOLEAN NOT NULL DEFAULT FALSE,
    quebec_guidelines_referenced BOOLEAN NOT NULL DEFAULT FALSE,
    ramq_compatible BOOLEAN NOT NULL DEFAULT FALSE, -- RAMQ billing compatibility

    -- Response metadata
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validated_at DATETIME,
    validated_by TEXT, -- Practitioner who validated the AI response

    -- Usage tracking
    user_feedback_score INTEGER CHECK (user_feedback_score >= 1 AND user_feedback_score <= 5),
    user_feedback_text TEXT,
    response_used BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (request_id) REFERENCES vertex_ai_requests(id),
    FOREIGN KEY (validated_by) REFERENCES professionals(id)
);

-- Medical insights table for storing AI-generated clinical insights
CREATE TABLE IF NOT EXISTS vertex_ai_medical_insights (
    id TEXT PRIMARY KEY NOT NULL,
    response_id TEXT NOT NULL,

    -- Insight details
    insight_type TEXT NOT NULL CHECK (insight_type IN (
        'clinical_summary', 'risk_assessment', 'treatment_recommendation',
        'diagnostic_suggestion', 'medication_review', 'follow_up_recommendation',
        'quality_improvement', 'documentation_enhancement'
    )),
    description TEXT NOT NULL,
    confidence_score REAL NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),

    -- Supporting information
    supporting_evidence TEXT DEFAULT '[]', -- JSON array of evidence
    recommendations TEXT DEFAULT '[]', -- JSON array of recommendations

    -- Quebec healthcare context
    quebec_specific BOOLEAN NOT NULL DEFAULT FALSE,
    quebec_guideline_references TEXT DEFAULT '[]', -- JSON array of Quebec guidelines
    ramq_relevant BOOLEAN NOT NULL DEFAULT FALSE,
    inesss_aligned BOOLEAN NOT NULL DEFAULT FALSE, -- INESSS guidelines

    -- Clinical relevance
    urgency_level TEXT NOT NULL DEFAULT 'routine' CHECK (urgency_level IN (
        'routine', 'moderate', 'urgent', 'critical'
    )),
    clinical_impact TEXT NOT NULL DEFAULT 'low' CHECK (clinical_impact IN (
        'low', 'moderate', 'high', 'critical'
    )),

    -- Validation and feedback
    practitioner_validated BOOLEAN NOT NULL DEFAULT FALSE,
    validation_notes TEXT,
    insight_adopted BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (response_id) REFERENCES vertex_ai_responses(id)
);

-- Clinical decision support table for CDSS recommendations
CREATE TABLE IF NOT EXISTS vertex_ai_clinical_decisions (
    id TEXT PRIMARY KEY NOT NULL,
    response_id TEXT NOT NULL,

    -- Clinical assessment
    assessment TEXT NOT NULL,
    differential_diagnosis TEXT DEFAULT '[]', -- JSON array of possible diagnoses
    recommended_tests TEXT DEFAULT '[]', -- JSON array of recommended tests
    treatment_options TEXT DEFAULT '[]', -- JSON array of treatment options
    risk_factors TEXT DEFAULT '[]', -- JSON array of identified risk factors

    -- Quebec healthcare system context
    quebec_guidelines TEXT DEFAULT '[]', -- JSON array of Quebec-specific guidelines
    ramq_covered_tests TEXT DEFAULT '[]', -- JSON array of RAMQ-covered tests
    quebec_available_treatments TEXT DEFAULT '[]', -- JSON array of treatments available in Quebec
    specialist_referral_needed BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_referral_needed BOOLEAN NOT NULL DEFAULT FALSE,

    -- Decision support metadata
    urgency_level TEXT NOT NULL DEFAULT 'routine' CHECK (urgency_level IN (
        'routine', 'moderate', 'urgent', 'critical', 'emergency'
    )),
    confidence_level TEXT NOT NULL DEFAULT 'moderate' CHECK (confidence_level IN (
        'low', 'moderate', 'high', 'very_high'
    )),

    -- Practitioner interaction
    practitioner_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    practitioner_notes TEXT,
    recommendations_followed BOOLEAN NOT NULL DEFAULT FALSE,
    outcome_tracked BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (response_id) REFERENCES vertex_ai_responses(id)
);

-- Medical coding table for AI-generated coding suggestions
CREATE TABLE IF NOT EXISTS vertex_ai_medical_coding (
    id TEXT PRIMARY KEY NOT NULL,
    response_id TEXT NOT NULL,

    -- Coding systems
    icd_10_ca_codes TEXT DEFAULT '[]', -- JSON array of ICD-10-CA codes
    dsm_5_tr_codes TEXT DEFAULT '[]', -- JSON array of DSM-5-TR codes
    quebec_billing_codes TEXT DEFAULT '[]', -- JSON array of Quebec-specific billing codes
    ramq_codes TEXT DEFAULT '[]', -- JSON array of RAMQ billing codes

    -- Coding confidence and rationale
    confidence_scores TEXT DEFAULT '{}', -- JSON object with confidence per code
    coding_rationale TEXT NOT NULL,
    primary_codes TEXT DEFAULT '[]', -- JSON array of primary codes
    secondary_codes TEXT DEFAULT '[]', -- JSON array of secondary codes

    -- Quebec billing context
    ramq_billable BOOLEAN NOT NULL DEFAULT FALSE,
    quebec_modifier_codes TEXT DEFAULT '[]', -- JSON array of Quebec modifier codes
    billing_complexity TEXT NOT NULL DEFAULT 'simple' CHECK (billing_complexity IN (
        'simple', 'moderate', 'complex', 'highly_complex'
    )),

    -- Validation and usage
    coding_validated BOOLEAN NOT NULL DEFAULT FALSE,
    validated_by TEXT, -- Practitioner who validated the coding
    codes_used_for_billing BOOLEAN NOT NULL DEFAULT FALSE,
    billing_accuracy_feedback REAL CHECK (billing_accuracy_feedback >= 0.0 AND billing_accuracy_feedback <= 1.0),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validated_at DATETIME,

    FOREIGN KEY (response_id) REFERENCES vertex_ai_responses(id),
    FOREIGN KEY (validated_by) REFERENCES professionals(id)
);

-- AI model performance tracking
CREATE TABLE IF NOT EXISTS vertex_ai_performance_metrics (
    id TEXT PRIMARY KEY NOT NULL,
    date DATE NOT NULL DEFAULT (DATE('now')),
    model_version TEXT NOT NULL,

    -- Usage statistics
    total_requests INTEGER NOT NULL DEFAULT 0,
    successful_requests INTEGER NOT NULL DEFAULT 0,
    failed_requests INTEGER NOT NULL DEFAULT 0,

    -- Performance metrics
    average_processing_time_ms REAL NOT NULL DEFAULT 0.0,
    average_tokens_used REAL NOT NULL DEFAULT 0.0,
    average_confidence_score REAL NOT NULL DEFAULT 0.0,

    -- Quality metrics
    practitioner_validation_rate REAL NOT NULL DEFAULT 0.0, -- Percentage of responses validated
    recommendation_adoption_rate REAL NOT NULL DEFAULT 0.0, -- Percentage of recommendations adopted
    average_user_feedback_score REAL CHECK (average_user_feedback_score >= 1.0 AND average_user_feedback_score <= 5.0),

    -- Quebec compliance metrics
    quebec_compliance_rate REAL NOT NULL DEFAULT 100.0,
    french_response_rate REAL NOT NULL DEFAULT 0.0,
    quebec_guideline_reference_rate REAL NOT NULL DEFAULT 0.0,

    -- Cost and efficiency
    total_cost_cad REAL NOT NULL DEFAULT 0.0,
    cost_per_request_cad REAL NOT NULL DEFAULT 0.0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(date, model_version)
);

-- AI ethics and bias monitoring
CREATE TABLE IF NOT EXISTS vertex_ai_ethics_monitoring (
    id TEXT PRIMARY KEY NOT NULL,
    request_id TEXT NOT NULL,

    -- Bias detection
    potential_bias_detected BOOLEAN NOT NULL DEFAULT FALSE,
    bias_type TEXT CHECK (bias_type IN (
        'gender', 'age', 'ethnicity', 'socioeconomic', 'language', 'geographic', 'cultural'
    )),
    bias_description TEXT,
    bias_confidence_score REAL CHECK (bias_confidence_score >= 0.0 AND bias_confidence_score <= 1.0),

    -- Fairness assessment
    fairness_score REAL CHECK (fairness_score >= 0.0 AND fairness_score <= 1.0),
    demographic_parity BOOLEAN NOT NULL DEFAULT TRUE,
    equal_opportunity BOOLEAN NOT NULL DEFAULT TRUE,

    -- Quebec cultural context
    quebec_cultural_sensitivity BOOLEAN NOT NULL DEFAULT TRUE,
    french_language_quality REAL CHECK (french_language_quality >= 0.0 AND french_language_quality <= 1.0),
    indigenous_considerations BOOLEAN NOT NULL DEFAULT FALSE,

    -- Ethical review
    requires_ethics_review BOOLEAN NOT NULL DEFAULT FALSE,
    ethics_review_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ethics_reviewer TEXT,
    ethics_notes TEXT,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,

    FOREIGN KEY (request_id) REFERENCES vertex_ai_requests(id),
    FOREIGN KEY (ethics_reviewer) REFERENCES professionals(id)
);

-- Indexes for performance optimization

-- Primary request/response indexes
CREATE INDEX IF NOT EXISTS idx_vertex_ai_requests_practitioner
ON vertex_ai_requests(practitioner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vertex_ai_requests_type_status
ON vertex_ai_requests(request_type, processing_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vertex_ai_requests_compliance
ON vertex_ai_requests(quebec_law25_compliant, compliance_validated);

CREATE INDEX IF NOT EXISTS idx_vertex_ai_responses_request
ON vertex_ai_responses(request_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_vertex_ai_responses_validation
ON vertex_ai_responses(compliance_validated, validated_at);

-- Medical insights indexes
CREATE INDEX IF NOT EXISTS idx_vertex_ai_insights_type
ON vertex_ai_medical_insights(insight_type, quebec_specific, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vertex_ai_insights_urgency
ON vertex_ai_medical_insights(urgency_level, clinical_impact);

CREATE INDEX IF NOT EXISTS idx_vertex_ai_insights_validation
ON vertex_ai_medical_insights(practitioner_validated, insight_adopted);

-- Clinical decisions indexes
CREATE INDEX IF NOT EXISTS idx_vertex_ai_decisions_urgency
ON vertex_ai_clinical_decisions(urgency_level, confidence_level);

CREATE INDEX IF NOT EXISTS idx_vertex_ai_decisions_review
ON vertex_ai_clinical_decisions(practitioner_reviewed, recommendations_followed);

-- Medical coding indexes
CREATE INDEX IF NOT EXISTS idx_vertex_ai_coding_validation
ON vertex_ai_medical_coding(coding_validated, ramq_billable);

CREATE INDEX IF NOT EXISTS idx_vertex_ai_coding_usage
ON vertex_ai_medical_coding(codes_used_for_billing, billing_complexity);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_vertex_ai_performance_date
ON vertex_ai_performance_metrics(date DESC, model_version);

-- Ethics monitoring indexes
CREATE INDEX IF NOT EXISTS idx_vertex_ai_ethics_bias
ON vertex_ai_ethics_monitoring(potential_bias_detected, bias_type);

CREATE INDEX IF NOT EXISTS idx_vertex_ai_ethics_review
ON vertex_ai_ethics_monitoring(requires_ethics_review, ethics_review_completed);

-- Triggers for automated processing

-- Update AI performance metrics daily
CREATE TRIGGER IF NOT EXISTS vertex_ai_performance_trigger
    AFTER INSERT ON vertex_ai_responses
    FOR EACH ROW
BEGIN
    INSERT OR REPLACE INTO vertex_ai_performance_metrics (
        id, date, model_version,
        total_requests, successful_requests,
        average_processing_time_ms, average_tokens_used, average_confidence_score
    ) VALUES (
        DATE('now') || '_' || NEW.model_version,
        DATE('now'),
        NEW.model_version,
        COALESCE((SELECT total_requests FROM vertex_ai_performance_metrics
                 WHERE date = DATE('now') AND model_version = NEW.model_version), 0) + 1,
        COALESCE((SELECT successful_requests FROM vertex_ai_performance_metrics
                 WHERE date = DATE('now') AND model_version = NEW.model_version), 0) +
                 CASE WHEN NEW.compliance_validated THEN 1 ELSE 0 END,
        COALESCE((SELECT average_processing_time_ms FROM vertex_ai_performance_metrics
                 WHERE date = DATE('now') AND model_version = NEW.model_version), NEW.processing_time_ms),
        COALESCE((SELECT average_tokens_used FROM vertex_ai_performance_metrics
                 WHERE date = DATE('now') AND model_version = NEW.model_version), NEW.tokens_used),
        COALESCE((SELECT average_confidence_score FROM vertex_ai_performance_metrics
                 WHERE date = DATE('now') AND model_version = NEW.model_version), NEW.confidence_score)
    );
END;

-- Audit trail integration for AI requests
CREATE TRIGGER IF NOT EXISTS vertex_ai_audit_trigger
    AFTER INSERT ON vertex_ai_requests
    FOR EACH ROW
BEGIN
    INSERT INTO quebec_audit_logs (
        id, event_type, event_data, practitioner_id, client_id,
        resource_type, resource_id, action, timestamp,
        quebec_law25_compliant, phi_accessed, retention_period_days
    ) VALUES (
        lower(hex(randomblob(16))),
        'ai_request_created',
        json_object(
            'request_type', NEW.request_type,
            'deidentified', NEW.deidentified,
            'language', NEW.original_language,
            'vpc_isolated', NEW.vpc_isolated,
            'cmek_encrypted', NEW.cmek_encrypted
        ),
        NEW.practitioner_id,
        NEW.client_id,
        'vertex_ai_request',
        NEW.id,
        'create',
        NEW.created_at,
        NEW.quebec_law25_compliant,
        CASE WHEN NEW.client_id IS NOT NULL THEN 1 ELSE 0 END,
        2555 -- 7 years retention for AI medical interactions
    );
END;

-- Ethics monitoring trigger for bias detection
CREATE TRIGGER IF NOT EXISTS vertex_ai_ethics_trigger
    AFTER INSERT ON vertex_ai_responses
    FOR EACH ROW
    WHEN NEW.confidence_score < 0.7 OR NEW.warnings != '[]'
BEGIN
    INSERT INTO vertex_ai_ethics_monitoring (
        id, request_id, potential_bias_detected, fairness_score,
        requires_ethics_review, quebec_cultural_sensitivity
    ) VALUES (
        lower(hex(randomblob(16))),
        NEW.request_id,
        CASE WHEN NEW.confidence_score < 0.5 THEN 1 ELSE 0 END,
        NEW.confidence_score,
        CASE WHEN NEW.confidence_score < 0.6 THEN 1 ELSE 0 END,
        1 -- Default to culturally sensitive
    );
END;

-- View for AI compliance dashboard
CREATE VIEW IF NOT EXISTS vertex_ai_compliance_dashboard AS
SELECT
    -- Today's AI usage
    (SELECT COUNT(*) FROM vertex_ai_requests WHERE DATE(created_at) = DATE('now')) as requests_today,
    (SELECT COUNT(*) FROM vertex_ai_responses WHERE DATE(generated_at) = DATE('now')) as responses_today,

    -- Compliance metrics
    (SELECT COUNT(*) FROM vertex_ai_requests WHERE quebec_law25_compliant = FALSE) as non_compliant_requests,
    (SELECT COUNT(*) FROM vertex_ai_responses WHERE compliance_validated = FALSE) as unvalidated_responses,
    (SELECT COUNT(*) FROM vertex_ai_requests WHERE data_residency_confirmed = FALSE) as data_residency_violations,
    (SELECT COUNT(*) FROM vertex_ai_requests WHERE vpc_isolated = FALSE) as vpc_violations,
    (SELECT COUNT(*) FROM vertex_ai_requests WHERE cmek_encrypted = FALSE) as encryption_violations,

    -- Performance metrics (last 7 days)
    (SELECT AVG(processing_time_ms) FROM vertex_ai_responses
     WHERE generated_at > DATETIME('now', '-7 days')) as avg_processing_time_ms,
    (SELECT AVG(confidence_score) FROM vertex_ai_responses
     WHERE generated_at > DATETIME('now', '-7 days')) as avg_confidence_score,
    (SELECT AVG(tokens_used) FROM vertex_ai_responses
     WHERE generated_at > DATETIME('now', '-7 days')) as avg_tokens_used,

    -- Quality metrics
    (SELECT COUNT(*) FROM vertex_ai_responses WHERE validated_by IS NOT NULL) * 100.0 /
    NULLIF((SELECT COUNT(*) FROM vertex_ai_responses), 0) as validation_rate_percent,
    (SELECT COUNT(*) FROM vertex_ai_medical_insights WHERE insight_adopted = TRUE) * 100.0 /
    NULLIF((SELECT COUNT(*) FROM vertex_ai_medical_insights), 0) as adoption_rate_percent,

    -- Quebec-specific metrics
    (SELECT COUNT(*) FROM vertex_ai_responses WHERE quebec_terminology_used = TRUE) * 100.0 /
    NULLIF((SELECT COUNT(*) FROM vertex_ai_responses), 0) as quebec_terminology_rate_percent,
    (SELECT COUNT(*) FROM vertex_ai_clinical_decisions WHERE ramq_covered_tests != '[]') * 100.0 /
    NULLIF((SELECT COUNT(*) FROM vertex_ai_clinical_decisions), 0) as ramq_relevance_rate_percent,

    -- Ethics monitoring
    (SELECT COUNT(*) FROM vertex_ai_ethics_monitoring WHERE potential_bias_detected = TRUE) as bias_incidents,
    (SELECT COUNT(*) FROM vertex_ai_ethics_monitoring WHERE requires_ethics_review = TRUE AND ethics_review_completed = FALSE) as pending_ethics_reviews;