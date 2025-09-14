// Rate Limiting and Security Middleware for HIPAA Compliance
// Implements comprehensive rate limiting to prevent abuse and ensure system stability

use crate::security::{SecurityError, HealthcareRole};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use governor::{Quota, RateLimiter, state::{InMemoryState, NotKeyed}, clock::DefaultClock};
use std::net::IpAddr;
use tokio::sync::Mutex;

/// Rate limiting configuration for different user roles and endpoints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    /// Default requests per minute for authenticated users
    pub default_requests_per_minute: u32,
    /// Burst capacity for short periods
    pub burst_capacity: u32,
    /// Rate limits by healthcare role
    pub role_limits: HashMap<HealthcareRole, RoleLimits>,
    /// Endpoint-specific rate limits
    pub endpoint_limits: HashMap<String, EndpointLimits>,
    /// IP-based rate limiting
    pub ip_limits: IpLimits,
    /// Anonymous/unauthenticated user limits
    pub anonymous_limits: AnonymousLimits,
    /// HIPAA-specific limits for sensitive operations
    pub hipaa_sensitive_limits: HipaaSensitiveLimits,
    /// Window size for tracking violations
    pub violation_window_minutes: u32,
    /// Maximum violations before temporary ban
    pub max_violations_before_ban: u32,
    /// Temporary ban duration in minutes
    pub temporary_ban_duration_minutes: u32,
}

/// Role-based rate limits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleLimits {
    /// Requests per minute
    pub requests_per_minute: u32,
    /// Burst capacity
    pub burst_capacity: u32,
    /// PHI access requests per hour (HIPAA requirement)
    pub phi_access_per_hour: u32,
    /// Data export requests per day
    pub data_exports_per_day: u32,
    /// Concurrent sessions allowed
    pub max_concurrent_sessions: u32,
    /// API calls per hour
    pub api_calls_per_hour: u32,
}

/// Endpoint-specific rate limits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EndpointLimits {
    /// Path pattern (regex)
    pub path_pattern: String,
    /// Requests per minute for this endpoint
    pub requests_per_minute: u32,
    /// Burst capacity
    pub burst_capacity: u32,
    /// Whether this endpoint accesses PHI
    pub accesses_phi: bool,
    /// Risk level (1-5)
    pub risk_level: u8,
    /// Requires MFA for rate limit exemption
    pub mfa_exemption: bool,
}

/// IP-based rate limiting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpLimits {
    /// Requests per minute per IP
    pub requests_per_minute_per_ip: u32,
    /// Maximum failed authentication attempts per IP per hour
    pub max_failed_auth_per_hour: u32,
    /// IP-based ban duration for abuse
    pub ip_ban_duration_minutes: u32,
    /// Whitelist of trusted IPs (no rate limiting)
    pub trusted_ips: Vec<String>,
    /// Geographic restrictions
    pub geographic_restrictions: Option<GeographicRestrictions>,
}

/// Anonymous user rate limits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnonymousLimits {
    /// Requests per minute for anonymous users
    pub requests_per_minute: u32,
    /// Maximum registration attempts per IP per day
    pub max_registrations_per_ip_per_day: u32,
    /// Maximum password reset attempts per IP per hour
    pub max_password_resets_per_hour: u32,
    /// Allowed endpoints for anonymous users
    pub allowed_endpoints: Vec<String>,
}

/// HIPAA-sensitive operation limits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HipaaSensitiveLimits {
    /// PHI view operations per user per hour
    pub phi_views_per_hour: u32,
    /// PHI modification operations per user per hour
    pub phi_modifications_per_hour: u32,
    /// PHI export operations per user per day
    pub phi_exports_per_day: u32,
    /// Bulk operations per user per day
    pub bulk_operations_per_day: u32,
    /// Administrative operations per user per day
    pub admin_operations_per_day: u32,
    /// Audit log access per user per hour
    pub audit_access_per_hour: u32,
}

