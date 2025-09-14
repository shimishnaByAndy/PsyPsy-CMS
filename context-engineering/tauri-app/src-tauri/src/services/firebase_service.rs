use firestore::{FirestoreDb, FirestoreDbOptions, FirestoreResult};
use rs_firebase_admin_sdk::{App, auth::FirebaseAuthService};
// use rs_firebase_admin_sdk::credentials_provider;  // Not available in this version
use std::sync::Arc;
use serde_json::Value;

use crate::security::audit::hipaa_audit_log;

#[derive(thiserror::Error, Debug)]
pub enum FirebaseError {
    #[error("Firestore error: {0}")]
    Firestore(#[from] firestore::errors::FirestoreError),
    #[error("Firebase Auth error: {0}")]
    Auth(String),
    #[error("Initialization error: {0}")]
    Init(String),
    #[error("Encryption error: {0}")]
    Encryption(String),
    #[error("Audit error: {0}")]
    Audit(String),
}

pub struct FirebaseService {
    pub db: FirestoreDb,
    pub auth: Arc<dyn FirebaseAuthService + Send + Sync>,
    project_id: String,
}

impl FirebaseService {
    /// Initialize Firebase service with service account
    pub async fn new(project_id: &str, service_account_path: &str) -> Result<Self, FirebaseError> {
        // Install TLS provider for rustls
        rustls::crypto::ring::default_provider()
            .install_default()
            .map_err(|e| FirebaseError::Init(format!("Failed to install rustls crypto provider: {}", e)))?;

        // Initialize Firestore with fluent API support
        let db_options = FirestoreDbOptions::new(project_id.to_string());
        let db = FirestoreDb::with_options_service_account_key_file(
            db_options,
            service_account_path.into()
        ).await.map_err(FirebaseError::Firestore)?;

        // Initialize Firebase Admin SDK for auth
        let gcp_sa = credentials_provider::from_file(service_account_path)
            .await
            .map_err(|e| FirebaseError::Init(format!("Failed to load service account: {}", e)))?;

        let app = App::live(gcp_sa)
            .await
            .map_err(|e| FirebaseError::Init(format!("Failed to initialize Firebase app: {}", e)))?;

        let auth = Arc::new(app.auth());

        tracing::info!("Firebase service initialized successfully for project: {}", project_id);

        Ok(Self {
            db,
            auth,
            project_id: project_id.to_string(),
        })
    }

    /// Create a document in Firestore collection
    pub async fn create_document<T>(&self, collection: &str, document_id: &str, data: &T) -> FirestoreResult<String>
    where
        T: serde::Serialize,
    {
        let doc_id = self.db
            .fluent()
            .insert()
            .into(collection)
            .document_id(document_id)
            .object(data)
            .execute()
            .await?;

        tracing::info!("Created document {} in collection {}", doc_id, collection);
        Ok(doc_id)
    }

    /// Get a document by ID from Firestore collection
    pub async fn get_document<T>(&self, collection: &str, document_id: &str) -> FirestoreResult<Option<T>>
    where
        T: for<'de> serde::Deserialize<'de> + Send,
    {
        let result = self.db
            .fluent()
            .select()
            .by_id_in(collection)
            .obj()
            .one(document_id)
            .await?;

        Ok(result)
    }

    /// Update a document in Firestore collection
    pub async fn update_document<T>(&self, collection: &str, document_id: &str, data: &T) -> FirestoreResult<T>
    where
        T: serde::Serialize + for<'de> serde::Deserialize<'de> + Send,
    {
        let updated = self.db
            .fluent()
            .update()
            .in_col(collection)
            .document_id(document_id)
            .object(data)
            .execute()
            .await?;

        tracing::info!("Updated document {} in collection {}", document_id, collection);
        Ok(updated)
    }

    /// Delete a document from Firestore collection
    pub async fn delete_document(&self, collection: &str, document_id: &str) -> FirestoreResult<()> {
        self.db
            .fluent()
            .delete()
            .from(collection)
            .document_id(document_id)
            .execute()
            .await?;

        tracing::info!("Deleted document {} from collection {}", document_id, collection);
        Ok(())
    }

    /// Query documents with filters and pagination
    pub async fn query_documents<T>(&self, collection: &str, page: u32, limit: u32) -> FirestoreResult<Vec<T>>
    where
        T: for<'de> serde::Deserialize<'de> + Send,
    {
        let mut query = self.db
            .fluent()
            .select()
            .from(collection)
            .order_by([("createdAt", firestore::FirestoreQueryDirection::Descending)])
            .page_size(limit);

        if page > 1 {
            query = query.page(page);
        }

        let docs: Vec<T> = query
            .obj()
            .stream_query_with_errors()
            .await?
            .try_collect()
            .await?;

        Ok(docs)
    }

    /// Verify Firebase ID token
    pub async fn verify_token(&self, id_token: &str) -> Result<serde_json::Value, FirebaseError> {
        let token_verifier = self.auth.id_token_verifier()
            .await
            .map_err(|e| FirebaseError::Auth(format!("Failed to get token verifier: {}", e)))?;

        let decoded_token = token_verifier
            .verify_token(id_token)
            .await
            .map_err(|e| FirebaseError::Auth(format!("Token verification failed: {}", e)))?;

        Ok(decoded_token)
    }

    /// Get Firebase user by UID
    pub async fn get_user(&self, uid: &str) -> Result<rs_firebase_admin_sdk::auth::User, FirebaseError> {
        let user = self.auth
            .get_user(uid)
            .await
            .map_err(|e| FirebaseError::Auth(format!("Failed to get user: {}", e)))?;

        Ok(user)
    }

    /// Create HIPAA audit log entry
    pub async fn audit_log(
        &self,
        action: &str,
        resource: &str,
        user_id: &str,
        phi_accessed: bool,
        details: Option<Value>,
    ) -> Result<(), FirebaseError> {
        hipaa_audit_log(
            &self.db,
            action,
            resource,
            user_id,
            phi_accessed,
            details,
        ).await.map_err(|e| FirebaseError::Audit(format!("Failed to create audit log: {:?}", e)))?;

        Ok(())
    }

    /// Health check for Firebase services
    pub async fn health_check(&self) -> Result<(), FirebaseError> {
        // Test Firestore connection
        let _collections = self.db
            .fluent()
            .list_collections()
            .execute()
            .await
            .map_err(FirebaseError::Firestore)?;

        // Test Auth service
        let _verifier = self.auth
            .id_token_verifier()
            .await
            .map_err(|e| FirebaseError::Auth(format!("Auth service check failed: {}", e)))?;

        tracing::info!("Firebase health check passed");
        Ok(())
    }

    /// Get project ID
    pub fn project_id(&self) -> &str {
        &self.project_id
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;
    use std::io::Write;

    // Mock service account for testing
    fn create_mock_service_account() -> Result<NamedTempFile, std::io::Error> {
        let mut file = NamedTempFile::new()?;
        writeln!(
            file,
            r#"{{
                "type": "service_account",
                "project_id": "test-project",
                "private_key_id": "test-key-id",
                "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
                "client_email": "test@test-project.iam.gserviceaccount.com",
                "client_id": "123456789",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }}"#
        )?;
        Ok(file)
    }

    #[tokio::test]
    #[ignore] // Ignore by default as it requires actual Firebase project
    async fn test_firebase_service_creation() {
        let service_account = create_mock_service_account().unwrap();

        // This would fail with mock data, but tests the structure
        let result = FirebaseService::new("test-project", service_account.path().to_str().unwrap()).await;

        // In a real test environment, you would set up actual service account
        assert!(result.is_err()); // Expected to fail with mock data
    }
}