use serde::{Deserialize, Serialize};
use firestore::FirestoreTimestamp;
use crate::models::common::firestore_now;

/// Appointment structure based on mobile Firebase structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Appointment {
    pub object_id: String,
    pub created_at: FirestoreTimestamp,
    pub updated_at: FirestoreTimestamp,

    // Client reference
    pub client_ptr: String, // Client ID

    // Requirements
    pub prof_types_arr: Vec<i32>,
    pub service_type: i32,
    pub subcategs_ind_arr: Vec<i32>,

    // Preferences
    pub gender_pref: GenderPreference, // 0=none, 1=male, 2=female
    pub lang_pref: i32,
    pub meet_pref: MeetingPreference,

    // Scheduling
    pub avail_arr: Vec<i32>,
    pub preferred_date_time: Option<String>,
    pub session_duration: Option<i32>,

    // Assignment and status
    pub assigned_professional: Option<String>,
    pub status: AppointmentStatus,
    pub estimated_cost: Option<f64>,

    // Session details (when confirmed)
    pub confirmed_date_time: Option<FirestoreTimestamp>,
    pub actual_duration: Option<i32>,
    pub session_notes: Option<String>,
    pub professional_notes: Option<String>,

    // Payment information
    pub payment_info: Option<PaymentInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum GenderPreference {
    None = 0,
    Male = 1,
    Female = 2,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum MeetingPreference {
    InPerson,
    Online,
    Both,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AppointmentStatus {
    Pending,
    Confirmed,
    InProgress,
    Completed,
    Cancelled,
    NoShow,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PaymentInfo {
    pub amount: f64,
    pub currency: String,
    pub payment_method: String,
    pub payment_status: PaymentStatus,
    pub transaction_id: Option<String>,
    pub payment_date: Option<FirestoreTimestamp>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum PaymentStatus {
    Pending,
    Completed,
    Failed,
    Refunded,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CreateAppointmentRequest {
    pub client_id: String,
    pub prof_types: Vec<i32>,
    pub service_type: i32,
    pub subcategories: Vec<i32>,
    pub gender_preference: GenderPreference,
    pub language_preference: i32,
    pub meeting_preference: MeetingPreference,
    pub availability: Vec<i32>,
    pub preferred_date_time: Option<String>,
    pub session_duration: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAppointmentRequest {
    pub prof_types: Option<Vec<i32>>,
    pub service_type: Option<i32>,
    pub subcategories: Option<Vec<i32>>,
    pub gender_preference: Option<GenderPreference>,
    pub language_preference: Option<i32>,
    pub meeting_preference: Option<MeetingPreference>,
    pub availability: Option<Vec<i32>>,
    pub preferred_date_time: Option<String>,
    pub session_duration: Option<i32>,
    pub assigned_professional: Option<String>,
    pub status: Option<AppointmentStatus>,
    pub estimated_cost: Option<f64>,
    pub confirmed_date_time: Option<FirestoreTimestamp>,
    pub session_notes: Option<String>,
    pub professional_notes: Option<String>,
    pub payment_info: Option<PaymentInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ReminderSettings {
    pub enabled: bool,
    pub reminder_times: Vec<ReminderTime>, // e.g., 24h, 1h, 15min before
    pub notification_methods: Vec<NotificationMethod>,
    pub custom_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ReminderTime {
    OneWeekBefore,
    OneDayBefore,
    OneHourBefore,
    FifteenMinutesBefore,
    CustomMinutes(i32),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum NotificationMethod {
    Email,
    Sms,
    PushNotification,
    InApp,
}

// AppointmentStats moved to common.rs to avoid ambiguous imports

impl Appointment {
    pub fn from_request(request: CreateAppointmentRequest, object_id: String) -> Self {
        let now = firestore_now();

        Self {
            object_id,
            created_at: now.clone(),
            updated_at: now,
            client_ptr: request.client_id,
            prof_types_arr: request.prof_types,
            service_type: request.service_type,
            subcategs_ind_arr: request.subcategories,
            gender_pref: request.gender_preference,
            lang_pref: request.language_preference,
            meet_pref: request.meeting_preference,
            avail_arr: request.availability,
            preferred_date_time: request.preferred_date_time,
            session_duration: request.session_duration,
            assigned_professional: None,
            status: AppointmentStatus::Pending,
            estimated_cost: None,
            confirmed_date_time: None,
            actual_duration: None,
            session_notes: None,
            professional_notes: None,
            payment_info: None,
        }
    }

    pub fn assign_professional(&mut self, professional_id: String, estimated_cost: f64) {
        self.assigned_professional = Some(professional_id);
        self.estimated_cost = Some(estimated_cost);
        self.status = AppointmentStatus::Confirmed;
        self.updated_at = firestore_now();
    }

    pub fn start_session(&mut self) {
        self.status = AppointmentStatus::InProgress;
        self.confirmed_date_time = Some(crate::models::common::firestore_now());
        self.updated_at = firestore_now();
    }

    pub fn complete_session(&mut self, duration: i32, notes: Option<String>) {
        self.status = AppointmentStatus::Completed;
        self.actual_duration = Some(duration);
        if let Some(notes) = notes {
            self.session_notes = Some(notes);
        }
        self.updated_at = firestore_now();
    }

    pub fn cancel(&mut self, reason: Option<String>) {
        self.status = AppointmentStatus::Cancelled;
        if let Some(reason) = reason {
            self.professional_notes = Some(format!("Cancelled: {}", reason));
        }
        self.updated_at = firestore_now();
    }

    pub fn update_from_request(&mut self, request: UpdateAppointmentRequest) {
        if let Some(prof_types) = request.prof_types {
            self.prof_types_arr = prof_types;
        }
        if let Some(service_type) = request.service_type {
            self.service_type = service_type;
        }
        if let Some(subcategories) = request.subcategories {
            self.subcategs_ind_arr = subcategories;
        }
        if let Some(gender_preference) = request.gender_preference {
            self.gender_pref = gender_preference;
        }
        if let Some(language_preference) = request.language_preference {
            self.lang_pref = language_preference;
        }
        if let Some(meeting_preference) = request.meeting_preference {
            self.meet_pref = meeting_preference;
        }
        if let Some(availability) = request.availability {
            self.avail_arr = availability;
        }
        if let Some(preferred_date_time) = request.preferred_date_time {
            self.preferred_date_time = Some(preferred_date_time);
        }
        if let Some(session_duration) = request.session_duration {
            self.session_duration = Some(session_duration);
        }
        if let Some(assigned_professional) = request.assigned_professional {
            self.assigned_professional = Some(assigned_professional);
        }
        if let Some(status) = request.status {
            self.status = status;
        }
        if let Some(estimated_cost) = request.estimated_cost {
            self.estimated_cost = Some(estimated_cost);
        }
        if let Some(confirmed_date_time) = request.confirmed_date_time {
            self.confirmed_date_time = Some(confirmed_date_time);
        }
        if let Some(session_notes) = request.session_notes {
            self.session_notes = Some(session_notes);
        }
        if let Some(professional_notes) = request.professional_notes {
            self.professional_notes = Some(professional_notes);
        }
        if let Some(payment_info) = request.payment_info {
            self.payment_info = Some(payment_info);
        }
        self.updated_at = firestore_now();
    }

    pub fn reschedule(&mut self, new_date_time: FirestoreTimestamp, reason: Option<String>) {
        self.confirmed_date_time = Some(new_date_time);
        if let Some(reason) = reason {
            let current_notes = self.professional_notes.as_deref().unwrap_or("");
            self.professional_notes = Some(format!("{}\nRescheduled: {}", current_notes, reason).trim().to_string());
        }
        self.updated_at = firestore_now();
    }
}