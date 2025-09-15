/**
 * ClientsDataGridMigration - Side-by-side comparison component
 * 
 * Allows testing and comparison between regular and virtualized data grids
 * to validate performance improvements and feature parity.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import { Switch, FormControlLabel } from '@mui/material';

// Components
import VirtualizedClientsGrid from 'components/VirtualizedClientsGrid';
import RegularClientsGrid from './index'; // Existing implementation
import { VirtualizationThemeProvider } from 'context/VirtualizationThemeProvider';

// Icons
import SpeedIcon from '@mui/icons-material/Speed';
import ViewListIcon from '@mui/icons-material/ViewList';

const ClientsDataGridMigration = ({ 
  onViewClient, 
  searchTerm = '', 
  filters = {},
  height = '100%',
}) => {
  const [useVirtualized, setUseVirtualized] = useState(false);
  const [showStats, setShowStats] = useState(false);

  return (
    <MDBox>
      {/* Control Panel */}
      <MDBox 
        mb={3} 
        p={2} 
        sx={{ 
          backgroundColor: 'grey.50', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <MDTypography variant="h6" fontWeight="medium">
            Data Grid Performance Comparison
          </MDTypography>
          
          <FormControlLabel
            control={
              <Switch
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                size="small"
              />
            }
            label="Show Performance Stats"
          />
        </MDBox>

        <MDBox display="flex" gap={1} mb={2}>
          <MDButton
            variant={useVirtualized ? 'contained' : 'outlined'}
            color="info"
            onClick={() => setUseVirtualized(true)}
            startIcon={<SpeedIcon />}
            size="small"
          >
            Virtualized (New)
          </MDButton>
          <MDButton
            variant={!useVirtualized ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setUseVirtualized(false)}
            startIcon={<ViewListIcon />}
            size="small"
          >
            Regular (Current)
          </MDButton>
        </MDBox>

        {/* Performance Info */}
        <MDBox>
          <MDTypography variant="caption" color="text">
            <strong>Virtualized:</strong> Renders only visible rows (~10-20 DOM nodes for any dataset size)
          </MDTypography>
          <br />
          <MDTypography variant="caption" color="text">
            <strong>Regular:</strong> Renders all rows in current page (~25-100 DOM nodes per page)
          </MDTypography>
        </MDBox>
      </MDBox>

      {/* Performance Stats Display */}
      {showStats && (
        <MDBox 
          mb={2} 
          p={2} 
          sx={{ 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
            Performance Metrics
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Mode: {useVirtualized ? 'Virtualized' : 'Regular'} | 
            Expected DOM Nodes: {useVirtualized ? '~15' : '~50+'} | 
            Memory Usage: {useVirtualized ? 'Constant' : 'Linear with data size'}
          </MDTypography>
        </MDBox>
      )}

      {/* Data Grid Display */}
      <MDBox>
        {useVirtualized ? (
          <VirtualizationThemeProvider>
            <VirtualizedClientsGrid
              onClientSelect={onViewClient}
              initialFilters={{
                ...filters,
                search: searchTerm,
              }}
              height={typeof height === 'string' ? 600 : height}
            />
          </VirtualizationThemeProvider>
        ) : (
          <RegularClientsGrid
            onViewClient={onViewClient}
            searchTerm={searchTerm}
            filters={filters}
            height={height}
          />
        )}
      </MDBox>

      {/* Feature Comparison Info */}
      <MDBox mt={2}>
        <MDTypography variant="caption" color="textSecondary">
          Both versions support: Row selection, sorting, filtering, search, export functionality.
          Virtualized version adds: Infinite scrolling, better performance for large datasets.
        </MDTypography>
      </MDBox>
    </MDBox>
  );
};

ClientsDataGridMigration.propTypes = {
  onViewClient: PropTypes.func,
  searchTerm: PropTypes.string,
  filters: PropTypes.object,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ClientsDataGridMigration;