/**
 * Drag and Drop Provider
 * Custom drag and drop implementation with Material-UI integration
 * Note: This is a temporary implementation until @dnd-kit can be installed
 */

import React, { useState, useRef, useCallback, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

import { 
  getDragAnnouncement, 
  announceToScreenReader, 
  dragFocusManager,
  handleDragKeyboard 
} from 'utils/accessibility';
import { arrayMove, isValidDragOperation } from 'utils/dragDropHelpers';
import DragOverlay from './DragOverlay';

// Drag and Drop Context
const DragAndDropContext = createContext(null);

export const useDragAndDrop = () => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error('useDragAndDrop must be used within a DragAndDropProvider');
  }
  return context;
};

// Custom implementation of drag and drop logic
const DragAndDropProvider = ({
  children,
  items = [],
  onDragStart,
  onDragMove,
  onDragEnd,
  strategy = 'vertical',
  disabled = false,
}) => {
  const { t } = useTranslation();
  
  // Drag state
  const [dragState, setDragState] = useState({
    isDragging: false,
    activeId: null,
    overId: null,
    draggedItem: null,
    startPosition: null,
    currentPosition: null,
  });

  // Refs for drag tracking
  const dragContainer = useRef(null);
  const dragStartPosition = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((event, itemId) => {
    if (disabled) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const startPosition = items.findIndex(i => i.id === itemId);
    
    setDragState({
      isDragging: true,
      activeId: itemId,
      overId: null,
      draggedItem: item,
      startPosition,
      currentPosition: startPosition,
    });

    // Save focus for restoration
    dragFocusManager.saveFocus();

    // Track mouse position for overlay
    if (event.type === 'mousedown') {
      const rect = event.currentTarget.getBoundingClientRect();
      dragOffset.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }

    // Announce to screen readers
    const announcement = getDragAnnouncement('start', item.name || itemId, startPosition, items.length, t);
    announceToScreenReader(announcement);

    // Call external handler
    onDragStart?.({ active: { id: itemId, data: item }, startPosition });

    // Add global event listeners for drag tracking
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
  }, [disabled, items, t, onDragStart]);

  /**
   * Handle mouse move during drag
   */
  const handleMouseMove = useCallback((event) => {
    if (!dragState.isDragging) return;

    const container = dragContainer.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const mouseY = event.clientY - containerRect.top;
    
    // Calculate which item we're over
    const itemHeight = containerRect.height / items.length;
    const overIndex = Math.floor(mouseY / itemHeight);
    const overItem = items[overIndex];

    if (overItem && overItem.id !== dragState.overId) {
      setDragState(prev => ({
        ...prev,
        overId: overItem.id,
        currentPosition: overIndex,
      }));

      // Announce position change
      const announcement = getDragAnnouncement(
        'move', 
        dragState.draggedItem?.name || dragState.activeId,
        overIndex,
        items.length,
        t
      );
      announceToScreenReader(announcement, 'assertive');

      // Call external handler
      onDragMove?.({
        active: { id: dragState.activeId },
        over: { id: overItem.id },
        currentPosition: overIndex,
      });
    }
  }, [dragState.isDragging, dragState.activeId, dragState.overId, dragState.draggedItem, items, t, onDragMove]);

  /**
   * Handle mouse up (drop)
   */
  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging) return;

    const { activeId, overId, startPosition, currentPosition, draggedItem } = dragState;

    // Clean up event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown);

    // Determine if this was a valid drop
    if (overId && activeId !== overId && currentPosition !== null && startPosition !== currentPosition) {
      // Valid drop
      const announcement = getDragAnnouncement('end', draggedItem?.name || activeId, currentPosition, items.length, t);
      announceToScreenReader(announcement);

      // Call external handler
      onDragEnd?.({
        active: { id: activeId, data: draggedItem },
        over: { id: overId },
        startPosition,
        endPosition: currentPosition,
      });
    } else {
      // Cancelled drop
      const announcement = getDragAnnouncement('cancel', draggedItem?.name || activeId, null, items.length, t);
      announceToScreenReader(announcement);
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      activeId: null,
      overId: null,
      draggedItem: null,
      startPosition: null,
      currentPosition: null,
    });

    // Restore focus
    dragFocusManager.restoreFocus();
  }, [dragState, t, onDragEnd, handleMouseMove]);

  /**
   * Handle keyboard events during drag
   */
  const handleKeyDown = useCallback((event) => {
    if (!dragState.isDragging) return;

    handleDragKeyboard(event, {
      isDragging: dragState.isDragging,
      onMove: (direction) => {
        const currentIndex = dragState.currentPosition || dragState.startPosition;
        let newIndex;

        switch (direction) {
          case 'up':
            newIndex = Math.max(0, currentIndex - 1);
            break;
          case 'down':
            newIndex = Math.min(items.length - 1, currentIndex + 1);
            break;
          case 'first':
            newIndex = 0;
            break;
          case 'last':
            newIndex = items.length - 1;
            break;
          default:
            return;
        }

        if (newIndex !== currentIndex) {
          const overItem = items[newIndex];
          setDragState(prev => ({
            ...prev,
            overId: overItem.id,
            currentPosition: newIndex,
          }));

          // Announce movement
          const announcement = getDragAnnouncement(
            'move',
            dragState.draggedItem?.name || dragState.activeId,
            newIndex,
            items.length,
            t
          );
          announceToScreenReader(announcement, 'assertive');
        }
      },
      onDrop: () => {
        // Trigger mouse up to complete the drop
        handleMouseUp();
      },
      onCancel: () => {
        // Cancel the drag operation
        const announcement = getDragAnnouncement(
          'cancel',
          dragState.draggedItem?.name || dragState.activeId,
          null,
          items.length,
          t
        );
        announceToScreenReader(announcement);

        // Clean up and reset
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('keydown', handleKeyDown);

        setDragState({
          isDragging: false,
          activeId: null,
          overId: null,
          draggedItem: null,
          startPosition: null,
          currentPosition: null,
        });

        dragFocusManager.restoreFocus();
      },
    });
  }, [dragState, t, items, handleMouseUp, handleMouseMove]);

  /**
   * Context value
   */
  const contextValue = {
    dragState,
    handleDragStart,
    disabled,
    strategy,
    items,
  };

  return (
    <DragAndDropContext.Provider value={contextValue}>
      <Box ref={dragContainer} position="relative">
        {children}
        
        {/* Drag Overlay */}
        {dragState.isDragging && dragState.draggedItem && (
          <DragOverlay
            item={dragState.draggedItem}
            offset={dragOffset.current}
            strategy={strategy}
          />
        )}
      </Box>
    </DragAndDropContext.Provider>
  );
};

DragAndDropProvider.propTypes = {
  children: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
  })),
  onDragStart: PropTypes.func,
  onDragMove: PropTypes.func,
  onDragEnd: PropTypes.func,
  strategy: PropTypes.oneOf(['vertical', 'horizontal']),
  disabled: PropTypes.bool,
};

export default DragAndDropProvider;