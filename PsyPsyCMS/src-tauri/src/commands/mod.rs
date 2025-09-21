pub mod auth_commands;
pub mod client_commands;
pub mod professional_commands;
pub mod appointment_commands;
pub mod dashboard_commands;
pub mod medical_notes_commands;
pub mod offline_sync_commands;
pub mod social_media_commands;
pub mod debug_commands;

// Note: Individual commands are imported directly in lib.rs for better granular control
// Blanket re-exports removed to eliminate unused import warnings