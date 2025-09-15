/**
 * Firebase Appointments Hook
 * 
 * Replaces Parse-based appointment hooks with Firebase/Firestore operations
 * Provides real-time data and optimistic updates
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import firebaseAppointmentService, { APPOINTMENT_STATUS } from '../services/firebaseAppointmentService';
import firebaseAuthService from '../services/firebaseAuthService';

// Query keys for React Query
export const APPOINTMENTS_QUERY_KEYS = {
  all: ['appointments'],
  lists: () => [...APPOINTMENTS_QUERY_KEYS.all, 'list'],
  list: (filters) => [...APPOINTMENTS_QUERY_KEYS.lists(), { filters }],
  details: () => [...APPOINTMENTS_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...APPOINTMENTS_QUERY_KEYS.details(), id],
  stats: () => [...APPOINTMENTS_QUERY_KEYS.all, 'stats'],
  upcoming: (userId) => [...APPOINTMENTS_QUERY_KEYS.all, 'upcoming', userId],
  userAppointments: (userId, role) => [...APPOINTMENTS_QUERY_KEYS.all, 'user', userId, role],
};

/**
 * Hook for fetching user appointments (client or professional)
 */
export const useFirebaseUserAppointments = (userId, userRole, options = {}) => {
  const {
    status,
    limit,
    enabled = !!userId && !!userRole,
    refetchInterval = false,
  } = options;

  return useQuery({
    queryKey: APPOINTMENTS_QUERY_KEYS.userAppointments(userId, userRole),
    queryFn: () => firebaseAppointmentService.getUserAppointments(userId, userRole, { status, limit }),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval,
    onError: (error) => {
      console.error('useFirebaseUserAppointments error:', error);
    }
  });
};

/**
 * Hook for fetching upcoming appointments (professionals)
 */
export const useFirebaseUpcomingAppointments = (professionalId, daysAhead = 7, options = {}) => {
  const { enabled = !!professionalId } = options;

  return useQuery({
    queryKey: APPOINTMENTS_QUERY_KEYS.upcoming(professionalId),
    queryFn: () => firebaseAppointmentService.getUpcomingAppointments(professionalId, daysAhead),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for upcoming appointments
    onError: (error) => {
      console.error('useFirebaseUpcomingAppointments error:', error);
    }
  });
};

/**
 * Hook for searching appointments
 */
export const useFirebaseAppointmentSearch = (searchParams) => {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEYS.all, 'search', searchParams],
    queryFn: () => firebaseAppointmentService.searchAppointments(searchParams),
    enabled: !!(searchParams?.professionalId || searchParams?.clientId || searchParams?.status),
    staleTime: 1 * 60 * 1000, // 1 minute
    onError: (error) => {
      console.error('useFirebaseAppointmentSearch error:', error);
    }
  });
};

/**
 * Hook for appointment statistics
 */
export const useFirebaseAppointmentStats = (filters = {}) => {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEYS.stats(), { filters }],
    queryFn: () => firebaseAppointmentService.getAppointmentStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      console.error('useFirebaseAppointmentStats error:', error);
    }
  });
};

/**
 * Hook for real-time appointment subscription
 */
export const useFirebaseAppointmentsSubscription = (userId, userRole, options = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { status, limit } = options;

  useEffect(() => {
    if (!userId || !userRole) {
      setIsLoading(false);
      return;
    }

    console.log('Setting up Firebase appointments subscription for:', { userId, userRole });
    
    const unsubscribe = firebaseAppointmentService.subscribeToUserAppointments(
      userId,
      userRole,
      (updatedAppointments, metadata) => {
        if (metadata?.error) {
          console.error('Appointments subscription error:', metadata.error);
          setError(metadata.error);
          setIsLoading(false);
          return;
        }

        console.log('Appointments subscription update:', updatedAppointments?.length);
        setAppointments(updatedAppointments || []);
        setError(null);
        setIsLoading(false);

        // Update React Query cache
        queryClient.setQueryData(
          APPOINTMENTS_QUERY_KEYS.userAppointments(userId, userRole),
          updatedAppointments
        );
      },
      { status, limit }
    );

    return () => {
      console.log('Cleaning up appointments subscription');
      unsubscribe();
    };
  }, [userId, userRole, status, limit, queryClient]);

  return {
    appointments,
    isLoading,
    error,
    refetch: () => {
      // Force re-subscription
      setIsLoading(true);
    }
  };
};

/**
 * Mutation hook for creating a new appointment
 */
export const useCreateFirebaseAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentData) => firebaseAppointmentService.createAppointment(appointmentData),
    onSuccess: (newAppointment) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.lists());
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(newAppointment.client.uid, 'client'));
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(newAppointment.professional.uid, 'professional'));
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.upcoming(newAppointment.professional.uid));
      
      console.log('Appointment created successfully:', newAppointment.id);
    },
    onError: (error) => {
      console.error('Create appointment error:', error);
    }
  });
};

/**
 * Mutation hook for updating appointment status
 */
