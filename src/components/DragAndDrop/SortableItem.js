/**
 * Sortable Item Component
 * Generic sortable item wrapper with accessibility support
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { useDragAndDrop } from './index';
import DragHandle from './DragHandle';
import { getDraggableAriaLabel, getDragDescribedBy } from 'utils/accessibility';

const SortableItem = forwardRef(({
  id,
  children,
  item,
  disabled = false,
  showDragHandle = true,
  dragHandleProps = {},
  itemType = 'item',
  className,
  style,
  ...props
}, ref) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { dragState, handleDragStart, items } = useDragAndDrop();

  const isDragging = dragState.activeId === id;
  const isOver = dragState.overId === id;
  
  // Find item position for accessibility
  const position = items.findIndex(i => i.id === id);
  const itemName = item?.name || item?.title || `${itemType} ${position + 1}`;

  const handleMouseDown = (event) => {
    if (disabled) return;
    handleDragStart(event, id);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleDragStart(event, id);
    }
  };

  // Accessibility attributes
  const ariaLabel = getDraggableAriaLabel(itemType, itemName, position, items.length, t);
  const describedBy = getDragDescribedBy(itemType, t);

  return (
    <Box
      ref={ref}
      className={className}
      style={style}
      {...props}
      sx={{
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(0.98)' : 'scale(1)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        backgroundColor: isOver ? theme.palette.action.hover : 'transparent',
        border: isOver ? `2px dashed ${theme.palette.primary.main}` : '2px solid transparent',
        borderRadius: 1,
        cursor: disabled ? 'default' : 'grab',
        '&:hover': disabled ? {} : {
          backgroundColor: theme.palette.action.hover,
        },
        '&:focus-within': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
        ...props.sx,
      }}
      role="listitem"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-describedby={`drag-instructions-${itemType}`}
      aria-grabbed={isDragging}
      aria-dropeffect={isOver ? 'move' : 'none'}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden instructions for screen readers */}
      <Box
        id={`drag-instructions-${itemType}`}
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {describedBy}
      </Box>

      <Box display="flex" alignItems="center" width="100%">
        {/* Drag handle */}
        {showDragHandle && (
          <DragHandle
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={t('accessibility.dragItem', { item: itemName })}
            {...dragHandleProps}
          />
        )}

        {/* Item content */}
        <Box 
          flex={1} 
          ml={showDragHandle ? 1 : 0}
          onMouseDown={showDragHandle ? undefined : handleMouseDown}
          onKeyDown={showDragHandle ? undefined : handleKeyDown}
        >
          {children}
        </Box>
      </Box>

      {/* Drop indicator */}
      {isOver && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: theme.palette.primary.main,
            zIndex: 1,
          }}
        />
      )}
    </Box>
  );
});

SortableItem.displayName = 'SortableItem';

SortableItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  children: PropTypes.node.isRequired,
  item: PropTypes.object,
  disabled: PropTypes.bool,
  showDragHandle: PropTypes.bool,
  dragHandleProps: PropTypes.object,
  itemType: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default SortableItem;