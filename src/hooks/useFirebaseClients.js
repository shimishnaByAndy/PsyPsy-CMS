/**
 * Firebase Clients Hook
 * 
 * Replaces useClients hook with Firebase/Firestore operations
 * Provides real-time data and optimistic updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import firebaseClientService from '../services/firebaseClientService';

// Query keys for React Query
export const CLIENTS_QUERY_KEYS = {
  all: ['clients'],
  lists: () => [...CLIENTS_QUERY_KEYS.all, 'list'],
  list: (filters) => [...CLIENTS_QUERY_KEYS.lists(), { filters }],
  details: () => [...CLIENTS_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...CLIENTS_QUERY_KEYS.details(), id],
  stats: () => [...CLIENTS_QUERY_KEYS.all, 'stats'],
  search: (term) => [...CLIENTS_QUERY_KEYS.all, 'search', term],
};

/**
 * Hook for fetching all clients with optional filtering
 */
export const useFirebaseClients = (options = {}) => {
  const {
    filters = {},
    enabled = true,
    refetchInterval = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  return useQuery({
    queryKey: CLIENTS_QUERY_KEYS.list(filters),
    queryFn: () => firebaseClientService.getAllClients(filters),
    enabled,
    staleTime,
    refetchInterval,
    onError: (error) => {
      console.error('useFirebaseClients error:', error);
    }
  });
};

/**
 * Hook for fetching a specific client by ID
 */
export const useFirebaseClient = (clientId, options = {}) => {
  const { enabled = !!clientId } = options;

  return useQuery({
    queryKey: CLIENTS_QUERY_KEYS.detail(clientId),
    queryFn: () => firebaseClientService.getClientById(clientId),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      console.error('useFirebaseClient error:', error);
    }
  });
};

/**
 * Hook for real-time clients subscription
 */
export const useFirebaseClientsSubscription = (options = {}) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { filters = {}, limit } = options;

  useEffect(() => {
    console.log('Setting up Firebase clients subscription...');
    
    const unsubscribe = firebaseClientService.subscribeToClients(
      (updatedClients, metadata) => {
        if (metadata?.error) {
          console.error('Clients subscription error:', metadata.error);
          setError(metadata.error);
          setIsLoading(false);
          return;
        }

        console.log('Clients subscription update:', updatedClients?.length);
        setClients(updatedClients || []);
        setError(null);
        setIsLoading(false);

        // Update React Query cache
        queryClient.setQueryData(CLIENTS_QUERY_KEYS.list(filters), updatedClients);
      },
      { limit }
    );

    return () => {
      console.log('Cleaning up clients subscription');
      unsubscribe();
    };
  }, [filters, limit, queryClient]);

  return {
    clients,
    isLoading,
    error,
    refetch: () => {
      // Force re-subscription
      setIsLoading(true);
    }
  };
};

/**
 * Hook for searching clients
 */
export const useFirebaseClientSearch = (searchParams) => {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEYS.search(searchParams),
    queryFn: () => firebaseClientService.searchClients(searchParams),
    enabled: !!searchParams?.searchTerm || !!searchParams?.specializations?.length,
    staleTime: 1 * 60 * 1000, // 1 minute
    onError: (error) => {
      console.error('useFirebaseClientSearch error:', error);
    }
  });
};

/**
 * Hook for client statistics
 */
export const useFirebaseClientStats = () => {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEYS.stats(),
    queryFn: () => firebaseClientService.getClientStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      console.error('useFirebaseClientStats error:', error);
    }
  });
};

/**
 * Mutation hook for creating a new client
 */
export const useCreateFirebaseClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientData) => firebaseClientService.createClient(clientData),
    onSuccess: (newClient) => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries(CLIENTS_QUERY_KEYS.lists());
      
      // Update individual client cache if it exists
      queryClient.setQueryData(
        CLIENTS_QUERY_KEYS.detail(newClient.user.uid), 
        newClient
      );
      
      console.log('Client created successfully:', newClient.user.uid);
    },
    onError: (error) => {
      console.error('Create client error:', error);
    }
  });
};

/**
 * Mutation hook for updating client profile
 */
