/**
 * Draggable Header Component
 * Draggable table header with Material-UI TableCell integration
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TableCell, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import SortableItem from 'components/DragAndDrop/SortableItem';
import { flexRender } from '@tanstack/react-table';

const DraggableHeader = ({
  header,
  children,
  enableDragging = true,
  ...props
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const columnDef = header.column.columnDef;
  const headerContent = header.isPlaceholder 
    ? null 
    : flexRender(columnDef.header, header.getContext());

  const itemData = {
    id: header.id,
    name: typeof columnDef.header === 'string' ? columnDef.header : header.id,
    header: headerContent,
    columnDef,
  };

  if (!enableDragging) {
    return (
      <TableCell {...props}>
        <Box display="flex" alignItems="center" width="100%">
          {children || headerContent}
        </Box>
      </TableCell>
    );
  }

  return (
    <TableCell
      {...props}
      sx={{
        padding: theme.spacing(1),
        position: 'relative',
        overflow: 'visible',
        ...props.sx,
      }}
    >
      <SortableItem
        id={header.id}
        item={itemData}
        itemType="column"
        showDragHandle={true}
        dragHandleProps={{
          'aria-label': t('accessibility.dragColumn', { 
            column: itemData.name 
          }),
          size: 'small',
        }}
        sx={{
          minHeight: 48,
          padding: theme.spacing(0.5),
          borderRadius: 1,
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          width="100%"
          minHeight={40}
        >
          {children || headerContent}
        </Box>
      </SortableItem>
    </TableCell>
  );
};

DraggableHeader.propTypes = {
  header: PropTypes.object.isRequired,
  children: PropTypes.node,
  enableDragging: PropTypes.bool,
};

export default DraggableHeader;