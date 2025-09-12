/**
 * Base Form Component
 * Provides a foundation for all forms using validation schemas
 */

import React from 'react';
import PropTypes from 'prop-types';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import { CircularProgress, Fade, Skeleton } from '@mui/material';
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
  showSkeleton = false,
  loadingText = 'Processing...',
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
          {showSkeleton ? (
            <Skeleton variant="text" width="60%" height={40} />
          ) : (
            <MDTypography variant="h4" fontWeight="medium">
              {title}
            </MDTypography>
          )}
        </MDBox>
      )}
      
      {/* Form Fields Container with Loading Overlay */}
      <MDBox position="relative">
        {/* Loading Overlay */}
        <Fade in={loading}>
          <MDBox
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(255, 255, 255, 0.8)"
            zIndex={10}
            borderRadius={1}
            sx={{
              backdropFilter: 'blur(2px)',
              pointerEvents: loading ? 'auto' : 'none',
              opacity: loading ? 1 : 0,
            }}
          >
            <MDBox display="flex" alignItems="center" gap={2}>
              <CircularProgress size={24} color="info" />
              <MDTypography variant="body2" color="text">
                {loadingText}
              </MDTypography>
            </MDBox>
          </MDBox>
        </Fade>
        
        {/* Form Fields */}
        <MDBox sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
          {showSkeleton ? (
            <MDBox>
              <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={36} width="50%" sx={{ borderRadius: 1 }} />
            </MDBox>
          ) : (
            children(formHook)
          )}
        </MDBox>
      </MDBox>
      
      <MDBox mt={4} mb={1}>
        <MDButton
          variant="gradient"
          color="info"
          fullWidth
          type="submit"
          disabled={!formHook.canSubmit || disabled || loading}
          sx={{
            position: 'relative',
            transition: 'all 0.3s ease',
            '&:disabled': {
              opacity: 0.7,
            },
          }}
        >
          {/* Button Loading State */}
          <Fade in={loading}>
            <MDBox
              position="absolute"
              left="50%"
              top="50%"
              sx={{
                transform: 'translate(-50%, -50%)',
                display: loading ? 'flex' : 'none',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={16} color="inherit" />
            </MDBox>
          </Fade>
          
          {/* Button Text */}
          <MDBox sx={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            {loading ? loadingText : submitText}
          </MDBox>
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
  showSkeleton: PropTypes.bool,
  loadingText: PropTypes.string,
};

export default BaseForm;