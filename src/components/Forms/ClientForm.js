/**
 * Client Form Component
 * Form for creating and editing client profiles
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
  clientProfileSchema, 
  clientRegistrationSchema,
  clientIntakeSchema
} from 'schemas/clientSchemas';

const ClientForm = ({
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
    switch (type) {
      case 'registration':
        return clientRegistrationSchema;
      case 'intake':
        return clientIntakeSchema;
      default:
        return clientProfileSchema;
    }
  };

  const getTitle = () => {
    if (title) return title;
    if (objectId) {
      return t('clients.form.editTitle');
    }
    switch (type) {
      case 'registration':
        return t('clients.form.registrationTitle');
      case 'intake':
        return t('clients.form.intakeTitle');
      default:
        return t('clients.form.createTitle');
    }
  };

  const crudHook = useParseCRUDForm(getSchema(), 'Client', {
    objectId,
    onSaveSuccess: async (savedObject, data) => {
      if (onSuccess) await onSuccess(savedObject, data);
    },
    onSaveError: async (error) => {
      setSubmitError(error.message || t('clients.errors.saveFailed'));
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
        {t('clients.form.sections.personalInfo')}
      </MDTypography>
      
      <FormField
        type="text"
        name="firstName"
        label={t('clients.fields.firstName')}
        {...formHook.getFieldProps('firstName')}
        required
      />
      
      <FormField
        type="text"
        name="lastName"
        label={t('clients.fields.lastName')}
        {...formHook.getFieldProps('lastName')}
        required
      />
      
      <FormField
        type="email"
        name="email"
        label={t('clients.fields.email')}
        {...formHook.getFieldProps('email')}
        required
      />
      
      <FormField
        type="tel"
        name="phoneNumber"
        label={t('clients.fields.phoneNumber')}
        {...formHook.getFieldProps('phoneNumber')}
        required
      />
      
      <FormField
        type="select"
        name="gender"
        label={t('clients.fields.gender')}
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
        label={t('clients.fields.dateOfBirth')}
        {...formHook.getFieldProps('dateOfBirth')}
        placeholder="YYYY-MM-DD"
        required
      />
    </>
  );

  const renderAddressFields = (formHook) => (
    <>
      <MDTypography variant="h6" mb={2} mt={3}>
        {t('clients.form.sections.address')}
      </MDTypography>
      
      <FormField
        type="text"
        name="address.street"
        label={t('clients.fields.address.street')}
        {...formHook.getFieldProps('address.street')}
        required
      />
      
      <FormField
        type="text"
        name="address.city"
        label={t('clients.fields.address.city')}
        {...formHook.getFieldProps('address.city')}
        required
      />
      
      <FormField
        type="select"
        name="address.province"
        label={t('clients.fields.address.province')}
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
        label={t('clients.fields.address.postalCode')}
        {...formHook.getFieldProps('address.postalCode')}
        placeholder="A1A 1A1"
        required
      />
    </>
  );

  const renderIntakeFields = (formHook) => (
    <>
      <MDTypography variant="h6" mb={2} mt={3}>
        {t('clients.form.sections.intake')}
      </MDTypography>
      
      <FormField
        type="textarea"
        name="reasonForSeeking"
        label={t('clients.fields.reasonForSeeking')}
        {...formHook.getFieldProps('reasonForSeeking')}
        rows={4}
        placeholder={t('clients.fields.reasonForSeekingPlaceholder')}
        required
      />
      
      <FormField
        type="textarea"
        name="previousTherapy"
        label={t('clients.fields.previousTherapy')}
        {...formHook.getFieldProps('previousTherapy')}
        rows={3}
        placeholder={t('clients.fields.previousTherapyPlaceholder')}
      />
      
      <FormField
        type="textarea"
        name="currentMedications"
        label={t('clients.fields.currentMedications')}
        {...formHook.getFieldProps('currentMedications')}
        rows={3}
        placeholder={t('clients.fields.currentMedicationsPlaceholder')}
      />
      
      <FormField
        type="textarea"
        name="medicalHistory"
        label={t('clients.fields.medicalHistory')}
        {...formHook.getFieldProps('medicalHistory')}
        rows={3}
        placeholder={t('clients.fields.medicalHistoryPlaceholder')}
      />
      
      <FormField
        type="select"
        name="preferredMeetingType"
        label={t('clients.fields.preferredMeetingType')}
        {...formHook.getFieldProps('preferredMeetingType')}
        options={[
          { value: 'online', label: t('clients.meetingTypes.online') },
          { value: 'in-person', label: t('clients.meetingTypes.inPerson') },
          { value: 'both', label: t('clients.meetingTypes.both') },
        ]}
        required
      />
      
      <FormField
        type="textarea"
        name="emergencyContact"
        label={t('clients.fields.emergencyContact')}
        {...formHook.getFieldProps('emergencyContact')}
        rows={2}
        placeholder={t('clients.fields.emergencyContactPlaceholder')}
        required
      />
    </>
  );

  const renderConsentFields = (formHook) => (
    <>
      <MDTypography variant="h6" mb={2} mt={3}>
        {t('clients.form.sections.consent')}
      </MDTypography>
      
      <FormField
        type="checkbox"
        name="consentToTreatment"
        label={t('clients.fields.consentToTreatment')}
        {...formHook.getFieldProps('consentToTreatment')}
        required
      />
      
      <FormField
        type="checkbox"
        name="consentToDataSharing"
        label={t('clients.fields.consentToDataSharing')}
        {...formHook.getFieldProps('consentToDataSharing')}
        required
      />
      
      <FormField
        type="checkbox"
        name="consentToCommunication"
        label={t('clients.fields.consentToCommunication')}
        {...formHook.getFieldProps('consentToCommunication')}
        required
      />
    </>
  );

  const renderFields = (formHook) => {
    switch (type) {
      case 'intake':
        return (
          <>
            {renderPersonalInfoFields(formHook)}
            {renderAddressFields(formHook)}
            {renderIntakeFields(formHook)}
            {renderConsentFields(formHook)}
          </>
        );
      case 'registration':
        return (
          <>
            {renderPersonalInfoFields(formHook)}
            {renderAddressFields(formHook)}
            {renderConsentFields(formHook)}
          </>
        );
      default:
        return (
          <>
            {renderPersonalInfoFields(formHook)}
            {renderAddressFields(formHook)}
          </>
        );
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
        initialValues={{ ...initialData, ...crudHook.values }}
        onSubmit={handleSubmit}
        onError={(error) => setSubmitError(error.message)}
        submitText={objectId ? t('common.actions.update') : t('common.actions.create')}
        loading={isSubmitting}
        title={getTitle()}
      >
        {renderFields}
      </BaseForm>
    </MDBox>
  );
};

ClientForm.propTypes = {
  type: PropTypes.oneOf(['profile', 'registration', 'intake']),
  objectId: PropTypes.string,
  initialData: PropTypes.object,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  title: PropTypes.string,
};

export default ClientForm;