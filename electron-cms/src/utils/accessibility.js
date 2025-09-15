/**
 * Accessibility Helper Functions
 * Utility functions for drag and drop accessibility support
 */

/**
 * Generate drag operation announcements for screen readers
 */
export const getDragAnnouncement = (operation, itemName, position, total, t) => {
  if (!t || typeof t !== 'function') {
    // Fallback to English if translation function not available
    const fallbacks = {
      start: `Started dragging ${itemName}`,
      move: `${itemName} moved to position ${position} of ${total}`,
      end: `${itemName} dropped successfully`,
      cancel: `Drag cancelled for ${itemName}`,
    };
    return fallbacks[operation] || '';
  }

  const params = { 
    item: itemName, 
    position: position ? position + 1 : null, 
    total 
  };

  switch (operation) {
    case 'start':
      return t('accessibility.drag.started', params);
    case 'move':
      return t('accessibility.drag.moved', params);
    case 'end':
      return t('accessibility.drag.completed', params);
    case 'cancel':
      return t('accessibility.drag.cancelled', params);
    case 'drop-zone-enter':
      return t('accessibility.drag.dropZoneEnter', params);
    case 'drop-zone-exit':
      return t('accessibility.drag.dropZoneExit', params);
    default:
      return '';
  }
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  if (!message || typeof document === 'undefined') {
    return;
  }

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('aria-hidden', 'false');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  announcement.textContent = message;
  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
};

/**
 * Get keyboard instructions for drag operations
 */
export const getDragKeyboardInstructions = (t) => {
  if (!t || typeof t !== 'function') {
    return 'Press space to start dragging, use arrow keys to move, press space again to drop, or escape to cancel';
  }

  return t('accessibility.drag.keyboardInstructions');
};

/**
 * Get ARIA label for draggable items
 */
export const getDraggableAriaLabel = (itemType, itemName, position, total, t) => {
  if (!t || typeof t !== 'function') {
    return `${itemName}, draggable ${itemType}, ${position} of ${total}`;
  }

  return t('accessibility.drag.itemLabel', {
    name: itemName,
    type: itemType,
    position: position + 1,
    total,
  });
};

/**
 * Get ARIA label for drop zones
 */
export const getDropZoneAriaLabel = (zoneName, itemCount, t) => {
  if (!t || typeof t !== 'function') {
    return `${zoneName} drop zone, ${itemCount} items`;
  }

  return t('accessibility.drag.dropZoneLabel', {
    zone: zoneName,
    count: itemCount,
  });
};

/**
 * Get ARIA describedby text for drag operations
 */
export const getDragDescribedBy = (dragType, t) => {
  if (!t || typeof t !== 'function') {
    return 'Use space bar to start dragging, arrow keys to move, space bar to drop, or escape to cancel';
  }

  switch (dragType) {
    case 'column':
      return t('accessibility.drag.columnInstructions');
    case 'row':
      return t('accessibility.drag.rowInstructions');
    case 'status':
      return t('accessibility.drag.statusInstructions');
    default:
      return t('accessibility.drag.genericInstructions');
  }
};

/**
 * Focus management during drag operations
 */
export class DragFocusManager {
  constructor() {
    this.originalFocus = null;
    this.dragStartElement = null;
  }

  /**
   * Save current focus before drag starts
   */
  saveFocus() {
    if (typeof document !== 'undefined') {
      this.originalFocus = document.activeElement;
    }
  }

  /**
   * Restore focus after drag ends
   */
  restoreFocus() {
    if (this.originalFocus && typeof this.originalFocus.focus === 'function') {
      try {
        this.originalFocus.focus();
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      }
    }
    this.originalFocus = null;
    this.dragStartElement = null;
  }

  /**
   * Set focus to drag handle
   */
  focusDragHandle(element) {
    if (element && typeof element.focus === 'function') {
      element.focus();
      this.dragStartElement = element;
    }
  }

  /**
   * Move focus to next/previous item during keyboard navigation
   */
  moveFocus(direction, currentElement, itemList) {
    if (!currentElement || !itemList || itemList.length === 0) {
      return;
    }

    const currentIndex = Array.from(itemList).indexOf(currentElement);
    if (currentIndex === -1) return;

    let nextIndex;
    switch (direction) {
      case 'up':
      case 'left':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : itemList.length - 1;
        break;
      case 'down':
      case 'right':
        nextIndex = currentIndex < itemList.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'first':
        nextIndex = 0;
        break;
      case 'last':
        nextIndex = itemList.length - 1;
        break;
      default:
        return;
    }

    const nextElement = itemList[nextIndex];
    if (nextElement && typeof nextElement.focus === 'function') {
      nextElement.focus();
    }
  }
}

/**
 * Global drag focus manager instance
 */
export const dragFocusManager = new DragFocusManager();

/**
 * Handle keyboard events for drag operations
 */
export const handleDragKeyboard = (event, callbacks = {}) => {
  const { onDragStart, onMove, onDrop, onCancel } = callbacks;

  switch (event.key) {
    case ' ':
    case 'Enter':
      event.preventDefault();
      if (event.type === 'keydown') {
        if (callbacks.isDragging) {
          onDrop?.(event);
        } else {
          onDragStart?.(event);
        }
      }
      break;

    case 'Escape':
      event.preventDefault();
      onCancel?.(event);
      break;

    case 'ArrowUp':
      event.preventDefault();
      onMove?.('up', event);
      break;

    case 'ArrowDown':
      event.preventDefault();
      onMove?.('down', event);
      break;

    case 'ArrowLeft':
      event.preventDefault();
      onMove?.('left', event);
      break;

    case 'ArrowRight':
      event.preventDefault();
      onMove?.('right', event);
      break;

    case 'Home':
      event.preventDefault();
      onMove?.('first', event);
      break;

    case 'End':
      event.preventDefault();
      onMove?.('last', event);
      break;

    default:
      // Allow other keys to propagate
      break;
  }
};

/**
 * Create invisible screen reader instructions element
 */
export const createInstructionsElement = (instructions, id) => {
  if (typeof document === 'undefined') {
    return null;
  }

  const element = document.createElement('div');
  element.id = id;
  element.setAttribute('aria-hidden', 'true');
  element.style.position = 'absolute';
  element.style.left = '-10000px';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.overflow = 'hidden';
  element.textContent = instructions;

  document.body.appendChild(element);
  return element;
};

/**
 * Remove instructions element
 */
export const removeInstructionsElement = (elementId) => {
  if (typeof document === 'undefined') {
    return;
  }

  const element = document.getElementById(elementId);
  if (element && document.body.contains(element)) {
    document.body.removeChild(element);
  }
};