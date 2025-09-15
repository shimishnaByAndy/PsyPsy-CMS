// Role-Based Access Control (RBAC) System for HIPAA Compliance
// Implements healthcare-specific permissions and access controls

use crate::security::{SecurityError, HealthcareRole, AuditEventType};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::{Arc, RwLock};
use uuid::Uuid;
use chrono::{DateTime, Utc, Timelike, Datelike};

/// Healthcare-specific permission categories
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PermissionCategory {
    /// Patient Health Information access
    PatientData,
    /// User and role management
    UserManagement,
    /// System administration
    SystemAdmin,
    /// Audit and compliance
    Audit,
    /// Billing and financial data
    Billing,
    /// Appointment scheduling
    Scheduling,
    /// Reporting and analytics
    Reporting,
    /// Communication and messaging
    Communication,
    /// File and document management
    FileManagement,
    /// Integration and API access
    Integration,
}

/// Specific permissions within healthcare system
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Permission {
    // Patient Data Permissions (HIPAA Critical)
    ViewPHI,
    ModifyPHI,
    DeletePHI,
    ExportPHI,
    ViewPatientHistory,
    CreatePatientRecord,
    ViewDemographics,
    ModifyDemographics,
    ViewClinicalNotes,
    CreateClinicalNotes,
    ViewLabResults,
    CreateLabResults,
    ViewMedications,
    PrescribeMedications,
    ViewAllergies,
    ModifyAllergies,
    ViewInsuranceInfo,
    ModifyInsuranceInfo,
    
    // User Management Permissions
    CreateUser,
    ModifyUser,
    DeleteUser,
    ViewUserList,
    AssignRoles,
    ModifyRoles,
    ViewUserActivity,
    ResetPassword,
    ManageUserSessions,
    
    // System Administration
    SystemConfiguration,
    DatabaseAccess,
    BackupRestore,
    SecuritySettings,
    ViewSystemLogs,
    ModifySystemSettings,
    ManageIntegrations,
    SystemMaintenance,
    
    // Audit and Compliance
    ViewAuditLogs,
    ExportAuditLogs,
    GenerateComplianceReports,
    ViewSecurityReports,
    ComplianceConfiguration,
    DataRetentionManagement,
    
    // Billing and Financial
    ViewBilling,
    ModifyBilling,
    ProcessPayments,
    ViewInsuranceClaims,
    SubmitInsuranceClaims,
    GenerateInvoices,
    ViewFinancialReports,
    
    // Scheduling
    ViewSchedule,
    ModifySchedule,
    CreateAppointment,
    CancelAppointment,
    RescheduleAppointment,
    ViewProviderSchedule,
    ManageTimeSlots,
    ViewWaitlist,
    
    // Reporting
    GenerateReports,
    ViewStatistics,
    ExportReports,
    CreateCustomReports,
    ViewPerformanceMetrics,
    ViewUsageAnalytics,
    
    // Communication
    SendMessages,
    ViewMessages,
    BroadcastNotifications,
    PatientCommunication,
    ProviderCommunication,
    
    // File Management
    UploadFiles,
    DownloadFiles,
    DeleteFiles,
    ViewFileHistory,
    ManageFilePermissions,
    
    // Integration and API
    APIAccess,
    WebhookManagement,
    ExternalIntegrations,
    DataImportExport,
}

