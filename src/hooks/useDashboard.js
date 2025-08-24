/**
 * Dashboard statistics hooks using TanStack Query
 * Provides auto-refreshing dashboard data with background updates
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import { executeParseCount, executeParseQuery, executeCloudFunction } from '../services/queryService';

/**
 * Hook to fetch dashboard statistics with auto-refresh
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether query is enabled
 * @param {number} options.refetchInterval - Refetch interval in ms
 * @returns {Object} TanStack Query result with dashboard stats
 */
export const useDashboardStats = (options = {}) => {
  const { enabled = true, refetchInterval = 30 * 1000 } = options; // Default 30 second refresh

  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: async () => {
      console.log('Fetching dashboard statistics');
      
      // Fetch all counts in parallel for better performance
      const [
        totalClients,
        totalProfessionals,
        verifiedProfessionals,
        totalAppointments,
        recentClients,
        recentProfessionals,
        pendingVerifications
      ] = await Promise.all([
        // Total clients count
        executeParseCount({
          className: '_User',
          conditions: { userType: 2 },
          useMasterKey: true
        }),
        
        // Total professionals count
        executeParseCount({
          className: '_User',
          conditions: { userType: 1 },
          useMasterKey: true
        }),
        
        // Verified professionals count
        executeParseCount({
          className: '_User',
          conditions: { userType: 1, isVerified: true },
          useMasterKey: true
        }),
        
        // Total appointments count
        executeParseCount({
          className: 'Appointment',
          conditions: {},
          useMasterKey: true
        }),
        
        // Recent clients (last 7 days)
        executeParseCount({
          className: '_User',
          conditions: { 
            userType: 2,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          },
          useMasterKey: true
        }),
        
        // Recent professionals (last 7 days)
        executeParseCount({
          className: '_User',
          conditions: { 
            userType: 1,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          },
          useMasterKey: true
        }),
        
        // Pending professional verifications
        executeParseCount({
          className: '_User',
          conditions: { 
            userType: 1,
            $or: [
              { isVerified: { $ne: true } },
              { isVerified: { $exists: false } }
            ]
          },
          useMasterKey: true
        })
      ]);

      // Calculate derived statistics
      const pendingProfessionals = totalProfessionals - verifiedProfessionals;
      const verificationRate = totalProfessionals > 0 
        ? Math.round((verifiedProfessionals / totalProfessionals) * 100) 
        : 0;

      const stats = {
        // Core metrics
        clients: {
          total: totalClients,
          recent: recentClients,
          growth: recentClients > 0 ? '+' + recentClients : '0'
        },
        
        professionals: {
          total: totalProfessionals,
          verified: verifiedProfessionals,
          pending: pendingProfessionals,
          recent: recentProfessionals,
          verificationRate,
          growth: recentProfessionals > 0 ? '+' + recentProfessionals : '0'
        },
        
        appointments: {
          total: totalAppointments
        },
        
        // System health metrics
        system: {
          pendingActions: pendingVerifications,
          lastUpdated: new Date().toISOString()
        }
      };

      console.log('Dashboard statistics fetched:', stats);
      return stats;
    },
    enabled,
    staleTime: 15 * 1000, // 15 seconds - short stale time for dashboard
    cacheTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval, // Auto-refresh every 30 seconds by default
    refetchIntervalInBackground: true, // Continue refreshing when tab is not focused
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to fetch dashboard charts data
 * @param {string} period - Time period ('week', 'month', 'year')
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with chart data
 */
export const useDashboardCharts = (period = 'month', enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dashboardCharts(period),
    queryFn: async () => {
      console.log('Fetching dashboard charts for period:', period);
      
      // Use cloud function for complex aggregations
      return await executeCloudFunction('getDashboardCharts', { period }, true);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes for chart data
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch charts every 5 minutes
  });
};

/**
 * Hook to fetch recent activity for dashboard
 * @param {number} limit - Number of recent activities to fetch
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with recent activity
 */
export const useRecentActivity = (limit = 10, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dashboardStats(['recent-activity', limit]),
    queryFn: async () => {
      console.log('Fetching recent activity, limit:', limit);
      
      // Get recent users (both clients and professionals)
      const recentUsers = await executeParseQuery({
        className: '_User',
        conditions: { userType: { $in: [1, 2] } }, // Professionals and clients
        include: ['professionalPtr', 'clientPtr'],
        limit,
        sortBy: 'createdAt',
        ascending: false,
        useMasterKey: true
      });

      // Transform to activity format
      const activities = recentUsers.map(user => ({
        id: user.id,
        type: user.userType === 1 ? 'professional_registered' : 'client_registered',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.userType
        },
        timestamp: user.createdAt,
        description: user.userType === 1 
          ? `New professional registered: ${user.username}`
          : `New client registered: ${user.username}`
      }));

      return activities;
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute for activity
    cacheTime: 3 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refetch activity every 2 minutes
  });
};

/**
 * Hook to fetch system health metrics
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with system health
 */
export const useSystemHealth = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dashboardStats(['system-health']),
    queryFn: async () => {
      console.log('Fetching system health metrics');
      
      try {
        // Use cloud function to get comprehensive system health
        const healthData = await executeCloudFunction('getSystemHealth', {}, true);
        
        return {
          ...healthData,
          status: 'healthy',
          lastChecked: new Date().toISOString()
        };
      } catch (error) {
        console.error('System health check failed:', error);
        
        // Return degraded status if health check fails
        return {
          status: 'degraded',
          error: error.message,
          lastChecked: new Date().toISOString(),
          database: 'unknown',
          api: 'unknown'
        };
      }
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000, // Check health every minute
    retry: 2, // Retry health checks
  });
};

/**
 * Hook to fetch detailed counts breakdown
 * @param {boolean} enabled - Whether query is enabled
 * @returns {Object} TanStack Query result with detailed counts
 */
export const useDetailedCounts = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dashboardCounts(),
    queryFn: async () => {
      console.log('Fetching detailed counts breakdown');
      
      const [
        clientsByStatus,
        professionalsByType,
        appointmentsByStatus
      ] = await Promise.all([
        // Clients by status (this would need to be implemented based on your client status system)
        executeParseCount({
          className: '_User',
          conditions: { userType: 2, isBlocked: { $ne: true } },
          useMasterKey: true
        }).then(active => ({ active, total: active })), // Simplified for now
        
        // This would require aggregation - simplified for now
        executeParseCount({
          className: '_User',
          conditions: { userType: 1 },
          useMasterKey: true
        }).then(total => ({ total })),
        
        // Appointments by status
        executeParseCount({
          className: 'Appointment',
          conditions: {},
          useMasterKey: true
        }).then(total => ({ total }))
      ]);

      return {
        clients: clientsByStatus,
        professionals: professionalsByType,
        appointments: appointmentsByStatus
      };
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
};

/**
 * Hook to get dashboard data optimized for performance
 * Combines multiple queries with intelligent caching
 * @param {Object} options - Configuration options
 * @returns {Object} Combined dashboard data
 */
export const useDashboardData = (options = {}) => {
  const stats = useDashboardStats(options);
  const activity = useRecentActivity(5, options.enabled);
  const health = useSystemHealth(options.enabled);
  
  return {
    stats,
    activity,
    health,
    isLoading: stats.isLoading || activity.isLoading || health.isLoading,
    isError: stats.isError || activity.isError || health.isError,
    error: stats.error || activity.error || health.error,
  };
};

export default {
  useDashboardStats,
  useDashboardCharts,
  useRecentActivity,
  useSystemHealth,
  useDetailedCounts,
  useDashboardData
};