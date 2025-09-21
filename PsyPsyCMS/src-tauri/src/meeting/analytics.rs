// Healthcare analytics functionality - allow dead code for comprehensive analytics system
#![allow(dead_code)]

use posthog_rs::{client, Event};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use futures_util::TryFutureExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticsConfig {
    pub api_key: String,
    pub disabled: bool,
    pub track_user_sessions: bool,
    pub track_feature_usage: bool,
    pub track_performance: bool,
}

impl Default for AnalyticsConfig {
    fn default() -> Self {
        Self {
            api_key: "".to_string(),
            disabled: true, // Default to disabled for privacy
            track_user_sessions: false,
            track_feature_usage: false,
            track_performance: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSession {
    pub user_id: String,
    pub session_id: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
}

impl UserSession {
    pub fn new(user_id: String) -> Self {
        Self {
            user_id,
            session_id: Uuid::new_v4().to_string(),
            start_time: Utc::now(),
            end_time: None,
        }
    }

    pub fn duration_seconds(&self) -> i64 {
        let end = self.end_time.unwrap_or_else(Utc::now);
        end.signed_duration_since(self.start_time).num_seconds()
    }
}

pub struct AnalyticsClient {
    client: Option<posthog_rs::Client>,
    config: AnalyticsConfig,
    current_session: Arc<Mutex<Option<UserSession>>>,
}

impl AnalyticsClient {
    pub async fn new(config: AnalyticsConfig) -> Self {
        let client = if !config.disabled && !config.api_key.is_empty() {
            Some(client(config.api_key.as_str()).await)
        } else {
            None
        };

        Self {
            client,
            config,
            current_session: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn identify(&self, user_id: String, properties: Option<HashMap<String, String>>) -> Result<(), String> {
        if let Some(client) = &self.client {
            let mut event = Event::new("identify", &user_id);

            if let Some(props) = properties {
                for (key, value) in props {
                    event.insert_prop(&key, value).map_err(|e| e.to_string())?;
                }
            }

            client.capture(event).await.map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub async fn track_event(&self, event_name: &str, properties: Option<HashMap<String, String>>) -> Result<(), String> {
        if let Some(client) = &self.client {
            let session = self.current_session.lock().await;
            if let Some(session) = session.as_ref() {
                let mut event = Event::new(event_name, &session.user_id);

                // Add session context
                event.insert_prop("session_id", session.session_id.clone()).map_err(|e| e.to_string())?;
                event.insert_prop("session_duration", session.duration_seconds().to_string()).map_err(|e| e.to_string())?;

                if let Some(props) = properties {
                    for (key, value) in props {
                        event.insert_prop(&key, value).map_err(|e| e.to_string())?;
                    }
                }

                client.capture(event).await.map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }

    pub async fn start_session(&self, user_id: String) -> Result<String, String> {
        let mut session_guard = self.current_session.lock().await;
        let new_session = UserSession::new(user_id.clone());
        let session_id = new_session.session_id.clone();

        *session_guard = Some(new_session);

        if self.config.track_user_sessions {
            self.track_event("session_started", Some(HashMap::from([
                ("user_id".to_string(), user_id),
                ("session_id".to_string(), session_id.clone()),
            ]))).await?;
        }

        Ok(session_id)
    }

    pub async fn end_session(&self) -> Result<(), String> {
        let mut session_guard = self.current_session.lock().await;
        if let Some(mut session) = session_guard.take() {
            session.end_time = Some(Utc::now());

            if self.config.track_user_sessions {
                self.track_event("session_ended", Some(HashMap::from([
                    ("session_id".to_string(), session.session_id.clone()),
                    ("duration_seconds".to_string(), session.duration_seconds().to_string()),
                ]))).await?;
            }
        }
        Ok(())
    }

    pub async fn track_daily_active_user(&self) -> Result<(), String> {
        self.track_event("daily_active_user", None).await
    }

    pub async fn track_user_first_launch(&self) -> Result<(), String> {
        self.track_event("user_first_launch", None).await
    }

    pub async fn get_current_session(&self) -> Option<UserSession> {
        self.current_session.lock().await.clone()
    }

    pub async fn is_session_active(&self) -> bool {
        self.current_session.lock().await.is_some()
    }

    pub async fn track_meeting_started(&self, meeting_id: &str, meeting_title: &str) -> Result<(), String> {
        self.track_event("meeting_started", Some(HashMap::from([
            ("meeting_id".to_string(), meeting_id.to_string()),
            ("meeting_title".to_string(), meeting_title.to_string()),
        ]))).await
    }

    pub async fn track_recording_started(&self, meeting_id: &str) -> Result<(), String> {
        self.track_event("recording_started", Some(HashMap::from([
            ("meeting_id".to_string(), meeting_id.to_string()),
        ]))).await
    }

    pub async fn track_recording_stopped(&self, meeting_id: &str, duration_seconds: Option<u64>) -> Result<(), String> {
        let mut properties = HashMap::from([
            ("meeting_id".to_string(), meeting_id.to_string()),
        ]);

        if let Some(duration) = duration_seconds {
            properties.insert("duration_seconds".to_string(), duration.to_string());
        }

        self.track_event("recording_stopped", Some(properties)).await
    }

    pub async fn track_meeting_deleted(&self, meeting_id: &str) -> Result<(), String> {
        self.track_event("meeting_deleted", Some(HashMap::from([
            ("meeting_id".to_string(), meeting_id.to_string()),
        ]))).await
    }

    pub async fn track_search_performed(&self, query: &str, results_count: usize) -> Result<(), String> {
        self.track_event("search_performed", Some(HashMap::from([
            ("query_length".to_string(), query.len().to_string()),
            ("results_count".to_string(), results_count.to_string()),
        ]))).await
    }

    pub async fn track_settings_changed(&self, setting_type: &str, new_value: &str) -> Result<(), String> {
        self.track_event("settings_changed", Some(HashMap::from([
            ("setting_type".to_string(), setting_type.to_string()),
            ("new_value".to_string(), new_value.to_string()),
        ]))).await
    }

    pub async fn track_app_started(&self, version: &str) -> Result<(), String> {
        self.track_event("app_started", Some(HashMap::from([
            ("app_version".to_string(), version.to_string()),
        ]))).await
    }

    pub async fn track_feature_used(&self, feature_name: &str) -> Result<(), String> {
        if self.config.track_feature_usage {
            self.track_event("feature_used", Some(HashMap::from([
                ("feature_name".to_string(), feature_name.to_string()),
            ]))).await
        } else {
            Ok(())
        }
    }

    pub async fn track_summary_generation_started(&self, model_provider: &str, model_name: &str, transcript_length: usize) -> Result<(), String> {
        self.track_event("summary_generation_started", Some(HashMap::from([
            ("model_provider".to_string(), model_provider.to_string()),
            ("model_name".to_string(), model_name.to_string()),
            ("transcript_length".to_string(), transcript_length.to_string()),
        ]))).await
    }

    pub async fn track_summary_generation_completed(&self, model_provider: &str, model_name: &str, success: bool, duration_seconds: Option<u32>) -> Result<(), String> {
        let mut properties = HashMap::from([
            ("model_provider".to_string(), model_provider.to_string()),
            ("model_name".to_string(), model_name.to_string()),
            ("success".to_string(), success.to_string()),
        ]);

        if let Some(duration) = duration_seconds {
            properties.insert("duration_seconds".to_string(), duration.to_string());
        }

        self.track_event("summary_generation_completed", Some(properties)).await
    }

    pub async fn track_summary_regenerated(&self, model_provider: &str, model_name: &str) -> Result<(), String> {
        self.track_event("summary_regenerated", Some(HashMap::from([
            ("model_provider".to_string(), model_provider.to_string()),
            ("model_name".to_string(), model_name.to_string()),
        ]))).await
    }

    pub async fn track_model_changed(&self, old_provider: &str, old_model: &str, new_provider: &str, new_model: &str) -> Result<(), String> {
        self.track_event("model_changed", Some(HashMap::from([
            ("old_provider".to_string(), old_provider.to_string()),
            ("old_model".to_string(), old_model.to_string()),
            ("new_provider".to_string(), new_provider.to_string()),
            ("new_model".to_string(), new_model.to_string()),
        ]))).await
    }

    pub async fn track_custom_prompt_used(&self, prompt_length: usize) -> Result<(), String> {
        self.track_event("custom_prompt_used", Some(HashMap::from([
            ("prompt_length".to_string(), prompt_length.to_string()),
        ]))).await
    }

    pub fn is_enabled(&self) -> bool {
        !self.config.disabled && self.client.is_some()
    }

    pub async fn set_user_properties(&self, properties: HashMap<String, String>) -> Result<(), String> {
        if let Some(client) = &self.client {
            let session = self.current_session.lock().await;
            if let Some(session) = session.as_ref() {
                let mut event = Event::new("$set", &session.user_id);

                for (key, value) in properties {
                    event.insert_prop(&key, value).map_err(|e| e.to_string())?;
                }

                client.capture(event).await.map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }
}

pub async fn create_analytics_client(config: AnalyticsConfig) -> AnalyticsClient {
    AnalyticsClient::new(config).await
}