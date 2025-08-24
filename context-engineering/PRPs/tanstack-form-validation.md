name: "TanStack Form Integration - Enhanced Type-Safe Form Validation"
description: |

## Purpose
Implement TanStack Form with Zod validation to enhance form handling throughout PsyPsy CMS, providing type-safe validation, better user experience, and robust error handling for authentication, professional registration, and client onboarding forms.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Replace manual form validation patterns in PsyPsy CMS with TanStack Form + Zod validation system that integrates seamlessly with Material-UI components, provides real-time validation feedback, and maintains consistency with existing Parse Server data models.

## Why
- **Business value**: Improved user experience with immediate validation feedback, reduced server errors
- **Integration**: Seamless integration with existing Material-UI components and Parse Server validation
- **Problems solved**: Manual validation inconsistencies, poor error handling, lack of type safety, complex form state management

## What
A comprehensive form system where:
- Authentication forms (login, registration) use TanStack Form with Zod validation
- Professional registration form has comprehensive validation for credentials and licensing
- Client onboarding forms provide guided validation for personal information
- Form validation mirrors Parse Server validation rules for consistency
- Material-UI integration maintains PsyPsy theme and component patterns

### Success Criteria
- [ ] Login form uses TanStack Form with proper validation
- [ ] Professional registration form has comprehensive field validation
- [ ] Client onboarding form provides guided user experience
- [ ] Validation errors display immediately with Material-UI error states
- [ ] Form submission integrates with Parse Server operations
- [ ] Type safety maintained throughout form handling

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://tanstack.com/form/latest
  why: Core TanStack Form concepts, form state management, validation
  
- url: https://tanstack.com/form/latest/docs/framework/react/guides/validation
  why: Zod integration patterns and validation strategies
  
- url: https://github.com/colinhacks/zod
  why: Zod schema validation library, schema composition patterns
  
- url: https://mui.com/material-ui/react-text-field/
  why: Material-UI TextField integration with custom validation
  
- file: src/layouts/authentication/login/index.js
  why: Current login form implementation, validation patterns, error handling
  
- file: src/components/MDInput/index.js
  why: Material Dashboard input component, custom styling, validation states
  
- file: src/services/parseService.js
  why: Parse Server integration patterns, authentication flow, error handling
  
- file: src/localization/locales/en/translation.json
  why: Current validation message patterns, i18n integration requirements

- docfile: INITIAL.md
  why: TanStack Form examples and validation integration requirements

- file: ClassStructDocs/Professional.md
  why: Professional data validation requirements and field constraints

- file: ClassStructDocs/Client.md  
  why: Client data validation rules and required fields
```

### Current Codebase tree
```bash
src/
├── layouts/authentication/
│   ├── login/index.js           # Current login form with manual validation
│   └── components/
│       ├── BasicLayout/         # Authentication layout wrapper
│       └── CoverLayout/         # Cover page layout for registration
├── components/
│   ├── MDInput/                 # Material Dashboard input component
│   ├── MDButton/                # Material Dashboard button component
│   ├── SimpleErrorMessage/      # Error message display component
│   ├── SimpleSwitch/            # Switch component for forms
│   └── UserTypeSelector.js      # User type selection component
├── services/
│   └── parseService.js          # Parse Server integration and validation
├── localization/
│   └── locales/
│       ├── en/translation.json  # English validation messages
│       └── fr/translation.json  # French validation messages
└── ClassStructDocs/
    ├── Professional.md          # Professional data structure requirements
    ├── Client.md               # Client data structure requirements
    └── User.md                 # User authentication requirements
