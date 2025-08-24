/**
 * useInfiniteVirtualData Hook - Infinite scrolling data management
 * 
 * Provides efficient data loading, caching, and state management
 * for virtualized data grids with Parse Server integration.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export const useInfiniteVirtualData = (dataService, initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadedRanges, setLoadedRanges] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const abortControllerRef = useRef();
  const loadingPromises = useRef(new Map());

  /**
   * Load total count with filters
   */
  const loadTotalCount = useCallback(async () => {
    try {
      setError(null);
      const count = await dataService.getTotalCount(filters);
      setTotalCount(count);
      
      // Initialize data array with placeholders
      setData(new Array(count).fill(null));
      
      // Reset loaded ranges when filters change
      setLoadedRanges(new Set());
      
      return count;
    } catch (err) {
      console.error('Failed to load total count:', err);
      setError(err);
      setTotalCount(0);
      setData([]);
    }
  }, [dataService, filters]);

  /**
   * Load a specific range of data
   */
  const loadRange = useCallback(async (startIndex, endIndex) => {
    const rangeKey = `${startIndex}-${endIndex}-${JSON.stringify(filters)}-${sortField}-${sortDirection}`;
    
    // Check if already loaded
    if (loadedRanges.has(rangeKey)) {
      return;
    }

    // Check if already loading
    if (loadingPromises.current.has(rangeKey)) {
      return loadingPromises.current.get(rangeKey);
    }

    // Abort previous requests if needed
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const loadPromise = async () => {
      try {
        setLoading(true);
        setError(null);

        const pageData = await dataService.loadPage(
          startIndex,
          endIndex,
          filters,
          sortField,
          sortDirection
        );
        
        // Update data array with loaded items
        setData(prevData => {
          const newData = [...prevData];
          pageData.forEach((item, index) => {
            if (startIndex + index < newData.length) {
              newData[startIndex + index] = item;
            }
          });
          return newData;
        });

        // Mark range as loaded
        setLoadedRanges(prev => new Set([...prev, rangeKey]));
        
        return pageData;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load range:', err);
          setError(err);
        }
        throw err;
      } finally {
        setLoading(false);
        loadingPromises.current.delete(rangeKey);
      }
    };

    const promise = loadPromise();
    loadingPromises.current.set(rangeKey, promise);
    
    return promise;
  }, [dataService, filters, sortField, sortDirection, loadedRanges]);

  /**
   * Preload adjacent ranges for smooth scrolling
   */
  const preloadAdjacentRanges = useCallback((currentStart, currentEnd, bufferSize = 50) => {
    const ranges = [];
    
    // Preload before current range
    if (currentStart > 0) {
      const preloadStart = Math.max(0, currentStart - bufferSize);
      ranges.push([preloadStart, currentStart]);
    }
    
    // Preload after current range
    if (currentEnd < totalCount) {
      const preloadEnd = Math.min(totalCount, currentEnd + bufferSize);
      ranges.push([currentEnd, preloadEnd]);
    }

    // Load ranges in parallel
    ranges.forEach(([start, end]) => {
      loadRange(start, end).catch(err => {
        // Silent preload errors
        console.debug('Preload failed:', err);
      });
    });
  }, [totalCount, loadRange]);

  /**
   * Load visible range with preloading
   */
  const loadVisibleRange = useCallback((startIndex, endIndex, bufferSize = 50) => {
    // Load current visible range
    const bufferedStart = Math.max(0, startIndex - bufferSize);
    const bufferedEnd = Math.min(totalCount, endIndex + bufferSize);
    
    loadRange(bufferedStart, bufferedEnd).then(() => {
      // Preload adjacent ranges after visible range is loaded
      preloadAdjacentRanges(bufferedStart, bufferedEnd, bufferSize);
    });
  }, [totalCount, loadRange, preloadAdjacentRanges]);

  /**
   * Refresh data with current filters
   */
  const refresh = useCallback(async () => {
    // Clear cache and loaded ranges
    dataService.clearCache();
    setLoadedRanges(new Set());
    setData([]);
    setError(null);
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    loadingPromises.current.clear();
    
    // Reload total count
    await loadTotalCount();
  }, [dataService, loadTotalCount]);

  /**
   * Update filters and refresh data
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Update sorting and refresh data
   */
  const updateSorting = useCallback((field, direction = 'asc') => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  /**
   * Get loading state for specific range
   */
  const isRangeLoading = useCallback((startIndex, endIndex) => {
    const rangeKey = `${startIndex}-${endIndex}-${JSON.stringify(filters)}-${sortField}-${sortDirection}`;
    return loadingPromises.current.has(rangeKey);
  }, [filters, sortField, sortDirection]);

  /**
   * Get statistics about data loading
   */
  const getStats = useCallback(() => {
    const loadedItems = data.filter(item => item !== null).length;
    const loadingRanges = loadingPromises.current.size;
    
    return {
      totalCount,
      loadedItems,
      loadedRanges: loadedRanges.size,
      loadingRanges,
      cacheStats: dataService.getCacheStats?.() || {},
    };
  }, [data, totalCount, loadedRanges, dataService]);

  // Load initial data when filters change
  useEffect(() => {
    loadTotalCount();
  }, [loadTotalCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      loadingPromises.current.clear();
    };
  }, []);

  return {
    // Data state
    data,
    totalCount,
    loading,
    error,
    
    // Current settings
    filters,
    sortField,
    sortDirection,
    
    // Actions
    loadRange,
    loadVisibleRange,
    refresh,
    updateFilters,
    updateSorting,
    
    // Utilities
    isRangeLoading,
    getStats,
  };
};