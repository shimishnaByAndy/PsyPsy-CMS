/**
 * Table data hooks for TanStack Table integration
 * Provides server-side pagination, sorting, and filtering
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';

/**
 * Generic table data hook with server-side operations
 */
export const useTableData = ({
  queryKey,
  queryFn,
  
  // Server-side configuration
  enableServerSidePagination = true,
  enableServerSideSorting = true,
  enableServerSideFiltering = true,
  
  // Default configuration
  defaultPageSize = 10,
  defaultSorting = [],
  defaultFilters = {},
  
  // Additional options
  staleTime = 2 * 60 * 1000, // 2 minutes
  keepPreviousData = true,
  refetchOnWindowFocus = false,
  
  // Transform functions
  transformData = (data) => data,
  transformParams = (params) => params,
  
  // Error handling
  onError = (error) => console.error('Table data error:', error),
}) => {
  // Local state for table operations
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  
  const [sorting, setSorting] = useState(defaultSorting);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  // Build query parameters
  const queryParams = useMemo(() => {
    const baseParams = {
      // Pagination
      page: pagination.pageIndex,
      limit: pagination.pageSize,
      
      // Sorting
      sortBy: sorting.length > 0 ? sorting[0].id : undefined,
      sortDirection: sorting.length > 0 ? sorting[0].desc ? 'desc' : 'asc' : undefined,
      
      // Global search
      search: globalFilter,
      
      // Column filters
      columnFilters: columnFilters.reduce((acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      }, {}),
      
      // Custom filters
      ...filters,
    };
    
    return transformParams(baseParams);
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    globalFilter,
    columnFilters,
    filters,
    transformParams,
  ]);

  // Data query
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isPreviousData,
  } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => queryFn(queryParams),
    staleTime,
    keepPreviousData,
    refetchOnWindowFocus,
    onError,
  });

  // Transform and extract data
  const tableData = useMemo(() => {
    if (!data) return { rows: [], totalRowCount: 0 };
    
    const transformed = transformData(data);
    
    return {
      rows: transformed.results || transformed.data || transformed,
      totalRowCount: transformed.total || transformed.count || 0,
      pageCount: Math.ceil((transformed.total || 0) / pagination.pageSize),
    };
  }, [data, transformData, pagination.pageSize]);

  // Update handlers
  const handlePaginationChange = useCallback((updater) => {
    setPagination((prev) => {
      const newPagination = typeof updater === 'function' ? updater(prev) : updater;
      return newPagination;
    });
  }, []);

  const handleSortingChange = useCallback((updater) => {
    setSorting((prev) => {
      const newSorting = typeof updater === 'function' ? updater(prev) : updater;
      return newSorting;
    });
  }, []);

  const handleGlobalFilterChange = useCallback((value) => {
    setGlobalFilter(value);
    // Reset to first page when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleColumnFiltersChange = useCallback((updater) => {
    setColumnFilters((prev) => {
      const newFilters = typeof updater === 'function' ? updater(prev) : updater;
      return newFilters;
    });
    // Reset to first page when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Reset functions
  const resetPagination = useCallback(() => {
    setPagination({ pageIndex: 0, pageSize: defaultPageSize });
  }, [defaultPageSize]);

  const resetSorting = useCallback(() => {
    setSorting(defaultSorting);
  }, [defaultSorting]);

  const resetFilters = useCallback(() => {
    setGlobalFilter('');
    setColumnFilters([]);
    setFilters(defaultFilters);
    resetPagination();
  }, [defaultFilters, resetPagination]);

  return {
    // Data
    ...tableData,
    
    // Loading states
    isLoading,
    isFetching,
    isError,
    error,
    isPreviousData,
    
    // State
    pagination,
    sorting,
    globalFilter,
    columnFilters,
    filters,
    
    // Handlers
    setPagination: handlePaginationChange,
    setSorting: handleSortingChange,
    setGlobalFilter: handleGlobalFilterChange,
    setColumnFilters: handleColumnFiltersChange,
    setFilters: handleFiltersChange,
    
    // Actions
    refetch,
    resetPagination,
    resetSorting,
    resetFilters,
    
    // Configuration
    manualPagination: enableServerSidePagination,
    manualSorting: enableServerSideSorting,
    manualFiltering: enableServerSideFiltering,
  };
};

/**
 * Hook for clients table data
 */
export const useClientsTableData = (initialFilters = {}) => {
  const queryClient = useQueryClient();
  
  return useTableData({
    queryKey: queryKeys.clientsList(),
    queryFn: async (params) => {
      const { executeUserQuery } = await import('../services/queryService');
      
      const conditions = { userType: 2 };
      
      // Handle search
      if (params.search?.trim()) {
        conditions.$or = [
          { username: { $regex: params.search, $options: 'i' } },
          { email: { $regex: params.search, $options: 'i' } }
        ];
      }
      
      // Handle filters
      Object.entries(params.columnFilters || {}).forEach(([key, value]) => {
        if (value && value !== 'all') {
          conditions[key] = value;
        }
      });
      
      // Handle custom filters
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'all' && !['page', 'limit', 'search', 'sortBy', 'sortDirection', 'columnFilters'].includes(key)) {
          conditions[key] = value;
        }
      });

      return await executeUserQuery({
        conditions,
        include: ['clientPtr'],
        limit: params.limit,
        skip: params.page * params.limit,
        sortBy: params.sortBy || 'createdAt',
        ascending: params.sortDirection === 'asc',
        useMasterKey: true
      });
    },
    defaultFilters: initialFilters,
  });
};

