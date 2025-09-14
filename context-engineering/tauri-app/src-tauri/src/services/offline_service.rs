use sqlx::{SqlitePool, migrate::MigrateDatabase, Row};
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::Mutex;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::services::FirebaseService;

#[derive(thiserror::Error, Debug)]
pub enum OfflineError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("Sync error: {0}")]
    Sync(String),
}

#[derive(Debug, Clone)]
pub enum OperationType {
    Create,
    Update,
    Delete,
}

#[derive(Debug, Clone)]
pub struct SyncOperation {
    pub id: String,
    pub collection: String,
    pub document_id: String,
    pub operation: OperationType,
    pub data: Option<Value>,
    pub created_at: DateTime<Utc>,
    pub retries: i32,
}

pub struct OfflineService {
    pool: SqlitePool,
    sync_queue: Arc<Mutex<Vec<SyncOperation>>>,
}

impl OfflineService {
    /// Initialize offline service with SQLite database
    pub async fn new(database_path: &str) -> Result<Self, OfflineError> {
        let database_url = format!("sqlite:{}", database_path);

        // Create database if it doesn't exist
        if !sqlx::Sqlite::database_exists(&database_url).await? {
            sqlx::Sqlite::create_database(&database_url).await?;
            tracing::info!("Created SQLite database at: {}", database_path);
        }

        let pool = SqlitePool::connect(&database_url).await?;

        // Run migrations
        let service = Self {
            pool,
            sync_queue: Arc::new(Mutex::new(Vec::new())),
        };

        service.run_migrations().await?;

        tracing::info!("Offline service initialized with database: {}", database_path);
        Ok(service)
    }

