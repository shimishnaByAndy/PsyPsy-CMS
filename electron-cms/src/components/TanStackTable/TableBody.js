/**
 * TableBody - Enhanced body component for TanStack Table
 * Handles row rendering, selection, and interactions
 */

import React from 'react';
import { flexRender } from '@tanstack/react-table';

// @mui material components
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Collapse from '@mui/material/Collapse';
import LinearProgress from '@mui/material/LinearProgress';

// @mui icons
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function CustomTableBody({ 
  table,
  loading = false,
  enableRowSelection = false,
  enableExpanding = false,
  onRowClick = null,
  onRowDoubleClick = null,
  rowHeight = 'medium',
  virtualized = false,
  virtualizedProps = {},
  customRowRenderer = null,
  loadingRowCount = 10,
}) {
  const rows = table.getRowModel().rows;
  
  // Loading skeleton rows
  const renderLoadingRows = () => {
    if (!loading) return null;
    
    const skeletonRows = [];
    const columnCount = table.getAllColumns().filter(col => col.getIsVisible()).length;
    const selectionColumns = enableRowSelection ? 1 : 0;
    const expandingColumns = enableExpanding ? 1 : 0;
    const totalColumns = columnCount + selectionColumns + expandingColumns;
    
    for (let i = 0; i < loadingRowCount; i++) {
      skeletonRows.push(
        <TableRow key={`skeleton-${i}`}>
          {Array.from({ length: totalColumns }, (_, colIndex) => (
            <TableCell key={`skeleton-cell-${i}-${colIndex}`}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      );
    }
    
    return skeletonRows;
  };

  // Progress indicator for partial loading
  const renderProgressRow = () => {
    if (!loading || rows.length === 0) return null;
    
    const totalColumns = table.getAllColumns().filter(col => col.getIsVisible()).length + 
                        (enableRowSelection ? 1 : 0) + 
                        (enableExpanding ? 1 : 0);
    
    return (
      <TableRow>
        <TableCell colSpan={totalColumns} sx={{ p: 0, borderBottom: 'none' }}>
          <LinearProgress />
        </TableCell>
      </TableRow>
    );
  };

  // Expandable row content
  const renderExpandedRow = (row) => {
    if (!enableExpanding || !row.getIsExpanded()) return null;
    
    const totalColumns = table.getAllColumns().filter(col => col.getIsVisible()).length + 
                        (enableRowSelection ? 1 : 0) + 
                        (enableExpanding ? 1 : 0);
    
    return (
      <TableRow key={`${row.id}-expanded`}>
        <TableCell colSpan={totalColumns} sx={{ py: 0, borderBottom: 'none' }}>
          <Collapse in={row.getIsExpanded()} timeout="auto" unmountOnExit>
            <MDBox sx={{ py: 2 }}>
              {row.original.expandedContent || (
                <MDTypography variant="body2" color="text">
                  Expanded content for row {row.id}
                </MDTypography>
              )}
            </MDBox>
          </Collapse>
        </TableCell>
      </TableRow>
    );
  };

  // Custom row renderer
  const renderRow = (row, index) => {
    if (customRowRenderer) {
      return customRowRenderer(row, index, { 
        enableRowSelection, 
        enableExpanding, 
        onRowClick, 
        onRowDoubleClick 
      });
    }
    
    const isSelected = enableRowSelection && row.getIsSelected();
    const canExpand = enableExpanding && row.getCanExpand();
    const isExpanded = enableExpanding && row.getIsExpanded();
    
    return (
      <React.Fragment key={row.id}>
        <TableRow
          hover
          selected={isSelected}
          onClick={(event) => {
            if (onRowClick && !event.defaultPrevented) {
              onRowClick(row, event);
            }
          }}
          onDoubleClick={(event) => {
            if (onRowDoubleClick && !event.defaultPrevented) {
              onRowDoubleClick(row, event);
            }
          }}
          sx={{
            cursor: onRowClick || onRowDoubleClick ? 'pointer' : 'default',
            height: rowHeight === 'compact' ? 36 : rowHeight === 'comfortable' ? 56 : 48,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.selected',
              },
            },
          }}
        >
          {/* Row Selection Cell */}
          {enableRowSelection && (
            <TableCell 
              padding="checkbox"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onChange={row.getToggleSelectedHandler()}
                size="small"
                onClick={(e) => e.stopPropagation()}
              />
            </TableCell>
          )}

          {/* Expanding Cell */}
          {enableExpanding && (
            <TableCell 
              padding="checkbox"
              onClick={(e) => e.stopPropagation()}
            >
              {canExpand && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.getToggleExpandedHandler()();
                  }}
                >
                  {isExpanded ? (
                    <KeyboardArrowDownIcon />
                  ) : (
                    <KeyboardArrowRightIcon />
                  )}
                </IconButton>
              )}
            </TableCell>
          )}

          {/* Data Cells */}
          {row.getVisibleCells().map((cell) => {
            const column = cell.column;
            const isPinned = column.getIsPinned();
            
            return (
              <TableCell
                key={cell.id}
                align={column.columnDef.align || 'left'}
                style={{
                  width: column.getSize(),
                  minWidth: column.columnDef.minSize || 100,
                  maxWidth: column.columnDef.maxSize,
                  position: isPinned ? 'sticky' : 'relative',
                  left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
                  right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
                  zIndex: isPinned ? 2 : 1,
                }}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: isPinned ? 'background.paper' : 'inherit',
                  py: rowHeight === 'compact' ? 0.5 : rowHeight === 'comfortable' ? 1.5 : 1,
                  px: column.columnDef.padding || 2,
                }}
              >
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </TableCell>
            );
          })}
        </TableRow>

        {/* Expanded Row Content */}
        {renderExpandedRow(row)}
      </React.Fragment>
    );
  };

  // Virtualized rendering (basic implementation)
  const renderVirtualizedRows = () => {
    if (!virtualized) return rows.map((row, index) => renderRow(row, index));
    
    // Basic virtualization - in a real implementation, you'd use a library like react-window
    const { startIndex = 0, endIndex = rows.length } = virtualizedProps;
    
    return rows
      .slice(startIndex, endIndex)
      .map((row, index) => renderRow(row, startIndex + index));
  };

  return (
    <TableBody>
      {/* Progress indicator for loading with existing data */}
      {renderProgressRow()}
      
      {/* Loading skeleton rows */}
      {loading && rows.length === 0 && renderLoadingRows()}
      
      {/* Data rows */}
      {!loading || rows.length > 0 ? renderVirtualizedRows() : null}
      
      {/* Empty state - handled by parent component */}
    </TableBody>
  );
}

export default CustomTableBody;