```

### Desired Codebase tree with files to be added
```bash
src/
├── components/
│   ├── forms/                   # New: Form components with TanStack Form
│   │   ├── TanStackForm/        # Base form component
│   │   │   ├── index.js        # Main form wrapper
│   │   │   ├── FormField.js    # Material-UI integrated field
│   │   │   ├── FormError.js    # Error display component
│   │   │   └── FormSubmit.js   # Submit button with loading states
│   │   ├── LoginForm/           # Enhanced login form
│   │   ├── ProfessionalRegistrationForm/  # Professional registration
│   │   └── ClientOnboardingForm/  # Client onboarding workflow
│   └── fields/                  # Reusable field components
│       ├── TextField/           # Enhanced text field with validation
│       ├── EmailField/          # Email-specific validation field
│       ├── PhoneField/          # Phone number formatting and validation
│       ├── DateField/           # Date picker with validation
│       └── SelectField/         # Select dropdown with validation
├── schemas/                     # Zod validation schemas
│   ├── authSchemas.js          # Authentication validation schemas
│   ├── professionalSchemas.js  # Professional registration schemas
│   ├── clientSchemas.js        # Client onboarding schemas
│   └── common.js               # Common validation patterns
├── hooks/
│   ├── useFormValidation.js    # Custom validation hook
│   └── useParseForm.js         # Parse Server integration hook
├── utils/
│   ├── formValidation.js       # Validation utility functions
│   └── parseValidation.js      # Parse Server validation helpers
└── layouts/authentication/
    ├── login/index.js          # Updated with TanStack Form
    ├── registration/           # New: Registration workflow
    └── onboarding/             # New: Client onboarding workflow
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL: TanStack Form field names must match exactly with accessor patterns
// Use dot notation for nested objects: "clientPtr.firstName"
// Validation schema structure must mirror form data structure

// CRITICAL: Material-UI integration requires custom field adapters
// MDInput doesn't automatically work with TanStack Form field props
// Must create wrapper components that bridge TanStack Form and Material-UI

// CRITICAL: Zod schema validation runs synchronously
// Parse Server validation is asynchronous and happens on submission
// Need both client-side (Zod) and server-side (Parse) validation layers

// CRITICAL: Parse Server error codes need translation to user-friendly messages
// Code 101: Invalid login, Code 202: Username taken, Code 203: Email taken
// Map Parse errors to Zod-compatible error format

// CRITICAL: Form state persistence across route changes
// TanStack Form state is component-scoped, not global
// Use localStorage or context for multi-step form persistence

// CRITICAL: File uploads require special handling
// Parse Server File uploads need different validation patterns
// Handle file validation separately from text field validation
```

## Implementation Blueprint

### Data models and structure

Create Zod schemas that mirror Parse Server validation requirements.
```typescript
// schemas/authSchemas.js - Authentication validation schemas
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string()
    .min(1, { message: "auth.validation.username.required" })
    .min(3, { message: "auth.validation.username.minLength" })
    .max(50, { message: "auth.validation.username.maxLength" }),
  password: z.string()
    .min(1, { message: "auth.validation.password.required" })
    .min(6, { message: "auth.validation.password.minLength" }),
  rememberMe: z.boolean().default(false),
});

export const registrationSchema = z.object({
  username: z.string()
    .min(3, { message: "auth.validation.username.minLength" })
    .max(50, { message: "auth.validation.username.maxLength" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "auth.validation.username.format" }),
  email: z.string()
    .email({ message: "auth.validation.email.format" })
    .max(100, { message: "auth.validation.email.maxLength" }),
  password: z.string()
    .min(6, { message: "auth.validation.password.minLength" })
    .max(50, { message: "auth.validation.password.maxLength" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "auth.validation.password.strength" }),
  confirmPassword: z.string(),
  userType: z.enum([1, 2], { message: "auth.validation.userType.required" }), // 1: Professional, 2: Client
}).refine((data) => data.password === data.confirmPassword, {
  message: "auth.validation.password.mismatch",
  path: ["confirmPassword"],
});