export const useUpdateFirebaseAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, status, updatedBy, reason }) =>
      firebaseAppointmentService.updateAppointmentStatus(appointmentId, status, updatedBy, reason),
    onMutate: async ({ appointmentId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(APPOINTMENTS_QUERY_KEYS.detail(appointmentId));

      // Snapshot the previous value
      const previousAppointment = queryClient.getQueryData(APPOINTMENTS_QUERY_KEYS.detail(appointmentId));

      // Optimistically update the appointment status
      if (previousAppointment) {
        queryClient.setQueryData(APPOINTMENTS_QUERY_KEYS.detail(appointmentId), {
          ...previousAppointment,
          scheduling: {
            ...previousAppointment.scheduling,
            status
          }
        });
      }

      return { previousAppointment };
    },
    onError: (error, { appointmentId }, context) => {
      // Revert optimistic update on error
      if (context?.previousAppointment) {
        queryClient.setQueryData(APPOINTMENTS_QUERY_KEYS.detail(appointmentId), context.previousAppointment);
      }
      console.error('Update appointment status error:', error);
    },
    onSuccess: (data, { appointmentId }) => {
      console.log('Appointment status updated successfully:', appointmentId);
    },
    onSettled: (data, error, { appointmentId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.detail(appointmentId));
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.lists());
      
      if (data) {
        queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(data.client.uid, 'client'));
        queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(data.professional.uid, 'professional'));
        queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.upcoming(data.professional.uid));
      }
    }
  });
};

/**
 * Mutation hook for updating appointment details
 */
export const useUpdateFirebaseAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, updateData, updatedBy }) =>
      firebaseAppointmentService.updateAppointment(appointmentId, updateData, updatedBy),
    onSuccess: (data, { appointmentId }) => {
      // Update caches
      queryClient.setQueryData(APPOINTMENTS_QUERY_KEYS.detail(appointmentId), data);
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.lists());
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(data.client.uid, 'client'));
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(data.professional.uid, 'professional'));
      
      console.log('Appointment updated successfully:', appointmentId);
    },
    onError: (error) => {
      console.error('Update appointment error:', error);
    }
  });
};

/**
 * Mutation hook for cancelling an appointment
 */
export const useCancelFirebaseAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, cancelledBy, reason }) =>
      firebaseAppointmentService.cancelAppointment(appointmentId, cancelledBy, reason),
    onSuccess: (data, { appointmentId }) => {
      // Update appointment status in cache
      queryClient.setQueryData(APPOINTMENTS_QUERY_KEYS.detail(appointmentId), data);
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.lists());
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(data.client.uid, 'client'));
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(data.professional.uid, 'professional'));
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.upcoming(data.professional.uid));
      
      console.log('Appointment cancelled successfully:', appointmentId);
    },
    onError: (error) => {
      console.error('Cancel appointment error:', error);
    }
  });
};

/**
 * Mutation hook for completing an appointment
 */
export const useCompleteFirebaseAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, sessionData }) =>
      firebaseAppointmentService.completeAppointment(appointmentId, sessionData),
    onSuccess: (data, { appointmentId }) => {
      // Update appointment and create session record
      queryClient.setQueryData(APPOINTMENTS_QUERY_KEYS.detail(appointmentId), data.appointment);
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.lists());
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(data.appointment.client.uid, 'client'));
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.userAppointments(data.appointment.professional.uid, 'professional'));
      queryClient.invalidateQueries(APPOINTMENTS_QUERY_KEYS.upcoming(data.appointment.professional.uid));
      
      // Invalidate sessions if we add a sessions hook later
      queryClient.invalidateQueries(['sessions']);
      
      console.log('Appointment completed successfully:', appointmentId);
    },
    onError: (error) => {
      console.error('Complete appointment error:', error);
    }
  });
};

/**
 * Custom hook for current user's appointments with real-time updates
 */
export const useCurrentUserAppointments = (options = {}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Get current user from Firebase Auth
  useEffect(() => {
    const user = firebaseAuthService.getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      firebaseAuthService.getUserProfile(user.uid)
        .then(setUserProfile)
        .catch(console.error);
    }
  }, []);

  // Subscribe to appointments if user is available
  const subscription = useFirebaseAppointmentsSubscription(
    currentUser?.uid,
    userProfile?.role,
    options
  );

  return {
    ...subscription,
    currentUser,
    userProfile
  };
};

/**
 * Custom hook combining multiple appointment operations
 */
export const useFirebaseAppointmentOperations = (appointmentId) => {
  const updateStatus = useUpdateFirebaseAppointmentStatus();
  const updateAppointment = useUpdateFirebaseAppointment();
  const cancelAppointment = useCancelFirebaseAppointment();
  const completeAppointment = useCompleteFirebaseAppointment();

  return {
    // Mutations
    updateStatus: updateStatus.mutate,
    updateAppointment: updateAppointment.mutate,
    cancelAppointment: cancelAppointment.mutate,
    completeAppointment: completeAppointment.mutate,
    
    // Loading states
    isUpdatingStatus: updateStatus.isPending,
    isUpdating: updateAppointment.isPending,
    isCancelling: cancelAppointment.isPending,
    isCompleting: completeAppointment.isPending,
    
    // Error states
    updateStatusError: updateStatus.error,
    updateError: updateAppointment.error,
    cancelError: cancelAppointment.error,
    completeError: completeAppointment.error,
  };
};

export default useFirebaseUserAppointments;