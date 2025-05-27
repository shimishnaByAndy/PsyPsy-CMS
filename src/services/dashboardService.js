/**
 * Dashboard Service for PsyPsy CMS
 * Handles API calls and data management for dashboard components
 */

import Parse from 'parse';

class DashboardService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    try {
      // In production, these would be actual Parse queries
      // For now, returning mock data with realistic structure
      
      const stats = {
        totalClients: await this.getTotalClients(),
        activeRequests: await this.getActiveRequests(),
        weeklyAppointments: await this.getWeeklyAppointments(),
        responseRate: await this.getResponseRate(),
        weeklyGrowth: await this.getWeeklyGrowth(),
        urgentRequests: await this.getUrgentRequests()
      };

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return this.getMockStats();
    }
  }

  /**
   * Get recent activity data
   */
  static async getRecentActivity() {
    try {
      const [recentRequests, upcomingAppointments] = await Promise.all([
        this.getRecentRequests(),
        this.getUpcomingAppointments()
      ]);

      return {
        recentRequests,
        upcomingAppointments
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return this.getMockRecentActivity();
    }
  }

  /**
   * Get professional network data
   */
  static async getProfessionalNetwork() {
    try {
      const networkData = {
        totalProfessionals: await this.getTotalProfessionals(),
        activeProfessionals: await this.getActiveProfessionals(),
        availableNow: await this.getAvailableProfessionals(),
        recentlyJoined: await this.getRecentlyJoinedProfessionals(),
        topPerformers: await this.getTopPerformers()
      };

      return networkData;
    } catch (error) {
      console.error('Error fetching professional network:', error);
      return this.getMockNetworkData();
    }
  }

  /**
   * Get service breakdown data
   */
  static async getServiceBreakdown() {
    try {
      const serviceData = {
        totalRequests: await this.getTotalServiceRequests(),
        serviceTypes: await this.getServiceTypeBreakdown()
      };

      return serviceData;
    } catch (error) {
      console.error('Error fetching service breakdown:', error);
      return this.getMockServiceData();
    }
  }

  /**
   * Get system health data
   */
  static async getSystemHealth() {
    try {
      const healthData = {
        systemStatus: await this.getSystemStatus(),
        uptime: await this.getSystemUptime(),
        responseTime: await this.getAverageResponseTime(),
        activeUsers: await this.getActiveUsers(),
        alerts: await this.getSystemAlerts(),
        metrics: await this.getSystemMetrics(),
        databaseHealth: await this.getDatabaseHealth(),
        apiHealth: await this.getApiHealth()
      };

      return healthData;
    } catch (error) {
      console.error('Error fetching system health:', error);
      return this.getMockHealthData();
    }
  }

  /**
   * Get demographics data
   */
  static async getDemographics() {
    try {
      const demographicsData = {
        totalClients: await this.getTotalClients(),
        ageGroups: await this.getAgeGroupDistribution(),
        genderDistribution: await this.getGenderDistribution(),
        geographicDistribution: await this.getGeographicDistribution()
      };

      return demographicsData;
    } catch (error) {
      console.error('Error fetching demographics:', error);
      return this.getMockDemographicsData();
    }
  }

  // Individual data fetching methods (to be implemented with actual Parse queries)
  
  static async getTotalClients() {
    // const query = new Parse.Query('Client');
    // return await query.count();
    return 247;
  }

  static async getActiveRequests() {
    // const query = new Parse.Query('AppointmentRequest');
    // query.equalTo('status', 'active');
    // return await query.count();
    return 12;
  }

  static async getWeeklyAppointments() {
    // const query = new Parse.Query('Appointment');
    // const startOfWeek = new Date();
    // startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    // query.greaterThan('scheduledTimestamp', startOfWeek);
    // return await query.count();
    return 8;
  }

  static async getResponseRate() {
    // Calculate response rate based on responded vs total requests
    return 85;
  }

  static async getWeeklyGrowth() {
    // Calculate growth compared to previous week
    return { clients: 5, requests: 3 };
  }

  static async getUrgentRequests() {
    // const query = new Parse.Query('AppointmentRequest');
    // query.equalTo('priority', 'urgent');
    // return await query.count();
    return 3;
  }

  static async getRecentRequests() {
    // const query = new Parse.Query('AppointmentRequest');
    // query.descending('createdAt');
    // query.limit(5);
    // return await query.find();
    return this.getMockRecentRequests();
  }

  static async getUpcomingAppointments() {
    // const query = new Parse.Query('Appointment');
    // query.greaterThan('scheduledTimestamp', new Date());
    // query.ascending('scheduledTimestamp');
    // query.limit(5);
    // return await query.find();
    return this.getMockUpcomingAppointments();
  }

  static async getTotalProfessionals() {
    // const query = new Parse.Query('Professional');
    // return await query.count();
    return 45;
  }

  static async getActiveProfessionals() {
    // const query = new Parse.Query('Professional');
    // query.equalTo('status', 'active');
    // return await query.count();
    return 38;
  }

  static async getAvailableProfessionals() {
    // const query = new Parse.Query('Professional');
    // query.equalTo('availability', 'available');
    // return await query.count();
    return 12;
  }

  static async getRecentlyJoinedProfessionals() {
    return this.getMockRecentlyJoined();
  }

  static async getTopPerformers() {
    return this.getMockTopPerformers();
  }

  static async getTotalServiceRequests() {
    return 156;
  }

  static async getServiceTypeBreakdown() {
    return this.getMockServiceTypes();
  }

  static async getSystemStatus() {
    return "healthy";
  }

  static async getSystemUptime() {
    return "99.8%";
  }

  static async getAverageResponseTime() {
    return "245ms";
  }

  static async getActiveUsers() {
    return 1247;
  }

  static async getSystemAlerts() {
    return this.getMockAlerts();
  }

  static async getSystemMetrics() {
    return {
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 38,
      networkLatency: 12
    };
  }

  static async getDatabaseHealth() {
    return 95;
  }

  static async getApiHealth() {
    return 98;
  }

  static async getAgeGroupDistribution() {
    return this.getMockAgeGroups();
  }

  static async getGenderDistribution() {
    return this.getMockGenderDistribution();
  }

  static async getGeographicDistribution() {
    return this.getMockGeographicDistribution();
  }

  // Mock data methods
  static getMockStats() {
    return {
      totalClients: 247,
      activeRequests: 12,
      weeklyAppointments: 8,
      responseRate: 85,
      weeklyGrowth: { clients: 5, requests: 3 },
      urgentRequests: 3
    };
  }

  static getMockRecentActivity() {
    return {
      recentRequests: this.getMockRecentRequests(),
      upcomingAppointments: this.getMockUpcomingAppointments()
    };
  }

  static getMockRecentRequests() {
    return [
      {
        id: "1",
        clientName: "Sarah M.",
        serviceType: "Individual Therapy",
        createdAt: "2024-01-15",
        status: "New"
      },
      {
        id: "2",
        clientName: "John D.",
        serviceType: "Psychological Assessment",
        createdAt: "2024-01-14",
        status: "In Review"
      },
      {
        id: "3",
        clientName: "Maria L.",
        serviceType: "Couples Therapy",
        createdAt: "2024-01-14",
        status: "Matched"
      }
    ];
  }

  static getMockUpcomingAppointments() {
    return [
      {
        id: "1",
        clientName: "Alex R.",
        scheduledTimestamp: "2024-01-16T10:00:00",
        serviceType: "Individual Therapy",
        meetPref: "online"
      },
      {
        id: "2",
        clientName: "Emma S.",
        scheduledTimestamp: "2024-01-16T14:30:00",
        serviceType: "Family Therapy",
        meetPref: "in-person"
      }
    ];
  }

  static getMockNetworkData() {
    return {
      totalProfessionals: 45,
      activeProfessionals: 38,
      availableNow: 12,
      recentlyJoined: this.getMockRecentlyJoined(),
      topPerformers: this.getMockTopPerformers()
    };
  }

  static getMockRecentlyJoined() {
    return [
      {
        id: "1",
        name: "Dr. Sarah Johnson",
        specialization: "Clinical Psychology",
        joinedDate: "2024-01-10",
        status: "active",
        avatar: "/assets/images/users/user1.jpg"
      },
      {
        id: "2",
        name: "Dr. Michael Chen",
        specialization: "Family Therapy",
        joinedDate: "2024-01-08",
        status: "pending",
        avatar: "/assets/images/users/user2.jpg"
      }
    ];
  }

  static getMockTopPerformers() {
    return [
      {
        id: "1",
        name: "Dr. Emily Rodriguez",
        specialization: "Trauma Therapy",
        completedSessions: 156,
        rating: 4.9,
        avatar: "/assets/images/users/user3.jpg"
      },
      {
        id: "2",
        name: "Dr. James Wilson",
        specialization: "Cognitive Behavioral Therapy",
        completedSessions: 142,
        rating: 4.8,
        avatar: "/assets/images/users/user4.jpg"
      }
    ];
  }

  static getMockServiceData() {
    return {
      totalRequests: 156,
      serviceTypes: this.getMockServiceTypes()
    };
  }

  static getMockServiceTypes() {
    return [
      { name: "Individual Therapy", count: 68, percentage: 43.6 },
      { name: "Couples Therapy", count: 32, percentage: 20.5 },
      { name: "Family Therapy", count: 24, percentage: 15.4 },
      { name: "Psychological Assessment", count: 18, percentage: 11.5 },
      { name: "Group Therapy", count: 14, percentage: 9.0 }
    ];
  }

  static getMockHealthData() {
    return {
      systemStatus: "healthy",
      uptime: "99.8%",
      responseTime: "245ms",
      activeUsers: 1247,
      alerts: this.getMockAlerts(),
      metrics: {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 38,
        networkLatency: 12
      },
      databaseHealth: 95,
      apiHealth: 98
    };
  }

  static getMockAlerts() {
    return [
      {
        id: "1",
        type: "warning",
        message: "High server load detected",
        timestamp: "2024-01-15T14:30:00",
        severity: "medium"
      },
      {
        id: "2",
        type: "info",
        message: "Scheduled maintenance in 2 hours",
        timestamp: "2024-01-15T13:00:00",
        severity: "low"
      }
    ];
  }

  static getMockDemographicsData() {
    return {
      totalClients: 247,
      ageGroups: this.getMockAgeGroups(),
      genderDistribution: this.getMockGenderDistribution(),
      geographicDistribution: this.getMockGeographicDistribution()
    };
  }

  static getMockAgeGroups() {
    return [
      { range: "18-25", count: 45, percentage: 18.2 },
      { range: "26-35", count: 78, percentage: 31.6 },
      { range: "36-45", count: 62, percentage: 25.1 },
      { range: "46-55", count: 38, percentage: 15.4 },
      { range: "56-65", count: 18, percentage: 7.3 },
      { range: "65+", count: 6, percentage: 2.4 }
    ];
  }

  static getMockGenderDistribution() {
    return {
      female: 58.3,
      male: 35.2,
      nonBinary: 4.9,
      preferNotToSay: 1.6
    };
  }

  static getMockGeographicDistribution() {
    return [
      { region: "Montreal", count: 89, percentage: 36.0 },
      { region: "Quebec City", count: 52, percentage: 21.1 },
      { region: "Gatineau", count: 34, percentage: 13.8 },
      { region: "Sherbrooke", count: 28, percentage: 11.3 },
      { region: "Other", count: 44, percentage: 17.8 }
    ];
  }

  // New simplified dashboard methods

  /**
   * Get professionals statistics for simplified dashboard
   */
  static async getProfessionalsStats() {
    try {
      // In production, these would be actual Parse queries
      return {
        totalProfessionals: 45,
        genderStats: {
          men: 18,
          women: 24,
          other: 3
        },
        ageGroups: [
          { range: "25-35", count: 15 },
          { range: "36-45", count: 18 },
          { range: "46-55", count: 8 },
          { range: "56+", count: 4 }
        ]
      };
    } catch (error) {
      console.error('Error fetching professionals stats:', error);
      return {};
    }
  }

  /**
   * Get clients statistics for simplified dashboard
   */
  static async getClientsStats() {
    try {
      // In production, these would be actual Parse queries
      return {
        totalClients: 247,
        genderStats: {
          men: 87,
          women: 144,
          other: 16
        },
        ageGroups: [
          { range: "18-25", count: 45 },
          { range: "26-35", count: 78 },
          { range: "36-45", count: 62 },
          { range: "46-55", count: 38 },
          { range: "56+", count: 24 }
        ]
      };
    } catch (error) {
      console.error('Error fetching clients stats:', error);
      return {};
    }
  }

  /**
   * Get appointments statistics for simplified dashboard
   */
  static async getAppointmentsStats() {
    try {
      // In production, these would be actual Parse queries
      return {
        totalAppointments: 89,
        timeSlotStats: {
          withTimeSlot: 67,
          withoutTimeSlot: 22
        },
        meetingPreferences: {
          online: 34,
          inPerson: 28,
          both: 27
        },
        languagePreferences: {
          french: 45,
          english: 32,
          both: 12
        }
      };
    } catch (error) {
      console.error('Error fetching appointments stats:', error);
      return {};
    }
  }
}

export default DashboardService; 