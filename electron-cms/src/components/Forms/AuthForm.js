/**
 * Authentication Form Component
 * Specialized form for login, registration, and password reset
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDAlert from 'components/MDAlert';
import MuiLink from '@mui/material/Link';
import { Fade, Zoom } from '@mui/material';
import FormField from './FormField';
import BaseForm from './BaseForm';
import { useTranslation } from 'react-i18next';
import { useParseAuthForm } from 'hooks/useParseForm';
import { loginSchema, registrationSchema, passwordResetSchema } from 'schemas/authSchemas';

const AuthForm = ({
  type = 'login',
  onSuccess,
  onError,
  title,
  redirectAfterSuccess = true,
  ...props
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const firstFieldRef = useRef(null);
  const formRef = useRef(null);

  // Focus management when switching between login and forgot password
  useEffect(() => {
    if (firstFieldRef.current) {
      setTimeout(() => {
        firstFieldRef.current.focus();
      }, 100);
    }
  }, [showForgotPassword, type]);

  const getSchema = () => {
    switch (type) {
      case 'register':
        return registrationSchema;
      case 'reset':
        return passwordResetSchema;
      default:
        return loginSchema;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'register':
        return t('auth.register.title');
      case 'reset':
        return t('auth.resetPassword.title');
      default:
        return t('auth.login.title');
    }
  };

  const getSubmitText = () => {
    switch (type) {
      case 'register':
        return t('auth.register.submit');
      case 'reset':
        return t('auth.resetPassword.submit');
      default:
        return t('auth.login.submit');
    }
  };

  const getLoadingText = () => {
    switch (type) {
      case 'register':
        return t('auth.register.loading');
      case 'reset':
        return t('auth.forgotPassword.loading');
      default:
        return t('auth.login.loading');
    }
  };

  const authHook = useParseAuthForm(getSchema(), {
    onLoginSuccess: async (user) => {
      if (onSuccess) await onSuccess(user);
    },
    onRegistrationSuccess: async (result) => {
      if (onSuccess) await onSuccess(result);
    },
    onLoginError: async (error) => {
      setSubmitError(error.message || t('auth.errors.loginFailed'));
      if (onError) await onError(error);
    },
    onRegistrationError: async (error) => {
      setSubmitError(error.message || t('auth.errors.registrationFailed'));
      if (onError) await onError(error);
    },
  });

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      switch (type) {
        case 'register':
          await authHook.register();
          break;
        case 'reset':
          await authHook.resetPassword();
          break;
        default:
          await authHook.login();
          break;
      }
    } catch (error) {
      setSubmitError(error.message || t('common.errors.unexpected'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Global keyboard handler for the form
  const handleFormKeyDown = (event) => {
    // Escape key to toggle forgot password or close form
    if (event.key === 'Escape') {
      event.preventDefault();
      if (showForgotPassword) {
        setShowForgotPassword(false);
        setSubmitError(null);
      }
    }

    // Alt + R to switch to registration (if not already on login page)
    if (event.altKey && event.key === 'r' && type === 'login' && !showForgotPassword) {
      event.preventDefault();
      // This would need to be handled by parent component
      console.log('Registration shortcut triggered');
    }

    // Alt + F for forgot password toggle
    if (event.altKey && event.key === 'f' && type === 'login') {
      event.preventDefault();
      setShowForgotPassword(!showForgotPassword);
      setSubmitError(null);
    }
  };

  const renderLoginFields = (formHook) => (
    <>
      <FormField
        ref={firstFieldRef}
        type="text"
        name="username"
        label={t('auth.fields.username')}
        {...formHook.getFieldProps('username')}
        required
        autoFocus={!showForgotPassword}
        tabIndex={1}
      />
      <FormField
        type="password"
        name="password"
        label={t('auth.fields.password')}
        {...formHook.getFieldProps('password')}
        required
        tabIndex={2}
      />
      <FormField
        type="checkbox"
        name="rememberMe"
        label={t('auth.fields.rememberMe')}
        {...formHook.getFieldProps('rememberMe')}
        tabIndex={3}
      />
    </>
  );

  const renderRegisterFields = (formHook) => (
    <>
      <FormField
        type="text"
        name="username"
        label={t('auth.fields.username')}
        {...formHook.getFieldProps('username')}
        required
      />
      <FormField
        type="email"
        name="email"
        label={t('auth.fields.email')}
        {...formHook.getFieldProps('email')}
        required
      />
      <FormField
        type="password"
        name="password"
        label={t('auth.fields.password')}
        {...formHook.getFieldProps('password')}
        required
      />
      <FormField
        type="password"
        name="confirmPassword"
        label={t('auth.fields.confirmPassword')}
        {...formHook.getFieldProps('confirmPassword')}
        required
      />
      <FormField
        type="select"
        name="userType"
        label={t('auth.fields.userType')}
        {...formHook.getFieldProps('userType')}
        options={[
          { value: 1, label: t('auth.userTypes.professional') },
          { value: 2, label: t('auth.userTypes.client') },
        ]}
        required
      />
      <FormField
        type="checkbox"
        name="acceptTerms"
        label={t('auth.fields.acceptTerms')}
        {...formHook.getFieldProps('acceptTerms')}
        required
      />
    </>
  );

  const renderResetFields = (formHook) => (
    <FormField
      ref={firstFieldRef}
      type="email"
      name="email"
      label={t('auth.fields.email')}
      {...formHook.getFieldProps('email')}
      required
      autoFocus={showForgotPassword}
      tabIndex={1}
    />
  );

  const renderFields = (formHook) => {
    switch (type) {
      case 'register':
        return renderRegisterFields(formHook);
      case 'reset':
        return renderResetFields(formHook);
      default:
        return renderLoginFields(formHook);
    }
  };

  return (
    <MDBox 
      ref={formRef}
      onKeyDown={handleFormKeyDown}
      role="main"
      aria-label={getTitle()}
      {...props}
    >
      <Fade in={!!submitError} timeout={300}>
        <MDBox mb={submitError ? 2 : 0}>
          {submitError && (
            <Zoom in={!!submitError} timeout={200}>
              <MDAlert 
                color="error" 
                dismissible 
                onClose={() => setSubmitError(null)}
                role="alert"
                aria-live="assertive"
                sx={{
                  animation: 'shake 0.5s ease-in-out',
                  '@keyframes shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-4px)' },
                    '75%': { transform: 'translateX(4px)' },
                  },
                }}
              >
                <MDTypography variant="body2" color="white">
                  {submitError}
                </MDTypography>
              </MDAlert>
            </Zoom>
          )}
        </MDBox>
      </Fade>
      
      <Fade in={true} timeout={500}>
        <MDBox>
          {showForgotPassword && type === 'login' ? (
            <BaseForm
              schema={passwordResetSchema}
              initialValues={{ email: '' }}
              onSubmit={async (values) => {
                try {
                  setIsSubmitting(true);
                  setSubmitError(null);
                  // TODO: Implement forgot password functionality with Parse Server
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
                  setSubmitError(null);
                  // Show success message instead of error
                  setSubmitError(t('auth.forgotPassword.success'));
                } catch (error) {
                  setSubmitError(error.message || t('auth.errors.forgotPasswordFailed'));
                } finally {
                  setIsSubmitting(false);
                }
              }}
              onError={(error) => setSubmitError(error.message)}
              submitText={t('auth.forgotPassword.submit')}
              loading={isSubmitting}
              loadingText={t('auth.forgotPassword.loading')}
              title={t('auth.forgotPassword.title')}
            >
              {(formHook) => renderResetFields(formHook)}
            </BaseForm>
          ) : (
            <BaseForm
              schema={getSchema()}
              initialValues={authHook.values}
              onSubmit={handleSubmit}
              onError={(error) => setSubmitError(error.message)}
              submitText={getSubmitText()}
              loading={isSubmitting}
              loadingText={getLoadingText()}
              title={getTitle()}
            >
              {(formHook) => renderFields(formHook)}
            </BaseForm>
          )}
        </MDBox>
      </Fade>

      {/* Forgot Password Link - only show on login form */}
      {type === 'login' && (
        <Fade in={true} timeout={400}>
          <MDBox mt={2} textAlign="center">
            <Fade in={!showForgotPassword} timeout={300} unmountOnExit>
              <MuiLink
                component="button"
                type="button"
                variant="body2"
                onClick={() => {
                  setShowForgotPassword(true);
                  setSubmitError(null);
                }}
                tabIndex={4}
                aria-describedby="forgot-password-hint"
                sx={{
                  color: 'info.main',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'info.dark',
                    transform: 'translateY(-1px)',
                  },
                  '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'info.main',
                    outlineOffset: '2px',
                  },
                }}
              >
                {t('common.forgotPassword')}
              </MuiLink>
            </Fade>
            
            <Fade in={showForgotPassword} timeout={300} unmountOnExit>
              <MuiLink
                component="button"
                type="button"
                variant="body2"
                onClick={() => {
                  setShowForgotPassword(false);
                  setSubmitError(null);
                }}
                tabIndex={2}
                aria-describedby="back-to-login-hint"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'text.primary',
                    transform: 'translateY(-1px)',
                  },
                  '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'text.primary',
                    outlineOffset: '2px',
                  },
                }}
              >
                ← {t('auth.login.backToLogin')}
              </MuiLink>
            </Fade>
            
            {/* Screen reader hints for keyboard shortcuts */}
            <MDTypography 
              id="forgot-password-hint"
              variant="caption" 
              sx={{ 
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
              }}
            >
              Keyboard shortcut: Alt+F
            </MDTypography>
            <MDTypography 
              id="back-to-login-hint"
              variant="caption" 
              sx={{ 
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
              }}
            >
              Keyboard shortcut: Escape
            </MDTypography>
          </MDBox>
        </Fade>
      )}
    </MDBox>
  );
};

AuthForm.propTypes = {
  type: PropTypes.oneOf(['login', 'register', 'reset']),
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  title: PropTypes.string,
  redirectAfterSuccess: PropTypes.bool,
};

export default AuthForm;