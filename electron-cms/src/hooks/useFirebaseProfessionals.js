/**
 * Firebase Professionals Hook
 * 
 * Replaces Parse-based professional hooks with Firebase/Firestore operations
 * Provides real-time data and optimistic updates for professional management
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import firebaseProfessionalService, { PROFESSIONAL_TYPES, GENDER_TYPES, MEETING_TYPES } from '../services/firebaseProfessionalService';
import firebaseAuthService from '../services/firebaseAuthService';

// Query keys for React Query
export const PROFESSIONALS_QUERY_KEYS = {
  all: ['professionals'],
  lists: () => [...PROFESSIONALS_QUERY_KEYS.all, 'list'],
  list: (filters) => [...PROFESSIONALS_QUERY_KEYS.lists(), { filters }],
  details: () => [...PROFESSIONALS_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...PROFESSIONALS_QUERY_KEYS.details(), id],
  stats: () => [...PROFESSIONALS_QUERY_KEYS.all, 'stats'],
  search: (params) => [...PROFESSIONALS_QUERY_KEYS.all, 'search', params],
};

/**
 * Hook for fetching professionals with pagination and filtering
 */
export const useFirebaseProfessionals = (options = {}) => {
  const {
    page = 0,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    filters = {},
    enabled = true,
    refetchInterval = false,
  } = options;

  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.list({ page, limit, search, sortBy, sortDirection, filters }),
    queryFn: () => firebaseProfessionalService.getProfessionals({
      page,
      limit,
      search,
      sortBy,
      sortDirection,
      filters
    }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval,
    onError: (error) => {
      console.error('useFirebaseProfessionals error:', error);
    }
  });
};

/**
 * Hook for fetching a single professional by ID
 */
export const useFirebaseProfessional = (professionalId, options = {}) => {
  const { enabled = !!professionalId } = options;

  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.detail(professionalId),
    queryFn: () => firebaseProfessionalService.getProfessionalById(professionalId),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      console.error('useFirebaseProfessional error:', error);
    }
  });
};

/**
 * Hook for searching professionals
 */
export const useFirebaseProfessionalSearch = (searchParams, options = {}) => {
  const { enabled = !!Object.keys(searchParams).length } = options;

  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.search(searchParams),
    queryFn: () => firebaseProfessionalService.searchProfessionals(searchParams),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    onError: (error) => {
      console.error('useFirebaseProfessionalSearch error:', error);
    }
  });
};

/**
 * Hook for professional statistics
 */
export const useFirebaseProfessionalStats = (filters = {}) => {
  return useQuery({
    queryKey: [...PROFESSIONALS_QUERY_KEYS.stats(), { filters }],
    queryFn: () => firebaseProfessionalService.getProfessionalStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      console.error('useFirebaseProfessionalStats error:', error);
    }
  });
};

/**
 * Hook for real-time professional subscription
 */
export const useFirebaseProfessionalsSubscription = (options = {}) => {
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { 
    limit = 50,
    filters = {},
    orderBy = 'createdAt',
    orderDirection = 'desc'
  } = options;

  useEffect(() => {
    console.log('Setting up Firebase professionals subscription');
    
    const unsubscribe = firebaseProfessionalService.subscribeToUserProfessionals(
      (updatedProfessionals, metadata) => {
        if (metadata?.error) {
          console.error('Professionals subscription error:', metadata.error);
          setError(metadata.error);
          setIsLoading(false);
          return;
        }

        console.log('Professionals subscription update:', updatedProfessionals?.length);
        setProfessionals(updatedProfessionals || []);
        setError(null);
        setIsLoading(false);

        // Update React Query cache
        queryClient.setQueryData(
          PROFESSIONALS_QUERY_KEYS.lists(),
          updatedProfessionals
        );
      },
      { limit, filters, orderBy, orderDirection }
    );

    return () => {
      console.log('Cleaning up professionals subscription');
      unsubscribe();
    };
  }, [limit, filters, orderBy, orderDirection, queryClient]);

  return {
    professionals,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
    }
  };
};

/**
 * Mutation hook for updating professional profile
 */
export const useUpdateFirebaseProfessionalProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, profileData }) => 
      firebaseProfessionalService.updateProfessionalProfile(userId, profileData),
    onSuccess: (data, { userId }) => {
      // Update caches
      queryClient.setQueryData(PROFESSIONALS_QUERY_KEYS.detail(userId), data);
      queryClient.invalidateQueries(PROFESSIONALS_QUERY_KEYS.lists());
      queryClient.invalidateQueries(PROFESSIONALS_QUERY_KEYS.stats());
      
      console.log('Professional profile updated successfully:', userId);
    },
    onError: (error) => {
      console.error('Update professional profile error:', error);
    }
  });
};

/**
 * Hook to get professional types mapping
 */
export const useProfessionalTypes = () => {
  return {
    types: PROFESSIONAL_TYPES,
    getTypeName: (typeCode) => PROFESSIONAL_TYPES[typeCode] || 'Unknown',
    getTypeOptions: () => Object.entries(PROFESSIONAL_TYPES).map(([code, name]) => ({
      value: parseInt(code),
      label: name
    }))
  };
};

/**
 * Hook to get gender types mapping
 */
export const useGenderTypes = () => {
  return {
    types: GENDER_TYPES,
    getGenderName: (genderCode) => GENDER_TYPES[genderCode] || 'Unknown',
    getGenderOptions: () => Object.entries(GENDER_TYPES).map(([code, name]) => ({
      value: parseInt(code),
      label: name
    }))
  };
};

/**
 * Hook to get meeting types mapping
 */
export const useMeetingTypes = () => {
  return {
    types: MEETING_TYPES,
    getMeetTypeName: (meetTypeCode) => MEETING_TYPES[meetTypeCode] || 'Unknown',
    getMeetTypeOptions: () => Object.entries(MEETING_TYPES).map(([code, name]) => ({
      value: parseInt(code),
      label: name
    }))
  };
};

/**
 * Custom hook for professional dashboard data
 */
export const useFirebaseProfessionalDashboard = (options = {}) => {
  const stats = useFirebaseProfessionalStats();
  const subscription = useFirebaseProfessionalsSubscription(options);
  
  return {
    professionals: subscription.professionals,
    stats: stats.data,
    isLoading: stats.isLoading || subscription.isLoading,
    error: stats.error || subscription.error,
    refetch: () => {
      stats.refetch();
      subscription.refetch();
    }
  };
};

/**
 * Hook for professional form utilities
 */
export const useProfessionalFormHelpers = () => {
  const professionalTypes = useProfessionalTypes();
  const genderTypes = useGenderTypes();
  const meetingTypes = useMeetingTypes();

  // Form validation helpers
  const validateProfessionalData = (data) => {
    const errors = {};

    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!data.profType) {
      errors.profType = 'Professional type is required';
    }

    if (!data.gender) {
      errors.gender = 'Gender is required';
    }

    if (!data.meetType) {
      errors.meetType = 'Meeting type preference is required';
    }

    if (data.phoneNb && !/^[\d\s\-\(\)\.]+$/.test(data.phoneNb)) {
      errors.phoneNb = 'Please enter a valid phone number';
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Format helpers
  const formatProfessionalDisplay = (professional) => {
    const profile = professional.professionalProfile;
    if (!profile) return professional.email || 'Unknown Professional';

    const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const businessName = profile.businessName;
    const profType = professionalTypes.getTypeName(profile.profType);

    let display = name || professional.email || 'Unknown Professional';
    if (businessName && businessName !== name) {
      display += ` (${businessName})`;
    }
    display += ` - ${profType}`;

    return display;
  };

  return {
    ...professionalTypes,
    ...genderTypes,
    ...meetingTypes,
    validateProfessionalData,
    formatProfessionalDisplay,
    // Phone number formatting
    formatPhoneNumber: firebaseProfessionalService.formatPhoneNumber.bind(firebaseProfessionalService),
    // Age calculation
    calculateAge: firebaseProfessionalService.calculateAge.bind(firebaseProfessionalService)
  };
};

/**
 * Export constants for use in components
 */
export { PROFESSIONAL_TYPES, GENDER_TYPES, MEETING_TYPES };

export default useFirebaseProfessionals;