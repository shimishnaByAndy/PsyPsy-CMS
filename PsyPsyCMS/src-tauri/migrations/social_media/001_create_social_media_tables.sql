-- Social Media Integration Database Schema
--
-- This migration creates tables for managing healthcare professional social media
-- presence while maintaining strict compliance with privacy regulations.
--
-- Created: 2025-01-14
-- Purpose: Support professional networking and brand building for healthcare providers

-- Social Media Accounts - Connected platforms and profiles
CREATE TABLE IF NOT EXISTS social_media_accounts (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL CHECK (platform IN (
        'linkedin', 'facebook', 'instagram', 'twitter', 'youtube',
        'tiktok', 'clubhouse', 'medium', 'substack'
    )),
    account_type TEXT NOT NULL CHECK (account_type IN (
        'personal', 'business', 'page', 'group', 'company'
    )),

    -- Professional context
    professional_id TEXT NOT NULL,
    specialty TEXT, -- Medical specialty or healthcare role
    practice_name TEXT,
    practice_type TEXT, -- clinic, hospital, private_practice, telehealth

    -- Account details
    display_name TEXT NOT NULL,
    username TEXT,
    profile_url TEXT,
    bio TEXT,
    location TEXT,
    website_url TEXT,

    -- Metrics
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    connection_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    engagement_rate REAL DEFAULT 0.0,

    -- Verification status
    verified BOOLEAN DEFAULT FALSE,
    verification_type TEXT, -- blue_verified, business_verified, healthcare_verified
    verification_date DATETIME,

    -- Account status
    active BOOLEAN NOT NULL DEFAULT TRUE,
    suspended BOOLEAN DEFAULT FALSE,
    suspension_reason TEXT,
    last_synced DATETIME,
    sync_frequency_hours INTEGER DEFAULT 24,

    -- Feature flags
    sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    posting_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    analytics_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    auto_engagement_enabled BOOLEAN DEFAULT FALSE,
    content_curation_enabled BOOLEAN DEFAULT TRUE,

    -- Privacy and compliance
    privacy_mode TEXT DEFAULT 'professional' CHECK (privacy_mode IN (
        'public', 'professional', 'restricted', 'private'
    )),
    quebec_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    hipaa_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    gdpr_compliant BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamps
    connected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_posted_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);

-- Social Media Credentials - Encrypted API tokens and authentication
CREATE TABLE IF NOT EXISTS social_media_credentials (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL,
    platform TEXT NOT NULL,

    -- Authentication tokens (encrypted in production)
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    scope TEXT,

    -- Token lifecycle
    expires_at DATETIME,
    issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_refreshed DATETIME,
    refresh_count INTEGER DEFAULT 0,

    -- API configuration
    api_version TEXT,
    app_id TEXT,
    client_id TEXT,
    permissions_json TEXT, -- JSON array of granted permissions

    -- Security
    encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    encryption_key_id TEXT,
    token_hash TEXT, -- Hash for validation without storing plaintext

    -- Usage tracking
    api_calls_today INTEGER DEFAULT 0,
    api_calls_total INTEGER DEFAULT 0,
    last_api_call DATETIME,
    rate_limit_remaining INTEGER,
    rate_limit_reset_time DATETIME,

    -- Compliance
    consent_granted BOOLEAN NOT NULL DEFAULT TRUE,
    consent_timestamp DATETIME,
    data_usage_purpose TEXT DEFAULT 'professional_networking',

    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (account_id) REFERENCES social_media_accounts(account_id) ON DELETE CASCADE
);