impl Permission {
    /// Get the category this permission belongs to
    pub fn category(&self) -> PermissionCategory {
        match self {
            Permission::ViewPHI | Permission::ModifyPHI | Permission::DeletePHI |
            Permission::ExportPHI | Permission::ViewPatientHistory | Permission::CreatePatientRecord |
            Permission::ViewDemographics | Permission::ModifyDemographics | Permission::ViewClinicalNotes |
            Permission::CreateClinicalNotes | Permission::ViewLabResults | Permission::CreateLabResults |
            Permission::ViewMedications | Permission::PrescribeMedications | Permission::ViewAllergies |
            Permission::ModifyAllergies | Permission::ViewInsuranceInfo | Permission::ModifyInsuranceInfo => {
                PermissionCategory::PatientData
            },
            
            Permission::CreateUser | Permission::ModifyUser | Permission::DeleteUser |
            Permission::ViewUserList | Permission::AssignRoles | Permission::ModifyRoles |
            Permission::ViewUserActivity | Permission::ResetPassword | Permission::ManageUserSessions => {
                PermissionCategory::UserManagement
            },
            
            Permission::SystemConfiguration | Permission::DatabaseAccess | Permission::BackupRestore |
            Permission::SecuritySettings | Permission::ViewSystemLogs | Permission::ModifySystemSettings |
            Permission::ManageIntegrations | Permission::SystemMaintenance => {
                PermissionCategory::SystemAdmin
            },
            
            Permission::ViewAuditLogs | Permission::ExportAuditLogs | Permission::GenerateComplianceReports |
            Permission::ViewSecurityReports | Permission::ComplianceConfiguration | Permission::DataRetentionManagement => {
                PermissionCategory::Audit
            },
            
            Permission::ViewBilling | Permission::ModifyBilling | Permission::ProcessPayments |
            Permission::ViewInsuranceClaims | Permission::SubmitInsuranceClaims | Permission::GenerateInvoices |
            Permission::ViewFinancialReports => {
                PermissionCategory::Billing
            },
            
            Permission::ViewSchedule | Permission::ModifySchedule | Permission::CreateAppointment |
            Permission::CancelAppointment | Permission::RescheduleAppointment | Permission::ViewProviderSchedule |
            Permission::ManageTimeSlots | Permission::ViewWaitlist => {
                PermissionCategory::Scheduling
            },
            
            Permission::GenerateReports | Permission::ViewStatistics | Permission::ExportReports |
            Permission::CreateCustomReports | Permission::ViewPerformanceMetrics | Permission::ViewUsageAnalytics => {
                PermissionCategory::Reporting
            },
            
            Permission::SendMessages | Permission::ViewMessages | Permission::BroadcastNotifications |
            Permission::PatientCommunication | Permission::ProviderCommunication => {
                PermissionCategory::Communication
            },
            
            Permission::UploadFiles | Permission::DownloadFiles | Permission::DeleteFiles |
            Permission::ViewFileHistory | Permission::ManageFilePermissions => {
                PermissionCategory::FileManagement
            },
            
            Permission::APIAccess | Permission::WebhookManagement | Permission::ExternalIntegrations |
            Permission::DataImportExport => {
                PermissionCategory::Integration
            },
        }
    }
    
    /// Check if permission requires MFA
    pub fn requires_mfa(&self) -> bool {
        matches!(self,
            Permission::DeletePHI | Permission::ExportPHI | Permission::SystemConfiguration |
            Permission::DatabaseAccess | Permission::BackupRestore | Permission::SecuritySettings |
            Permission::DeleteUser | Permission::AssignRoles | Permission::ModifyRoles |
            Permission::ExportAuditLogs | Permission::ProcessPayments
        )
    }
    
    /// Check if permission is HIPAA-sensitive
    pub fn is_hipaa_sensitive(&self) -> bool {
        matches!(self.category(),
            PermissionCategory::PatientData | PermissionCategory::Audit
        )
    }
    
    /// Get risk level for this permission (1-5, 5 being highest)
    pub fn risk_level(&self) -> u8 {
        match self {
            // Critical PHI operations
            Permission::DeletePHI | Permission::ExportPHI => 5,
            
            // High-risk system operations
            Permission::SystemConfiguration | Permission::DatabaseAccess | Permission::BackupRestore |
            Permission::SecuritySettings | Permission::DeleteUser | Permission::AssignRoles => 5,
            
            // PHI modification operations
            Permission::ModifyPHI | Permission::CreatePatientRecord | Permission::ModifyDemographics |
            Permission::CreateClinicalNotes | Permission::PrescribeMedications => 4,
            
            // PHI viewing operations
            Permission::ViewPHI | Permission::ViewPatientHistory | Permission::ViewClinicalNotes |
            Permission::ViewLabResults | Permission::ViewMedications => 3,
            
            // Administrative operations
            Permission::CreateUser | Permission::ModifyUser | Permission::ViewUserList |
            Permission::ModifyBilling | Permission::ProcessPayments => 3,
            
            // Standard operations
            Permission::ViewSchedule | Permission::CreateAppointment | Permission::SendMessages |
            Permission::GenerateReports | Permission::UploadFiles => 2,
            
            // Low-risk operations
            Permission::ViewStatistics | Permission::ViewMessages | Permission::DownloadFiles => 1,
            
            // Default to medium risk
            _ => 2,
        }
    }
}

