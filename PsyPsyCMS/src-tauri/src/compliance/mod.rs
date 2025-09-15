//! Quebec Law 25 Compliance Module
//!
//! Provides comprehensive compliance tracking and audit logging for Quebec's Law 25
//! (An Act to modernize legislative provisions as regards the protection of personal information).
//! This includes consent management, audit trails, data subject rights, and breach reporting.

pub mod quebec_law25;

pub use quebec_law25::{
    QuebecComplianceTracker,
    QuebecComplianceEvent,
    QuebecAuditLog,
    ComplianceValidationResult,
    QuebecComplianceError,
};