// schemas/professionalSchemas.js - Professional-specific validation
export const professionalProfileSchema = z.object({
  firstName: z.string()
    .min(1, { message: "professional.validation.firstName.required" })
    .max(50, { message: "professional.validation.firstName.maxLength" }),
  lastName: z.string()
    .min(1, { message: "professional.validation.lastName.required" })
    .max(50, { message: "professional.validation.lastName.maxLength" }),
  profType: z.enum(['Psychologist', 'Therapist', 'Counselor'], {
    message: "professional.validation.profType.required"
  }),
  businessName: z.string()
    .max(100, { message: "professional.validation.businessName.maxLength" })
    .optional(),
  licenseNumber: z.string()
    .regex(/^[A-Z0-9]{6,10}$/, { message: "professional.validation.licenseNumber.format" })
    .optional(),
  bussEmail: z.string()
    .email({ message: "professional.validation.businessEmail.format" }),
  bussPhoneNb: z.string()
    .regex(/^\+1[0-9]{10}$/, { message: "professional.validation.phone.format" }),
  servOfferedArr: z.array(z.string()).min(1, { message: "professional.validation.services.required" }),
  offeredLangArr: z.array(z.string()).min(1, { message: "professional.validation.languages.required" }),
  meetType: z.enum(['online', 'in-person', 'both'], {
    message: "professional.validation.meetingType.required"
  }),
  expertises: z.array(z.string()).min(1, { message: "professional.validation.expertises.required" }),
});

export const professionalRegistrationSchema = registrationSchema.merge(
  z.object({
    professionalProfile: professionalProfileSchema,
  })
);
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Install Dependencies and Setup
INSTALL packages:
  - @tanstack/react-form: "latest"
  - @tanstack/zod-form-adapter: "latest" 
  - zod: "^3.22.0"
  - VERIFY: No conflicts with existing validation libraries

Task 2: Create Zod Validation Schemas
CREATE schemas/authSchemas.js:
  - PATTERN: Mirror Parse Server User validation requirements
  - IMPLEMENT: Login, registration, password reset schemas
  - INTEGRATE: i18n message keys for validation errors
  - HANDLE: Parse Server specific validation rules

CREATE schemas/professionalSchemas.js:
  - PATTERN: Based on ClassStructDocs/Professional.md requirements
  - IMPLEMENT: Professional profile validation with licensing requirements
  - VALIDATE: Business email, phone number formatting, credentials
  - HANDLE: Multi-step registration workflow validation

CREATE schemas/clientSchemas.js:
  - PATTERN: Based on ClassStructDocs/Client.md requirements
  - IMPLEMENT: Client profile validation with personal information
  - VALIDATE: Date of birth, phone number, address validation
  - HANDLE: Optional fields and progressive onboarding

CREATE schemas/common.js:
  - PATTERN: Reusable validation patterns and utilities
  - IMPLEMENT: Phone number formatting, postal code validation
  - VALIDATE: Canadian postal codes, phone number formats
  - PROVIDE: Schema composition utilities

Task 3: Create Base Form Components
CREATE components/forms/TanStackForm/index.js:
  - PATTERN: Base form wrapper with TanStack Form and Zod integration
  - IMPLEMENT: Form provider, validation handling, error state management
  - INTEGRATE: Material-UI styling and PsyPsy theme
  - HANDLE: Loading states, submission states, error display

CREATE components/forms/TanStackForm/FormField.js:
  - PATTERN: Bridge between TanStack Form fields and Material-UI components
  - IMPLEMENT: Field wrapper that connects MDInput with form state
  - HANDLE: Real-time validation, error display, field styling
  - INTEGRATE: Material-UI error states and helper text

CREATE components/forms/TanStackForm/FormError.js:
  - PATTERN: Centralized error display component
  - IMPLEMENT: Parse Server error translation to user-friendly messages
  - HANDLE: Field-specific errors and form-level errors
  - INTEGRATE: Material-UI Alert component and PsyPsy error styling

