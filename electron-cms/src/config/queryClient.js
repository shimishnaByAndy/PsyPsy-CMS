/**
 * TanStack Query client configuration for PsyPsy CMS
 * Handles Parse Server integration, error handling, and caching strategies
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ParseAuth } from '../services/parseService';

/**
 * Create TanStack Query client with Parse Server specific configuration
 */
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - reasonable for CMS data
        cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache
        retry: (failureCount, error) => {
          // Don't retry on authentication errors
          if (error.code === 101 || error.code === 209) {
            console.warn('Authentication error detected, not retrying:', error.code);
            return false;
          }
          // Don't retry on 4xx client errors
          if (error.status >= 400 && error.status < 500) {
            return false;
          }
          // Retry up to 3 times for network/server errors
          return failureCount < 3;
        },
        refetchOnWindowFocus: true, // Useful for CMS to show fresh data
        refetchOnReconnect: true, // Refetch when network reconnects
        refetchOnMount: true, // Always refetch on component mount
      },
      mutations: {
        retry: 1, // Only retry mutations once
        // Default timeout for mutations
        mutationTimeout: 30 * 1000, // 30 seconds
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        console.error('Global query error:', error, 'Query key:', query.queryKey);
        
        // Handle session expiry globally
        if (error.code === 209) {
          console.warn('Session expired, logging out user');
          ParseAuth.logout();
          // Redirect to login page
          window.location.href = '/authentication/login';
        }
        
        // Handle other authentication errors
        if (error.code === 101) {
          console.warn('Authentication failed');
          ParseAuth.logout();
          window.location.href = '/authentication/login';
        }
      },
      onSuccess: (data, query) => {
        // Log successful queries in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Query success:', query.queryKey, 'Data count:', Array.isArray(data?.results) ? data.results.length : 'N/A');
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        console.error('Global mutation error:', error, 'Variables:', variables);
        
        // Handle session expiry in mutations
        if (error.code === 209 || error.code === 101) {
          ParseAuth.logout();
          window.location.href = '/authentication/login';
        }
      },
      onSuccess: (data, variables, context, mutation) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Mutation success:', mutation.options.mutationKey || 'unknown');
        }
      },
    }),
  });
};

// Create and export the query client instance
export const queryClient = createQueryClient();

// Export the factory function for testing
export { createQueryClient };

export default queryClient;