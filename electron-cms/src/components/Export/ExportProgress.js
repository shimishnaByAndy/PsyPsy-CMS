/**
 * Export Progress Component - Progress indicator for export operations
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// Material-UI components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Typography,
  Box,
  Alert
} from '@mui/material';

// Material Dashboard components
import MDButton from 'components/MDButton';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

// Material-UI icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';

const ExportProgress = ({ 
  progress, 
  onCancel, 
  onClose,
  open = true,
  title 
}) => {
  const { t } = useTranslation();
  
  const {
    percentage = 0,
    status = 'idle',
    message = '',
    error = null,
    processed = 0,
    total = 0
  } = progress || {};

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      case 'cancelled':
        return 'warning';
      case 'processing':
        return 'info';
      default:
        return 'info';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'cancelled':
        return <CancelIcon color="warning" />;
      default:
        return null;
    }
  };

  const getProgressText = () => {
    if (error) {
      return error;
    }
    
    if (message) {
      return message;
    }
    
    switch (status) {
      case 'processing':
        if (total > 0 && processed > 0) {
          return t('export.progressWithCount', { 
            defaultValue: 'Processing {{processed}} of {{total}} records...',
            processed,
            total
          });
        }
        return t('export.processing', { defaultValue: 'Processing...' });
      case 'completed':
        return t('export.completed', { defaultValue: 'Export completed successfully!' });
      case 'cancelled':
        return t('export.cancelled', { defaultValue: 'Export cancelled' });
      case 'error':
        return t('export.error', { defaultValue: 'Export failed' });
      default:
        return t('export.preparing', { defaultValue: 'Preparing export...' });
    }
  };

  const handleClose = () => {
    if (onClose && (status === 'completed' || status === 'error' || status === 'cancelled')) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel && status === 'processing') {
      onCancel();
    }
  };

  // Don't render if progress is idle and no explicit open prop
  if (status === 'idle' && open === true) {
    return null;
  }

  return (
    <Dialog
      open={open && status !== 'idle'}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={status === 'processing'}
    >
      <DialogTitle>
        <MDBox display="flex" alignItems="center" gap={1}>
          {getStatusIcon()}
          <MDTypography variant="h6">
            {title || t('export.title', { defaultValue: 'Export Progress' })}
          </MDTypography>
        </MDBox>
      </DialogTitle>
      
      <DialogContent>
        <MDBox>
          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant={status === 'processing' ? 'determinate' : 'indeterminate'}
              value={percentage}
              color={getStatusColor()}
              sx={{ 
                height: 8, 
                borderRadius: 1,
                backgroundColor: 'grey.200'
              }}
            />
          </Box>
          
          {/* Progress Text */}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <MDTypography variant="body2" color="text">
              {getProgressText()}
            </MDTypography>
            {status === 'processing' && (
              <MDTypography variant="caption" color="text">
                {Math.round(percentage)}%
              </MDTypography>
            )}
          </MDBox>
          
          {/* Record Count Display */}
          {total > 0 && status === 'processing' && (
            <MDBox display="flex" justifyContent="space-between" mt={1}>
              <MDTypography variant="caption" color="textSecondary">
                {t('export.recordsProcessed', { 
                  defaultValue: 'Records processed: {{processed}}/{{total}}',
                  processed,
                  total
                })}
              </MDTypography>
            </MDBox>
          )}
          
          {/* Error Alert */}
          {status === 'error' && error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          )}
          
          {/* Success Message */}
          {status === 'completed' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('export.successMessage', { 
                  defaultValue: 'Export completed successfully! Check your downloads folder.',
                  count: processed || total
                })}
              </Typography>
            </Alert>
          )}
          
          {/* Cancellation Message */}
          {status === 'cancelled' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('export.cancelledMessage', { 
                  defaultValue: 'Export was cancelled by user.'
                })}
              </Typography>
            </Alert>
          )}
        </MDBox>
      </DialogContent>
      
      <DialogActions>
        {status === 'processing' && onCancel && (
          <MDButton
            variant="outlined"
            color="error"
            onClick={handleCancel}
            startIcon={<CancelIcon />}
          >
            {t('export.cancel', { defaultValue: 'Cancel' })}
          </MDButton>
        )}
        
        {(status === 'completed' || status === 'error' || status === 'cancelled') && (
          <MDButton
            variant="contained"
            color="info"
            onClick={handleClose}
          >
            {t('common.close', { defaultValue: 'Close' })}
          </MDButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

ExportProgress.propTypes = {
  progress: PropTypes.shape({
    percentage: PropTypes.number,
    status: PropTypes.oneOf(['idle', 'processing', 'completed', 'error', 'cancelled']),
    message: PropTypes.string,
    error: PropTypes.string,
    processed: PropTypes.number,
    total: PropTypes.number
  }),
  onCancel: PropTypes.func,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string
};

export default ExportProgress;