/**
 * Form Validation Utilities
 * Helper functions for form validation and error handling
 */

import { validateWithSchema, formatErrorsForUI, parseErrorToZodError } from '../schemas/common';

/**
 * Real-time field validation with debouncing
 */
export class FieldValidator {
  constructor(schema, t, debounceMs = 300) {
    this.schema = schema;
    this.t = t;
    this.debounceMs = debounceMs;
    this.timeouts = new Map();
  }

  validate(fieldName, value, callback) {
    // Clear existing timeout
    if (this.timeouts.has(fieldName)) {
      clearTimeout(this.timeouts.get(fieldName));
    }

    // Set new timeout for debounced validation
    const timeout = setTimeout(() => {
      try {
        // Create a partial object with just this field
        const fieldSchema = this.schema.pick({ [fieldName]: true });
        const result = validateWithSchema(fieldSchema, { [fieldName]: value }, this.t);
        
        if (result.success) {
          callback(null);
        } else {
          callback(result.errors[fieldName] || null);
        }
      } catch (error) {
        callback(this.t('common.validation.error.unexpected'));
      }
    }, this.debounceMs);

    this.timeouts.set(fieldName, timeout);
  }

  cleanup() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

/**
 * Form validation manager for complex forms
 */
export class FormValidationManager {
  constructor(schema, t) {
    this.schema = schema;
    this.t = t;
    this.errors = {};
    this.touched = new Set();
    this.isSubmitting = false;
  }

  /**
   * Validate entire form
   */
  validateForm(data) {
    const result = validateWithSchema(this.schema, data, this.t);
    this.errors = result.errors || {};
    return result.success;
  }

  /**
   * Validate single field
   */
  validateField(fieldName, value, data = {}) {
    try {
      const fieldData = { ...data, [fieldName]: value };
      const result = validateWithSchema(this.schema, fieldData, this.t);
      
      if (result.success || !result.errors[fieldName]) {
        delete this.errors[fieldName];
        return null;
      } else {
        this.errors[fieldName] = result.errors[fieldName];
        return result.errors[fieldName];
      }
    } catch (error) {
      const errorMessage = this.t('common.validation.error.unexpected');
      this.errors[fieldName] = errorMessage;
      return errorMessage;
    }
  }

  /**
   * Mark field as touched
   */
  touchField(fieldName) {
    this.touched.add(fieldName);
  }

  /**
   * Check if field has been touched
   */
  isFieldTouched(fieldName) {
    return this.touched.has(fieldName);
  }

  /**
   * Get error for specific field
   */
  getFieldError(fieldName) {
    return this.isFieldTouched(fieldName) ? this.errors[fieldName] : null;
  }

  /**
   * Get all errors
   */
  getAllErrors() {
    return this.errors;
  }

  /**
   * Check if form has any errors
   */
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = {};
    this.touched.clear();
  }

  /**
   * Clear specific field error
   */
  clearFieldError(fieldName) {
    delete this.errors[fieldName];
    this.touched.delete(fieldName);
  }

  /**
   * Set submission state
   */
  setSubmitting(isSubmitting) {
    this.isSubmitting = isSubmitting;
  }

  /**
   * Get submission state
   */
  isSubmittingForm() {
    return this.isSubmitting;
  }

  /**
   * Get form state summary
   */
  getFormState() {
    return {
      errors: this.errors,
      touched: Array.from(this.touched),
      hasErrors: this.hasErrors(),
      isSubmitting: this.isSubmitting,
      isValid: !this.hasErrors(),
    };
  }
}

/**
 * Password strength calculator
 */
export const calculatePasswordStrength = (password) => {
  let strength = 0;
  const feedback = [];

  if (!password) {
    return { strength: 0, feedback: ['Password is required'], color: 'error' };
  }

  // Length check
  if (password.length >= 8) {
    strength += 20;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    strength += 20;
  } else {
    feedback.push('Include lowercase letters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    strength += 20;
  } else {
    feedback.push('Include uppercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    strength += 20;
  } else {
    feedback.push('Include numbers');
  }

  // Special character check
  if (/[@$!%*?&]/.test(password)) {
    strength += 20;
  } else {
    feedback.push('Include special characters (@$!%*?&)');
  }

  // Determine color and label
  let color, label;
  if (strength >= 80) {
    color = 'success';
    label = 'Strong';
  } else if (strength >= 60) {
    color = 'info';
    label = 'Good';
  } else if (strength >= 40) {
    color = 'warning';
    label = 'Fair';
  } else {
    color = 'error';
    label = 'Weak';
  }

  return { strength, feedback, color, label };
};

/**
 * Canadian postal code formatter
 */
export const formatPostalCode = (value) => {
  // Remove all non-alphanumeric characters
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Format as A1A 1A1
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  } else {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
  }
};

/**
 * Canadian phone number formatter
 */
export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // Handle different input formats
  if (cleaned.startsWith('+1')) {
    const digits = cleaned.slice(2);
    if (digits.length <= 3) {
      return `+1 (${digits}`;
    } else if (digits.length <= 6) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  } else if (cleaned.startsWith('1') && cleaned.length === 11) {
    const digits = cleaned.slice(1);
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  } else if (cleaned.length === 10) {
    return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
  
  return value;
};

/**
 * Parse phone number to standard format
 */
export const parsePhoneNumber = (formattedValue) => {
  const digits = formattedValue.replace(/[^\d]/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return formattedValue;
};

/**
 * Email domain validation
 */
export const validateEmailDomain = async (email) => {
  const domain = email.split('@')[1];
  if (!domain) return false;

  // Check against common disposable email domains
  const disposableDomains = [
    'tempmail.org', '10minutemail.com', 'guerrillamail.info',
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ];

  return !disposableDomains.includes(domain.toLowerCase());
};

/**
 * File validation utilities
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxFiles = 1
  } = options;

  const errors = [];

  if (!file) {
    errors.push('File is required');
    return { valid: false, errors };
  }

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Multi-step form navigation utilities
 */
export class MultiStepFormManager {
  constructor(steps, schema) {
    this.steps = steps;
    this.schema = schema;
    this.currentStep = 0;
    this.stepData = {};
    this.completedSteps = new Set();
  }

  /**
   * Move to next step
   */
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.completedSteps.add(this.currentStep);
      this.currentStep += 1;
    }
  }

  /**
   * Move to previous step
   */
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
    }
  }

  /**
   * Go to specific step
   */
  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStep = stepIndex;
    }
  }

  /**
   * Validate current step
   */
  validateCurrentStep(data) {
    const step = this.steps[this.currentStep];
    if (step.schema) {
      const result = validateWithSchema(step.schema, data);
      return result.success;
    }
    return true;
  }

  /**
   * Save step data
   */
  saveStepData(data) {
    this.stepData[this.currentStep] = data;
  }

  /**
   * Get all form data
   */
  getAllData() {
    return Object.values(this.stepData).reduce((acc, stepData) => ({
      ...acc,
      ...stepData
    }), {});
  }

  /**
   * Check if form is complete
   */
  isComplete() {
    return this.completedSteps.size === this.steps.length - 1 && 
           this.currentStep === this.steps.length - 1;
  }

  /**
   * Get current step info
   */
  getCurrentStep() {
    return {
      index: this.currentStep,
      step: this.steps[this.currentStep],
      isFirst: this.currentStep === 0,
      isLast: this.currentStep === this.steps.length - 1,
      canGoNext: this.completedSteps.has(this.currentStep),
      canGoPrevious: this.currentStep > 0,
    };
  }
}