Task 4: Create Enhanced Field Components
CREATE components/fields/TextField/index.js:
  - PATTERN: Enhanced MDInput with built-in validation support
  - IMPLEMENT: TanStack Form field integration
  - HANDLE: Real-time validation, error states, formatting
  - PRESERVE: Existing MDInput styling and behavior

CREATE components/fields/EmailField/index.js:
  - PATTERN: Email-specific validation and formatting
  - IMPLEMENT: Email validation with domain checking
  - HANDLE: Email format validation, duplicate email detection
  - INTEGRATE: Parse Server user email validation

CREATE components/fields/PhoneField/index.js:
  - PATTERN: Canadian phone number formatting and validation
  - IMPLEMENT: Auto-formatting, validation, country code handling
  - HANDLE: Phone number masking, validation feedback
  - INTEGRATE: Canadian phone number standards

Task 5: Create Authentication Forms
MODIFY src/layouts/authentication/login/index.js:
  - REPLACE: Manual form state with TanStack Form
  - IMPLEMENT: loginSchema validation with Zod
  - PRESERVE: Existing styling, layout, social media links
  - INTEGRATE: ParseAuth.loginWithRememberMe with form validation

CREATE layouts/authentication/registration/index.js:
  - PATTERN: Multi-step registration workflow
  - IMPLEMENT: User type selection, basic info, profile completion
  - VALIDATE: Registration schema with password confirmation
  - INTEGRATE: Parse Server user creation with validation

Task 6: Create Professional Registration Form
CREATE components/forms/ProfessionalRegistrationForm/index.js:
  - PATTERN: Multi-step professional registration with credential validation
  - IMPLEMENT: Professional profile schema validation
  - HANDLE: License number validation, business information
  - INTEGRATE: Professional verification workflow

CREATE components/forms/ProfessionalRegistrationForm/steps/:
  - PATTERN: Step-by-step form with progress indication
  - IMPLEMENT: Basic info, professional details, verification documents
  - VALIDATE: Each step independently with schema validation
  - HANDLE: Form persistence across steps

Task 7: Create Client Onboarding Form  
CREATE components/forms/ClientOnboardingForm/index.js:
  - PATTERN: Progressive client information collection
  - IMPLEMENT: Personal information, preferences, goals
  - VALIDATE: Client profile schema with optional fields
  - INTEGRATE: Client profile creation with Parse Server

Task 8: Create Form Integration Hooks
CREATE hooks/useFormValidation.js:
  - PATTERN: Custom hook for form validation logic
  - IMPLEMENT: Schema-based validation with error handling
  - HANDLE: Async validation, server-side validation integration
  - PROVIDE: Validation state management

CREATE hooks/useParseForm.js:
  - PATTERN: Parse Server integration hook for forms
  - IMPLEMENT: Form submission with Parse Server operations
  - HANDLE: Parse Server error mapping to form errors
  - INTEGRATE: Authentication flow with form submission

Task 9: Create Validation Utilities
CREATE utils/formValidation.js:
  - PATTERN: Validation utility functions and helpers
  - IMPLEMENT: Custom validation rules, formatters, parsers
  - HANDLE: Canadian postal codes, phone numbers, business emails
  - PROVIDE: Reusable validation patterns

CREATE utils/parseValidation.js:
  - PATTERN: Parse Server validation integration utilities
  - IMPLEMENT: Error code mapping, validation rule synchronization
  - HANDLE: Parse Server error translation to Zod-compatible format
  - INTEGRATE: Server-side validation with client-side schemas

Task 10: Integration and Testing
TEST all form components:
  - VERIFY: Login form works with TanStack Form validation
  - CHECK: Professional registration completes successfully
  - VALIDATE: Client onboarding provides good user experience
  - CONFIRM: Parse Server integration maintains functionality
  - ENSURE: Material-UI styling consistency maintained
```

### Per task pseudocode

```typescript
// Task 3: Base Form Components
// components/forms/TanStackForm/index.js
import React from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { useTranslation } from 'react-i18next';

