// Test fixtures for healthcare data models
use chrono::{DateTime, Utc, TimeZone};
use serde_json::{json, Value};
use uuid::Uuid;

// Client test fixtures
pub struct ClientFixtures;

impl ClientFixtures {
    pub fn valid_client() -> Value {
        json!({
            "id": "client_12345",
            "email": "john.doe@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+1234567890",
            "date_of_birth": "1990-01-15",
            "status": "active",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "emergency_contact": {
                "name": "Jane Doe",
                "phone": "+1234567891",
                "relationship": "spouse"
            },
            "insurance": {
                "provider": "Blue Cross",
                "policy_number": "encrypted_policy_123",
                "group_number": "GRP001"
            }
        })
    }
    
    pub fn minimal_client() -> Value {
        json!({
            "email": "minimal@example.com",
            "first_name": "Min",
            "last_name": "User"
        })
    }
    
    pub fn invalid_client_missing_email() -> Value {
        json!({
            "first_name": "Invalid",
            "last_name": "User"
        })
    }
    
    pub fn invalid_client_bad_email() -> Value {
        json!({
            "email": "invalid-email",
            "first_name": "Bad",
            "last_name": "Email"
        })
    }
    
    pub fn client_with_hipaa_violations() -> Value {
        json!({
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "ssn": "123-45-6789", // HIPAA violation - plain text SSN
            "medical_history": "Depression diagnosed in 2020" // HIPAA violation - unencrypted
        })
    }
    
    pub fn multiple_clients(count: usize) -> Vec<Value> {
        (0..count).map(|i| {
            json!({
                "id": format!("client_{}", i),
                "email": format!("user{}@example.com", i),
                "first_name": format!("User{}", i),
                "last_name": "Test",
                "phone": format!("+123456789{}", i % 10),
                "status": if i % 3 == 0 { "inactive" } else { "active" },
                "created_at": format!("2024-01-{:02}T00:00:00Z", (i % 28) + 1)
            })
        }).collect()
    }
}

// Professional test fixtures
pub struct ProfessionalFixtures;

impl ProfessionalFixtures {
    pub fn valid_professional() -> Value {
        json!({
            "id": "prof_12345",
            "email": "dr.smith@psypsy.com",
            "first_name": "Dr. Sarah",
            "last_name": "Smith",
            "phone": "+1987654321",
            "specialization": "Clinical Psychology",
            "license_number": "PSY123456",
            "license_state": "CA",
            "license_expiry": "2025-12-31",
            "status": "active",
            "created_at": "2024-01-01T00:00:00Z",
            "working_hours": {
                "monday": [{"start": "09:00", "end": "17:00"}],
                "tuesday": [{"start": "09:00", "end": "17:00"}],
                "wednesday": [{"start": "09:00", "end": "17:00"}],
                "thursday": [{"start": "09:00", "end": "17:00"}],
                "friday": [{"start": "09:00", "end": "15:00"}]
            },
            "rates": {
                "consultation": 150.00,
                "therapy_session": 120.00,
                "group_session": 80.00
            }
        })
    }
    
    pub fn professional_with_weekend_hours() -> Value {
        json!({
            "id": "prof_weekend",
            "email": "weekend.doc@psypsy.com",
            "first_name": "Dr. Weekend",
            "last_name": "Worker",
            "specialization": "Emergency Psychology",
            "working_hours": {
                "saturday": [{"start": "10:00", "end": "14:00"}],
                "sunday": [{"start": "10:00", "end": "14:00"}]
            }
        })
    }
    
    pub fn expired_license_professional() -> Value {
        json!({
            "id": "prof_expired",
            "email": "expired@psypsy.com",
            "first_name": "Dr. Expired",
            "last_name": "License",
            "license_number": "EXP123",
            "license_expiry": "2023-12-31", // Expired
            "status": "inactive"
        })
    }
    
    pub fn multiple_professionals(count: usize) -> Vec<Value> {
        let specializations = vec![
            "Clinical Psychology",
            "Counseling Psychology", 
            "Child Psychology",
            "Forensic Psychology",
            "Health Psychology"
        ];
        
        (0..count).map(|i| {
            json!({
                "id": format!("prof_{}", i),
                "email": format!("doctor{}@psypsy.com", i),
                "first_name": format!("Dr. {}", i),
                "last_name": "Professional",
                "specialization": specializations[i % specializations.len()],
                "license_number": format!("LIC{:06}", i),
                "status": if i % 4 == 0 { "inactive" } else { "active" },
                "rates": {
                    "consultation": 100.0 + (i as f64 * 10.0),
                    "therapy_session": 80.0 + (i as f64 * 5.0)
                }
            })
        }).collect()
    }
}

// Appointment test fixtures
pub struct AppointmentFixtures;

impl AppointmentFixtures {
    pub fn valid_appointment() -> Value {
        json!({
            "id": "appt_12345",
            "client_id": "client_12345",
            "professional_id": "prof_12345",
            "start_time": "2024-06-15T10:00:00Z",
            "end_time": "2024-06-15T11:00:00Z",
            "type": "therapy_session",
            "status": "scheduled",
            "notes": "Initial therapy session",
            "location": "Office Room 101",
            "created_at": "2024-06-01T00:00:00Z",
            "updated_at": "2024-06-01T00:00:00Z"
        })
    }
    
    pub fn past_appointment() -> Value {
        json!({
            "id": "appt_past",
            "client_id": "client_12345",
            "professional_id": "prof_12345",
            "start_time": "2024-01-15T10:00:00Z",
            "end_time": "2024-01-15T11:00:00Z",
            "type": "consultation",
            "status": "completed",
            "notes": "Completed consultation",
            "session_notes": "encrypted_session_notes_here"
        })
    }
    
