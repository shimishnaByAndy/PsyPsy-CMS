/**
 * Professional mutation hooks using TanStack Query
 * Provides create, update, delete, and verification operations with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, queryKeyHelpers } from '../../services/queryKeys';
import { executeParseMutation, executeCloudFunction } from '../../services/queryService';

/**
 * Hook to verify a professional (critical operation with optimistic updates)
 * @returns {Object} TanStack Mutation result
 */
export const useVerifyProfessional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ professionalId, isVerified, verificationNotes = '' }) => {
      console.log('Verifying professional:', professionalId, isVerified);
      
      // Use cloud function for professional verification (requires master key)
      return await executeCloudFunction('verifyProfessional', { 
        professionalId, 
        isVerified,
        verificationNotes
      }, true);
    },
    // CRITICAL: Optimistic updates for immediate UI feedback
    onMutate: async ({ professionalId, isVerified, verificationNotes }) => {
      // Cancel any outgoing refetches for professionals
      await queryClient.cancelQueries({ queryKey: queryKeys.professionals() });
      
      // Snapshot the previous values
      const previousProfessional = queryClient.getQueryData(
        queryKeys.professionalDetail(professionalId)
      );
      const previousList = queryClient.getQueryData(queryKeys.professionalsList({}));
      const previousPending = queryClient.getQueryData(
        queryKeys.professionalsList({ pending: true, limit: 10 })
      );
      
      const optimisticUpdate = {
        isVerified,
        verificationNotes,
        verifiedAt: isVerified ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      };
      
      // Optimistically update the professional detail
      queryClient.setQueryData(
        queryKeys.professionalDetail(professionalId), 
        (old) => {
          if (!old) return old;
          return { ...old, ...optimisticUpdate };
        }
      );
      
      // Optimistically update all professional lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.professionalsList({}) }, 
        (old) => {
          if (!old?.results) return old;
          
          return {
            ...old,
            results: old.results.map(prof => 
              prof.id === professionalId 
                ? { ...prof, ...optimisticUpdate }
                : prof
            )
          };
        }
      );
      
      // Update pending professionals list (remove if verified)
      if (isVerified) {
        queryClient.setQueryData(
          queryKeys.professionalsList({ pending: true, limit: 10 }),
          (old) => {
            if (!old) return old;
            return old.filter(prof => prof.id !== professionalId);
          }
        );
      }
      
      // Update verification stats optimistically
      queryClient.setQueryData(
        queryKeys.professionalsList({ stats: 'verification' }),
        (old) => {
          if (!old) return old;
          
          const wasVerified = previousProfessional?.isVerified;
          let verifiedDelta = 0;
          
          if (isVerified && !wasVerified) {
            verifiedDelta = 1; // Newly verified
          } else if (!isVerified && wasVerified) {
            verifiedDelta = -1; // Unverified
          }
          
          const newVerified = old.verified + verifiedDelta;
          const newPending = old.pending - verifiedDelta;
          
          return {
            ...old,
            verified: newVerified,
            pending: newPending,
            verificationRate: old.total > 0 ? Math.round((newVerified / old.total) * 100) : 0
          };
        }
      );
      
      return { previousProfessional, previousList, previousPending };
    },
    // CRITICAL: Rollback on error
    onError: (error, { professionalId }, context) => {
      console.error('Error verifying professional:', error);
      
      // Rollback all optimistic updates
      if (context?.previousProfessional) {
        queryClient.setQueryData(
          queryKeys.professionalDetail(professionalId), 
          context.previousProfessional
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.professionalsList({}), 
          context.previousList
        );
      }
      if (context?.previousPending) {
        queryClient.setQueryData(
          queryKeys.professionalsList({ pending: true, limit: 10 }),
          context.previousPending
        );
      }
    },
    onSuccess: (result, { professionalId, isVerified }) => {
      console.log(`Professional ${isVerified ? 'verified' : 'unverified'} successfully:`, professionalId);
    },
    // Always refetch after mutation to ensure consistency
    onSettled: ({ professionalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.professionalDetail(professionalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.professionals() });
      queryKeyHelpers.invalidateDashboard(queryClient);
    },
  });
};

/**
 * Hook to create a new professional
 * @returns {Object} TanStack Mutation result
 */
export const useCreateProfessional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (professionalData) => {
      console.log('Creating new professional:', professionalData);
      
      return await executeCloudFunction('createProfessional', professionalData, true);
    },
    onSuccess: (newProfessional) => {
      console.log('Professional created successfully:', newProfessional.id);
      
      // Invalidate and refetch professional queries
      queryKeyHelpers.invalidateEntity(queryClient, 'professionals');
      queryKeyHelpers.invalidateDashboard(queryClient);
      
      // Add to pending professionals cache
      queryClient.setQueryData(
        queryKeys.professionalsList({ pending: true, limit: 10 }),
        (oldData) => {
          if (!oldData) return [newProfessional];
          return [newProfessional, ...oldData.slice(0, 9)];
        }
      );
    },
    onError: (error) => {
      console.error('Error creating professional:', error);
    },
  });
};

