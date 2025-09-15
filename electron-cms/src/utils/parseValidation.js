/**
 * Parse Server Validation Utilities
 * Integration helpers for Parse Server validation and error handling
 */

import Parse from 'parse';
import { parseErrorToZodError } from '../schemas/common';

/**
 * Parse Server error codes and their meanings
 */
export const PARSE_ERROR_CODES = {
  // Authentication errors
  101: 'INVALID_LOGIN',
  102: 'INVALID_QUERY',
  103: 'INVALID_CLASS_NAME',
  104: 'MISSING_OBJECT_ID',
  105: 'INVALID_KEY_NAME',
  106: 'INVALID_POINTER',
  107: 'INVALID_JSON',
  108: 'COMMAND_UNAVAILABLE',
  109: 'NOT_INITIALIZED',
  111: 'INCORRECT_TYPE',
  112: 'INVALID_CHANNEL_NAME',
  115: 'PUSH_MISCONFIGURED',
  116: 'OBJECT_NOT_FOUND',
  117: 'INVALID_QUERY_ID',
  119: 'INVALID_SERVER_RESPONSE',
  120: 'INVALID_FILE_NAME',
  121: 'INVALID_ACL',
  122: 'TIMEOUT',
  123: 'INVALID_EMAIL_ADDRESS',
  124: 'MISSING_CONTENT_TYPE',
  125: 'MISSING_CONTENT_LENGTH',
  126: 'INVALID_CONTENT_LENGTH',
  127: 'FILE_SAVE_ERROR',
  128: 'DUPLICATE_VALUE',
  129: 'INVALID_ROLE_NAME',
  130: 'EXCEEDED_QUOTA',
  131: 'SCRIPT_FAILED',
  132: 'VALIDATION_ERROR',
  133: 'INVALID_IMAGE_DATA',
  134: 'UNSAVED_FILE_ERROR',
  135: 'INVALID_PUSH_TIME',
  136: 'FILE_DELETE_ERROR',
  137: 'REQUEST_LIMIT_EXCEEDED',
  138: 'INVALID_EVENT_NAME',
  139: 'USERNAME_MISSING',
  140: 'PASSWORD_MISSING',
  141: 'USERNAME_TAKEN',
  200: 'USERNAME_MISSING',
  201: 'PASSWORD_MISSING',
  202: 'USERNAME_TAKEN',
  203: 'EMAIL_TAKEN',
  204: 'EMAIL_MISSING',
  205: 'EMAIL_NOT_FOUND',
  206: 'SESSION_MISSING',
  207: 'MUST_CREATE_USER_THROUGH_SIGNUP',
  208: 'ACCOUNT_ALREADY_LINKED',
  209: 'INVALID_SESSION_TOKEN',
  210: 'LINKED_ID_MISSING',
  211: 'INVALID_LINKED_SESSION',
  212: 'UNSUPPORTED_SERVICE',
  213: 'AGGREGATE_ERROR',
  214: 'FILE_READ_ERROR',
  215: 'X_DOMAIN_REQUEST',
  216: 'REQUEST_TIMEOUT',
  250: 'INVALID_JSON',
  251: 'OBJECT_NOT_FOUND_FOR_CREATE',
  252: 'OBJECT_NOT_FOUND_FOR_UPDATE',
  253: 'OBJECT_NOT_FOUND_FOR_DELETE',
  300: 'CACHE_MISS',
  301: 'INVALID_NESTED_KEY',
  302: 'INVALID_FILE_NAME',
  303: 'INVALID_ACL',
  304: 'TIMEOUT',
  305: 'INVALID_EMAIL_ADDRESS',
  306: 'INVALID_JSON',
  307: 'COMMAND_UNAVAILABLE',
  308: 'NOT_INITIALIZED',
  309: 'OBJECT_NOT_FOUND',
  310: 'REQUEST_LIMIT_EXCEEDED',
  311: 'DUPLICATE_REQUEST',
};

/**
 * Map Parse Server errors to user-friendly messages
 */
