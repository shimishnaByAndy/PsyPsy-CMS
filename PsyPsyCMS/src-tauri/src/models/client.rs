use serde::{Deserialize, Serialize};
use firestore::FirestoreTimestamp;

use super::common::{UserProfile, AddressObject, GeoPoint, firestore_now};

/// Client structure based on mobile Firebase structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Client {
    // Base identification
    pub object_id: String,
    pub user_id: String, // Reference to Firebase Auth user

    // Personal profile information
    #[serde(flatten)]
    pub profile: UserProfile,

    // Location information
    pub address_obj: AddressObject,
    pub geo_pt: Option<GeoPoint>,
    pub search_radius: i32, // in kilometers

    // Language preferences
    pub spoken_lang_arr: Vec<i32>, // Array of language IDs

    // Client-specific status and metadata
    pub status: ClientStatus,
    pub assigned_professionals: Vec<String>, // Professional IDs
    pub total_appointments: i32,
    pub completed_appointments: i32,
    pub cancelled_appointments: i32,

    // Medical information (encrypted)
    pub medical_info: Option<MedicalInfo>,

    // Emergency contacts
    pub emergency_contacts: Vec<EmergencyContact>,

    // Preferences
    pub preferences: ClientPreferences,

    // Timestamps
    pub created_at: FirestoreTimestamp,
    pub updated_at: FirestoreTimestamp,
}

/// Client status enumeration
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ClientStatus {
    Active,
    Inactive,
    Suspended,
    Pending,
}

/// Medical information (PHI - must be encrypted)
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MedicalInfo {
    // Encrypted fields
    pub conditions: Vec<String>,
    pub medications: Vec<Medication>,
    pub allergies: Vec<String>,
    pub insurance_info: Option<InsuranceInfo>,
    pub medical_history: Option<String>,
    pub physician_contact: Option<PhysicianContact>,
}

/// Medication information
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Medication {
    pub name: String,
    pub dosage: String,
    pub frequency: String,
    pub prescribed_by: String,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub is_active: bool,
}

/// Insurance information
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct InsuranceInfo {
    pub provider: String,
    pub policy_number: String,
    pub group_number: Option<String>,
    pub effective_date: String,
    pub expiry_date: Option<String>,
    pub copay: Option<f64>,
    pub deductible: Option<f64>,
}

/// Physician contact information
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PhysicianContact {
    pub name: String,
    pub specialty: String,
    pub phone: String,
    pub email: Option<String>,
    pub address: Option<AddressObject>,
}

/// Emergency contact
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EmergencyContact {
    pub name: String,
    pub relationship: String,
    pub phone: String,
    pub email: Option<String>,
    pub address: Option<AddressObject>,
    pub is_primary: bool,
}

/// Client preferences
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ClientPreferences {
    pub preferred_contact_method: ContactMethod,
    pub appointment_reminders: bool,
    pub newsletter_subscription: bool,
    pub data_sharing_consent: bool,
    pub preferred_appointment_times: Vec<String>, // e.g., ["morning", "afternoon"]
    pub communication_preferences: CommunicationPreferences,
}

/// Contact method preference
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ContactMethod {
    Email,
    Phone,
    Sms,
    App,
}

/// Communication preferences
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CommunicationPreferences {
    pub language: String,
    pub accessibility_needs: Vec<String>,
    pub preferred_pronouns: Option<String>,
    pub cultural_considerations: Option<String>,
}

/// Client creation request
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CreateClientRequest {
    pub user_id: String,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: String,
    pub date_of_birth: Option<String>,
    pub address: AddressObject,
    pub spoken_languages: Vec<i32>,
    pub search_radius: Option<i32>,
    pub preferences: Option<ClientPreferences>,
    pub emergency_contacts: Option<Vec<EmergencyContact>>,
}

/// Client update request
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UpdateClientRequest {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub address: Option<AddressObject>,
    pub search_radius: Option<i32>,
    pub spoken_languages: Option<Vec<i32>>,
    pub preferences: Option<ClientPreferences>,
    pub emergency_contacts: Option<Vec<EmergencyContact>>,
    pub medical_info: Option<MedicalInfo>,
}

impl Default for ClientPreferences {
    fn default() -> Self {
        Self {
            preferred_contact_method: ContactMethod::Email,
            appointment_reminders: true,
            newsletter_subscription: false,
            data_sharing_consent: false,
            preferred_appointment_times: vec!["morning".to_string()],
            communication_preferences: CommunicationPreferences::default(),
        }
    }
}

impl Default for CommunicationPreferences {
    fn default() -> Self {
        Self {
            language: "en".to_string(),
            accessibility_needs: Vec::new(),
            preferred_pronouns: None,
            cultural_considerations: None,
        }
    }
}