/**
 * Hook to update professional information
 * @returns {Object} TanStack Mutation result
 */
export const useUpdateProfessional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ professionalId, updates }) => {
      console.log('Updating professional:', professionalId, updates);
      
      return await executeParseMutation({
        type: 'update',
        className: '_User',
        objectId: professionalId,
        data: updates,
        useMasterKey: true
      });
    },
    onMutate: async ({ professionalId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.professionals() });
      
      const previousProfessional = queryClient.getQueryData(
        queryKeys.professionalDetail(professionalId)
      );
      const previousList = queryClient.getQueryData(queryKeys.professionalsList({}));
      
      // Optimistically update the professional
      const optimisticUpdate = { ...updates, updatedAt: new Date().toISOString() };
      
      queryClient.setQueryData(
        queryKeys.professionalDetail(professionalId), 
        (old) => {
          if (!old) return old;
          return { ...old, ...optimisticUpdate };
        }
      );
      
      queryClient.setQueriesData(
        { queryKey: queryKeys.professionalsList({}) }, 
        (old) => {
          if (!old?.results) return old;
          
          return {
            ...old,
            results: old.results.map(prof =>
              prof.id === professionalId
                ? { ...prof, ...optimisticUpdate }
                : prof
            )
          };
        }
      );
      
      return { previousProfessional, previousList };
    },
    onError: (error, { professionalId }, context) => {
      console.error('Error updating professional:', error);
      
      // Rollback optimistic updates
      if (context?.previousProfessional) {
        queryClient.setQueryData(
          queryKeys.professionalDetail(professionalId), 
          context.previousProfessional
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.professionalsList({}), 
          context.previousList
        );
      }
    },
    onSettled: ({ professionalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.professionalDetail(professionalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.professionals() });
    },
  });
};

/**
 * Hook to delete a professional
 * @returns {Object} TanStack Mutation result
 */
export const useDeleteProfessional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (professionalId) => {
      console.log('Deleting professional:', professionalId);
      
      return await executeCloudFunction('deleteProfessional', { professionalId }, true);
    },
    onMutate: async (professionalId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.professionals() });
      
      const previousList = queryClient.getQueryData(queryKeys.professionalsList({}));
      
      // Optimistically remove from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.professionalsList({}) }, 
        (old) => {
          if (!old?.results) return old;
          
          return {
            ...old,
            results: old.results.filter(prof => prof.id !== professionalId),
            total: old.total - 1
          };
        }
      );
      
      return { previousList };
    },
    onError: (error, professionalId, context) => {
      console.error('Error deleting professional:', error);
      
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.professionalsList({}), context.previousList);
      }
    },
    onSuccess: (result, professionalId) => {
      console.log('Professional deleted successfully:', professionalId);
      
      // Remove from individual cache
      queryClient.removeQueries({ queryKey: queryKeys.professionalDetail(professionalId) });
      
      queryKeyHelpers.invalidateEntity(queryClient, 'professionals');
      queryKeyHelpers.invalidateDashboard(queryClient);
    },
  });
};

/**
 * Hook to bulk verify professionals
 * @returns {Object} TanStack Mutation result
 */
export const useBulkVerifyProfessionals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ professionalIds, isVerified, verificationNotes = '' }) => {
      console.log('Bulk verifying professionals:', professionalIds.length, 'professionals');
      
      return await executeCloudFunction('bulkVerifyProfessionals', {
        professionalIds,
        isVerified,
        verificationNotes
      }, true);
    },
    onSuccess: (result, { professionalIds, isVerified }) => {
      console.log(`Bulk ${isVerified ? 'verification' : 'unverification'} completed for`, professionalIds.length, 'professionals');
      
      // Invalidate all professional-related queries
      queryKeyHelpers.invalidateEntity(queryClient, 'professionals');
      queryKeyHelpers.invalidateDashboard(queryClient);
      
      // Remove individual professional caches that were updated
      professionalIds.forEach(professionalId => {
        queryClient.invalidateQueries({ queryKey: queryKeys.professionalDetail(professionalId) });
      });
    },
    onError: (error) => {
      console.error('Bulk verification failed:', error);
    },
  });
};

/**
 * Hook to send email to professional
 * @returns {Object} TanStack Mutation result
 */
export const useSendProfessionalEmail = () => {
  return useMutation({
    mutationFn: async ({ professionalId, templateType, customMessage = '' }) => {
      console.log('Sending email to professional:', professionalId, templateType);
      
      return await executeCloudFunction('sendProfessionalEmail', {
        professionalId,
        templateType,
        customMessage
      }, true);
    },
    onSuccess: (result, { professionalId, templateType }) => {
      console.log(`Email sent to professional ${professionalId} with template ${templateType}`);
    },
    onError: (error) => {
      console.error('Failed to send professional email:', error);
    },
  });
};

export default {
  useVerifyProfessional,
  useCreateProfessional,
  useUpdateProfessional,
  useDeleteProfessional,
  useBulkVerifyProfessionals,
  useSendProfessionalEmail
};