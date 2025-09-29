use serde::{Deserialize, Serialize};
use tauri::State;
use std::collections::HashMap;
use std::sync::RwLock;

use crate::models::user::User;
use crate::models::common::{UserType, firestore_now, firestore_timestamp_to_string};

// Mock database for development
type UserDatabase = RwLock<HashMap<String, User>>;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub username: String,
    #[serde(rename = "userType")]
    pub user_type: i32,
    #[serde(rename = "firstName")]
    pub first_name: String,
    #[serde(rename = "lastName")]
    pub last_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    #[serde(rename = "objectId")]
    pub object_id: String,
    #[serde(rename = "firstName")]
    pub first_name: Option<String>,
    #[serde(rename = "lastName")]
    pub last_name: Option<String>,
    pub bio: Option<String>,
    #[serde(rename = "profilePicture")]
    pub profile_picture: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub user: User,
    #[serde(rename = "displayName")]
    pub display_name: String,
    #[serde(rename = "isAvailable")]
    pub is_available: bool,
    #[serde(rename = "loginCount")]
    pub login_count: i32,
    #[serde(rename = "lastLogin")]
    pub last_login: Option<String>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        UserResponse {
            display_name: user.display_name(),
            is_available: user.is_available(),
            login_count: user.login_count,
            last_login: user.last_login.as_ref().map(|ts| firestore_timestamp_to_string(ts)),
            user,
        }
    }
}

#[tauri::command]
pub async fn create_user(
    request: CreateUserRequest,
    user_db: State<'_, UserDatabase>,
) -> Result<UserResponse, String> {
    let user_type = UserType::try_from(request.user_type as u8)
        .map_err(|_| "Invalid user type")?;

    let object_id = uuid::Uuid::new_v4().to_string();

    let user = User::new(
        object_id.clone(),
        request.email,
        request.username,
        user_type,
        request.first_name,
        request.last_name,
    );

    let response = UserResponse::from(user.clone());

    // Store in mock database
    user_db.write().unwrap().insert(object_id, user);

    Ok(response)
}

#[tauri::command]
pub async fn get_user_by_id(
    user_id: String,
    user_db: State<'_, UserDatabase>,
) -> Result<UserResponse, String> {
    let db = user_db.read().unwrap();

    match db.get(&user_id) {
        Some(user) => Ok(UserResponse::from(user.clone())),
        None => Err("User not found".to_string()),
    }
}

#[tauri::command]
pub async fn update_user_profile(
    request: UpdateUserRequest,
    user_db: State<'_, UserDatabase>,
) -> Result<UserResponse, String> {
    let mut db = user_db.write().unwrap();

    match db.get_mut(&request.object_id) {
        Some(user) => {
            if let Some(first_name) = request.first_name {
                user.profile.first_name = first_name;
            }
            if let Some(last_name) = request.last_name {
                user.profile.last_name = last_name;
            }
            if let Some(bio) = request.bio {
                user.profile.bio = Some(bio);
            }
            if let Some(profile_picture) = request.profile_picture {
                user.profile.profile_picture = Some(profile_picture);
            }

            user.base.updated_at = firestore_now();

            Ok(UserResponse::from(user.clone()))
        }
        None => Err("User not found".to_string()),
    }
}

#[tauri::command]
pub async fn record_user_login(
    user_id: String,
    user_db: State<'_, UserDatabase>,
) -> Result<(), String> {
    let mut db = user_db.write().unwrap();

    match db.get_mut(&user_id) {
        Some(user) => {
            user.record_login();
            Ok(())
        }
        None => Err("User not found".to_string()),
    }
}

#[tauri::command]
pub async fn suspend_user(
    user_id: String,
    reason: String,
    user_db: State<'_, UserDatabase>,
) -> Result<(), String> {
    let mut db = user_db.write().unwrap();

    match db.get_mut(&user_id) {
        Some(user) => {
            user.suspend(reason);
            Ok(())
        }
        None => Err("User not found".to_string()),
    }
}

#[tauri::command]
pub async fn reactivate_user(
    user_id: String,
    user_db: State<'_, UserDatabase>,
) -> Result<(), String> {
    let mut db = user_db.write().unwrap();

    match db.get_mut(&user_id) {
        Some(user) => {
            user.reactivate();
            Ok(())
        }
        None => Err("User not found".to_string()),
    }
}

#[tauri::command]
pub async fn get_user_display_name(
    user_id: String,
    user_db: State<'_, UserDatabase>,
) -> Result<String, String> {
    let db = user_db.read().unwrap();

    match db.get(&user_id) {
        Some(user) => Ok(user.display_name()),
        None => Err("User not found".to_string()),
    }
}

#[tauri::command]
pub async fn check_user_availability(
    user_id: String,
    user_db: State<'_, UserDatabase>,
) -> Result<bool, String> {
    let db = user_db.read().unwrap();

    match db.get(&user_id) {
        Some(user) => Ok(user.is_available()),
        None => Err("User not found".to_string()),
    }
}