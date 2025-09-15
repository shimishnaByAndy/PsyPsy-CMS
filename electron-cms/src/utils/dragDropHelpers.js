/**
 * Drag and Drop Utility Functions
 * Helper functions for drag operations, array manipulation, and accessibility
 */

import { DRAG_TYPES } from '../constants/dragTypes';

/**
 * Generate unique drag IDs
 */
export const generateDragId = (type, itemId) => {
  if (!type || itemId === undefined || itemId === null) {
    console.warn('generateDragId: Invalid parameters', { type, itemId });
    return `unknown-${Date.now()}`;
  }
  return `${type}-${itemId}`;
};

/**
 * Move item from one position to another in array
 */
export const arrayMove = (array, fromIndex, toIndex) => {
  if (!Array.isArray(array)) {
    console.warn('arrayMove: Input is not an array');
    return array;
  }

  if (fromIndex < 0 || fromIndex >= array.length || 
      toIndex < 0 || toIndex >= array.length) {
    console.warn('arrayMove: Invalid indices', { fromIndex, toIndex, length: array.length });
    return array;
  }

  const newArray = array.slice();
  const item = newArray.splice(fromIndex, 1)[0];
  newArray.splice(toIndex, 0, item);
  return newArray;
};

/**
 * Get item position in array
 */
export const getItemPosition = (id, items) => {
  if (!Array.isArray(items)) {
    return -1;
  }
  return items.findIndex(item => {
    if (typeof item === 'object' && item !== null) {
      return item.id === id || item.key === id;
    }
    return item === id;
  });
};

/**
 * Find item by ID in array
 */
export const findItemById = (id, items) => {
  if (!Array.isArray(items)) {
    return null;
  }
  return items.find(item => {
    if (typeof item === 'object' && item !== null) {
      return item.id === id || item.key === id;
    }
    return item === id;
  });
};

/**
 * Check if drag operation is valid
 */
export const isValidDragOperation = (source, target, dragType) => {
  if (!source || !target) {
    return false;
  }

  // Same item cannot be dropped on itself
  if (source.id === target.id) {
    return false;
  }

  // Type-specific validation
  switch (dragType) {
    case DRAG_TYPES.COLUMN:
      return source.type === 'column' && target.type === 'column';
    case DRAG_TYPES.ROW:
      return source.type === 'row' && target.type === 'row';
    case DRAG_TYPES.PROFESSIONAL_STATUS:
      return source.type === 'professional' && target.type === 'status-zone';
    case DRAG_TYPES.APPOINTMENT_SLOT:
      return source.type === 'appointment' && target.type === 'time-slot';
    default:
      return true;
  }
};

/**
 * Get drag type from drag ID
 */
export const getDragType = (dragId) => {
  if (typeof dragId !== 'string') {
    return null;
  }

  const [type] = dragId.split('-');
  
  switch (type) {
    case 'table':
      return DRAG_TYPES.COLUMN;
    case 'row':
      return DRAG_TYPES.ROW;
    case 'professional':
      return DRAG_TYPES.PROFESSIONAL_STATUS;
    case 'appointment':
      return DRAG_TYPES.APPOINTMENT_SLOT;
    default:
      return type;
  }
};

/**
 * Calculate drop position based on coordinates
 */
export const calculateDropPosition = (event, containerRect, items) => {
  if (!event || !containerRect || !Array.isArray(items)) {
    return 0;
  }

  const { clientY } = event;
  const relativeY = clientY - containerRect.top;
  const itemHeight = containerRect.height / items.length;
  
  return Math.min(Math.floor(relativeY / itemHeight), items.length - 1);
};

/**
 * Debounce function for drag events
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if element is scrollable
 */
export const isScrollable = (element) => {
  if (!element) return false;
  
  const { overflow, overflowY, overflowX } = getComputedStyle(element);
  const scrollableValues = ['auto', 'scroll'];
  
  return scrollableValues.includes(overflow) ||
         scrollableValues.includes(overflowY) ||
         scrollableValues.includes(overflowX);
};

/**
 * Auto scroll during drag operations
 */
export const handleAutoScroll = (event, scrollContainer, scrollSpeed = 10) => {
  if (!event || !scrollContainer) return;

  const { clientY } = event;
  const containerRect = scrollContainer.getBoundingClientRect();
  const scrollThreshold = 50;

  // Scroll up
  if (clientY - containerRect.top < scrollThreshold) {
    scrollContainer.scrollTop -= scrollSpeed;
  }
  
  // Scroll down
  if (containerRect.bottom - clientY < scrollThreshold) {
    scrollContainer.scrollTop += scrollSpeed;
  }
};

/**
 * Save drag state to localStorage
 */
export const saveDragState = (key, state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(`psypsy_drag_${key}`, serializedState);
  } catch (error) {
    console.warn('Failed to save drag state:', error);
  }
};

/**
 * Load drag state from localStorage
 */
export const loadDragState = (key, defaultState = {}) => {
  try {
    const serializedState = localStorage.getItem(`psypsy_drag_${key}`);
    if (serializedState === null) {
      return defaultState;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.warn('Failed to load drag state:', error);
    return defaultState;
  }
};

/**
 * Clear drag state from localStorage
 */
export const clearDragState = (key) => {
  try {
    localStorage.removeItem(`psypsy_drag_${key}`);
  } catch (error) {
    console.warn('Failed to clear drag state:', error);
  }
};