/// Geographic access restrictions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeographicRestrictions {
    /// Allowed countries (ISO country codes)
    pub allowed_countries: Vec<String>,
    /// Blocked countries (takes precedence)
    pub blocked_countries: Vec<String>,
    /// VPN/Proxy detection and blocking
    pub block_vpn_proxy: bool,
    /// Suspicious location alerting
    pub alert_suspicious_locations: bool,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        let mut role_limits = HashMap::new();
        
        // Super Administrator - High limits due to legitimate admin needs
        role_limits.insert(HealthcareRole::SuperAdmin, RoleLimits {
            requests_per_minute: 200,
            burst_capacity: 50,
            phi_access_per_hour: 1000,
            data_exports_per_day: 50,
            max_concurrent_sessions: 10,
            api_calls_per_hour: 2000,
        });
        
        // Healthcare Provider - Moderate limits for clinical workflow
        role_limits.insert(HealthcareRole::HealthcareProvider, RoleLimits {
            requests_per_minute: 120,
            burst_capacity: 30,
            phi_access_per_hour: 500,
            data_exports_per_day: 20,
            max_concurrent_sessions: 5,
            api_calls_per_hour: 1000,
        });
        
        // Administrative Staff - Limited PHI access
        role_limits.insert(HealthcareRole::AdministrativeStaff, RoleLimits {
            requests_per_minute: 80,
            burst_capacity: 20,
            phi_access_per_hour: 200,
            data_exports_per_day: 10,
            max_concurrent_sessions: 3,
            api_calls_per_hour: 600,
        });
        
        // Patient - Restricted to own data
        role_limits.insert(HealthcareRole::Patient, RoleLimits {
            requests_per_minute: 40,
            burst_capacity: 10,
            phi_access_per_hour: 50, // Own data only
            data_exports_per_day: 5,
            max_concurrent_sessions: 2,
            api_calls_per_hour: 200,
        });
        
        let mut endpoint_limits = HashMap::new();
        
        // Authentication endpoints
        endpoint_limits.insert("/api/auth/login".to_string(), EndpointLimits {
            path_pattern: "/api/auth/login".to_string(),
            requests_per_minute: 10, // Prevent brute force
            burst_capacity: 3,
            accesses_phi: false,
            risk_level: 3,
            mfa_exemption: false,
        });
        
        // PHI access endpoints
        endpoint_limits.insert("/api/patients/.*".to_string(), EndpointLimits {
            path_pattern: "/api/patients/.*".to_string(),
            requests_per_minute: 30,
            burst_capacity: 10,
            accesses_phi: true,
            risk_level: 5,
            mfa_exemption: true,
        });
        
        // Data export endpoints
        endpoint_limits.insert("/api/export/.*".to_string(), EndpointLimits {
            path_pattern: "/api/export/.*".to_string(),
            requests_per_minute: 2, // Very restrictive
            burst_capacity: 1,
            accesses_phi: true,
            risk_level: 5,
            mfa_exemption: false,
        });
        
        Self {
            default_requests_per_minute: 60,
            burst_capacity: 15,
            role_limits,
            endpoint_limits,
            ip_limits: IpLimits {
                requests_per_minute_per_ip: 100,
                max_failed_auth_per_hour: 10,
                ip_ban_duration_minutes: 60,
                trusted_ips: vec!["127.0.0.1".to_string()],
                geographic_restrictions: Some(GeographicRestrictions {
                    allowed_countries: vec![], // Empty = allow all
                    blocked_countries: vec![], // None blocked by default
                    block_vpn_proxy: false,    // Disabled by default
                    alert_suspicious_locations: true,
                }),
            },
            anonymous_limits: AnonymousLimits {
                requests_per_minute: 20,
                max_registrations_per_ip_per_day: 5,
                max_password_resets_per_hour: 3,
                allowed_endpoints: vec![
                    "/api/auth/login".to_string(),
                    "/api/auth/register".to_string(),
                    "/api/auth/reset-password".to_string(),
                    "/api/public/.*".to_string(),
                ],
            },
            hipaa_sensitive_limits: HipaaSensitiveLimits {
                phi_views_per_hour: 200,
                phi_modifications_per_hour: 50,
                phi_exports_per_day: 10,
                bulk_operations_per_day: 5,
                admin_operations_per_day: 100,
                audit_access_per_hour: 20,
            },
            violation_window_minutes: 60,
            max_violations_before_ban: 5,
            temporary_ban_duration_minutes: 30,
        }
    }
}

/// Rate limit violation record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitViolation {
    /// Violation ID
    pub violation_id: Uuid,
    /// Timestamp of violation
    pub timestamp: DateTime<Utc>,
    /// User ID (if authenticated)
    pub user_id: Option<Uuid>,
    /// IP address
    pub ip_address: IpAddr,
    /// Endpoint that was rate limited
    pub endpoint: String,
    /// Type of limit that was exceeded
    pub limit_type: LimitType,
    /// Requested rate vs allowed rate
    pub rate_info: RateInfo,
    /// User agent
    pub user_agent: Option<String>,
    /// Session ID
    pub session_id: Option<String>,
    /// Severity of violation
    pub severity: ViolationSeverity,
}

