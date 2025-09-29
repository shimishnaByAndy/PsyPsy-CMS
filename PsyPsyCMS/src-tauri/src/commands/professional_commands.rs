use tauri::State;
use tokio::sync::RwLock;
use std::sync::Arc;
use uuid::Uuid;

use crate::services::firebase_service_simple::{FirebaseService, FirebaseServiceState};
use crate::models::{
    Professional, CreateProfessionalRequest, UpdateProfessionalRequest, ApiResponse,
    PaginatedResponse, SearchFilters, SortOptions, ProfessionalStats
};
use crate::models::professional::ProfessionalStatus;
use crate::security::auth::AuthState;

/// Get all professionals with pagination and filters
#[tauri::command]
pub async fn get_professionals(
    page: Option<u32>,
    limit: Option<u32>,
    _filters: Option<SearchFilters>,
    _sort: Option<SortOptions>,
    _firebase_state: State<'_, FirebaseServiceState>,
    auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<PaginatedResponse<Professional>>, String> {
    // For now, return mock data since Firebase is not fully initialized
    // This will be replaced with real Firebase queries once the service is complete

    // Check if auth state is accessible (safety check for state management)
    let _auth = auth_state.read().await;

    let page = page.unwrap_or(1);
    let limit = limit.unwrap_or(10);

    // Generate mock professionals data
    let mock_professionals = generate_mock_professionals();

    // Apply pagination
    let start_index = ((page - 1) * limit) as usize;
    let end_index = (start_index + limit as usize).min(mock_professionals.len());
    let professionals = if start_index < mock_professionals.len() {
        mock_professionals[start_index..end_index].to_vec()
    } else {
        Vec::new()
    };

    let total = mock_professionals.len() as u32;

    let response = PaginatedResponse {
        data: professionals,
        page,
        limit,
        total,
        has_next_page: total > (page * limit),
        has_previous_page: page > 1,
    };

    // Log the operation (when Firebase is available)
    let firebase_guard = _firebase_state.0.lock().await;
    if let Some(firebase) = firebase_guard.as_ref() {
        let _ = firebase.audit_log(
            "LIST_PROFESSIONALS",
            "professionals",
            "system", // Default user until auth is implemented
            false, // No specific PHI accessed for listing
            Some(serde_json::json!({"page": page, "limit": limit}))
        ).await;
    }

    Ok(ApiResponse::success(response))
}

// Generate mock professionals for development/testing
fn generate_mock_professionals() -> Vec<Professional> {
    use crate::models::common::{UserProfile, AddressObject, PhoneNumber, ExpertiseObject, ServiceObject, firestore_now};
    use crate::models::professional::{ProfessionalStatus, VerificationInfo, LicenseInfo, Rating, MeetingType};
    use std::collections::HashMap;

    let now = firestore_now();

    vec![
        Professional {
            object_id: "prof_001".to_string(),
            user_id: "user_001".to_string(),
            profile: UserProfile {
                first_name: "Dr. Sarah".to_string(),
                last_name: "Johnson".to_string(),
                date_of_birth: None,
                gender: Some(2), // Female
                profile_picture: Some("https://example.com/photos/sarah.jpg".to_string()),
                bio: Some("Experienced therapist specializing in cognitive behavioral therapy.".to_string()),
                created_at: now.clone(),
                updated_at: now.clone(),
                is_active: true,
            },
            address_obj: AddressObject {
                street: "123 Therapy Lane".to_string(),
                city: "Montreal".to_string(),
                state: "QC".to_string(),
                zip_code: "H1A 1A1".to_string(),
                country: "Canada".to_string(),
            },
            geo_pt: None,
            phone_nb: PhoneNumber {
                country_code: "+1".to_string(),
                number: "5551234567".to_string(),
                formatted: Some("+1-555-123-4567".to_string()),
            },
            buss_email: "sarah.johnson@psypsy.com".to_string(),
            business_name: "Dr. Sarah Johnson Psychology Services".to_string(),
            prof_type: 1, // Clinical Psychologist
            edu_institute: 1, // McGill University
            mother_tongue: 1, // English
            offered_lang_arr: vec![1, 2], // English, French
            expertises: vec![
                ExpertiseObject {
                    category: 1, // Anxiety disorders
                    subcategories: vec![1, 2, 3],
                    experience: 8,
                    certification: Some("CBT Certified".to_string()),
                },
                ExpertiseObject {
                    category: 2, // Depression
                    subcategories: vec![1, 2],
                    experience: 8,
                    certification: Some("Trauma Informed Care".to_string()),
                },
            ],
            serv_offered_arr: vec![1, 2], // Individual, Group therapy
            serv_offered_obj: HashMap::from([
                (1, ServiceObject {
                    name: "Individual Therapy".to_string(),
                    description: "One-on-one therapy sessions".to_string(),
                    duration: 50,
                    price: 150.0,
                    currency: "CAD".to_string(),
                }),
                (2, ServiceObject {
                    name: "Group Therapy".to_string(),
                    description: "Small group therapy sessions".to_string(),
                    duration: 90,
                    price: 80.0,
                    currency: "CAD".to_string(),
                }),
            ]),
            served_clientele: vec![1, 2, 3], // Adults, adolescents, young adults
            availability: vec![1, 2, 3, 4, 5], // Monday to Friday
            meet_type: MeetingType::Both,
            third_party_payers: vec![1, 2], // Blue Cross, Sun Life
            part_of_order: None,
            status: ProfessionalStatus::Active,
            verification: VerificationInfo {
                is_verified: true,
                verification_date: Some(now.clone()),
                verified_by: Some("admin_001".to_string()),
                verification_documents: vec![],
            },
            license_info: LicenseInfo {
                license_number: "QC-PSY-12345".to_string(),
                license_type: "Clinical Psychology".to_string(),
                issuing_state: "Quebec".to_string(),
                issue_date: "2016-01-15".to_string(),
                expiry_date: "2025-12-31".to_string(),
                is_active: true,
            },
            rating: Rating {
                average_rating: 4.8,
                total_reviews: 45,
                rating_distribution: HashMap::from([
                    (5, 35),
                    (4, 8),
                    (3, 2),
                    (2, 0),
                    (1, 0),
                ]),
            },
            total_clients: 67,
            active_clients: 23,
            total_appointments: 342,
            completed_appointments: 320,
            created_at: now.clone(),
            updated_at: now.clone(),
        },
        Professional {
            object_id: "prof_002".to_string(),
            user_id: "user_002".to_string(),
            profile: UserProfile {
                first_name: "Dr. Michael".to_string(),
                last_name: "Chen".to_string(),
                date_of_birth: None,
                gender: Some(1), // Male
                profile_picture: Some("https://example.com/photos/michael.jpg".to_string()),
                bio: Some("Child and adolescent psychologist with expertise in developmental disorders.".to_string()),
                created_at: now.clone(),
                updated_at: now.clone(),
                is_active: true,
            },
            address_obj: AddressObject {
                street: "456 Wellness Blvd".to_string(),
                city: "Quebec City".to_string(),
                state: "QC".to_string(),
                zip_code: "G1A 1A1".to_string(),
                country: "Canada".to_string(),
            },
            geo_pt: None,
            phone_nb: PhoneNumber {
                country_code: "+1".to_string(),
                number: "5552345678".to_string(),
                formatted: Some("+1-555-234-5678".to_string()),
            },
            buss_email: "michael.chen@psypsy.com".to_string(),
            business_name: "Dr. Michael Chen Child Psychology".to_string(),
            prof_type: 2, // Child Psychologist
            edu_institute: 2, // University of Montreal
            mother_tongue: 1, // English
            offered_lang_arr: vec![1, 3], // English, Mandarin
            expertises: vec![
                ExpertiseObject {
                    category: 3, // ADHD
                    subcategories: vec![1, 2],
                    experience: 12,
                    certification: Some("ADOS-2 Certified".to_string()),
                },
                ExpertiseObject {
                    category: 4, // Autism Spectrum
                    subcategories: vec![1, 2, 3],
                    experience: 12,
                    certification: Some("Play Therapy".to_string()),
                },
            ],
            serv_offered_arr: vec![3, 4], // Assessment, Family therapy
            serv_offered_obj: HashMap::from([
                (3, ServiceObject {
                    name: "Child Assessment".to_string(),
                    description: "Comprehensive developmental assessment".to_string(),
                    duration: 120,
                    price: 300.0,
                    currency: "CAD".to_string(),
                }),
                (4, ServiceObject {
                    name: "Family Therapy".to_string(),
                    description: "Family-based therapeutic intervention".to_string(),
                    duration: 60,
                    price: 175.0,
                    currency: "CAD".to_string(),
                }),
            ]),
            served_clientele: vec![4, 5], // Children, adolescents
            availability: vec![1, 2, 3, 4], // Monday to Thursday
            meet_type: MeetingType::Both,
            third_party_payers: vec![3, 4], // Desjardins, Manulife
            part_of_order: None,
            status: ProfessionalStatus::Active,
            verification: VerificationInfo {
                is_verified: true,
                verification_date: Some(now.clone()),
                verified_by: Some("admin_002".to_string()),
                verification_documents: vec![],
            },
            license_info: LicenseInfo {
                license_number: "QC-PSY-67890".to_string(),
                license_type: "Child Psychology".to_string(),
                issuing_state: "Quebec".to_string(),
                issue_date: "2012-03-10".to_string(),
                expiry_date: "2024-06-30".to_string(),
                is_active: true,
            },
            rating: Rating {
                average_rating: 4.6,
                total_reviews: 28,
                rating_distribution: HashMap::from([
                    (5, 20),
                    (4, 6),
                    (3, 2),
                    (2, 0),
                    (1, 0),
                ]),
            },
            total_clients: 45,
            active_clients: 18,
            total_appointments: 287,
            completed_appointments: 275,
            created_at: now.clone(),
            updated_at: now.clone(),
        },
        Professional {
            object_id: "prof_003".to_string(),
            user_id: "user_003".to_string(),
            profile: UserProfile {
                first_name: "Dr. Marie".to_string(),
                last_name: "Dubois".to_string(),
                date_of_birth: None,
                gender: Some(2), // Female
                profile_picture: Some("https://example.com/photos/marie.jpg".to_string()),
                bio: Some("Relationship specialist helping couples navigate challenges and strengthen bonds.".to_string()),
                created_at: now.clone(),
                updated_at: now.clone(),
                is_active: true,
            },
            address_obj: AddressObject {
                street: "789 Mindfulness Ave".to_string(),
                city: "Sherbrooke".to_string(),
                state: "QC".to_string(),
                zip_code: "J1A 1A1".to_string(),
                country: "Canada".to_string(),
            },
            geo_pt: None,
            phone_nb: PhoneNumber {
                country_code: "+1".to_string(),
                number: "5553456789".to_string(),
                formatted: Some("+1-555-345-6789".to_string()),
            },
            buss_email: "marie.dubois@psypsy.com".to_string(),
            business_name: "Couples Wellness Center".to_string(),
            prof_type: 3, // Marriage and Family Therapist
            edu_institute: 3, // Université de Sherbrooke
            mother_tongue: 2, // French
            offered_lang_arr: vec![1, 2], // English, French
            expertises: vec![
                ExpertiseObject {
                    category: 5, // Couples Therapy
                    subcategories: vec![1, 2, 3],
                    experience: 15,
                    certification: Some("Gottman Method".to_string()),
                },
                ExpertiseObject {
                    category: 6, // Marriage Counseling
                    subcategories: vec![1, 2],
                    experience: 15,
                    certification: Some("EFT Certified".to_string()),
                },
            ],
            serv_offered_arr: vec![5, 6], // Couples therapy, Pre-marital counseling
            serv_offered_obj: HashMap::from([
                (5, ServiceObject {
                    name: "Couples Therapy".to_string(),
                    description: "Relationship counseling for couples".to_string(),
                    duration: 60,
                    price: 165.0,
                    currency: "CAD".to_string(),
                }),
                (6, ServiceObject {
                    name: "Pre-marital Counseling".to_string(),
                    description: "Preparation for marriage and partnership".to_string(),
                    duration: 50,
                    price: 140.0,
                    currency: "CAD".to_string(),
                }),
            ]),
            served_clientele: vec![1, 6], // Adults, couples
            availability: vec![2, 3, 4, 5, 6], // Tuesday to Saturday
            meet_type: MeetingType::Both,
            third_party_payers: vec![5, 2], // Great-West Life, Sun Life
            part_of_order: None,
            status: ProfessionalStatus::Pending,
            verification: VerificationInfo {
                is_verified: false,
                verification_date: None,
                verified_by: None,
                verification_documents: vec![],
            },
            license_info: LicenseInfo {
                license_number: "QC-PSY-11223".to_string(),
                license_type: "Marriage and Family Therapy".to_string(),
                issuing_state: "Quebec".to_string(),
                issue_date: "2009-09-20".to_string(),
                expiry_date: "2026-03-15".to_string(),
                is_active: true,
            },
            rating: Rating {
                average_rating: 4.9,
                total_reviews: 52,
                rating_distribution: HashMap::from([
                    (5, 48),
                    (4, 3),
                    (3, 1),
                    (2, 0),
                    (1, 0),
                ]),
            },
            total_clients: 89,
            active_clients: 34,
            total_appointments: 456,
            completed_appointments: 445,
            created_at: now.clone(),
            updated_at: now.clone(),
        }
    ]
}

/// Get single professional by ID
#[tauri::command]
pub async fn get_professional(
    id: String,
    _firebase_state: State<'_, FirebaseServiceState>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Professional>, String> {
    // Find professional from mock data
    let mock_professionals = generate_mock_professionals();
    let professional = mock_professionals
        .into_iter()
        .find(|p| p.object_id == id)
        .ok_or("Professional not found")?;

    // Log the operation (when Firebase is available)
    let firebase_guard = _firebase_state.0.lock().await;
    if let Some(firebase) = firebase_guard.as_ref() {
        let _ = firebase.audit_log(
            "VIEW_PROFESSIONAL",
            "professional",
            "system", // Default user until auth is implemented
            false, // Professional data is generally not PHI
            Some(serde_json::json!({"professional_id": id}))
        ).await;
    }

    Ok(ApiResponse::success(professional))
}

/// Create new professional
#[tauri::command]
pub async fn create_professional(
    request: CreateProfessionalRequest,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Professional>, String> {
    let auth = _auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    // Check permissions
    if !auth.has_permission("create_professional") {
        return Err("Insufficient permissions".to_string());
    }

    let professional_id = Uuid::new_v4().to_string();
    let professional = Professional::from_request(request, professional_id.clone());

    let firebase = firebase.lock().await;

    // Create professional in Firestore
    firebase.create_document("professionals", &professional_id, &professional)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "CREATE_PROFESSIONAL",
        "professional",
        auth.user_id.as_ref().unwrap(),
        false, // Professional creation doesn't involve PHI
        Some(serde_json::json!({
            "professional_id": professional_id,
            "professional_name": professional.display_name(),
            "business_name": professional.business_name
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        professional,
        "Professional created successfully".to_string()
    ))
}

/// Update existing professional
#[tauri::command]
pub async fn update_professional(
    id: String,
    request: UpdateProfessionalRequest,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Professional>, String> {
    let auth = _auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("update_professional") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get existing professional
    let mut professional: Professional = firebase.get_document("professionals", &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Professional not found")?;

    // Update professional data
    professional.update_from_request(request);

    // Save to Firestore
    let updated_professional: Professional = firebase.update_document("professionals", &id, &professional)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "UPDATE_PROFESSIONAL",
        "professional",
        auth.user_id.as_ref().unwrap(),
        false, // Professional updates generally don't involve PHI
        Some(serde_json::json!({
            "professional_id": id,
            "professional_name": professional.display_name(),
            "business_name": professional.business_name
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        updated_professional,
        "Professional updated successfully".to_string()
    ))
}

/// Delete professional
#[tauri::command]
pub async fn delete_professional(
    id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<()>, String> {
    let auth = _auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("delete_professional") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get professional for audit log before deletion
    let professional: Option<Professional> = firebase.get_document("professionals", &id)
        .await
        .map_err(|e| e.to_string())?;

    if professional.is_none() {
        return Err("Professional not found".to_string());
    }

    let prof = professional.unwrap();
    let professional_name = prof.display_name();

    // Delete from Firestore
    firebase.delete_document("professionals", &id)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "DELETE_PROFESSIONAL",
        "professional",
        auth.user_id.as_ref().unwrap(),
        false, // Professional deletion doesn't involve PHI
        Some(serde_json::json!({
            "professional_id": id,
            "professional_name": professional_name,
            "business_name": prof.business_name
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        (),
        "Professional deleted successfully".to_string()
    ))
}

/// Search professionals by query
#[tauri::command]
pub async fn search_professionals(
    query: String,
    limit: Option<u32>,
    _firebase_state: State<'_, FirebaseServiceState>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<Professional>>, String> {
    let limit = limit.unwrap_or(10);

    // Search through mock professionals
    let mock_professionals = generate_mock_professionals();
    let query_lower = query.to_lowercase();

    let professionals: Vec<Professional> = mock_professionals
        .into_iter()
        .filter(|p| {
            p.profile.first_name.to_lowercase().contains(&query_lower) ||
            p.profile.last_name.to_lowercase().contains(&query_lower) ||
            p.business_name.to_lowercase().contains(&query_lower) ||
            p.buss_email.to_lowercase().contains(&query_lower)
        })
        .take(limit as usize)
        .collect();

    // Log the operation (when Firebase is available)
    let firebase_guard = _firebase_state.0.lock().await;
    if let Some(firebase) = firebase_guard.as_ref() {
        let _ = firebase.audit_log(
            "SEARCH_PROFESSIONALS",
            "professionals",
            "system", // Default user until auth is implemented
            false, // No PHI accessed in professional search
            Some(serde_json::json!({"query": query, "limit": limit}))
        ).await;
    }

    Ok(ApiResponse::success(professionals))
}

/// Get professional's clients
#[tauri::command]
pub async fn get_professional_clients(
    professional_id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<crate::models::Client>>, String> {
    let auth = _auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    // TODO: Implement query to get clients for specific professional
    let clients = Vec::new(); // Placeholder

    // Audit log
    firebase.audit_log(
        "VIEW_PROFESSIONAL_CLIENTS",
        "clients",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed when viewing client list
        Some(serde_json::json!({"professional_id": professional_id}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(clients))
}

/// Get professional's appointments
#[tauri::command]
pub async fn get_professional_appointments(
    professional_id: String,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Vec<crate::models::Appointment>>, String> {
    let auth = _auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    let firebase = firebase.lock().await;

    // TODO: Implement query to get appointments for specific professional
    let appointments = Vec::new(); // Placeholder

    // Audit log
    firebase.audit_log(
        "VIEW_PROFESSIONAL_APPOINTMENTS",
        "appointments",
        auth.user_id.as_ref().unwrap(),
        true, // PHI accessed when viewing appointments
        Some(serde_json::json!({"professional_id": professional_id}))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(appointments))
}

/// Get professional statistics
#[tauri::command]
pub async fn get_professional_stats(
    _firebase_state: State<'_, FirebaseServiceState>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<ProfessionalStats>, String> {
    // Calculate stats from mock data
    let mock_professionals = generate_mock_professionals();
    let total = mock_professionals.len() as u32;
    let active = mock_professionals.iter().filter(|p| p.status == ProfessionalStatus::Active).count() as u32;

    let average_rating = if !mock_professionals.is_empty() {
        mock_professionals
            .iter()
            .map(|p| p.rating.average_rating)
            .sum::<f64>() / total as f64
    } else {
        0.0
    };

    let license_expiring_soon = mock_professionals
        .iter()
        .map(|p| &p.license_info)
        .filter(|l| !l.is_active || l.expiry_date.contains("2024"))
        .count() as u32;

    let stats = ProfessionalStats {
        total,
        active,
        average_rating,
        license_expiring_soon,
    };

    // Log the operation (when Firebase is available)
    let firebase_guard = _firebase_state.0.lock().await;
    if let Some(firebase) = firebase_guard.as_ref() {
        let _ = firebase.audit_log(
            "VIEW_PROFESSIONAL_STATS",
            "statistics",
            "system", // Default user until auth is implemented
            false, // No specific PHI accessed
            None
        ).await;
    }

    Ok(ApiResponse::success(stats))
}

/// Check if professional is active using the Professional.is_active() method
#[tauri::command]
pub async fn check_professional_active_status(
    professional_id: String,
    _firebase_state: State<'_, FirebaseServiceState>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<bool, String> {
    // Find professional from mock data
    let mock_professionals = generate_mock_professionals();
    let professional = mock_professionals
        .into_iter()
        .find(|p| p.object_id == professional_id)
        .ok_or("Professional not found")?;

    // Use the Professional.is_active() method
    let is_active = professional.is_active();

    // Log the operation (when Firebase is available)
    let firebase_guard = _firebase_state.0.lock().await;
    if let Some(firebase) = firebase_guard.as_ref() {
        let _ = firebase.audit_log(
            "CHECK_PROFESSIONAL_STATUS",
            "professional",
            "system", // Default user until auth is implemented
            false, // Professional status check is not PHI
            Some(serde_json::json!({"professional_id": professional_id, "is_active": is_active}))
        ).await;
    }

    Ok(is_active)
}

/// Get professional display name using the Professional.display_name() method
#[tauri::command]
pub async fn get_professional_display_name(
    professional_id: String,
    _firebase_state: State<'_, FirebaseServiceState>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<String, String> {
    // Find professional from mock data
    let mock_professionals = generate_mock_professionals();
    let professional = mock_professionals
        .into_iter()
        .find(|p| p.object_id == professional_id)
        .ok_or("Professional not found")?;

    // Use the Professional.display_name() method
    let display_name = professional.display_name();

    // Log the operation (when Firebase is available)
    let firebase_guard = _firebase_state.0.lock().await;
    if let Some(firebase) = firebase_guard.as_ref() {
        let _ = firebase.audit_log(
            "GET_PROFESSIONAL_DISPLAY_NAME",
            "professional",
            "system", // Default user until auth is implemented
            false, // Professional display name is not PHI
            Some(serde_json::json!({"professional_id": professional_id}))
        ).await;
    }

    Ok(display_name)
}

/// Update professional verification status
#[tauri::command]
pub async fn update_professional_verification(
    professional_id: String,
    verified: bool,
    verification_notes: Option<String>,
    firebase: State<'_, Arc<tokio::sync::Mutex<FirebaseService>>>,
    _auth_state: State<'_, Arc<RwLock<AuthState>>>,
) -> Result<ApiResponse<Professional>, String> {
    let auth = _auth_state.read().await;
    if !auth.is_authenticated {
        return Err("Unauthorized".to_string());
    }

    if !auth.has_permission("verify_professional") {
        return Err("Insufficient permissions".to_string());
    }

    let firebase = firebase.lock().await;

    // Get existing professional
    let mut professional: Professional = firebase.get_document("professionals", &professional_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Professional not found")?;

    // Update verification status
    professional.update_verification_status(verified, verification_notes);

    // Save to Firestore
    let updated_professional: Professional = firebase.update_document("professionals", &professional_id, &professional)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    firebase.audit_log(
        "UPDATE_PROFESSIONAL_VERIFICATION",
        "professional_verification",
        auth.user_id.as_ref().unwrap(),
        false, // Verification status is not PHI
        Some(serde_json::json!({
            "professional_id": professional_id,
            "verified": verified,
            "professional_name": professional.display_name()
        }))
    ).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success_with_message(
        updated_professional,
        if verified { "Professional verified successfully" } else { "Professional verification removed" }.to_string()
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{AddressObject, ProfessionalServices, Expertise};

    #[tokio::test]
    async fn test_create_professional_request_validation() {
        let request = CreateProfessionalRequest {
            user_id: "user123".to_string(),
            first_name: "Dr. Sarah".to_string(),
            last_name: "Johnson".to_string(),
            business_name: "Johnson Psychology Clinic".to_string(),
            email: "sarah@example.com".to_string(),
            phone: "1234567890".to_string(),
            address: AddressObject {
                street: "123 Main St".to_string(),
                city: "Anytown".to_string(),
                state: "CA".to_string(),
                zip_code: "12345".to_string(),
                country: "USA".to_string(),
            },
            services: ProfessionalServices {
                therapy_types: vec!["Cognitive Behavioral Therapy".to_string()],
                age_groups: vec!["Adults".to_string()],
                specializations: vec!["Anxiety".to_string(), "Depression".to_string()],
            },
            expertise: Expertise {
                years_of_experience: 10,
                education: vec!["PhD in Clinical Psychology".to_string()],
                certifications: vec!["Licensed Clinical Psychologist".to_string()],
                languages_spoken: vec![1, 2], // English, Spanish
            },
            license_number: Some("PSY123456".to_string()),
            license_state: Some("CA".to_string()),
            license_expiry: Some("2025-12-31".to_string()),
        };

        // Validate request fields
        assert_eq!(request.first_name, "Dr. Sarah");
        assert_eq!(request.last_name, "Johnson");
        assert_eq!(request.business_name, "Johnson Psychology Clinic");
        assert!(request.license_number.is_some());
        assert_eq!(request.expertise.years_of_experience, 10);
    }
}