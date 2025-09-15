/**
 * Custom Form Validation Hook
 * Provides form validation logic with Zod schemas and Parse Server integration
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormValidationManager, FieldValidator } from '../utils/formValidation';
import { ParseValidationIntegrator, ParseFormSubmitter } from '../utils/parseValidation';

/**
 * Main form validation hook
 */
export const useFormValidation = (schema, options = {}) => {
  const { t } = useTranslation();
  const {
    initialValues = {},
    enableRealTimeValidation = true,
    enableParseValidation = false,
    parseClassName = null,
    onSubmit = () => {},
    onSuccess = () => {},
    onError = () => {},
    validateOnMount = false,
    debounceMs = 300,
  } = options;

  // Form state
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [isValid, setIsValid] = useState(false);

  // Validation managers
  const validationManager = useRef(new FormValidationManager(schema, t));
  const fieldValidator = useRef(new FieldValidator(schema, t, debounceMs));
  const parseIntegrator = useRef(enableParseValidation ? new ParseValidationIntegrator(t) : null);
  const parseSubmitter = useRef(enableParseValidation ? new ParseFormSubmitter(t) : null);

  // Update validation manager when schema changes
  useEffect(() => {
    validationManager.current = new FormValidationManager(schema, t);
    fieldValidator.current = new FieldValidator(schema, t, debounceMs);
  }, [schema, t, debounceMs]);

  // Initial validation
  useEffect(() => {
    if (validateOnMount && Object.keys(values).length > 0) {
      const isFormValid = validationManager.current.validateForm(values);
      setIsValid(isFormValid);
    }
  }, [validateOnMount]);

  // Cleanup field validator on unmount
  useEffect(() => {
    return () => {
      fieldValidator.current.cleanup();
    };
  }, []);

  /**
   * Handle field value changes
   */
  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Real-time validation
    if (enableRealTimeValidation) {
      fieldValidator.current.validate(fieldName, value, (error) => {
        if (error) {
          validationManager.current.errors[fieldName] = error;
        } else {
          delete validationManager.current.errors[fieldName];
        }
        setIsValid(!validationManager.current.hasErrors());
      });
    }
  }, [enableRealTimeValidation]);

  /**
   * Handle field blur events
   */
  const handleBlur = useCallback((fieldName) => {
    validationManager.current.touchField(fieldName);
    
    // Validate field on blur
    const error = validationManager.current.validateField(fieldName, values[fieldName], values);
    setIsValid(!validationManager.current.hasErrors());
  }, [values]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    setSubmitCount(prev => prev + 1);
    setIsSubmitting(true);

    try {
      // Validate entire form
      const isFormValid = validationManager.current.validateForm(values);
      
      // Mark all fields as touched to show errors
      Object.keys(values).forEach(fieldName => {
        validationManager.current.touchField(fieldName);
      });

      if (!isFormValid) {
        setIsValid(false);
        throw new Error('Form validation failed');
      }

      // Parse Server validation if enabled
      if (enableParseValidation && parseClassName && parseIntegrator.current) {
        const parseValidation = await parseIntegrator.current.validateFormData(parseClassName, values);
        if (!parseValidation.isValid) {
          // Merge Parse Server errors with form errors
          Object.entries(parseValidation.errors).forEach(([fieldName, error]) => {
            validationManager.current.errors[fieldName] = error;
          });
          setIsValid(false);
          throw new Error('Parse Server validation failed');
        }
      }

      // Call onSubmit handler
      const result = await onSubmit(values, {
        isValid: true,
        errors: {},
        touched: Array.from(validationManager.current.touched),
      });

      await onSuccess(result, values);
      
    } catch (error) {
      await onError(error, {
        isValid: validationManager.current.hasErrors(),
        errors: validationManager.current.getAllErrors(),
        touched: Array.from(validationManager.current.touched),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, onSuccess, onError, enableParseValidation, parseClassName]);

  /**
   * Reset form to initial values
   */
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    validationManager.current.clearErrors();
    setIsSubmitting(false);
    setSubmitCount(0);
    setIsValid(false);
  }, [initialValues]);

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((fieldName, value) => {
    handleChange(fieldName, value);
  }, [handleChange]);

  /**
   * Set multiple field values
   */
  const setFieldValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  /**
   * Get field props for form controls
   */
  const getFieldProps = useCallback((fieldName) => {
    const error = validationManager.current.getFieldError(fieldName);
    const touched = validationManager.current.isFieldTouched(fieldName);

    return {
      name: fieldName,
      value: values[fieldName] || '',
      onChange: (event) => {
        const value = event.target ? event.target.value : event;
        handleChange(fieldName, value);
      },
      onBlur: () => handleBlur(fieldName),
      error: touched && !!error,
      helperText: touched ? error : '',
    };
  }, [values, handleChange, handleBlur]);

  /**
   * Get form state
   */
  const formState = {
    values,
    errors: validationManager.current.getAllErrors(),
    touched: Array.from(validationManager.current.touched),
    isSubmitting,
    isValid: isValid && !validationManager.current.hasErrors(),
    submitCount,
    canSubmit: isValid && !isSubmitting && !validationManager.current.hasErrors(),
  };

  return {
    // Values and state
    values,
    errors: validationManager.current.getAllErrors(),
    touched: Array.from(validationManager.current.touched),
    isSubmitting,
    isValid: formState.isValid,
    canSubmit: formState.canSubmit,
    submitCount,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldValues,

    // Utilities
    getFieldProps,
    getFieldError: (fieldName) => validationManager.current.getFieldError(fieldName),
    isFieldTouched: (fieldName) => validationManager.current.isFieldTouched(fieldName),
    validateField: (fieldName) => validationManager.current.validateField(fieldName, values[fieldName], values),
    validateForm: () => validationManager.current.validateForm(values),

    // Form state object
    formState,
  };
};