/// Role definition with permissions and constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleDefinition {
    /// Role identifier
    pub role: HealthcareRole,
    /// Set of permissions granted to this role
    pub permissions: HashSet<Permission>,
    /// Role description
    pub description: String,
    /// Whether this role can be assigned by non-admin users
    pub self_assignable: bool,
    /// Maximum session duration for this role (minutes)
    pub max_session_duration: i64,
    /// Whether role requires MFA for any operations
    pub requires_mfa: bool,
    /// IP address restrictions (if any)
    pub ip_restrictions: Option<Vec<String>>,
    /// Time-based access restrictions
    pub time_restrictions: Option<TimeRestrictions>,
    /// Data access limitations
    pub data_restrictions: Option<DataRestrictions>,
}

/// Time-based access restrictions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRestrictions {
    /// Allowed hours of access (0-23)
    pub allowed_hours: Vec<u8>,
    /// Allowed days of week (0-6, 0=Sunday)
    pub allowed_days: Vec<u8>,
    /// Timezone for restrictions
    pub timezone: String,
    /// Emergency override available
    pub emergency_override: bool,
}

/// Data access restrictions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataRestrictions {
    /// Maximum number of patient records accessible per session
    pub max_patient_records: Option<u32>,
    /// Allowed data age in days (None = no restriction)
    pub max_data_age_days: Option<u32>,
    /// Restricted data types
    pub restricted_data_types: Vec<String>,
    /// Department/unit restrictions
    pub department_restrictions: Option<Vec<String>>,
    /// Location-based restrictions
    pub location_restrictions: Option<Vec<String>>,
}

/// Permission check context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionContext {
    /// User ID requesting permission
    pub user_id: Uuid,
    /// User's role
    pub role: HealthcareRole,
    /// Requested permission
    pub permission: Permission,
    /// Resource being accessed (optional)
    pub resource_id: Option<String>,
    /// Patient ID (for PHI access)
    pub patient_id: Option<Uuid>,
    /// IP address of request
    pub ip_address: Option<String>,
    /// Timestamp of request
    pub timestamp: DateTime<Utc>,
    /// Session ID
    pub session_id: String,
    /// MFA verification status
    pub mfa_verified: bool,
    /// Additional context metadata
    pub metadata: HashMap<String, String>,
}

/// Result of permission check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionResult {
    /// Whether permission is granted
    pub granted: bool,
    /// Reason for denial (if denied)
    pub denial_reason: Option<String>,
    /// Whether MFA is required for this operation
    pub mfa_required: bool,
    /// Additional requirements or warnings
    pub requirements: Vec<String>,
    /// Risk assessment for this operation
    pub risk_assessment: RiskAssessment,
}

/// Risk assessment for permission check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    /// Risk level (1-5)
    pub level: u8,
    /// Risk factors identified
    pub factors: Vec<String>,
    /// Recommended security measures
    pub recommendations: Vec<String>,
    /// Whether additional monitoring is recommended
    pub requires_monitoring: bool,
}

/// RBAC service for healthcare permissions
pub struct RbacService {
    /// Role definitions
    roles: Arc<RwLock<HashMap<HealthcareRole, RoleDefinition>>>,
    /// Permission cache for performance
    permission_cache: Arc<RwLock<HashMap<String, PermissionResult>>>,
    /// Active permission checks (for audit trail)
    active_checks: Arc<RwLock<HashMap<String, PermissionContext>>>,
}