export const parseErrorMessages = {
  101: 'auth.errors.invalidCredentials',
  141: 'auth.errors.usernameTaken', // Old error code
  202: 'auth.errors.usernameTaken',
  203: 'auth.errors.emailTaken',
  204: 'auth.errors.emailMissing',
  205: 'auth.errors.emailNotFound',
  209: 'auth.errors.sessionExpired',
  132: 'form.errors.validationFailed',
  128: 'form.errors.duplicateValue',
  116: 'common.errors.objectNotFound',
  124: 'form.errors.invalidEmail',
  140: 'auth.errors.passwordMissing',
  139: 'auth.errors.usernameMissing',
};

/**
 * Parse Server validation integration class
 */
export class ParseValidationIntegrator {
  constructor(t) {
    this.t = t; // Translation function
    this.validationQueue = new Map();
  }

  /**
   * Validate field against Parse Server rules
   */
  async validateFieldAsync(className, fieldName, value, objectId = null) {
    try {
      // Create a test object for validation
      const TestClass = Parse.Object.extend(className);
      const testObject = objectId ? new TestClass({ objectId }) : new TestClass();
      testObject.set(fieldName, value);

      // Attempt to validate by calling beforeSave (dry run)
      await this.dryRunValidation(testObject, fieldName);
      
      return { valid: true, error: null };
    } catch (error) {
      const mappedError = this.mapParseError(error);
      return { 
        valid: false, 
        error: this.t(mappedError.message) || error.message 
      };
    }
  }

  /**
   * Dry run validation without actually saving
   */
  async dryRunValidation(object, fieldName) {
    // This would need to be implemented based on your Parse Server setup
    // For now, we'll simulate basic validation rules
    
    const value = object.get(fieldName);
    
    // Username validation
    if (fieldName === 'username') {
      if (!value || value.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }
      
      // Check if username is taken
      const User = Parse.User;
      const query = new Parse.Query(User);
      query.equalTo('username', value);
      const existingUser = await query.first();
      
      if (existingUser && existingUser.id !== object.id) {
        const error = new Error('Username is already taken');
        error.code = 202;
        throw error;
      }
    }
    
    // Email validation
    if (fieldName === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
      
      // Check if email is taken
      const User = Parse.User;
      const query = new Parse.Query(User);
      query.equalTo('email', value);
      const existingUser = await query.first();
      
      if (existingUser && existingUser.id !== object.id) {
        const error = new Error('Email is already taken');
        error.code = 203;
        throw error;
      }
    }
    
    // Add more field-specific validations as needed
  }

  /**
   * Map Parse Server error to form error
   */
  mapParseError(error) {
    const errorCode = error.code || 0;
    const messageKey = parseErrorMessages[errorCode] || 'common.errors.unexpected';
    
    // Determine which field the error applies to
    let fieldPath = [];
    if (errorCode === 202 || errorCode === 141 || errorCode === 139) {
      fieldPath = ['username'];
    } else if (errorCode === 203 || errorCode === 204 || errorCode === 124) {
      fieldPath = ['email'];
    } else if (errorCode === 140) {
      fieldPath = ['password'];
    }

    return {
      path: fieldPath,
      message: messageKey,
      originalError: error,
    };
  }

