use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqlitePool, FromRow, Row};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use base64::{Engine as _, engine::general_purpose};
use crate::security::crypto::{CryptoService, DataClassification};
use crate::compliance::quebec_law25::QuebecComplianceTracker;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EncryptedMedicalNote {
    pub id: String,
    pub practitioner_id: String,
    pub client_id: String,
    pub template_id: String,
    pub encrypted_content: Vec<u8>,
    pub content_hash: String,
    pub encryption_key_id: String,
    pub consent_id: Option<String>,
    pub quebec_organization: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub sync_status: String, // "pending", "synced", "conflict"
    pub sync_version: i64,
    pub is_deidentified: bool,
    pub compliance_flags: String, // JSON string of compliance metadata
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MedicalNoteContent {
    pub template_id: String,
    pub fields: HashMap<String, serde_json::Value>,
    pub quebec_specific_data: Option<QuebecSpecificData>,
    pub attachments: Vec<String>, // File paths or references
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuebecSpecificData {
    pub ramq_number: Option<String>,
    pub quebec_postal_code: Option<String>,
    pub organization_reference: Option<String>,
    pub claim_number: Option<String>,
    pub professional_license: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncConflict {
    pub note_id: String,
    pub local_version: i64,
    pub remote_version: i64,
    pub local_content: MedicalNoteContent,
    pub remote_content: MedicalNoteContent,
    pub conflict_type: String,
    pub created_at: DateTime<Utc>,
}

#[derive(thiserror::Error, Debug)]
pub enum MedicalNotesError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Encryption error: {0}")]
    Encryption(String),
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("Compliance error: {0}")]
    Compliance(String),
    #[error("Sync conflict: {0}")]
    SyncConflict(String),
    #[error("Note not found: {0}")]
    NotFound(String),
}

pub struct MedicalNotesStore {
    pool: SqlitePool,
    crypto: CryptoService,
    compliance: QuebecComplianceTracker,
}

impl MedicalNotesStore {
    pub async fn new(database_url: &str) -> Result<Self, MedicalNotesError> {
        let pool = SqlitePool::connect(database_url).await?;

        // Run migrations
        sqlx::migrate!("./migrations/medical_notes").run(&pool).await?;

        let crypto = CryptoService::new();
        // Initialize crypto with Quebec Law 25 compliant master key
        crypto.initialize_master_key("quebec_law25_master_key", None).await
            .map_err(|e| MedicalNotesError::Encryption(e.to_string()))?;

        let compliance = QuebecComplianceTracker::new().await
            .map_err(|e| MedicalNotesError::Compliance(e.to_string()))?;

        Ok(Self {
            pool,
            crypto,
            compliance,
        })
    }

    /// Create a new encrypted medical note
    pub async fn create_note(
        &self,
        practitioner_id: &str,
        client_id: &str,
        content: &MedicalNoteContent,
        consent_id: Option<&str>,
    ) -> Result<String, MedicalNotesError> {
        let note_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        // Validate Quebec Law 25 compliance
        self.compliance.validate_note_creation(
            practitioner_id,
            client_id,
            &content.template_id,
            consent_id,
        ).await.map_err(|e| MedicalNotesError::Compliance(e.to_string()))?;

        // Serialize and encrypt content using Quebec Law 25 PHI classification
        let content_json = serde_json::to_string(content)?;
        let encrypted_data = self.crypto.encrypt(content_json.as_bytes(), DataClassification::PHI, None).await
            .map_err(|e| MedicalNotesError::Encryption(e.to_string()))?;

        // Generate content hash for integrity verification (using SHA-256)
        let content_hash = {
            use ring::digest::{Context, SHA256};
            let mut context = Context::new(&SHA256);
            context.update(content_json.as_bytes());
            let digest = context.finish();
            general_purpose::STANDARD.encode(digest.as_ref())
        };

        // Determine Quebec organization if applicable
        let quebec_org = content.quebec_specific_data.as_ref()
            .and_then(|data| data.organization_reference.clone());

        // Create compliance metadata
        let compliance_flags = serde_json::json!({
            "law25_compliant": true,
            "has_consent": consent_id.is_some(),
            "quebec_organization": quebec_org,
            "created_by_quebec_practitioner": true,
            "deidentification_required": false
        });

        // Store encrypted data as base64 and convert key_id to string
        let encrypted_content_bytes = general_purpose::STANDARD.decode(&encrypted_data.data)
            .map_err(|e| MedicalNotesError::Encryption(format!("Base64 decode error: {}", e)))?;

        sqlx::query!(
            r#"
            INSERT INTO medical_notes (
                id, practitioner_id, client_id, template_id, encrypted_content,
                content_hash, encryption_key_id, consent_id, quebec_organization,
                created_at, updated_at, sync_status, sync_version, is_deidentified,
                compliance_flags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            note_id,
            practitioner_id,
            client_id,
            content.template_id,
            encrypted_content_bytes,
            content_hash,
            encrypted_data.key_id.to_string(),
            consent_id,
            quebec_org,
            now,
            now,
            "pending",
            1i64,
            false,
            compliance_flags.to_string()
        )
        .execute(&self.pool)
        .await?;

        // Log compliance event
        self.compliance.log_note_creation(&note_id, practitioner_id, client_id).await
            .map_err(|e| MedicalNotesError::Compliance(e.to_string()))?;

        tracing::info!("Created encrypted medical note: {}", note_id);
        Ok(note_id)
    }

    /// Retrieve and decrypt a medical note
    pub async fn get_note(&self, note_id: &str, practitioner_id: &str) -> Result<MedicalNoteContent, MedicalNotesError> {
        let row = sqlx::query!(
            "SELECT * FROM medical_notes WHERE id = ? AND practitioner_id = ?",
            note_id,
            practitioner_id
        )
        .fetch_optional(&self.pool)
        .await?;

        let note = row.ok_or_else(|| MedicalNotesError::NotFound(note_id.to_string()))?;

        // Reconstruct EncryptedData structure for decryption
        let encrypted_data = crate::security::crypto::EncryptedData {
            id: Uuid::new_v4(), // Not used for decryption
            algorithm: "AES-256-GCM-PHI".to_string(), // Quebec Law 25 PHI encryption
            data: general_purpose::STANDARD.encode(&note.encrypted_content),
            iv: "".to_string(), // The IV is embedded in the data by the CryptoService
            tag: None,
            classification: DataClassification::PHI,
            encrypted_at: note.created_at,
            key_id: Uuid::parse_str(&note.encryption_key_id)
                .map_err(|e| MedicalNotesError::Encryption(format!("Invalid key UUID: {}", e)))?,
            aad: None,
            hmac: None,
        };

        // Decrypt content using Quebec Law 25 compliant decryption
        let decrypted_content = self.crypto.decrypt(&encrypted_data).await
            .map_err(|e| MedicalNotesError::Encryption(e.to_string()))?;

        let content_str = String::from_utf8(decrypted_content)
            .map_err(|e| MedicalNotesError::Encryption(format!("UTF-8 decode error: {}", e)))?;

        // Verify content integrity using SHA-256
        let computed_hash = {
            use ring::digest::{Context, SHA256};
            let mut context = Context::new(&SHA256);
            context.update(content_str.as_bytes());
            let digest = context.finish();
            general_purpose::STANDARD.encode(digest.as_ref())
        };

        if computed_hash != note.content_hash {
            return Err(MedicalNotesError::Encryption("Content integrity check failed".to_string()));
        }

        let content: MedicalNoteContent = serde_json::from_str(&content_str)?;

        // Log compliance access
        self.compliance.log_note_access(note_id, practitioner_id).await
            .map_err(|e| MedicalNotesError::Compliance(e.to_string()))?;

        Ok(content)
    }

    /// Update an existing medical note
    pub async fn update_note(
        &self,
        note_id: &str,
        practitioner_id: &str,
        content: &MedicalNoteContent,
    ) -> Result<(), MedicalNotesError> {
        let now = Utc::now();

        // Verify note exists and practitioner has access
        let existing = sqlx::query!(
            "SELECT sync_version FROM medical_notes WHERE id = ? AND practitioner_id = ?",
            note_id,
            practitioner_id
        )
        .fetch_optional(&self.pool)
        .await?;

        let current_version = existing
            .ok_or_else(|| MedicalNotesError::NotFound(note_id.to_string()))?
            .sync_version;

        // Encrypt new content using Quebec Law 25 PHI classification
        let content_json = serde_json::to_string(content)?;
        let encrypted_data = self.crypto.encrypt(content_json.as_bytes(), DataClassification::PHI, None).await
            .map_err(|e| MedicalNotesError::Encryption(e.to_string()))?;

        let content_hash = {
            use ring::digest::{Context, SHA256};
            let mut context = Context::new(&SHA256);
            context.update(content_json.as_bytes());
            let digest = context.finish();
            general_purpose::STANDARD.encode(digest.as_ref())
        };

        let encrypted_content_bytes = general_purpose::STANDARD.decode(&encrypted_data.data)
            .map_err(|e| MedicalNotesError::Encryption(format!("Base64 decode error: {}", e)))?;

        let quebec_org = content.quebec_specific_data.as_ref()
            .and_then(|data| data.organization_reference.clone());

        sqlx::query!(
            r#"
            UPDATE medical_notes
            SET encrypted_content = ?, content_hash = ?, encryption_key_id = ?,
                quebec_organization = ?, updated_at = ?, sync_status = ?, sync_version = ?
            WHERE id = ? AND practitioner_id = ?
            "#,
            encrypted_content_bytes,
            content_hash,
            encrypted_data.key_id.to_string(),
            quebec_org,
            now,
            "pending",
            current_version + 1,
            note_id,
            practitioner_id
        )
        .execute(&self.pool)
        .await?;

        // Log compliance event
        self.compliance.log_note_update(note_id, practitioner_id).await
            .map_err(|e| MedicalNotesError::Compliance(e.to_string()))?;

        tracing::info!("Updated encrypted medical note: {}", note_id);
        Ok(())
    }

    /// List medical notes for a client
    pub async fn list_notes_for_client(
        &self,
        client_id: &str,
        practitioner_id: &str,
        limit: Option<i32>,
        offset: Option<i32>,
    ) -> Result<Vec<EncryptedMedicalNote>, MedicalNotesError> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        let rows = sqlx::query_as!(
            EncryptedMedicalNote,
            r#"
            SELECT id, practitioner_id, client_id, template_id, encrypted_content,
                   content_hash, encryption_key_id, consent_id, quebec_organization,
                   created_at, updated_at, sync_status, sync_version, is_deidentified,
                   compliance_flags
            FROM medical_notes
            WHERE client_id = ? AND practitioner_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            "#,
            client_id,
            practitioner_id,
            limit,
            offset
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows)
    }

    /// Get notes pending synchronization
    pub async fn get_pending_sync_notes(&self) -> Result<Vec<EncryptedMedicalNote>, MedicalNotesError> {
        let rows = sqlx::query_as!(
            EncryptedMedicalNote,
            r#"
            SELECT id, practitioner_id, client_id, template_id, encrypted_content,
                   content_hash, encryption_key_id, consent_id, quebec_organization,
                   created_at, updated_at, sync_status, sync_version, is_deidentified,
                   compliance_flags
            FROM medical_notes
            WHERE sync_status = 'pending'
            ORDER BY updated_at ASC
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows)
    }

    /// Mark note as synced
    pub async fn mark_synced(&self, note_id: &str, remote_version: i64) -> Result<(), MedicalNotesError> {
        sqlx::query!(
            "UPDATE medical_notes SET sync_status = 'synced', sync_version = ? WHERE id = ?",
            remote_version,
            note_id
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Handle sync conflict
    pub async fn handle_sync_conflict(
        &self,
        note_id: &str,
        remote_content: &MedicalNoteContent,
        remote_version: i64,
    ) -> Result<SyncConflict, MedicalNotesError> {
        // Get local note
        let local_row = sqlx::query!(
            "SELECT practitioner_id, encrypted_content, encryption_key_id, sync_version FROM medical_notes WHERE id = ?",
            note_id
        )
        .fetch_optional(&self.pool)
        .await?;

        let local_note = local_row.ok_or_else(|| MedicalNotesError::NotFound(note_id.to_string()))?;

        // Reconstruct EncryptedData structure for local note decryption
        let local_encrypted_data = crate::security::crypto::EncryptedData {
            id: Uuid::new_v4(),
            algorithm: "AES-256-GCM-PHI".to_string(),
            data: general_purpose::STANDARD.encode(&local_note.encrypted_content),
            iv: "".to_string(),
            tag: None,
            classification: DataClassification::PHI,
            encrypted_at: chrono::Utc::now(), // Approximate since we don't store this
            key_id: Uuid::parse_str(&local_note.encryption_key_id)
                .map_err(|e| MedicalNotesError::Encryption(format!("Invalid key UUID: {}", e)))?,
            aad: None,
            hmac: None,
        };

        // Decrypt local content
        let decrypted_local = self.crypto.decrypt(&local_encrypted_data).await
            .map_err(|e| MedicalNotesError::Encryption(e.to_string()))?;

        let local_content_str = String::from_utf8(decrypted_local)
            .map_err(|e| MedicalNotesError::Encryption(format!("UTF-8 decode error: {}", e)))?;

        let local_content: MedicalNoteContent = serde_json::from_str(&local_content_str)?;

        // Mark as conflict
        sqlx::query!(
            "UPDATE medical_notes SET sync_status = 'conflict' WHERE id = ?",
            note_id
        )
        .execute(&self.pool)
        .await?;

        let conflict = SyncConflict {
            note_id: note_id.to_string(),
            local_version: local_note.sync_version,
            remote_version,
            local_content,
            remote_content: remote_content.clone(),
            conflict_type: "version_mismatch".to_string(),
            created_at: Utc::now(),
        };

        Ok(conflict)
    }

    /// Delete a medical note (soft delete with audit trail)
    pub async fn delete_note(&self, note_id: &str, practitioner_id: &str) -> Result<(), MedicalNotesError> {
        // Quebec Law 25 requires audit trail for deletions
        let now = Utc::now();

        // First, verify the note exists and practitioner has access
        let existing = sqlx::query!(
            "SELECT id FROM medical_notes WHERE id = ? AND practitioner_id = ?",
            note_id,
            practitioner_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if existing.is_none() {
            return Err(MedicalNotesError::NotFound(note_id.to_string()));
        }

        // Mark as deleted instead of actual deletion for compliance
        sqlx::query!(
            "UPDATE medical_notes SET sync_status = 'deleted', updated_at = ? WHERE id = ?",
            now,
            note_id
        )
        .execute(&self.pool)
        .await?;

        // Log compliance deletion event
        self.compliance.log_note_deletion(note_id, practitioner_id).await
            .map_err(|e| MedicalNotesError::Compliance(e.to_string()))?;

        tracing::info!("Soft deleted medical note: {}", note_id);
        Ok(())
    }

    /// Get storage statistics
    pub async fn get_storage_stats(&self) -> Result<HashMap<String, serde_json::Value>, MedicalNotesError> {
        let stats = sqlx::query!(
            r#"
            SELECT
                COUNT(*) as total_notes,
                COUNT(CASE WHEN sync_status = 'pending' THEN 1 END) as pending_sync,
                COUNT(CASE WHEN sync_status = 'conflict' THEN 1 END) as conflicts,
                COUNT(CASE WHEN is_deidentified = 1 THEN 1 END) as deidentified,
                AVG(LENGTH(encrypted_content)) as avg_size
            FROM medical_notes
            WHERE sync_status != 'deleted'
            "#
        )
        .fetch_one(&self.pool)
        .await?;

        let mut result = HashMap::new();
        result.insert("total_notes".to_string(), serde_json::Value::Number(stats.total_notes.into()));
        result.insert("pending_sync".to_string(), serde_json::Value::Number(stats.pending_sync.unwrap_or(0).into()));
        result.insert("conflicts".to_string(), serde_json::Value::Number(stats.conflicts.unwrap_or(0).into()));
        result.insert("deidentified".to_string(), serde_json::Value::Number(stats.deidentified.unwrap_or(0).into()));
        result.insert("avg_size_bytes".to_string(), serde_json::Value::Number(stats.avg_size.unwrap_or(0.0).into()));

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_create_and_retrieve_note() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let db_url = format!("sqlite://{}", db_path.to_str().unwrap());

        let store = MedicalNotesStore::new(&db_url).await.unwrap();

        let content = MedicalNoteContent {
            template_id: "ramq_progress_note".to_string(),
            fields: [("chief_complaint".to_string(), serde_json::Value::String("Test complaint".to_string()))]
                .iter().cloned().collect(),
            quebec_specific_data: Some(QuebecSpecificData {
                ramq_number: Some("ABCD12345678".to_string()),
                quebec_postal_code: Some("H1A 1A1".to_string()),
                organization_reference: Some("RAMQ".to_string()),
                claim_number: None,
                professional_license: Some("12345".to_string()),
            }),
            attachments: vec![],
        };

        let note_id = store.create_note("prac123", "client456", &content, Some("consent789")).await.unwrap();

        let retrieved = store.get_note(&note_id, "prac123").await.unwrap();
        assert_eq!(retrieved.template_id, "ramq_progress_note");
        assert_eq!(retrieved.fields.get("chief_complaint").unwrap(), "Test complaint");
    }

    #[tokio::test]
    async fn test_update_note() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let db_url = format!("sqlite://{}", db_path.to_str().unwrap());

        let store = MedicalNotesStore::new(&db_url).await.unwrap();

        let mut content = MedicalNoteContent {
            template_id: "ramq_progress_note".to_string(),
            fields: [("chief_complaint".to_string(), serde_json::Value::String("Initial complaint".to_string()))]
                .iter().cloned().collect(),
            quebec_specific_data: None,
            attachments: vec![],
        };

        let note_id = store.create_note("prac123", "client456", &content, None).await.unwrap();

        // Update the note
        content.fields.insert("chief_complaint".to_string(), serde_json::Value::String("Updated complaint".to_string()));
        store.update_note(&note_id, "prac123", &content).await.unwrap();

        let retrieved = store.get_note(&note_id, "prac123").await.unwrap();
        assert_eq!(retrieved.fields.get("chief_complaint").unwrap(), "Updated complaint");
    }
}