/// Type of rate limit that was exceeded
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum LimitType {
    /// General request rate limit
    RequestRate,
    /// PHI access rate limit
    PhiAccess,
    /// Data export limit
    DataExport,
    /// Authentication attempt limit
    Authentication,
    /// IP-based limit
    IpBased,
    /// Endpoint-specific limit
    EndpointSpecific,
    /// Role-based limit
    RoleBased,
    /// HIPAA-sensitive operation limit
    HippaSensitive,
}

/// Rate information for violations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateInfo {
    /// Requested rate (requests per time unit)
    pub requested_rate: u32,
    /// Allowed rate (requests per time unit)
    pub allowed_rate: u32,
    /// Time unit (seconds)
    pub time_unit_seconds: u32,
    /// Current usage count
    pub current_usage: u32,
    /// Time until reset
    pub reset_in_seconds: u32,
}

/// Severity of rate limit violation
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ViolationSeverity {
    /// Minor violation - log and continue
    Minor,
    /// Moderate violation - warn and throttle
    Moderate,
    /// Major violation - temporary restriction
    Major,
    /// Severe violation - potential security threat
    Severe,
}

/// Rate limiting service
pub struct RateLimitService {
    /// Configuration
    config: Arc<RwLock<RateLimitConfig>>,
    /// Per-user rate limiters
    user_limiters: Arc<RwLock<HashMap<Uuid, UserLimiter>>>,
    /// Per-IP rate limiters
    ip_limiters: Arc<RwLock<HashMap<IpAddr, IpLimiter>>>,
    /// Endpoint-specific limiters
    endpoint_limiters: Arc<RwLock<HashMap<String, RateLimiter<NotKeyed, InMemoryState, DefaultClock>>>>,
    /// Violation tracking
    violations: Arc<RwLock<Vec<RateLimitViolation>>>,
    /// Banned IPs
    banned_ips: Arc<RwLock<HashMap<IpAddr, BanInfo>>>,
    /// Banned users
    banned_users: Arc<RwLock<HashMap<Uuid, BanInfo>>>,
}

/// Per-user rate limiter
#[derive(Debug)]
pub struct UserLimiter {
    /// General request limiter
    pub request_limiter: RateLimiter<NotKeyed, InMemoryState, DefaultClock>,
    /// PHI access limiter
    pub phi_access_limiter: RateLimiter<NotKeyed, InMemoryState, DefaultClock>,
    /// Data export limiter
    pub data_export_limiter: RateLimiter<NotKeyed, InMemoryState, DefaultClock>,
    /// Last activity timestamp
    pub last_activity: Instant,
    /// User's role
    pub role: HealthcareRole,
    /// Current session count
    pub active_sessions: u32,
    /// Violation count in current window
    pub violation_count: u32,
}

/// Per-IP rate limiter
#[derive(Debug)]
pub struct IpLimiter {
    /// Request limiter
    pub request_limiter: RateLimiter<NotKeyed, InMemoryState, DefaultClock>,
    /// Authentication attempt limiter
    pub auth_limiter: RateLimiter<NotKeyed, InMemoryState, DefaultClock>,
    /// Last activity timestamp
    pub last_activity: Instant,
    /// Violation count
    pub violation_count: u32,
    /// Geographic info (if available)
    pub location: Option<String>,
}

/// Ban information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BanInfo {
    /// Ban start time
    pub banned_at: DateTime<Utc>,
    /// Ban duration
    pub duration: Duration,
    /// Reason for ban
    pub reason: String,
    /// Number of violations that led to ban
    pub violation_count: u32,
    /// Whether ban can be appealed
    pub appealable: bool,
}

impl BanInfo {
    /// Check if ban is still active
    pub fn is_active(&self) -> bool {
        let ban_end = self.banned_at + chrono::Duration::from_std(self.duration).unwrap_or_default();
        Utc::now() < ban_end
    }
    
    /// Get time remaining on ban
    pub fn time_remaining(&self) -> Option<chrono::Duration> {
        let ban_end = self.banned_at + chrono::Duration::from_std(self.duration).unwrap_or_default();
        let now = Utc::now();
        if now < ban_end {
            Some(ban_end - now)
        } else {
            None
        }
    }
}

