/**
 * Client mutation hooks using TanStack Query
 * Provides create, update, delete operations for clients with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, queryKeyHelpers } from '../../services/queryKeys';
import { executeParseMutation, executeCloudFunction } from '../../services/queryService';

/**
 * Hook to create a new client
 * @returns {Object} TanStack Mutation result
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData) => {
      console.log('Creating new client:', clientData);
      
      // Use cloud function for client creation to handle user creation + client profile
      return await executeCloudFunction('createClient', clientData, true);
    },
    onSuccess: (newClient) => {
      console.log('Client created successfully:', newClient.id);
      
      // Invalidate and refetch clients queries
      queryKeyHelpers.invalidateEntity(queryClient, 'clients');
      
      // Invalidate dashboard stats
      queryKeyHelpers.invalidateDashboard(queryClient);
      
      // Optimistically add to recent clients cache
      queryClient.setQueryData(
        queryKeys.clientsList({ recent: true, limit: 5 }),
        (oldData) => {
          if (!oldData) return [newClient];
          return [newClient, ...oldData.slice(0, 4)];
        }
      );
    },
    onError: (error) => {
      console.error('Error creating client:', error);
    },
  });
};

/**
 * Hook to update client information
 * @returns {Object} TanStack Mutation result
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, updates }) => {
      console.log('Updating client:', clientId, updates);
      
      return await executeParseMutation({
        type: 'update',
        className: '_User',
        objectId: clientId,
        data: updates,
        useMasterKey: true
      });
    },
    onMutate: async ({ clientId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.clients() });
      
      // Snapshot the previous value
      const previousClient = queryClient.getQueryData(queryKeys.clientDetail(clientId));
      const previousList = queryClient.getQueryData(queryKeys.clientsList({}));
      
      // Optimistically update the client detail
      queryClient.setQueryData(queryKeys.clientDetail(clientId), (old) => {
        if (!old) return old;
        return { ...old, ...updates, updatedAt: new Date().toISOString() };
      });
      
      // Optimistically update the client in lists
      queryClient.setQueriesData({ queryKey: queryKeys.clientsList({}) }, (old) => {
        if (!old?.results) return old;
        
        return {
          ...old,
          results: old.results.map(client =>
            client.id === clientId
              ? { ...client, ...updates, updatedAt: new Date().toISOString() }
              : client
          )
        };
      });
      
      return { previousClient, previousList };
    },
    onError: (error, { clientId }, context) => {
      console.error('Error updating client:', error);
      
      // Rollback optimistic updates
      if (context?.previousClient) {
        queryClient.setQueryData(queryKeys.clientDetail(clientId), context.previousClient);
      }
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.clientsList({}), context.previousList);
      }
    },
    onSettled: ({ clientId }) => {
      // Always refetch after mutation to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.clientDetail(clientId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients() });
    },
  });
};

/**
 * Hook to delete a client
 * @returns {Object} TanStack Mutation result
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId) => {
      console.log('Deleting client:', clientId);
      
      // Use cloud function for proper client deletion
      return await executeCloudFunction('deleteClient', { clientId }, true);
    },
    onMutate: async (clientId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.clients() });
      
      // Snapshot the previous value
      const previousList = queryClient.getQueryData(queryKeys.clientsList({}));
      
      // Optimistically remove from lists
      queryClient.setQueriesData({ queryKey: queryKeys.clientsList({}) }, (old) => {
        if (!old?.results) return old;
        
        return {
          ...old,
          results: old.results.filter(client => client.id !== clientId),
          total: old.total - 1
        };
      });
      
      return { previousList };
    },
    onError: (error, clientId, context) => {
      console.error('Error deleting client:', error);
      
      // Rollback optimistic updates
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.clientsList({}), context.previousList);
      }
    },
    onSuccess: (result, clientId) => {
      console.log('Client deleted successfully:', clientId);
      
      // Remove from individual cache
      queryClient.removeQueries({ queryKey: queryKeys.clientDetail(clientId) });
      
      // Invalidate all client queries
      queryKeyHelpers.invalidateEntity(queryClient, 'clients');
      
      // Invalidate dashboard stats
      queryKeyHelpers.invalidateDashboard(queryClient);
    },
  });
};

/**
 * Hook to update client status (active, blocked, etc.)
 * @returns {Object} TanStack Mutation result
 */
export const useUpdateClientStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, status, reason = '' }) => {
      console.log('Updating client status:', clientId, status);
      
      return await executeCloudFunction('updateClientStatus', {
        clientId,
        status,
        reason
      }, true);
    },
    onMutate: async ({ clientId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.clients() });
      
      // Snapshot previous values
      const previousClient = queryClient.getQueryData(queryKeys.clientDetail(clientId));
      
      // Optimistically update status
      const statusUpdate = {
        isBlocked: status === 'blocked',
        status: status,
        updatedAt: new Date().toISOString()
      };
      
      queryClient.setQueryData(queryKeys.clientDetail(clientId), (old) => {
        if (!old) return old;
        return { ...old, ...statusUpdate };
      });
      
      // Update in all client lists
      queryClient.setQueriesData({ queryKey: queryKeys.clientsList({}) }, (old) => {
        if (!old?.results) return old;
        
        return {
          ...old,
          results: old.results.map(client =>
            client.id === clientId ? { ...client, ...statusUpdate } : client
          )
        };
      });
      
      return { previousClient };
    },
    onError: (error, { clientId }, context) => {
      console.error('Error updating client status:', error);
      
      // Rollback optimistic update
      if (context?.previousClient) {
        queryClient.setQueryData(queryKeys.clientDetail(clientId), context.previousClient);
      }
    },
    onSuccess: (result, { clientId, status }) => {
      console.log(`Client status updated to ${status}:`, clientId);
      
      // Refetch affected queries
      queryClient.invalidateQueries({ queryKey: queryKeys.clientDetail(clientId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients() });
      queryKeyHelpers.invalidateDashboard(queryClient);
    },
  });
};

/**
 * Hook to bulk update clients
 * @returns {Object} TanStack Mutation result
 */
export const useBulkUpdateClients = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientIds, updates }) => {
      console.log('Bulk updating clients:', clientIds.length, 'clients');
      
      return await executeCloudFunction('bulkUpdateClients', {
        clientIds,
        updates
      }, true);
    },
    onSuccess: (result, { clientIds }) => {
      console.log('Bulk update completed for', clientIds.length, 'clients');
      
      // Invalidate all client-related queries
      queryKeyHelpers.invalidateEntity(queryClient, 'clients');
      queryKeyHelpers.invalidateDashboard(queryClient);
      
      // Remove individual client caches that were updated
      clientIds.forEach(clientId => {
        queryClient.invalidateQueries({ queryKey: queryKeys.clientDetail(clientId) });
      });
    },
    onError: (error) => {
      console.error('Bulk update failed:', error);
    },
  });
};

/**
 * Hook to send email to client
 * @returns {Object} TanStack Mutation result
 */
export const useSendClientEmail = () => {
  return useMutation({
    mutationFn: async ({ clientId, templateType, customMessage = '' }) => {
      console.log('Sending email to client:', clientId, templateType);
      
      return await executeCloudFunction('sendClientEmail', {
        clientId,
        templateType,
        customMessage
      }, true);
    },
    onSuccess: (result, { clientId, templateType }) => {
      console.log(`Email sent to client ${clientId} with template ${templateType}`);
    },
    onError: (error) => {
      console.error('Failed to send client email:', error);
    },
  });
};

export default {
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useUpdateClientStatus,
  useBulkUpdateClients,
  useSendClientEmail
};