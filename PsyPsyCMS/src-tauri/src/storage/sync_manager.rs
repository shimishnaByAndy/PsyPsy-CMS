use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;
use tokio::time::{interval, Duration, sleep};
use tokio::sync::{Mutex, RwLock};
use std::sync::Arc;

use crate::storage::medical_notes_store::{MedicalNotesStore, MedicalNotesError, EncryptedMedicalNote, MedicalNoteContent, SyncConflict};
use crate::services::firebase_service_quebec::QuebecFirebaseService;
use crate::compliance::quebec_law25::QuebecComplianceTracker;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncStrategy {
    /// Automatic sync with exponential backoff
    AutomaticExponentialBackoff { base_interval_secs: u64, max_interval_secs: u64 },
    /// Manual sync only when explicitly requested
    ManualOnly,
    /// Scheduled sync at specific intervals
    Scheduled { interval_secs: u64 },
    /// Adaptive sync based on network conditions and usage patterns
    Adaptive { min_interval_secs: u64, max_interval_secs: u64 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConflictResolutionStrategy {
    /// Last write wins (timestamp-based)
    LastWriteWins,
    /// Always prefer local changes
    PreferLocal,
    /// Always prefer remote changes
    PreferRemote,
    /// Require manual resolution
    ManualResolution,
    /// Merge changes intelligently (field-level)
    IntelligentMerge,
    /// Professional decides (present both versions)
    ProfessionalDecision,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncStatus {
    Idle,
    Syncing,
    Conflict { conflict_count: usize },
    Error { error_message: String, retry_count: usize },
    OfflineMode,
    Paused,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStatistics {
    pub total_synced: u64,
    pub successful_syncs: u64,
    pub failed_syncs: u64,
    pub conflicts_resolved: u64,
    pub conflicts_pending: u64,
    pub last_sync_at: Option<DateTime<Utc>>,
    pub next_sync_at: Option<DateTime<Utc>>,
    pub average_sync_duration_ms: u64,
    pub data_transferred_bytes: u64,
    pub offline_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncConfiguration {
    pub strategy: SyncStrategy,
    pub conflict_resolution: ConflictResolutionStrategy,
    pub enable_background_sync: bool,
    pub sync_on_startup: bool,
    pub sync_on_network_change: bool,
    pub batch_size: usize,
    pub timeout_seconds: u64,
    pub retry_limit: usize,
    pub enable_compression: bool,
    pub quebec_compliance_mode: bool,
}

impl Default for SyncConfiguration {
    fn default() -> Self {
        Self {
            strategy: SyncStrategy::AutomaticExponentialBackoff {
                base_interval_secs: 30,
                max_interval_secs: 300, // 5 minutes
            },
            conflict_resolution: ConflictResolutionStrategy::ProfessionalDecision,
            enable_background_sync: true,
            sync_on_startup: true,
            sync_on_network_change: true,
            batch_size: 10,
            timeout_seconds: 30,
            retry_limit: 3,
            enable_compression: true,
            quebec_compliance_mode: true,
        }
    }
}

#[derive(thiserror::Error, Debug)]
pub enum SyncError {
    #[error("Storage error: {0}")]
    Storage(#[from] MedicalNotesError),
    #[error("Network error: {0}")]
    Network(String),
    #[error("Conflict resolution failed: {0}")]
    ConflictResolution(String),
    #[error("Sync timeout")]
    Timeout,
    #[error("Quebec compliance violation: {0}")]
    ComplianceViolation(String),
    #[error("Authentication error: {0}")]
    Authentication(String),
    #[error("Configuration error: {0}")]
    Configuration(String),
}

pub struct OfflineFirstSyncManager {
    local_store: Arc<MedicalNotesStore>,
    remote_service: Arc<QuebecFirebaseService>,
    compliance_tracker: Arc<QuebecComplianceTracker>,
    config: Arc<RwLock<SyncConfiguration>>,
    status: Arc<RwLock<SyncStatus>>,
    statistics: Arc<RwLock<SyncStatistics>>,
    pending_conflicts: Arc<Mutex<Vec<SyncConflict>>>,
    sync_queue: Arc<Mutex<Vec<String>>>, // Note IDs pending sync
    is_online: Arc<RwLock<bool>>,
    sync_lock: Arc<Mutex<()>>, // Prevent concurrent sync operations
}

impl OfflineFirstSyncManager {
    /// Create a new offline-first sync manager
    pub async fn new(
        local_store: Arc<MedicalNotesStore>,
        remote_service: Arc<QuebecFirebaseService>,
        compliance_tracker: Arc<QuebecComplianceTracker>,
        config: Option<SyncConfiguration>,
    ) -> Result<Self, SyncError> {
        let config = Arc::new(RwLock::new(config.unwrap_or_default()));
        let status = Arc::new(RwLock::new(SyncStatus::Idle));
        let statistics = Arc::new(RwLock::new(SyncStatistics {
            total_synced: 0,
            successful_syncs: 0,
            failed_syncs: 0,
            conflicts_resolved: 0,
            conflicts_pending: 0,
            last_sync_at: None,
            next_sync_at: None,
            average_sync_duration_ms: 0,
            data_transferred_bytes: 0,
            offline_duration_ms: 0,
        }));

        let manager = Self {
            local_store,
            remote_service,
            compliance_tracker,
            config,
            status,
            statistics,
            pending_conflicts: Arc::new(Mutex::new(Vec::new())),
            sync_queue: Arc::new(Mutex::new(Vec::new())),
            is_online: Arc::new(RwLock::new(false)),
            sync_lock: Arc::new(Mutex::new(())),
        };

        // Check initial network status
        manager.check_network_status().await;

        // Start background sync if enabled
        if manager.config.read().await.enable_background_sync {
            manager.start_background_sync().await?;
        }

        tracing::info!("Offline-first sync manager initialized");
        Ok(manager)
    }

    /// Start the background sync process
    pub async fn start_background_sync(&self) -> Result<(), SyncError> {
        let config = self.config.read().await.clone();

        match config.strategy {
            SyncStrategy::AutomaticExponentialBackoff { base_interval_secs, max_interval_secs } => {
                self.start_exponential_backoff_sync(base_interval_secs, max_interval_secs).await;
            },
            SyncStrategy::Scheduled { interval_secs } => {
                self.start_scheduled_sync(interval_secs).await;
            },
            SyncStrategy::Adaptive { min_interval_secs, max_interval_secs } => {
                self.start_adaptive_sync(min_interval_secs, max_interval_secs).await;
            },
            SyncStrategy::ManualOnly => {
                tracing::info!("Manual sync mode - background sync disabled");
                return Ok(());
            }
        }

        Ok(())
    }

    /// Check network connectivity status
    async fn check_network_status(&self) {
        // Attempt to ping Firebase service
        let is_online = match self.remote_service.health_check().await {
            Ok(_) => true,
            Err(_) => false,
        };

        let mut online_status = self.is_online.write().await;
        let was_online = *online_status;
        *online_status = is_online;

        if is_online && !was_online {
            tracing::info!("Network connectivity restored - triggering sync");
            // Network came back online - trigger sync if configured
            if self.config.read().await.sync_on_network_change {
                let sync_manager = self.clone();
                tokio::spawn(async move {
                    if let Err(e) = sync_manager.sync_now().await {
                        tracing::error!("Failed to sync after network restoration: {}", e);
                    }
                });
            }
        } else if !is_online && was_online {
            tracing::warn!("Network connectivity lost - entering offline mode");
            *self.status.write().await = SyncStatus::OfflineMode;
        }
    }

    /// Perform immediate synchronization
    pub async fn sync_now(&self) -> Result<(), SyncError> {
        let _lock = self.sync_lock.lock().await;

        // Check if we're online
        if !*self.is_online.read().await {
            self.check_network_status().await;
            if !*self.is_online.read().await {
                return Err(SyncError::Network("No network connectivity".to_string()));
            }
        }

        *self.status.write().await = SyncStatus::Syncing;
        let sync_start = std::time::Instant::now();

        tracing::info!("Starting synchronization");

        // Get pending notes for sync
        let pending_notes = self.local_store.get_pending_sync_notes().await?;

        let mut successful_syncs = 0;
        let mut failed_syncs = 0;
        let mut new_conflicts = Vec::new();

        // Upload pending local changes
        for note in pending_notes {
            match self.sync_note_to_remote(&note).await {
                Ok(_) => {
                    successful_syncs += 1;
                    self.local_store.mark_synced(&note.id, note.sync_version).await?;
                },
                Err(SyncError::ConflictResolution(conflict_data)) => {
                    // Handle conflict
                    if let Ok(conflict) = serde_json::from_str::<SyncConflict>(&conflict_data) {
                        new_conflicts.push(conflict);
                    }
                },
                Err(e) => {
                    failed_syncs += 1;
                    tracing::error!("Failed to sync note {}: {}", note.id, e);
                }
            }
        }

        // Download remote changes
        match self.fetch_remote_changes().await {
            Ok(remote_changes) => {
                for remote_note in remote_changes {
                    match self.apply_remote_change(&remote_note).await {
                        Ok(_) => successful_syncs += 1,
                        Err(SyncError::ConflictResolution(conflict_data)) => {
                            if let Ok(conflict) = serde_json::from_str::<SyncConflict>(&conflict_data) {
                                new_conflicts.push(conflict);
                            }
                        },
                        Err(e) => {
                            failed_syncs += 1;
                            tracing::error!("Failed to apply remote change: {}", e);
                        }
                    }
                }
            },
            Err(e) => {
                tracing::error!("Failed to fetch remote changes: {}", e);
                failed_syncs += 1;
            }
        }

        // Update conflicts
        if !new_conflicts.is_empty() {
            let mut pending_conflicts = self.pending_conflicts.lock().await;
            pending_conflicts.extend(new_conflicts.clone());

            *self.status.write().await = SyncStatus::Conflict {
                conflict_count: pending_conflicts.len()
            };
        } else if failed_syncs > 0 {
            *self.status.write().await = SyncStatus::Error {
                error_message: format!("{} sync operations failed", failed_syncs),
                retry_count: 0
            };
        } else {
            *self.status.write().await = SyncStatus::Idle;
        }

        // Update statistics
        let sync_duration = sync_start.elapsed();
        let mut stats = self.statistics.write().await;
        stats.total_synced += (successful_syncs + failed_syncs) as u64;
        stats.successful_syncs += successful_syncs as u64;
        stats.failed_syncs += failed_syncs as u64;
        stats.conflicts_pending = self.pending_conflicts.lock().await.len() as u64;
        stats.last_sync_at = Some(Utc::now());
        stats.average_sync_duration_ms = ((stats.average_sync_duration_ms + sync_duration.as_millis() as u64) / 2);

        // Log compliance event
        if self.config.read().await.quebec_compliance_mode {
            let _ = self.compliance_tracker.log_compliance_event(
                crate::compliance::quebec_law25::QuebecComplianceEvent::AuditTrailAccessed {
                    accessor_id: "sync_manager".to_string(),
                    target_resource: "medical_notes_sync".to_string(),
                },
                Some([
                    ("successful_syncs".to_string(), successful_syncs.to_string()),
                    ("failed_syncs".to_string(), failed_syncs.to_string()),
                    ("conflicts".to_string(), new_conflicts.len().to_string()),
                ].iter().cloned().collect()),
            ).await;
        }

        tracing::info!(
            "Sync completed: {} successful, {} failed, {} conflicts",
            successful_syncs, failed_syncs, new_conflicts.len()
        );

        Ok(())
    }

    /// Sync a local note to remote storage
    async fn sync_note_to_remote(&self, note: &EncryptedMedicalNote) -> Result<(), SyncError> {
        // Check for conflicts first
        match self.remote_service.get_note_metadata(&note.id).await {
            Ok(Some(remote_metadata)) => {
                if remote_metadata.version > note.sync_version {
                    // Conflict detected - remote is newer
                    let remote_content = self.remote_service.get_note_content(&note.id).await
                        .map_err(|e| SyncError::Network(e.to_string()))?;

                    let local_content = self.local_store.get_note(&note.id, &note.practitioner_id).await?;

                    let conflict = self.local_store.handle_sync_conflict(
                        &note.id,
                        &remote_content,
                        remote_metadata.version,
                    ).await?;

                    return Err(SyncError::ConflictResolution(serde_json::to_string(&conflict).unwrap()));
                }
            },
            Ok(None) => {
                // Note doesn't exist remotely - safe to upload
            },
            Err(e) => {
                return Err(SyncError::Network(e.to_string()));
            }
        }

        // Upload the note
        let note_content = self.local_store.get_note(&note.id, &note.practitioner_id).await?;

        self.remote_service.store_medical_note_quebec(
            &note.practitioner_id,
            &note.client_id,
            &serde_json::to_string(&note_content).unwrap(),
            note.consent_id.as_deref(),
        ).await.map_err(|e| SyncError::Network(e.to_string()))?;

        Ok(())
    }

    /// Fetch changes from remote storage
    async fn fetch_remote_changes(&self) -> Result<Vec<MedicalNoteContent>, SyncError> {
        // This would fetch notes that have been updated remotely since last sync
        // Implementation depends on Firebase service capabilities
        let last_sync = self.statistics.read().await.last_sync_at;

        self.remote_service.get_notes_since(last_sync)
            .await
            .map_err(|e| SyncError::Network(e.to_string()))
    }

    /// Apply a remote change to local storage
    async fn apply_remote_change(&self, remote_note: &MedicalNoteContent) -> Result<(), SyncError> {
        // Check if local version exists and compare versions
        // Implementation would handle conflicts and apply changes

        // For now, simplified implementation
        tracing::debug!("Applying remote change for note template: {}", remote_note.template_id);
        Ok(())
    }

    /// Resolve a sync conflict using the configured strategy
    pub async fn resolve_conflict(
        &self,
        conflict: &SyncConflict,
        resolution_strategy: Option<ConflictResolutionStrategy>,
    ) -> Result<(), SyncError> {
        let strategy = resolution_strategy.unwrap_or(self.config.read().await.conflict_resolution.clone());

        let resolved_content = match strategy {
            ConflictResolutionStrategy::LastWriteWins => {
                // Compare timestamps and choose the more recent one
                self.resolve_by_timestamp(conflict).await?
            },
            ConflictResolutionStrategy::PreferLocal => conflict.local_content.clone(),
            ConflictResolutionStrategy::PreferRemote => conflict.remote_content.clone(),
            ConflictResolutionStrategy::IntelligentMerge => {
                self.intelligent_merge(conflict).await?
            },
            ConflictResolutionStrategy::ManualResolution | ConflictResolutionStrategy::ProfessionalDecision => {
                return Err(SyncError::ConflictResolution(
                    "Manual resolution required - present conflict to user".to_string()
                ));
            }
        };

        // Update local storage with resolved content
        self.local_store.update_note(&conflict.note_id, "system", &resolved_content).await?;

        // Remove from pending conflicts
        let mut pending_conflicts = self.pending_conflicts.lock().await;
        pending_conflicts.retain(|c| c.note_id != conflict.note_id);

        // Update statistics
        self.statistics.write().await.conflicts_resolved += 1;

        tracing::info!("Resolved conflict for note {} using strategy {:?}", conflict.note_id, strategy);
        Ok(())
    }

    /// Resolve conflict by comparing timestamps
    async fn resolve_by_timestamp(&self, conflict: &SyncConflict) -> Result<MedicalNoteContent, SyncError> {
        // In a real implementation, you would compare actual timestamps from the content
        // For now, prefer remote if remote version is higher
        if conflict.remote_version > conflict.local_version {
            Ok(conflict.remote_content.clone())
        } else {
            Ok(conflict.local_content.clone())
        }
    }

    /// Perform intelligent merge of conflicting changes
    async fn intelligent_merge(&self, conflict: &SyncConflict) -> Result<MedicalNoteContent, SyncError> {
        let mut merged = conflict.local_content.clone();

        // Merge fields intelligently
        for (key, remote_value) in &conflict.remote_content.fields {
            if !merged.fields.contains_key(key) {
                // Field only exists in remote - add it
                merged.fields.insert(key.clone(), remote_value.clone());
            } else {
                // Field exists in both - use remote if it's newer or more complete
                let local_value = &merged.fields[key];
                if self.is_more_complete(remote_value, local_value) {
                    merged.fields.insert(key.clone(), remote_value.clone());
                }
            }
        }

        // Merge Quebec-specific data
        if conflict.remote_content.quebec_specific_data.is_some() && merged.quebec_specific_data.is_none() {
            merged.quebec_specific_data = conflict.remote_content.quebec_specific_data.clone();
        }

        Ok(merged)
    }

    /// Check if one value is more complete than another
    fn is_more_complete(&self, value1: &serde_json::Value, value2: &serde_json::Value) -> bool {
        match (value1, value2) {
            (serde_json::Value::String(s1), serde_json::Value::String(s2)) => s1.len() > s2.len(),
            (serde_json::Value::Array(a1), serde_json::Value::Array(a2)) => a1.len() > a2.len(),
            (serde_json::Value::Object(o1), serde_json::Value::Object(o2)) => o1.len() > o2.len(),
            _ => false,
        }
    }

    /// Start exponential backoff sync
    async fn start_exponential_backoff_sync(&self, base_interval: u64, max_interval: u64) {
        let sync_manager = Arc::new(self.clone());

        tokio::spawn(async move {
            let mut current_interval = base_interval;

            loop {
                sleep(Duration::from_secs(current_interval)).await;

                match sync_manager.sync_now().await {
                    Ok(_) => {
                        // Success - reset interval
                        current_interval = base_interval;
                    },
                    Err(_) => {
                        // Failure - increase interval (exponential backoff)
                        current_interval = std::cmp::min(current_interval * 2, max_interval);
                    }
                }
            }
        });
    }

    /// Start scheduled sync
    async fn start_scheduled_sync(&self, interval_secs: u64) {
        let sync_manager = Arc::new(self.clone());

        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(interval_secs));

            loop {
                interval.tick().await;

                if let Err(e) = sync_manager.sync_now().await {
                    tracing::error!("Scheduled sync failed: {}", e);
                }
            }
        });
    }

    /// Start adaptive sync based on usage patterns
    async fn start_adaptive_sync(&self, min_interval: u64, max_interval: u64) {
        let sync_manager = Arc::new(self.clone());

        tokio::spawn(async move {
            let mut current_interval = min_interval;

            loop {
                sleep(Duration::from_secs(current_interval)).await;

                // Adapt interval based on activity and pending changes
                let pending_count = sync_manager.sync_queue.lock().await.len();

                if pending_count > 10 {
                    // High activity - sync more frequently
                    current_interval = min_interval;
                } else if pending_count == 0 {
                    // No activity - sync less frequently
                    current_interval = std::cmp::min(current_interval + 30, max_interval);
                } else {
                    // Moderate activity - maintain current interval
                }

                if let Err(e) = sync_manager.sync_now().await {
                    tracing::error!("Adaptive sync failed: {}", e);
                }
            }
        });
    }

    /// Get current sync status
    pub async fn get_status(&self) -> SyncStatus {
        self.status.read().await.clone()
    }

    /// Get sync statistics
    pub async fn get_statistics(&self) -> SyncStatistics {
        self.statistics.read().await.clone()
    }

    /// Get pending conflicts for manual resolution
    pub async fn get_pending_conflicts(&self) -> Vec<SyncConflict> {
        self.pending_conflicts.lock().await.clone()
    }

    /// Update sync configuration
    pub async fn update_configuration(&self, new_config: SyncConfiguration) -> Result<(), SyncError> {
        *self.config.write().await = new_config;

        // Restart background sync with new configuration
        if self.config.read().await.enable_background_sync {
            self.start_background_sync().await?;
        }

        tracing::info!("Sync configuration updated");
        Ok(())
    }

    /// Pause synchronization
    pub async fn pause(&self) {
        *self.status.write().await = SyncStatus::Paused;
        tracing::info!("Synchronization paused");
    }

    /// Resume synchronization
    pub async fn resume(&self) {
        *self.status.write().await = SyncStatus::Idle;
        tracing::info!("Synchronization resumed");

        // Trigger immediate sync
        if let Err(e) = self.sync_now().await {
            tracing::error!("Failed to sync after resume: {}", e);
        }
    }
}

// Clone implementation for Arc usage in async spawns
impl Clone for OfflineFirstSyncManager {
    fn clone(&self) -> Self {
        Self {
            local_store: Arc::clone(&self.local_store),
            remote_service: Arc::clone(&self.remote_service),
            compliance_tracker: Arc::clone(&self.compliance_tracker),
            config: Arc::clone(&self.config),
            status: Arc::clone(&self.status),
            statistics: Arc::clone(&self.statistics),
            pending_conflicts: Arc::clone(&self.pending_conflicts),
            sync_queue: Arc::clone(&self.sync_queue),
            is_online: Arc::clone(&self.is_online),
            sync_lock: Arc::clone(&self.sync_lock),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_sync_manager_creation() {
        // This test would require mocking the dependencies
        // Implementation would test the basic creation and configuration
    }

    #[tokio::test]
    async fn test_conflict_resolution_strategies() {
        // Test different conflict resolution strategies
    }

    #[tokio::test]
    async fn test_offline_mode_handling() {
        // Test behavior when network is unavailable
    }
}