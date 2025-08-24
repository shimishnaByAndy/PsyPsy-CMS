/**
 * useDynamicRowHeight Hook - Dynamic row height calculation for virtual scrolling
 * 
 * Provides efficient row height measurement and caching for variable-height content
 * in virtualized data grids.
 */

import React, { useState, useCallback, useRef } from 'react';

export const useDynamicRowHeight = (defaultHeight = 52) => {
  const [rowHeights, setRowHeights] = useState(new Map());
  const measureRef = useRef();
  const measurementCache = useRef(new Map());

  /**
   * Measure row height for given content
   */
  const measureRowHeight = useCallback((index, content) => {
    // Check cache first
    const contentHash = typeof content === 'string' ? content : JSON.stringify(content);
    if (measurementCache.current.has(contentHash)) {
      const cachedHeight = measurementCache.current.get(contentHash);
      setRowHeights(prev => new Map(prev.set(index, cachedHeight)));
      return cachedHeight;
    }

    if (!measureRef.current) return defaultHeight;

    // Create temporary measurement element
    const measurer = document.createElement('div');
    measurer.style.cssText = `
      visibility: hidden;
      position: absolute;
      top: -9999px;
      width: ${measureRef.current.offsetWidth}px;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      padding: 16px;
    `;

    // Set content
    if (typeof content === 'string') {
      measurer.textContent = content;
    } else if (React.isValidElement(content)) {
      // For React elements, render to string or use a simplified approach
      measurer.innerHTML = content.toString();
    }
    
    document.body.appendChild(measurer);
    const height = Math.max(defaultHeight, measurer.offsetHeight);
    document.body.removeChild(measurer);

    // Cache the result
    measurementCache.current.set(contentHash, height);
    setRowHeights(prev => new Map(prev.set(index, height)));
    
    return height;
  }, [defaultHeight]);

  /**
   * Get estimated size for virtualizer
   */
  const getEstimatedSize = useCallback((index) => {
    return rowHeights.get(index) || defaultHeight;
  }, [rowHeights, defaultHeight]);

  /**
   * Pre-measure multiple rows
   */
  const batchMeasure = useCallback((items) => {
    const newHeights = new Map();
    
    items.forEach((item, index) => {
      const height = measureRowHeight(index, item);
      newHeights.set(index, height);
    });

    return newHeights;
  }, [measureRowHeight]);

  /**
   * Clear height cache
   */
  const clearCache = useCallback(() => {
    setRowHeights(new Map());
    measurementCache.current.clear();
  }, []);

  /**
   * Get statistics
   */
  const getStats = useCallback(() => {
    const heights = Array.from(rowHeights.values());
    return {
      totalRows: rowHeights.size,
      averageHeight: heights.length ? heights.reduce((a, b) => a + b, 0) / heights.length : defaultHeight,
      minHeight: heights.length ? Math.min(...heights) : defaultHeight,
      maxHeight: heights.length ? Math.max(...heights) : defaultHeight,
      cacheSize: measurementCache.current.size,
    };
  }, [rowHeights, defaultHeight]);

  return {
    measureRef,
    measureRowHeight,
    getEstimatedSize,
    batchMeasure,
    clearCache,
    getStats,
    rowHeights,
  };
};