impl Client {
    /// Create a new client from request
    pub fn from_request(request: CreateClientRequest, object_id: String) -> Self {
        let now = firestore_now();

        Self {
            object_id,
            user_id: request.user_id,
            profile: UserProfile {
                first_name: request.first_name,
                last_name: request.last_name,
                date_of_birth: request.date_of_birth,
                gender: None,
                profile_picture: None,
                bio: None,
                created_at: now.clone(),
                updated_at: now.clone(),
                is_active: true,
            },
            address_obj: request.address,
            geo_pt: None, // Will be geocoded separately
            search_radius: request.search_radius.unwrap_or(25), // Default 25km
            spoken_lang_arr: request.spoken_languages,
            status: ClientStatus::Active,
            assigned_professionals: Vec::new(),
            total_appointments: 0,
            completed_appointments: 0,
            cancelled_appointments: 0,
            medical_info: None,
            emergency_contacts: request.emergency_contacts.unwrap_or_default(),
            preferences: request.preferences.unwrap_or_default(),
            created_at: now.clone(),
            updated_at: now.clone(),
        }
    }

    /// Update client with request data
    pub fn update_from_request(&mut self, request: UpdateClientRequest) {
        if let Some(first_name) = request.first_name {
            self.profile.first_name = first_name;
        }
        if let Some(last_name) = request.last_name {
            self.profile.last_name = last_name;
        }
        if let Some(address) = request.address {
            self.address_obj = address;
        }
        if let Some(search_radius) = request.search_radius {
            self.search_radius = search_radius;
        }
        if let Some(spoken_languages) = request.spoken_languages {
            self.spoken_lang_arr = spoken_languages;
        }
        if let Some(preferences) = request.preferences {
            self.preferences = preferences;
        }
        if let Some(emergency_contacts) = request.emergency_contacts {
            self.emergency_contacts = emergency_contacts;
        }
        if let Some(medical_info) = request.medical_info {
            self.medical_info = Some(medical_info);
        }

        self.updated_at = firestore_now();
        self.profile.updated_at = crate::models::common::firestore_now();
    }

    /// Get display name
    pub fn display_name(&self) -> String {
        format!("{} {}", self.profile.first_name, self.profile.last_name)
    }

    /// Check if client is active
    pub fn is_active(&self) -> bool {
        self.status == ClientStatus::Active && self.profile.is_active
    }

    /// Assign professional to client
    pub fn assign_professional(&mut self, professional_id: String) {
        if !self.assigned_professionals.contains(&professional_id) {
            self.assigned_professionals.push(professional_id);
            self.updated_at = firestore_now();
        }
    }

    /// Remove professional assignment
    pub fn unassign_professional(&mut self, professional_id: &str) {
        self.assigned_professionals.retain(|id| id != professional_id);
        self.updated_at = firestore_now();
    }

    /// Increment appointment counter
    pub fn increment_appointments(&mut self, appointment_type: AppointmentType) {
        match appointment_type {
            AppointmentType::Total => self.total_appointments += 1,
            AppointmentType::Completed => self.completed_appointments += 1,
            AppointmentType::Cancelled => self.cancelled_appointments += 1,
        }
        self.updated_at = firestore_now();
    }
}

/// Appointment type for tracking
pub enum AppointmentType {
    Total,
    Completed,
    Cancelled,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_client_creation() {
        let request = CreateClientRequest {
            user_id: "user123".to_string(),
            first_name: "John".to_string(),
            last_name: "Doe".to_string(),
            email: "john@example.com".to_string(),
            phone: "1234567890".to_string(),
            date_of_birth: Some("1990-01-01".to_string()),
            address: AddressObject {
                street: "123 Main St".to_string(),
                city: "Anytown".to_string(),
                state: "CA".to_string(),
                zip_code: "12345".to_string(),
                country: "USA".to_string(),
            },
            spoken_languages: vec![1, 2], // English, Spanish
            search_radius: Some(30),
            preferences: None,
            emergency_contacts: None,
        };

        let client = Client::from_request(request, "client123".to_string());

        assert_eq!(client.object_id, "client123");
        assert_eq!(client.display_name(), "John Doe");
        assert_eq!(client.search_radius, 30);
        assert!(client.is_active());
    }

    #[test]
    fn test_professional_assignment() {
        let mut client = Client::from_request(
            CreateClientRequest {
                user_id: "user123".to_string(),
                first_name: "John".to_string(),
                last_name: "Doe".to_string(),
                email: "john@example.com".to_string(),
                phone: "1234567890".to_string(),
                date_of_birth: None,
                address: AddressObject {
                    street: "123 Main St".to_string(),
                    city: "Anytown".to_string(),
                    state: "CA".to_string(),
                    zip_code: "12345".to_string(),
                    country: "USA".to_string(),
                },
                spoken_languages: vec![1],
                search_radius: None,
                preferences: None,
                emergency_contacts: None,
            },
            "client123".to_string(),
        );

        assert_eq!(client.assigned_professionals.len(), 0);

        client.assign_professional("prof123".to_string());
        assert_eq!(client.assigned_professionals.len(), 1);
        assert!(client.assigned_professionals.contains(&"prof123".to_string()));

        client.unassign_professional("prof123");
        assert_eq!(client.assigned_professionals.len(), 0);
    }
}