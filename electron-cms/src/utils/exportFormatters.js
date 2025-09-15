/**
 * Export Data Formatters - Utilities for formatting data for export
 */

/**
 * Format Canadian phone numbers
 */
export const formatCanadianPhone = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.toString().replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.length === 10) {
    // Format as (xxx) xxx-xxxx
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Remove leading 1 and format
    const withoutCountryCode = cleaned.substring(1);
    return `(${withoutCountryCode.substring(0, 3)}) ${withoutCountryCode.substring(3, 6)}-${withoutCountryCode.substring(6)}`;
  }
  
  // Return original if can't format
  return phoneNumber;
};

/**
 * Format business address for export
 */
export const formatBusinessAddress = (addressObj) => {
  if (!addressObj || typeof addressObj !== 'object') return '';
  
  const parts = [];
  
  if (addressObj.street) parts.push(addressObj.street);
  if (addressObj.city) parts.push(addressObj.city);
  if (addressObj.province) parts.push(addressObj.province);
  if (addressObj.postalCode) parts.push(addressObj.postalCode);
  
  return parts.join(', ');
};

/**
 * Format date and time for export
 */
export const formatDateTime = (date, format = 'datetime') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    timeZone: 'America/Toronto' // Eastern Time for Canadian context
  };
  
  switch (format) {
    case 'date':
      return dateObj.toLocaleDateString('en-CA', options);
    case 'time':
      return dateObj.toLocaleTimeString('en-CA', options);
    case 'datetime':
      return dateObj.toLocaleString('en-CA', options);
    case 'iso':
      return dateObj.toISOString();
    default:
      return dateObj.toLocaleDateString('en-CA', options);
  }
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  
  const birthDate = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  
  if (isNaN(birthDate.getTime())) return '';
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 0 ? age : '';
};

/**
 * Format currency for export
 */
export const formatCurrency = (amount, currency = 'CAD') => {
  if (!amount && amount !== 0) return '';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '';
  
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency
  }).format(numAmount);
};

/**
 * Format arrays for export (comma-separated values)
 */
export const formatArray = (array, separator = ', ') => {
  if (!Array.isArray(array)) return '';
  
  return array
    .filter(item => item !== null && item !== undefined && item !== '')
    .join(separator);
};

/**
 * Format boolean values for export
 */
export const formatBoolean = (value, trueText = 'Yes', falseText = 'No') => {
  if (value === null || value === undefined) return '';
  
  return value ? trueText : falseText;
};

/**
 * Format professional verification status
 */
export const formatVerificationStatus = (isVerified, verificationDate) => {
  if (isVerified) {
    const dateStr = verificationDate ? ` (${formatDateTime(verificationDate, 'date')})` : '';
    return `Verified${dateStr}`;
  }
  return 'Pending Verification';
};

/**
 * Format appointment status
 */
export const formatAppointmentStatus = (status) => {
  const statusMap = {
    'scheduled': 'Scheduled',
    'confirmed': 'Confirmed',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no_show': 'No Show'
  };
  
  return statusMap[status] || status;
};

/**
 * Clean export data - remove problematic characters
 */
export const cleanExportData = (value) => {
  if (value === null || value === undefined) return '';
  
  const stringValue = value.toString();
  
  // Remove or replace problematic characters for CSV/Excel
  return stringValue
    .replace(/[\r\n]/g, ' ') // Replace line breaks with spaces
    .replace(/["\u201C\u201D]/g, "'") // Replace smart quotes with regular quotes
    .replace(/[\u2018\u2019]/g, "'") // Replace smart apostrophes
    .replace(/\u2026/g, '...') // Replace ellipsis
    .trim();
};

/**
 * Mask sensitive data for privacy
 */
export const maskSensitiveData = (value, maskType = 'partial') => {
  if (!value) return '';
  
  const stringValue = value.toString();
  
  switch (maskType) {
    case 'full':
      return '*'.repeat(stringValue.length);
    case 'email':
      const [local, domain] = stringValue.split('@');
      if (!domain) return stringValue;
      return `${local.substring(0, 2)}***@${domain}`;
    case 'phone':
      return stringValue.replace(/\d/g, '*');
    case 'partial':
    default:
      if (stringValue.length <= 4) return stringValue;
      return stringValue.substring(0, 2) + '*'.repeat(stringValue.length - 4) + stringValue.substring(stringValue.length - 2);
  }
};

/**
 * Format postal code (Canadian format)
 */
export const formatPostalCode = (postalCode) => {
  if (!postalCode) return '';
  
  const cleaned = postalCode.toString().replace(/\s/g, '').toUpperCase();
  
  // Canadian postal code pattern: A1A 1A1
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleaned)) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
  }
  
  return postalCode; // Return original if doesn't match pattern
};

/**
 * Format professional services array
 */
export const formatProfessionalServices = (services) => {
  if (!Array.isArray(services)) return '';
  
  return services
    .filter(service => service && service.trim())
    .map(service => service.trim())
    .join(', ');
};

/**
 * Format license information with privacy protection
 */
export const formatLicenseInfo = (licenseNumber, privacyLevel = 'basic') => {
  if (!licenseNumber) return '';
  
  if (privacyLevel === 'anonymous' || privacyLevel === 'basic') {
    return maskSensitiveData(licenseNumber, 'partial');
  }
  
  return licenseNumber;
};

export default {
  formatCanadianPhone,
  formatBusinessAddress,
  formatDateTime,
  calculateAge,
  formatCurrency,
  formatArray,
  formatBoolean,
  formatVerificationStatus,
  formatAppointmentStatus,
  cleanExportData,
  maskSensitiveData,
  formatPostalCode,
  formatProfessionalServices,
  formatLicenseInfo
};