/**
 * Base Form Component
 * Provides a foundation for all forms using validation schemas
 */

import React from 'react';
import PropTypes from 'prop-types';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import { useFormValidation } from 'hooks/useFormValidation';

const BaseForm = ({
  schema,
  initialValues = {},
  onSubmit,
  onError,
  children,
  submitText = 'Submit',
  loading = false,
  disabled = false,
  title,
  ...props
}) => {
  const formHook = useFormValidation(schema, {
    initialValues,
    onSubmit,
    onError,
  });

  return (
    <MDBox component="form" onSubmit={formHook.handleSubmit} {...props}>
      {title && (
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            {title}
          </MDTypography>
        </MDBox>
      )}
      
      {children(formHook)}
      
      <MDBox mt={4} mb={1}>
        <MDButton
          variant="gradient"
          color="info"
          fullWidth
          type="submit"
          disabled={!formHook.canSubmit || disabled || loading}
        >
          {loading ? 'Processing...' : submitText}
        </MDButton>
      </MDBox>
    </MDBox>
  );
};

BaseForm.propTypes = {
  schema: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onError: PropTypes.func,
  children: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  title: PropTypes.string,
};

export default BaseForm;