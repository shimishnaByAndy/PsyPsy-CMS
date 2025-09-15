/**
 * Client data hooks using TanStack Query
 * Provides data fetching and caching for client operations
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import { executeUserQuery, executeParseCount } from '../services/queryService';

/**
 * Hook to fetch clients list with filtering and pagination
 * @param {Object} filters - Filter parameters
 * @param {number} filters.page - Page number (0-based)
 * @param {number} filters.limit - Items per page
 * @param {string} filters.search - Search term for username/email
 * @param {string} filters.sortBy - Sort field
 * @param {string} filters.sortDirection - Sort direction ('asc' or 'desc')
 * @param {boolean} filters.enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with clients data
 */
export const useClients = (filters = {}) => {
  const {
    page = 0,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    enabled = true
  } = filters;

  return useQuery({
    queryKey: queryKeys.clientsList({ page, limit, search, sortBy, sortDirection }),
    queryFn: async () => {
      console.log('Fetching clients with filters:', filters);
      
      // Build query conditions for clients (userType = 2)
      const conditions = { userType: 2 };
      
      // Add search conditions if provided
      if (search.trim()) {
        conditions.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Execute the user query
      const results = await executeUserQuery({
        conditions,
        include: ['clientPtr'], // Include client profile data
        limit,
        skip: page * limit,
        sortBy,
        ascending: sortDirection === 'asc',
        useMasterKey: true
      });
      
      // Get total count for pagination
      const total = await executeParseCount({
        className: '_User',
        conditions,
        useMasterKey: true
      });
      
      return {
        results: results || [],
        total,
        page,
        limit,
        hasNextPage: (page + 1) * limit < total,
        hasPreviousPage: page > 0
      };
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes for user data
    cacheTime: 5 * 60 * 1000, // 5 minutes cache
    keepPreviousData: true, // Keep previous data while loading new page
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch a single client by ID
 * @param {string} clientId - Client ID to fetch
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with client data
 */
export const useClient = (clientId, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.clientDetail(clientId),
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID is required');
      
      const results = await executeUserQuery({
        conditions: { objectId: clientId, userType: 2 },
        include: ['clientPtr'],
        limit: 1,
        useMasterKey: true
      });
      
      if (results.length === 0) {
        throw new Error(`Client with ID ${clientId} not found`);
      }
      
      return results[0];
    },
    enabled: enabled && !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual records
    cacheTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to get clients count with search filter
 * @param {string} search - Search term
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with count
 */
export const useClientsCount = (search = '', enabled = true) => {
  return useQuery({
    queryKey: queryKeys.clientsCount(search),
    queryFn: async () => {
      const conditions = { userType: 2 };
      
      if (search.trim()) {
        conditions.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      return await executeParseCount({
        className: '_User',
        conditions,
        useMasterKey: true
      });
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute for counts
    cacheTime: 3 * 60 * 1000,
  });
};

/**
 * Hook for infinite loading of clients
 * Useful for virtual scrolling or infinite scroll implementations
 * @param {Object} filters - Filter parameters
 * @returns {Object} TanStack Infinite Query result
 */
export const useInfiniteClients = (filters = {}) => {
  const {
    limit = 20,
    search = '',
    sortBy = 'createdAt',
    sortDirection = 'desc'
  } = filters;

  return useInfiniteQuery({
    queryKey: queryKeys.clientsList({ infinite: true, limit, search, sortBy, sortDirection }),
    queryFn: async ({ pageParam = 0 }) => {
      const conditions = { userType: 2 };
      
      if (search.trim()) {
        conditions.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      const results = await executeUserQuery({
        conditions,
        include: ['clientPtr'],
        limit,
        skip: pageParam * limit,
        sortBy,
        ascending: sortDirection === 'asc',
        useMasterKey: true
      });
      
      return {
        results: results || [],
        nextPage: results && results.length === limit ? pageParam + 1 : undefined,
        hasNextPage: results && results.length === limit
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch recently created clients
 * @param {number} limit - Number of recent clients to fetch
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with recent clients
 */
export const useRecentClients = (limit = 5, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.clientsList({ recent: true, limit }),
    queryFn: async () => {
      const results = await executeUserQuery({
        conditions: { userType: 2 },
        include: ['clientPtr'],
        limit,
        skip: 0,
        sortBy: 'createdAt',
        ascending: false, // Most recent first
        useMasterKey: true
      });
      
      return results || [];
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute for recent data
    cacheTime: 3 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export default {
  useClients,
  useClient,
  useClientsCount,
  useInfiniteClients,
  useRecentClients
};