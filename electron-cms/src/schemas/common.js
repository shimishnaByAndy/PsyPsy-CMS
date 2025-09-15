/**
 * Common Validation Schemas and Utilities
 * Reusable validation patterns and schema composition utilities
 */

import { z } from 'zod';

// Canadian postal code validation
export const canadianPostalCodeSchema = z.string()
  .regex(/^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$/, { 
    message: "common.validation.postalCode.format" 
  });

// Canadian phone number validation
export const canadianPhoneSchema = z.string()
  .regex(/^\+1[0-9]{10}$/, { 
    message: "common.validation.phone.format" 
  });

// International phone number validation (more flexible)
export const internationalPhoneSchema = z.string()
  .regex(/^\+[1-9]\d{1,14}$/, { 
    message: "common.validation.phone.international.format" 
  });

// Email validation with common domain checking
export const emailSchema = z.string()
  .email({ message: "common.validation.email.format" })
  .max(100, { message: "common.validation.email.maxLength" })
  .refine((email) => {
    // Additional validation for suspicious domains
    const suspiciousDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.info'];
    const domain = email.split('@')[1]?.toLowerCase();
    return !suspiciousDomains.includes(domain);
  }, { message: "common.validation.email.suspicious" });

// Strong password validation
export const strongPasswordSchema = z.string()
  .min(8, { message: "common.validation.password.minLength" })
  .max(50, { message: "common.validation.password.maxLength" })
  .regex(/^(?=.*[a-z])/, { message: "common.validation.password.lowercase" })
  .regex(/^(?=.*[A-Z])/, { message: "common.validation.password.uppercase" })
  .regex(/^(?=.*\d)/, { message: "common.validation.password.number" })
  .regex(/^(?=.*[@$!%*?&])/, { message: "common.validation.password.special" });

// Basic password validation (less strict)
export const basicPasswordSchema = z.string()
  .min(6, { message: "common.validation.password.minLength" })
  .max(50, { message: "common.validation.password.maxLength" });

// Date of birth validation with age checking
export const dateOfBirthSchema = (minAge = 16, maxAge = 120) => z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "common.validation.dateOfBirth.format" })
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      return false;
    }
    
    // Check if date is not in the future
    if (birthDate > today) {
      return false;
    }
    
    // Calculate age
    const age = today.getFullYear() - birthDate.getFullYear() - 
      (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
    
    return age >= minAge && age <= maxAge;
  }, { 
    message: `common.validation.dateOfBirth.age`,
    params: { minAge, maxAge }
  });

// Name validation (supports international characters)
export const nameSchema = z.string()
  .min(1, { message: "common.validation.name.required" })
  .max(50, { message: "common.validation.name.maxLength" })
  .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/, { 
    message: "common.validation.name.format" 
  });

// URL validation with protocol requirement
export const urlSchema = z.string()
  .url({ message: "common.validation.url.format" })
  .regex(/^https?:\/\//, { message: "common.validation.url.protocol" });

// Optional URL validation
export const optionalUrlSchema = z.union([
  z.literal(''),
  urlSchema
]);

// File upload validation
export const fileSchema = z.object({
  name: z.string().min(1, { message: "common.validation.file.name.required" }),
  type: z.string().min(1, { message: "common.validation.file.type.required" }),
  size: z.number().max(5 * 1024 * 1024, { message: "common.validation.file.size.max" }), // 5MB max
  url: z.string().url({ message: "common.validation.file.url.format" }),
});

// Address validation schema
export const addressSchema = z.object({
  street: z.string()
    .min(1, { message: "common.validation.address.street.required" })
    .max(100, { message: "common.validation.address.street.maxLength" }),
  city: z.string()
    .min(1, { message: "common.validation.address.city.required" })
    .max(50, { message: "common.validation.address.city.maxLength" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "common.validation.address.city.format" }),
  province: z.string()
    .min(1, { message: "common.validation.address.province.required" }),
  postalCode: canadianPostalCodeSchema,
  country: z.string().default('Canada'),
  apartment: z.string()
    .max(20, { message: "common.validation.address.apartment.maxLength" })
    .optional(),
});

// Language array validation
export const languagesSchema = z.array(z.string())
  .min(1, { message: "common.validation.languages.required" })
  .refine((languages) => {
    const validLanguages = ['English', 'French', 'Spanish', 'Mandarin', 'Cantonese', 'Arabic', 'Other'];
    return languages.every(lang => validLanguages.includes(lang) || lang.startsWith('Other:'));
  }, { message: "common.validation.languages.invalid" });

// Gender validation
export const genderSchema = z.enum([1, 2, 3, 4], { 
  message: "common.validation.gender.required" 
}); // 1: Woman, 2: Man, 3: Other, 4: Prefer not to say

// Professional services validation
export const servicesSchema = z.array(z.enum([
  'Individual Therapy',
  'Group Therapy',
  'Couples Therapy', 
  'Family Therapy',
  'Psychological Assessment',
  'Neuropsychological Assessment',
  'Career Counseling',
  'Addiction Counseling'
])).min(1, { message: "common.validation.services.required" });

// Meeting type validation
export const meetingTypeSchema = z.enum(['online', 'in-person', 'both'], {
  message: "common.validation.meetingType.required"
});

// Utility functions for schema composition

/**
 * Create a conditional schema that applies validation only when a condition is met
 */
export const conditionalSchema = (condition, schema, fallback = z.any()) => 
  z.union([
    schema.refine(condition),
    fallback
  ]);

/**
 * Create an optional field that can be empty string or valid value
 */
export const optionalField = (schema) => z.union([
  z.literal(''),
  schema
]);

/**
 * Transform Parse Server error codes to validation errors
 */
export const parseErrorToZodError = (error) => {
  const errorMap = {
    101: { path: ['password'], message: 'auth.validation.credentials.invalid' },
    202: { path: ['username'], message: 'auth.validation.username.taken' },
    203: { path: ['email'], message: 'auth.validation.email.taken' },
    205: { path: ['email'], message: 'auth.validation.email.notFound' },
  };

  if (error.code && errorMap[error.code]) {
    return errorMap[error.code];
  }

  return { path: [], message: 'common.validation.server.error' };
};

/**
 * Validate form data against schema and return formatted errors
 */
export const validateWithSchema = (schema, data, t) => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    errors[path] = t ? t(error.message) : error.message;
  });

  return { success: false, errors };
};

/**
 * Format validation errors for Material-UI form components
 */
export const formatErrorsForUI = (errors, fieldPaths = []) => {
  const formattedErrors = {};
  
  fieldPaths.forEach((path) => {
    if (errors[path]) {
      formattedErrors[path] = {
        error: true,
        helperText: errors[path]
      };
    }
  });

  return formattedErrors;
};