/**
 * Hook for professionals table data
 */
export const useProfessionalsTableData = (initialFilters = {}) => {
  return useTableData({
    queryKey: queryKeys.professionalsList(),
    queryFn: async (params) => {
      const { executeUserQuery } = await import('../services/queryService');
      
      const conditions = { userType: 1 };
      
      // Handle search
      if (params.search?.trim()) {
        conditions.$or = [
          { username: { $regex: params.search, $options: 'i' } },
          { email: { $regex: params.search, $options: 'i' } }
        ];
      }
      
      // Handle filters
      Object.entries(params.columnFilters || {}).forEach(([key, value]) => {
        if (value && value !== 'all') {
          conditions[key] = value;
        }
      });

      return await executeUserQuery({
        conditions,
        include: ['professionalPtr'],
        limit: params.limit,
        skip: params.page * params.limit,
        sortBy: params.sortBy || 'createdAt',
        ascending: params.sortDirection === 'asc',
        useMasterKey: true
      });
    },
    defaultFilters: initialFilters,
  });
};

/**
 * Hook for appointments table data
 */
export const useAppointmentsTableData = (initialFilters = {}) => {
  return useTableData({
    queryKey: queryKeys.appointmentsList(),
    queryFn: async (params) => {
      const { executeClassQuery } = await import('../services/queryService');
      
      const conditions = {};
      
      // Handle search
      if (params.search?.trim()) {
        // Search logic for appointments would depend on your schema
        conditions.$or = [
          { status: { $regex: params.search, $options: 'i' } }
        ];
      }
      
      // Handle filters
      Object.entries(params.columnFilters || {}).forEach(([key, value]) => {
        if (value && value !== 'all') {
          conditions[key] = value;
        }
      });

      return await executeClassQuery({
        className: 'Appointment',
        conditions,
        include: ['clientPtr', 'professionalPtr'],
        limit: params.limit,
        skip: params.page * params.limit,
        sortBy: params.sortBy || 'createdAt',
        ascending: params.sortDirection === 'asc',
        useMasterKey: true
      });
    },
    defaultFilters: initialFilters,
    defaultPageSize: 25,
  });
};

/**
 * Hook for strings table data (i18n)
 */
export const useStringsTableData = (initialFilters = {}) => {
  return useTableData({
    queryKey: queryKeys.stringsList(),
    queryFn: async (params) => {
      // This would depend on your i18n data structure
      // For now, return mock data
      return {
        results: [],
        total: 0
      };
    },
    defaultFilters: initialFilters,
    defaultPageSize: 50,
    enableServerSidePagination: false, // If strings are loaded client-side
    enableServerSideSorting: false,
    enableServerSideFiltering: false,
  });
};

/**
 * Mutation hook for bulk operations
 */
export const useBulkOperations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ action, ids, data = {} }) => {
      const { executeCloudFunction } = await import('../services/queryService');
      
      return await executeCloudFunction('bulkOperation', {
        action,
        ids,
        data,
      }, true);
    },
    onSuccess: (result, { action, ids }) => {
      // Invalidate relevant queries based on action
      if (action.includes('client')) {
        queryClient.invalidateQueries({ queryKey: queryKeys.clientsList() });
      }
      if (action.includes('professional')) {
        queryClient.invalidateQueries({ queryKey: queryKeys.professionalsList() });
      }
      if (action.includes('appointment')) {
        queryClient.invalidateQueries({ queryKey: queryKeys.appointmentsList() });
      }
      
      console.log(`Bulk ${action} completed for ${ids.length} items`);
    },
    onError: (error, { action, ids }) => {
      console.error(`Bulk ${action} failed:`, error);
    },
  });
};

export default {
  useTableData,
  useClientsTableData,
  useProfessionalsTableData,
  useAppointmentsTableData,
  useStringsTableData,
  useBulkOperations,
};