impl RbacService {
    /// Create new RBAC service with default healthcare roles
    pub fn new() -> Self {
        let service = Self {
            roles: Arc::new(RwLock::new(HashMap::new())),
            permission_cache: Arc::new(RwLock::new(HashMap::new())),
            active_checks: Arc::new(RwLock::new(HashMap::new())),
        };
        
        // Initialize default healthcare roles
        service.initialize_default_roles();
        service
    }
    
    /// Initialize default healthcare role definitions
    fn initialize_default_roles(&self) {
        let mut roles = self.roles.write().unwrap();
        
        // Super Administrator
        roles.insert(HealthcareRole::SuperAdmin, RoleDefinition {
            role: HealthcareRole::SuperAdmin,
            permissions: self.get_super_admin_permissions(),
            description: "Full system access with all permissions".to_string(),
            self_assignable: false,
            max_session_duration: 480, // 8 hours
            requires_mfa: true,
            ip_restrictions: None,
            time_restrictions: None,
            data_restrictions: None,
        });
        
        // Healthcare Provider
        roles.insert(HealthcareRole::HealthcareProvider, RoleDefinition {
            role: HealthcareRole::HealthcareProvider,
            permissions: self.get_healthcare_provider_permissions(),
            description: "Licensed healthcare provider with PHI access".to_string(),
            self_assignable: false,
            max_session_duration: 720, // 12 hours
            requires_mfa: true,
            ip_restrictions: None,
            time_restrictions: Some(TimeRestrictions {
                allowed_hours: (6..22).collect(), // 6 AM to 10 PM
                allowed_days: (0..7).collect(), // All days
                timezone: "UTC".to_string(),
                emergency_override: true,
            }),
            data_restrictions: Some(DataRestrictions {
                max_patient_records: Some(100),
                max_data_age_days: None,
                restricted_data_types: vec![],
                department_restrictions: None,
                location_restrictions: None,
            }),
        });
        
        // Administrative Staff
        roles.insert(HealthcareRole::AdministrativeStaff, RoleDefinition {
            role: HealthcareRole::AdministrativeStaff,
            permissions: self.get_admin_staff_permissions(),
            description: "Administrative staff with limited PHI access".to_string(),
            self_assignable: false,
            max_session_duration: 480, // 8 hours
            requires_mfa: false,
            ip_restrictions: None,
            time_restrictions: Some(TimeRestrictions {
                allowed_hours: (8..18).collect(), // 8 AM to 6 PM
                allowed_days: (1..6).collect(), // Monday to Friday
                timezone: "UTC".to_string(),
                emergency_override: false,
            }),
            data_restrictions: Some(DataRestrictions {
                max_patient_records: Some(50),
                max_data_age_days: Some(365), // 1 year
                restricted_data_types: vec!["clinical_notes".to_string(), "lab_results".to_string()],
                department_restrictions: None,
                location_restrictions: None,
            }),
        });
        
        // Add other roles...
        self.add_remaining_roles(&mut roles);
    }
    
    /// Add remaining healthcare roles
    fn add_remaining_roles(&self, roles: &mut HashMap<HealthcareRole, RoleDefinition>) {
        // Billing Staff
        roles.insert(HealthcareRole::BillingStaff, RoleDefinition {
            role: HealthcareRole::BillingStaff,
            permissions: self.get_billing_staff_permissions(),
            description: "Billing and insurance processing staff".to_string(),
            self_assignable: false,
            max_session_duration: 480,
            requires_mfa: false,
            ip_restrictions: None,
            time_restrictions: Some(TimeRestrictions {
                allowed_hours: (8..17).collect(),
                allowed_days: (1..6).collect(),
                timezone: "UTC".to_string(),
                emergency_override: false,
            }),
            data_restrictions: Some(DataRestrictions {
                max_patient_records: Some(200),
                max_data_age_days: Some(2555), // 7 years for billing
                restricted_data_types: vec!["clinical_notes".to_string()],
                department_restrictions: None,
                location_restrictions: None,
            }),
        });
        
        // Patient
        roles.insert(HealthcareRole::Patient, RoleDefinition {
            role: HealthcareRole::Patient,
            permissions: self.get_patient_permissions(),
            description: "Patient with access to own records".to_string(),
            self_assignable: true,
            max_session_duration: 120, // 2 hours
            requires_mfa: false,
            ip_restrictions: None,
            time_restrictions: None,
            data_restrictions: Some(DataRestrictions {
                max_patient_records: Some(1), // Only own records
                max_data_age_days: None,
                restricted_data_types: vec![],
                department_restrictions: None,
                location_restrictions: None,
            }),
        });
        
        // Add other roles (TechnicalSupport, Auditor, Guest)...
    }
    