// Material-UI components
import { Box, Paper, Typography, CircularProgress } from '@mui/material';

// Material Dashboard components
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import FormError from './FormError';

const TanStackForm = ({
  schema,
  onSubmit,
  defaultValues = {},
  children,
  title,
  submitText = 'Submit',
  loading = false,
}) => {
  const { t } = useTranslation();
  
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        await onSubmit(value);
      } catch (error) {
        // PATTERN: Handle Parse Server errors and map to form errors
        if (error.code === 202) {
          form.setFieldError('username', t('auth.errors.usernameTaken'));
        } else if (error.code === 203) {
          form.setFieldError('email', t('auth.errors.emailTaken'));
        } else {
          form.setError(error.message || t('common.error.unexpected'));
        }
        throw error; // Re-throw to prevent form submission completion
      }
    },
    validatorAdapter: zodValidator,
  });

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      {title && (
        <Typography variant="h5" component="h1" gutterBottom>
          {title}
        </Typography>
      )}
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <MDBox>
          {/* Render form fields */}
          {children({ form })}
          
          {/* Display form-level errors */}
          {form.state.errors.length > 0 && (
            <FormError errors={form.state.errors} />
          )}
          
          {/* Submit button */}
          <MDBox mt={3}>
            <MDButton
              type="submit"
              variant="gradient"
              color="info"
              fullWidth
              disabled={!form.state.canSubmit || loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? t('common.loading') : t(submitText)}
            </MDButton>
          </MDBox>
        </MDBox>
      </form>
    </Paper>
  );
};

// Task 5: Enhanced Login Form Implementation
// layouts/authentication/login/index.js (MODIFIED)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import TanStackForm from 'components/forms/TanStackForm';
import FormField from 'components/forms/TanStackForm/FormField';
import { loginSchema } from 'schemas/authSchemas';
import { ParseAuth } from 'services/parseService';

// Material Dashboard components
import MDBox from 'components/MDBox';
import MDInput from 'components/MDInput';
import SimpleSwitch from 'components/SimpleSwitch';