-- Social Media Posts - Content published across platforms
CREATE TABLE IF NOT EXISTS social_media_posts (
    id TEXT PRIMARY KEY NOT NULL,
    post_id TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL,
    account_id TEXT NOT NULL,
    professional_id TEXT NOT NULL,

    -- Content details
    content_type TEXT NOT NULL CHECK (content_type IN (
        'text', 'image', 'video', 'carousel', 'story', 'reel',
        'article', 'poll', 'event', 'job_posting', 'announcement'
    )),
    title TEXT,
    content TEXT NOT NULL,
    content_length INTEGER,
    language TEXT DEFAULT 'en',

    -- Rich content
    hashtags_json TEXT, -- JSON array of hashtags
    mentions_json TEXT, -- JSON array of mentioned users/pages
    media_urls_json TEXT, -- JSON array of media attachments
    media_type TEXT, -- image, video, document, gif
    media_count INTEGER DEFAULT 0,

    -- Link preview
    link_url TEXT,
    link_title TEXT,
    link_description TEXT,
    link_image_url TEXT,
    link_domain TEXT,

    -- Scheduling and publication
    scheduled_for DATETIME,
    posted_at DATETIME,
    platform_post_id TEXT, -- ID from social platform
    platform_url TEXT, -- Direct URL to post on platform

    -- Post status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'posting', 'posted', 'failed',
        'deleted', 'archived', 'hidden', 'reported'
    )),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN (
        'public', 'connections', 'followers', 'private', 'unlisted'
    )),

    -- Error handling
    error_message TEXT,
    error_code TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at DATETIME,

    -- Engagement metrics
    engagement_stats_json TEXT, -- JSON object with likes, comments, shares, etc.
    engagement_last_updated DATETIME,
    performance_score REAL DEFAULT 0.0,
    reach_estimated INTEGER DEFAULT 0,
    impressions_estimated INTEGER DEFAULT 0,

    -- Compliance and review
    compliance_checked BOOLEAN NOT NULL DEFAULT FALSE,
    compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN (
        'pending', 'approved', 'approved_with_conditions', 'rejected', 'flagged'
    )),
    compliance_score REAL DEFAULT 0.0,
    compliance_notes TEXT,
    compliance_issues_json TEXT, -- JSON array of compliance issues

    -- Review workflow
    review_required BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_by TEXT,
    reviewed_at DATETIME,
    reviewer_notes TEXT,
    auto_approved BOOLEAN DEFAULT FALSE,

    -- Content categorization
    content_category TEXT CHECK (content_category IN (
        'educational', 'promotional', 'announcement', 'industry_news',
        'personal_insight', 'patient_story', 'research_update',
        'event_promotion', 'thought_leadership', 'community_engagement'
    )),
    target_audience TEXT, -- patients, professionals, general_public, colleagues
    professional_tone_score REAL DEFAULT 0.0,

    -- Analytics and optimization
    best_time_to_post BOOLEAN DEFAULT FALSE,
    optimal_hashtags_used BOOLEAN DEFAULT FALSE,
    content_optimization_score REAL DEFAULT 0.0,

    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (account_id) REFERENCES social_media_accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);

-- Social Media Compliance Checks - Content validation and approval
CREATE TABLE IF NOT EXISTS social_media_compliance_checks (
    id TEXT PRIMARY KEY NOT NULL,
    check_id TEXT NOT NULL UNIQUE,
    post_id TEXT NOT NULL,

    -- Check configuration
    check_type TEXT NOT NULL CHECK (check_type IN (
        'privacy', 'professional', 'regulatory', 'content', 'comprehensive',
        'hipaa', 'quebec_law25', 'gdpr', 'medical_advice', 'patient_safety'
    )),
    check_version TEXT DEFAULT 'v1.0',
    automated BOOLEAN NOT NULL DEFAULT TRUE,

    -- Results
    status TEXT NOT NULL CHECK (status IN (
        'passed', 'failed', 'warning', 'pending', 'manual_review_required'
    )),
    score REAL NOT NULL DEFAULT 0.0, -- 0.0 to 1.0
    confidence_level REAL DEFAULT 0.0,

    -- Detailed findings
    issues_json TEXT, -- JSON array of ComplianceIssue objects
    recommendations_json TEXT, -- JSON array of recommendations
    warnings_json TEXT, -- JSON array of warnings

    -- Processing details
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checked_by TEXT NOT NULL, -- system, user, supervisor, external_service
    processing_time_ms INTEGER,
    model_version TEXT,

    -- Actions taken
    auto_fix_applied BOOLEAN DEFAULT FALSE,
    auto_fix_details TEXT,
    manual_review_required BOOLEAN DEFAULT FALSE,
    escalation_required BOOLEAN DEFAULT FALSE,
    escalated_to TEXT,
    escalated_at DATETIME,

    -- Compliance categories
    privacy_score REAL DEFAULT 1.0,
    professional_score REAL DEFAULT 1.0,
    medical_accuracy_score REAL DEFAULT 1.0,
    regulatory_score REAL DEFAULT 1.0,

    -- Specific violation flags
    patient_privacy_violation BOOLEAN DEFAULT FALSE,
    medical_advice_detected BOOLEAN DEFAULT FALSE,
    unprofessional_content BOOLEAN DEFAULT FALSE,
    regulatory_violation BOOLEAN DEFAULT FALSE,
    misinformation_detected BOOLEAN DEFAULT FALSE,

    -- Follow-up
    resolution_status TEXT DEFAULT 'none' CHECK (resolution_status IN (
        'none', 'auto_resolved', 'manually_resolved', 'escalated', 'ignored'
    )),
    resolution_notes TEXT,
    resolved_by TEXT,
    resolved_at DATETIME,

    -- Foreign key constraints
    FOREIGN KEY (post_id) REFERENCES social_media_posts(post_id) ON DELETE CASCADE
);