    /// Check if user has permission for specific operation
    pub async fn check_permission(&self, context: PermissionContext) -> Result<PermissionResult, SecurityError> {
        // Store context for audit trail
        let check_id = Uuid::new_v4().to_string();
        self.active_checks.write().unwrap().insert(check_id.clone(), context.clone());
        
        // Check cache first
        let cache_key = format!("{}:{}:{:?}", context.user_id, context.session_id, context.permission);
        if let Some(cached_result) = self.permission_cache.read().unwrap().get(&cache_key) {
            return Ok(cached_result.clone());
        }
        
        // Get role definition
        let role_def = self.roles.read().unwrap()
            .get(&context.role)
            .cloned()
            .ok_or_else(|| SecurityError::AuthorizationDenied {
                action: format!("{:?}", context.permission),
                role: format!("{:?}", context.role),
            })?;
        
        // Check if role has the permission
        if !role_def.permissions.contains(&context.permission) {
            return Ok(PermissionResult {
                granted: false,
                denial_reason: Some(format!("Role {:?} does not have permission {:?}", context.role, context.permission)),
                mfa_required: false,
                requirements: vec![],
                risk_assessment: RiskAssessment {
                    level: 1,
                    factors: vec!["Permission not granted to role".to_string()],
                    recommendations: vec![],
                    requires_monitoring: false,
                },
            });
        }
        
        // Perform additional checks
        let mut requirements = Vec::new();
        let mut risk_factors = Vec::new();
        let mut denial_reason = None;
        
        // Check MFA requirement
        let mfa_required = context.permission.requires_mfa() || role_def.requires_mfa;
        if mfa_required && !context.mfa_verified {
            return Ok(PermissionResult {
                granted: false,
                denial_reason: Some("Multi-factor authentication required".to_string()),
                mfa_required: true,
                requirements: vec!["Complete MFA verification".to_string()],
                risk_assessment: RiskAssessment {
                    level: 3,
                    factors: vec!["MFA required but not verified".to_string()],
                    recommendations: vec!["Complete MFA verification before proceeding".to_string()],
                    requires_monitoring: true,
                },
            });
        }
        
        // Check time restrictions
        if let Some(time_restrictions) = &role_def.time_restrictions {
            if !self.check_time_restrictions(time_restrictions, &context.timestamp) {
                if !time_restrictions.emergency_override {
                    denial_reason = Some("Access denied due to time restrictions".to_string());
                } else {
                    requirements.push("Emergency override required for time restriction".to_string());
                    risk_factors.push("Access outside allowed hours".to_string());
                }
            }
        }
        
        // Check data restrictions
        if let Some(data_restrictions) = &role_def.data_restrictions {
            let data_check_result = self.check_data_restrictions(data_restrictions, &context);
            if !data_check_result.0 {
                denial_reason = Some(data_check_result.1);
            }
            risk_factors.extend(data_check_result.2);
        }
        
        // Check IP restrictions
        if let Some(ip_restrictions) = &role_def.ip_restrictions {
            if let Some(ip) = &context.ip_address {
                if !ip_restrictions.contains(ip) {
                    denial_reason = Some("Access denied from this IP address".to_string());
                    risk_factors.push("Access from non-whitelisted IP".to_string());
                }
            }
        }
        
        // Calculate risk assessment
        let risk_level = std::cmp::max(context.permission.risk_level(), 
            if risk_factors.is_empty() { 1 } else { 3 });
        
        let granted = denial_reason.is_none();
        
        // Generate recommendations
        let mut recommendations = Vec::new();
        if context.permission.is_hipaa_sensitive() {
            recommendations.push("HIPAA audit trail required".to_string());
        }
        if risk_level >= 4 {
            recommendations.push("Additional security monitoring recommended".to_string());
        }
        
        let result = PermissionResult {
            granted,
            denial_reason,
            mfa_required,
            requirements,
            risk_assessment: RiskAssessment {
                level: risk_level,
                factors: risk_factors,
                recommendations,
                requires_monitoring: risk_level >= 3 || context.permission.is_hipaa_sensitive(),
            },
        };
        
        // Cache result
        self.permission_cache.write().unwrap().insert(cache_key, result.clone());
        
        // Log permission check
        log::info!("Permission check for user {}: {:?} -> {}", 
            context.user_id, context.permission, granted);
        
        if context.permission.is_hipaa_sensitive() {
            // Would integrate with audit system here
            log::warn!("HIPAA-sensitive permission accessed: {:?} by user {}", 
                context.permission, context.user_id);
        }
        
        Ok(result)
    }
    
