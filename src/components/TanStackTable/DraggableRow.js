/**
 * Draggable Row Component
 * Draggable table row with Material-UI TableRow integration
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import SortableItem from 'components/DragAndDrop/SortableItem';
import { flexRender } from '@tanstack/react-table';

const DraggableRow = ({
  row,
  children,
  enableDragging = true,
  onRowClick,
  ...props
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Extract row data for drag operations
  const rowData = row.original;
  const itemData = {
    id: row.id,
    name: getRowDisplayName(rowData),
    subtitle: getRowSubtitle(rowData),
    status: rowData.status || rowData.verificationStatus,
    ...rowData,
  };

  const handleRowClick = (event) => {
    // Don't trigger row click if clicking on drag handle
    if (event.target.closest('[data-drag-handle]')) {
      return;
    }
    onRowClick?.(row, event);
  };

  if (!enableDragging) {
    return (
      <TableRow {...props} onClick={handleRowClick}>
        {children}
      </TableRow>
    );
  }

  return (
    <TableRow
      {...props}
      onClick={handleRowClick}
      sx={{
        cursor: onRowClick ? 'pointer' : 'default',
        ...props.sx,
      }}
    >
      {/* Drag handle cell */}
      <TableCell sx={{ width: 48, padding: theme.spacing(0.5) }}>
        <SortableItem
          id={row.id}
          item={itemData}
          itemType="row"
          showDragHandle={true}
          dragHandleProps={{
            'aria-label': t('accessibility.dragRow', { 
              row: itemData.name 
            }),
            size: 'small',
            'data-drag-handle': true,
          }}
          sx={{
            minHeight: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Empty - drag handle is rendered by SortableItem */}
          <div style={{ width: 0, height: 0 }} />
        </SortableItem>
      </TableCell>

      {/* Row content */}
      {children}
    </TableRow>
  );
};

/**
 * Get display name for row
 */
const getRowDisplayName = (rowData) => {
  if (rowData.firstName && rowData.lastName) {
    return `${rowData.firstName} ${rowData.lastName}`;
  }
  
  if (rowData.name) {
    return rowData.name;
  }
  
  if (rowData.title) {
    return rowData.title;
  }
  
  if (rowData.clientName) {
    return rowData.clientName;
  }
  
  if (rowData.username) {
    return rowData.username;
  }
  
  if (rowData.email) {
    return rowData.email;
  }
  
  return `Row ${rowData.id || 'Unknown'}`;
};

/**
 * Get subtitle for row
 */
const getRowSubtitle = (rowData) => {
  if (rowData.profession) {
    return rowData.profession;
  }
  
  if (rowData.email && rowData.firstName) {
    return rowData.email;
  }
  
  if (rowData.appointmentType) {
    return rowData.appointmentType;
  }
  
  if (rowData.role) {
    return rowData.role;
  }
  
  return null;
};

DraggableRow.propTypes = {
  row: PropTypes.object.isRequired,
  children: PropTypes.node,
  enableDragging: PropTypes.bool,
  onRowClick: PropTypes.func,
};

export default DraggableRow;