/**
 * Authentication Form Component
 * Specialized form for login, registration, and password reset
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import MDAlert from 'components/MDAlert';
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

  const renderLoginFields = (formHook) => (
    <>
      <FormField
        type="text"
        name="username"
        label={t('auth.fields.username')}
        {...formHook.getFieldProps('username')}
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
        type="checkbox"
        name="rememberMe"
        label={t('auth.fields.rememberMe')}
        {...formHook.getFieldProps('rememberMe')}
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
      type="email"
      name="email"
      label={t('auth.fields.email')}
      {...formHook.getFieldProps('email')}
      required
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
    <MDBox {...props}>
      {submitError && (
        <MDBox mb={2}>
          <MDAlert color="error" dismissible onClose={() => setSubmitError(null)}>
            <MDTypography variant="body2" color="white">
              {submitError}
            </MDTypography>
          </MDAlert>
        </MDBox>
      )}
      
      <BaseForm
        schema={getSchema()}
        initialValues={authHook.values}
        onSubmit={handleSubmit}
        onError={(error) => setSubmitError(error.message)}
        submitText={getSubmitText()}
        loading={isSubmitting}
        title={getTitle()}
      >
        {(formHook) => renderFields(formHook)}
      </BaseForm>
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