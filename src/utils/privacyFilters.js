/**
 * Privacy Filters - Data filtering utilities for compliance and privacy protection
 */

import { maskSensitiveData } from './exportFormatters';

/**
 * Privacy levels and their access permissions
 */
export const PRIVACY_LEVELS = {
  ANONYMOUS: 'anonymous',
  BASIC: 'basic', 
  FULL: 'full'
};

/**
 * Field privacy classifications
 */
export const FIELD_PRIVACY = {
  PUBLIC: 'public',         // Always visible
  BASIC: 'basic',          // Visible in basic and full levels
  SENSITIVE: 'sensitive',   // Only visible in full level
  RESTRICTED: 'restricted'  // Never exported (internal only)
};

/**
 * Apply privacy filtering to export data
 */
export const applyPrivacyFilters = (data, privacyLevel, userRole = 'admin') => {
  if (!Array.isArray(data)) return [];
  
  return data.map(record => applyRecordPrivacyFilter(record, privacyLevel, userRole));
};

/**
 * Apply privacy filter to a single record
 */
export const applyRecordPrivacyFilter = (record, privacyLevel, userRole = 'admin') => {
  if (!record) return record;
  
  const filteredRecord = { ...record };
  
  // Apply field-specific privacy rules
  Object.keys(filteredRecord).forEach(fieldKey => {
    const fieldPrivacy = getFieldPrivacyLevel(fieldKey);
    const value = filteredRecord[fieldKey];
    
    if (shouldMaskField(fieldKey, privacyLevel, userRole)) {
      filteredRecord[fieldKey] = maskFieldValue(fieldKey, value, privacyLevel);
    } else if (shouldExcludeField(fieldKey, privacyLevel, userRole)) {
      delete filteredRecord[fieldKey];
    }
  });
  
  return filteredRecord;
};

/**
 * Get privacy level for specific fields
 */
export const getFieldPrivacyLevel = (fieldKey) => {
  const fieldPrivacyMap = {
    // Public fields
    'id': FIELD_PRIVACY.PUBLIC,
    'createdAt': FIELD_PRIVACY.PUBLIC,
    'updatedAt': FIELD_PRIVACY.PUBLIC,
    
    // Basic fields
    'firstName': FIELD_PRIVACY.BASIC,
    'lastName': FIELD_PRIVACY.BASIC,
    'businessName': FIELD_PRIVACY.BASIC,
    'profType': FIELD_PRIVACY.BASIC,
    'isVerified': FIELD_PRIVACY.BASIC,
    'verificationStatus': FIELD_PRIVACY.BASIC,
    'servOfferedArr': FIELD_PRIVACY.BASIC,
    
    // Sensitive fields
    'email': FIELD_PRIVACY.SENSITIVE,
    'phoneNb': FIELD_PRIVACY.SENSITIVE,
    'dob': FIELD_PRIVACY.SENSITIVE,
    'address': FIELD_PRIVACY.SENSITIVE,
    'addressObj': FIELD_PRIVACY.SENSITIVE,
    'bussEmail': FIELD_PRIVACY.SENSITIVE,
    'bussPhoneNb': FIELD_PRIVACY.SENSITIVE,
    
    // Restricted fields (never exported)
    'password': FIELD_PRIVACY.RESTRICTED,
    'sessionToken': FIELD_PRIVACY.RESTRICTED,
    'licenseNumber': FIELD_PRIVACY.RESTRICTED,
    'socialInsuranceNumber': FIELD_PRIVACY.RESTRICTED,
    'bankAccount': FIELD_PRIVACY.RESTRICTED,
    'creditCard': FIELD_PRIVACY.RESTRICTED,
    'paymentInfo': FIELD_PRIVACY.RESTRICTED
  };
  
  // Handle nested field keys (e.g., 'clientPtr.firstName')
  const baseKey = fieldKey.includes('.') ? fieldKey.split('.').pop() : fieldKey;
  
  return fieldPrivacyMap[baseKey] || fieldPrivacyMap[fieldKey] || FIELD_PRIVACY.BASIC;
};

/**
 * Check if field should be masked
 */
export const shouldMaskField = (fieldKey, privacyLevel, userRole) => {
  const fieldPrivacy = getFieldPrivacyLevel(fieldKey);
  
  // Admin users with full access don't need masking
  if (userRole === 'admin' && privacyLevel === PRIVACY_LEVELS.FULL) {
    return false;
  }
  
  // Sensitive fields are masked in basic and anonymous levels
  if (fieldPrivacy === FIELD_PRIVACY.SENSITIVE && privacyLevel !== PRIVACY_LEVELS.FULL) {
    return true;
  }
  
  // Email and phone fields special handling
  if ((fieldKey.includes('email') || fieldKey.includes('Email')) && privacyLevel === PRIVACY_LEVELS.ANONYMOUS) {
    return true;
  }
  
  if ((fieldKey.includes('phone') || fieldKey.includes('Phone')) && privacyLevel === PRIVACY_LEVELS.ANONYMOUS) {
    return true;
  }
  
  return false;
};

/**
 * Check if field should be completely excluded
 */
