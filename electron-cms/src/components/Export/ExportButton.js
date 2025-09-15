/**
 * Export Button Component - Main export trigger with dropdown options
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// Material-UI components
import { 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  CircularProgress,
  Divider
} from '@mui/material';

// Material-UI icons
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SettingsIcon from '@mui/icons-material/Settings';

// Material Dashboard components
import MDButton from 'components/MDButton';
import ExportProgress from './ExportProgress';
import ExportSettings from './ExportSettings';

// Export hooks
import useExcelExport from 'hooks/useExcelExport';
import useCSVExport from 'hooks/useCSVExport';

const ExportButton = ({ 
  data, 
  templates = [],
  onExportComplete,
  disabled = false,
  size = 'medium',
  variant = 'outlined',
  color = 'info',
  label,
  showProgress = true,
  defaultPrivacyLevel = 'basic',
  userRole = 'admin'
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  
  const { exportToExcel, progress: excelProgress, resetProgress: resetExcelProgress } = useExcelExport();
  const { exportToCSV, progress: csvProgress, resetProgress: resetCSVProgress, cancelExport } = useCSVExport();
  
  // Get current progress based on active export
  const currentProgress = excelProgress.status !== 'idle' ? excelProgress : csvProgress;
  const isExporting = currentProgress.status === 'processing';
  
  const handleClick = (event) => {
    if (!isExporting) {
      setAnchorEl(event.currentTarget);
    }
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleQuickExport = async (format, template = templates[0]) => {
    if (!template) {
      console.warn('No template available for quick export');
      return;
    }
    
    handleClose();
    await performExport(format, template, { privacyLevel: defaultPrivacyLevel });
  };
  
  const handleCustomExport = (template, format = 'xlsx') => {
    setSelectedTemplate(template);
    setSelectedFormat(format);
    setSettingsOpen(true);
    handleClose();
  };
  
  const performExport = async (format, template, options = {}) => {
    try {
      let result;
      const exportOptions = {
        data,
        template,
        privacyLevel: options.privacyLevel || defaultPrivacyLevel,
        userRole,
        filename: options.filename,
        ...options
      };
      
      if (format === 'xlsx') {
        result = await exportToExcel(exportOptions);
      } else if (format === 'csv') {
        result = await exportToCSV(exportOptions);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
      
      if (result.success && onExportComplete) {
        onExportComplete(result);
      }
      
      return result;
      
    } catch (error) {
      console.error('Export failed:', error);
      // Error is already handled by the export hooks
      throw error;
    }
  };
  
  const handleCancelExport = () => {
    if (csvProgress.status === 'processing') {
      cancelExport();
    }
    resetExcelProgress();
    resetCSVProgress();
  };
  
  const getButtonLabel = () => {
    if (label) return label;
    
    if (isExporting) {
      return t('export.exporting', { defaultValue: 'Exporting...' });
    }
    
    return t('export.export', { defaultValue: 'Export' });
  };
  
  const isDataAvailable = data && Array.isArray(data) && data.length > 0;
  const hasTemplates = templates && templates.length > 0;
  
  return (
    <>
      <MDButton
        variant={variant}
        color={color}
        size={size}
        startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
        onClick={handleClick}
        disabled={disabled || !isDataAvailable || !hasTemplates}
        sx={{ minWidth: 120 }}
      >
        {getButtonLabel()}
      </MDButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 240 }
        }}
      >
        {/* Quick export options */}
        {hasTemplates && (
          <>
            <MenuItem onClick={() => handleQuickExport('xlsx')}>
              <ListItemIcon>
                <TableChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={t('export.quickExcel', { defaultValue: 'Quick Excel Export' })}
                secondary={`${data?.length || 0} records`}
              />
            </MenuItem>
            
            <MenuItem onClick={() => handleQuickExport('csv')}>
              <ListItemIcon>
                <InsertDriveFileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={t('export.quickCSV', { defaultValue: 'Quick CSV Export' })}
                secondary={`${data?.length || 0} records`}
              />
            </MenuItem>
            
            <Divider />
          </>
        )}
        
        {/* Template-specific export options */}
        {templates.map((template) => (
          <MenuItem
            key={template.id}
            onClick={() => handleCustomExport(template, template.format)}
          >
            <ListItemIcon>
              {template.format === 'xlsx' ? 
                <TableChartIcon fontSize="small" /> : 
                <InsertDriveFileIcon fontSize="small" />
              }
            </ListItemIcon>
            <ListItemText 
              primary={template.name}
              secondary={template.description}
            />
          </MenuItem>
        ))}
        
        {hasTemplates && (
          <>
            <Divider />
            <MenuItem onClick={() => handleCustomExport(templates[0])}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={t('export.customSettings', { defaultValue: 'Custom Export Settings' })}
                secondary={t('export.configureOptions', { defaultValue: 'Configure privacy and fields' })}
              />
            </MenuItem>
          </>
        )}
        
        {!hasTemplates && (
          <MenuItem disabled>
            <ListItemText 
              primary={t('export.noTemplates', { defaultValue: 'No templates available' })}
            />
          </MenuItem>
        )}
      </Menu>
      
      {/* Progress indicator */}
      {showProgress && isExporting && (
        <ExportProgress
          progress={currentProgress}
          onCancel={csvProgress.status === 'processing' ? handleCancelExport : undefined}
        />
      )}
      
      {/* Export settings modal */}
      <ExportSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        template={selectedTemplate}
        format={selectedFormat}
        onExport={performExport}
        data={data}
        defaultPrivacyLevel={defaultPrivacyLevel}
        userRole={userRole}
      />
    </>
  );
};

ExportButton.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  templates: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    format: PropTypes.oneOf(['xlsx', 'csv']),
    fields: PropTypes.array.isRequired
  })),
  onExportComplete: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'info', 'success', 'warning', 'error']),
  label: PropTypes.string,
  showProgress: PropTypes.bool,
  defaultPrivacyLevel: PropTypes.oneOf(['anonymous', 'basic', 'full']),
  userRole: PropTypes.string
};

export default ExportButton;