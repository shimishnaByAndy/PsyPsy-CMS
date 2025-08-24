/**
 * VirtualizedClientsGrid - High-performance client data grid
 * 
 * Optimized for large datasets with virtual scrolling, infinite loading,
 * and seamless integration with existing PsyPsy CMS patterns.
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useVirtualizer } from '@tanstack/react-virtual';
import VirtualizedDataGrid from 'components/VirtualizedDataGrid';
import { VirtualizedDataService } from 'services/virtualizedDataService';
import { useInfiniteVirtualData } from 'hooks/useInfiniteVirtualData';
import MDChip from 'components/MDChip';
import MDButton from 'components/MDButton';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import { Avatar } from '@mui/material';

// Import utilities
import { formatPhoneNumber } from 'utils/phoneUtils';
import { calculateAge } from 'utils/dateUtils';

const VirtualizedClientsGrid = ({ 
  onClientSelect, 
  initialFilters = {},
  height = 600,
  rowHeight = 52,
}) => {
  // Create data service instance
  const dataService = useMemo(() => new VirtualizedDataService('Client'), []);
  
  // Use infinite loading hook
  const { 
    data, 
    totalCount, 
    loading, 
    loadVisibleRange,
    refresh,
    error,
  } = useInfiniteVirtualData(dataService, initialFilters);

  // Define columns for clients table
  const columns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Client',
      flex: 2,
      renderCell: ({ row }) => {
        if (!row || !row.clientPtr) return '';
        
        const client = row.clientPtr;
        const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
        const initials = `${(client.firstName || '').charAt(0)}${(client.lastName || '').charAt(0)}`;
        
        return (
          <MDBox display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
              {initials}
            </Avatar>
            <MDBox>
              <MDTypography variant="button" fontWeight="medium">
                {fullName || 'N/A'}
              </MDTypography>
              <MDTypography variant="caption" color="text" fontWeight="regular">
                {row.email}
              </MDTypography>
            </MDBox>
          </MDBox>
        );
      },
    },
    {
      field: 'age',
      headerName: 'Age',
      flex: 0.5,
      renderCell: ({ row }) => {
        if (!row || !row.clientPtr || !row.clientPtr.dob) return '';
        return calculateAge(row.clientPtr.dob);
      },
    },
    {
      field: 'gender',
      headerName: 'Gender',
      flex: 0.8,
      renderCell: ({ row }) => {
        if (!row || !row.clientPtr) return '';
        
        const gender = row.clientPtr.gender;
        const genderMap = {
          1: 'Woman',
          2: 'Man',  
          3: 'Other',
          4: 'Not Disclosed',
        };
        
        const genderLabel = gender && genderMap[gender] ? genderMap[gender] : 'Unknown';
        const genderColors = {
          'Woman': 'secondary',
          'Man': 'primary',
          'Other': 'info',
          'Not Disclosed': 'default',
          'Unknown': 'default',
        };
        
        return (
          <MDChip 
            label={genderLabel} 
            size="small" 
            color={genderColors[genderLabel] || 'default'}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      renderCell: ({ row }) => {
        if (!row || !row.clientPtr || !row.clientPtr.phoneNb) return '';
        return formatPhoneNumber(row.clientPtr.phoneNb, 'CA');
      },
    },
    {
      field: 'languages',
      headerName: 'Languages',
      flex: 1.2,
      renderCell: ({ row }) => {
        if (!row || !row.clientPtr || !row.clientPtr.spokenLangArr) return '';
        
        const languages = row.clientPtr.spokenLangArr || [];
        
        return (
          <MDBox display="flex" gap={0.5} flexWrap="wrap">
            {languages.slice(0, 2).map((lang, index) => (
              <MDChip 
                key={index}
                label={lang} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            ))}
            {languages.length > 2 && (
              <MDChip 
                label={`+${languages.length - 2}`} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            )}
          </MDBox>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      renderCell: ({ row }) => {
        const status = row?.status || 'Active';
        const statusColors = {
          'Active': 'success',
          'Inactive': 'warning',
          'Suspended': 'error',
          'Pending': 'info',
        };
        
        return (
          <MDChip
            label={status}
            color={statusColors[status] || 'default'}
            size="small"
            variant="filled"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      renderCell: ({ row }) => (
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onClientSelect?.(row);
          }}
        >
          View
        </MDButton>
      ),
    },
  ], [onClientSelect]);

  // Virtualization setup
  const parentRef = React.useRef();
  const virtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 20,
  });

  // Load data when virtualized range changes
  React.useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    if (virtualItems.length > 0) {
      const startIndex = virtualItems[0].index;
      const endIndex = virtualItems[virtualItems.length - 1].index + 1;
      
      // Load visible range with buffer
      loadVisibleRange(startIndex, endIndex, 50);
    }
  }, [virtualizer.getVirtualItems(), loadVisibleRange]);

  // Handle errors
  if (error) {
    return (
      <MDBox 
        sx={{ 
          height, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <MDTypography color="error">
          Error loading clients: {error.message}
        </MDTypography>
        <MDButton variant="outlined" onClick={refresh}>
          Retry
        </MDButton>
      </MDBox>
    );
  }

  // Filter out null placeholders for rendering
  const visibleData = data.filter(Boolean);

  return (
    <VirtualizedDataGrid
      data={visibleData}
      columns={columns}
      height={height}
      rowHeight={rowHeight}
      onRowClick={onClientSelect}
      loading={loading && visibleData.length === 0}
      emptyMessage={totalCount === 0 ? "No clients found" : "Loading clients..."}
    />
  );
};

VirtualizedClientsGrid.propTypes = {
  onClientSelect: PropTypes.func,
  initialFilters: PropTypes.object,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rowHeight: PropTypes.number,
};

export default VirtualizedClientsGrid;