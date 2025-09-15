/**
 * Professional data hooks using TanStack Query
 * Provides data fetching and caching for professional operations
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import { executeUserQuery, executeParseCount } from '../services/queryService';

/**
 * Hook to fetch professionals list with filtering and pagination
 * @param {Object} filters - Filter parameters
 * @param {number} filters.page - Page number (0-based)
 * @param {number} filters.limit - Items per page
 * @param {string} filters.search - Search term for username/email/business name
 * @param {string} filters.sortBy - Sort field
 * @param {string} filters.sortDirection - Sort direction ('asc' or 'desc')
 * @param {boolean} filters.verifiedOnly - Only show verified professionals
 * @param {string} filters.profType - Filter by professional type
 * @param {boolean} filters.enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with professionals data
 */
export const useProfessionals = (filters = {}) => {
  const {
    page = 0,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    verifiedOnly = false,
    profType = '',
    enabled = true
  } = filters;

  return useQuery({
    queryKey: queryKeys.professionalsList({ 
      page, limit, search, sortBy, sortDirection, verifiedOnly, profType 
    }),
    queryFn: async () => {
      console.log('Fetching professionals with filters:', filters);
      
      // Build query conditions for professionals (userType = 1)
      const conditions = { userType: 1 };
      
      // Add verification filter
      if (verifiedOnly) {
        conditions.isVerified = true;
      }
      
      // Add search conditions if provided
      if (search.trim()) {
        conditions.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Execute the user query
      let results = await executeUserQuery({
        conditions,
        include: ['professionalPtr'], // Include professional profile data
        limit,
        skip: page * limit,
        sortBy,
        ascending: sortDirection === 'asc',
        useMasterKey: true
      });
      
      // Client-side filtering for professional type if needed
      if (profType && results) {
        results = results.filter(prof => 
          prof.professional && prof.professional.profType === profType
        );
      }
      
      // Get total count for pagination
      const countConditions = { ...conditions };
      const total = await executeParseCount({
        className: '_User',
        conditions: countConditions,
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
    staleTime: 3 * 60 * 1000, // 3 minutes for professional data
    cacheTime: 7 * 60 * 1000, // 7 minutes cache
    keepPreviousData: true,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch a single professional by ID
 * @param {string} professionalId - Professional ID to fetch
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with professional data
 */
export const useProfessional = (professionalId, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.professionalDetail(professionalId),
    queryFn: async () => {
      if (!professionalId) throw new Error('Professional ID is required');
      
      const results = await executeUserQuery({
        conditions: { objectId: professionalId, userType: 1 },
        include: ['professionalPtr'],
        limit: 1,
        useMasterKey: true
      });
      
      if (results.length === 0) {
        throw new Error(`Professional with ID ${professionalId} not found`);
      }
      
      return results[0];
    },
    enabled: enabled && !!professionalId,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual records
    cacheTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to get professionals count with filters
 * @param {Object} filters - Filter parameters
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with count
 */
export const useProfessionalsCount = (filters = {}, enabled = true) => {
  const { search = '', verifiedOnly = false } = filters;
  
  return useQuery({
    queryKey: queryKeys.professionalsCount({ search, verifiedOnly }),
    queryFn: async () => {
      const conditions = { userType: 1 };
      
      if (verifiedOnly) {
        conditions.isVerified = true;
      }
      
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
    staleTime: 2 * 60 * 1000, // 2 minutes for counts
    cacheTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch professionals pending verification
 * @param {number} limit - Number of pending professionals to fetch
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with pending professionals
 */
export const usePendingProfessionals = (limit = 10, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.professionalsList({ pending: true, limit }),
    queryFn: async () => {
      const results = await executeUserQuery({
        conditions: { 
          userType: 1,
          $or: [
            { isVerified: { $ne: true } },
            { isVerified: { $exists: false } }
          ]
        },
        include: ['professionalPtr'],
        limit,
        skip: 0,
        sortBy: 'createdAt',
        ascending: true, // Oldest first for verification queue
        useMasterKey: true
      });
      
      return results || [];
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute for pending verification
    cacheTime: 3 * 60 * 1000,
    refetchInterval: 60 * 1000, // Check for new pending every minute
  });
};

/**
 * Hook to fetch recently verified professionals
 * @param {number} limit - Number of recent professionals to fetch
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with recent professionals
 */
export const useRecentProfessionals = (limit = 5, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.professionalsList({ recent: true, verified: true, limit }),
    queryFn: async () => {
      const results = await executeUserQuery({
        conditions: { userType: 1, isVerified: true },
        include: ['professionalPtr'],
        limit,
        skip: 0,
        sortBy: 'createdAt',
        ascending: false, // Most recent first
        useMasterKey: true
      });
      
      return results || [];
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes for recent data
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

/**
 * Hook for infinite loading of professionals
 * @param {Object} filters - Filter parameters
 * @returns {Object} TanStack Infinite Query result
 */
export const useInfiniteProfessionals = (filters = {}) => {
  const {
    limit = 20,
    search = '',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    verifiedOnly = false
  } = filters;

  return useInfiniteQuery({
    queryKey: queryKeys.professionalsList({ 
      infinite: true, limit, search, sortBy, sortDirection, verifiedOnly 
    }),
    queryFn: async ({ pageParam = 0 }) => {
      const conditions = { userType: 1 };
      
      if (verifiedOnly) {
        conditions.isVerified = true;
      }
      
      if (search.trim()) {
        conditions.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      const results = await executeUserQuery({
        conditions,
        include: ['professionalPtr'],
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
    staleTime: 3 * 60 * 1000,
    cacheTime: 7 * 60 * 1000,
  });
};

/**
 * Hook to get professional verification statistics
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with verification stats
 */
export const useProfessionalVerificationStats = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.professionalsList({ stats: 'verification' }),
    queryFn: async () => {
      // Get total count
      const total = await executeParseCount({
        className: '_User',
        conditions: { userType: 1 },
        useMasterKey: true
      });
      
      // Get verified count
      const verified = await executeParseCount({
        className: '_User',
        conditions: { userType: 1, isVerified: true },
        useMasterKey: true
      });
      
      // Calculate pending
      const pending = total - verified;
      
      return {
        total,
        verified,
        pending,
        verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0
      };
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch stats every 5 minutes
  });
};

export default {
  useProfessionals,
  useProfessional,
  useProfessionalsCount,
  usePendingProfessionals,
  useRecentProfessionals,
  useInfiniteProfessionals,
  useProfessionalVerificationStats
};