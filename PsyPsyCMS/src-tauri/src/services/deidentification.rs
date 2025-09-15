/**
 * Quebec Law 25 Data De-identification Service
 *
 * Implements privacy-preserving data processing to comply with Quebec Law 25
 * by removing or masking personal identifiers from text data while preserving
 * clinical utility.
 */

use regex::Regex;
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use chrono::{DateTime, Utc, NaiveDate};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeidentifiedData {
    pub original_hash: String,      // SHA-256 hash for re-identification if needed
    pub cleaned_text: String,       // De-identified text
    pub removed_entities: Vec<RemovedEntity>,
    pub compliance_level: ComplianceLevel,
    pub processing_timestamp: DateTime<Utc>,
    pub quebec_specific_items: Vec<String>, // Quebec-specific identifiers removed
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RemovedEntity {
    pub entity_type: IdentifierType,
    pub original_position: (usize, usize), // Start and end positions
    pub replacement_token: String,
    pub confidence_score: f32, // 0.0 - 1.0 confidence in identification
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum ComplianceLevel {
    Law25,          // Quebec Law 25 compliant
    PIPEDA,         // Federal PIPEDA compliant
    FullAnonymous,  // Complete anonymization
    MinimalRedaction, // Minimal redaction for internal use
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum IdentifierType {
    // Direct identifiers
    FullName,
    FirstName,
    LastName,
    EmailAddress,
    PhoneNumber,

    // Quebec-specific identifiers
    RAMQNumber,           // Quebec health insurance number (ABCD12345678)
    SocialInsuranceNumber, // Canadian SIN
    QuebekDriversLicense,
    QuebekPostalCode,

    // Medical identifiers
    MedicalRecordNumber,
    PatientId,
    ProviderNPI,

    // Address components
    StreetAddress,
    City,
    Province,
    PostalCode,

    // Dates
    BirthDate,
    TreatmentDate,
    AppointmentDate,

    // Financial
    CreditCardNumber,
    BankAccount,

    // Other sensitive
    SocialMediaHandle,
    LicensePlate,
    WebURL,
}

pub struct DeidentificationService {
    // Quebec-specific patterns
    ramq_pattern: Regex,
    quebec_postal_pattern: Regex,
    quebec_drivers_license_pattern: Regex,

    // Standard patterns
    name_pattern: Regex,
    phone_pattern: Regex,
    email_pattern: Regex,
    sin_pattern: Regex,
    credit_card_pattern: Regex,

    // Date patterns
    date_patterns: Vec<Regex>,

    // Common Quebec names and places (for enhanced detection)
    quebec_names: Vec<String>,
    quebec_cities: Vec<String>,

    // Replacement tokens
    replacement_counter: HashMap<IdentifierType, u32>,
}

impl DeidentificationService {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self {
            // RAMQ pattern: 4 letters + 8 digits (e.g., ABCD12345678)
            ramq_pattern: Regex::new(r"\b[A-Z]{4}\s?\d{8}\b")?,

            // Quebec postal codes (H, G, J series primarily)
            quebec_postal_pattern: Regex::new(r"\b[HGJ]\d[A-Z]\s?\d[A-Z]\d\b")?,

            // Quebec drivers license pattern
            quebec_drivers_license_pattern: Regex::new(r"\b[A-Z]\d{13}\b")?,

            // Phone patterns (Quebec: 418, 438, 450, 514, 579, 581, 819, 873)
            phone_pattern: Regex::new(r"\b(?:\+1\s?)?(?:418|438|450|514|579|581|819|873)[-.\s]?\d{3}[-.\s]?\d{4}\b")?,

            // Email pattern
            email_pattern: Regex::new(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")?,

            // Canadian SIN pattern (9 digits, various formats)
            sin_pattern: Regex::new(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}\b")?,

            // Credit card patterns (simplified)
            credit_card_pattern: Regex::new(r"\b(?:\d{4}[-.\s]?){3}\d{4}\b")?,

            // Name pattern (simplified - would need more sophisticated NER in production)
            name_pattern: Regex::new(r"\b[A-Z][a-z]+\s+[A-Z][a-z]+\b")?,

            // Date patterns
            date_patterns: vec![
                Regex::new(r"\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b")?, // MM/DD/YYYY, DD/MM/YYYY
                Regex::new(r"\b\d{4}[/.-]\d{1,2}[/.-]\d{1,2}\b")?, // YYYY/MM/DD
                Regex::new(r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b")?, // Month DD, YYYY
                Regex::new(r"\b(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{1,2},?\s+\d{4}\b")?, // French months
            ],

            // Quebec-specific names and places (sample - would need comprehensive list)
            quebec_names: vec![
                "Tremblay".to_string(), "Gagnon".to_string(), "Roy".to_string(),
                "Bouchard".to_string(), "Gauthier".to_string(), "Morin".to_string(),
                "Lavoie".to_string(), "Fortin".to_string(), "Gagné".to_string(),
            ],

            quebec_cities: vec![
                "Montréal".to_string(), "Québec".to_string(), "Laval".to_string(),
                "Gatineau".to_string(), "Longueuil".to_string(), "Sherbrooke".to_string(),
                "Saguenay".to_string(), "Lévis".to_string(), "Trois-Rivières".to_string(),
            ],

            replacement_counter: HashMap::new(),
        })
    }

    /// De-identify text according to specified compliance level
    pub fn deidentify(&mut self, text: &str, level: ComplianceLevel) -> Result<DeidentifiedData, Box<dyn std::error::Error>> {
        let mut cleaned = text.to_string();
        let mut removed_entities = Vec::new();
        let mut quebec_specific = Vec::new();

        // Reset counters for this session
        self.replacement_counter.clear();

        match level {
            ComplianceLevel::Law25 => {
                // Full Law 25 compliance - remove all direct identifiers
                self.remove_quebec_health_cards(&mut cleaned, &mut removed_entities, &mut quebec_specific)?;
                self.remove_personal_names(&mut cleaned, &mut removed_entities)?;
                self.remove_contact_info(&mut cleaned, &mut removed_entities)?;
                self.remove_addresses(&mut cleaned, &mut removed_entities)?;
                self.remove_financial_info(&mut cleaned, &mut removed_entities)?;

                // Keep relative dates but remove specific dates
                self.generalize_dates(&mut cleaned, &mut removed_entities)?;
            },

            ComplianceLevel::PIPEDA => {
                // Federal PIPEDA compliance
                self.remove_quebec_health_cards(&mut cleaned, &mut removed_entities, &mut quebec_specific)?;
                self.remove_personal_names(&mut cleaned, &mut removed_entities)?;
                self.remove_contact_info(&mut cleaned, &mut removed_entities)?;
                self.remove_sin_numbers(&mut cleaned, &mut removed_entities)?;
            },

            ComplianceLevel::FullAnonymous => {
                // Complete anonymization - remove everything including indirect identifiers
                self.remove_all_identifiers(&mut cleaned, &mut removed_entities, &mut quebec_specific)?;
                self.remove_all_dates(&mut cleaned, &mut removed_entities)?;
                self.remove_locations(&mut cleaned, &mut removed_entities)?;
            },

            ComplianceLevel::MinimalRedaction => {
                // Only remove most sensitive identifiers
                self.remove_quebec_health_cards(&mut cleaned, &mut removed_entities, &mut quebec_specific)?;
                self.remove_sin_numbers(&mut cleaned, &mut removed_entities)?;
                self.remove_credit_cards(&mut cleaned, &mut removed_entities)?;
            },
        }

        // Create secure hash of original text
        let original_hash = self.hash_original(text);

        Ok(DeidentifiedData {
            original_hash,
            cleaned_text: cleaned,
            removed_entities,
            compliance_level: level,
            processing_timestamp: Utc::now(),
            quebec_specific_items: quebec_specific,
        })
    }

    /// Verify that text meets specified compliance level
    pub fn verify_compliance(&self, text: &str, level: ComplianceLevel) -> Result<bool, Box<dyn std::error::Error>> {
        // Check for remaining identifiers that should have been removed
        match level {
            ComplianceLevel::Law25 | ComplianceLevel::PIPEDA => {
                if self.ramq_pattern.is_match(text) { return Ok(false); }
                if self.sin_pattern.is_match(text) { return Ok(false); }
                if self.email_pattern.is_match(text) { return Ok(false); }
                if self.credit_card_pattern.is_match(text) { return Ok(false); }
            },
            ComplianceLevel::FullAnonymous => {
                // Check for any potential identifiers
                if self.has_any_identifiers(text)? { return Ok(false); }
            },
            ComplianceLevel::MinimalRedaction => {
                if self.ramq_pattern.is_match(text) { return Ok(false); }
                if self.sin_pattern.is_match(text) { return Ok(false); }
                if self.credit_card_pattern.is_match(text) { return Ok(false); }
            },
        }

        Ok(true)
    }

    // Private helper methods

    fn remove_quebec_health_cards(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>, quebec_items: &mut Vec<String>) -> Result<(), Box<dyn std::error::Error>> {
        for mat in self.ramq_pattern.find_iter(text) {
            let replacement = format!("[RAMQ_{}]", self.get_counter(IdentifierType::RAMQNumber));
            quebec_items.push(format!("RAMQ number at position {}-{}", mat.start(), mat.end()));

            entities.push(RemovedEntity {
                entity_type: IdentifierType::RAMQNumber,
                original_position: (mat.start(), mat.end()),
                replacement_token: replacement.clone(),
                confidence_score: 0.95, // High confidence for regex match
            });
        }

        *text = self.ramq_pattern.replace_all(text, |caps: &regex::Captures| {
            format!("[RAMQ_{}]", self.get_counter(IdentifierType::RAMQNumber))
        }).to_string();

        Ok(())
    }

    fn remove_personal_names(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>) -> Result<(), Box<dyn std::error::Error>> {
        // This is a simplified implementation - in production, would use NLP/NER
        for mat in self.name_pattern.find_iter(text) {
            let name_text = mat.as_str();

            // Check if it might be a Quebec name
            let is_quebec_name = self.quebec_names.iter().any(|qn| name_text.contains(qn));
            let confidence = if is_quebec_name { 0.8 } else { 0.6 };

            entities.push(RemovedEntity {
                entity_type: IdentifierType::FullName,
                original_position: (mat.start(), mat.end()),
                replacement_token: format!("[NAME_{}]", self.get_counter(IdentifierType::FullName)),
                confidence_score: confidence,
            });
        }

        *text = self.name_pattern.replace_all(text, |_caps: &regex::Captures| {
            format!("[NAME_{}]", self.get_counter(IdentifierType::FullName))
        }).to_string();

        Ok(())
    }

    fn remove_contact_info(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>) -> Result<(), Box<dyn std::error::Error>> {
        // Remove email addresses
        for mat in self.email_pattern.find_iter(text) {
            entities.push(RemovedEntity {
                entity_type: IdentifierType::EmailAddress,
                original_position: (mat.start(), mat.end()),
                replacement_token: format!("[EMAIL_{}]", self.get_counter(IdentifierType::EmailAddress)),
                confidence_score: 0.95,
            });
        }
        *text = self.email_pattern.replace_all(text, |_caps: &regex::Captures| {
            format!("[EMAIL_{}]", self.get_counter(IdentifierType::EmailAddress))
        }).to_string();

        // Remove phone numbers
        for mat in self.phone_pattern.find_iter(text) {
            entities.push(RemovedEntity {
                entity_type: IdentifierType::PhoneNumber,
                original_position: (mat.start(), mat.end()),
                replacement_token: format!("[PHONE_{}]", self.get_counter(IdentifierType::PhoneNumber)),
                confidence_score: 0.9,
            });
        }
        *text = self.phone_pattern.replace_all(text, |_caps: &regex::Captures| {
            format!("[PHONE_{}]", self.get_counter(IdentifierType::PhoneNumber))
        }).to_string();

        Ok(())
    }

    fn remove_addresses(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>) -> Result<(), Box<dyn std::error::Error>> {
        // Remove Quebec postal codes
        for mat in self.quebec_postal_pattern.find_iter(text) {
            entities.push(RemovedEntity {
                entity_type: IdentifierType::QuebekPostalCode,
                original_position: (mat.start(), mat.end()),
                replacement_token: format!("[POSTAL_{}]", self.get_counter(IdentifierType::QuebekPostalCode)),
                confidence_score: 0.95,
            });
        }
        *text = self.quebec_postal_pattern.replace_all(text, |_caps: &regex::Captures| {
            format!("[POSTAL_{}]", self.get_counter(IdentifierType::QuebekPostalCode))
        }).to_string();

        // Remove Quebec cities (simplified)
        for city in &self.quebec_cities {
            if text.contains(city) {
                let replacement = format!("[CITY_{}]", self.get_counter(IdentifierType::City));
                *text = text.replace(city, &replacement);

                entities.push(RemovedEntity {
                    entity_type: IdentifierType::City,
                    original_position: (0, 0), // Would need more sophisticated tracking
                    replacement_token: replacement,
                    confidence_score: 0.8,
                });
            }
        }

        Ok(())
    }

    fn remove_financial_info(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>) -> Result<(), Box<dyn std::error::Error>> {
        self.remove_credit_cards(text, entities)?;
        Ok(())
    }

    fn remove_credit_cards(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>) -> Result<(), Box<dyn std::error::Error>> {
        for mat in self.credit_card_pattern.find_iter(text) {
            entities.push(RemovedEntity {
                entity_type: IdentifierType::CreditCardNumber,
                original_position: (mat.start(), mat.end()),
                replacement_token: format!("[CARD_{}]", self.get_counter(IdentifierType::CreditCardNumber)),
                confidence_score: 0.85,
            });
        }
        *text = self.credit_card_pattern.replace_all(text, |_caps: &regex::Captures| {
            format!("[CARD_{}]", self.get_counter(IdentifierType::CreditCardNumber))
        }).to_string();

        Ok(())
    }

    fn remove_sin_numbers(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>) -> Result<(), Box<dyn std::error::Error>> {
        for mat in self.sin_pattern.find_iter(text) {
            entities.push(RemovedEntity {
                entity_type: IdentifierType::SocialInsuranceNumber,
                original_position: (mat.start(), mat.end()),
                replacement_token: format!("[SIN_{}]", self.get_counter(IdentifierType::SocialInsuranceNumber)),
                confidence_score: 0.8, // Lower confidence as format overlaps with other numbers
            });
        }
        *text = self.sin_pattern.replace_all(text, |_caps: &regex::Captures| {
            format!("[SIN_{}]", self.get_counter(IdentifierType::SocialInsuranceNumber))
        }).to_string();

        Ok(())
    }

    fn generalize_dates(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>) -> Result<(), Box<dyn std::error::Error>> {
        // Replace specific dates with generalized versions (e.g., "early 2023", "mid-March")
        for pattern in &self.date_patterns {
            for mat in pattern.find_iter(text) {
                entities.push(RemovedEntity {
                    entity_type: IdentifierType::TreatmentDate,
                    original_position: (mat.start(), mat.end()),
                    replacement_token: "[DATE_GENERALIZED]".to_string(),
                    confidence_score: 0.7,
                });
            }
            *text = pattern.replace_all(text, "[DATE_GENERALIZED]").to_string();
        }

        Ok(())
    }

    fn remove_all_dates(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>) -> Result<(), Box<dyn std::error::Error>> {
        for pattern in &self.date_patterns {
            for mat in pattern.find_iter(text) {
                entities.push(RemovedEntity {
                    entity_type: IdentifierType::TreatmentDate,
                    original_position: (mat.start(), mat.end()),
                    replacement_token: "[DATE_REMOVED]".to_string(),
                    confidence_score: 0.8,
                });
            }
            *text = pattern.replace_all(text, "[DATE_REMOVED]").to_string();
        }

        Ok(())
    }

    fn remove_locations(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>) -> Result<(), Box<dyn std::error::Error>> {
        // Remove all Quebec cities
        for city in &self.quebec_cities {
            if text.contains(city) {
                let replacement = "[LOCATION_REMOVED]".to_string();
                *text = text.replace(city, &replacement);

                entities.push(RemovedEntity {
                    entity_type: IdentifierType::City,
                    original_position: (0, 0),
                    replacement_token: replacement,
                    confidence_score: 0.9,
                });
            }
        }

        Ok(())
    }

    fn remove_all_identifiers(&mut self, text: &mut String, entities: &mut Vec<RemovedEntity>, quebec_items: &mut Vec<String>) -> Result<(), Box<dyn std::error::Error>> {
        self.remove_quebec_health_cards(text, entities, quebec_items)?;
        self.remove_personal_names(text, entities)?;
        self.remove_contact_info(text, entities)?;
        self.remove_addresses(text, entities)?;
        self.remove_financial_info(text, entities)?;
        self.remove_sin_numbers(text, entities)?;
        Ok(())
    }

    fn has_any_identifiers(&self, text: &str) -> Result<bool, Box<dyn std::error::Error>> {
        if self.ramq_pattern.is_match(text) { return Ok(true); }
        if self.sin_pattern.is_match(text) { return Ok(true); }
        if self.email_pattern.is_match(text) { return Ok(true); }
        if self.phone_pattern.is_match(text) { return Ok(true); }
        if self.credit_card_pattern.is_match(text) { return Ok(true); }
        if self.quebec_postal_pattern.is_match(text) { return Ok(true); }

        Ok(false)
    }

    fn get_counter(&mut self, entity_type: IdentifierType) -> u32 {
        let counter = self.replacement_counter.entry(entity_type).or_insert(0);
        *counter += 1;
        *counter
    }

    fn hash_original(&self, text: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(text.as_bytes());
        format!("{:x}", hasher.finalize())
    }
}

// Export functions for Tauri commands
impl DeidentificationService {
    /// Create a new de-identification service instance
    pub fn create() -> Result<Self, String> {
        Self::new().map_err(|e| e.to_string())
    }

    /// De-identify text and return serializable result
    pub fn process_text(&mut self, text: &str, compliance_level: &str) -> Result<DeidentifiedData, String> {
        let level = match compliance_level {
            "law25" => ComplianceLevel::Law25,
            "pipeda" => ComplianceLevel::PIPEDA,
            "anonymous" => ComplianceLevel::FullAnonymous,
            "minimal" => ComplianceLevel::MinimalRedaction,
            _ => return Err("Invalid compliance level".to_string()),
        };

        self.deidentify(text, level).map_err(|e| e.to_string())
    }

    /// Verify compliance of processed text
    pub fn check_compliance(&self, text: &str, compliance_level: &str) -> Result<bool, String> {
        let level = match compliance_level {
            "law25" => ComplianceLevel::Law25,
            "pipeda" => ComplianceLevel::PIPEDA,
            "anonymous" => ComplianceLevel::FullAnonymous,
            "minimal" => ComplianceLevel::MinimalRedaction,
            _ => return Err("Invalid compliance level".to_string()),
        };

        self.verify_compliance(text, level).map_err(|e| e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ramq_detection() {
        let mut service = DeidentificationService::new().unwrap();
        let text = "Patient RAMQ: ABCD12345678";
        let result = service.deidentify(text, ComplianceLevel::Law25).unwrap();

        assert!(!result.cleaned_text.contains("ABCD12345678"));
        assert!(result.cleaned_text.contains("[RAMQ_"));
        assert_eq!(result.removed_entities.len(), 1);
        assert_eq!(result.removed_entities[0].entity_type, IdentifierType::RAMQNumber);
    }

    #[test]
    fn test_quebec_postal_code() {
        let mut service = DeidentificationService::new().unwrap();
        let text = "Address: 123 Main St, Montreal, H3A 1B2";
        let result = service.deidentify(text, ComplianceLevel::Law25).unwrap();

        assert!(!result.cleaned_text.contains("H3A 1B2"));
        assert!(result.cleaned_text.contains("[POSTAL_"));
    }

    #[test]
    fn test_compliance_verification() {
        let service = DeidentificationService::new().unwrap();

        // Should fail compliance (contains RAMQ)
        let bad_text = "Patient RAMQ: ABCD12345678";
        assert!(!service.verify_compliance(bad_text, ComplianceLevel::Law25).unwrap());

        // Should pass compliance (no identifiers)
        let good_text = "Patient shows improvement in symptoms.";
        assert!(service.verify_compliance(good_text, ComplianceLevel::Law25).unwrap());
    }
}