-- Social Media Analytics - Performance metrics and insights
CREATE TABLE IF NOT EXISTS social_media_analytics (
    id TEXT PRIMARY KEY NOT NULL,
    analytics_id TEXT NOT NULL UNIQUE,
    professional_id TEXT NOT NULL,
    account_id TEXT,
    platform TEXT NOT NULL,

    -- Time period
    period_type TEXT NOT NULL CHECK (period_type IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom'
    )),
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    timezone TEXT DEFAULT 'America/Montreal',

    -- Post metrics
    total_posts INTEGER NOT NULL DEFAULT 0,
    posts_with_engagement INTEGER DEFAULT 0,
    average_posts_per_day REAL DEFAULT 0.0,
    content_type_breakdown_json TEXT, -- JSON object with content type counts

    -- Engagement metrics
    total_engagement INTEGER NOT NULL DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_saves INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,

    -- Reach and impressions
    total_reach INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    average_engagement_rate REAL DEFAULT 0.0,
    peak_engagement_time TEXT,

    -- Audience metrics
    follower_growth INTEGER DEFAULT 0,
    follower_loss INTEGER DEFAULT 0,
    net_follower_change INTEGER DEFAULT 0,
    audience_demographics_json TEXT, -- JSON object with demographic breakdown

    -- Content performance
    top_performing_post_id TEXT,
    top_performing_post_engagement INTEGER DEFAULT 0,
    worst_performing_post_id TEXT,
    top_hashtags_json TEXT, -- JSON array of most effective hashtags
    top_content_types_json TEXT, -- JSON array of best performing content types

    -- Professional impact
    professional_inquiries INTEGER DEFAULT 0,
    website_traffic_from_social INTEGER DEFAULT 0,
    appointment_bookings_attributed INTEGER DEFAULT 0,
    professional_connections_gained INTEGER DEFAULT 0,
    speaking_opportunities INTEGER DEFAULT 0,
    collaboration_requests INTEGER DEFAULT 0,

    -- Engagement timing
    engagement_by_hour_json TEXT, -- JSON object with hourly engagement data
    engagement_by_day_json TEXT, -- JSON object with daily engagement data
    optimal_posting_times_json TEXT, -- JSON array of recommended posting times

    -- Compliance metrics
    compliance_score REAL DEFAULT 1.0,
    flagged_posts_count INTEGER DEFAULT 0,
    compliance_violations_count INTEGER DEFAULT 0,
    review_required_posts_count INTEGER DEFAULT 0,

    -- Competitive insights
    industry_benchmark_engagement_rate REAL,
    compared_to_industry_average REAL, -- Percentage above/below average
    peer_comparison_rank INTEGER,
    specialty_benchmark_score REAL,

    -- ROI and business impact
    estimated_reach_value REAL DEFAULT 0.0,
    estimated_engagement_value REAL DEFAULT 0.0,
    professional_brand_score REAL DEFAULT 0.0,
    influence_score REAL DEFAULT 0.0,

    -- Generated report
    insights_json TEXT, -- JSON object with AI-generated insights
    recommendations_json TEXT, -- JSON array of actionable recommendations
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by TEXT DEFAULT 'system',

    -- Foreign key constraints
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES social_media_accounts(account_id) ON DELETE SET NULL,
    FOREIGN KEY (top_performing_post_id) REFERENCES social_media_posts(post_id) ON DELETE SET NULL
);

