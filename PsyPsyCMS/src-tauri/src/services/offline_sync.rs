use crate::services::encrypted_storage::{EncryptedNoteStorage, MedicalNote, SyncStatus};
use crate::services::firebase_service_simple::FirebaseService;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tokio::time::{interval, Duration};
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
pub enum SyncError {
    #[error("Storage error: {0}")]
    #[allow(dead_code)] // Healthcare data sync functionality
    Storage(String),
    #[error("Firebase error: {0}")]
    #[allow(dead_code)] // Healthcare data sync functionality
    Firebase(String),
    #[error("Conflict resolution failed: {0}")]
    #[allow(dead_code)] // Healthcare data sync functionality
    ConflictResolution(String),
    #[error("Network error: {0}")]
    #[allow(dead_code)] // Healthcare data sync functionality
    Network(String),
    #[error("Sync disabled due to compliance violation: {0}")]
    #[allow(dead_code)] // Healthcare data sync functionality
    ComplianceViolation(String),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SyncMetadata {
    pub last_sync: Option<DateTime<Utc>>,
    pub pending_uploads: Vec<String>,
    pub conflict_notes: Vec<String>,
    pub sync_enabled: bool,
    pub firebase_collection: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConflictResolution {
    pub note_id: String,
    pub local_version: MedicalNote,
    pub remote_version: MedicalNote,
    pub resolution_strategy: ResolutionStrategy,
    pub resolved_version: Option<MedicalNote>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ResolutionStrategy {
    UseLocal,
    UseRemote,
    Merge,
    ManualReview,
}

pub struct OfflineSyncService {
    #[allow(dead_code)] // Healthcare data sync functionality
    local_storage: EncryptedNoteStorage,
    firebase_service: Option<FirebaseService>,
    sync_metadata: SyncMetadata,
    #[allow(dead_code)] // Healthcare data sync functionality
    user_id: String,
}

impl OfflineSyncService {
    /// Create new offline sync service
    pub fn new(
        local_storage: EncryptedNoteStorage,
        firebase_service: Option<FirebaseService>,
        user_id: String,
    ) -> Self {
        let sync_metadata = SyncMetadata {
            last_sync: None,
            pending_uploads: Vec::new(),
            conflict_notes: Vec::new(),
            sync_enabled: firebase_service.is_some(),
            firebase_collection: "encrypted_medical_notes".to_string(),
        };

        Self {
            local_storage,
            firebase_service,
            sync_metadata,
            user_id,
        }
    }

    /// Start background sync process
    pub async fn start_background_sync(&mut self) -> Result<(), SyncError> {
        if !self.sync_metadata.sync_enabled {
            tracing::info!("Sync is disabled, running in offline-only mode");
            return Ok(());
        }

        let mut sync_interval = interval(Duration::from_secs(300)); // Sync every 5 minutes

        loop {
            sync_interval.tick().await;

            match self.perform_sync().await {
                Ok(_) => {
                    tracing::info!("Background sync completed successfully");
                }
                Err(e) => {
                    tracing::error!("Background sync failed: {}", e);
                    // Continue running even if sync fails
                }
            }
        }
    }

    /// Perform full sync operation
    pub async fn perform_sync(&mut self) -> Result<(), SyncError> {
        if !self.sync_metadata.sync_enabled {
            return Err(SyncError::Network("Sync is disabled".to_string()));
        }

        tracing::info!("Starting sync operation for user: {}", self.user_id);

        // Step 1: Upload pending local changes
        self.upload_pending_notes().await?;

        // Step 2: Download remote changes
        self.download_remote_changes().await?;

        // Step 3: Resolve conflicts
        self.resolve_conflicts().await?;

        // Step 4: Update sync metadata
        self.sync_metadata.last_sync = Some(Utc::now());

        tracing::info!("Sync operation completed successfully");
        Ok(())
    }

    /// Upload pending local notes to Firebase
    async fn upload_pending_notes(&mut self) -> Result<(), SyncError> {
        let _firebase = self.firebase_service.as_ref()
            .ok_or_else(|| SyncError::Firebase("Firebase service not available".to_string()))?;

        let pending_notes = self.get_pending_notes().await?;

        for note in pending_notes {
            match self.upload_note_to_firebase(&note).await {
                Ok(_) => {
                    // Update local note status to synced
                    let mut updated_note = note.clone();
                    updated_note.sync_status = SyncStatus::Synced;

                    self.local_storage
                        .save_note(updated_note, &self.user_id)
                        .await
                        .map_err(|e| SyncError::Storage(format!("Failed to update note status: {}", e)))?;

                    tracing::info!("Successfully uploaded note: {}", if note.id.is_empty() { "unknown" } else { &note.id });
                }
                Err(e) => {
                    tracing::error!("Failed to upload note {}: {}", if note.id.is_empty() { "unknown" } else { &note.id }, e);
                    // Mark as conflict for manual review
                    let mut updated_note = note.clone();
                    updated_note.sync_status = SyncStatus::Conflict;

                    self.local_storage
                        .save_note(updated_note, &self.user_id)
                        .await
                        .map_err(|e| SyncError::Storage(format!("Failed to update note status: {}", e)))?;
                }
            }
        }

        Ok(())
    }

    /// Download remote changes from Firebase
    async fn download_remote_changes(&mut self) -> Result<(), SyncError> {
        let _firebase = self.firebase_service.as_ref()
            .ok_or_else(|| SyncError::Firebase("Firebase service not available".to_string()))?;

        // Query Firebase for notes modified since last sync
        let last_sync = self.sync_metadata.last_sync.unwrap_or_else(|| {
            // If no previous sync, get notes from last 30 days
            Utc::now() - chrono::Duration::days(30)
        });

        // In a real implementation, this would query Firebase with a timestamp filter
        // For now, we'll get all notes and filter locally
        let remote_notes = self.get_remote_notes_since(last_sync).await?;

        for remote_note in remote_notes {
            match self.process_remote_note(remote_note).await {
                Ok(_) => {
                    tracing::debug!("Successfully processed remote note");
                }
                Err(e) => {
                    tracing::error!("Failed to process remote note: {}", e);
                }
            }
        }

        Ok(())
    }

    /// Process a remote note (download and merge with local)
    async fn process_remote_note(&mut self, remote_note: MedicalNote) -> Result<(), SyncError> {
        let note_id = &remote_note.id;
        if note_id.is_empty() {
            return Err(SyncError::Storage("Remote note missing ID".to_string()));
        }

        // Check if we have a local version
        match self.local_storage.get_note(note_id, &self.user_id).await {
            Ok(Some(local_note)) => {
                // We have both local and remote versions - check for conflicts
                if local_note.modified_at > remote_note.modified_at {
                    // Local is newer - potential conflict
                    if local_note.sync_status == SyncStatus::Pending {
                        // Local has uncommitted changes - this is a conflict
                        self.create_conflict_record(local_note, remote_note).await?;
                    } else {
                        // Local is newer but synced - ignore remote
                        tracing::debug!("Local note is newer, ignoring remote version");
                    }
                } else {
                    // Remote is newer or same - update local
                    let mut updated_note = remote_note;
                    updated_note.sync_status = SyncStatus::Synced;

                    self.local_storage
                        .save_note(updated_note, &self.user_id)
                        .await
                        .map_err(|e| SyncError::Storage(format!("Failed to update local note: {}", e)))?;
                }
            }
            Ok(None) => {
                // No local version - download remote
                let mut new_note = remote_note;
                new_note.sync_status = SyncStatus::Synced;

                self.local_storage
                    .save_note(new_note, &self.user_id)
                    .await
                    .map_err(|e| SyncError::Storage(format!("Failed to save remote note: {}", e)))?;
            }
            Err(e) => {
                return Err(SyncError::Storage(format!("Failed to check local note: {}", e)));
            }
        }

        Ok(())
    }

    /// Create conflict record for manual resolution
    async fn create_conflict_record(&mut self, local_note: MedicalNote, remote_note: MedicalNote) -> Result<(), SyncError> {
        let conflict = ConflictResolution {
            note_id: if local_note.id.is_empty() { Uuid::new_v4().to_string() } else { local_note.id.clone() },
            local_version: local_note.clone(),
            remote_version: remote_note,
            resolution_strategy: ResolutionStrategy::ManualReview,
            resolved_version: None,
        };

        // Save conflict record (in a real implementation, this would be stored separately)
        tracing::warn!("Conflict detected for note: {}", conflict.note_id);

        // Mark local note as conflict
        let mut conflicted_note = local_note;
        conflicted_note.sync_status = SyncStatus::Conflict;

        self.local_storage
            .save_note(conflicted_note, &self.user_id)
            .await
            .map_err(|e| SyncError::Storage(format!("Failed to mark note as conflict: {}", e)))?;

        self.sync_metadata.conflict_notes.push(conflict.note_id);

        Ok(())
    }

    /// Resolve conflicts using automatic strategies
    async fn resolve_conflicts(&mut self) -> Result<(), SyncError> {
        let conflict_notes = self.sync_metadata.conflict_notes.clone();

        for note_id in conflict_notes {
            match self.resolve_single_conflict(&note_id).await {
                Ok(resolved) => {
                    if resolved {
                        // Remove from conflict list
                        self.sync_metadata.conflict_notes.retain(|id| id != &note_id);
                        tracing::info!("Conflict resolved for note: {}", note_id);
                    }
                }
                Err(e) => {
                    tracing::error!("Failed to resolve conflict for note {}: {}", note_id, e);
                }
            }
        }

        Ok(())
    }

    /// Resolve a single conflict
    async fn resolve_single_conflict(&mut self, note_id: &str) -> Result<bool, SyncError> {
        // In a real implementation, this would load the conflict record
        // For now, we'll use a simple strategy: manual review required
        tracing::info!("Conflict for note {} requires manual review", note_id);
        Ok(false) // Not automatically resolved
    }

    /// Get notes that need to be uploaded
    async fn get_pending_notes(&self) -> Result<Vec<MedicalNote>, SyncError> {
        // In a real implementation, this would query the local storage for pending notes
        // For now, return empty list
        Ok(Vec::new())
    }

    /// Upload a single note to Firebase
    async fn upload_note_to_firebase(&self, note: &MedicalNote) -> Result<(), SyncError> {
        let firebase = self.firebase_service.as_ref()
            .ok_or_else(|| SyncError::Firebase("Firebase service not available".to_string()))?;

        // Validate Quebec Law 25 compliance before upload
        if !note.consent_obtained || !note.quebec_compliance.law_25_consent {
            return Err(SyncError::ComplianceViolation(
                "Cannot sync note without proper Quebec Law 25 consent".to_string()
            ));
        }

        // Create Firebase document
        let document_data = serde_json::to_value(note)
            .map_err(|e| SyncError::Firebase(format!("Failed to serialize note: {}", e)))?;

        let collection = &self.sync_metadata.firebase_collection;
        let document_id = &note.id;
        if document_id.is_empty() {
            return Err(SyncError::Storage("Note missing ID".to_string()));
        }

        firebase
            .create_document(collection, document_id, &document_data)
            .await
            .map_err(|e| SyncError::Firebase(format!("Failed to upload to Firebase: {:?}", e)))?;

        tracing::info!("Note uploaded to Firebase: {}", document_id);
        Ok(())
    }

    /// Get remote notes modified since timestamp
    async fn get_remote_notes_since(&self, _since: DateTime<Utc>) -> Result<Vec<MedicalNote>, SyncError> {
        let _firebase = self.firebase_service.as_ref()
            .ok_or_else(|| SyncError::Firebase("Firebase service not available".to_string()))?;

        // In a real implementation, this would query Firebase with timestamp filter
        // For now, return empty list
        Ok(Vec::new())
    }

    /// Force sync a specific note
    pub async fn force_sync_note(&mut self, note_id: &str) -> Result<(), SyncError> {
        if !self.sync_metadata.sync_enabled {
            return Err(SyncError::Network("Sync is disabled".to_string()));
        }

        let note = self.local_storage
            .get_note(note_id, &self.user_id)
            .await
            .map_err(|e| SyncError::Storage(format!("Failed to get note: {}", e)))?
            .ok_or_else(|| SyncError::Storage("Note not found".to_string()))?;

        self.upload_note_to_firebase(&note).await?;

        // Update note status
        let mut updated_note = note;
        updated_note.sync_status = SyncStatus::Synced;

        self.local_storage
            .save_note(updated_note, &self.user_id)
            .await
            .map_err(|e| SyncError::Storage(format!("Failed to update note status: {}", e)))?;

        tracing::info!("Force sync completed for note: {}", note_id);
        Ok(())
    }

    /// Get sync status
    pub fn get_sync_status(&self) -> &SyncMetadata {
        &self.sync_metadata
    }

    /// Enable/disable sync
    pub fn set_sync_enabled(&mut self, enabled: bool) {
        self.sync_metadata.sync_enabled = enabled && self.firebase_service.is_some();
        tracing::info!("Sync enabled: {}", self.sync_metadata.sync_enabled);
    }

    /// Get conflict notes for manual resolution
    pub async fn get_conflict_notes(&self) -> Result<Vec<MedicalNote>, SyncError> {
        let mut conflicts = Vec::new();

        for note_id in &self.sync_metadata.conflict_notes {
            if let Ok(Some(note)) = self.local_storage.get_note(note_id, &self.user_id).await {
                if note.sync_status == SyncStatus::Conflict {
                    conflicts.push(note);
                }
            }
        }

        Ok(conflicts)
    }

    /// Manually resolve a conflict
    pub async fn resolve_conflict_manually(&mut self, note_id: &str, resolution: ResolutionStrategy, resolved_note: MedicalNote) -> Result<(), SyncError> {
        // Save the resolved note
        let mut final_note = resolved_note;
        final_note.sync_status = SyncStatus::Pending; // Will be synced on next upload

        self.local_storage
            .save_note(final_note, &self.user_id)
            .await
            .map_err(|e| SyncError::Storage(format!("Failed to save resolved note: {}", e)))?;

        // Remove from conflict list
        self.sync_metadata.conflict_notes.retain(|id| id != note_id);

        tracing::info!("Conflict manually resolved for note: {} using strategy: {:?}", note_id, resolution);
        Ok(())
    }
}