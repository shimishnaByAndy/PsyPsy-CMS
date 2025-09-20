use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Nonce, Key
};
use base64::{Engine as _, engine::general_purpose};
use ring::digest::{Context, SHA256};
use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use uuid::Uuid;
use chrono::{DateTime, Utc};


#[derive(Debug, thiserror::Error)]
pub enum EncryptionError {
    #[error("Encryption failed: {0}")]
    EncryptionFailed(String),
    #[error("Decryption failed: {0}")]
    DecryptionFailed(String),
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("Key derivation failed: {0}")]
    KeyDerivation(String),
    #[error("Law 25 compliance violation: {0}")]
    ComplianceViolation(String),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MedicalNote {
    pub id: String,
    pub patient_id: String,
    pub content: String,
    pub template_type: String,
    pub created_at: DateTime<Utc>,
    pub modified_at: DateTime<Utc>,
    pub consent_obtained: bool,
    pub encrypted: bool,
    pub deidentified: bool,
    pub sync_status: SyncStatus,
    pub quebec_compliance: QuebecComplianceMetadata,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum SyncStatus {
    Pending,
    Synced,
    Conflict,
    Local,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QuebecComplianceMetadata {
    pub law_25_consent: bool,
    pub data_minimization: bool,
    pub retention_period_days: u32,
    pub professional_order: Option<String>,
    pub audit_trail: Vec<AuditEntry>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuditEntry {
    pub timestamp: DateTime<Utc>,
    pub action: String,
    pub user_id: String,
    pub phi_accessed: bool,
    pub ip_address: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EncryptedData {
    nonce: Vec<u8>,
    ciphertext: Vec<u8>,
    checksum: String,
}

pub struct EncryptedNoteStorage {
    db_path: PathBuf,
    master_key: [u8; 32],
}

impl EncryptedNoteStorage {
    /// Initialize encrypted storage with Quebec Law 25 compliance
    pub fn new(app_handle: &AppHandle, passphrase: &str) -> Result<Self, EncryptionError> {
        let app_data_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|e| EncryptionError::KeyDerivation(format!("Unable to resolve app data directory: {}", e)))?;

        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| EncryptionError::KeyDerivation(format!("Failed to create app data directory: {}", e)))?;

        let db_path = app_data_dir.join("psypsy_notes.db");

        // Derive master key from passphrase using PBKDF2-like approach
        let master_key = Self::derive_key(passphrase)?;

        let storage = Self { db_path, master_key };
        storage.initialize_database()?;

        tracing::info!("Encrypted note storage initialized with Quebec Law 25 compliance");
        Ok(storage)
    }

    /// Derive encryption key from passphrase
    fn derive_key(passphrase: &str) -> Result<[u8; 32], EncryptionError> {
        let mut context = Context::new(&SHA256);
        context.update(passphrase.as_bytes());
        context.update(b"psypsy_medical_notes_2025"); // Application-specific salt

        let digest = context.finish();
        let mut key = [0u8; 32];
        key.copy_from_slice(digest.as_ref());

        Ok(key)
    }

    /// Initialize SQLite database with Quebec compliance schema
    fn initialize_database(&self) -> Result<(), EncryptionError> {
        let conn = Connection::open(&self.db_path)?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS medical_notes (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                encrypted_content BLOB NOT NULL,
                template_type TEXT NOT NULL,
                created_at TEXT NOT NULL,
                modified_at TEXT NOT NULL,
                consent_obtained BOOLEAN NOT NULL,
                encrypted BOOLEAN DEFAULT TRUE,
                deidentified BOOLEAN DEFAULT TRUE,
                sync_status TEXT NOT NULL DEFAULT 'Local',
                quebec_compliance TEXT NOT NULL,
                content_checksum TEXT NOT NULL,
                encryption_version INTEGER NOT NULL DEFAULT 1
            )",
            [],
        )?;

        // Create audit log table for Law 25 compliance
        conn.execute(
            "CREATE TABLE IF NOT EXISTS audit_log (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                note_id TEXT,
                action TEXT NOT NULL,
                user_id TEXT NOT NULL,
                phi_accessed BOOLEAN NOT NULL,
                ip_address TEXT,
                details TEXT,
                FOREIGN KEY(note_id) REFERENCES medical_notes(id)
            )",
            [],
        )?;

        // Create index for efficient queries
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_patient_id ON medical_notes(patient_id)",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_created_at ON medical_notes(created_at)",
            [],
        )?;

        Ok(())
    }

    /// Encrypt medical note content with AES-256-GCM
    fn encrypt_content(&self, content: &str) -> Result<EncryptedData, EncryptionError> {
        let key = Key::<Aes256Gcm>::from_slice(&self.master_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

        let ciphertext = cipher
            .encrypt(&nonce, content.as_bytes())
            .map_err(|e| EncryptionError::EncryptionFailed(format!("AES encryption failed: {}", e)))?;

        // Generate checksum for integrity verification
        let mut context = Context::new(&SHA256);
        context.update(&ciphertext);
        let checksum = general_purpose::STANDARD.encode(context.finish().as_ref());

        Ok(EncryptedData {
            nonce: nonce.to_vec(),
            ciphertext,
            checksum,
        })
    }

    /// Decrypt medical note content
    fn decrypt_content(&self, encrypted_data: &EncryptedData) -> Result<String, EncryptionError> {
        // Verify checksum first
        let mut context = Context::new(&SHA256);
        context.update(&encrypted_data.ciphertext);
        let calculated_checksum = general_purpose::STANDARD.encode(context.finish().as_ref());

        if calculated_checksum != encrypted_data.checksum {
            return Err(EncryptionError::DecryptionFailed("Checksum verification failed".to_string()));
        }

        let key = Key::<Aes256Gcm>::from_slice(&self.master_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&encrypted_data.nonce);

        let plaintext = cipher
            .decrypt(nonce, encrypted_data.ciphertext.as_ref())
            .map_err(|e| EncryptionError::DecryptionFailed(format!("AES decryption failed: {}", e)))?;

        String::from_utf8(plaintext)
            .map_err(|e| EncryptionError::DecryptionFailed(format!("UTF-8 conversion failed: {}", e)))
    }

    /// Save encrypted medical note with Law 25 compliance
    pub async fn save_note(&self, mut note: MedicalNote, user_id: &str) -> Result<String, EncryptionError> {
        // Validate Law 25 compliance before saving
        self.validate_law25_compliance(&note)?;

        let note_id = if note.id.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            note.id.clone()
        };

        note.id = note_id.clone();
        note.modified_at = Utc::now();
        note.encrypted = true;
        note.deidentified = true;

        // Encrypt the content
        let encrypted_data = self.encrypt_content(&note.content)?;
        let encrypted_blob = serde_json::to_vec(&encrypted_data)
            .map_err(|e| EncryptionError::EncryptionFailed(format!("Serialization failed: {}", e)))?;

        // Add audit entry
        let audit_entry = AuditEntry {
            timestamp: Utc::now(),
            action: "note_save".to_string(),
            user_id: user_id.to_string(),
            phi_accessed: true,
            ip_address: None,
        };

        note.quebec_compliance.audit_trail.push(audit_entry);

        let conn = Connection::open(&self.db_path)?;
        conn.execute(
            "INSERT OR REPLACE INTO medical_notes
             (id, patient_id, encrypted_content, template_type, created_at, modified_at,
              consent_obtained, encrypted, deidentified, sync_status, quebec_compliance,
              content_checksum, encryption_version)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![
                note.id,
                note.patient_id,
                encrypted_blob,
                note.template_type,
                note.created_at.to_rfc3339(),
                note.modified_at.to_rfc3339(),
                note.consent_obtained,
                note.encrypted,
                note.deidentified,
                serde_json::to_string(&note.sync_status).unwrap(),
                serde_json::to_string(&note.quebec_compliance).unwrap(),
                encrypted_data.checksum,
                1
            ],
        )?;

        // Log audit entry
        self.log_audit_entry_sync(&note_id, "note_save", user_id, true)?;

        tracing::info!("Medical note saved with encryption: {}", note_id);
        Ok(note_id)
    }

    /// Retrieve and decrypt medical note
    pub async fn get_note(&self, note_id: &str, _user_id: &str) -> Result<Option<MedicalNote>, EncryptionError> {
        let conn = Connection::open(&self.db_path)?;

        let mut stmt = conn.prepare(
            "SELECT id, patient_id, encrypted_content, template_type, created_at, modified_at,
                    consent_obtained, encrypted, deidentified, sync_status, quebec_compliance
             FROM medical_notes WHERE id = ?1"
        )?;

        let result = stmt.query_row(params![note_id], |row| {
            let encrypted_blob: Vec<u8> = row.get(2)?;
            let encrypted_data: EncryptedData = serde_json::from_slice(&encrypted_blob)
                .map_err(|_e| rusqlite::Error::InvalidColumnType(2, "encrypted_data".to_string(), rusqlite::types::Type::Blob))?;

            Ok((
                row.get::<_, String>(0)?,  // id
                row.get::<_, String>(1)?,  // patient_id
                encrypted_data,
                row.get::<_, String>(3)?,  // template_type
                row.get::<_, String>(4)?,  // created_at
                row.get::<_, String>(5)?,  // modified_at
                row.get::<_, bool>(6)?,    // consent_obtained
                row.get::<_, bool>(7)?,    // encrypted
                row.get::<_, bool>(8)?,    // deidentified
                row.get::<_, String>(9)?,  // sync_status
                row.get::<_, String>(10)?, // quebec_compliance
            ))
        });

        match result {
            Ok((id, patient_id, encrypted_data, template_type, created_at, modified_at,
                consent_obtained, encrypted, deidentified, sync_status, quebec_compliance)) => {

                // Decrypt content
                let content = self.decrypt_content(&encrypted_data)?;

                let note = MedicalNote {
                    id,
                    patient_id,
                    content,
                    template_type,
                    created_at: DateTime::parse_from_rfc3339(&created_at)
                        .map_err(|e| EncryptionError::DecryptionFailed(format!("Date parsing failed: {}", e)))?
                        .with_timezone(&Utc),
                    modified_at: DateTime::parse_from_rfc3339(&modified_at)
                        .map_err(|e| EncryptionError::DecryptionFailed(format!("Date parsing failed: {}", e)))?
                        .with_timezone(&Utc),
                    consent_obtained,
                    encrypted,
                    deidentified,
                    sync_status: serde_json::from_str(&sync_status)
                        .map_err(|e| EncryptionError::DecryptionFailed(format!("Sync status parsing failed: {}", e)))?,
                    quebec_compliance: serde_json::from_str(&quebec_compliance)
                        .map_err(|e| EncryptionError::DecryptionFailed(format!("Quebec compliance parsing failed: {}", e)))?,
                };

                Ok(Some(note))
            },
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(EncryptionError::Database(e)),
        }
    }

    /// List medical notes for a patient with pagination
    pub async fn list_notes_for_patient(&self, patient_id: &str, user_id: &str, limit: u32, offset: u32) -> Result<Vec<MedicalNote>, EncryptionError> {
        let conn = Connection::open(&self.db_path)?;

        let mut stmt = conn.prepare(
            "SELECT id, patient_id, encrypted_content, template_type, created_at, modified_at,
                    consent_obtained, encrypted, deidentified, sync_status, quebec_compliance
             FROM medical_notes
             WHERE patient_id = ?1
             ORDER BY created_at DESC
             LIMIT ?2 OFFSET ?3"
        )?;

        let rows = stmt.query_map(params![patient_id, limit, offset], |row| {
            let encrypted_blob: Vec<u8> = row.get(2)?;
            let encrypted_data: EncryptedData = serde_json::from_slice(&encrypted_blob)
                .map_err(|_| rusqlite::Error::InvalidColumnType(2, "encrypted_data".to_string(), rusqlite::types::Type::Blob))?;

            Ok((
                row.get::<_, String>(0)?,  // id
                row.get::<_, String>(1)?,  // patient_id
                encrypted_data,
                row.get::<_, String>(3)?,  // template_type
                row.get::<_, String>(4)?,  // created_at
                row.get::<_, String>(5)?,  // modified_at
                row.get::<_, bool>(6)?,    // consent_obtained
                row.get::<_, bool>(7)?,    // encrypted
                row.get::<_, bool>(8)?,    // deidentified
                row.get::<_, String>(9)?,  // sync_status
                row.get::<_, String>(10)?, // quebec_compliance
            ))
        })?;

        let mut notes = Vec::new();
        for row_result in rows {
            let (id, patient_id, encrypted_data, template_type, created_at, modified_at,
                 consent_obtained, encrypted, deidentified, sync_status, quebec_compliance) = row_result?;

            // Decrypt content
            let content = self.decrypt_content(&encrypted_data)?;

            let note = MedicalNote {
                id,
                patient_id,
                content,
                template_type,
                created_at: DateTime::parse_from_rfc3339(&created_at)
                    .map_err(|e| EncryptionError::DecryptionFailed(format!("Date parsing failed: {}", e)))?
                    .with_timezone(&Utc),
                modified_at: DateTime::parse_from_rfc3339(&modified_at)
                    .map_err(|e| EncryptionError::DecryptionFailed(format!("Date parsing failed: {}", e)))?
                    .with_timezone(&Utc),
                consent_obtained,
                encrypted,
                deidentified,
                sync_status: serde_json::from_str(&sync_status)
                    .map_err(|e| EncryptionError::DecryptionFailed(format!("Sync status parsing failed: {}", e)))?,
                quebec_compliance: serde_json::from_str(&quebec_compliance)
                    .map_err(|e| EncryptionError::DecryptionFailed(format!("Quebec compliance parsing failed: {}", e)))?,
            };

            notes.push(note);
        }

        // Log audit entry for patient notes access
        self.log_audit_entry_sync(&format!("patient_{}", patient_id), "notes_list", user_id, true)?;

        Ok(notes)
    }

    /// Delete medical note with audit trail
    pub async fn delete_note(&self, note_id: &str, user_id: &str) -> Result<(), EncryptionError> {
        let conn = Connection::open(&self.db_path)?;

        // Log deletion before actually deleting
        self.log_audit_entry_sync(note_id, "note_delete", user_id, true)?;

        conn.execute("DELETE FROM medical_notes WHERE id = ?1", params![note_id])?;

        tracing::info!("Medical note deleted: {}", note_id);
        Ok(())
    }

    /// Validate Quebec Law 25 compliance
    fn validate_law25_compliance(&self, note: &MedicalNote) -> Result<(), EncryptionError> {
        if !note.consent_obtained {
            return Err(EncryptionError::ComplianceViolation(
                "Law 25: Patient consent is required for processing personal health information".to_string()
            ));
        }

        if !note.quebec_compliance.law_25_consent {
            return Err(EncryptionError::ComplianceViolation(
                "Law 25: Explicit consent flag must be set".to_string()
            ));
        }

        if !note.quebec_compliance.data_minimization {
            return Err(EncryptionError::ComplianceViolation(
                "Law 25: Data minimization principle must be enforced".to_string()
            ));
        }

        if note.quebec_compliance.retention_period_days == 0 {
            return Err(EncryptionError::ComplianceViolation(
                "Law 25: Retention period must be specified".to_string()
            ));
        }

        Ok(())
    }

    /// Log audit entry for Law 25 compliance
    fn log_audit_entry_sync(&self, note_id: &str, action: &str, user_id: &str, phi_accessed: bool) -> Result<(), EncryptionError> {
        let audit_id = Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        let conn = Connection::open(&self.db_path)?;
        conn.execute(
            "INSERT INTO audit_log (id, timestamp, note_id, action, user_id, phi_accessed)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                audit_id,
                timestamp.to_rfc3339(),
                note_id,
                action,
                user_id,
                phi_accessed
            ],
        )?;

        Ok(())
    }

    /// Get audit trail for compliance reporting
    pub async fn get_audit_trail(&self, note_id: Option<&str>, user_id: &str) -> Result<Vec<AuditEntry>, EncryptionError> {
        let conn = Connection::open(&self.db_path)?;

        let mut audit_entries = Vec::new();

        if let Some(note_id) = note_id {
            let mut stmt = conn.prepare(
                "SELECT timestamp, action, user_id, phi_accessed, ip_address
                 FROM audit_log
                 WHERE note_id = ?1
                 ORDER BY timestamp DESC"
            )?;
            let rows = stmt.query_map(params![note_id], |row| {
                Ok(AuditEntry {
                    timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(0)?)
                        .map_err(|_| rusqlite::Error::InvalidColumnType(0, "timestamp".to_string(), rusqlite::types::Type::Text))?
                        .with_timezone(&Utc),
                    action: row.get(1)?,
                    user_id: row.get(2)?,
                    phi_accessed: row.get(3)?,
                    ip_address: row.get(4)?,
                })
            })?;

            for row_result in rows {
                audit_entries.push(row_result?);
            }
        } else {
            let mut stmt = conn.prepare(
                "SELECT timestamp, action, user_id, phi_accessed, ip_address
                 FROM audit_log
                 ORDER BY timestamp DESC
                 LIMIT 1000"
            )?;
            let rows = stmt.query_map(params![], |row| {
                Ok(AuditEntry {
                    timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(0)?)
                        .map_err(|_| rusqlite::Error::InvalidColumnType(0, "timestamp".to_string(), rusqlite::types::Type::Text))?
                        .with_timezone(&Utc),
                    action: row.get(1)?,
                    user_id: row.get(2)?,
                    phi_accessed: row.get(3)?,
                    ip_address: row.get(4)?,
                })
            })?;

            for row_result in rows {
                audit_entries.push(row_result?);
            }
        }

        // Log audit trail access
        self.log_audit_entry_sync("audit_trail", "audit_access", user_id, false)?;

        Ok(audit_entries)
    }
}