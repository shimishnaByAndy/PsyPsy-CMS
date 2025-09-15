/**
 * Query key factory functions for TanStack Query
 * Provides hierarchical, consistent query keys for all Parse Server entities
 * 
 * Key Structure:
 * ['parse'] -> ['parse', 'users'] -> ['parse', 'users', 'clients'] -> ['parse', 'users', 'clients', 'list', filters]
 */

export const queryKeys = {
  // Root key for all Parse Server queries
  all: ['parse'],
  
  // User-related queries (base for clients, professionals, admins)
  users: () => [...queryKeys.all, 'users'],
  
  // Client queries
  clients: () => [...queryKeys.users(), 'clients'],
  clientsList: (filters = {}) => [...queryKeys.clients(), 'list', filters],
  clientDetail: (id) => [...queryKeys.clients(), 'detail', id],
  clientsCount: (search = '') => [...queryKeys.clients(), 'count', { search }],
  
  // Professional queries
  professionals: () => [...queryKeys.users(), 'professionals'],
  professionalsList: (filters = {}) => [...queryKeys.professionals(), 'list', filters],
  professionalDetail: (id) => [...queryKeys.professionals(), 'detail', id],
  professionalsCount: (search = '') => [...queryKeys.professionals(), 'count', { search }],
  
  // Admin queries
  admins: () => [...queryKeys.users(), 'admins'],
  adminsList: (filters = {}) => [...queryKeys.admins(), 'list', filters],
  adminDetail: (id) => [...queryKeys.admins(), 'detail', id],
  
  // Dashboard statistics
  dashboard: () => [...queryKeys.all, 'dashboard'],
  dashboardStats: () => [...queryKeys.dashboard(), 'stats'],
  dashboardCounts: () => [...queryKeys.dashboard(), 'counts'],
  dashboardCharts: (period = 'month') => [...queryKeys.dashboard(), 'charts', period],
  
  // Appointments
  appointments: () => [...queryKeys.all, 'appointments'],
  appointmentsList: (filters = {}) => [...queryKeys.appointments(), 'list', filters],
  appointmentDetail: (id) => [...queryKeys.appointments(), 'detail', id],
  appointmentsByClient: (clientId) => [...queryKeys.appointments(), 'by-client', clientId],
  appointmentsByProfessional: (professionalId) => [...queryKeys.appointments(), 'by-professional', professionalId],
  
  // Time slots
  timeSlots: () => [...queryKeys.all, 'timeslots'],
  timeSlotsList: (filters = {}) => [...queryKeys.timeSlots(), 'list', filters],
  timeSlotsByProfessional: (professionalId) => [...queryKeys.timeSlots(), 'by-professional', professionalId],
  
  // Authentication related
  auth: () => [...queryKeys.all, 'auth'],
  currentUser: () => [...queryKeys.auth(), 'current-user'],
  userPermissions: (userId) => [...queryKeys.auth(), 'permissions', userId],
};

/**
 * Helper functions for query key manipulation
 */
export const queryKeyHelpers = {
  /**
   * Invalidate all queries for a specific entity type
   * @param {QueryClient} queryClient - TanStack Query client
   * @param {string} entityType - Entity type (clients, professionals, etc.)
   */
  invalidateEntity: (queryClient, entityType) => {
    if (queryKeys[entityType]) {
      queryClient.invalidateQueries({ queryKey: queryKeys[entityType]() });
    }
  },
  
  /**
   * Remove all cached data for a specific entity
   * @param {QueryClient} queryClient - TanStack Query client
   * @param {string} entityType - Entity type
   */
  removeEntity: (queryClient, entityType) => {
    if (queryKeys[entityType]) {
      queryClient.removeQueries({ queryKey: queryKeys[entityType]() });
    }
  },
  
  /**
   * Invalidate dashboard statistics
   * @param {QueryClient} queryClient - TanStack Query client
   */
  invalidateDashboard: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
  },
  
  /**
   * Clear all cached data (useful for logout)
   * @param {QueryClient} queryClient - TanStack Query client
   */
  clearAllCache: (queryClient) => {
    queryClient.clear();
  },
  
  /**
   * Invalidate queries after user type changes (e.g., professional verification)
   * @param {QueryClient} queryClient - TanStack Query client
   * @param {string} userType - User type (clients, professionals, admins)
   */
  invalidateUserType: (queryClient, userType) => {
    queryClient.invalidateQueries({ queryKey: queryKeys[userType]() });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
  },
  
  /**
   * Get cache size for debugging
   * @param {QueryClient} queryClient - TanStack Query client
   * @returns {number} Number of cached queries
   */
  getCacheSize: (queryClient) => {
    return queryClient.getQueryCache().getAll().length;
  },
  
  /**
   * Log all cached query keys (for debugging)
   * @param {QueryClient} queryClient - TanStack Query client
   */
  debugLogCache: (queryClient) => {
    const queries = queryClient.getQueryCache().getAll();
    console.log('Cached queries:', queries.map(q => q.queryKey));
    return queries.map(q => ({ key: q.queryKey, state: q.state }));
  },
};

export default queryKeys;