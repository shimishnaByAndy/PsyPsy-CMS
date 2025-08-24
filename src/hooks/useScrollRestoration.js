/**
 * useScrollRestoration Hook - Scroll position restoration for virtual lists
 * 
 * Preserves scroll position across navigation and provides smooth scrolling utilities
 * for virtualized components.
 */

import React, { useEffect, useCallback } from 'react';

export const useScrollRestoration = (key, virtualizer, options = {}) => {
  const {
    storageType = 'sessionStorage',
    debounceMs = 100,
    restoreDelay = 50,
  } = options;

  const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
  const scrollKey = `scroll-${key}`;
  const debounceRef = React.useRef();

  /**
   * Save scroll position with debouncing
   */
  const saveScrollPosition = useCallback(() => {
    if (!virtualizer) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const scrollOffset = virtualizer.scrollOffset || 0;
      storage.setItem(scrollKey, scrollOffset.toString());
    }, debounceMs);
  }, [virtualizer, scrollKey, storage, debounceMs]);

  /**
   * Restore scroll position
   */
  const restoreScrollPosition = useCallback(() => {
    if (!virtualizer) return;

    const savedPosition = storage.getItem(scrollKey);
    if (savedPosition) {
      const offset = parseInt(savedPosition, 10);
      
      // Delay restoration to ensure virtualizer is ready
      setTimeout(() => {
        if (virtualizer.scrollToOffset) {
          virtualizer.scrollToOffset(offset, { align: 'start' });
        }
      }, restoreDelay);
    }
  }, [virtualizer, scrollKey, storage, restoreDelay]);

  /**
   * Clear saved position
   */
  const clearSavedPosition = useCallback(() => {
    storage.removeItem(scrollKey);
  }, [scrollKey, storage]);

  /**
   * Smooth scroll to specific item
   */
  const scrollToItem = useCallback((index, align = 'start') => {
    if (!virtualizer || !virtualizer.scrollToIndex) return;

    virtualizer.scrollToIndex(index, { 
      align, 
      behavior: 'smooth' 
    });
  }, [virtualizer]);

  /**
   * Smooth scroll to offset
   */
  const scrollToOffset = useCallback((offset, align = 'start') => {
    if (!virtualizer || !virtualizer.scrollToOffset) return;

    virtualizer.scrollToOffset(offset, { 
      align, 
      behavior: 'smooth' 
    });
  }, [virtualizer]);

  /**
   * Get current scroll information
   */
  const getScrollInfo = useCallback(() => {
    if (!virtualizer) return null;

    return {
      offset: virtualizer.scrollOffset || 0,
      direction: virtualizer.scrollDirection || 'forward',
      isScrolling: virtualizer.isScrolling || false,
    };
  }, [virtualizer]);

  // Restore position on mount or when virtualizer changes
  useEffect(() => {
    if (virtualizer) {
      restoreScrollPosition();
    }
  }, [virtualizer, restoreScrollPosition]);

  // Save position on scroll
  useEffect(() => {
    if (!virtualizer) return;

    const handleScroll = () => {
      saveScrollPosition();
    };

    const scrollElement = virtualizer.scrollElement;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [virtualizer, saveScrollPosition]);

  // Save position on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveScrollPosition]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    restoreScrollPosition,
    clearSavedPosition,
    scrollToItem,
    scrollToOffset,
    getScrollInfo,
  };
};