    /// Check time-based restrictions
    fn check_time_restrictions(&self, restrictions: &TimeRestrictions, timestamp: &DateTime<Utc>) -> bool {
        let hour = timestamp.hour() as u8;
        let weekday = timestamp.weekday().num_days_from_sunday() as u8 - 1; // Convert to 0-6
        
        restrictions.allowed_hours.contains(&hour) && restrictions.allowed_days.contains(&weekday)
    }
    
    /// Check data access restrictions
    fn check_data_restrictions(&self, restrictions: &DataRestrictions, context: &PermissionContext) -> (bool, String, Vec<String>) {
        let mut risk_factors = Vec::new();
        
        // Check max patient records (simplified - would check against session data)
        if let Some(max_records) = restrictions.max_patient_records {
            if max_records < 10 { // Arbitrary threshold for demonstration
                risk_factors.push("Limited patient record access".to_string());
            }
        }
        
        // Check data age restrictions
        if let Some(max_age) = restrictions.max_data_age_days {
            risk_factors.push(format!("Data access limited to {} days", max_age));
        }
        
        // Check restricted data types
        if !restrictions.restricted_data_types.is_empty() {
            risk_factors.push("Some data types are restricted".to_string());
        }
        
        (true, String::new(), risk_factors) // Simplified implementation
    }
    
    /// Get all permissions for super admin
    fn get_super_admin_permissions(&self) -> HashSet<Permission> {
        // Super admin gets all permissions
        vec![
            Permission::ViewPHI, Permission::ModifyPHI, Permission::DeletePHI, Permission::ExportPHI,
            Permission::ViewPatientHistory, Permission::CreatePatientRecord, Permission::ViewDemographics,
            Permission::ModifyDemographics, Permission::ViewClinicalNotes, Permission::CreateClinicalNotes,
            Permission::ViewLabResults, Permission::CreateLabResults, Permission::ViewMedications,
            Permission::PrescribeMedications, Permission::ViewAllergies, Permission::ModifyAllergies,
            Permission::ViewInsuranceInfo, Permission::ModifyInsuranceInfo,
            Permission::CreateUser, Permission::ModifyUser, Permission::DeleteUser, Permission::ViewUserList,
            Permission::AssignRoles, Permission::ModifyRoles, Permission::ViewUserActivity, Permission::ResetPassword,
            Permission::ManageUserSessions, Permission::SystemConfiguration, Permission::DatabaseAccess,
            Permission::BackupRestore, Permission::SecuritySettings, Permission::ViewSystemLogs,
            Permission::ModifySystemSettings, Permission::ManageIntegrations, Permission::SystemMaintenance,
            Permission::ViewAuditLogs, Permission::ExportAuditLogs, Permission::GenerateComplianceReports,
            Permission::ViewSecurityReports, Permission::ComplianceConfiguration, Permission::DataRetentionManagement,
            Permission::ViewBilling, Permission::ModifyBilling, Permission::ProcessPayments,
            Permission::ViewInsuranceClaims, Permission::SubmitInsuranceClaims, Permission::GenerateInvoices,
            Permission::ViewFinancialReports, Permission::ViewSchedule, Permission::ModifySchedule,
            Permission::CreateAppointment, Permission::CancelAppointment, Permission::RescheduleAppointment,
            Permission::ViewProviderSchedule, Permission::ManageTimeSlots, Permission::ViewWaitlist,
            Permission::GenerateReports, Permission::ViewStatistics, Permission::ExportReports,
            Permission::CreateCustomReports, Permission::ViewPerformanceMetrics, Permission::ViewUsageAnalytics,
            Permission::SendMessages, Permission::ViewMessages, Permission::BroadcastNotifications,
            Permission::PatientCommunication, Permission::ProviderCommunication, Permission::UploadFiles,
            Permission::DownloadFiles, Permission::DeleteFiles, Permission::ViewFileHistory,
            Permission::ManageFilePermissions, Permission::APIAccess, Permission::WebhookManagement,
            Permission::ExternalIntegrations, Permission::DataImportExport,
        ].into_iter().collect()
    }
    