function Enhanced() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    // PATTERN: TanStack Form handles validation, we handle Parse Server integration
    try {
      await ParseAuth.loginWithRememberMe(
        values.username, 
        values.password, 
        values.rememberMe
      );
      
      // Store username if remember me is enabled
      if (values.rememberMe) {
        localStorage.setItem('lastLoginUsername', values.username);
      } else {
        localStorage.removeItem('lastLoginUsername');
      }
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // CRITICAL: Let TanStack Form handle error display
      throw error;
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card sx={{ width: '350px', maxWidth: '350px', minWidth: '300px' }}>
        {/* Logo header preserved */}
        <MDBox variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="info" mx={2} mt={-3} p={2} mb={1} textAlign="center">
          <MDTypography variant="logo" color="white" mt={1}
            sx={{ fontFamily: "'Romantically', serif", fontSize: "2.2rem" }}
          >
            PsyPsy
          </MDTypography>
          {/* Social media links preserved */}
        </MDBox>
        
        {/* Enhanced form with TanStack Form */}
        <MDBox pt={4} pb={3} px={3}>
          <TanStackForm
            schema={loginSchema}
            onSubmit={handleLogin}
            defaultValues={{
              username: localStorage.getItem('lastLoginUsername') || '',
              password: '',
              rememberMe: !!localStorage.getItem('lastLoginUsername'),
            }}
          >
            {({ form }) => (
              <>
                {/* Username field with real-time validation */}
                <form.Field
                  name="username"
                  validators={{
                    onChange: loginSchema.shape.username,
                  }}
                  children={(field) => (
                    <MDBox mb={3}>
                      <FormField
                        field={field}
                        component={MDInput}
                        label={t("auth.login.username")}
                        type="text"
                        fullWidth
                      />
                    </MDBox>
                  )}
                />
                
                {/* Password field with validation */}
                <form.Field
                  name="password"
                  validators={{
                    onChange: loginSchema.shape.password,
                  }}
                  children={(field) => (
                    <MDBox mb={2}>
                      <FormField
                        field={field}
                        component={MDInput}
                        label={t("auth.login.password")}
                        type="password"
                        fullWidth
                      />
                    </MDBox>
                  )}
                />
                
                {/* Remember me switch */}
                <form.Field
                  name="rememberMe"
                  children={(field) => (
                    <MDBox mt={2} display="flex" justifyContent="center">
                      <SimpleSwitch
                        checked={field.state.value}
                        onChange={field.handleChange}
                        label={t("common.rememberMe")}
                      />
                    </MDBox>
                  )}
                />
              </>
            )}
          </TanStackForm>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

// Task 6: Professional Registration Implementation
// components/forms/ProfessionalRegistrationForm/index.js
const ProfessionalRegistrationForm = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { id: 'basic', title: t('registration.steps.basicInfo') },
    { id: 'professional', title: t('registration.steps.professionalDetails') },
    { id: 'verification', title: t('registration.steps.verification') },
  ];
  
  const handleSubmit = async (values) => {
    try {
      // PATTERN: Multi-step form submission with Parse Server
      const user = new Parse.User();
      user.set('username', values.username);
      user.set('email', values.email);
      user.set('password', values.password);
      user.set('userType', 1); // Professional
      
      const registeredUser = await user.signUp();
      
      // Create professional profile
      const professional = new Parse.Object('Professional');
      professional.set('userPtr', registeredUser);
      Object.entries(values.professionalProfile).forEach(([key, value]) => {
        professional.set(key, value);
      });
      
      await professional.save();
      
      // Navigate to verification pending page
      navigate('/verification-pending');
    } catch (error) {
      throw error; // Let TanStack Form handle error display
    }
  };
  
  return (
    <TanStackForm
      schema={professionalRegistrationSchema}
      onSubmit={handleSubmit}
      title={t('registration.professional.title')}
    >
      {({ form }) => (
        <MDBox>
          {/* Step indicator */}
          <Stepper activeStep={currentStep}>
            {steps.map((step) => (
              <Step key={step.id}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Current step content */}
          {currentStep === 0 && <BasicInfoStep form={form} />}
          {currentStep === 1 && <ProfessionalDetailsStep form={form} />}
          {currentStep === 2 && <VerificationStep form={form} />}
          
          {/* Navigation buttons */}
          <MDBox display="flex" justifyContent="space-between" mt={3}>
            <MDButton
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              {t('common.previous')}
            </MDButton>
            
            {currentStep < steps.length - 1 ? (
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!form.state.fieldMeta[steps[currentStep].id]?.isValid}
              >
                {t('common.next')}
              </MDButton>
            ) : (
              <MDButton
                type="submit"
                variant="gradient"
                color="info"
                disabled={!form.state.canSubmit}
              >
                {t('registration.submit')}
              </MDButton>
            )}
          </MDBox>
        </MDBox>
      )}
    </TanStackForm>
  );
};
```

### Integration Points
```yaml
DEPENDENCIES:
  - add to: package.json
  - packages: |
      @tanstack/react-form: "latest"
      @tanstack/zod-form-adapter: "latest"
      zod: "^3.22.0"

PARSE-SERVER:
  - maintain: Existing ParseAuth system and user creation flow
  - enhance: Client-side validation before server submission
  - integrate: Parse Server error codes with Zod validation errors

MATERIAL-UI:
  - preserve: MDInput, MDButton, MDBox styling and behavior
  - enhance: Error states and validation feedback
  - integrate: Form components with Material-UI design system