  /**
   * Batch validate multiple fields
   */
  async batchValidate(className, fieldData, objectId = null) {
    const results = {};
    const promises = Object.entries(fieldData).map(async ([fieldName, value]) => {
      const result = await this.validateFieldAsync(className, fieldName, value, objectId);
      results[fieldName] = result;
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Validate form data before submission
   */
  async validateFormData(className, formData, objectId = null) {
    const validationResults = await this.batchValidate(className, formData, objectId);
    
    const errors = {};
    let isValid = true;

    Object.entries(validationResults).forEach(([fieldName, result]) => {
      if (!result.valid) {
        errors[fieldName] = result.error;
        isValid = false;
      }
    });

    return {
      isValid,
      errors,
      results: validationResults,
    };
  }
}

/**
 * Enhanced form submission with Parse Server integration
 */
export class ParseFormSubmitter {
  constructor(t) {
    this.t = t;
    this.validator = new ParseValidationIntegrator(t);
  }

  /**
   * Submit form data to Parse Server with validation
   */
  async submit(className, formData, options = {}) {
    const {
      objectId = null,
      validateBeforeSubmit = true,
      transformData = (data) => data,
      onSuccess = () => {},
      onError = () => {},
    } = options;

    try {
      // Pre-submission validation
      if (validateBeforeSubmit) {
        const validation = await this.validator.validateFormData(className, formData, objectId);
        if (!validation.isValid) {
          throw new ValidationError('Form validation failed', validation.errors);
        }
      }

      // Transform data if needed
      const transformedData = transformData(formData);

      // Create or update Parse object
      const ParseClass = Parse.Object.extend(className);
      const parseObject = objectId ? new ParseClass({ objectId }) : new ParseClass();

      // Set all form data
      Object.entries(transformedData).forEach(([key, value]) => {
        parseObject.set(key, value);
      });

      // Save to Parse Server
      const savedObject = await parseObject.save();
      
      await onSuccess(savedObject, transformedData);
      return { success: true, object: savedObject, data: transformedData };
      
    } catch (error) {
      const mappedError = this.validator.mapParseError(error);
      await onError(error, mappedError);
      
      throw {
        success: false,
        error: mappedError,
        originalError: error,
      };
    }
  }

  /**
   * Submit user registration
   */
  async submitUserRegistration(userData, profileData = null) {
    try {
      // Create Parse User
      const user = new Parse.User();
      user.set('username', userData.username);
      user.set('email', userData.email);
      user.set('password', userData.password);
      user.set('userType', userData.userType);

      // Sign up user
      const savedUser = await user.signUp();

      // Create associated profile if provided
      let profile = null;
      if (profileData && userData.userType === 1) {
        // Professional profile
        const Professional = Parse.Object.extend('Professional');
        profile = new Professional();
        profile.set('userPtr', savedUser);
        
        Object.entries(profileData).forEach(([key, value]) => {
          profile.set(key, value);
        });
        
        await profile.save();
      } else if (profileData && userData.userType === 2) {
        // Client profile
        const Client = Parse.Object.extend('Client');
        profile = new Client();
        profile.set('userPtr', savedUser);
        
        Object.entries(profileData).forEach(([key, value]) => {
          profile.set(key, value);
        });
        
        await profile.save();
      }

      return {
        success: true,
        user: savedUser,
        profile,
      };
      
    } catch (error) {
      const mappedError = this.validator.mapParseError(error);
      throw {
        success: false,
        error: mappedError,
        originalError: error,
      };
    }
  }

  /**
   * Submit login with validation
   */
  async submitLogin(username, password, rememberMe = false) {
    try {
      const user = await Parse.User.logIn(username, password);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('lastLoginUsername', username);
      } else {
        localStorage.removeItem('lastLoginUsername');
      }

      return {
        success: true,
        user,
      };
      
    } catch (error) {
      const mappedError = this.validator.mapParseError(error);
      throw {
        success: false,
        error: mappedError,
        originalError: error,
      };
    }
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Utility functions for Parse Server validation
 */

/**
 * Check if Parse Server is available
 */
export const checkParseServerConnection = async () => {
  try {
    const TestObject = Parse.Object.extend('_Installation');
    const query = new Parse.Query(TestObject);
    query.limit(1);
    await query.find();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get Parse Server validation constraints for a class
 */
export const getClassValidationRules = async (className) => {
  try {
    const schema = await Parse.Schema.get(className);
    return schema.fields;
  } catch (error) {
    console.warn(`Could not fetch schema for class ${className}:`, error);
    return {};
  }
};

/**
 * Sync client-side validation with Parse Server constraints
 */
export const syncValidationRules = async (className, zodSchema) => {
  try {
    const parseRules = await getClassValidationRules(className);
    
    // This would need to be implemented based on your specific needs
    // For now, we'll return the original schema
    return zodSchema;
  } catch (error) {
    console.warn(`Could not sync validation rules for ${className}:`, error);
    return zodSchema;
  }
};