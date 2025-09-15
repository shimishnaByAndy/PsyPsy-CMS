/**
 * Column Dragging Hook
 * Hook for managing column reordering state and persistence
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { saveDragState, loadDragState, arrayMove } from 'utils/dragDropHelpers';

const useColumnDragging = (table, options = {}) => {
  const {
    persistKey = 'table-columns',
    enablePersistence = true,
    onColumnOrderChange,
    initialColumnOrder,
  } = options;

  // Get initial column order
  const defaultColumnOrder = useMemo(() => {
    if (initialColumnOrder) return initialColumnOrder;
    if (!table) return [];
    return table.getAllColumns().map(column => column.id);
  }, [table, initialColumnOrder]);

  // Load persisted column order or use default
  const [columnOrder, setColumnOrder] = useState(() => {
    if (enablePersistence && persistKey) {
      const saved = loadDragState(persistKey, defaultColumnOrder);
      return saved.length > 0 ? saved : defaultColumnOrder;
    }
    return defaultColumnOrder;
  });

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState(() => {
    if (enablePersistence && persistKey) {
      const saved = loadDragState(`${persistKey}-visibility`, {});
      return saved;
    }
    return {};
  });

  /**
   * Handle column drag end
   */
  const handleColumnDragEnd = useCallback((event) => {
    const { active, over, startPosition, endPosition } = event;
    
    if (!active || !over || startPosition === endPosition) {
      return;
    }

    const oldIndex = columnOrder.indexOf(active.id);
    const newIndex = columnOrder.indexOf(over.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.warn('Invalid column indices for drag operation', { oldIndex, newIndex });
      return;
    }

    const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex);
    setColumnOrder(newColumnOrder);

    // Update TanStack Table column order
    if (table && table.setColumnOrder) {
      table.setColumnOrder(newColumnOrder);
    }

    // Persist the new order
    if (enablePersistence && persistKey) {
      saveDragState(persistKey, newColumnOrder);
    }

    // Notify parent component
    onColumnOrderChange?.(newColumnOrder, {
      movedColumn: active.id,
      oldIndex,
      newIndex,
    });
  }, [columnOrder, table, enablePersistence, persistKey, onColumnOrderChange]);

  /**
   * Reset column order to default
   */
  const resetColumnOrder = useCallback(() => {
    setColumnOrder(defaultColumnOrder);
    
    if (table && table.setColumnOrder) {
      table.setColumnOrder(defaultColumnOrder);
    }

    if (enablePersistence && persistKey) {
      saveDragState(persistKey, defaultColumnOrder);
    }

    onColumnOrderChange?.(defaultColumnOrder, {
      reset: true,
    });
  }, [defaultColumnOrder, table, enablePersistence, persistKey, onColumnOrderChange]);

  /**
   * Toggle column visibility
   */
  const toggleColumnVisibility = useCallback((columnId, visible = null) => {
    setColumnVisibility(prev => {
      const newVisibility = {
        ...prev,
        [columnId]: visible !== null ? visible : !prev[columnId]
      };

      // Update TanStack Table visibility
      if (table && table.setColumnVisibility) {
        table.setColumnVisibility(newVisibility);
      }

      // Persist visibility state
      if (enablePersistence && persistKey) {
        saveDragState(`${persistKey}-visibility`, newVisibility);
      }

      return newVisibility;
    });
  }, [table, enablePersistence, persistKey]);

  /**
   * Show/hide all columns
   */
  const toggleAllColumns = useCallback((visible) => {
    const newVisibility = {};
    
    columnOrder.forEach(columnId => {
      newVisibility[columnId] = visible;
    });

    setColumnVisibility(newVisibility);

    if (table && table.setColumnVisibility) {
      table.setColumnVisibility(newVisibility);
    }

    if (enablePersistence && persistKey) {
      saveDragState(`${persistKey}-visibility`, newVisibility);
    }
  }, [columnOrder, table, enablePersistence, persistKey]);

  /**
   * Get column order for table items
   */
  const getColumnItems = useCallback(() => {
    return columnOrder.map(columnId => ({
      id: columnId,
      name: table?.getColumn(columnId)?.columnDef?.header || columnId,
    }));
  }, [columnOrder, table]);

  /**
   * Get visible columns count
   */
  const visibleColumnsCount = useMemo(() => {
    return columnOrder.filter(columnId => 
      columnVisibility[columnId] !== false
    ).length;
  }, [columnOrder, columnVisibility]);

  /**
   * Sync with table when column order changes
   */
  useEffect(() => {
    if (table && table.setColumnOrder && columnOrder.length > 0) {
      table.setColumnOrder(columnOrder);
    }
  }, [table, columnOrder]);

  /**
   * Sync visibility with table
   */
  useEffect(() => {
    if (table && table.setColumnVisibility) {
      table.setColumnVisibility(columnVisibility);
    }
  }, [table, columnVisibility]);

  return {
    // State
    columnOrder,
    columnVisibility,
    visibleColumnsCount,
    
    // Handlers
    handleColumnDragEnd,
    resetColumnOrder,
    toggleColumnVisibility,
    toggleAllColumns,
    
    // Utilities
    getColumnItems,
    
    // Configuration
    enablePersistence,
    persistKey,
  };
};

export default useColumnDragging;