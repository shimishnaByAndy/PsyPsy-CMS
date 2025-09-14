/**
 * Custom hooks for client data management
 * Uses TanStack Query with healthcare-optimized caching and error handling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { queryKeys, queryUtils } from '@/services/queryClient'
import { Client, SearchFilters, SortOptions } from '@/types'
import { useCallback } from 'react'
import { toast } from 'sonner'

/**
 * Hook to fetch paginated client list with filters and sorting
 */
export function useClients(options?: {
  page?: number
  limit?: number
  filters?: SearchFilters
  sort?: SortOptions
  enabled?: boolean
}) {
  const { page = 1, limit = 10, filters = {}, sort, enabled = true } = options || {}

  return useQuery({
    queryKey: queryKeys.clients.list({ page, limit, filters, sort }),
    queryFn: () => api.clients.getClients({ page, limit, filters, sort }),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes for list data
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  })
}

/**
 * Hook to fetch a single client by ID
 */
export function useClient(id: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {}

  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => api.clients.getClient(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for detail data
    retry: (failureCount, error) => {
      // Don't retry if client not found
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook to search clients with debounced query
 */
export function useClientSearch(query: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.clients.search(query),
    queryFn: () => api.clients.searchClients(query, limit),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 30 * 1000, // 30 seconds for search results
    gcTime: 2 * 60 * 1000, // 2 minutes cache time for search
  })
}

/**
 * Hook to get client statistics
 */
export function useClientStats() {
  return useQuery({
    queryKey: queryKeys.clients.stats(),
    queryFn: () => api.clients.getClientStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  })
}

/**
 * Hook to get client's appointments
 */
export function useClientAppointments(clientId: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {}

  return useQuery({
    queryKey: queryKeys.appointments.list({ clientId }),
    queryFn: () => api.clients.getClientAppointments(clientId),
    enabled: enabled && !!clientId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.clients.createClient(data),
    
    onSuccess: (newClient) => {
      // Invalidate and refetch client lists
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.stats() })
      
      // Add the new client to the cache
      queryClient.setQueryData(queryKeys.clients.detail(newClient.id), newClient)
      
      toast.success('Client created successfully', {
        description: `${newClient.user.profile?.fullName} has been added to your client list.`
      })
    },
    
    onError: (error) => {
      toast.error('Failed to create client', {
        description: error instanceof Error ? error.message : 'Please try again.'
      })
    },
  })
}

/**
 * Hook to update an existing client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      api.clients.updateClient(id, data),
    
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.clients.detail(id) })
      
      // Snapshot previous value
      const previousClient = queryClient.getQueryData(queryKeys.clients.detail(id))
      
      // Optimistically update
      if (previousClient) {
        queryClient.setQueryData(
          queryKeys.clients.detail(id),
          (old: Client) => ({ ...old, ...data })
        )
      }
      
      return { previousClient }
    },
    
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousClient) {
        queryClient.setQueryData(queryKeys.clients.detail(id), context.previousClient)
      }
      
      toast.error('Failed to update client', {
        description: error instanceof Error ? error.message : 'Please try again.'
      })
    },
    
    onSuccess: (updatedClient) => {
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() })
      
      toast.success('Client updated successfully', {
        description: `${updatedClient.user.profile?.fullName}'s information has been updated.`
      })
    },
    
    onSettled: (data, error, { id }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) })
    },
  })
}

/**
 * Hook to delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.clients.deleteClient(id),
    
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.clients.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.stats() })
      
      toast.success('Client deleted successfully', {
        description: 'The client has been removed from your system.'
      })
    },
    
    onError: (error) => {
      toast.error('Failed to delete client', {
        description: error instanceof Error ? error.message : 'Please try again.'
      })
    },
  })
}

/**
 * Hook to assign a professional to a client
 */
export function useAssignProfessional() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, professionalId }: { clientId: string; professionalId: string }) =>
      api.clients.assignProfessional(clientId, professionalId),
    
    onSuccess: (_, { clientId, professionalId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(clientId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.professionals.detail(professionalId) })
      
      toast.success('Professional assigned successfully', {
        description: 'The professional has been added to the client\'s care team.'
      })
    },
    
    onError: (error) => {
      toast.error('Failed to assign professional', {
        description: error instanceof Error ? error.message : 'Please try again.'
      })
    },
  })
}

/**
 * Hook to unassign a professional from a client
 */
export function useUnassignProfessional() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, professionalId }: { clientId: string; professionalId: string }) =>
      api.clients.unassignProfessional(clientId, professionalId),
    
    onSuccess: (_, { clientId, professionalId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(clientId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.professionals.detail(professionalId) })
      
      toast.success('Professional unassigned successfully', {
        description: 'The professional has been removed from the client\'s care team.'
      })
    },
    
    onError: (error) => {
      toast.error('Failed to unassign professional', {
        description: error instanceof Error ? error.message : 'Please try again.'
      })
    },
  })
}

/**
 * Utility hook for client-related operations
 */
export function useClientUtils() {
  const queryClient = useQueryClient()

  const prefetchClient = useCallback(
    async (id: string) => {
      await queryUtils.prefetchClientDetails(id)
    },
    []
  )

  const invalidateClientLists = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() })
  }, [queryClient])

  const getCachedClient = useCallback(
    (id: string): Client | undefined => {
      return queryClient.getQueryData(queryKeys.clients.detail(id))
    },
    [queryClient]
  )

  const refreshClientData = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) })
    },
    [queryClient]
  )

  return {
    prefetchClient,
    invalidateClientLists,
    getCachedClient,
    refreshClientData,
  }
}