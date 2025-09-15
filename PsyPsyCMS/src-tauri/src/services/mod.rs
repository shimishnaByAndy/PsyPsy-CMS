// pub mod firebase_service;  // Commented out temporarily for compilation
pub mod firebase_service_simple;
pub mod offline_service;

// Use simple Firebase service for initial compilation
pub use firebase_service_simple::FirebaseService;
pub use offline_service::OfflineService;