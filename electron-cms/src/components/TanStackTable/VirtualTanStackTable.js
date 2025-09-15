/**
 * VirtualTanStackTable - Enhanced TanStack Table with virtualization support
 * 
 * Combines the power of TanStack Table with virtual scrolling for optimal performance
 * with large datasets while maintaining all existing features.
 */

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

// @mui material components
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

// @mui icons
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import RefreshIcon from '@mui/icons-material/Refresh';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Virtualization components
import { useVirtualizationTheme } from 'context/VirtualizationThemeProvider';
import { useScrollRestoration } from 'hooks/useScrollRestoration';

// Custom components
import EmptyState from 'components/EmptyState';
import LoadingState from 'components/LoadingState';

const VirtualTanStackTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  
  // Virtualization props
  enableVirtualization = true,
  virtualHeight = 600,
  rowHeight = 52,
  headerHeight = 56,
  overscan = 10,
  scrollRestorationKey,
  
  // Sorting props
  sorting = [],
  onSortingChange = () => {},
  enableSorting = true,
  manualSorting = false,
  
  // Filtering props
  globalFilter = '',
  onGlobalFilterChange = () => {},
  enableGlobalFilter = true,
  manualFiltering = false,
  
  // Selection props
  rowSelection = {},
  onRowSelectionChange = () => {},
  enableRowSelection = false,
  
  // Callbacks
  onRowClick,
  onRefresh,
  
  // Empty/error state props
  emptyStateType = 'data',
  emptyStateSize = 'medium',
  
  // Additional props
  className = '',
  sx = {},
}) => {
  const theme = useTheme();
  const vTheme = useVirtualizationTheme();
  
  // Local state for client-side operations
  const [localSorting, setLocalSorting] = useState([]);
  const [localGlobalFilter, setLocalGlobalFilter] = useState('');
  const [localRowSelection, setLocalRowSelection] = useState({});

  // Determine current state
  const currentSorting = manualSorting ? sorting : localSorting;
  const currentGlobalFilter = manualFiltering ? globalFilter : localGlobalFilter;
  const currentRowSelection = enableRowSelection ? rowSelection : localRowSelection;

  // TanStack Table configuration
  const table = useReactTable({
    data: data || [],
    columns,
    
    // Core features
    getCoreRowModel: getCoreRowModel(),
    
    // Sorting
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: manualSorting ? onSortingChange : setLocalSorting,
      state: { 
        sorting: currentSorting,
        globalFilter: currentGlobalFilter,
        rowSelection: currentRowSelection,
      },
      manualSorting,
    }),
    
    // Filtering
    ...(enableGlobalFilter && {
      getFilteredRowModel: getFilteredRowModel(),
      onGlobalFilterChange: manualFiltering ? onGlobalFilterChange : setLocalGlobalFilter,
      manualFiltering,
    }),
    
    // Row selection
    ...(enableRowSelection && {
      onRowSelectionChange: onRowSelectionChange || setLocalRowSelection,
      enableRowSelection: true,
    }),
    
    // Initial state
    initialState: {
      sorting: currentSorting,
      globalFilter: currentGlobalFilter,
    },
  });

  const { rows } = table.getRowModel();
  
  // Virtualization setup
  const parentRef = React.useRef();
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
    enabled: enableVirtualization,
  });

  // Scroll restoration
  useScrollRestoration(scrollRestorationKey, virtualizer);

  const virtualItems = enableVirtualization ? virtualizer.getVirtualItems() : [];

  // Render header
  const renderHeader = () => (
    <MDBox
      sx={{
        display: 'flex',
        height: headerHeight,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: vTheme.headerBackground,
        position: 'sticky',
        top: 0,
        zIndex: 2,
        alignItems: 'center',
      }}
    >
      {table.getHeaderGroups().map(headerGroup => 
        headerGroup.headers.map(header => {
          const column = header.column;
          const canSort = column.getCanSort();
          const sortDirection = column.getIsSorted();

          return (
            <MDBox
              key={header.id}
              sx={{
                width: header.getSize ? `${header.getSize()}px` : 'auto',
                minWidth: header.column.columnDef.minSize || 100,
                maxWidth: header.column.columnDef.maxSize || 'none',
                flex: header.column.columnDef.flex || 1,
                padding: `0 ${vTheme.cellPadding}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRight: `1px solid ${theme.palette.divider}`,
                cursor: canSort ? 'pointer' : 'default',
              }}
              onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
            >
              <MDTypography variant="subtitle2" fontWeight="medium" noWrap>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </MDTypography>
              
              {canSort && (
                <IconButton size="small" sx={{ ml: 1 }}>
                  {sortDirection === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortDirection === 'desc' ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : (
                    <UnfoldMoreIcon fontSize="small" />
                  )}
                </IconButton>
              )}
            </MDBox>
          );
        })
      )}
    </MDBox>
  );

  // Render virtualized row
  const renderVirtualRow = (virtualItem) => {
    const row = rows[virtualItem.index];
    if (!row) return null;

    const isSelected = enableRowSelection ? row.getIsSelected() : false;
    const isEven = virtualItem.index % 2 === 0;

    return (
      <MDBox
        key={row.id}
        data-index={virtualItem.index}
        onClick={() => onRowClick?.(row.original)}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: virtualItem.size,
          transform: `translateY(${virtualItem.start}px)`,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isSelected
            ? vTheme.selectedBackground
            : isEven 
              ? vTheme.evenRowBackground 
              : vTheme.oddRowBackground,
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': {
            backgroundColor: vTheme.hoverBackground,
          },
        }}
      >
        {row.getVisibleCells().map(cell => (
          <MDBox
            key={cell.id}
            sx={{
              width: cell.column.getSize ? `${cell.column.getSize()}px` : 'auto',
              minWidth: cell.column.columnDef.minSize || 100,
              maxWidth: cell.column.columnDef.maxSize || 'none',
              flex: cell.column.columnDef.flex || 1,
              padding: `0 ${vTheme.cellPadding}`,
              display: 'flex',
              alignItems: 'center',
              borderRight: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <MDBox sx={{ width: '100%', overflow: 'hidden' }}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </MDBox>
          </MDBox>
        ))}
      </MDBox>
    );
  };

  // Render regular row (non-virtualized)
  const renderRegularRows = () => (
    <MDBox>
      {rows.map((row, index) => {
        const isSelected = enableRowSelection ? row.getIsSelected() : false;
        const isEven = index % 2 === 0;

        return (
          <MDBox
            key={row.id}
            onClick={() => onRowClick?.(row.original)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: rowHeight,
              backgroundColor: isSelected
                ? vTheme.selectedBackground
                : isEven 
                  ? vTheme.evenRowBackground 
                  : vTheme.oddRowBackground,
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': {
                backgroundColor: vTheme.hoverBackground,
              },
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            {row.getVisibleCells().map(cell => (
              <MDBox
                key={cell.id}
                sx={{
                  width: cell.column.getSize ? `${cell.column.getSize()}px` : 'auto',
                  minWidth: cell.column.columnDef.minSize || 100,
                  maxWidth: cell.column.columnDef.maxSize || 'none',
                  flex: cell.column.columnDef.flex || 1,
                  padding: `0 ${vTheme.cellPadding}`,
                  display: 'flex',
                  alignItems: 'center',
                  borderRight: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                }}
              >
                <MDBox sx={{ width: '100%', overflow: 'hidden' }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </MDBox>
              </MDBox>
            ))}
          </MDBox>
        );
      })}
    </MDBox>
  );

  // Handle loading state
  if (loading) {
    return (
      <Paper sx={{ ...sx }} className={className}>
        <MDBox sx={{ height: virtualHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingState size={emptyStateSize} />
        </MDBox>
      </Paper>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Paper sx={{ ...sx }} className={className}>
        <Alert 
          severity="error" 
          action={
            onRefresh && (
              <IconButton color="inherit" size="small" onClick={onRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            )
          }
        >
          {error.message || 'An error occurred while loading data'}
        </Alert>
      </Paper>
    );
  }

  // Handle empty state
  if (rows.length === 0) {
    return (
      <Paper sx={{ ...sx }} className={className}>
        <MDBox sx={{ height: virtualHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState type={emptyStateType} size={emptyStateSize} onRefresh={onRefresh} />
        </MDBox>
      </Paper>
    );
  }

  return (
    <Paper sx={{ ...sx }} className={className}>
      <MDBox sx={{ height: virtualHeight, border: `1px solid ${theme.palette.divider}` }}>
        {renderHeader()}
        
        {enableVirtualization ? (
          <MDBox
            ref={parentRef}
            sx={{
              height: virtualHeight - headerHeight,
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
              {virtualItems.map(renderVirtualRow)}
            </MDBox>
          </MDBox>
        ) : (
          <MDBox
            sx={{
              height: virtualHeight - headerHeight,
              overflow: 'auto',
            }}
          >
            {renderRegularRows()}
          </MDBox>
        )}
      </MDBox>
    </Paper>
  );
};

VirtualTanStackTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.object,
  
  // Virtualization props
  enableVirtualization: PropTypes.bool,
  virtualHeight: PropTypes.number,
  rowHeight: PropTypes.number,
  headerHeight: PropTypes.number,
  overscan: PropTypes.number,
  scrollRestorationKey: PropTypes.string,
  
  // Table feature props
  sorting: PropTypes.array,
  onSortingChange: PropTypes.func,
  enableSorting: PropTypes.bool,
  manualSorting: PropTypes.bool,
  globalFilter: PropTypes.string,
  onGlobalFilterChange: PropTypes.func,
  enableGlobalFilter: PropTypes.bool,
  manualFiltering: PropTypes.bool,
  rowSelection: PropTypes.object,
  onRowSelectionChange: PropTypes.func,
  enableRowSelection: PropTypes.bool,
  
  // Callbacks
  onRowClick: PropTypes.func,
  onRefresh: PropTypes.func,
  
  // Styling
  className: PropTypes.string,
  sx: PropTypes.object,
  emptyStateType: PropTypes.string,
  emptyStateSize: PropTypes.string,
};

export default VirtualTanStackTable;