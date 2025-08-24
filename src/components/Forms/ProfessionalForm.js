/**
 * Professional Form Component
 * Form for creating and editing professional profiles
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDAlert from 'components/MDAlert';
import FormField from './FormField';
import BaseForm from './BaseForm';
import { useTranslation } from 'react-i18next';
import { useParseCRUDForm } from 'hooks/useParseForm';
import { 
  professionalProfileSchema, 
  professionalRegistrationSchema 
} from 'schemas/professionalSchemas';

const ProfessionalForm = ({
  type = 'profile',
  objectId = null,
  initialData = {},
  onSuccess,
  onError,
  title,
  ...props
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const getSchema = () => {
    return type === 'registration' ? professionalRegistrationSchema : professionalProfileSchema;
  };

  const getTitle = () => {
    if (title) return title;
    if (objectId) {
      return t('professionals.form.editTitle');
    }
    return type === 'registration' 
      ? t('professionals.form.registrationTitle')
      : t('professionals.form.createTitle');
  };

  const crudHook = useParseCRUDForm(getSchema(), 'Professional', {
    objectId,
    onSaveSuccess: async (savedObject, data) => {
      if (onSuccess) await onSuccess(savedObject, data);
    },
    onSaveError: async (error) => {
      setSubmitError(error.message || t('professionals.errors.saveFailed'));
      if (onError) await onError(error);
    },
  });

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await crudHook.save();
    } catch (error) {
      setSubmitError(error.message || t('common.errors.unexpected'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonalInfoFields = (formHook) => (
    <>
      <MDTypography variant="h6" mb={2}>
        {t('professionals.form.sections.personalInfo')}
      </MDTypography>
      
      <FormField
        type="text"
        name="firstName"
        label={t('professionals.fields.firstName')}
        {...formHook.getFieldProps('firstName')}
        required
      />
      
      <FormField
        type="text"
        name="lastName"
        label={t('professionals.fields.lastName')}
        {...formHook.getFieldProps('lastName')}
        required
      />
      
      <FormField
        type="email"
        name="email"
        label={t('professionals.fields.email')}
        {...formHook.getFieldProps('email')}
        required
      />
      
      <FormField
        type="tel"
        name="phoneNumber"
        label={t('professionals.fields.phoneNumber')}
        {...formHook.getFieldProps('phoneNumber')}
        required
      />
      
      <FormField
        type="select"
        name="gender"
        label={t('professionals.fields.gender')}
        {...formHook.getFieldProps('gender')}
        options={[
          { value: 1, label: t('common.gender.woman') },
          { value: 2, label: t('common.gender.man') },
          { value: 3, label: t('common.gender.other') },
          { value: 4, label: t('common.gender.preferNotToSay') },
        ]}
        required
      />
      
      <FormField
        type="text"
        name="dateOfBirth"
        label={t('professionals.fields.dateOfBirth')}
        {...formHook.getFieldProps('dateOfBirth')}
        placeholder="YYYY-MM-DD"
        required
      />
    </>
  );

  const renderAddressFields = (formHook) => (
    <>
      <MDTypography variant="h6" mb={2} mt={3}>
        {t('professionals.form.sections.address')}
      </MDTypography>
      
      <FormField
        type="text"
        name="address.street"
        label={t('professionals.fields.address.street')}
        {...formHook.getFieldProps('address.street')}
        required
      />
      
      <FormField
        type="text"
        name="address.city"
        label={t('professionals.fields.address.city')}
        {...formHook.getFieldProps('address.city')}
        required
      />
      
      <FormField
        type="select"
        name="address.province"
        label={t('professionals.fields.address.province')}
        {...formHook.getFieldProps('address.province')}
        options={[
          { value: 'AB', label: t('provinces.AB') },
          { value: 'BC', label: t('provinces.BC') },
          { value: 'MB', label: t('provinces.MB') },
          { value: 'NB', label: t('provinces.NB') },
          { value: 'NL', label: t('provinces.NL') },
          { value: 'NS', label: t('provinces.NS') },
          { value: 'NT', label: t('provinces.NT') },
          { value: 'NU', label: t('provinces.NU') },
          { value: 'ON', label: t('provinces.ON') },
          { value: 'PE', label: t('provinces.PE') },
          { value: 'QC', label: t('provinces.QC') },
          { value: 'SK', label: t('provinces.SK') },
          { value: 'YT', label: t('provinces.YT') },
        ]}
        required
      />
      
      <FormField
        type="text"
        name="address.postalCode"
        label={t('professionals.fields.address.postalCode')}
        {...formHook.getFieldProps('address.postalCode')}
        placeholder="A1A 1A1"
        required
      />
    </>
  );

  const renderProfessionalInfoFields = (formHook) => (
    <>
      <MDTypography variant="h6" mb={2} mt={3}>
        {t('professionals.form.sections.professionalInfo')}
      </MDTypography>
      
      <FormField
        type="text"
        name="licenseNumber"
        label={t('professionals.fields.licenseNumber')}
        {...formHook.getFieldProps('licenseNumber')}
        required
      />
      
      <FormField
        type="text"
        name="profession"
        label={t('professionals.fields.profession')}
        {...formHook.getFieldProps('profession')}
        required
      />
      
      <FormField
        type="select"
        name="licenseProvince"
        label={t('professionals.fields.licenseProvince')}
        {...formHook.getFieldProps('licenseProvince')}
        options={[
          { value: 'AB', label: t('provinces.AB') },
          { value: 'BC', label: t('provinces.BC') },
          { value: 'MB', label: t('provinces.MB') },
          { value: 'NB', label: t('provinces.NB') },
          { value: 'NL', label: t('provinces.NL') },
          { value: 'NS', label: t('provinces.NS') },
          { value: 'NT', label: t('provinces.NT') },
          { value: 'NU', label: t('provinces.NU') },
          { value: 'ON', label: t('provinces.ON') },
          { value: 'PE', label: t('provinces.PE') },
          { value: 'QC', label: t('provinces.QC') },
          { value: 'SK', label: t('provinces.SK') },
          { value: 'YT', label: t('provinces.YT') },
        ]}
        required
      />
      
      <FormField
        type="text"
        name="yearsOfExperience"
        label={t('professionals.fields.yearsOfExperience')}
        {...formHook.getFieldProps('yearsOfExperience')}
        type="number"
        required
      />
      
      <FormField
        type="textarea"
        name="bio"
        label={t('professionals.fields.bio')}
        {...formHook.getFieldProps('bio')}
        rows={4}
        placeholder={t('professionals.fields.bioPlaceholder')}
      />
      
      <FormField
        type="select"
        name="meetingType"
        label={t('professionals.fields.meetingType')}
        {...formHook.getFieldProps('meetingType')}
        options={[
          { value: 'online', label: t('professionals.meetingTypes.online') },
          { value: 'in-person', label: t('professionals.meetingTypes.inPerson') },
          { value: 'both', label: t('professionals.meetingTypes.both') },
        ]}
        required
      />
    </>
  );

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
        initialValues={{ ...initialData, ...crudHook.values }}
        onSubmit={handleSubmit}
        onError={(error) => setSubmitError(error.message)}
        submitText={objectId ? t('common.actions.update') : t('common.actions.create')}
        loading={isSubmitting}
        title={getTitle()}
      >
        {(formHook) => (
          <>
            {renderPersonalInfoFields(formHook)}
            {renderAddressFields(formHook)}
            {renderProfessionalInfoFields(formHook)}
          </>
        )}
      </BaseForm>
    </MDBox>
  );
};

ProfessionalForm.propTypes = {
  type: PropTypes.oneOf(['profile', 'registration']),
  objectId: PropTypes.string,
  initialData: PropTypes.object,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  title: PropTypes.string,
};

export default ProfessionalForm;