/// Rate limit check result
#[derive(Debug, Clone)]
pub struct RateLimitResult {
    /// Whether request is allowed
    pub allowed: bool,
    /// Reason for denial (if denied)
    pub denial_reason: Option<String>,
    /// Rate limit information
    pub rate_info: Option<RateInfo>,
    /// Recommended retry after duration
    pub retry_after_seconds: Option<u32>,
    /// Violation recorded (if applicable)
    pub violation: Option<RateLimitViolation>,
}

/// Rate limit check context
#[derive(Debug, Clone)]
pub struct RateLimitContext {
    /// User ID (if authenticated)
    pub user_id: Option<Uuid>,
    /// User's role (if authenticated)
    pub user_role: Option<HealthcareRole>,
    /// IP address
    pub ip_address: IpAddr,
    /// Endpoint being accessed
    pub endpoint: String,
    /// HTTP method
    pub method: String,
    /// User agent
    pub user_agent: Option<String>,
    /// Session ID
    pub session_id: Option<String>,
    /// Whether request accesses PHI
    pub accesses_phi: bool,
    /// Whether request is a data export
    pub is_data_export: bool,
    /// Whether MFA is verified
    pub mfa_verified: bool,
    /// Request timestamp
    pub timestamp: DateTime<Utc>,
}

