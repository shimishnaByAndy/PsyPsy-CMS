/**
 * Phone utility functions for formatting and validation
 */

/**
 * Format phone number based on country
 * @param {string} phoneNumber - Raw phone number
 * @param {string} country - Country code (CA, US, etc.)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber, country = 'CA') => {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (country === 'CA' || country === 'US') {
    // North American format
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
  }
  
  // Return original if can't format
  return phoneNumber;
};

/**
 * Validate phone number
 * @param {string} phoneNumber - Phone number to validate
 * @param {string} country - Country code
 * @returns {boolean} Is valid phone number
 */
export const isValidPhoneNumber = (phoneNumber, country = 'CA') => {
  if (!phoneNumber) return false;
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (country === 'CA' || country === 'US') {
    return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
  }
  
  return cleaned.length >= 7 && cleaned.length <= 15;
};