-- Content Templates - Pre-approved content for quick posting
CREATE TABLE IF NOT EXISTS social_media_content_templates (
    id TEXT PRIMARY KEY NOT NULL,
    template_id TEXT NOT NULL UNIQUE,
    template_name TEXT NOT NULL,

    -- Template categorization
    category TEXT NOT NULL CHECK (category IN (
        'educational', 'promotional', 'announcement', 'industry_news',
        'wellness_tips', 'mental_health_awareness', 'patient_education',
        'professional_development', 'research_insights', 'seasonal'
    )),
    subcategory TEXT,
    tags_json TEXT, -- JSON array of tags

    -- Template content
    template_content TEXT NOT NULL,
    content_variables_json TEXT, -- JSON object with placeholder variables
    hashtags_json TEXT, -- JSON array of recommended hashtags
    suggested_media_type TEXT,
    suggested_timing TEXT,

    -- Platform compatibility
    platforms_json TEXT NOT NULL, -- JSON array of supported platforms
    platform_specific_variations_json TEXT, -- JSON object with platform-specific versions

    -- Professional targeting
    professional_specialties_json TEXT, -- JSON array of relevant medical specialties
    experience_levels_json TEXT, -- JSON array: junior, mid, senior, expert
    practice_types_json TEXT, -- JSON array: clinic, hospital, private, telehealth

    -- Compliance and approval
    compliance_approved BOOLEAN NOT NULL DEFAULT FALSE,
    compliance_checked_at DATETIME,
    compliance_checked_by TEXT,
    pre_approved_by_supervisor BOOLEAN DEFAULT FALSE,
    regulatory_review_completed BOOLEAN DEFAULT FALSE,

    -- Usage statistics
    usage_count INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0.0, -- Based on engagement metrics
    effectiveness_score REAL DEFAULT 0.0,
    last_used DATETIME,
    average_engagement_rate REAL DEFAULT 0.0,

    -- Content quality
    professional_tone_verified BOOLEAN DEFAULT TRUE,
    medical_accuracy_verified BOOLEAN DEFAULT TRUE,
    cultural_sensitivity_checked BOOLEAN DEFAULT TRUE,
    accessibility_compliant BOOLEAN DEFAULT TRUE,

    -- Lifecycle management
    active BOOLEAN NOT NULL DEFAULT TRUE,
    seasonal BOOLEAN DEFAULT FALSE,
    seasonal_start_date DATE,
    seasonal_end_date DATE,
    expiry_date DATE,

    -- Creation and maintenance
    created_by TEXT NOT NULL,
    approved_by TEXT,
    last_modified_by TEXT,
    version TEXT DEFAULT '1.0',
    changelog TEXT,

    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,

    -- Foreign key constraints
    FOREIGN KEY (created_by) REFERENCES professionals(id) ON DELETE SET NULL
);

-- Scheduling Rules - Automated posting optimization
CREATE TABLE IF NOT EXISTS social_media_scheduling_rules (
    id TEXT PRIMARY KEY NOT NULL,
    rule_id TEXT NOT NULL UNIQUE,
    professional_id TEXT NOT NULL,
    rule_name TEXT NOT NULL,

    -- Platform and content scope
    platforms_json TEXT NOT NULL, -- JSON array of platforms
    content_types_json TEXT, -- JSON array of applicable content types
    categories_json TEXT, -- JSON array of content categories

    -- Timing configuration
    optimal_times_json TEXT NOT NULL, -- JSON array of optimal posting times
    timezone TEXT NOT NULL DEFAULT 'America/Montreal',
    days_of_week_json TEXT, -- JSON array of preferred days
    avoid_holidays BOOLEAN DEFAULT TRUE,
    avoid_weekends BOOLEAN DEFAULT FALSE,

    -- Frequency limits
    max_posts_per_day INTEGER DEFAULT 3,
    max_posts_per_week INTEGER DEFAULT 15,
    min_interval_hours INTEGER DEFAULT 4,
    frequency_distribution TEXT DEFAULT 'even', -- even, peak_weighted, custom

    -- Content distribution
    content_mix_strategy TEXT DEFAULT 'balanced' CHECK (content_mix_strategy IN (
        'balanced', 'educational_heavy', 'promotional_focused', 'engagement_optimized'
    )),
    educational_content_percentage INTEGER DEFAULT 60,
    promotional_content_percentage INTEGER DEFAULT 20,
    engagement_content_percentage INTEGER DEFAULT 20,

    -- Audience optimization
    target_audience_active_hours_json TEXT,
    audience_timezone_distribution_json TEXT,
    engagement_pattern_optimization BOOLEAN DEFAULT TRUE,

    -- Advanced settings
    auto_reschedule_low_engagement_times BOOLEAN DEFAULT TRUE,
    seasonal_adjustments BOOLEAN DEFAULT TRUE,
    competitor_posting_avoidance BOOLEAN DEFAULT FALSE,
    trending_hashtag_integration BOOLEAN DEFAULT TRUE,

    -- Performance tracking
    posts_scheduled_count INTEGER DEFAULT 0,
    posts_published_count INTEGER DEFAULT 0,
    average_engagement_rate REAL DEFAULT 0.0,
    rule_effectiveness_score REAL DEFAULT 0.0,
    last_optimization_date DATETIME,

    -- Rule status
    active BOOLEAN NOT NULL DEFAULT TRUE,
    auto_optimization_enabled BOOLEAN DEFAULT TRUE,
    manual_override_allowed BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME,

    -- Foreign key constraints
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);