INTERNATIONALIZATION:
  - extend: Validation message translations in locales/
  - maintain: Existing i18n patterns and message keys
  - add: Form-specific validation messages for comprehensive coverage
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm install @tanstack/react-form @tanstack/zod-form-adapter zod@^3.22.0
npm run build # Ensure no compilation errors with new form system
npx eslint src/components/forms/ src/schemas/ # Check code style

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests
```javascript
// CREATE __tests__/schemas/authSchemas.test.js
import { loginSchema, registrationSchema } from '../../schemas/authSchemas';

test('loginSchema validates correct login data', () => {
  const validLogin = {
    username: 'testuser',
    password: 'password123',
    rememberMe: true,
  };
  
  const result = loginSchema.safeParse(validLogin);
  expect(result.success).toBe(true);
});

test('loginSchema rejects invalid data', () => {
  const invalidLogin = {
    username: 'ab', // Too short
    password: '123', // Too short
    rememberMe: false,
  };
  
  const result = loginSchema.safeParse(invalidLogin);
  expect(result.success).toBe(false);
  expect(result.error.errors).toHaveLength(2);
});

test('registrationSchema validates password confirmation', () => {
  const validRegistration = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    userType: 2,
  };
  
  const result = registrationSchema.safeParse(validRegistration);
  expect(result.success).toBe(true);
});

// CREATE __tests__/components/TanStackForm.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TanStackForm from '../../../components/forms/TanStackForm';
import { loginSchema } from '../../../schemas/authSchemas';

test('TanStackForm displays validation errors', async () => {
  const mockOnSubmit = jest.fn();
  
  render(
    <TanStackForm schema={loginSchema} onSubmit={mockOnSubmit}>
      {({ form }) => (
        <form.Field
          name="username"
          children={(field) => (
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        />
      )}
    </TanStackForm>
  );
  
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'ab' } }); // Too short
  fireEvent.blur(input);
  
  await waitFor(() => {
    expect(screen.getByText(/minLength/)).toBeInTheDocument();
  });
});
```

```bash
# Run tests iteratively until passing:
npm test -- __tests__/schemas/ __tests__/components/forms/
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the development server
npm start

# Test in browser - Authentication workflow
# Navigate to /authentication/login - should show enhanced validation
# Enter invalid credentials - should show immediate feedback
# Navigate to registration - should guide through multi-step process

# Expected behaviors:
# - Login form shows validation errors immediately
# - Professional registration guides through steps
# - Client onboarding provides progressive validation
# - Form submission integrates with Parse Server
# - Error messages display in current language
# - Material-UI styling consistency maintained
```

## Final Validation Checklist
- [ ] All tests pass: `npm test -- __tests__/schemas/ __tests__/components/forms/`
- [ ] No linting errors: `npx eslint src/components/forms/ src/schemas/`
- [ ] No compilation errors: `npm run build`
- [ ] Login form uses TanStack Form with proper validation
- [ ] Professional registration form has comprehensive validation
- [ ] Client onboarding form provides guided user experience
- [ ] Validation errors display immediately with Material-UI error states
- [ ] Form submission integrates with Parse Server operations
- [ ] Type safety maintained throughout form handling
- [ ] Internationalization works for validation messages
- [ ] Material-UI theming consistency maintained

---

## Anti-Patterns to Avoid
- ❌ Don't mix manual validation with Zod schema validation
- ❌ Don't ignore Parse Server validation - use both client and server validation
- ❌ Don't forget to handle async Parse Server errors in form submission
- ❌ Don't override Material-UI form styling without preserving accessibility
- ❌ Don't skip field-level validation for better user experience
- ❌ Don't hardcode validation messages - use i18n translation keys

## Confidence Score: 8/10

High confidence due to:
- TanStack Form has excellent React documentation and Zod integration
- Existing form patterns in authentication provide clear migration path
- Material-UI integration patterns established in current codebase
- Parse Server integration patterns well-documented

Minor uncertainty around multi-step form state persistence and complex validation scenarios like file uploads for professional credentials.