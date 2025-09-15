/**
 * VirtualizedDataGrid Component - High-performance data grid with TanStack Virtual
 * 
 * Optimized for large datasets with features:
 * - Virtual scrolling for performance
 * - Material-UI theme integration
 * - Accessibility support
 * - Dynamic column sizing
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTheme } from '@mui/material/styles';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

const VirtualizedDataGrid = ({
  data = [],
  columns = [],
  height = 600,
  rowHeight = 52,
  headerHeight = 56,
  onRowClick,
  loading = false,
  overscan = 10,
  emptyMessage = 'No data available',
}) => {
  const theme = useTheme();
  const parentRef = React.useRef();

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Memoized column widths calculation
  const columnWidths = useMemo(() => {
    const totalFlex = columns.reduce((sum, col) => sum + (col.flex || 1), 0);
    return columns.map(col => ({
      ...col,
      calculatedWidth: `${((col.flex || 1) / totalFlex) * 100}%`
    }));
  }, [columns]);

  const renderHeader = () => (
    <MDBox
      sx={{
        display: 'flex',
        height: headerHeight,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.grey[50],
        position: 'sticky',
        top: 0,
        zIndex: 1,
        alignItems: 'center',
      }}
    >
      {columnWidths.map((column) => (
        <MDBox
          key={column.field}
          sx={{
            width: column.calculatedWidth,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <MDTypography variant="subtitle2" fontWeight="medium">
            {column.headerName || column.field}
          </MDTypography>
        </MDBox>
      ))}
    </MDBox>
  );

  const renderRow = (virtualItem) => {
    const rowData = data[virtualItem.index];
    const isEven = virtualItem.index % 2 === 0;

    if (!rowData) {
      return (
        <MDBox
          key={`placeholder-${virtualItem.key}`}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: virtualItem.size,
            transform: `translateY(${virtualItem.start}px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isEven 
              ? 'transparent' 
              : theme.palette.action.hover,
          }}
        >
          <MDTypography variant="body2" color="textSecondary">
            Loading...
          </MDTypography>
        </MDBox>
      );
    }

    return (
      <MDBox
        key={virtualItem.key}
        onClick={() => onRowClick?.(rowData)}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: virtualItem.size,
          transform: `translateY(${virtualItem.start}px)`,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isEven 
            ? 'transparent' 
            : theme.palette.action.hover,
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        {columnWidths.map((column) => (
          <MDBox
            key={column.field}
            sx={{
              width: column.calculatedWidth,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              borderRight: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <MDTypography variant="body2" noWrap>
              {column.renderCell 
                ? column.renderCell({ row: rowData, value: rowData[column.field] })
                : rowData[column.field] || ''
              }
            </MDTypography>
          </MDBox>
        ))}
      </MDBox>
    );
  };

  if (loading) {
    return (
      <MDBox 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <MDTypography>Loading...</MDTypography>
      </MDBox>
    );
  }

  if (data.length === 0) {
    return (
      <MDBox 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <MDTypography color="textSecondary">{emptyMessage}</MDTypography>
      </MDBox>
    );
  }

  return (
    <MDBox sx={{ height, border: `1px solid ${theme.palette.divider}` }}>
      {renderHeader()}
      <MDBox
        ref={parentRef}
        data-testid="virtual-scroll-container"
        sx={{
          height: height - headerHeight,
          overflow: 'auto',
          contain: 'strict',
        }}
      >
        <MDBox
          sx={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map(renderRow)}
        </MDBox>
      </MDBox>
    </MDBox>
  );
};

VirtualizedDataGrid.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    field: PropTypes.string.isRequired,
    headerName: PropTypes.string,
    flex: PropTypes.number,
    renderCell: PropTypes.func,
  })).isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rowHeight: PropTypes.number,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  loading: PropTypes.bool,
  overscan: PropTypes.number,
  emptyMessage: PropTypes.string,
};

export default VirtualizedDataGrid;