    /// Get permissions for healthcare provider
    fn get_healthcare_provider_permissions(&self) -> HashSet<Permission> {
        vec![
            Permission::ViewPHI, Permission::ModifyPHI, Permission::ViewPatientHistory,
            Permission::CreatePatientRecord, Permission::ViewDemographics, Permission::ModifyDemographics,
            Permission::ViewClinicalNotes, Permission::CreateClinicalNotes, Permission::ViewLabResults,
            Permission::CreateLabResults, Permission::ViewMedications, Permission::PrescribeMedications,
            Permission::ViewAllergies, Permission::ModifyAllergies, Permission::ViewSchedule,
            Permission::ModifySchedule, Permission::CreateAppointment, Permission::CancelAppointment,
            Permission::RescheduleAppointment, Permission::ViewProviderSchedule, Permission::PatientCommunication,
            Permission::UploadFiles, Permission::DownloadFiles, Permission::ViewFileHistory,
        ].into_iter().collect()
    }
    
    /// Get permissions for administrative staff
    fn get_admin_staff_permissions(&self) -> HashSet<Permission> {
        vec![
            Permission::ViewDemographics, Permission::ModifyDemographics, Permission::ViewInsuranceInfo,
            Permission::ModifyInsuranceInfo, Permission::ViewSchedule, Permission::ModifySchedule,
            Permission::CreateAppointment, Permission::CancelAppointment, Permission::RescheduleAppointment,
            Permission::ViewWaitlist, Permission::PatientCommunication, Permission::UploadFiles,
            Permission::DownloadFiles,
        ].into_iter().collect()
    }
    
    /// Get permissions for billing staff
    fn get_billing_staff_permissions(&self) -> HashSet<Permission> {
        vec![
            Permission::ViewDemographics, Permission::ViewInsuranceInfo, Permission::ViewBilling,
            Permission::ModifyBilling, Permission::ProcessPayments, Permission::ViewInsuranceClaims,
            Permission::SubmitInsuranceClaims, Permission::GenerateInvoices, Permission::ViewFinancialReports,
        ].into_iter().collect()
    }
    
    /// Get permissions for patients
    fn get_patient_permissions(&self) -> HashSet<Permission> {
        vec![
            Permission::ViewDemographics, // Own demographics only
            Permission::ViewSchedule,     // Own schedule only
            Permission::CreateAppointment,
            Permission::CancelAppointment,
            Permission::RescheduleAppointment,
            Permission::ViewMessages,
            Permission::SendMessages,     // To providers only
        ].into_iter().collect()
    }
    
    /// Add custom role
    pub async fn add_role(&self, role_def: RoleDefinition) -> Result<(), SecurityError> {
        self.roles.write().unwrap().insert(role_def.role.clone(), role_def);
        log::info!("Added custom role definition");
        Ok(())
    }
    
    /// Modify existing role permissions
    pub async fn modify_role_permissions(&self, role: &HealthcareRole, permissions: HashSet<Permission>) -> Result<(), SecurityError> {
        let mut roles = self.roles.write().unwrap();
        if let Some(role_def) = roles.get_mut(role) {
            role_def.permissions = permissions;
            log::info!("Modified permissions for role {:?}", role);
            Ok(())
        } else {
            Err(SecurityError::AuthorizationDenied {
                action: "modify_role".to_string(),
                role: format!("{:?}", role),
            })
        }
    }
    
