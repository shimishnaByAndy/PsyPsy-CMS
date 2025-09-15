/**
 * Development utilities for the application
 * Enhanced with TanStack Query debugging capabilities
 */

import { queryClient } from '../config/queryClient';
import { queryKeyHelpers } from '../services/queryKeys';

/**
 * Checks if the app is running in Electron
 * @returns {boolean} True if running in Electron
 */
export const isElectron = () => {
  return window.isElectron || 
    (navigator.userAgent.toLowerCase().indexOf(' electron/') > -1);
};

/**
 * Reloads the Electron window
 */
export const reloadElectron = () => {
  if (isElectron() && window.electron) {
    window.electron.reload();
  }
};

/**
 * TanStack Query debugging utilities
 */
export const queryDevTools = {
  /**
   * Get all cached queries
   */
  getAllQueries: () => {
    return queryClient.getQueryCache().getAll();
  },
  
  /**
   * Get query cache size
   */
  getCacheSize: () => {
    return queryKeyHelpers.getCacheSize(queryClient);
  },
  
  /**
   * Debug log all cached queries
   */
  debugCache: () => {
    return queryKeyHelpers.debugLogCache(queryClient);
  },
  
  /**
   * Clear all cached data
   */
  clearCache: () => {
    queryKeyHelpers.clearAllCache(queryClient);
    console.log('TanStack Query cache cleared');
  },
  
  /**
   * Invalidate all queries
   */
  invalidateAll: () => {
    queryClient.invalidateQueries();
    console.log('All TanStack Query queries invalidated');
  },
  
  /**
   * Get query by key
   */
  getQuery: (queryKey) => {
    return queryClient.getQueryData(queryKey);
  },
  
  /**
   * Set query data manually
   */
  setQuery: (queryKey, data) => {
    queryClient.setQueryData(queryKey, data);
    console.log('Query data set:', queryKey);
  },
  
  /**
   * Remove specific query
   */
  removeQuery: (queryKey) => {
    queryClient.removeQueries({ queryKey });
    console.log('Query removed:', queryKey);
  },
  
  /**
   * Get mutation cache
   */
  getMutations: () => {
    return queryClient.getMutationCache().getAll();
  }
};

/**
 * Initializes dev tools for the app
 */
export const initDevTools = () => {
  // Add keyboard shortcut for reload: Ctrl+R or Cmd+R
  if (isElectron()) {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        reloadElectron();
      }
    });
    
    console.log('Development tools initialized in Electron environment');
  }
  
  // Add TanStack Query dev tools to window for debugging
  if (process.env.NODE_ENV === 'development') {
    window.queryDevTools = queryDevTools;
    window.queryClient = queryClient;
    
    console.log('TanStack Query dev tools available at window.queryDevTools');
    console.log('Available methods:', Object.keys(queryDevTools));
  }
};

export default {
  isElectron,
  reloadElectron,
  initDevTools,
  queryDevTools,
}; 