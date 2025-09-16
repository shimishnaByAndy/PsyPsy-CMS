//! Storage module for PsyPsy CMS
//!
//! Provides encrypted storage capabilities for medical data with Quebec Law 25 compliance.
//! All data is encrypted at rest using medical-grade encryption and stored with comprehensive
//! audit logging for regulatory compliance.

// Temporarily disabled due to sqlx dependency
// pub mod medical_notes_store;

// pub use medical_notes_store::{
//     MedicalNotesStore,
//     MedicalNotesError,
//     EncryptedMedicalNote,
//     MedicalNoteContent,
//     QuebecSpecificData,
//     SyncConflict,
// };