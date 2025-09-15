/**
 * Authentication mutation hooks using TanStack Query
 * Provides login, logout, and session management with query cache integration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeyHelpers } from '../../services/queryKeys';
import { ParseAuth } from '../../services/parseService';

/**
 * Hook to handle user login with query cache management
 * @returns {Object} TanStack Mutation result
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password, rememberMe = false }) => {
      console.log('Logging in user:', username);
      
      if (rememberMe) {
        return await ParseAuth.loginWithRememberMe(username, password, rememberMe);
      } else {
        return await ParseAuth.login(username, password);
      }
    },
    onSuccess: (user, { rememberMe }) => {
      console.log('Login successful for user:', user.get('username'));
      
      // Clear any existing cache to ensure fresh data for new session
      queryKeyHelpers.clearAllCache(queryClient);
      
      // Optionally prefetch user data
      // This could include dashboard stats, user profile, etc.
      queryClient.prefetchQuery({
        queryKey: ['parse', 'auth', 'current-user'],
        queryFn: () => ParseAuth.getCurrentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    onError: (error, { username }) => {
      console.error('Login failed for user:', username, error);
      
      // Clear any partial session data
      queryKeyHelpers.clearAllCache(queryClient);
    },
  });
};

/**
 * Hook to handle user logout with cache cleanup
 * @returns {Object} TanStack Mutation result
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('Logging out current user');
      await ParseAuth.logout();
    },
    onSuccess: () => {
      console.log('Logout successful');
      
      // Clear all cached data on logout
      queryKeyHelpers.clearAllCache(queryClient);
      
      // Remove any stored user data
      localStorage.removeItem('psypsy_remember_me');
      localStorage.removeItem('Parse/sessionToken');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      
      // Even if logout fails, clear local cache and storage
      queryKeyHelpers.clearAllCache(queryClient);
      localStorage.removeItem('psypsy_remember_me');
      localStorage.removeItem('Parse/sessionToken');
    },
    // Always clear cache regardless of success/failure
    onSettled: () => {
      queryKeyHelpers.clearAllCache(queryClient);
    },
  });
};

/**
 * Hook to handle user registration
 * @returns {Object} TanStack Mutation result
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, email, password }) => {
      console.log('Registering new user:', username);
      return await ParseAuth.register(username, email, password);
    },
    onSuccess: (user) => {
      console.log('Registration successful for user:', user.get('username'));
      
      // Clear cache and prepare for new session
      queryKeyHelpers.clearAllCache(queryClient);
      
      // User is automatically logged in after registration
      // Prefetch user data
      queryClient.prefetchQuery({
        queryKey: ['parse', 'auth', 'current-user'],
        queryFn: () => ParseAuth.getCurrentUser(),
        staleTime: 5 * 60 * 1000,
      });
    },
    onError: (error, { username }) => {
      console.error('Registration failed for user:', username, error);
    },
  });
};

/**
 * Hook to handle password reset requests
 * @returns {Object} TanStack Mutation result
 */
export const usePasswordReset = () => {
  return useMutation({
    mutationFn: async ({ email }) => {
      console.log('Requesting password reset for email:', email);
      await ParseAuth.requestPasswordReset(email);
      return { email, success: true };
    },
    onSuccess: (result) => {
      console.log('Password reset request sent successfully to:', result.email);
    },
    onError: (error, { email }) => {
      console.error('Password reset request failed for email:', email, error);
    },
  });
};

/**
 * Hook to refresh current user session and update cache
 * @returns {Object} TanStack Mutation result
 */
export const useRefreshSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('Refreshing user session');
      
      const currentUser = ParseAuth.getCurrentUser();
      if (!currentUser) {
        throw new Error('No current user session');
      }
      
      // Fetch fresh user data from server
      await currentUser.fetch();
      return currentUser;
    },
    onSuccess: (user) => {
      console.log('Session refreshed successfully');
      
      // Update current user cache
      queryClient.setQueryData(
        ['parse', 'auth', 'current-user'],
        user
      );
      
      // Invalidate user-related queries to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['parse', 'users'] 
      });
    },
    onError: (error) => {
      console.error('Session refresh failed:', error);
      
      // If session refresh fails, it might be expired
      if (error.code === 209) {
        // Session expired, clear cache and logout
        queryKeyHelpers.clearAllCache(queryClient);
        ParseAuth.logout();
        window.location.href = '/authentication/login';
      }
    },
  });
};

/**
 * Hook to validate current session
 * @returns {Object} TanStack Mutation result
 */
export const useValidateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const currentUser = ParseAuth.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user session found');
      }
      
      const sessionToken = currentUser.getSessionToken();
      if (!sessionToken) {
        throw new Error('No session token found');
      }
      
      // Validate session by making an authenticated request
      const testQuery = new Parse.Query(Parse.User);
      testQuery.equalTo('objectId', currentUser.id);
      await testQuery.first();
      
      return { valid: true, user: currentUser };
    },
    onSuccess: ({ user }) => {
      console.log('Session validation successful');
      
      // Update current user cache
      queryClient.setQueryData(
        ['parse', 'auth', 'current-user'],
        user
      );
    },
    onError: (error) => {
      console.error('Session validation failed:', error);
      
      // Clear invalid session
      queryKeyHelpers.clearAllCache(queryClient);
      ParseAuth.logout();
      
      // Only redirect if it's a session-related error
      if (error.code === 209 || error.code === 101) {
        window.location.href = '/authentication/login';
      }
    },
  });
};

export default {
  useLogin,
  useLogout,
  useRegister,
  usePasswordReset,
  useRefreshSession,
  useValidateSession
};