/**
 * Drag Overlay Component
 * Custom drag overlay with Material-UI styling
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, TableCell, TableRow, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

const DragOverlay = ({ 
  item, 
  offset = { x: 0, y: 0 },
  strategy = 'vertical',
  dragType = 'row'
}) => {
  const theme = useTheme();

  // Base overlay styles
  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: theme.zIndex.modal + 1,
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    opacity: 0.9,
    transition: 'none',
    willChange: 'transform',
  };

  /**
   * Render column overlay
   */
  const renderColumnOverlay = () => (
    <Paper
      elevation={8}
      sx={{
        ...overlayStyles,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: 1,
        minWidth: 120,
        maxWidth: 200,
      }}
    >
      <MDBox p={2}>
        <MDTypography variant="body2" fontWeight="medium">
          {item.name || item.header || 'Column'}
        </MDTypography>
      </MDBox>
    </Paper>
  );

  /**
   * Render row overlay
   */
  const renderRowOverlay = () => (
    <Paper
      elevation={8}
      sx={{
        ...overlayStyles,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: 1,
        minWidth: 300,
        maxWidth: 500,
      }}
    >
      <MDBox p={1}>
        <MDBox display="flex" alignItems="center" gap={2}>
          {/* Row content preview */}
          <MDBox flex={1}>
            <MDTypography variant="body2" fontWeight="medium" noWrap>
              {item.name || item.title || `Row ${item.id}`}
            </MDTypography>
            {item.subtitle && (
              <MDTypography variant="caption" color="text.secondary" noWrap>
                {item.subtitle}
              </MDTypography>
            )}
          </MDBox>
          
          {/* Additional info */}
          {item.status && (
            <MDBox>
              <MDTypography variant="caption" color="text.secondary">
                {item.status}
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      </MDBox>
    </Paper>
  );

  /**
   * Render professional status overlay
   */
  const renderProfessionalOverlay = () => (
    <Paper
      elevation={8}
      sx={{
        ...overlayStyles,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.info.main}`,
        borderRadius: 2,
        minWidth: 250,
        maxWidth: 350,
      }}
    >
      <MDBox p={2}>
        <MDBox display="flex" alignItems="center" gap={2}>
          {/* Professional info */}
          <MDBox flex={1}>
            <MDTypography variant="body2" fontWeight="medium">
              {item.firstName} {item.lastName}
            </MDTypography>
            <MDTypography variant="caption" color="text.secondary">
              {item.profession || 'Professional'}
            </MDTypography>
            {item.licenseNumber && (
              <MDTypography variant="caption" color="text.secondary" display="block">
                License: {item.licenseNumber}
              </MDTypography>
            )}
          </MDBox>
          
          {/* Current status */}
          <MDBox>
            <MDBox
              px={2}
              py={0.5}
              borderRadius={1}
              backgroundColor={getStatusColor(item.verificationStatus)}
            >
              <MDTypography variant="caption" color="white" fontWeight="medium">
                {item.verificationStatus || 'Pending'}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>
    </Paper>
  );

  /**
   * Render appointment overlay
   */
  const renderAppointmentOverlay = () => (
    <Paper
      elevation={8}
      sx={{
        ...overlayStyles,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.success.main}`,
        borderRadius: 2,
        minWidth: 280,
        maxWidth: 400,
      }}
    >
      <MDBox p={2}>
        <MDBox>
          <MDTypography variant="body2" fontWeight="medium">
            {item.clientName || 'Client'}
          </MDTypography>
          <MDTypography variant="caption" color="text.secondary">
            {item.appointmentType || 'Consultation'}
          </MDTypography>
          {item.scheduledTime && (
            <MDTypography variant="caption" color="text.secondary" display="block">
              {new Date(item.scheduledTime).toLocaleString()}
            </MDTypography>
          )}
          {item.duration && (
            <MDTypography variant="caption" color="text.secondary" display="block">
              Duration: {item.duration} minutes
            </MDTypography>
          )}
        </MDBox>
      </MDBox>
    </Paper>
  );

  /**
   * Get status color for professional verification
   */
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'rejected':
        return theme.palette.error.main;
      case 'under-review':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  /**
   * Determine overlay type and render appropriate component
   */
  const renderOverlay = () => {
    // Determine drag type from item properties
    if (item.columnDef || item.header !== undefined) {
      return renderColumnOverlay();
    }
    
    if (item.firstName && item.lastName && item.profession) {
      return renderProfessionalOverlay();
    }
    
    if (item.clientName || item.appointmentType) {
      return renderAppointmentOverlay();
    }
    
    // Default to row overlay
    return renderRowOverlay();
  };

  return renderOverlay();
};

/**
 * Get drag type from item
 */
const getDragTypeFromItem = (item) => {
  if (item.columnDef || item.header !== undefined) {
    return 'column';
  }
  
  if (item.firstName && item.lastName && item.profession) {
    return 'professional';
  }
  
  if (item.clientName || item.appointmentType) {
    return 'appointment';
  }
  
  return 'row';
};

DragOverlay.propTypes = {
  item: PropTypes.object.isRequired,
  offset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  strategy: PropTypes.oneOf(['vertical', 'horizontal']),
  dragType: PropTypes.string,
};

export default DragOverlay;