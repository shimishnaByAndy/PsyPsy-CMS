/**
 * Parse Server Form Integration Hook
 * Specialized hook for Parse Server operations with form validation
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Parse from 'parse';
import { useFormValidation } from './useFormValidation';
import { ParseFormSubmitter, ParseValidationIntegrator } from '../utils/parseValidation';

/**
 * Hook for Parse Server authentication forms
 */
export const useParseAuthForm = (schema, options = {}) => {
  const { t } = useTranslation();
  const {
    onLoginSuccess = () => {},
    onLoginError = () => {},
    onRegistrationSuccess = () => {},
    onRegistrationError = () => {},
    ...formOptions
  } = options;

  const formHook = useFormValidation(schema, {
    ...formOptions,
    enableParseValidation: false, // We'll handle Parse validation manually for auth
  });

  /**
   * Handle login submission
   */
  const login = useCallback(async () => {
    try {
      formHook.setIsSubmitting?.(true);
      
      const { username, password, rememberMe } = formHook.values;
      
      // Validate form first
      if (!formHook.isValid) {
        throw new Error('Form validation failed');
      }

      // Attempt Parse Server login
      const user = await Parse.User.logIn(username, password);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('lastLoginUsername', username);
      } else {
        localStorage.removeItem('lastLoginUsername');
      }

      await onLoginSuccess(user, formHook.values);
      
      return { success: true, user };
    } catch (error) {
      // Map Parse Server errors to form errors
      if (error.code === 101) {
        formHook.setFieldError?.('password', t('auth.errors.invalidCredentials'));
      } else if (error.code === 209) {
        formHook.setError?.(t('auth.errors.sessionExpired'));
      } else {
        formHook.setError?.(error.message || t('common.errors.unexpected'));
      }

      await onLoginError(error, formHook.formState);
      throw { success: false, error };
    } finally {
      formHook.setIsSubmitting?.(false);
    }
  }, [formHook.values, formHook.isValid, onLoginSuccess, onLoginError, t]);

  /**
   * Handle user registration
   */
  const register = useCallback(async (profileData = null) => {
    try {
      formHook.setIsSubmitting?.(true);
      
      const { username, email, password, userType } = formHook.values;
      
      // Validate form first
      if (!formHook.isValid) {
        throw new Error('Form validation failed');
      }

      // Create Parse User
      const user = new Parse.User();
      user.set('username', username);
      user.set('email', email);
      user.set('password', password);
      user.set('userType', userType);

      // Sign up user
      const savedUser = await user.signUp();

      // Create associated profile if provided
      let profile = null;
      if (profileData) {
        const ProfileClass = userType === 1 ? 'Professional' : 'Client';
        const ProfileObject = Parse.Object.extend(ProfileClass);
        profile = new ProfileObject();
        profile.set('userPtr', savedUser);
        
        Object.entries(profileData).forEach(([key, value]) => {
          profile.set(key, value);
        });
        
        await profile.save();
      }

      await onRegistrationSuccess({ user: savedUser, profile }, formHook.values);
      
      return { success: true, user: savedUser, profile };
    } catch (error) {
      // Map Parse Server errors to form errors
      if (error.code === 202) {
        formHook.setFieldError?.('username', t('auth.errors.usernameTaken'));
      } else if (error.code === 203) {
        formHook.setFieldError?.('email', t('auth.errors.emailTaken'));
      } else {
        formHook.setError?.(error.message || t('common.errors.unexpected'));
      }

      await onRegistrationError(error, formHook.formState);
      throw { success: false, error };
    } finally {
      formHook.setIsSubmitting?.(false);
    }
  }, [formHook.values, formHook.isValid, onRegistrationSuccess, onRegistrationError, t]);

  /**
   * Handle password reset
   */
  const resetPassword = useCallback(async () => {
    try {
      formHook.setIsSubmitting?.(true);
      
      const { email } = formHook.values;
      
      if (!email) {
        throw new Error('Email is required');
      }

      await Parse.User.requestPasswordReset(email);
      
      return { success: true, message: t('auth.messages.passwordResetSent') };
    } catch (error) {
      if (error.code === 205) {
        formHook.setFieldError?.('email', t('auth.errors.emailNotFound'));
      } else {
        formHook.setError?.(error.message || t('common.errors.unexpected'));
      }
      
      throw { success: false, error };
    } finally {
      formHook.setIsSubmitting?.(false);
    }
  }, [formHook.values, t]);

  return {
    ...formHook,
    
    // Auth-specific methods
    login,
    register,
    resetPassword,
  };
};

/**
 * Hook for Parse Server CRUD forms
 */