export const useUpdateFirebaseClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, profileData }) => 
      firebaseClientService.updateClientProfile(clientId, profileData),
    onMutate: async ({ clientId, profileData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(CLIENTS_QUERY_KEYS.detail(clientId));

      // Snapshot the previous value
      const previousClient = queryClient.getQueryData(CLIENTS_QUERY_KEYS.detail(clientId));

      // Optimistically update the client
      if (previousClient) {
        queryClient.setQueryData(CLIENTS_QUERY_KEYS.detail(clientId), {
          ...previousClient,
          ...profileData
        });
      }

      return { previousClient };
    },
    onError: (error, { clientId }, context) => {
      // Revert optimistic update on error
      if (context?.previousClient) {
        queryClient.setQueryData(CLIENTS_QUERY_KEYS.detail(clientId), context.previousClient);
      }
      console.error('Update client error:', error);
    },
    onSettled: (data, error, { clientId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries(CLIENTS_QUERY_KEYS.detail(clientId));
      queryClient.invalidateQueries(CLIENTS_QUERY_KEYS.lists());
    }
  });
};

/**
 * Mutation hook for updating client status
 */
export const useUpdateFirebaseClientStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, status, reason }) => {
      if (status === 'active') {
        return firebaseClientService.reactivateClient(clientId);
      } else {
        return firebaseClientService.deactivateClient(clientId);
      }
    },
    onMutate: async ({ clientId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(CLIENTS_QUERY_KEYS.detail(clientId));

      // Snapshot the previous value
      const previousClient = queryClient.getQueryData(CLIENTS_QUERY_KEYS.detail(clientId));

      // Optimistically update the status
      if (previousClient) {
        queryClient.setQueryData(CLIENTS_QUERY_KEYS.detail(clientId), {
          ...previousClient,
          account: {
            ...previousClient.account,
            status: status
          }
        });
      }

      return { previousClient };
    },
    onError: (error, { clientId }, context) => {
      // Revert optimistic update on error
      if (context?.previousClient) {
        queryClient.setQueryData(CLIENTS_QUERY_KEYS.detail(clientId), context.previousClient);
      }
      console.error('Update client status error:', error);
    },
    onSuccess: (data, { clientId }) => {
      console.log('Client status updated successfully:', clientId);
    },
    onSettled: (data, error, { clientId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries(CLIENTS_QUERY_KEYS.detail(clientId));
      queryClient.invalidateQueries(CLIENTS_QUERY_KEYS.lists());
    }
  });
};

/**
 * Mutation hook for updating client medical information
 */
export const useUpdateFirebaseClientMedical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, medicalData }) => 
      firebaseClientService.updateMedicalInfo(clientId, medicalData),
    onSuccess: (data, { clientId }) => {
      queryClient.invalidateQueries(CLIENTS_QUERY_KEYS.detail(clientId));
      queryClient.invalidateQueries(CLIENTS_QUERY_KEYS.lists());
      console.log('Client medical info updated successfully:', clientId);
    },
    onError: (error) => {
      console.error('Update client medical info error:', error);
    }
  });
};

/**
 * Hook for client appointments
 */
export const useFirebaseClientAppointments = (clientId, options = {}) => {
  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEYS.detail(clientId), 'appointments'],
    queryFn: () => firebaseClientService.getClientAppointments(clientId, options),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      console.error('useFirebaseClientAppointments error:', error);
    }
  });
};

/**
 * Custom hook combining multiple client operations
 */
export const useFirebaseClientOperations = (clientId) => {
  const client = useFirebaseClient(clientId);
  const appointments = useFirebaseClientAppointments(clientId);
  const updateProfile = useUpdateFirebaseClient();
  const updateStatus = useUpdateFirebaseClientStatus();
  const updateMedical = useUpdateFirebaseClientMedical();

  return {
    // Data
    client: client.data,
    appointments: appointments.data,
    
    // Loading states
    isLoadingClient: client.isLoading,
    isLoadingAppointments: appointments.isLoading,
    
    // Error states
    clientError: client.error,
    appointmentsError: appointments.error,
    
    // Mutations
    updateProfile: updateProfile.mutate,
    updateStatus: updateStatus.mutate,
    updateMedical: updateMedical.mutate,
    
    // Mutation states
    isUpdatingProfile: updateProfile.isPending,
    isUpdatingStatus: updateStatus.isPending,
    isUpdatingMedical: updateMedical.isPending,
    
    // Refetch functions
    refetchClient: client.refetch,
    refetchAppointments: appointments.refetch,
  };
};

export default useFirebaseClients;