/**
 * TanStackTable - Modern, headless table component using @tanstack/react-table
 * Enhanced with drag and drop functionality
 */

import React, { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

// @mui material components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// @mui icons
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Custom components
import EmptyState from 'components/EmptyState';
import LoadingState from 'components/LoadingState';

// Drag and drop components
import DragAndDropProvider from 'components/DragAndDrop';
import DraggableHeader from './DraggableHeader';
import DraggableRow from './DraggableRow';

// Drag and drop hooks
import useColumnDragging from 'hooks/useColumnDragging';
import useRowDragging from 'hooks/useRowDragging';

function TanStackTable({
  data = [],
  columns = [],
  loading = false,
  error = null,
  
  // Drag and drop props
  enableColumnDragging = false,
  enableRowDragging = false,
  onColumnOrderChange,
  onRowOrderChange,
  dragOptions = {},
  
  // Pagination props
  totalRowCount = 0,
  pageIndex = 0,
  pageSize = 10,
  onPaginationChange = () => {},
  pageSizeOptions = [5, 10, 25, 50, 100],
  
  // Sorting props
  sorting = [],
  onSortingChange = () => {},
  enableSorting = true,
  
  // Filtering props
  globalFilter = '',
  onGlobalFilterChange = () => {},
  enableGlobalFilter = true,
  
  // Selection props
  rowSelection = {},
  onRowSelectionChange = () => {},
  enableRowSelection = false,
  
  // Styling props
  height = 'auto',
  maxHeight = '600px',
  stickyHeader = true,
  
  // Empty/error state props
  emptyStateType = 'data',
  emptyStateSize = 'medium',
  onRefresh = () => {},
  
  // Additional props
  enableColumnFilters = false,
  enableColumnResizing = false,
  className = '',
  sx = {},
  
  // Server-side props
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
}) {
  // Local state for client-side operations
  const [localSorting, setLocalSorting] = useState([]);
  const [localGlobalFilter, setLocalGlobalFilter] = useState('');
  const [localRowSelection, setLocalRowSelection] = useState({});

  // Determine if operations are manual or local
  const currentSorting = manualSorting ? sorting : localSorting;
  const currentGlobalFilter = manualFiltering ? globalFilter : localGlobalFilter;
  const currentRowSelection = enableRowSelection ? (manualPagination ? rowSelection : localRowSelection) : {};

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
      state: { sorting: currentSorting },
      manualSorting,
    }),
    
    // Pagination
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      if (manualPagination) {
        if (typeof updater === 'function') {
          const newPagination = updater({ pageIndex, pageSize });
          onPaginationChange(newPagination);
        } else {
          onPaginationChange(updater);
        }
      }
    },
    state: {
      pagination: { pageIndex, pageSize },
      ...(enableSorting && { sorting: currentSorting }),
      ...(enableGlobalFilter && { globalFilter: currentGlobalFilter }),
      ...(enableRowSelection && { rowSelection: currentRowSelection }),
    },
    manualPagination,
    pageCount: manualPagination ? Math.ceil(totalRowCount / pageSize) : undefined,
    
    // Filtering
    ...(enableGlobalFilter && {
      getFilteredRowModel: getFilteredRowModel(),
      onGlobalFilterChange: manualFiltering ? onGlobalFilterChange : setLocalGlobalFilter,
      manualFiltering,
    }),
    
    // Row selection
    ...(enableRowSelection && {
      onRowSelectionChange: manualPagination ? onRowSelectionChange : setLocalRowSelection,
      enableRowSelection: true,
    }),
    
    // Column features
    enableColumnFilters,
    enableColumnResizing,
  });

  // Drag and drop hooks
  const columnDragging = useColumnDragging(table, {
    persistKey: `table-columns-${className}`,
    enablePersistence: true,
    onColumnOrderChange,
  });
  
  const rowDragging = useRowDragging(table, {
    className: dragOptions.className,
    orderField: dragOptions.orderField || 'displayOrder',
    optimisticUpdates: dragOptions.optimisticUpdates !== false,
    onRowOrderChange,
    onError: dragOptions.onError,
  });

  // Memoized table data
  const {
    getHeaderGroups,
    getRowModel,
    getCanPreviousPage,
    getCanNextPage,
    getPageCount,
    getPaginationRowModel: getPaginationModel,
  } = table;

  const rows = getRowModel().rows;
  const headerGroups = getHeaderGroups();

  // Handle pagination change for MUI TablePagination
  const handlePageChange = (event, newPage) => {
    if (manualPagination) {
      onPaginationChange({ pageIndex: newPage, pageSize });
    } else {
      table.setPageIndex(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    if (manualPagination) {
      onPaginationChange({ pageIndex: 0, pageSize: newPageSize });
    } else {
      table.setPageSize(newPageSize);
      table.setPageIndex(0);
    }
  };

  // Render sort icon
  const renderSortIcon = (header) => {
    if (!enableSorting || !header.column.getCanSort()) return null;
    
    const sortDirection = header.column.getIsSorted();
    if (sortDirection === 'asc') {
      return <ArrowUpwardIcon fontSize="small" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDownwardIcon fontSize="small" />;
    }
    return <UnfoldMoreIcon fontSize="small" sx={{ opacity: 0.5 }} />;
  };

  // Error state
  if (error && !loading) {
    return (
      <MDBox>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <MDButton size="small" onClick={() => onRefresh()}>
              Retry
            </MDButton>
          }
        >
          {error?.message || 'Failed to load data'}
        </Alert>
      </MDBox>
    );
  }

  // Loading state
  if (loading && (!data || data.length === 0)) {
    return (
      <LoadingState 
        type="table" 
        size="medium"
        variant="skeleton"
        rows={pageSize}
      />
    );
  }

  // Empty state
  if (!loading && !error && (!data || data.length === 0)) {
    return (
      <EmptyState
        type={emptyStateType}
        size={emptyStateSize}
        actionLabel="Refresh Data"
        onActionClick={onRefresh}
        showRefresh={true}
        onRefresh={onRefresh}
      />
    );
  }

  // Table content component
  const TableContent = () => (
    <TableContainer sx={{ maxHeight, height }}>
      <Table stickyHeader={stickyHeader} size="medium">
        {/* Table Header */}
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {enableRowDragging && (
                <TableCell sx={{ width: 48, padding: 0.5 }}>
                  {/* Row drag handle header */}
                </TableCell>
              )}
              {headerGroup.headers.map((header) => {
                const HeaderComponent = enableColumnDragging ? DraggableHeader : TableCell;
                const headerProps = enableColumnDragging
                  ? {
                      header,
                      enableDragging: true,
                      key: header.id,
                      align: "left",
                      style: { 
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize || 100,
                        maxWidth: header.column.columnDef.maxSize,
                      },
                      sx: {
                        backgroundColor: 'grey.100',
                        fontWeight: 'bold',
                        cursor: enableSorting && header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                        '&:hover': {
                          backgroundColor: enableSorting && header.column.getCanSort() ? 'grey.200' : 'grey.100',
                        },
                      },
                      onClick: enableSorting ? header.column.getToggleSortingHandler() : undefined,
                    }
                  : {
                      key: header.id,
                      align: "left",
                      style: { 
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize || 100,
                        maxWidth: header.column.columnDef.maxSize,
                      },
                      sx: {
                        backgroundColor: 'grey.100',
                        fontWeight: 'bold',
                        cursor: enableSorting && header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                        '&:hover': {
                          backgroundColor: enableSorting && header.column.getCanSort() ? 'grey.200' : 'grey.100',
                        },
                      },
                      onClick: enableSorting ? header.column.getToggleSortingHandler() : undefined,
                    };
                
                return (
                  <HeaderComponent {...headerProps}>
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <MDTypography variant="button" fontWeight="bold" color="text">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </MDTypography>
                      {renderSortIcon(header)}
                    </MDBox>
                  </HeaderComponent>
                );
              })}
            </TableRow>
          ))}
        </TableHead>

        {/* Table Body */}
        <TableBody>
          {loading && data && data.length > 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + (enableRowDragging ? 1 : 0)} sx={{ p: 0 }}>
                <LinearProgress />
              </TableCell>
            </TableRow>
          )}
          
          {rows.map((row) => {
            const RowComponent = enableRowDragging ? DraggableRow : TableRow;
            const rowProps = enableRowDragging
              ? {
                  row,
                  enableDragging: true,
                  key: row.id,
                  selected: enableRowSelection && row.getIsSelected(),
                  hover: true,
                  sx: {
                    '&:hover': {
                      backgroundColor: 'grey.50',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.50',
                    },
                  },
                }
              : {
                  key: row.id,
                  selected: enableRowSelection && row.getIsSelected(),
                  hover: true,
                  sx: {
                    '&:hover': {
                      backgroundColor: 'grey.50',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.50',
                    },
                  },
                };
            
            return (
              <RowComponent {...rowProps}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    align="left"
                    sx={{ 
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </RowComponent>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Draggable table wrapper
  const DraggableTableContent = () => (
    <DragAndDropProvider
      onDragEnd={(enableColumnDragging && columnDragging.handleColumnDragEnd) ||
                 (enableRowDragging && rowDragging.handleRowDragEnd) ||
                 (() => {})}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Started dragging ${active.id}`,
          onDragOver: ({ active, over }) => 
            over ? `Dragging ${active.id} over ${over.id}` : `Dragging ${active.id}`,
          onDragEnd: ({ active, over }) => 
            over ? `Dropped ${active.id} on ${over.id}` : `Dropped ${active.id}`,
        },
      }}
    >
      <TableContent />
    </DragAndDropProvider>
  );

  return (
    <MDBox className={className} sx={sx}>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {(enableColumnDragging || enableRowDragging) ? (
          <DraggableTableContent />
        ) : (
          <TableContent />
        )}

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={pageSizeOptions}
          component="div"
          count={manualPagination ? totalRowCount : table.getFilteredRowModel().rows.length}
          rowsPerPage={pageSize}
          page={pageIndex}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handlePageSizeChange}
          showFirstButton
          showLastButton
          sx={{
            borderTop: '1px solid',
            borderColor: 'grey.200',
          }}
        />
      </Paper>
    </MDBox>
  );
}

export default TanStackTable;