use serde::{Deserialize, Serialize};
use firestore::FirestoreTimestamp;
use std::collections::HashMap;

use super::common::{UserProfile, AddressObject, GeoPoint, PhoneNumber, ExpertiseObject, ServiceObject, OrderInfo, firestore_now};

/// Professional structure based on mobile Firebase structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Professional {
    pub object_id: String,
    pub user_id: String,

    #[serde(flatten)]
    pub profile: UserProfile,

    // Location & Contact
    pub address_obj: AddressObject,
    pub geo_pt: Option<GeoPoint>,
    pub phone_nb: PhoneNumber,
    pub buss_email: String,
    pub business_name: String,

    // Professional Details
    pub prof_type: i32,
    pub edu_institute: i32,
    pub mother_tongue: i32,
    pub offered_lang_arr: Vec<i32>,

    // Services & Expertise
    pub expertises: Vec<ExpertiseObject>,
    pub serv_offered_arr: Vec<i32>,
    pub serv_offered_obj: HashMap<i32, ServiceObject>,
    pub served_clientele: Vec<i32>,

    // Business Operations
    pub availability: Vec<i32>,
    pub meet_type: MeetingType, // 0=both, 1=in-person, 2=online
    pub third_party_payers: Vec<i32>,
    pub part_of_order: Option<OrderInfo>,

    // Professional status and verification
    pub status: ProfessionalStatus,
    pub verification: VerificationInfo,
    pub license_info: LicenseInfo,
    pub rating: Rating,

    // Statistics
    pub total_clients: i32,
    pub active_clients: i32,
    pub total_appointments: i32,
    pub completed_appointments: i32,

    pub created_at: FirestoreTimestamp,
    pub updated_at: FirestoreTimestamp,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum MeetingType {
    Both = 0,
    InPerson = 1,
    Online = 2,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ProfessionalStatus {
    Active,
    Pending,
    Suspended,
    Inactive,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VerificationInfo {
    pub is_verified: bool,
    pub verification_date: Option<FirestoreTimestamp>,
    pub verified_by: Option<String>,
    pub verification_documents: Vec<Document>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    pub document_type: String,
    pub file_url: String,
    pub uploaded_at: FirestoreTimestamp,
    pub is_verified: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LicenseInfo {
    pub license_number: String,
    pub license_type: String,
    pub issuing_state: String,
    pub issue_date: String,
    pub expiry_date: String,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Rating {
    pub average_rating: f64,
    pub total_reviews: i32,
    pub rating_distribution: HashMap<i32, i32>, // rating -> count
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CreateProfessionalRequest {
    pub user_id: String,
    pub first_name: String,
    pub last_name: String,
    pub business_name: String,
    pub buss_email: String,
    pub phone: PhoneNumber,
    pub address: AddressObject,
    pub prof_type: i32,
    pub license_info: LicenseInfo,
    pub expertises: Vec<ExpertiseObject>,
    pub services: HashMap<i32, ServiceObject>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProfessionalRequest {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub business_name: Option<String>,
    pub buss_email: Option<String>,
    pub phone: Option<PhoneNumber>,
    pub address: Option<AddressObject>,
    pub prof_type: Option<i32>,
    pub license_info: Option<LicenseInfo>,
    pub expertises: Option<Vec<ExpertiseObject>>,
    pub services: Option<HashMap<i32, ServiceObject>>,
    pub availability: Option<Vec<i32>>,
    pub meet_type: Option<MeetingType>,
    pub third_party_payers: Option<Vec<i32>>,
    pub served_clientele: Option<Vec<i32>>,
    pub status: Option<ProfessionalStatus>,
    pub bio: Option<String>,
}

// ProfessionalStats moved to common.rs to avoid ambiguous imports

impl Professional {
    pub fn from_request(request: CreateProfessionalRequest, object_id: String) -> Self {
        let now = firestore_now();

        Self {
            object_id,
            user_id: request.user_id,
            profile: UserProfile {
                first_name: request.first_name,
                last_name: request.last_name,
                date_of_birth: None,
                gender: None,
                profile_picture: None,
                bio: None,
                created_at: now.clone(),
                updated_at: now.clone(),
                is_active: true,
            },
            address_obj: request.address,
            geo_pt: None,
            phone_nb: request.phone,
            buss_email: request.buss_email,
            business_name: request.business_name,
            prof_type: request.prof_type,
            edu_institute: 0,
            mother_tongue: 1, // Default to English
            offered_lang_arr: vec![1],
            expertises: request.expertises,
            serv_offered_arr: request.services.keys().cloned().collect(),
            serv_offered_obj: request.services,
            served_clientele: Vec::new(),
            availability: Vec::new(),
            meet_type: MeetingType::Both,
            third_party_payers: Vec::new(),
            part_of_order: None,
            status: ProfessionalStatus::Pending,
            verification: VerificationInfo {
                is_verified: false,
                verification_date: None,
                verified_by: None,
                verification_documents: Vec::new(),
            },
            license_info: request.license_info,
            rating: Rating {
                average_rating: 0.0,
                total_reviews: 0,
                rating_distribution: HashMap::new(),
            },
            total_clients: 0,
            active_clients: 0,
            total_appointments: 0,
            completed_appointments: 0,
            created_at: now.clone(),
            updated_at: now.clone(),
        }
    }

    pub fn display_name(&self) -> String {
        format!("{} {}", self.profile.first_name, self.profile.last_name)
    }

    pub fn is_active(&self) -> bool {
        self.status == ProfessionalStatus::Active && self.profile.is_active
    }

    pub fn update_from_request(&mut self, request: UpdateProfessionalRequest) {
        if let Some(first_name) = request.first_name {
            self.profile.first_name = first_name;
        }
        if let Some(last_name) = request.last_name {
            self.profile.last_name = last_name;
        }
        if let Some(business_name) = request.business_name {
            self.business_name = business_name;
        }
        if let Some(buss_email) = request.buss_email {
            self.buss_email = buss_email;
        }
        if let Some(phone) = request.phone {
            self.phone_nb = phone;
        }
        if let Some(address) = request.address {
            self.address_obj = address;
        }
        if let Some(prof_type) = request.prof_type {
            self.prof_type = prof_type;
        }
        if let Some(license_info) = request.license_info {
            self.license_info = license_info;
        }
        if let Some(expertises) = request.expertises {
            self.expertises = expertises;
        }
        if let Some(services) = request.services {
            self.serv_offered_arr = services.keys().cloned().collect();
            self.serv_offered_obj = services;
        }
        if let Some(availability) = request.availability {
            self.availability = availability;
        }
        if let Some(meet_type) = request.meet_type {
            self.meet_type = meet_type;
        }
        if let Some(third_party_payers) = request.third_party_payers {
            self.third_party_payers = third_party_payers;
        }
        if let Some(served_clientele) = request.served_clientele {
            self.served_clientele = served_clientele;
        }
        if let Some(status) = request.status {
            self.status = status;
        }
        if let Some(bio) = request.bio {
            self.profile.bio = Some(bio);
        }
        self.updated_at = firestore_now();
    }

    pub fn update_verification_status(&mut self, verified: bool, _verification_notes: Option<String>) {
        self.verification.is_verified = verified;
        if verified {
            self.verification.verification_date = Some(firestore_now());
        }
        // In a real implementation, verification_notes would be stored in a separate audit log
        self.updated_at = firestore_now();
    }
}