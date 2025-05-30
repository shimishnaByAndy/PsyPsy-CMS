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
      throw error;
    }
  }

  /**
   * Get recent activity data
   */
  static async getRecentActivity() {
    try {
      const activityData = {
        recentRequests: await this.getRecentRequests(),
        upcomingAppointments: await this.getUpcomingAppointments()
      };

      return activityData;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
    }
  }

  // Individual data fetching methods with Parse Server integration
  
  static async getTotalClients() {
    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('userType', 2); // Client type
      return await userQuery.count();
    } catch (error) {
      console.error('Error getting total clients:', error);
      return 0;
    }
  }

  static async getActiveRequests() {
    try {
      const appointmentQuery = new Parse.Query('Appointment');
      appointmentQuery.equalTo('status', 'requested');
      return await appointmentQuery.count();
    } catch (error) {
      console.error('Error getting active requests:', error);
      return 0;
    }
  }

  static async getWeeklyAppointments() {
    try {
      const appointmentQuery = new Parse.Query('Appointment');
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      appointmentQuery.greaterThanOrEqualTo('createdAt', startOfWeek);
      return await appointmentQuery.count();
    } catch (error) {
      console.error('Error getting weekly appointments:', error);
      return 0;
    }
  }

  static async getResponseRate() {
    try {
      // Calculate response rate based on matched vs total requests
      const totalQuery = new Parse.Query('Appointment');
      const total = await totalQuery.count();
      
      const matchedQuery = new Parse.Query('Appointment');
      matchedQuery.notEqualTo('status', 'requested');
      const matched = await matchedQuery.count();
      
      return total > 0 ? Math.round((matched / total) * 100) : 0;
    } catch (error) {
      console.error('Error calculating response rate:', error);
      return 0;
    }
  }

  static async getWeeklyGrowth() {
    try {
      const currentWeek = new Date();
      currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
      currentWeek.setHours(0, 0, 0, 0);
      
      const lastWeek = new Date(currentWeek);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      // Client growth
      const currentWeekClientsQuery = new Parse.Query(Parse.User);
      currentWeekClientsQuery.equalTo('userType', 2);
      currentWeekClientsQuery.greaterThanOrEqualTo('createdAt', currentWeek);
      const currentWeekClients = await currentWeekClientsQuery.count();
      
      // Request growth
      const currentWeekRequestsQuery = new Parse.Query('Appointment');
      currentWeekRequestsQuery.greaterThanOrEqualTo('createdAt', currentWeek);
      const currentWeekRequests = await currentWeekRequestsQuery.count();
      
      return { 
        clients: currentWeekClients, 
        requests: currentWeekRequests 
      };
    } catch (error) {
      console.error('Error calculating weekly growth:', error);
      return { clients: 0, requests: 0 };
    }
  }

  static async getUrgentRequests() {
    try {
      const appointmentQuery = new Parse.Query('Appointment');
      appointmentQuery.equalTo('status', 'requested');
      
      // Consider requests older than 48 hours as urgent
      const urgentDate = new Date();
      urgentDate.setHours(urgentDate.getHours() - 48);
      appointmentQuery.lessThan('createdAt', urgentDate);
      
      return await appointmentQuery.count();
    } catch (error) {
      console.error('Error getting urgent requests:', error);
      return 0;
    }
  }

  static async getRecentRequests() {
    try {
      const appointmentQuery = new Parse.Query('Appointment');
      appointmentQuery.include(['clientPtr', 'profilePtr']);
      appointmentQuery.descending('createdAt');
      appointmentQuery.limit(5);
      
      const appointments = await appointmentQuery.find();
      
      return appointments.map(appointment => {
        const profilePtr = appointment.get('profilePtr');
        const clientName = profilePtr ? 
          `${profilePtr.get('firstName') || ''} ${profilePtr.get('lastName') || ''}`.trim() : 
          'Unknown Client';
          
        return {
          id: appointment.id,
          clientName: clientName,
          serviceType: appointment.get('serviceType') || 0,
          status: appointment.get('status') || 'requested',
          createdAt: appointment.get('createdAt'),
          title: appointment.get('title') || 'New Request'
        };
      });
    } catch (error) {
      console.error('Error getting recent requests:', error);
      return [];
    }
  }

  static async getUpcomingAppointments() {
    try {
      const appointmentQuery = new Parse.Query('Appointment');
      appointmentQuery.include(['clientPtr', 'profilePtr']);
      appointmentQuery.equalTo('status', 'confirmed');
      appointmentQuery.greaterThan('scheduledTimestamp', Date.now());
      appointmentQuery.ascending('scheduledTimestamp');
      appointmentQuery.limit(5);
      
      const appointments = await appointmentQuery.find();
      
      return appointments.map(appointment => {
        const profilePtr = appointment.get('profilePtr');
        const clientName = profilePtr ? 
          `${profilePtr.get('firstName') || ''} ${profilePtr.get('lastName') || ''}`.trim() : 
          'Unknown Client';
          
        return {
          id: appointment.id,
          clientName: clientName,
          serviceType: appointment.get('serviceType') || 0,
          scheduledTimestamp: appointment.get('scheduledTimestamp'),
          title: appointment.get('title') || 'Upcoming Session'
        };
      });
    } catch (error) {
      console.error('Error getting upcoming appointments:', error);
      return [];
    }
  }

  static async getTotalProfessionals() {
    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('userType', 3); // Professional type
      return await userQuery.count();
    } catch (error) {
      console.error('Error getting total professionals:', error);
      return 0;
    }
  }

  static async getActiveProfessionals() {
    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('userType', 3);
      userQuery.equalTo('isBlocked', false);
      return await userQuery.count();
    } catch (error) {
      console.error('Error getting active professionals:', error);
      return 0;
    }
  }

  static async getAvailableProfessionals() {
    try {
      // Count professionals who are verified and active
      const professionalQuery = new Parse.Query('Professional');
      professionalQuery.equalTo('isVerified', true);
      return await professionalQuery.count();
    } catch (error) {
      console.error('Error getting available professionals:', error);
      return 0;
    }
  }

  static async getRecentlyJoinedProfessionals() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('userType', 3);
      userQuery.include('professionalPtr');
      userQuery.greaterThanOrEqualTo('createdAt', oneWeekAgo);
      userQuery.descending('createdAt');
      userQuery.limit(5);
      
      const users = await userQuery.find();
      
      return users.map(user => {
        const professionalPtr = user.get('professionalPtr');
        const firstName = professionalPtr?.get('firstName') || '';
        const lastName = professionalPtr?.get('lastName') || '';
        
        return {
          id: user.id,
          name: `${firstName} ${lastName}`.trim() || user.get('username'),
          profType: professionalPtr?.get('profType') || 1,
          joinedAt: user.get('createdAt')
        };
      });
    } catch (error) {
      console.error('Error getting recently joined professionals:', error);
      return [];
    }
  }

  static async getTopPerformers() {
    try {
      // Get professionals with highest rating
      const professionalQuery = new Parse.Query('Professional');
      professionalQuery.include('userPtr');
      professionalQuery.greaterThan('rating', 4.0);
      professionalQuery.descending('rating');
      professionalQuery.limit(5);
      
      const professionals = await professionalQuery.find();
      
      return professionals.map(professional => {
        const firstName = professional.get('firstName') || '';
        const lastName = professional.get('lastName') || '';
        
        return {
          id: professional.id,
          name: `${firstName} ${lastName}`.trim(),
          rating: professional.get('rating') || 0,
          reviewCount: professional.get('reviewCount') || 0,
          profType: professional.get('profType') || 1
        };
      });
    } catch (error) {
      console.error('Error getting top performers:', error);
      return [];
    }
  }

  static async getTotalServiceRequests() {
    try {
      const appointmentQuery = new Parse.Query('Appointment');
      return await appointmentQuery.count();
    } catch (error) {
      console.error('Error getting total service requests:', error);
      return 0;
    }
  }

  static async getServiceTypeBreakdown() {
    try {
      const serviceTypes = [
        { id: 0, name: 'Individual Therapy' },
        { id: 1, name: 'Group Therapy' },
        { id: 2, name: 'Couples Therapy' },
        { id: 3, name: 'Family Therapy' },
        { id: 4, name: 'Psychological Assessment' },
        { id: 5, name: 'Neuropsychological Assessment' },
        { id: 6, name: 'Career Counseling' },
        { id: 7, name: 'Addiction Counseling' }
      ];

      const breakdown = [];
      
      for (const serviceType of serviceTypes) {
        const appointmentQuery = new Parse.Query('Appointment');
        appointmentQuery.equalTo('serviceType', serviceType.id);
        const count = await appointmentQuery.count();
        
        breakdown.push({
          name: serviceType.name,
          value: count,
          percentage: 0 // Will be calculated after getting all counts
        });
      }
      
      // Calculate percentages
      const total = breakdown.reduce((sum, item) => sum + item.value, 0);
      if (total > 0) {
        breakdown.forEach(item => {
          item.percentage = Math.round((item.value / total) * 100);
        });
      }
      
      return breakdown;
    } catch (error) {
      console.error('Error getting service type breakdown:', error);
      return [];
    }
  }

  static async getSystemStatus() {
    try {
      // Check if we can query Parse Server
      const testQuery = new Parse.Query(Parse.User);
      testQuery.limit(1);
      await testQuery.find();
      return "healthy";
    } catch (error) {
      console.error('System health check failed:', error);
      return "unhealthy";
    }
  }

  static async getSystemUptime() {
    // This would typically come from server monitoring
    return "99.8%";
  }

  static async getAverageResponseTime() {
    // This would typically come from server monitoring
    return "245ms";
  }

  static async getActiveUsers() {
    try {
      // Count users who have been active in the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const userQuery = new Parse.Query(Parse.User);
      userQuery.greaterThanOrEqualTo('updatedAt', oneDayAgo);
      return await userQuery.count();
    } catch (error) {
      console.error('Error getting active users:', error);
      return 0;
    }
  }

  static async getSystemAlerts() {
    try {
      const alerts = [];
      
      // Check for urgent requests
      const urgentCount = await this.getUrgentRequests();
      if (urgentCount > 0) {
        alerts.push({
          type: 'warning',
          message: `${urgentCount} urgent appointment request${urgentCount > 1 ? 's' : ''} need attention`,
          timestamp: new Date()
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error getting system alerts:', error);
      return [];
    }
  }

  static async getSystemMetrics() {
    // These would typically come from server monitoring
    return {
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 38,
      networkLatency: 12
    };
  }

  static async getDatabaseHealth() {
    try {
      // Test database connectivity and response time
      const start = Date.now();
      const testQuery = new Parse.Query(Parse.User);
      testQuery.limit(1);
      await testQuery.find();
      const responseTime = Date.now() - start;
      
      // Convert response time to health score
      if (responseTime < 100) return 95;
      if (responseTime < 500) return 85;
      if (responseTime < 1000) return 75;
      return 60;
    } catch (error) {
      console.error('Database health check failed:', error);
      return 0;
    }
  }

  static async getApiHealth() {
    return 98;
  }

  static async getAgeGroupDistribution() {
    try {
      const ageGroups = [
        { range: '18-24', min: 18, max: 24 },
        { range: '25-34', min: 25, max: 34 },
        { range: '35-44', min: 35, max: 44 },
        { range: '45-54', min: 45, max: 54 },
        { range: '55-64', min: 55, max: 64 },
        { range: '65+', min: 65, max: 120 }
      ];

      const distribution = [];
      const currentYear = new Date().getFullYear();

      for (const group of ageGroups) {
        const birthYearMax = currentYear - group.min;
        const birthYearMin = currentYear - group.max;
        
        const clientQuery = new Parse.Query('Client');
        const birthYearStart = new Date(birthYearMin, 0, 1);
        const birthYearEnd = new Date(birthYearMax, 11, 31);
        
        clientQuery.greaterThanOrEqualTo('dob', birthYearStart);
        clientQuery.lessThanOrEqualTo('dob', birthYearEnd);
        
        const count = await clientQuery.count();
        
        distribution.push({
          ageGroup: group.range,
          count: count
        });
      }

      return distribution;
    } catch (error) {
      console.error('Error getting age group distribution:', error);
      return [];
    }
  }

  static async getGenderDistribution() {
    try {
      const genders = [
        { id: 1, name: 'Woman' },
        { id: 2, name: 'Man' },
        { id: 3, name: 'Other' },
        { id: 4, name: 'Not disclosed' }
      ];

      const distribution = [];

      for (const gender of genders) {
        const clientQuery = new Parse.Query('Client');
        clientQuery.equalTo('gender', gender.id);
        const count = await clientQuery.count();
        
        distribution.push({
          gender: gender.name,
          count: count
        });
      }

      return distribution;
    } catch (error) {
      console.error('Error getting gender distribution:', error);
      return [];
    }
  }

  static async getGeographicDistribution() {
    try {
      const clientQuery = new Parse.Query('Client');
      clientQuery.select(['addressObj']);
      clientQuery.limit(1000); // Adjust as needed
      
      const clients = await clientQuery.find();
      
      const distribution = {};
      
      clients.forEach(client => {
        const addressObj = client.get('addressObj');
        if (addressObj && addressObj.province) {
          const province = addressObj.province;
          distribution[province] = (distribution[province] || 0) + 1;
        }
      });

      return Object.entries(distribution).map(([province, count]) => ({
        province,
        count
      }));
    } catch (error) {
      console.error('Error getting geographic distribution:', error);
      return [];
    }
  }

  // New simplified dashboard methods

  /**
   * Get professionals statistics for simplified dashboard
   */
  static async getProfessionalsStats() {
    try {
      const totalProfessionals = await this.getTotalProfessionals();
      
      // Get gender distribution for professionals
      const genders = [
        { id: 1, name: 'women' },
        { id: 2, name: 'men' },
        { id: 3, name: 'other' }
      ];

      const genderStats = {};
      for (const gender of genders) {
        const professionalQuery = new Parse.Query('Professional');
        professionalQuery.equalTo('gender', gender.id);
        const count = await professionalQuery.count();
        genderStats[gender.name] = count;
      }

      // Get age distribution for professionals
      const ageGroups = [
        { range: "25-35", min: 25, max: 35 },
        { range: "36-45", min: 36, max: 45 },
        { range: "46-55", min: 46, max: 55 },
        { range: "56+", min: 56, max: 120 }
      ];

      const ageGroupsData = [];
      const currentYear = new Date().getFullYear();

      for (const group of ageGroups) {
        const birthYearMax = currentYear - group.min;
        const birthYearMin = currentYear - group.max;
        
        const professionalQuery = new Parse.Query('Professional');
        const birthYearStart = new Date(birthYearMin, 0, 1);
        const birthYearEnd = new Date(birthYearMax, 11, 31);
        
        professionalQuery.greaterThanOrEqualTo('dob', birthYearStart);
        professionalQuery.lessThanOrEqualTo('dob', birthYearEnd);
        
        const count = await professionalQuery.count();
        
        ageGroupsData.push({
          range: group.range,
          count: count
        });
      }

      return {
        totalProfessionals: totalProfessionals,
        genderStats: genderStats,
        ageGroups: ageGroupsData
      };
    } catch (error) {
      console.error('Error fetching professionals stats:', error);
      return {
        totalProfessionals: 0,
        genderStats: { men: 0, women: 0, other: 0 },
        ageGroups: []
      };
    }
  }

  /**
   * Get clients statistics for simplified dashboard
   */
  static async getClientsStats() {
    try {
      const totalClients = await this.getTotalClients();
      
      // Get gender distribution for clients
      const genders = [
        { id: 1, name: 'women' },
        { id: 2, name: 'men' },
        { id: 3, name: 'other' }
      ];

      const genderStats = {};
      for (const gender of genders) {
        const clientQuery = new Parse.Query('Client');
        clientQuery.equalTo('gender', gender.id);
        const count = await clientQuery.count();
        genderStats[gender.name] = count;
      }

      // Get age distribution for clients
      const ageGroups = [
        { range: "18-25", min: 18, max: 25 },
        { range: "26-35", min: 26, max: 35 },
        { range: "36-45", min: 36, max: 45 },
        { range: "46-55", min: 46, max: 55 },
        { range: "56+", min: 56, max: 120 }
      ];

      const ageGroupsData = [];
      const currentYear = new Date().getFullYear();

      for (const group of ageGroups) {
        const birthYearMax = currentYear - group.min;
        const birthYearMin = currentYear - group.max;
        
        const clientQuery = new Parse.Query('Client');
        const birthYearStart = new Date(birthYearMin, 0, 1);
        const birthYearEnd = new Date(birthYearMax, 11, 31);
        
        clientQuery.greaterThanOrEqualTo('dob', birthYearStart);
        clientQuery.lessThanOrEqualTo('dob', birthYearEnd);
        
        const count = await clientQuery.count();
        
        ageGroupsData.push({
          range: group.range,
          count: count
        });
      }

      return {
        totalClients: totalClients,
        genderStats: genderStats,
        ageGroups: ageGroupsData
      };
    } catch (error) {
      console.error('Error fetching clients stats:', error);
      return {
        totalClients: 0,
        genderStats: { men: 0, women: 0, other: 0 },
        ageGroups: []
      };
    }
  }

  /**
   * Get appointments statistics for simplified dashboard
   */
  static async getAppointmentsStats() {
    try {
      const totalAppointments = await this.getTotalServiceRequests();
      
      // Get time slot statistics
      const withTimeSlotQuery = new Parse.Query('Appointment');
      withTimeSlotQuery.exists('scheduledTimestamp');
      const withTimeSlot = await withTimeSlotQuery.count();
      
      const withoutTimeSlot = totalAppointments - withTimeSlot;

      // Get meeting preferences
      const meetingPrefs = [
        { id: 0, name: 'inPerson' },
        { id: 1, name: 'online' },
        { id: 2, name: 'both' }
      ];

      const meetingPreferences = {};
      for (const pref of meetingPrefs) {
        const appointmentQuery = new Parse.Query('Appointment');
        appointmentQuery.equalTo('meetPref', pref.id);
        const count = await appointmentQuery.count();
        meetingPreferences[pref.name] = count;
      }

      // Get language preferences (simplified - would need more complex logic for actual implementation)
      const appointmentQuery = new Parse.Query('Appointment');
      appointmentQuery.limit(1000);
      const appointments = await appointmentQuery.find();
      
      const languagePreferences = {
        french: 0,
        english: 0,
        both: 0
      };

      appointments.forEach(appointment => {
        const langPref = appointment.get('langPref') || [];
        if (langPref.includes('French') && langPref.includes('English')) {
          languagePreferences.both++;
        } else if (langPref.includes('French')) {
          languagePreferences.french++;
        } else if (langPref.includes('English')) {
          languagePreferences.english++;
        } else {
          languagePreferences.english++; // Default to English
        }
      });

      return {
        totalAppointments: totalAppointments,
        timeSlotStats: {
          withTimeSlot: withTimeSlot,
          withoutTimeSlot: withoutTimeSlot
        },
        meetingPreferences: meetingPreferences,
        languagePreferences: languagePreferences
      };
    } catch (error) {
      console.error('Error fetching appointments stats:', error);
      return {
        totalAppointments: 0,
        timeSlotStats: { withTimeSlot: 0, withoutTimeSlot: 0 },
        meetingPreferences: { online: 0, inPerson: 0, both: 0 },
        languagePreferences: { french: 0, english: 0, both: 0 }
      };
    }
  }
}

export default DashboardService; 