-- Social Media Campaigns - Coordinated marketing initiatives
CREATE TABLE IF NOT EXISTS social_media_campaigns (
    id TEXT PRIMARY KEY NOT NULL,
    campaign_id TEXT NOT NULL UNIQUE,
    professional_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,

    -- Campaign details
    campaign_type TEXT NOT NULL CHECK (campaign_type IN (
        'awareness', 'educational', 'promotional', 'recruitment',
        'event_promotion', 'product_launch', 'seasonal', 'crisis_communication'
    )),
    description TEXT,
    objectives_json TEXT, -- JSON array of campaign objectives
    target_audience TEXT,

    -- Campaign timeline
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    launch_date DATE,
    campaign_duration_days INTEGER,
    status TEXT DEFAULT 'planning' CHECK (status IN (
        'planning', 'approved', 'active', 'paused', 'completed', 'cancelled'
    )),

    -- Content and platforms
    platforms_json TEXT NOT NULL, -- JSON array of target platforms
    content_themes_json TEXT, -- JSON array of content themes
    hashtag_strategy_json TEXT, -- JSON object with hashtag strategy
    post_count_target INTEGER DEFAULT 0,
    content_calendar_json TEXT, -- JSON object with planned content

    -- Budget and resources
    budget_allocated REAL DEFAULT 0.0,
    budget_spent REAL DEFAULT 0.0,
    time_investment_hours REAL DEFAULT 0.0,
    team_members_json TEXT, -- JSON array of involved team members

    -- Performance targets
    target_reach INTEGER DEFAULT 0,
    target_engagement INTEGER DEFAULT 0,
    target_followers INTEGER DEFAULT 0,
    target_website_clicks INTEGER DEFAULT 0,
    target_appointments INTEGER DEFAULT 0,

    -- Actual performance
    actual_reach INTEGER DEFAULT 0,
    actual_engagement INTEGER DEFAULT 0,
    actual_followers_gained INTEGER DEFAULT 0,
    actual_website_clicks INTEGER DEFAULT 0,
    actual_appointments INTEGER DEFAULT 0,
    roi_percentage REAL DEFAULT 0.0,

    -- Campaign analytics
    posts_published INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    engagement_rate REAL DEFAULT 0.0,
    best_performing_post_id TEXT,
    campaign_hashtag_performance_json TEXT,

    -- Compliance and approval
    compliance_approved BOOLEAN DEFAULT FALSE,
    regulatory_review_required BOOLEAN DEFAULT FALSE,
    supervisor_approved BOOLEAN DEFAULT FALSE,
    legal_review_completed BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    launched_at DATETIME,
    completed_at DATETIME,

    -- Foreign key constraints
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
    FOREIGN KEY (best_performing_post_id) REFERENCES social_media_posts(post_id) ON DELETE SET NULL
);

-- Indexes for optimal query performance