export const useParseCRUDForm = (schema, className, options = {}) => {
  const { t } = useTranslation();
  const {
    objectId = null,
    onSaveSuccess = () => {},
    onSaveError = () => {},
    onDeleteSuccess = () => {},
    onDeleteError = () => {},
    transformData = (data) => data,
    ...formOptions
  } = options;

  const formHook = useFormValidation(schema, {
    ...formOptions,
    enableParseValidation: true,
    parseClassName: className,
  });

  /**
   * Save object to Parse Server
   */
  const save = useCallback(async (additionalData = {}) => {
    try {
      formHook.setIsSubmitting?.(true);
      
      // Validate form first
      if (!formHook.isValid) {
        throw new Error('Form validation failed');
      }

      const data = { ...formHook.values, ...additionalData };
      const transformedData = transformData(data);

      // Create or update Parse object
      const ParseClass = Parse.Object.extend(className);
      const parseObject = objectId ? new ParseClass() : new ParseClass();
      
      if (objectId) {
        parseObject.set('objectId', objectId);
      }

      // Set all form data
      Object.entries(transformedData).forEach(([key, value]) => {
        parseObject.set(key, value);
      });

      // Save to Parse Server
      const savedObject = await parseObject.save();
      
      await onSaveSuccess(savedObject, data);
      
      return { success: true, object: savedObject };
    } catch (error) {
      await onSaveError(error, formHook.formState);
      throw { success: false, error };
    } finally {
      formHook.setIsSubmitting?.(false);
    }
  }, [formHook.values, formHook.isValid, className, objectId, transformData, onSaveSuccess, onSaveError]);

  /**
   * Delete object from Parse Server
   */
  const deleteObject = useCallback(async () => {
    if (!objectId) {
      throw new Error('Object ID is required for deletion');
    }

    try {
      formHook.setIsSubmitting?.(true);
      
      const ParseClass = Parse.Object.extend(className);
      const parseObject = new ParseClass();
      parseObject.set('objectId', objectId);
      
      await parseObject.destroy();
      
      await onDeleteSuccess(objectId);
      
      return { success: true, objectId };
    } catch (error) {
      await onDeleteError(error, formHook.formState);
      throw { success: false, error };
    } finally {
      formHook.setIsSubmitting?.(false);
    }
  }, [objectId, className, onDeleteSuccess, onDeleteError]);

  /**
   * Load object from Parse Server
   */
  const load = useCallback(async (id = objectId) => {
    if (!id) {
      throw new Error('Object ID is required for loading');
    }

    try {
      const ParseClass = Parse.Object.extend(className);
      const query = new Parse.Query(ParseClass);
      const object = await query.get(id);
      
      // Convert Parse object to plain object
      const data = {};
      Object.keys(object.attributes).forEach(key => {
        data[key] = object.get(key);
      });

      // Set form values
      formHook.setValues(data);
      
      return { success: true, object, data };
    } catch (error) {
      throw { success: false, error };
    }
  }, [objectId, className]);

  return {
    ...formHook,
    
    // CRUD-specific methods
    save,
    delete: deleteObject,
    load,
    
    // State
    isEditing: !!objectId,
    isCreating: !objectId,
  };
};

/**
 * Hook for Parse Server query forms (search, filter, etc.)
 */
export const useParseQueryForm = (className, options = {}) => {
  const { t } = useTranslation();
  const {
    defaultQuery = {},
    onSearchSuccess = () => {},
    onSearchError = () => {},
    includeFields = [],
    limit = 100,
    ...formOptions
  } = options;

  const formHook = useFormValidation(null, {
    ...formOptions,
    initialValues: defaultQuery,
  });

  /**
   * Execute search query
   */
  const search = useCallback(async (additionalConstraints = {}) => {
    try {
      formHook.setIsSubmitting?.(true);
      
      const ParseClass = Parse.Object.extend(className);
      const query = new Parse.Query(ParseClass);
      
      // Apply form values as query constraints
      Object.entries(formHook.values).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'string') {
            // Text search - case insensitive
            query.matches(key, new RegExp(value, 'i'));
          } else {
            query.equalTo(key, value);
          }
        }
      });

      // Apply additional constraints
      Object.entries(additionalConstraints).forEach(([key, value]) => {
        query.equalTo(key, value);
      });

      // Include related fields
      includeFields.forEach(field => {
        query.include(field);
      });

      // Set limit
      query.limit(limit);

      // Execute query
      const results = await query.find();
      
      await onSearchSuccess(results, formHook.values);
      
      return { success: true, results };
    } catch (error) {
      await onSearchError(error, formHook.formState);
      throw { success: false, error };
    } finally {
      formHook.setIsSubmitting?.(false);
    }
  }, [formHook.values, className, includeFields, limit, onSearchSuccess, onSearchError]);

  /**
   * Clear search form
   */
  const clearSearch = useCallback(() => {
    formHook.reset(defaultQuery);
  }, [defaultQuery]);

  return {
    ...formHook,
    
    // Query-specific methods
    search,
    clearSearch,
  };
};

export default {
  useParseAuthForm,
  useParseCRUDForm,
  useParseQueryForm,
};