import { QueryClient, DefaultOptions } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

/**
 * Default query options for TanStack Query
 * Optimized for healthcare applications with offline support
 */
const queryConfig: DefaultOptions = {
  queries: {
    // Cache data for 5 minutes by default
    staleTime: 5 * 60 * 1000,
    
    // Keep data in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Retry failed queries 3 times with exponential backoff
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 3
    },
    
    // Retry with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus for critical healthcare data
    refetchOnWindowFocus: true,
    
    // Refetch when coming back online
    refetchOnReconnect: true,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: true,
  },
  
  mutations: {
    // Retry mutations once
    retry: 1,
    
    // Retry delay for mutations
    retryDelay: 2000,
  }
}

/**
 * Create the main query client instance
 */
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

/**
 * Query key factory for consistent key management
 * Follows the pattern: [domain, ...params, filters]
 */
export const queryKeys = {
  // Authentication
  auth: () => ['auth'] as const,
  currentUser: () => ['auth', 'current-user'] as const,
  
  // Clients
  clients: {
    all: () => ['clients'] as const,
    lists: () => ['clients', 'list'] as const,
    list: (filters: Record<string, any> = {}) => ['clients', 'list', filters] as const,
    details: () => ['clients', 'detail'] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
    search: (query: string) => ['clients', 'search', query] as const,
    stats: () => ['clients', 'stats'] as const,
  },
  
  // Professionals
  professionals: {
    all: () => ['professionals'] as const,
    lists: () => ['professionals', 'list'] as const,
    list: (filters: Record<string, any> = {}) => ['professionals', 'list', filters] as const,
    details: () => ['professionals', 'detail'] as const,
    detail: (id: string) => ['professionals', 'detail', id] as const,
    availability: (id: string, date?: string) => ['professionals', 'availability', id, date] as const,
    schedule: (id: string) => ['professionals', 'schedule', id] as const,
    stats: () => ['professionals', 'stats'] as const,
  },
  
  // Appointments
  appointments: {
    all: () => ['appointments'] as const,
    lists: () => ['appointments', 'list'] as const,
    list: (filters: Record<string, any> = {}) => ['appointments', 'list', filters] as const,
    details: () => ['appointments', 'detail'] as const,
    detail: (id: string) => ['appointments', 'detail', id] as const,
    calendar: (date: string) => ['appointments', 'calendar', date] as const,
    upcoming: (limit = 10) => ['appointments', 'upcoming', limit] as const,
    stats: () => ['appointments', 'stats'] as const,
  },
  
  // Notes and Documents
  notes: {
    all: () => ['notes'] as const,
    lists: () => ['notes', 'list'] as const,
    list: (filters: Record<string, any> = {}) => ['notes', 'list', filters] as const,
    byClient: (clientId: string) => ['notes', 'client', clientId] as const,
    byAppointment: (appointmentId: string) => ['notes', 'appointment', appointmentId] as const,
    detail: (id: string) => ['notes', 'detail', id] as const,
  },
  
  // Documents
  documents: {
    all: () => ['documents'] as const,
    lists: () => ['documents', 'list'] as const,
    list: (filters: Record<string, any> = {}) => ['documents', 'list', filters] as const,
    byClient: (clientId: string) => ['documents', 'client', clientId] as const,
    detail: (id: string) => ['documents', 'detail', id] as const,
  },
  
  // Analytics and Dashboard
  dashboard: {
    stats: () => ['dashboard', 'stats'] as const,
    overview: (period: string) => ['dashboard', 'overview', period] as const,
    charts: (type: string, period: string) => ['dashboard', 'charts', type, period] as const,
  },
  
  // Settings
  settings: {
    user: () => ['settings', 'user'] as const,
    system: () => ['settings', 'system'] as const,
  }
} as const

/**
 * Local storage persister for offline support
 */
const localStoragePersister = {
  persistClient: async (client: any) => {
    try {
      localStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client))
    } catch {
      // Ignore storage errors
    }
  },
  restoreClient: async () => {
    try {
      const cache = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE')
      return cache ? JSON.parse(cache) : undefined
    } catch {
      return undefined
    }
  },
  removeClient: async () => {
    try {
      localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE')
    } catch {
      // Ignore storage errors
    }
  },
}

/**
 * Initialize persistence for offline support
 */
export const initializePersistence = () => {
  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    
    // Only persist certain query types for performance
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        const queryKey = query.queryKey[0] as string
        
        // Don't persist real-time data or temporary queries
        const excludedKeys = ['dashboard', 'stats', 'search', 'availability']
        return !excludedKeys.some(key => queryKey.includes(key))
      },
    },
    
    // Cache for 24 hours
    maxAge: 24 * 60 * 60 * 1000,
    
    // Note: gcTime not supported in this version - cache cleanup handled by maxAge
  })
}

/**
 * Utility functions for query management
 */
export const queryUtils = {
  /**
   * Invalidate all queries for a specific domain
   */
  invalidateDomain: (domain: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey[0] as string
        return queryKey === domain
      }
    })
  },
  
  /**
   * Prefetch data for better UX
   */
  prefetchClientDetails: async (clientId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.clients.detail(clientId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  },
  
  prefetchProfessionalDetails: async (professionalId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.professionals.detail(professionalId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  },
  
  /**
   * Optimistic updates for better perceived performance
   */
  optimisticUpdate: <T>(
    queryKey: readonly unknown[],
    updater: (old: T) => T
  ) => {
    queryClient.setQueryData(queryKey, updater)
  },
  
  /**
   * Clear all cached data (useful for logout)
   */
  clearAllQueries: () => {
    queryClient.clear()
  },
  
  /**
   * Get cached data without triggering a refetch
   */
  getCachedData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey)
  },
  
  /**
   * Manually trigger a refetch for specific queries
   */
  refetchQuery: (queryKey: readonly unknown[]) => {
    return queryClient.refetchQueries({
      queryKey,
      type: 'active'
    })
  },
}

/**
 * Error boundary helpers
 */
export const queryErrorUtils = {
  /**
   * Check if error is a network error
   */
  isNetworkError: (error: unknown): boolean => {
    return error instanceof Error && (
      error.message.includes('NetworkError') ||
      error.message.includes('fetch') ||
      error.name === 'NetworkError'
    )
  },
  
  /**
   * Check if error is an authentication error
   */
  isAuthError: (error: unknown): boolean => {
    return !!(error && typeof error === 'object' && 'status' in error &&
           ((error as any).status === 401 || (error as any).status === 403))
  },
  
  /**
   * Get user-friendly error message
   */
  getErrorMessage: (error: unknown): string => {
    if (queryErrorUtils.isNetworkError(error)) {
      return 'Network connection issue. Please check your internet connection.'
    }
    
    if (queryErrorUtils.isAuthError(error)) {
      return 'Your session has expired. Please log in again.'
    }
    
    if (error instanceof Error) {
      return error.message
    }
    
    return 'An unexpected error occurred. Please try again.'
  }
}

export default queryClient