    /// Get role definition
    pub fn get_role_definition(&self, role: &HealthcareRole) -> Option<RoleDefinition> {
        self.roles.read().unwrap().get(role).cloned()
    }
    
    /// Clear permission cache
    pub fn clear_cache(&self) {
        self.permission_cache.write().unwrap().clear();
        log::info!("Cleared permission cache");
    }
    
    /// Get permission check statistics
    pub fn get_permission_stats(&self) -> (usize, usize) {
        (
            self.permission_cache.read().unwrap().len(),
            self.active_checks.read().unwrap().len(),
        )
    }
}

/// Initialize RBAC system
pub async fn initialize_rbac_system() -> Result<(), SecurityError> {
    let rbac_service = RbacService::new();
    
    // Verify role definitions
    for role in [
        HealthcareRole::SuperAdmin,
        HealthcareRole::HealthcareProvider,
        HealthcareRole::AdministrativeStaff,
        HealthcareRole::BillingStaff,
        HealthcareRole::Patient,
    ] {
        let role_def = rbac_service.get_role_definition(&role)
            .ok_or_else(|| SecurityError::AuthorizationDenied {
                action: "verify_role".to_string(),
                role: format!("{:?}", role),
            })?;
        
        if role_def.permissions.is_empty() {
            return Err(SecurityError::AuthorizationDenied {
                action: "verify_permissions".to_string(),
                role: format!("{:?}", role),
            });
        }
    }
    
    log::info!("HIPAA-compliant RBAC system initialized with {} roles", 
        rbac_service.roles.read().unwrap().len());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_permission_categories() {
        assert_eq!(Permission::ViewPHI.category(), PermissionCategory::PatientData);
        assert_eq!(Permission::CreateUser.category(), PermissionCategory::UserManagement);
        assert_eq!(Permission::SystemConfiguration.category(), PermissionCategory::SystemAdmin);
    }
    
    #[test]
    fn test_permission_risk_levels() {
        assert_eq!(Permission::DeletePHI.risk_level(), 5);
        assert_eq!(Permission::ViewPHI.risk_level(), 3);
        assert_eq!(Permission::ViewMessages.risk_level(), 1);
    }
    
    #[test]
    fn test_permission_mfa_requirements() {
        assert!(Permission::DeletePHI.requires_mfa());
        assert!(Permission::SystemConfiguration.requires_mfa());
        assert!(!Permission::ViewMessages.requires_mfa());
    }
    
    #[tokio::test]
    async fn test_rbac_service_initialization() {
        let rbac_service = RbacService::new();
        
        let super_admin_def = rbac_service.get_role_definition(&HealthcareRole::SuperAdmin).unwrap();
        let patient_def = rbac_service.get_role_definition(&HealthcareRole::Patient).unwrap();
        
        assert!(super_admin_def.permissions.contains(&Permission::DeletePHI));
        assert!(!patient_def.permissions.contains(&Permission::DeletePHI));
        assert!(patient_def.permissions.contains(&Permission::ViewSchedule));
    }
    
    #[tokio::test]
    async fn test_permission_check() {
        let rbac_service = RbacService::new();
        
        let context = PermissionContext {
            user_id: Uuid::new_v4(),
            role: HealthcareRole::HealthcareProvider,
            permission: Permission::ViewPHI,
            resource_id: None,
            patient_id: Some(Uuid::new_v4()),
            ip_address: Some("192.168.1.100".to_string()),
            timestamp: Utc::now(),
            session_id: Uuid::new_v4().to_string(),
            mfa_verified: true,
            metadata: HashMap::new(),
        };
        
        let result = rbac_service.check_permission(context).await.unwrap();
        assert!(result.granted);
        
        // Test denied permission
        let denied_context = PermissionContext {
            permission: Permission::SystemConfiguration,
            mfa_verified: true,
            ..context
        };
        
        let denied_result = rbac_service.check_permission(denied_context).await.unwrap();
        assert!(!denied_result.granted);
    }
}