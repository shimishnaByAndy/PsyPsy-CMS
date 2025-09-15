/**
 * Export Service - Data transformation and export operations
 */

import { applyPrivacyFilters } from 'utils/privacyFilters';
import { 
  formatCanadianPhone, 
  formatBusinessAddress, 
  formatDateTime, 
  calculateAge,
  formatCurrency,
  cleanExportData
} from 'utils/exportFormatters';

/**
 * Generic data transformation for export
 */
export const transformDataForExport = (data, template, privacyLevel = 'basic') => {
  if (!Array.isArray(data) || !template) {
    throw new Error('Invalid data or template for export');
  }

  // Filter fields based on privacy level
  const filteredFields = template.fields.filter(field => {
    const fieldPrivacy = field.privacy || 'basic';
    return getPrivacyLevel(privacyLevel) >= getPrivacyLevel(fieldPrivacy);
  });

  // Transform each data row
  return data.map((row, index) => {
    const exportRow = {};
    
    filteredFields.forEach(field => {
      try {
        const value = getNestedValue(row, field.key);
        const formattedValue = field.formatter ? field.formatter(value) : value;
        exportRow[field.header] = cleanExportData(formattedValue);
      } catch (error) {
        console.warn(`Export formatting error for field ${field.key}:`, error);
        exportRow[field.header] = '';
      }
    });
    
    return exportRow;
  });
};

/**
 * Get nested object values using dot notation
 */
export const getNestedValue = (obj, path) => {
  if (!obj || typeof path !== 'string') return undefined;
  
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    
    // Handle Parse objects with .get() method
    if (current.get && typeof current.get === 'function') {
      return current.get(key);
    }
    
    // Handle nested Parse objects
    if (current[key] && current[key].get) {
      return current[key];
    }
    
    return current[key];
  }, obj);
};

/**
 * Privacy level hierarchy
 */
const PRIVACY_LEVELS = {
  'anonymous': 1,
  'basic': 2,
  'full': 3
};

export const getPrivacyLevel = (level) => {
  return PRIVACY_LEVELS[level] || PRIVACY_LEVELS.basic;
};

/**
 * Convert Parse objects to plain objects for export
 */
export const convertParseObjectsToPlain = (data) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    if (!item) return item;
    
    // If it's a Parse object, convert it
    if (item.toJSON && typeof item.toJSON === 'function') {
      return item.toJSON();
    }
    
    // If it's already a plain object, handle nested Parse objects
    const plainObject = {};
    Object.keys(item).forEach(key => {
      const value = item[key];
      
      if (value && value.toJSON && typeof value.toJSON === 'function') {
        plainObject[key] = value.toJSON();
      } else if (value && value.get && typeof value.get === 'function') {
        // Handle Parse pointers that haven't been fully loaded
        plainObject[key] = {
          id: value.id,
          className: value.className,
          ...Object.keys(value.attributes || {}).reduce((acc, attr) => {
            acc[attr] = value.get(attr);
            return acc;
          }, {})
        };
      } else {
        plainObject[key] = value;
      }
    });
    
    return plainObject;
  });
};

/**
 * Generate export metadata
 */
export const generateExportMetadata = (template, recordCount, privacyLevel) => {
  return {
    exportDate: new Date().toISOString(),
    recordsExported: recordCount,
    privacyLevel: privacyLevel,
    templateUsed: template.name,
    templateId: template.id,
    generatedBy: 'PsyPsy CMS',
    version: '1.0.0'
  };
};

/**
 * Validate export configuration
 */
export const validateExportConfig = (data, template, options = {}) => {
  const errors = [];
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
  }
  
  if (!template || !template.fields || !Array.isArray(template.fields)) {
    errors.push('Invalid template structure');
  }
  
  if (template.fields && template.fields.length === 0) {
    errors.push('Template must have at least one field');
  }
  
  if (options.privacyLevel && !PRIVACY_LEVELS[options.privacyLevel]) {
    errors.push('Invalid privacy level');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Estimate export file size
 */
export const estimateExportSize = (data, template, format = 'csv') => {
  if (!Array.isArray(data) || data.length === 0) return 0;
  
  const sampleRow = data[0];
  const avgFieldSize = 50; // Average field size in characters
  const fieldCount = template.fields.length;
  
  let estimatedSize = data.length * fieldCount * avgFieldSize;
  
  // Format-specific overhead
  if (format === 'xlsx') {
    estimatedSize *= 1.5; // Excel overhead
  } else {
    estimatedSize *= 1.1; // CSV overhead
  }
  
  return Math.round(estimatedSize);
};

/**
 * Chunk data for processing
 */
export const chunkData = (data, chunkSize = 100) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

export default {
  transformDataForExport,
  getNestedValue,
  convertParseObjectsToPlain,
  generateExportMetadata,
  validateExportConfig,
  estimateExportSize,
  chunkData,
  getPrivacyLevel
};