    /// Run database migrations
    async fn run_migrations(&self) -> Result<(), OfflineError> {
        // Create cache table for storing Firestore documents
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS cache (
                id TEXT PRIMARY KEY,
                collection TEXT NOT NULL,
                document_id TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                synced BOOLEAN DEFAULT FALSE,
                UNIQUE(collection, document_id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;

        // Create sync_queue table for pending operations
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS sync_queue (
                id TEXT PRIMARY KEY,
                collection TEXT NOT NULL,
                document_id TEXT NOT NULL,
                operation TEXT NOT NULL,
                data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                retries INTEGER DEFAULT 0
            )
            "#
        )
        .execute(&self.pool)
        .await?;

        // Create index for faster queries
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_cache_collection ON cache(collection)")
            .execute(&self.pool)
            .await?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_cache_synced ON cache(synced)")
            .execute(&self.pool)
            .await?;

        tracing::info!("Database migrations completed");
        Ok(())
    }

    /// Cache data locally
    pub async fn cache_document<T>(&self, collection: &str, document_id: &str, data: &T) -> Result<(), OfflineError>
    where
        T: serde::Serialize,
    {
        let data_json = serde_json::to_string(data)?;
        let cache_id = Uuid::new_v4().to_string();

        sqlx::query(
            r#"
            INSERT OR REPLACE INTO cache (id, collection, document_id, data, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            "#
        )
        .bind(&cache_id)
        .bind(collection)
        .bind(document_id)
        .bind(&data_json)
        .execute(&self.pool)
        .await?;

        tracing::debug!("Cached document {}/{}", collection, document_id);
        Ok(())
    }

    /// Get cached document
    pub async fn get_cached_document<T>(&self, collection: &str, document_id: &str) -> Result<Option<T>, OfflineError>
    where
        T: for<'de> serde::Deserialize<'de>,
    {
        let row = sqlx::query(
            "SELECT data FROM cache WHERE collection = ? AND document_id = ?"
        )
        .bind(collection)
        .bind(document_id)
        .fetch_optional(&self.pool)
        .await?;

        match row {
            Some(row) => {
                let data_json: String = row.get("data");
                let data: T = serde_json::from_str(&data_json)?;
                Ok(Some(data))
            }
            None => Ok(None),
        }
    }

    /// Get cached documents from collection with pagination
    pub async fn get_cached_documents<T>(&self, collection: &str, page: u32, limit: u32) -> Result<Vec<T>, OfflineError>
    where
        T: for<'de> serde::Deserialize<'de>,
    {
        let offset = (page.saturating_sub(1)) * limit;

        let rows = sqlx::query(
            r#"
            SELECT data FROM cache
            WHERE collection = ?
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?
            "#
        )
        .bind(collection)
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await?;

        let mut documents = Vec::new();
        for row in rows {
            let data_json: String = row.get("data");
            let data: T = serde_json::from_str(&data_json)?;
            documents.push(data);
        }

        Ok(documents)
    }

    /// Add operation to sync queue
    pub async fn queue_sync_operation(
        &self,
        collection: &str,
        document_id: &str,
        operation: OperationType,
        data: Option<Value>
    ) -> Result<(), OfflineError> {
        let sync_op = SyncOperation {
            id: Uuid::new_v4().to_string(),
            collection: collection.to_string(),
            document_id: document_id.to_string(),
            operation: operation.clone(),
            data,
            created_at: Utc::now(),
            retries: 0,
        };

        // Add to in-memory queue
        self.sync_queue.lock().await.push(sync_op.clone());

        // Persist to database
        let operation_str = match operation {
            OperationType::Create => "CREATE",
            OperationType::Update => "UPDATE",
            OperationType::Delete => "DELETE",
        };

        sqlx::query(
            r#"
            INSERT INTO sync_queue (id, collection, document_id, operation, data)
            VALUES (?, ?, ?, ?, ?)
            "#
        )
        .bind(&sync_op.id)
        .bind(&sync_op.collection)
        .bind(&sync_op.document_id)
        .bind(operation_str)
        .bind(sync_op.data.as_ref().map(|d| d.to_string()))
        .execute(&self.pool)
        .await?;

        tracing::debug!("Queued sync operation: {:?} for {}/{}", operation, collection, document_id);
        Ok(())
    }

    /// Sync with Firebase when online
    pub async fn sync_with_firebase(&self, firebase: &FirebaseService) -> Result<(), OfflineError> {
        let operations = {
            let queue = self.sync_queue.lock().await;
            queue.clone()
        };

        let mut successful_syncs = Vec::new();

        for op in operations {
            match self.execute_sync_operation(firebase, &op).await {
                Ok(_) => {
                    successful_syncs.push(op.id.clone());
                    tracing::info!("Successfully synced operation: {}", op.id);
                }
                Err(e) => {
                    tracing::warn!("Failed to sync operation {}: {}", op.id, e);

                    // Update retry count
                    sqlx::query("UPDATE sync_queue SET retries = retries + 1 WHERE id = ?")
                        .bind(&op.id)
                        .execute(&self.pool)
                        .await?;
                }
            }
        }

        // Remove successfully synced operations
        for sync_id in successful_syncs {
            self.remove_sync_operation(&sync_id).await?;
        }

        Ok(())
    }

    /// Execute individual sync operation
    async fn execute_sync_operation(&self, firebase: &FirebaseService, op: &SyncOperation) -> Result<(), OfflineError> {
        match op.operation {
            OperationType::Create => {
                if let Some(ref data) = op.data {
                    firebase.create_document(&op.collection, &op.document_id, data)
                        .await
                        .map_err(|e| OfflineError::Sync(format!("Create failed: {}", e)))?;
                }
            }
            OperationType::Update => {
                if let Some(ref data) = op.data {
                    firebase.update_document(&op.collection, &op.document_id, data)
                        .await
                        .map_err(|e| OfflineError::Sync(format!("Update failed: {}", e)))?;
                }
            }
            OperationType::Delete => {
                firebase.delete_document(&op.collection, &op.document_id)
                    .await
                    .map_err(|e| OfflineError::Sync(format!("Delete failed: {}", e)))?;
            }
        }

        Ok(())
    }

    /// Remove sync operation from queue
    async fn remove_sync_operation(&self, sync_id: &str) -> Result<(), OfflineError> {
        // Remove from in-memory queue
        {
            let mut queue = self.sync_queue.lock().await;
            queue.retain(|op| op.id != sync_id);
        }

        // Remove from database
        sqlx::query("DELETE FROM sync_queue WHERE id = ?")
            .bind(sync_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    /// Get pending sync operations count
    pub async fn get_pending_sync_count(&self) -> Result<i64, OfflineError> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM sync_queue")
            .fetch_one(&self.pool)
            .await?;

        Ok(row.get("count"))
    }

    /// Clear cache for collection
    pub async fn clear_cache(&self, collection: &str) -> Result<(), OfflineError> {
        sqlx::query("DELETE FROM cache WHERE collection = ?")
            .bind(collection)
            .execute(&self.pool)
            .await?;

        tracing::info!("Cleared cache for collection: {}", collection);
        Ok(())
    }

    /// Get cache statistics
    pub async fn get_cache_stats(&self) -> Result<serde_json::Value, OfflineError> {
        let row = sqlx::query(
            r#"
            SELECT
                COUNT(*) as total_documents,
                COUNT(CASE WHEN synced = 1 THEN 1 END) as synced_documents,
                COUNT(CASE WHEN synced = 0 THEN 1 END) as unsynced_documents
            FROM cache
            "#
        )
        .fetch_one(&self.pool)
        .await?;

        let stats = serde_json::json!({
            "total_documents": row.get::<i64, _>("total_documents"),
            "synced_documents": row.get::<i64, _>("synced_documents"),
            "unsynced_documents": row.get::<i64, _>("unsynced_documents")
        });

        Ok(stats)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_offline_service_creation() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");

        let service = OfflineService::new(db_path.to_str().unwrap()).await;
        assert!(service.is_ok());
    }

    #[tokio::test]
    async fn test_cache_operations() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let service = OfflineService::new(db_path.to_str().unwrap()).await.unwrap();

        let test_data = serde_json::json!({"name": "Test", "value": 42});

        // Test caching
        service.cache_document("test", "doc1", &test_data).await.unwrap();

        // Test retrieval
        let cached: Option<serde_json::Value> = service
            .get_cached_document("test", "doc1")
            .await
            .unwrap();

        assert!(cached.is_some());
        assert_eq!(cached.unwrap()["name"], "Test");
    }
}