impl RateLimitService {
    /// Create new rate limiting service
    pub fn new(config: RateLimitConfig) -> Self {
        Self {
            config: Arc::new(RwLock::new(config)),
            user_limiters: Arc::new(RwLock::new(HashMap::new())),
            ip_limiters: Arc::new(RwLock::new(HashMap::new())),
            endpoint_limiters: Arc::new(RwLock::new(HashMap::new())),
            violations: Arc::new(RwLock::new(Vec::new())),
            banned_ips: Arc::new(RwLock::new(HashMap::new())),
            banned_users: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    /// Check if request should be rate limited
    pub async fn check_rate_limit(&self, context: RateLimitContext) -> RateLimitResult {
        // Check if user is banned
        if let Some(user_id) = context.user_id {
            if let Some(ban_info) = self.banned_users.read().unwrap().get(&user_id) {
                if ban_info.is_active() {
                    return RateLimitResult {
                        allowed: false,
                        denial_reason: Some(format!("User banned: {}", ban_info.reason)),
                        rate_info: None,
                        retry_after_seconds: ban_info.time_remaining()
                            .map(|d| d.num_seconds() as u32),
                        violation: None,
                    };
                }
            }
        }
        
        // Check if IP is banned
        if let Some(ban_info) = self.banned_ips.read().unwrap().get(&context.ip_address) {
            if ban_info.is_active() {
                return RateLimitResult {
                    allowed: false,
                    denial_reason: Some(format!("IP banned: {}", ban_info.reason)),
                    rate_info: None,
                    retry_after_seconds: ban_info.time_remaining()
                        .map(|d| d.num_seconds() as u32),
                    violation: None,
                };
            }
        }
        
        // Check IP rate limits
        let ip_result = self.check_ip_rate_limit(&context).await;
        if !ip_result.allowed {
            return ip_result;
        }
        
        // Check user rate limits (if authenticated)
        if context.user_id.is_some() {
            let user_result = self.check_user_rate_limit(&context).await;
            if !user_result.allowed {
                return user_result;
            }
        }
        
        // Check endpoint-specific rate limits
        let endpoint_result = self.check_endpoint_rate_limit(&context).await;
        if !endpoint_result.allowed {
            return endpoint_result;
        }
        
        // Check HIPAA-sensitive operation limits
        if context.accesses_phi || context.is_data_export {
            let hipaa_result = self.check_hipaa_sensitive_limit(&context).await;
            if !hipaa_result.allowed {
                return hipaa_result;
            }
        }
        
        RateLimitResult {
            allowed: true,
            denial_reason: None,
            rate_info: None,
            retry_after_seconds: None,
            violation: None,
        }
    }
    
    /// Check IP-based rate limits
    async fn check_ip_rate_limit(&self, context: &RateLimitContext) -> RateLimitResult {
        let config = self.config.read().unwrap();
        
        // Check if IP is trusted
        if config.ip_limits.trusted_ips.contains(&context.ip_address.to_string()) {
            return RateLimitResult {
                allowed: true,
                denial_reason: None,
                rate_info: None,
                retry_after_seconds: None,
                violation: None,
            };
        }
        
        let mut ip_limiters = self.ip_limiters.write().unwrap();
        let ip_limiter = ip_limiters.entry(context.ip_address).or_insert_with(|| {
            IpLimiter {
                request_limiter: RateLimiter::direct(
                    Quota::per_minute(config.ip_limits.requests_per_minute_per_ip)
                ),
                auth_limiter: RateLimiter::direct(
                    Quota::per_hour(config.ip_limits.max_failed_auth_per_hour)
                ),
                last_activity: Instant::now(),
                violation_count: 0,
                location: None,
            }
        });
        
        ip_limiter.last_activity = Instant::now();
        
        // Check general IP rate limit
        match ip_limiter.request_limiter.check() {
            Ok(_) => RateLimitResult {
                allowed: true,
                denial_reason: None,
                rate_info: None,
                retry_after_seconds: None,
                violation: None,
            },
            Err(negative) => {
                ip_limiter.violation_count += 1;
                
                let violation = self.record_violation(
                    context,
                    LimitType::IpBased,
                    config.ip_limits.requests_per_minute_per_ip,
                    ViolationSeverity::Moderate,
                );
                
                // Check if IP should be banned
                if ip_limiter.violation_count >= config.max_violations_before_ban {
                    self.ban_ip(
                        context.ip_address,
                        "Excessive rate limit violations".to_string(),
                        Duration::from_secs(config.ip_limits.ip_ban_duration_minutes as u64 * 60),
                    );
                }
                
                RateLimitResult {
                    allowed: false,
                    denial_reason: Some("IP rate limit exceeded".to_string()),
                    rate_info: Some(RateInfo {
                        requested_rate: config.ip_limits.requests_per_minute_per_ip + 1,
                        allowed_rate: config.ip_limits.requests_per_minute_per_ip,
                        time_unit_seconds: 60,
                        current_usage: config.ip_limits.requests_per_minute_per_ip,
                        reset_in_seconds: negative.wait_time_from(Instant::now()).as_secs() as u32,
                    }),
                    retry_after_seconds: Some(negative.wait_time_from(Instant::now()).as_secs() as u32),
                    violation: Some(violation),
                }
            }
        }
    }
    
    /// Check user-based rate limits
    async fn check_user_rate_limit(&self, context: &RateLimitContext) -> RateLimitResult {
        let user_id = context.user_id.unwrap();
        let user_role = context.user_role.as_ref().unwrap();
        let config = self.config.read().unwrap();
        
        let role_limits = config.role_limits.get(user_role)
            .unwrap_or_else(|| {
                // Fallback to most restrictive limits
                config.role_limits.get(&HealthcareRole::Patient).unwrap()
            });
        
        let mut user_limiters = self.user_limiters.write().unwrap();
        let user_limiter = user_limiters.entry(user_id).or_insert_with(|| {
            UserLimiter {
                request_limiter: RateLimiter::direct(
                    Quota::per_minute(role_limits.requests_per_minute)
                ),
                phi_access_limiter: RateLimiter::direct(
                    Quota::per_hour(role_limits.phi_access_per_hour)
                ),
                data_export_limiter: RateLimiter::direct(
                    Quota::per_day(role_limits.data_exports_per_day)
                ),
                last_activity: Instant::now(),
                role: user_role.clone(),
                active_sessions: 1,
                violation_count: 0,
            }
        });
        
        user_limiter.last_activity = Instant::now();
        
        // Check general request rate limit
        match user_limiter.request_limiter.check() {
            Ok(_) => {
                // Check PHI access if applicable
                if context.accesses_phi {
                    match user_limiter.phi_access_limiter.check() {
                        Ok(_) => (),
                        Err(negative) => {
                            let violation = self.record_violation(
                                context,
                                LimitType::PhiAccess,
                                role_limits.phi_access_per_hour,
                                ViolationSeverity::Major,
                            );
                            
                            return RateLimitResult {
                                allowed: false,
                                denial_reason: Some("PHI access rate limit exceeded".to_string()),
                                rate_info: Some(RateInfo {
                                    requested_rate: role_limits.phi_access_per_hour + 1,
                                    allowed_rate: role_limits.phi_access_per_hour,
                                    time_unit_seconds: 3600,
                                    current_usage: role_limits.phi_access_per_hour,
                                    reset_in_seconds: negative.wait_time_from(Instant::now()).as_secs() as u32,
                                }),
                                retry_after_seconds: Some(negative.wait_time_from(Instant::now()).as_secs() as u32),
                                violation: Some(violation),
                            };
                        }
                    }
                }
                
                // Check data export if applicable
                if context.is_data_export {
                    match user_limiter.data_export_limiter.check() {
                        Ok(_) => (),
                        Err(negative) => {
                            let violation = self.record_violation(
                                context,
                                LimitType::DataExport,
                                role_limits.data_exports_per_day,
                                ViolationSeverity::Severe,
                            );
                            
                            return RateLimitResult {
                                allowed: false,
                                denial_reason: Some("Data export rate limit exceeded".to_string()),
                                rate_info: Some(RateInfo {
                                    requested_rate: role_limits.data_exports_per_day + 1,
                                    allowed_rate: role_limits.data_exports_per_day,
                                    time_unit_seconds: 86400,
                                    current_usage: role_limits.data_exports_per_day,
                                    reset_in_seconds: negative.wait_time_from(Instant::now()).as_secs() as u32,
                                }),
                                retry_after_seconds: Some(negative.wait_time_from(Instant::now()).as_secs() as u32),
                                violation: Some(violation),
                            };
                        }
                    }
                }
                
                RateLimitResult {
                    allowed: true,
                    denial_reason: None,
                    rate_info: None,
                    retry_after_seconds: None,
                    violation: None,
                }
            },
            Err(negative) => {
                user_limiter.violation_count += 1;
                
                let violation = self.record_violation(
                    context,
                    LimitType::RoleBased,
                    role_limits.requests_per_minute,
                    ViolationSeverity::Moderate,
                );
                
                RateLimitResult {
                    allowed: false,
                    denial_reason: Some("User rate limit exceeded".to_string()),
                    rate_info: Some(RateInfo {
                        requested_rate: role_limits.requests_per_minute + 1,
                        allowed_rate: role_limits.requests_per_minute,
                        time_unit_seconds: 60,
                        current_usage: role_limits.requests_per_minute,
                        reset_in_seconds: negative.wait_time_from(Instant::now()).as_secs() as u32,
                    }),
                    retry_after_seconds: Some(negative.wait_time_from(Instant::now()).as_secs() as u32),
                    violation: Some(violation),
                }
            }
        }
    }
    
    /// Check endpoint-specific rate limits
    async fn check_endpoint_rate_limit(&self, context: &RateLimitContext) -> RateLimitResult {
        let config = self.config.read().unwrap();
        
        // Find matching endpoint configuration
        let endpoint_config = config.endpoint_limits.iter()
            .find(|(pattern, _)| {
                // Simple pattern matching (in production, would use regex)
                context.endpoint.starts_with(pattern.trim_end_matches(".*"))
            })
            .map(|(_, config)| config);
        
        if let Some(endpoint_config) = endpoint_config {
            let mut endpoint_limiters = self.endpoint_limiters.write().unwrap();
            let endpoint_limiter = endpoint_limiters.entry(context.endpoint.clone()).or_insert_with(|| {
                RateLimiter::direct(Quota::per_minute(endpoint_config.requests_per_minute))
            });
            
            match endpoint_limiter.check() {
                Ok(_) => RateLimitResult {
                    allowed: true,
                    denial_reason: None,
                    rate_info: None,
                    retry_after_seconds: None,
                    violation: None,
                },
                Err(negative) => {
                    let violation = self.record_violation(
                        context,
                        LimitType::EndpointSpecific,
                        endpoint_config.requests_per_minute,
                        if endpoint_config.risk_level >= 4 {
                            ViolationSeverity::Major
                        } else {
                            ViolationSeverity::Moderate
                        },
                    );
                    
                    RateLimitResult {
                        allowed: false,
                        denial_reason: Some(format!("Endpoint rate limit exceeded: {}", context.endpoint)),
                        rate_info: Some(RateInfo {
                            requested_rate: endpoint_config.requests_per_minute + 1,
                            allowed_rate: endpoint_config.requests_per_minute,
                            time_unit_seconds: 60,
                            current_usage: endpoint_config.requests_per_minute,
                            reset_in_seconds: negative.wait_time_from(Instant::now()).as_secs() as u32,
                        }),
                        retry_after_seconds: Some(negative.wait_time_from(Instant::now()).as_secs() as u32),
                        violation: Some(violation),
                    }
                }
            }
        } else {
            RateLimitResult {
                allowed: true,
                denial_reason: None,
                rate_info: None,
                retry_after_seconds: None,
                violation: None,
            }
        }
    }
    
    /// Check HIPAA-sensitive operation limits
    async fn check_hipaa_sensitive_limit(&self, context: &RateLimitContext) -> RateLimitResult {
        // Implementation would check specific HIPAA-sensitive operation limits
        // For now, return allowed
        RateLimitResult {
            allowed: true,
            denial_reason: None,
            rate_info: None,
            retry_after_seconds: None,
            violation: None,
        }
    }
    
    /// Record a rate limit violation
    fn record_violation(
        &self,
        context: &RateLimitContext,
        limit_type: LimitType,
        allowed_rate: u32,
        severity: ViolationSeverity,
    ) -> RateLimitViolation {
        let violation = RateLimitViolation {
            violation_id: Uuid::new_v4(),
            timestamp: context.timestamp,
            user_id: context.user_id,
            ip_address: context.ip_address,
            endpoint: context.endpoint.clone(),
            limit_type,
            rate_info: RateInfo {
                requested_rate: allowed_rate + 1,
                allowed_rate,
                time_unit_seconds: 60, // Simplified
                current_usage: allowed_rate,
                reset_in_seconds: 60,
            },
            user_agent: context.user_agent.clone(),
            session_id: context.session_id.clone(),
            severity,
        };
        
        self.violations.write().unwrap().push(violation.clone());
        
        log::warn!("Rate limit violation: {:?} from IP {} on endpoint {}", 
            limit_type, context.ip_address, context.endpoint);
        
        violation
    }
    
    /// Ban an IP address
    fn ban_ip(&self, ip: IpAddr, reason: String, duration: Duration) {
        let ban_info = BanInfo {
            banned_at: Utc::now(),
            duration,
            reason: reason.clone(),
            violation_count: 1,
            appealable: true,
        };
        
        self.banned_ips.write().unwrap().insert(ip, ban_info);
        log::error!("Banned IP {} for {} minutes: {}", ip, duration.as_secs() / 60, reason);
    }
    
    /// Ban a user
    fn ban_user(&self, user_id: Uuid, reason: String, duration: Duration) {
        let ban_info = BanInfo {
            banned_at: Utc::now(),
            duration,
            reason: reason.clone(),
            violation_count: 1,
            appealable: true,
        };
        
        self.banned_users.write().unwrap().insert(user_id, ban_info);
        log::error!("Banned user {} for {} minutes: {}", user_id, duration.as_secs() / 60, reason);
    }
    
    /// Get rate limit statistics
    pub fn get_statistics(&self) -> RateLimitStatistics {
        let violations = self.violations.read().unwrap();
        let banned_ips = self.banned_ips.read().unwrap();
        let banned_users = self.banned_users.read().unwrap();
        
        RateLimitStatistics {
            total_violations: violations.len(),
            violations_by_type: violations.iter()
                .fold(HashMap::new(), |mut acc, v| {
                    *acc.entry(format!("{:?}", v.limit_type)).or_insert(0) += 1;
                    acc
                }),
            active_ip_bans: banned_ips.values().filter(|b| b.is_active()).count(),
            active_user_bans: banned_users.values().filter(|b| b.is_active()).count(),
            active_user_limiters: self.user_limiters.read().unwrap().len(),
            active_ip_limiters: self.ip_limiters.read().unwrap().len(),
        }
    }
    
    /// Clean up expired rate limiters and bans
    pub async fn cleanup(&self) {
        let now = Instant::now();
        let cleanup_threshold = Duration::from_secs(3600); // 1 hour
        
        // Clean up inactive user limiters
        self.user_limiters.write().unwrap().retain(|_, limiter| {
            now.duration_since(limiter.last_activity) < cleanup_threshold
        });
        
        // Clean up inactive IP limiters
        self.ip_limiters.write().unwrap().retain(|_, limiter| {
            now.duration_since(limiter.last_activity) < cleanup_threshold
        });
        
        // Clean up expired bans
        self.banned_ips.write().unwrap().retain(|_, ban| ban.is_active());
        self.banned_users.write().unwrap().retain(|_, ban| ban.is_active());
        
        log::debug!("Cleaned up expired rate limiters and bans");
    }
}

/// Rate limiting statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitStatistics {
    pub total_violations: usize,
    pub violations_by_type: HashMap<String, u32>,
    pub active_ip_bans: usize,
    pub active_user_bans: usize,
    pub active_user_limiters: usize,
    pub active_ip_limiters: usize,
}

/// Initialize rate limiting system
pub async fn initialize_rate_limiter() -> Result<(), SecurityError> {
    let config = RateLimitConfig::default();
    let rate_limiter = RateLimitService::new(config);
    
    // Test rate limiting with a sample context
    let test_context = RateLimitContext {
        user_id: Some(Uuid::new_v4()),
        user_role: Some(HealthcareRole::HealthcareProvider),
        ip_address: "127.0.0.1".parse().unwrap(),
        endpoint: "/api/test".to_string(),
        method: "GET".to_string(),
        user_agent: Some("Test".to_string()),
        session_id: Some(Uuid::new_v4().to_string()),
        accesses_phi: false,
        is_data_export: false,
        mfa_verified: true,
        timestamp: Utc::now(),
    };
    
    let result = rate_limiter.check_rate_limit(test_context).await;
    if !result.allowed {
        return Err(SecurityError::RateLimitExceeded { 
            limit: 60, 
            window: "minute".to_string() 
        });
    }
    
    log::info!("HIPAA-compliant rate limiting system initialized successfully");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;
    
    #[tokio::test]
    async fn test_rate_limit_service_creation() {
        let config = RateLimitConfig::default();
        let service = RateLimitService::new(config);
        
        let stats = service.get_statistics();
        assert_eq!(stats.total_violations, 0);
        assert_eq!(stats.active_ip_bans, 0);
        assert_eq!(stats.active_user_bans, 0);
    }
    
    #[tokio::test]
    async fn test_ip_rate_limiting() {
        let mut config = RateLimitConfig::default();
        config.ip_limits.requests_per_minute_per_ip = 1; // Very restrictive for testing
        
        let service = RateLimitService::new(config);
        let context = RateLimitContext {
            user_id: None,
            user_role: None,
            ip_address: IpAddr::from_str("192.168.1.1").unwrap(),
            endpoint: "/api/test".to_string(),
            method: "GET".to_string(),
            user_agent: Some("Test".to_string()),
            session_id: None,
            accesses_phi: false,
            is_data_export: false,
            mfa_verified: false,
            timestamp: Utc::now(),
        };
        
        // First request should be allowed
        let result1 = service.check_rate_limit(context.clone()).await;
        assert!(result1.allowed);
        
        // Second request should be rate limited
        let result2 = service.check_rate_limit(context).await;
        assert!(!result2.allowed);
        assert!(result2.denial_reason.is_some());
    }
    
    #[tokio::test]
    async fn test_user_rate_limiting() {
        let mut config = RateLimitConfig::default();
        config.role_limits.get_mut(&HealthcareRole::Patient).unwrap().requests_per_minute = 1;
        
        let service = RateLimitService::new(config);
        let user_id = Uuid::new_v4();
        let context = RateLimitContext {
            user_id: Some(user_id),
            user_role: Some(HealthcareRole::Patient),
            ip_address: IpAddr::from_str("127.0.0.1").unwrap(),
            endpoint: "/api/test".to_string(),
            method: "GET".to_string(),
            user_agent: Some("Test".to_string()),
            session_id: Some(Uuid::new_v4().to_string()),
            accesses_phi: false,
            is_data_export: false,
            mfa_verified: false,
            timestamp: Utc::now(),
        };
        
        // First request should be allowed
        let result1 = service.check_rate_limit(context.clone()).await;
        assert!(result1.allowed);
        
        // Second request should be rate limited
        let result2 = service.check_rate_limit(context).await;
        assert!(!result2.allowed);
    }
    
    #[test]
    fn test_ban_info() {
        let ban = BanInfo {
            banned_at: Utc::now() - chrono::Duration::minutes(30),
            duration: Duration::from_secs(3600), // 1 hour
            reason: "Test ban".to_string(),
            violation_count: 5,
            appealable: true,
        };
        
        assert!(ban.is_active());
        assert!(ban.time_remaining().is_some());
        
        let expired_ban = BanInfo {
            banned_at: Utc::now() - chrono::Duration::hours(2),
            duration: Duration::from_secs(3600), // 1 hour
            reason: "Expired ban".to_string(),
            violation_count: 5,
            appealable: true,
        };
        
        assert!(!expired_ban.is_active());
        assert!(expired_ban.time_remaining().is_none());
    }
}