    pub fn cancelled_appointment() -> Value {
        json!({
            "id": "appt_cancelled",
            "client_id": "client_12345",
            "professional_id": "prof_12345",
            "start_time": "2024-06-20T14:00:00Z",
            "end_time": "2024-06-20T15:00:00Z",
            "type": "therapy_session",
            "status": "cancelled",
            "cancellation_reason": "Client requested",
            "cancelled_at": "2024-06-18T09:00:00Z"
        })
    }
    
    pub fn conflicting_appointments() -> Vec<Value> {
        vec![
            json!({
                "id": "appt_conflict_1",
                "professional_id": "prof_12345",
                "start_time": "2024-06-15T10:00:00Z",
                "end_time": "2024-06-15T11:00:00Z",
                "status": "scheduled"
            }),
            json!({
                "id": "appt_conflict_2",
                "professional_id": "prof_12345", // Same professional
                "start_time": "2024-06-15T10:30:00Z", // Overlapping time
                "end_time": "2024-06-15T11:30:00Z",
                "status": "scheduled"
            })
        ]
    }
    
    pub fn appointment_outside_working_hours() -> Value {
        json!({
            "id": "appt_outside",
            "professional_id": "prof_12345",
            "start_time": "2024-06-15T22:00:00Z", // 10 PM - outside working hours
            "end_time": "2024-06-15T23:00:00Z",
            "status": "scheduled"
        })
    }
    
    pub fn weekly_appointments(professional_id: &str, weeks: usize) -> Vec<Value> {
        let base_time = Utc.with_ymd_and_hms(2024, 6, 10, 10, 0, 0).unwrap(); // Monday 10 AM
        
        (0..weeks).map(|week| {
            let appointment_time = base_time + chrono::Duration::weeks(week as i64);
            json!({
                "id": format!("appt_weekly_{}", week),
                "professional_id": professional_id,
                "client_id": "client_recurring",
                "start_time": appointment_time.to_rfc3339(),
                "end_time": (appointment_time + chrono::Duration::hours(1)).to_rfc3339(),
                "type": "recurring_therapy",
                "status": "scheduled",
                "is_recurring": true,
                "recurrence_pattern": "weekly"
            })
        }).collect()
    }
}

// Dashboard and analytics fixtures
pub struct DashboardFixtures;

impl DashboardFixtures {
    pub fn monthly_stats() -> Value {
        json!({
            "period": "2024-06",
            "total_appointments": 150,
            "completed_appointments": 135,
            "cancelled_appointments": 10,
            "no_show_appointments": 5,
            "new_clients": 12,
            "active_clients": 89,
            "revenue": 18750.00,
            "average_session_duration": 55.5,
            "client_satisfaction_score": 4.7,
            "professional_utilization": 0.82
        })
    }
    
    pub fn appointment_trends() -> Vec<Value> {
        let base_date = Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap();
        
        (0..12).map(|month| {
            let appointments = 100 + (month * 5) + (month % 3 * 10);
            let revenue = appointments as f64 * 125.0;
            
            json!({
                "month": format!("2024-{:02}", month + 1),
                "appointments": appointments,
                "revenue": revenue,
                "new_clients": 8 + (month % 4),
                "average_rating": 4.5 + (month as f64 * 0.02)
            })
        }).collect()
    }
}

// Error and edge case fixtures
pub struct ErrorFixtures;

impl ErrorFixtures {
    pub fn network_error() -> Value {
        json!({
            "error": "NetworkError",
            "message": "Connection timeout",
            "code": "NETWORK_TIMEOUT",
            "retry_after": 5000
        })
    }
    
    pub fn validation_error() -> Value {
        json!({
            "error": "ValidationError",
            "message": "Invalid input data",
            "code": "VALIDATION_FAILED",
            "details": {
                "email": ["Invalid email format"],
                "phone": ["Phone number too short"]
            }
        })
    }
    
    pub fn authentication_error() -> Value {
        json!({
            "error": "AuthenticationError", 
            "message": "Invalid credentials",
            "code": "AUTH_FAILED",
            "expires_at": "2024-06-15T10:00:00Z"
        })
    }
    
    pub fn permission_error() -> Value {
        json!({
            "error": "PermissionError",
            "message": "Insufficient permissions",
            "code": "ACCESS_DENIED",
            "required_role": "admin",
            "current_role": "user"
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_valid_client_fixture() {
        let client = ClientFixtures::valid_client();
        assert_eq!(client["email"], "john.doe@example.com");
        assert_eq!(client["status"], "active");
        assert!(client["emergency_contact"].is_object());
    }
    
    #[test]
    fn test_multiple_clients_generation() {
        let clients = ClientFixtures::multiple_clients(5);
        assert_eq!(clients.len(), 5);
        assert_ne!(clients[0]["email"], clients[1]["email"]);
    }
    
    #[test]
    fn test_appointment_conflicts() {
        let conflicts = AppointmentFixtures::conflicting_appointments();
        assert_eq!(conflicts.len(), 2);
        assert_eq!(conflicts[0]["professional_id"], conflicts[1]["professional_id"]);
    }
    
    #[test]
    fn test_dashboard_stats() {
        let stats = DashboardFixtures::monthly_stats();
        assert_eq!(stats["total_appointments"], 150);
        assert!(stats["revenue"].as_f64().unwrap() > 0.0);
    }
}