-- Account management indexes
CREATE INDEX IF NOT EXISTS idx_social_accounts_professional ON social_media_accounts(professional_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_media_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON social_media_accounts(active, posting_enabled);

-- Credentials and security indexes
CREATE INDEX IF NOT EXISTS idx_social_credentials_account ON social_media_credentials(account_id);
CREATE INDEX IF NOT EXISTS idx_social_credentials_expires ON social_media_credentials(expires_at);

-- Post management indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_professional ON social_media_posts(professional_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_account ON social_media_posts(account_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_media_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_social_posts_posted ON social_media_posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_media_posts(created_at);

-- Compliance indexes
CREATE INDEX IF NOT EXISTS idx_social_compliance_post ON social_media_compliance_checks(post_id);
CREATE INDEX IF NOT EXISTS idx_social_compliance_status ON social_media_compliance_checks(status);
CREATE INDEX IF NOT EXISTS idx_social_compliance_type ON social_media_compliance_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_social_compliance_checked ON social_media_compliance_checks(checked_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_social_analytics_professional ON social_media_analytics(professional_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_platform ON social_media_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_social_analytics_period ON social_media_analytics(period_start, period_end);

-- Template and campaign indexes
CREATE INDEX IF NOT EXISTS idx_social_templates_category ON social_media_content_templates(category);
CREATE INDEX IF NOT EXISTS idx_social_templates_active ON social_media_content_templates(active, compliance_approved);
CREATE INDEX IF NOT EXISTS idx_social_campaigns_professional ON social_media_campaigns(professional_id);
CREATE INDEX IF NOT EXISTS idx_social_campaigns_status ON social_media_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_social_campaigns_dates ON social_media_campaigns(start_date, end_date);

-- Compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_social_posts_prof_platform_status ON social_media_posts(professional_id, platform, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_account_created ON social_media_posts(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_social_compliance_post_status ON social_media_compliance_checks(post_id, status);

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_social_accounts_timestamp
    AFTER UPDATE ON social_media_accounts
    FOR EACH ROW
    BEGIN
        UPDATE social_media_accounts
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_social_posts_timestamp
    AFTER UPDATE ON social_media_posts
    FOR EACH ROW
    BEGIN
        UPDATE social_media_posts
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_social_templates_timestamp
    AFTER UPDATE ON social_media_content_templates
    FOR EACH ROW
    BEGIN
        UPDATE social_media_content_templates
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

-- Views for common reporting queries

-- Professional Social Media Overview
CREATE VIEW IF NOT EXISTS social_media_professional_overview AS
SELECT
    p.professional_id,
    COUNT(DISTINCT a.account_id) as connected_accounts,
    GROUP_CONCAT(DISTINCT a.platform) as platforms,
    SUM(a.follower_count) as total_followers,
    COUNT(DISTINCT posts.post_id) as total_posts,
    COUNT(DISTINCT CASE WHEN posts.status = 'posted' THEN posts.post_id END) as published_posts,
    AVG(CASE WHEN posts.engagement_stats_json IS NOT NULL THEN
        JSON_EXTRACT(posts.engagement_stats_json, '$.engagement_rate') END) as avg_engagement_rate,
    MAX(posts.posted_at) as last_post_date,
    AVG(cc.score) as avg_compliance_score
FROM social_media_accounts a
LEFT JOIN social_media_posts posts ON a.account_id = posts.account_id
LEFT JOIN social_media_compliance_checks cc ON posts.post_id = cc.post_id
WHERE a.active = 1
GROUP BY a.professional_id;

-- Content Performance Summary
CREATE VIEW IF NOT EXISTS social_media_content_performance AS
SELECT
    posts.platform,
    posts.content_type,
    posts.content_category,
    COUNT(*) as post_count,
    AVG(JSON_EXTRACT(posts.engagement_stats_json, '$.likes')) as avg_likes,
    AVG(JSON_EXTRACT(posts.engagement_stats_json, '$.comments')) as avg_comments,
    AVG(JSON_EXTRACT(posts.engagement_stats_json, '$.shares')) as avg_shares,
    AVG(JSON_EXTRACT(posts.engagement_stats_json, '$.engagement_rate')) as avg_engagement_rate,
    AVG(posts.performance_score) as avg_performance_score
FROM social_media_posts posts
WHERE posts.status = 'posted'
AND posts.engagement_stats_json IS NOT NULL
GROUP BY posts.platform, posts.content_type, posts.content_category
ORDER BY avg_engagement_rate DESC;

-- Compliance Summary
CREATE VIEW IF NOT EXISTS social_media_compliance_summary AS
SELECT
    DATE(cc.checked_at) as check_date,
    cc.check_type,
    COUNT(*) as total_checks,
    COUNT(CASE WHEN cc.status = 'passed' THEN 1 END) as passed_checks,
    COUNT(CASE WHEN cc.status = 'failed' THEN 1 END) as failed_checks,
    COUNT(CASE WHEN cc.manual_review_required = 1 THEN 1 END) as manual_review_required,
    AVG(cc.score) as average_score,
    COUNT(CASE WHEN cc.patient_privacy_violation = 1 THEN 1 END) as privacy_violations,
    COUNT(CASE WHEN cc.medical_advice_detected = 1 THEN 1 END) as medical_advice_detected
FROM social_media_compliance_checks cc
GROUP BY DATE(cc.checked_at), cc.check_type
ORDER BY check_date DESC, cc.check_type;

-- Platform Analytics Overview
CREATE VIEW IF NOT EXISTS social_media_platform_analytics AS
SELECT
    a.platform,
    COUNT(DISTINCT a.account_id) as active_accounts,
    SUM(a.follower_count) as total_followers,
    COUNT(DISTINCT p.post_id) as total_posts,
    AVG(ana.average_engagement_rate) as platform_avg_engagement,
    AVG(ana.professional_brand_score) as avg_brand_score,
    SUM(ana.total_engagement) as total_platform_engagement,
    MAX(ana.generated_at) as last_analytics_update
FROM social_media_accounts a
LEFT JOIN social_media_posts p ON a.account_id = p.account_id
LEFT JOIN social_media_analytics ana ON a.account_id = ana.account_id
WHERE a.active = 1
GROUP BY a.platform
ORDER BY total_platform_engagement DESC;

-- Insert sample content templates for healthcare professionals
INSERT OR IGNORE INTO social_media_content_templates (
    id, template_id, template_name, category, template_content,
    hashtags_json, platforms_json, professional_specialties_json,
    compliance_approved, created_by
) VALUES
(
    'template-001',
    'mental-health-awareness-1',
    'Mental Health Awareness - General',
    'educational',
    'Mental health is just as important as physical health. Taking care of your emotional well-being should be a priority, not an afterthought. Remember: seeking help is a sign of strength, not weakness. 💚

    What small step will you take today for your mental wellness?',
    '["#MentalHealthAwareness", "#WellnessWednesday", "#MentalHealthMatters", "#SelfCare", "#EmotionalWellbeing"]',
    '["linkedin", "facebook", "instagram"]',
    '["psychology", "psychiatry", "counseling", "social_work", "mental_health"]',
    1,
    'system'
),
(
    'template-002',
    'professional-development-1',
    'Professional Development - Continuing Education',
    'professional_development',
    'Continuous learning is the cornerstone of excellent patient care. Just attended an inspiring conference on [TOPIC]. The evolution of healthcare practices reminds us why staying current with research and best practices is so crucial.

    Fellow healthcare professionals: What recent learning has impacted your practice the most?',
    '["#HealthcareProfessional", "#ContinuingEducation", "#ProfessionalDevelopment", "#HealthcareInnovation", "#LearningNeverStops"]',
    '["linkedin", "facebook"]',
    '["all_specialties"]',
    1,
    'system'
),
(
    'template-003',
    'patient-education-1',
    'Patient Education - Preventive Care',
    'educational',
    'Prevention is always better than cure. Simple daily habits can make a significant difference in your long-term health:

    ✅ Regular check-ups
    ✅ Balanced nutrition
    ✅ Physical activity
    ✅ Adequate sleep
    ✅ Stress management

    Small changes today, healthier tomorrow. What preventive step are you focusing on this week?',
    '["#PreventiveCare", "#HealthyLiving", "#WellnessTips", "#HealthEducation", "#PatientCare"]',
    '["linkedin", "facebook", "instagram"]',
    '["family_medicine", "internal_medicine", "preventive_medicine", "public_health"]',
    1,
    'system'
);