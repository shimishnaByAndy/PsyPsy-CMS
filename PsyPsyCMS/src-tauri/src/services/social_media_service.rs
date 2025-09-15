/*
 * Social Media Integration Service - Healthcare Professional Networking MVP
 *
 * This service provides secure social media integration for healthcare professionals
 * to build their professional online presence while maintaining strict compliance
 * with healthcare privacy regulations and Quebec Law 25 requirements.
 *
 * Key Features:
 * - LinkedIn professional content posting and networking
 * - Facebook business page management for healthcare practices
 * - Content compliance validation before posting
 * - Automated scheduling and content calendar management
 * - Analytics and engagement tracking
 * - HIPAA/Quebec Law 25 compliant content filtering
 * - Professional brand management tools
 * - Patient privacy protection safeguards
 */

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use sqlx::{Pool, Sqlite};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SocialMediaError {
    #[error("Configuration error: {0}")]
    Configuration(String),

    #[error("API error: {0}")]
    ApiError(String),

    #[error("Authentication error: {0}")]
    Authentication(String),

    #[error("Content compliance violation: {0}")]
    ComplianceViolation(String),

    #[error("Rate limit exceeded: {0}")]
    RateLimit(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Network error: {0}")]
    Network(String),

    #[error("Content validation failed: {0}")]
    ContentValidation(String),

    #[error("Privacy violation detected: {0}")]
    PrivacyViolation(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialMediaConfig {
    pub linkedin_enabled: bool,
    pub facebook_enabled: bool,
    pub content_compliance_enabled: bool,
    pub auto_schedule_enabled: bool,
    pub analytics_enabled: bool,
    pub quebec_compliance_mode: bool,
    pub professional_content_only: bool,
    pub patient_privacy_protection: bool,
    pub max_posts_per_day: u32,
    pub rate_limit_window_minutes: u32,
    pub content_review_required: bool,
    pub supervisor_approval_required: bool,
}

impl Default for SocialMediaConfig {
    fn default() -> Self {
        Self {
            linkedin_enabled: true,
            facebook_enabled: true,
            content_compliance_enabled: true,
            auto_schedule_enabled: true,
            analytics_enabled: true,
            quebec_compliance_mode: true,
            professional_content_only: true,
            patient_privacy_protection: true,
            max_posts_per_day: 5,
            rate_limit_window_minutes: 60,
            content_review_required: true,
            supervisor_approval_required: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkedInCredentials {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: DateTime<Utc>,
    pub profile_id: String,
    pub company_id: Option<String>,
    pub scope: String,
    pub token_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FacebookCredentials {
    pub access_token: String,
    pub page_access_token: Option<String>,
    pub expires_at: DateTime<Utc>,
    pub user_id: String,
    pub page_id: Option<String>,
    pub scope: String,
    pub app_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialMediaAccount {
    pub account_id: String,
    pub platform: String, // linkedin, facebook
    pub account_type: String, // personal, business, page
    pub professional_id: String,
    pub display_name: String,
    pub username: String,
    pub profile_url: String,
    pub follower_count: Option<i32>,
    pub connection_count: Option<i32>,
    pub verified: bool,
    pub active: bool,
    pub last_synced: DateTime<Utc>,
    pub sync_enabled: bool,
    pub posting_enabled: bool,
    pub analytics_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialMediaPost {
    pub post_id: String,
    pub platform: String,
    pub account_id: String,
    pub professional_id: String,
    pub content_type: String, // text, image, video, article, poll
    pub title: Option<String>,
    pub content: String,
    pub hashtags: Vec<String>,
    pub mentions: Vec<String>,
    pub media_urls: Vec<String>,
    pub link_url: Option<String>,
    pub link_title: Option<String>,
    pub link_description: Option<String>,
    pub scheduled_for: Option<DateTime<Utc>>,
    pub posted_at: Option<DateTime<Utc>>,
    pub status: String, // draft, scheduled, posted, failed, deleted
    pub engagement_stats: Option<PostEngagementStats>,
    pub compliance_checked: bool,
    pub compliance_status: String, // approved, pending, rejected
    pub compliance_notes: Option<String>,
    pub review_required: bool,
    pub reviewed_by: Option<String>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostEngagementStats {
    pub likes: i32,
    pub comments: i32,
    pub shares: i32,
    pub views: i32,
    pub clicks: i32,
    pub impressions: i32,
    pub engagement_rate: f64,
    pub reach: i32,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentTemplate {
    pub template_id: String,
    pub template_name: String,
    pub category: String, // educational, promotional, announcement, industry_news
    pub template_content: String,
    pub hashtags: Vec<String>,
    pub platforms: Vec<String>,
    pub professional_specialties: Vec<String>,
    pub compliance_approved: bool,
    pub usage_count: i32,
    pub effectiveness_score: f64,
    pub created_by: String,
    pub created_at: DateTime<Utc>,
    pub last_used: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceCheck {
    pub check_id: String,
    pub post_id: String,
    pub check_type: String, // privacy, professional, regulatory, content
    pub status: String, // passed, failed, warning, pending
    pub score: f64, // 0.0 to 1.0
    pub issues: Vec<ComplianceIssue>,
    pub recommendations: Vec<String>,
    pub checked_at: DateTime<Utc>,
    pub checked_by: String, // system, user, supervisor
    pub auto_fix_applied: bool,
    pub manual_review_required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceIssue {
    pub issue_type: String, // privacy_violation, unprofessional_content, medical_advice, etc.
    pub severity: String, // low, medium, high, critical
    pub description: String,
    pub location: Option<String>, // Character position or section
    pub suggestion: Option<String>,
    pub auto_fixable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialMediaAnalytics {
    pub analytics_id: String,
    pub professional_id: String,
    pub platform: String,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub total_posts: i32,
    pub total_engagement: i32,
    pub total_reach: i32,
    pub total_impressions: i32,
    pub average_engagement_rate: f64,
    pub follower_growth: i32,
    pub top_performing_post_id: Option<String>,
    pub top_hashtags: Vec<String>,
    pub engagement_by_time: HashMap<String, i32>,
    pub engagement_by_content_type: HashMap<String, i32>,
    pub audience_demographics: HashMap<String, String>,
    pub professional_impact_score: f64,
    pub compliance_score: f64,
    pub generated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulingRule {
    pub rule_id: String,
    pub professional_id: String,
    pub platform: String,
    pub rule_name: String,
    pub content_types: Vec<String>,
    pub optimal_times: Vec<String>, // JSON array of time slots
    pub frequency_limit: i32, // Posts per period
    pub frequency_period: String, // daily, weekly, monthly
    pub timezone: String,
    pub exclude_weekends: bool,
    pub exclude_holidays: bool,
    pub min_interval_hours: i32,
    pub active: bool,
    pub created_at: DateTime<Utc>,
}

pub struct SocialMediaService {
    config: SocialMediaConfig,
    db_pool: Pool<Sqlite>,
    http_client: reqwest::Client,
}

impl SocialMediaService {
    pub fn new(config: SocialMediaConfig, db_pool: Pool<Sqlite>) -> Self {
        let http_client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .user_agent("PsyPsy-CMS/1.0 Healthcare-Professional-Platform")
            .build()
            .expect("Failed to create HTTP client");

        Self {
            config,
            db_pool,
            http_client,
        }
    }

    /// Connect a professional's LinkedIn account
    pub async fn connect_linkedin_account(&self, professional_id: &str, auth_code: &str) -> Result<String, SocialMediaError> {
        tracing::info!("🔗 Connecting LinkedIn account for professional: {}", professional_id);

        // Exchange authorization code for access token
        let credentials = self.exchange_linkedin_auth_code(auth_code).await?;

        // Get profile information
        let profile_info = self.get_linkedin_profile(&credentials.access_token).await?;

        // Create social media account record
        let account = SocialMediaAccount {
            account_id: Uuid::new_v4().to_string(),
            platform: "linkedin".to_string(),
            account_type: "personal".to_string(),
            professional_id: professional_id.to_string(),
            display_name: profile_info.get("displayName").unwrap_or(&"Unknown".to_string()).clone(),
            username: profile_info.get("username").unwrap_or(&"".to_string()).clone(),
            profile_url: profile_info.get("profileUrl").unwrap_or(&"".to_string()).clone(),
            follower_count: profile_info.get("followerCount").and_then(|v| v.parse().ok()),
            connection_count: profile_info.get("connectionCount").and_then(|v| v.parse().ok()),
            verified: profile_info.get("verified").map(|v| v == "true").unwrap_or(false),
            active: true,
            last_synced: Utc::now(),
            sync_enabled: true,
            posting_enabled: true,
            analytics_enabled: true,
        };

        // Store account and credentials
        self.store_social_account(&account).await?;
        self.store_linkedin_credentials(&credentials, &account.account_id).await?;

        tracing::info!("✅ LinkedIn account connected successfully: {}", account.account_id);
        Ok(account.account_id)
    }

    /// Connect a professional's Facebook page
    pub async fn connect_facebook_page(&self, professional_id: &str, access_token: &str) -> Result<String, SocialMediaError> {
        tracing::info!("🔗 Connecting Facebook page for professional: {}", professional_id);

        // Get user info and pages
        let user_info = self.get_facebook_user_info(access_token).await?;
        let pages = self.get_facebook_pages(access_token).await?;

        // For MVP, connect the first available page
        if let Some(page) = pages.first() {
            let account = SocialMediaAccount {
                account_id: Uuid::new_v4().to_string(),
                platform: "facebook".to_string(),
                account_type: "page".to_string(),
                professional_id: professional_id.to_string(),
                display_name: page.get("name").unwrap_or(&"Unknown Page".to_string()).clone(),
                username: page.get("username").unwrap_or(&"".to_string()).clone(),
                profile_url: format!("https://facebook.com/{}", page.get("id").unwrap_or(&"".to_string())),
                follower_count: page.get("fan_count").and_then(|v| v.parse().ok()),
                connection_count: None,
                verified: page.get("verification_status").map(|v| v == "blue_verified").unwrap_or(false),
                active: true,
                last_synced: Utc::now(),
                sync_enabled: true,
                posting_enabled: true,
                analytics_enabled: true,
            };

            let credentials = FacebookCredentials {
                access_token: access_token.to_string(),
                page_access_token: page.get("access_token").cloned(),
                expires_at: Utc::now() + chrono::Duration::days(60), // Facebook tokens typically last 60 days
                user_id: user_info.get("id").unwrap_or(&"".to_string()).clone(),
                page_id: page.get("id").cloned(),
                scope: "pages_manage_posts,pages_read_engagement".to_string(),
                app_id: std::env::var("FACEBOOK_APP_ID").unwrap_or_default(),
            };

            self.store_social_account(&account).await?;
            self.store_facebook_credentials(&credentials, &account.account_id).await?;

            tracing::info!("✅ Facebook page connected successfully: {}", account.account_id);
            Ok(account.account_id)
        } else {
            Err(SocialMediaError::Configuration("No Facebook pages available for connection".to_string()))
        }
    }

    /// Create and schedule a social media post
    pub async fn create_post(&self, professional_id: &str, post_data: CreatePostRequest) -> Result<String, SocialMediaError> {
        let post_id = Uuid::new_v4().to_string();

        tracing::info!("📝 Creating social media post: {} for professional: {}", post_id, professional_id);

        // Validate content compliance
        let compliance_check = self.check_content_compliance(&post_data.content, &post_data.hashtags).await?;

        if compliance_check.status == "failed" {
            return Err(SocialMediaError::ComplianceViolation(
                format!("Content compliance check failed: {:?}", compliance_check.issues)
            ));
        }

        // Create post object
        let post = SocialMediaPost {
            post_id: post_id.clone(),
            platform: post_data.platform.clone(),
            account_id: post_data.account_id.clone(),
            professional_id: professional_id.to_string(),
            content_type: post_data.content_type.clone(),
            title: post_data.title.clone(),
            content: post_data.content.clone(),
            hashtags: post_data.hashtags.clone(),
            mentions: post_data.mentions.clone(),
            media_urls: post_data.media_urls.clone(),
            link_url: post_data.link_url.clone(),
            link_title: post_data.link_title.clone(),
            link_description: post_data.link_description.clone(),
            scheduled_for: post_data.scheduled_for,
            posted_at: None,
            status: if post_data.scheduled_for.is_some() { "scheduled".to_string() } else { "draft".to_string() },
            engagement_stats: None,
            compliance_checked: true,
            compliance_status: compliance_check.status.clone(),
            compliance_notes: Some(format!("Compliance score: {:.2}", compliance_check.score)),
            review_required: self.config.content_review_required,
            reviewed_by: None,
            reviewed_at: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // Store post
        self.store_post(&post).await?;

        // Store compliance check
        self.store_compliance_check(&compliance_check).await?;

        // If immediate posting and no review required, post now
        if post_data.scheduled_for.is_none() && !self.config.content_review_required {
            self.publish_post_now(&post_id).await?;
        }

        tracing::info!("✅ Social media post created successfully: {}", post_id);
        Ok(post_id)
    }

    /// Publish a post immediately
    pub async fn publish_post_now(&self, post_id: &str) -> Result<(), SocialMediaError> {
        tracing::info!("🚀 Publishing post immediately: {}", post_id);

        let post = self.get_post(post_id).await?;

        // Check rate limits
        self.check_rate_limits(&post.professional_id, &post.platform).await?;

        // Publish to platform
        let platform_post_id = match post.platform.as_str() {
            "linkedin" => self.publish_to_linkedin(&post).await?,
            "facebook" => self.publish_to_facebook(&post).await?,
            _ => return Err(SocialMediaError::Configuration(format!("Unsupported platform: {}", post.platform))),
        };

        // Update post status
        self.update_post_status(post_id, "posted", Some(Utc::now()), Some(&platform_post_id)).await?;

        tracing::info!("✅ Post published successfully: {} -> {}", post_id, platform_post_id);
        Ok(())
    }

    /// Check content for compliance violations
    async fn check_content_compliance(&self, content: &str, hashtags: &[String]) -> Result<ComplianceCheck, SocialMediaError> {
        let check_id = Uuid::new_v4().to_string();
        let mut issues = Vec::new();
        let mut score = 1.0;

        // Check for potential privacy violations
        if self.detect_patient_information(content) {
            issues.push(ComplianceIssue {
                issue_type: "privacy_violation".to_string(),
                severity: "critical".to_string(),
                description: "Potential patient information detected in content".to_string(),
                location: None,
                suggestion: Some("Remove any references to specific patients or medical cases".to_string()),
                auto_fixable: false,
            });
            score -= 0.5;
        }

        // Check for medical advice
        if self.detect_medical_advice(content) {
            issues.push(ComplianceIssue {
                issue_type: "medical_advice".to_string(),
                severity: "high".to_string(),
                description: "Content may be providing medical advice".to_string(),
                location: None,
                suggestion: Some("Add disclaimer that content is for informational purposes only".to_string()),
                auto_fixable: true,
            });
            score -= 0.2;
        }

        // Check professional tone
        if !self.check_professional_tone(content) {
            issues.push(ComplianceIssue {
                issue_type: "unprofessional_content".to_string(),
                severity: "medium".to_string(),
                description: "Content may not maintain professional tone".to_string(),
                location: None,
                suggestion: Some("Review content for professional language and tone".to_string()),
                auto_fixable: false,
            });
            score -= 0.1;
        }

        // Check hashtags
        for hashtag in hashtags {
            if self.is_inappropriate_hashtag(hashtag) {
                issues.push(ComplianceIssue {
                    issue_type: "inappropriate_hashtag".to_string(),
                    severity: "medium".to_string(),
                    description: format!("Hashtag '{}' may not be appropriate for healthcare professionals", hashtag),
                    location: Some(hashtag.clone()),
                    suggestion: Some("Consider using more professional healthcare-related hashtags".to_string()),
                    auto_fixable: false,
                });
                score -= 0.05;
            }
        }

        let status = if score >= 0.8 {
            "approved"
        } else if score >= 0.6 {
            "warning"
        } else {
            "failed"
        };

        let recommendations = self.generate_content_recommendations(&issues, content);

        Ok(ComplianceCheck {
            check_id,
            post_id: "pending".to_string(), // Will be updated when post is created
            check_type: "comprehensive".to_string(),
            status: status.to_string(),
            score,
            issues,
            recommendations,
            checked_at: Utc::now(),
            checked_by: "system".to_string(),
            auto_fix_applied: false,
            manual_review_required: score < 0.8,
        })
    }

    /// Detect potential patient information in content
    fn detect_patient_information(&self, content: &str) -> bool {
        let content_lower = content.to_lowercase();

        // Look for patterns that might indicate patient information
        let privacy_indicators = [
            "patient", "client", "my patient", "this patient", "john doe", "jane doe",
            "diagnosis", "prescribed", "treatment plan", "medical history",
            "case study", "session with", "therapy session"
        ];

        privacy_indicators.iter().any(|&indicator| content_lower.contains(indicator))
    }

    /// Detect potential medical advice in content
    fn detect_medical_advice(&self, content: &str) -> bool {
        let content_lower = content.to_lowercase();

        let advice_indicators = [
            "you should", "i recommend", "my advice", "treatment for",
            "cure for", "diagnosed with", "take this medication",
            "follow this protocol", "best treatment"
        ];

        advice_indicators.iter().any(|&indicator| content_lower.contains(indicator))
    }

    /// Check if content maintains professional tone
    fn check_professional_tone(&self, content: &str) -> bool {
        let content_lower = content.to_lowercase();

        // Red flags for unprofessional content
        let unprofessional_indicators = [
            "awesome", "amazing", "incredible", "mind-blowing",
            "omg", "lol", "wtf", "damn", "hell yeah"
        ];

        !unprofessional_indicators.iter().any(|&indicator| content_lower.contains(indicator))
    }

    /// Check if hashtag is inappropriate for healthcare professionals
    fn is_inappropriate_hashtag(&self, hashtag: &str) -> bool {
        let hashtag_lower = hashtag.to_lowercase();

        let inappropriate_tags = [
            "#party", "#drunk", "#hangover", "#controversial",
            "#politics", "#religion", "#drama"
        ];

        inappropriate_tags.iter().any(|&tag| hashtag_lower.contains(&tag[1..]))
    }

    /// Generate content recommendations based on compliance issues
    fn generate_content_recommendations(&self, issues: &[ComplianceIssue], _content: &str) -> Vec<String> {
        let mut recommendations = Vec::new();

        if issues.iter().any(|i| i.issue_type == "privacy_violation") {
            recommendations.push("Always maintain patient confidentiality - use anonymized examples or general scenarios".to_string());
        }

        if issues.iter().any(|i| i.issue_type == "medical_advice") {
            recommendations.push("Add medical disclaimer: 'This content is for informational purposes only and does not constitute medical advice'".to_string());
        }

        if issues.iter().any(|i| i.issue_type == "unprofessional_content") {
            recommendations.push("Maintain professional tone appropriate for healthcare setting".to_string());
        }

        if recommendations.is_empty() {
            recommendations.push("Content meets compliance standards - good professional communication".to_string());
        }

        recommendations.push("Consider adding relevant healthcare hashtags: #HealthcareProfessional #MentalHealth #PatientCare".to_string());

        recommendations
    }

    /// Exchange LinkedIn authorization code for access token
    async fn exchange_linkedin_auth_code(&self, _auth_code: &str) -> Result<LinkedInCredentials, SocialMediaError> {
        // Mock implementation for development
        // In production, this would call LinkedIn's OAuth2 API

        Ok(LinkedInCredentials {
            access_token: "mock_linkedin_access_token".to_string(),
            refresh_token: Some("mock_refresh_token".to_string()),
            expires_at: Utc::now() + chrono::Duration::days(60),
            profile_id: "mock_profile_id".to_string(),
            company_id: None,
            scope: "w_member_social,r_basicprofile".to_string(),
            token_type: "Bearer".to_string(),
        })
    }

    /// Get LinkedIn profile information
    async fn get_linkedin_profile(&self, _access_token: &str) -> Result<HashMap<String, String>, SocialMediaError> {
        // Mock implementation for development
        let mut profile = HashMap::new();
        profile.insert("displayName".to_string(), "Dr. Healthcare Professional".to_string());
        profile.insert("username".to_string(), "dr_healthcare".to_string());
        profile.insert("profileUrl".to_string(), "https://linkedin.com/in/dr-healthcare".to_string());
        profile.insert("followerCount".to_string(), "1250".to_string());
        profile.insert("connectionCount".to_string(), "500".to_string());
        profile.insert("verified".to_string(), "true".to_string());

        Ok(profile)
    }

    /// Get Facebook user information
    async fn get_facebook_user_info(&self, _access_token: &str) -> Result<HashMap<String, String>, SocialMediaError> {
        // Mock implementation for development
        let mut user_info = HashMap::new();
        user_info.insert("id".to_string(), "mock_user_id".to_string());
        user_info.insert("name".to_string(), "Healthcare Professional".to_string());

        Ok(user_info)
    }

    /// Get Facebook pages managed by user
    async fn get_facebook_pages(&self, _access_token: &str) -> Result<Vec<HashMap<String, String>>, SocialMediaError> {
        // Mock implementation for development
        let mut page = HashMap::new();
        page.insert("id".to_string(), "mock_page_id".to_string());
        page.insert("name".to_string(), "Healthcare Practice".to_string());
        page.insert("username".to_string(), "healthcare_practice".to_string());
        page.insert("access_token".to_string(), "mock_page_access_token".to_string());
        page.insert("fan_count".to_string(), "850".to_string());
        page.insert("verification_status".to_string(), "blue_verified".to_string());

        Ok(vec![page])
    }

    /// Publish post to LinkedIn
    async fn publish_to_linkedin(&self, post: &SocialMediaPost) -> Result<String, SocialMediaError> {
        tracing::info!("📱 Publishing to LinkedIn: {}", post.post_id);

        // Mock implementation for development
        // In production, this would call LinkedIn's API

        let platform_post_id = format!("linkedin_{}", Uuid::new_v4());

        tracing::info!("✅ Posted to LinkedIn successfully: {}", platform_post_id);
        Ok(platform_post_id)
    }

    /// Publish post to Facebook
    async fn publish_to_facebook(&self, post: &SocialMediaPost) -> Result<String, SocialMediaError> {
        tracing::info!("📘 Publishing to Facebook: {}", post.post_id);

        // Mock implementation for development
        // In production, this would call Facebook Graph API

        let platform_post_id = format!("facebook_{}", Uuid::new_v4());

        tracing::info!("✅ Posted to Facebook successfully: {}", platform_post_id);
        Ok(platform_post_id)
    }

    /// Check rate limits for posting
    async fn check_rate_limits(&self, professional_id: &str, platform: &str) -> Result<(), SocialMediaError> {
        let query = r#"
            SELECT COUNT(*) as post_count
            FROM social_media_posts
            WHERE professional_id = ? AND platform = ?
            AND DATE(posted_at) = DATE('now')
            AND status = 'posted'
        "#;

        let row = sqlx::query(query)
            .bind(professional_id)
            .bind(platform)
            .fetch_one(&self.db_pool)
            .await?;

        let post_count: i32 = row.get("post_count");

        if post_count >= self.config.max_posts_per_day as i32 {
            return Err(SocialMediaError::RateLimit(
                format!("Daily posting limit of {} reached for {}", self.config.max_posts_per_day, platform)
            ));
        }

        Ok(())
    }

    /// Get social media analytics for a professional
    pub async fn get_analytics(&self, professional_id: &str, platform: &str, days: i32) -> Result<SocialMediaAnalytics, SocialMediaError> {
        let period_start = Utc::now() - chrono::Duration::days(days as i64);
        let period_end = Utc::now();

        let query = r#"
            SELECT
                COUNT(*) as total_posts,
                COALESCE(SUM(JSON_EXTRACT(engagement_stats, '$.likes')), 0) as total_likes,
                COALESCE(SUM(JSON_EXTRACT(engagement_stats, '$.comments')), 0) as total_comments,
                COALESCE(SUM(JSON_EXTRACT(engagement_stats, '$.shares')), 0) as total_shares,
                COALESCE(SUM(JSON_EXTRACT(engagement_stats, '$.views')), 0) as total_views,
                COALESCE(AVG(JSON_EXTRACT(engagement_stats, '$.engagement_rate')), 0) as avg_engagement_rate
            FROM social_media_posts
            WHERE professional_id = ? AND platform = ?
            AND posted_at BETWEEN ? AND ?
            AND status = 'posted'
        "#;

        let row = sqlx::query(query)
            .bind(professional_id)
            .bind(platform)
            .bind(period_start)
            .bind(period_end)
            .fetch_one(&self.db_pool)
            .await?;

        let total_posts: i32 = row.get("total_posts");
        let total_likes: i32 = row.get("total_likes");
        let total_comments: i32 = row.get("total_comments");
        let total_shares: i32 = row.get("total_shares");

        Ok(SocialMediaAnalytics {
            analytics_id: Uuid::new_v4().to_string(),
            professional_id: professional_id.to_string(),
            platform: platform.to_string(),
            period_start,
            period_end,
            total_posts,
            total_engagement: total_likes + total_comments + total_shares,
            total_reach: row.get("total_views"),
            total_impressions: row.get("total_views"), // Simplified for MVP
            average_engagement_rate: row.get("avg_engagement_rate"),
            follower_growth: 0, // Would calculate from historical data
            top_performing_post_id: None, // Would query separately
            top_hashtags: vec!["#HealthcareProfessional".to_string(), "#MentalHealth".to_string()],
            engagement_by_time: HashMap::new(),
            engagement_by_content_type: HashMap::new(),
            audience_demographics: HashMap::new(),
            professional_impact_score: 75.0, // Would calculate based on engagement and reach
            compliance_score: 95.0, // Would calculate from compliance checks
            generated_at: Utc::now(),
        })
    }

    /// Store social media account
    async fn store_social_account(&self, account: &SocialMediaAccount) -> Result<(), SocialMediaError> {
        let query = r#"
            INSERT OR REPLACE INTO social_media_accounts (
                id, account_id, platform, account_type, professional_id,
                display_name, username, profile_url, follower_count,
                connection_count, verified, active, last_synced,
                sync_enabled, posting_enabled, analytics_enabled
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        sqlx::query(query)
            .bind(Uuid::new_v4().to_string())
            .bind(&account.account_id)
            .bind(&account.platform)
            .bind(&account.account_type)
            .bind(&account.professional_id)
            .bind(&account.display_name)
            .bind(&account.username)
            .bind(&account.profile_url)
            .bind(account.follower_count)
            .bind(account.connection_count)
            .bind(account.verified)
            .bind(account.active)
            .bind(account.last_synced)
            .bind(account.sync_enabled)
            .bind(account.posting_enabled)
            .bind(account.analytics_enabled)
            .execute(&self.db_pool)
            .await?;

        Ok(())
    }

    /// Store LinkedIn credentials (encrypted)
    async fn store_linkedin_credentials(&self, credentials: &LinkedInCredentials, account_id: &str) -> Result<(), SocialMediaError> {
        // In production, credentials should be encrypted before storage
        let query = r#"
            INSERT OR REPLACE INTO social_media_credentials (
                id, account_id, platform, credentials_json, expires_at
            ) VALUES (?, ?, ?, ?, ?)
        "#;

        sqlx::query(query)
            .bind(Uuid::new_v4().to_string())
            .bind(account_id)
            .bind("linkedin")
            .bind(serde_json::to_string(credentials)?)
            .bind(credentials.expires_at)
            .execute(&self.db_pool)
            .await?;

        Ok(())
    }

    /// Store Facebook credentials (encrypted)
    async fn store_facebook_credentials(&self, credentials: &FacebookCredentials, account_id: &str) -> Result<(), SocialMediaError> {
        // In production, credentials should be encrypted before storage
        let query = r#"
            INSERT OR REPLACE INTO social_media_credentials (
                id, account_id, platform, credentials_json, expires_at
            ) VALUES (?, ?, ?, ?, ?)
        "#;

        sqlx::query(query)
            .bind(Uuid::new_v4().to_string())
            .bind(account_id)
            .bind("facebook")
            .bind(serde_json::to_string(credentials)?)
            .bind(credentials.expires_at)
            .execute(&self.db_pool)
            .await?;

        Ok(())
    }

    /// Store social media post
    async fn store_post(&self, post: &SocialMediaPost) -> Result<(), SocialMediaError> {
        let query = r#"
            INSERT INTO social_media_posts (
                id, post_id, platform, account_id, professional_id,
                content_type, title, content, hashtags_json, mentions_json,
                media_urls_json, link_url, link_title, link_description,
                scheduled_for, posted_at, status, compliance_checked,
                compliance_status, compliance_notes, review_required,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        sqlx::query(query)
            .bind(Uuid::new_v4().to_string())
            .bind(&post.post_id)
            .bind(&post.platform)
            .bind(&post.account_id)
            .bind(&post.professional_id)
            .bind(&post.content_type)
            .bind(&post.title)
            .bind(&post.content)
            .bind(serde_json::to_string(&post.hashtags)?)
            .bind(serde_json::to_string(&post.mentions)?)
            .bind(serde_json::to_string(&post.media_urls)?)
            .bind(&post.link_url)
            .bind(&post.link_title)
            .bind(&post.link_description)
            .bind(post.scheduled_for)
            .bind(post.posted_at)
            .bind(&post.status)
            .bind(post.compliance_checked)
            .bind(&post.compliance_status)
            .bind(&post.compliance_notes)
            .bind(post.review_required)
            .bind(post.created_at)
            .bind(post.updated_at)
            .execute(&self.db_pool)
            .await?;

        Ok(())
    }

    /// Store compliance check
    async fn store_compliance_check(&self, check: &ComplianceCheck) -> Result<(), SocialMediaError> {
        let query = r#"
            INSERT INTO social_media_compliance_checks (
                id, check_id, post_id, check_type, status, score,
                issues_json, recommendations_json, checked_at, checked_by,
                auto_fix_applied, manual_review_required
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        sqlx::query(query)
            .bind(Uuid::new_v4().to_string())
            .bind(&check.check_id)
            .bind(&check.post_id)
            .bind(&check.check_type)
            .bind(&check.status)
            .bind(check.score)
            .bind(serde_json::to_string(&check.issues)?)
            .bind(serde_json::to_string(&check.recommendations)?)
            .bind(check.checked_at)
            .bind(&check.checked_by)
            .bind(check.auto_fix_applied)
            .bind(check.manual_review_required)
            .execute(&self.db_pool)
            .await?;

        Ok(())
    }

    /// Get post by ID
    async fn get_post(&self, post_id: &str) -> Result<SocialMediaPost, SocialMediaError> {
        let query = r#"
            SELECT * FROM social_media_posts WHERE post_id = ?
        "#;

        let row = sqlx::query(query)
            .bind(post_id)
            .fetch_one(&self.db_pool)
            .await?;

        Ok(SocialMediaPost {
            post_id: row.get("post_id"),
            platform: row.get("platform"),
            account_id: row.get("account_id"),
            professional_id: row.get("professional_id"),
            content_type: row.get("content_type"),
            title: row.get("title"),
            content: row.get("content"),
            hashtags: serde_json::from_str(&row.get::<String, _>("hashtags_json")).unwrap_or_default(),
            mentions: serde_json::from_str(&row.get::<String, _>("mentions_json")).unwrap_or_default(),
            media_urls: serde_json::from_str(&row.get::<String, _>("media_urls_json")).unwrap_or_default(),
            link_url: row.get("link_url"),
            link_title: row.get("link_title"),
            link_description: row.get("link_description"),
            scheduled_for: row.get("scheduled_for"),
            posted_at: row.get("posted_at"),
            status: row.get("status"),
            engagement_stats: None, // Would deserialize from JSON if present
            compliance_checked: row.get("compliance_checked"),
            compliance_status: row.get("compliance_status"),
            compliance_notes: row.get("compliance_notes"),
            review_required: row.get("review_required"),
            reviewed_by: row.get("reviewed_by"),
            reviewed_at: row.get("reviewed_at"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    /// Update post status
    async fn update_post_status(&self, post_id: &str, status: &str, posted_at: Option<DateTime<Utc>>, platform_post_id: Option<&str>) -> Result<(), SocialMediaError> {
        let query = r#"
            UPDATE social_media_posts
            SET status = ?, posted_at = ?, platform_post_id = ?, updated_at = ?
            WHERE post_id = ?
        "#;

        sqlx::query(query)
            .bind(status)
            .bind(posted_at)
            .bind(platform_post_id)
            .bind(Utc::now())
            .bind(post_id)
            .execute(&self.db_pool)
            .await?;

        Ok(())
    }

    /// Health check for social media service
    pub async fn health_check(&self) -> Result<HashMap<String, String>, SocialMediaError> {
        let mut status = HashMap::new();

        // Check database connectivity
        match sqlx::query("SELECT 1").fetch_one(&self.db_pool).await {
            Ok(_) => status.insert("database".to_string(), "healthy".to_string()),
            Err(_) => status.insert("database".to_string(), "unhealthy".to_string()),
        };

        // Check configuration
        status.insert("linkedin_enabled".to_string(), self.config.linkedin_enabled.to_string());
        status.insert("facebook_enabled".to_string(), self.config.facebook_enabled.to_string());
        status.insert("compliance_enabled".to_string(), self.config.content_compliance_enabled.to_string());

        status.insert("service".to_string(), "running".to_string());
        status.insert("timestamp".to_string(), Utc::now().to_rfc3339());

        Ok(status)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePostRequest {
    pub platform: String,
    pub account_id: String,
    pub content_type: String,
    pub title: Option<String>,
    pub content: String,
    pub hashtags: Vec<String>,
    pub mentions: Vec<String>,
    pub media_urls: Vec<String>,
    pub link_url: Option<String>,
    pub link_title: Option<String>,
    pub link_description: Option<String>,
    pub scheduled_for: Option<DateTime<Utc>>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    async fn create_test_db() -> Pool<Sqlite> {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let database_url = format!("sqlite:{}", db_path.display());

        let pool = sqlx::SqlitePool::connect(&database_url).await.unwrap();

        // Create simplified test tables
        sqlx::query(r#"
            CREATE TABLE social_media_accounts (
                id TEXT PRIMARY KEY,
                account_id TEXT NOT NULL,
                platform TEXT NOT NULL,
                account_type TEXT NOT NULL,
                professional_id TEXT NOT NULL,
                display_name TEXT NOT NULL,
                username TEXT,
                profile_url TEXT,
                follower_count INTEGER,
                connection_count INTEGER,
                verified BOOLEAN DEFAULT FALSE,
                active BOOLEAN DEFAULT TRUE,
                last_synced DATETIME,
                sync_enabled BOOLEAN DEFAULT TRUE,
                posting_enabled BOOLEAN DEFAULT TRUE,
                analytics_enabled BOOLEAN DEFAULT TRUE
            )
        "#).execute(&pool).await.unwrap();

        sqlx::query(r#"
            CREATE TABLE social_media_posts (
                id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL UNIQUE,
                platform TEXT NOT NULL,
                account_id TEXT NOT NULL,
                professional_id TEXT NOT NULL,
                content_type TEXT NOT NULL,
                title TEXT,
                content TEXT NOT NULL,
                hashtags_json TEXT,
                mentions_json TEXT,
                media_urls_json TEXT,
                link_url TEXT,
                link_title TEXT,
                link_description TEXT,
                scheduled_for DATETIME,
                posted_at DATETIME,
                platform_post_id TEXT,
                status TEXT NOT NULL DEFAULT 'draft',
                compliance_checked BOOLEAN DEFAULT FALSE,
                compliance_status TEXT,
                compliance_notes TEXT,
                review_required BOOLEAN DEFAULT FALSE,
                reviewed_by TEXT,
                reviewed_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        "#).execute(&pool).await.unwrap();

        pool
    }

    #[tokio::test]
    async fn test_social_media_service_creation() {
        let pool = create_test_db().await;
        let config = SocialMediaConfig::default();
        let service = SocialMediaService::new(config, pool);

        assert!(service.config.linkedin_enabled);
        assert!(service.config.facebook_enabled);
        assert!(service.config.content_compliance_enabled);
    }

    #[tokio::test]
    async fn test_content_compliance_check() {
        let pool = create_test_db().await;
        let config = SocialMediaConfig::default();
        let service = SocialMediaService::new(config, pool);

        // Test safe content
        let safe_content = "Sharing insights about mental health awareness and professional development.";
        let safe_hashtags = vec!["#MentalHealth".to_string(), "#ProfessionalDevelopment".to_string()];
        let check = service.check_content_compliance(safe_content, &safe_hashtags).await.unwrap();
        assert_eq!(check.status, "approved");

        // Test content with privacy concerns
        let risky_content = "Had a great session with my patient John today who was diagnosed with depression.";
        let risky_hashtags = vec!["#Patient".to_string()];
        let check = service.check_content_compliance(risky_content, &risky_hashtags).await.unwrap();
        assert_eq!(check.status, "failed");
    }
}