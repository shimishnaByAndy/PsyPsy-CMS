use tauri::State;
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialMediaPost {
    pub id: String,
    pub content: String,
    pub media: Vec<MediaAttachment>,
    pub scheduled_at: Option<String>,
    pub status: String,
    pub platforms: Vec<PlatformConfig>,
    pub compliance: PostComplianceData,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaAttachment {
    pub id: String,
    pub media_type: String,
    pub url: String,
    pub filename: String,
    pub size: u64,
    pub mime_type: String,
    pub alt_text: Option<String>,
    pub compliance: MediaComplianceData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaComplianceData {
    pub contains_phi: bool,
    pub compliance_checked: bool,
    pub approved_for_sharing: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformConfig {
    pub platform: String,
    pub account_id: String,
    pub settings: HashMap<String, serde_json::Value>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostComplianceData {
    pub contains_medical_content: bool,
    pub contains_phi: bool,
    pub quebec_law25_compliant: bool,
    pub professional_order_approved: bool,
    pub consent_obtained: bool,
    pub reviewed_by: Option<String>,
    pub reviewed_at: Option<String>,
    pub compliance_notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthCredentials {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
    pub scopes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformConnection {
    pub platform: String,
    pub connected: bool,
    pub profile: Option<ProfileInfo>,
    pub account: Option<AccountInfo>,
    pub last_connected: Option<String>,
    pub consent_status: ConsentStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileInfo {
    pub id: String,
    pub username: String,
    pub display_name: String,
    pub profile_picture: Option<String>,
    pub follower_count: Option<u64>,
    pub verified: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountInfo {
    pub id: String,
    pub name: String,
    pub account_type: String,
    pub permissions: Vec<String>,
    pub limits: AccountLimits,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountLimits {
    pub posts_per_day: Option<u32>,
    pub posts_per_hour: Option<u32>,
    pub max_media_size: Option<u64>,
    pub max_video_length: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentStatus {
    pub quebec_law25_consent: bool,
    pub data_processing_consent: bool,
    pub social_media_sharing_consent: bool,
    pub consent_date: Option<String>,
    pub consent_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceValidationResult {
    pub compliant: bool,
    pub violations: Vec<ComplianceViolation>,
    pub warnings: Vec<ComplianceWarning>,
    pub requires_review: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceViolation {
    pub violation_type: String,
    pub severity: String,
    pub message: String,
    pub field: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceWarning {
    pub warning_type: String,
    pub message: String,
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PHIDetectionResult {
    pub contains_phi: bool,
    pub detected_elements: Vec<PHIElement>,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PHIElement {
    pub element_type: String,
    pub value: String,
    pub start_index: usize,
    pub end_index: usize,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceMetrics {
    pub overall_score: f64,
    pub quebec_law25_score: f64,
    pub professional_standards_score: f64,
    pub privacy_score: f64,
    pub content_quality_score: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

#[derive(Default)]
pub struct SocialMediaState {
    pub connections: Mutex<Vec<PlatformConnection>>,
    pub oauth_configs: Mutex<HashMap<String, OAuthCredentials>>,
    pub scheduled_posts: Mutex<Vec<SocialMediaPost>>,
    pub published_posts: Mutex<Vec<SocialMediaPost>>,
    pub consent_records: Mutex<HashMap<String, ConsentStatus>>,
}

// PHI Detection patterns (simplified for demo)
fn detect_phi_in_content_internal(content: &str) -> PHIDetectionResult {
    let mut detected_elements = Vec::new();
    let mut confidence_scores = Vec::new();

    // Basic PHI patterns
    let patterns = [
        (r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", "PHONE", 0.8),
        (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "EMAIL", 0.9),
        (r"\b(RAMQ|Medicare|Health Card)[\s#:]*\d+", "MEDICAL_ID", 0.95),
        (r"\b\d{4}[-/]\d{2}[-/]\d{2}\b", "DATE", 0.7),
        (r"\b\d+\s+[A-Za-z\s]+\s+(Street|St|Ave|Avenue|Road|Rd|Blvd|Boulevard)", "ADDRESS", 0.8),
    ];

    for (pattern, phi_type, confidence) in patterns {
        if let Ok(regex) = regex::Regex::new(pattern) {
            for mat in regex.find_iter(content) {
                detected_elements.push(PHIElement {
                    element_type: phi_type.to_string(),
                    value: mat.as_str().to_string(),
                    start_index: mat.start(),
                    end_index: mat.end(),
                    confidence,
                });
                confidence_scores.push(confidence);
            }
        }
    }

    let overall_confidence = if confidence_scores.is_empty() {
        0.1 // Low confidence when no PHI detected
    } else {
        confidence_scores.iter().sum::<f64>() / confidence_scores.len() as f64
    };

    PHIDetectionResult {
        contains_phi: !detected_elements.is_empty(),
        detected_elements,
        confidence: overall_confidence,
    }
}

fn validate_quebec_compliance(post: &SocialMediaPost) -> ComplianceValidationResult {
    let mut violations = Vec::new();
    let mut warnings = Vec::new();

    // Check for PHI
    let phi_result = detect_phi_in_content_internal(&post.content);
    if phi_result.contains_phi {
        violations.push(ComplianceViolation {
            violation_type: "PHI_DETECTED".to_string(),
            severity: "HIGH".to_string(),
            message: "Personal Health Information detected - cannot be shared on social media".to_string(),
            field: Some("content".to_string()),
        });
    }

    // Check for consent
    if !post.compliance.consent_obtained {
        violations.push(ComplianceViolation {
            violation_type: "NO_CONSENT".to_string(),
            severity: "HIGH".to_string(),
            message: "Quebec Law 25 requires explicit consent for sharing personal information".to_string(),
            field: None,
        });
    }

    // Check professional order approval for medical content
    if post.compliance.contains_medical_content && !post.compliance.professional_order_approved {
        warnings.push(ComplianceWarning {
            warning_type: "PROFESSIONAL_GUIDELINES".to_string(),
            message: "Medical content should be reviewed by professional order guidelines".to_string(),
            suggestion: Some("Consider reviewing with OPQ, OIIQ, or CMQ guidelines".to_string()),
        });
    }

    // Check content for Quebec French requirements
    let has_french_chars = post.content.chars().any(|c| "àâäéèêëïîôöùûüÿç".contains(c));
    if !has_french_chars && post.content.len() > 50 {
        warnings.push(ComplianceWarning {
            warning_type: "PROFESSIONAL_GUIDELINES".to_string(),
            message: "Consider including French content for Quebec audience".to_string(),
            suggestion: Some("Quebec Law 25 encourages French language content".to_string()),
        });
    }

    let is_compliant = violations.is_empty();
    let requires_review = !violations.is_empty() || !warnings.is_empty();

    ComplianceValidationResult {
        compliant: is_compliant,
        violations,
        warnings,
        requires_review,
    }
}

fn calculate_compliance_metrics_internal(post: &SocialMediaPost, _platforms: &[String]) -> ComplianceMetrics {
    let mut quebec_score = 1.0;
    let mut professional_score = 1.0;
    let mut privacy_score = 1.0;
    let mut content_score = 1.0;

    // Quebec Law 25 score
    if !post.compliance.consent_obtained {
        quebec_score -= 0.5;
    }
    if !post.compliance.quebec_law25_compliant {
        quebec_score -= 0.3;
    }

    // Professional standards score
    if post.compliance.contains_medical_content && !post.compliance.professional_order_approved {
        professional_score -= 0.4;
    }

    // Privacy protection score
    let phi_result = detect_phi_in_content_internal(&post.content);
    if phi_result.contains_phi {
        privacy_score = 0.0; // Zero tolerance for PHI
    }

    // Content quality score
    if post.content.len() < 10 {
        content_score -= 0.3;
    }

    let scores = [quebec_score, professional_score, privacy_score, content_score];
    let overall_score = scores.iter().sum::<f64>() / scores.len() as f64;

    ComplianceMetrics {
        overall_score: overall_score.max(0.0).min(1.0),
        quebec_law25_score: quebec_score.max(0.0).min(1.0),
        professional_standards_score: professional_score.max(0.0).min(1.0),
        privacy_score: privacy_score.max(0.0).min(1.0),
        content_quality_score: content_score.max(0.0).min(1.0),
    }
}

// Tauri Commands

#[tauri::command]
pub async fn get_social_media_connections(
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<Vec<PlatformConnection>>, String> {
    let connections = state.connections.lock().await;
    Ok(CommandResult {
        success: true,
        data: Some(connections.clone()),
        error: None,
    })
}

#[tauri::command]
pub async fn get_oauth_configs(
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<HashMap<String, OAuthCredentials>>, String> {
    let configs = state.oauth_configs.lock().await;
    Ok(CommandResult {
        success: true,
        data: Some(configs.clone()),
        error: None,
    })
}

#[tauri::command]
pub async fn save_oauth_config(
    platform: String,
    config: OAuthCredentials,
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<String>, String> {
    let mut configs = state.oauth_configs.lock().await;
    configs.insert(platform.clone(), config);

    Ok(CommandResult {
        success: true,
        data: Some(format!("OAuth configuration saved for {}", platform)),
        error: None,
    })
}

#[tauri::command]
pub async fn record_social_media_consent(
    platform: String,
    consent_data: ConsentStatus,
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<String>, String> {
    let mut consent_records = state.consent_records.lock().await;
    consent_records.insert(platform.clone(), consent_data);

    Ok(CommandResult {
        success: true,
        data: Some(format!("Consent recorded for {}", platform)),
        error: None,
    })
}

#[tauri::command]
pub async fn initiate_oauth_flow(
    platform: String,
    credentials: OAuthCredentials,
    _state: State<'_, SocialMediaState>,
) -> Result<CommandResult<String>, String> {
    // In a real implementation, this would:
    // 1. Start OAuth flow with the platform
    // 2. Open browser window to OAuth URL
    // 3. Handle callback and store tokens

    let auth_url = format!(
        "https://oauth.{}.com/authorize?client_id={}&redirect_uri={}&scope={}",
        platform.to_lowercase(),
        credentials.client_id,
        credentials.redirect_uri,
        credentials.scopes.join("%20")
    );

    Ok(CommandResult {
        success: true,
        data: Some(auth_url),
        error: None,
    })
}

#[tauri::command]
pub async fn disconnect_platform(
    platform: String,
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<String>, String> {
    let mut connections = state.connections.lock().await;

    if let Some(connection) = connections.iter_mut().find(|c| c.platform == platform) {
        connection.connected = false;
        connection.profile = None;
        connection.account = None;
    }

    Ok(CommandResult {
        success: true,
        data: Some(format!("Disconnected from {}", platform)),
        error: None,
    })
}

#[tauri::command]
pub async fn get_connected_platforms(
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<Vec<PlatformConfig>>, String> {
    let connections = state.connections.lock().await;

    let connected_platforms: Vec<PlatformConfig> = connections
        .iter()
        .filter(|c| c.connected)
        .map(|c| PlatformConfig {
            platform: c.platform.clone(),
            account_id: c.account.as_ref().map(|a| a.id.clone()).unwrap_or_default(),
            settings: HashMap::new(),
            enabled: true,
        })
        .collect();

    Ok(CommandResult {
        success: true,
        data: Some(connected_platforms),
        error: None,
    })
}

#[tauri::command]
pub async fn validate_post_compliance(
    post: SocialMediaPost,
    _state: State<'_, SocialMediaState>,
) -> Result<CommandResult<ComplianceValidationResult>, String> {
    let result = validate_quebec_compliance(&post);

    Ok(CommandResult {
        success: true,
        data: Some(result),
        error: None,
    })
}

#[tauri::command]
pub async fn detect_phi_in_content(
    content: String,
    _state: State<'_, SocialMediaState>,
) -> Result<CommandResult<PHIDetectionResult>, String> {
    let result = detect_phi_in_content_internal(&content);

    Ok(CommandResult {
        success: true,
        data: Some(result),
        error: None,
    })
}

#[tauri::command]
pub async fn calculate_compliance_metrics(
    post: SocialMediaPost,
    platforms: Vec<String>,
    _state: State<'_, SocialMediaState>,
) -> Result<CommandResult<ComplianceMetrics>, String> {
    let result = calculate_compliance_metrics_internal(&post, &platforms);

    Ok(CommandResult {
        success: true,
        data: Some(result),
        error: None,
    })
}

#[tauri::command]
pub async fn publish_social_media_post(
    post: SocialMediaPost,
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<String>, String> {
    // Validate compliance before publishing
    let compliance_result = validate_quebec_compliance(&post);
    if !compliance_result.compliant {
        return Ok(CommandResult {
            success: false,
            data: None,
            error: Some("Post failed compliance validation and cannot be published".to_string()),
        });
    }

    // Store in published posts
    let mut published_posts = state.published_posts.lock().await;
    published_posts.push(post.clone());

    // In a real implementation, this would:
    // 1. Call each platform's API to publish
    // 2. Handle success/failure for each platform
    // 3. Store results and platform-specific post IDs

    Ok(CommandResult {
        success: true,
        data: Some(format!("Post published successfully to {} platforms", post.platforms.len())),
        error: None,
    })
}

#[tauri::command]
pub async fn schedule_social_media_post(
    post: SocialMediaPost,
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<String>, String> {
    // Validate compliance before scheduling
    let compliance_result = validate_quebec_compliance(&post);
    if !compliance_result.compliant {
        return Ok(CommandResult {
            success: false,
            data: None,
            error: Some("Post failed compliance validation and cannot be scheduled".to_string()),
        });
    }

    // Store in scheduled posts
    let mut scheduled_posts = state.scheduled_posts.lock().await;
    scheduled_posts.push(post.clone());

    Ok(CommandResult {
        success: true,
        data: Some(format!("Post scheduled successfully for {} platforms", post.platforms.len())),
        error: None,
    })
}

#[tauri::command]
pub async fn get_scheduled_posts(
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<Vec<SocialMediaPost>>, String> {
    let scheduled_posts = state.scheduled_posts.lock().await;
    Ok(CommandResult {
        success: true,
        data: Some(scheduled_posts.clone()),
        error: None,
    })
}

#[tauri::command]
pub async fn get_published_posts(
    limit: Option<usize>,
    state: State<'_, SocialMediaState>,
) -> Result<CommandResult<Vec<SocialMediaPost>>, String> {
    let published_posts = state.published_posts.lock().await;
    let limited_posts = if let Some(limit) = limit {
        published_posts.iter().take(limit).cloned().collect()
    } else {
        published_posts.clone()
    };

    Ok(CommandResult {
        success: true,
        data: Some(limited_posts),
        error: None,
    })
}