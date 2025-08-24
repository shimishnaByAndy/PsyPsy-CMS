/**
 * Row Dragging Hook
 * Hook for managing row reordering with backend synchronization
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { arrayMove } from 'utils/dragDropHelpers';
import parseService from 'services/parseService';

const useRowDragging = (table, options = {}) => {
  const {
    className, // Parse Server class name
    orderField = 'displayOrder', // Field to store sort order
    optimisticUpdates = true,
    onRowOrderChange,
    onError,
  } = options;

  // Row order state
  const [rowOrder, setRowOrder] = useState(() => {
    if (!table) return [];
    return table.getRowModel().rows.map(row => row.id);
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateQueue, setUpdateQueue] = useState([]);

  /**
   * Handle row drag end with backend sync
   */
  const handleRowDragEnd = useCallback(async (event) => {
    const { active, over, startPosition, endPosition } = event;
    
    if (!active || !over || startPosition === endPosition) {
      return;
    }

    const oldIndex = rowOrder.indexOf(active.id);
    const newIndex = rowOrder.indexOf(over.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.warn('Invalid row indices for drag operation', { oldIndex, newIndex });
      return;
    }

    const newRowOrder = arrayMove(rowOrder, oldIndex, newIndex);
    const rows = table.getRowModel().rows;

    // Optimistic update
    if (optimisticUpdates) {
      setRowOrder(newRowOrder);
      
      // Notify parent immediately with reordered data
      const reorderedRows = newRowOrder.map(id => 
        rows.find(row => row.id === id)
      ).filter(Boolean);
      
      onRowOrderChange?.(reorderedRows.map(row => row.original), {
        movedRow: active.id,
        oldIndex,
        newIndex,
        optimistic: true,
      });
    }

    // Queue backend update
    const updateData = {
      rowId: active.id,
      oldIndex,
      newIndex,
      newOrder: newRowOrder,
    };

    setUpdateQueue(prev => [...prev, updateData]);

    try {
      await syncRowOrderToBackend(updateData, rows);
      
      // Remove from queue on success
      setUpdateQueue(prev => prev.filter(item => item.rowId !== active.id));
      
      // Final notification
      onRowOrderChange?.(newRowOrder.map(id => 
        rows.find(row => row.id === id)?.original
      ).filter(Boolean), {
        movedRow: active.id,
        oldIndex,
        newIndex,
        optimistic: false,
        success: true,
      });
      
    } catch (error) {
      console.error('Failed to update row order:', error);
      
      // Revert optimistic update
      if (optimisticUpdates) {
        setRowOrder(rowOrder); // Revert to original order
      }
      
      // Remove from queue
      setUpdateQueue(prev => prev.filter(item => item.rowId !== active.id));
      
      // Notify error
      onError?.(error, {
        operation: 'rowReorder',
        rowId: active.id,
        oldIndex,
        newIndex,
      });
    }
  }, [rowOrder, table, optimisticUpdates, onRowOrderChange, onError, className, orderField]);

  /**
   * Sync row order to backend
   */
  const syncRowOrderToBackend = async (updateData, rows) => {
    if (!className) {
      console.warn('No className provided for row order sync');
      return;
    }

    setIsUpdating(true);

    try {
      const { newOrder } = updateData;
      const updates = [];

      // Prepare batch update for affected rows
      newOrder.forEach((rowId, index) => {
        const row = rows.find(r => r.id === rowId);
        if (row && row.original) {
          updates.push({
            objectId: row.original.objectId || rowId,
            [orderField]: index,
          });
        }
      });

      // Use Parse Cloud Function for batch update
      if (updates.length > 0) {
        await parseService.Parse.Cloud.run('batchUpdateOrder', {
          className,
          updates,
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Reset row order to default
   */
  const resetRowOrder = useCallback(() => {
    if (!table) return;

    const defaultOrder = table.getRowModel().rows.map(row => row.id);
    setRowOrder(defaultOrder);

    onRowOrderChange?.(table.getRowModel().rows.map(row => row.original), {
      reset: true,
    });
  }, [table, onRowOrderChange]);

  /**
   * Get row items for drag operations
   */
  const getRowItems = useCallback(() => {
    if (!table) return [];
    
    return rowOrder.map(rowId => {
      const row = table.getRowModel().rows.find(r => r.id === rowId);
      if (!row) return null;
      
      const data = row.original;
      return {
        id: rowId,
        name: getRowDisplayName(data),
        subtitle: getRowSubtitle(data),
        ...data,
      };
    }).filter(Boolean);
  }, [rowOrder, table]);

  /**
   * Update row order when table data changes
   */
  useEffect(() => {
    if (table) {
      const currentRows = table.getRowModel().rows;
      const currentOrder = currentRows.map(row => row.id);
      
      // Only update if the rows have actually changed
      if (currentOrder.length !== rowOrder.length ||
          !currentOrder.every((id, index) => id === rowOrder[index])) {
        setRowOrder(currentOrder);
      }
    }
  }, [table]);

  /**
   * Retry failed updates
   */
  const retryFailedUpdates = useCallback(async () => {
    const failedUpdates = [...updateQueue];
    setUpdateQueue([]);

    for (const update of failedUpdates) {
      try {
        const rows = table.getRowModel().rows;
        await syncRowOrderToBackend(update, rows);
      } catch (error) {
        console.error('Retry failed for row order update:', error);
        setUpdateQueue(prev => [...prev, update]);
      }
    }
  }, [updateQueue, table]);

  // Auto-retry failed updates
  useEffect(() => {
    if (updateQueue.length > 0 && !isUpdating) {
      const retryTimer = setTimeout(retryFailedUpdates, 5000);
      return () => clearTimeout(retryTimer);
    }
  }, [updateQueue, isUpdating, retryFailedUpdates]);

  return {
    // State
    rowOrder,
    isUpdating,
    hasPendingUpdates: updateQueue.length > 0,
    
    // Handlers
    handleRowDragEnd,
    resetRowOrder,
    retryFailedUpdates,
    
    // Utilities
    getRowItems,
    
    // Configuration
    className,
    orderField,
    optimisticUpdates,
  };
};

/**
 * Get display name for row
 */
const getRowDisplayName = (rowData) => {
  if (rowData.firstName && rowData.lastName) {
    return `${rowData.firstName} ${rowData.lastName}`;
  }
  
  if (rowData.name) return rowData.name;
  if (rowData.title) return rowData.title;
  if (rowData.clientName) return rowData.clientName;
  if (rowData.username) return rowData.username;
  if (rowData.email) return rowData.email;
  
  return `Row ${rowData.id || 'Unknown'}`;
};

/**
 * Get subtitle for row
 */
const getRowSubtitle = (rowData) => {
  if (rowData.profession) return rowData.profession;
  if (rowData.email && rowData.firstName) return rowData.email;
  if (rowData.appointmentType) return rowData.appointmentType;
  if (rowData.role) return rowData.role;
  return null;
};

export default useRowDragging;