export const shouldExcludeField = (fieldKey, privacyLevel, userRole) => {
  const fieldPrivacy = getFieldPrivacyLevel(fieldKey);
  
  // Always exclude restricted fields
  if (fieldPrivacy === FIELD_PRIVACY.RESTRICTED) {
    return true;
  }
  
  // Anonymous level excludes sensitive information
  if (privacyLevel === PRIVACY_LEVELS.ANONYMOUS) {
    const sensitivePatterns = [
      'dob', 'dateOfBirth', 'socialInsurance', 'sin',
      'license', 'certification', 'credential',
      'address', 'Address'
    ];
    
    return sensitivePatterns.some(pattern => fieldKey.toLowerCase().includes(pattern.toLowerCase()));
  }
  
  return false;
};

/**
 * Mask field value based on field type and privacy level
 */
export const maskFieldValue = (fieldKey, value, privacyLevel) => {
  if (!value) return value;
  
  const lowerFieldKey = fieldKey.toLowerCase();
  
  // Email masking
  if (lowerFieldKey.includes('email')) {
    return maskSensitiveData(value, 'email');
  }
  
  // Phone number masking
  if (lowerFieldKey.includes('phone')) {
    return maskSensitiveData(value, 'phone');
  }
  
  // Name masking for anonymous level
  if (privacyLevel === PRIVACY_LEVELS.ANONYMOUS && 
      (lowerFieldKey.includes('name') || lowerFieldKey.includes('firstName') || lowerFieldKey.includes('lastName'))) {
    return maskSensitiveData(value, 'partial');
  }
  
  // Default partial masking
  return maskSensitiveData(value, 'partial');
};

/**
 * Get allowed fields for export based on privacy level
 */
export const getAllowedFields = (template, privacyLevel, userRole = 'admin') => {
  if (!template || !template.fields) return [];
  
  return template.fields.filter(field => {
    const fieldPrivacy = field.privacy || getFieldPrivacyLevel(field.key);
    
    // Never include restricted fields
    if (fieldPrivacy === FIELD_PRIVACY.RESTRICTED) {
      return false;
    }
    
    // Check privacy level requirements
    switch (privacyLevel) {
      case PRIVACY_LEVELS.ANONYMOUS:
        return fieldPrivacy === FIELD_PRIVACY.PUBLIC;
      case PRIVACY_LEVELS.BASIC:
        return fieldPrivacy === FIELD_PRIVACY.PUBLIC || fieldPrivacy === FIELD_PRIVACY.BASIC;
      case PRIVACY_LEVELS.FULL:
        return fieldPrivacy !== FIELD_PRIVACY.RESTRICTED;
      default:
        return fieldPrivacy === FIELD_PRIVACY.BASIC;
    }
  });
};

/**
 * Validate user permissions for export
 */
export const validateExportPermissions = (userRole, privacyLevel, dataType) => {
  const permissions = {
    admin: {
      allowedPrivacyLevels: [PRIVACY_LEVELS.ANONYMOUS, PRIVACY_LEVELS.BASIC, PRIVACY_LEVELS.FULL],
      allowedDataTypes: ['clients', 'professionals', 'appointments', 'statistics']
    },
    manager: {
      allowedPrivacyLevels: [PRIVACY_LEVELS.ANONYMOUS, PRIVACY_LEVELS.BASIC],
      allowedDataTypes: ['clients', 'appointments', 'statistics']
    },
    staff: {
      allowedPrivacyLevels: [PRIVACY_LEVELS.ANONYMOUS],
      allowedDataTypes: ['statistics']
    }
  };
  
  const userPermissions = permissions[userRole] || permissions.staff;
  
  return {
    canExport: userPermissions.allowedDataTypes.includes(dataType),
    canUsePrivacyLevel: userPermissions.allowedPrivacyLevels.includes(privacyLevel),
    allowedPrivacyLevels: userPermissions.allowedPrivacyLevels,
    allowedDataTypes: userPermissions.allowedDataTypes
  };
};

/**
 * Create privacy-compliant export template
 */
export const createPrivacyCompliantTemplate = (baseTemplate, privacyLevel, userRole = 'admin') => {
  const allowedFields = getAllowedFields(baseTemplate, privacyLevel, userRole);
  
  return {
    ...baseTemplate,
    id: `${baseTemplate.id}-${privacyLevel}`,
    name: `${baseTemplate.name} (${privacyLevel.charAt(0).toUpperCase() + privacyLevel.slice(1)})`,
    privacyLevel: privacyLevel,
    fields: allowedFields
  };
};

/**
 * Generate privacy notice for export
 */
export const generatePrivacyNotice = (privacyLevel, dataType, recordCount) => {
  const notices = {
    [PRIVACY_LEVELS.FULL]: `This export contains ${recordCount} ${dataType} records with full personal information. Handle according to privacy regulations and organizational policies.`,
    [PRIVACY_LEVELS.BASIC]: `This export contains ${recordCount} ${dataType} records with basic information only. Sensitive personal data has been filtered or masked.`,
    [PRIVACY_LEVELS.ANONYMOUS]: `This export contains ${recordCount} ${dataType} records with anonymized data only. Personal identifiers have been removed or masked.`
  };
  
  return notices[privacyLevel] || notices[PRIVACY_LEVELS.BASIC];
};

export default {
  PRIVACY_LEVELS,
  FIELD_PRIVACY,
  applyPrivacyFilters,
  applyRecordPrivacyFilter,
  getFieldPrivacyLevel,
  shouldMaskField,
  shouldExcludeField,
  maskFieldValue,
  getAllowedFields,
  validateExportPermissions,
  createPrivacyCompliantTemplate,
  generatePrivacyNotice
};