/**
 * Hook for Parse Server form operations
 */
export const useParseForm = (schema, parseClassName, options = {}) => {
  const { t } = useTranslation();
  const baseFormHook = useFormValidation(schema, {
    ...options,
    enableParseValidation: true,
    parseClassName,
  });

  const parseSubmitter = useRef(new ParseFormSubmitter(t));

  /**
   * Submit to Parse Server
   */
  const submitToParse = useCallback(async (transformData = (data) => data) => {
    try {
      const result = await parseSubmitter.current.submit(parseClassName, baseFormHook.values, {
        validateBeforeSubmit: true,
        transformData,
        onSuccess: options.onSuccess,
        onError: options.onError,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }, [parseClassName, baseFormHook.values, options.onSuccess, options.onError]);

  /**
   * Submit user registration
   */
  const submitUserRegistration = useCallback(async (profileData = null) => {
    try {
      const result = await parseSubmitter.current.submitUserRegistration(
        baseFormHook.values,
        profileData
      );
      return result;
    } catch (error) {
      throw error;
    }
  }, [baseFormHook.values]);

  /**
   * Submit login
   */
  const submitLogin = useCallback(async () => {
    try {
      const { username, password, rememberMe } = baseFormHook.values;
      const result = await parseSubmitter.current.submitLogin(username, password, rememberMe);
      return result;
    } catch (error) {
      throw error;
    }
  }, [baseFormHook.values]);

  return {
    ...baseFormHook,
    
    // Parse-specific methods
    submitToParse,
    submitUserRegistration,
    submitLogin,
  };
};

/**
 * Hook for multi-step forms
 */
export const useMultiStepForm = (steps, schema, options = {}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const formHook = useFormValidation(schema, {
    ...options,
    initialValues: stepData[currentStep] || {},
  });

  /**
   * Go to next step
   */
  const nextStep = useCallback(async () => {
    // Validate current step
    const currentStepSchema = steps[currentStep]?.schema;
    if (currentStepSchema) {
      const manager = new FormValidationManager(currentStepSchema, formHook.t);
      const isValid = manager.validateForm(formHook.values);
      
      if (!isValid) {
        return false;
      }
    }

    // Save current step data
    setStepData(prev => ({
      ...prev,
      [currentStep]: formHook.values,
    }));

    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, currentStep]));

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return true;
    }

    return false;
  }, [currentStep, steps, formHook.values]);

  /**
   * Go to previous step
   */
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      // Save current step data
      setStepData(prev => ({
        ...prev,
        [currentStep]: formHook.values,
      }));

      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, formHook.values]);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      // Save current step data
      setStepData(prev => ({
        ...prev,
        [currentStep]: formHook.values,
      }));

      setCurrentStep(stepIndex);
    }
  }, [currentStep, steps.length, formHook.values]);

  /**
   * Get all form data from all steps
   */
  const getAllStepData = useCallback(() => {
    const allData = { ...stepData };
    allData[currentStep] = formHook.values;
    
    return Object.values(allData).reduce((acc, data) => ({
      ...acc,
      ...data,
    }), {});
  }, [stepData, currentStep, formHook.values]);

  /**
   * Submit all step data
   */
  const submitAllSteps = useCallback(async () => {
    const allData = getAllStepData();
    
    // Validate all data against the complete schema
    const manager = new FormValidationManager(schema, formHook.t);
    const isValid = manager.validateForm(allData);
    
    if (!isValid) {
      throw new Error('Multi-step form validation failed');
    }

    return await options.onSubmit?.(allData) || allData;
  }, [getAllStepData, schema, options.onSubmit]);

  return {
    ...formHook,

    // Multi-step specific
    currentStep,
    steps,
    stepData: stepData[currentStep] || {},
    completedSteps: Array.from(completedSteps),
    
    // Navigation
    nextStep,
    previousStep,
    goToStep,
    
    // Data
    getAllStepData,
    submitAllSteps,
    
    // State
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    canGoNext: !completedSteps.has(currentStep) || formHook.isValid,
    canGoPrevious: currentStep > 0,
    isComplete: completedSteps.size === steps.length,
  };
};

export default useFormValidation;