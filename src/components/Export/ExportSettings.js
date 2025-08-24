/**
 * Export Settings Component - Configuration modal for export options
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// Material-UI components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  Typography,
  Box,
  Divider,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';

// Material-UI icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';

// Material Dashboard components
import MDButton from 'components/MDButton';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

// Privacy utilities
import { 
  validateExportPermissions, 
  generatePrivacyNotice,
  PRIVACY_LEVELS 
} from 'utils/privacyFilters';
import { estimateExportSize } from 'services/exportService';

const ExportSettings = ({ 
  open,
  onClose,
  template,
  format = 'xlsx',
  onExport,
  data = [],
  defaultPrivacyLevel = 'basic',
  userRole = 'admin'
}) => {
  const { t } = useTranslation();
  
  const [privacyLevel, setPrivacyLevel] = useState(defaultPrivacyLevel);
  const [filename, setFilename] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState(format);
  const [isExporting, setIsExporting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open && template) {
      setPrivacyLevel(defaultPrivacyLevel);
      setFilename('');
      setIncludeMetadata(true);
      setSelectedFormat(format);
      setIsExporting(false);
    }
  }, [open, template, defaultPrivacyLevel, format]);

  // Validate user permissions
  const permissions = validateExportPermissions(userRole, privacyLevel, getDataType());
  
  // Estimate export size
  const estimatedSize = template && data.length > 0 ? 
    estimateExportSize(data, template, selectedFormat) : 0;

  function getDataType() {
    if (!template) return 'unknown';
    if (template.id.includes('client')) return 'clients';
    if (template.id.includes('professional')) return 'professionals';
    if (template.id.includes('appointment')) return 'appointments';
    return 'statistics';
  }

  const handleExport = async () => {
    if (!template || !onExport) return;
    
    setIsExporting(true);
    
    try {
      await onExport(selectedFormat, template, {
        privacyLevel,
        filename: filename.trim() || undefined,
        includeMetadata,
        userRole
      });
      
      // Don't close dialog here - let the parent handle it after export completion
      
    } catch (error) {
      console.error('Export settings - export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  const getPrivacyLevelDescription = (level) => {
    const descriptions = {
      anonymous: t('export.privacy.anonymous', { 
        defaultValue: 'Only basic statistics and non-identifying information' 
      }),
      basic: t('export.privacy.basic', { 
        defaultValue: 'Names and basic contact information, sensitive data masked' 
      }),
      full: t('export.privacy.full', { 
        defaultValue: 'Complete information including sensitive personal data' 
      })
    };
    
    return descriptions[level] || descriptions.basic;
  };

  const getFileSizeText = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  if (!template) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isExporting}
    >
      <DialogTitle>
        <MDBox display="flex" alignItems="center" gap={1}>
          <DescriptionIcon />
          <MDTypography variant="h6">
            {t('export.settingsTitle', { defaultValue: 'Export Settings' })}
          </MDTypography>
        </MDBox>
      </DialogTitle>
      
      <DialogContent>
        <MDBox>
          {/* Template Information */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              {template.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {template.description}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip 
                label={selectedFormat.toUpperCase()} 
                size="small" 
                color="primary" 
              />
              <Chip 
                label={`${data.length} records`} 
                size="small" 
                variant="outlined" 
              />
              {estimatedSize > 0 && (
                <Chip 
                  label={`~${getFileSizeText(estimatedSize)}`} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Format Selection */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t('export.formatSettings', { defaultValue: 'Format Settings' })}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">
                  {t('export.selectFormat', { defaultValue: 'Export Format' })}
                </FormLabel>
                <RadioGroup
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="xlsx"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2">Excel (.xlsx)</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {t('export.excelDescription', { 
                            defaultValue: 'Rich formatting, multiple sheets, styling' 
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="csv"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2">CSV (.csv)</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {t('export.csvDescription', { 
                            defaultValue: 'Simple format, wide compatibility, streaming support' 
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          {/* Privacy Settings */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <SecurityIcon />
                <Typography variant="h6">
                  {t('export.privacySettings', { defaultValue: 'Privacy Settings' })}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">
                  {t('export.selectPrivacyLevel', { defaultValue: 'Privacy Level' })}
                </FormLabel>
                <RadioGroup
                  value={privacyLevel}
                  onChange={(e) => setPrivacyLevel(e.target.value)}
                >
                  {Object.values(PRIVACY_LEVELS).map((level) => (
                    <FormControlLabel
                      key={level}
                      value={level}
                      control={<Radio />}
                      disabled={!permissions.allowedPrivacyLevels.includes(level)}
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {level} Privacy
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {getPrivacyLevelDescription(level)}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              {/* Privacy Notice */}
              <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {generatePrivacyNotice(privacyLevel, getDataType(), data.length)}
                </Typography>
              </Alert>
            </AccordionDetails>
          </Accordion>

          {/* File Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t('export.fileSettings', { defaultValue: 'File Settings' })}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <TextField
                  fullWidth
                  label={t('export.customFilename', { defaultValue: 'Custom Filename (optional)' })}
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  helperText={t('export.filenameHelper', { 
                    defaultValue: 'Leave empty for automatic naming with timestamp' 
                  })}
                  placeholder={`${template.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`}
                  margin="normal"
                />

                <FormControlLabel
                  control={
                    <Radio
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">
                        {t('export.includeMetadata', { defaultValue: 'Include Export Metadata' })}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t('export.metadataHelper', { 
                          defaultValue: 'Adds export information and field descriptions (Excel only)' 
                        })}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Permission Warnings */}
          {!permissions.canExport && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {t('export.noPermission', { 
                defaultValue: 'You do not have permission to export this type of data.' 
              })}
            </Alert>
          )}

          {!permissions.canUsePrivacyLevel && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t('export.privacyLevelRestricted', { 
                defaultValue: 'Your role does not permit this privacy level. Please select a different level.' 
              })}
            </Alert>
          )}
        </MDBox>
      </DialogContent>
      
      <DialogActions>
        <MDButton
          variant="outlined"
          onClick={handleClose}
          disabled={isExporting}
        >
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </MDButton>
        <MDButton
          variant="contained"
          color="info"
          onClick={handleExport}
          disabled={
            isExporting || 
            !permissions.canExport || 
            !permissions.canUsePrivacyLevel ||
            data.length === 0
          }
        >
          {isExporting 
            ? t('export.exporting', { defaultValue: 'Exporting...' })
            : t('export.startExport', { defaultValue: 'Start Export' })
          }
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

ExportSettings.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  template: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    format: PropTypes.string,
    fields: PropTypes.array.isRequired
  }),
  format: PropTypes.oneOf(['xlsx', 'csv']),
  onExport: PropTypes.func.isRequired,
  data: PropTypes.array,
  defaultPrivacyLevel: PropTypes.oneOf(['anonymous', 'basic', 'full']),
  userRole: PropTypes.string
};

export default ExportSettings;