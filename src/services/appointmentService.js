/**
 * AppointmentService - Service for managing appointment data
 * Handles Parse Server integration for Appointment class
 * Based on Appointment class structure from ClassStructDocs
 */

import Parse from 'parse';

/**
 * Get appointments with pagination, filtering, and sorting
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (0-based)
 * @param {number} options.limit - Number of items per page
 * @param {string} options.search - Search term
 * @param {string} options.sortBy - Field to sort by
 * @param {string} options.sortDirection - Sort direction ('asc' or 'desc')
 * @param {Object} options.filters - Filter options
 * @returns {Promise<Object>} Paginated appointment results
 */
const getAppointments = async ({
  page = 0,
  limit = 10,
  search = '',
  sortBy = 'createdAt',
  sortDirection = 'desc',
  filters = {}
} = {}) => {
  console.log('AppointmentService.getAppointments called with:', {
    page, limit, search, sortBy, sortDirection, filters
  });

  try {
    // Check for authenticated session
    const currentUser = Parse.User.current();
    const sessionToken = currentUser ? currentUser.getSessionToken() : null;

    console.log('Current user:', currentUser ? currentUser.id : 'None');
    console.log('Session token:', sessionToken ? `${sessionToken.substring(0, 5)}...` : 'None');

    if (!currentUser || !sessionToken) {
      throw new Error('No authenticated user found - authentication required for appointments');
    }

    // Create query for Appointment class
    let appointmentQuery = new Parse.Query('Appointment');
    
    // Include related objects (Client and User pointers)
    appointmentQuery.include(['clientPtr', 'profilePtr']);
    
    // Apply search filter
    if (search && search.trim() !== '') {
      const searchQueries = [];
      
      // Search in appointment fields
      const titleQuery = new Parse.Query('Appointment');
      titleQuery.contains('title', search);
      searchQueries.push(titleQuery);
      
      const descriptionQuery = new Parse.Query('Appointment');
      descriptionQuery.contains('description', search);
      searchQueries.push(descriptionQuery);
      
      const statusQuery = new Parse.Query('Appointment');
      statusQuery.contains('status', search);
      searchQueries.push(statusQuery);
      
      const noteQuery = new Parse.Query('Appointment');
      noteQuery.contains('clientNoteMsg', search);
      searchQueries.push(noteQuery);
      
      // Search in related client data
      const clientFirstNameQuery = new Parse.Query('Client');
      clientFirstNameQuery.contains('firstName', search);
      const clientLastNameQuery = new Parse.Query('Client');
      clientLastNameQuery.contains('lastName', search);
      
      const clientSearchQuery = Parse.Query.or(clientFirstNameQuery, clientLastNameQuery);
      const appointmentWithClientQuery = new Parse.Query('Appointment');
      appointmentWithClientQuery.matchesQuery('profilePtr', clientSearchQuery);
      searchQueries.push(appointmentWithClientQuery);
      
      // Search in user email
      const userQuery = new Parse.Query(Parse.User);
      userQuery.contains('email', search);
      const appointmentWithUserQuery = new Parse.Query('Appointment');
      appointmentWithUserQuery.matchesQuery('clientPtr', userQuery);
      searchQueries.push(appointmentWithUserQuery);
      
      // Combine search queries
      appointmentQuery = Parse.Query.or(...searchQueries);
      appointmentQuery.include(['clientPtr', 'profilePtr']);
    }

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      appointmentQuery.equalTo('status', filters.status);
    }

    if (filters.serviceType && filters.serviceType !== 'all') {
      appointmentQuery.equalTo('serviceType', parseInt(filters.serviceType));
    }

    if (filters.meetPref && filters.meetPref !== 'all') {
      appointmentQuery.equalTo('meetPref', parseInt(filters.meetPref));
    }

    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let filterDate = new Date(now);
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          appointmentQuery.greaterThanOrEqualTo('createdAt', filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          appointmentQuery.greaterThanOrEqualTo('createdAt', filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          appointmentQuery.greaterThanOrEqualTo('createdAt', filterDate);
          break;
        default:
          // No date filter applied
          break;
      }
    }

    if (filters.applicationStatus && filters.applicationStatus !== 'all') {
      switch (filters.applicationStatus) {
        case 'none':
          appointmentQuery.equalTo('applicationCount', 0);
          break;
        case 'few':
          appointmentQuery.greaterThanOrEqualTo('applicationCount', 1);
          appointmentQuery.lessThanOrEqualTo('applicationCount', 2);
          break;
        case 'many':
          appointmentQuery.greaterThanOrEqualTo('applicationCount', 3);
          break;
        default:
          // No application status filter applied
          break;
      }
    }

    // Apply sorting
    if (sortDirection === 'desc') {
      appointmentQuery.descending(sortBy);
    } else {
      appointmentQuery.ascending(sortBy);
    }

    // Apply pagination
    appointmentQuery.skip(page * limit);
    appointmentQuery.limit(limit);

    // Get total count first (without pagination)
    const countQuery = new Parse.Query('Appointment');
    // Apply the same filters to count query
    if (search && search.trim() !== '') {
      const searchQueries = [];
      const titleQuery = new Parse.Query('Appointment');
      titleQuery.contains('title', search);
      searchQueries.push(titleQuery);
      
      const descriptionQuery = new Parse.Query('Appointment');
      descriptionQuery.contains('description', search);
      searchQueries.push(descriptionQuery);
      
      const statusQuery = new Parse.Query('Appointment');
      statusQuery.contains('status', search);
      searchQueries.push(statusQuery);
      
      const noteQuery = new Parse.Query('Appointment');
      noteQuery.contains('clientNoteMsg', search);
      searchQueries.push(noteQuery);
      
      Parse.Query.or(...searchQueries).count().then(count => {
        // Use this count
      });
    }
    
    if (filters.status && filters.status !== 'all') {
      countQuery.equalTo('status', filters.status);
    }
    if (filters.serviceType && filters.serviceType !== 'all') {
      countQuery.equalTo('serviceType', parseInt(filters.serviceType));
    }
    if (filters.meetPref && filters.meetPref !== 'all') {
      countQuery.equalTo('meetPref', parseInt(filters.meetPref));
    }
    
    const totalCount = await countQuery.count();
    
    // Execute the main query
    const appointments = await appointmentQuery.find();
    
    console.log(`Found ${appointments.length} appointments from Parse Server`);

    // Transform Parse objects to frontend-friendly format
    const transformedResults = appointments.map(appointment => {
      const clientPtr = appointment.get('clientPtr');
      const profilePtr = appointment.get('profilePtr');
      
      // Get client name and email from related objects
      let clientName = 'Unknown Client';
      let clientEmail = '';
      
      if (profilePtr) {
        const firstName = profilePtr.get('firstName') || '';
        const lastName = profilePtr.get('lastName') || '';
        clientName = `${firstName} ${lastName}`.trim() || 'Unknown Client';
      }
      
      if (clientPtr) {
        clientEmail = clientPtr.get('email') || '';
      }

      return {
        id: appointment.id,
        objectId: appointment.id,
        title: appointment.get('title'),
        description: appointment.get('description'),
        status: appointment.get('status'),
        serviceType: appointment.get('serviceType'),
        meetPref: appointment.get('meetPref'),
        genderPref: appointment.get('genderPref'),
        clientAgeGroup: appointment.get('clientAgeGroup'),
        maxBudget: appointment.get('maxBudget'),
        searchRadius: appointment.get('searchRadius'),
        isForClient: appointment.get('isForClient'),
        afterDate: appointment.get('afterDate'),
        scheduledTimestamp: appointment.get('scheduledTimestamp'),
        dateTime: appointment.get('dateTime'),
        applicationCount: appointment.get('applicationCount') || 0,
        appliedProfIds: appointment.get('appliedProfIds') || [],
        consultReasonsArr: appointment.get('consultReasonsArr') || [],
        expertisesIndArr: appointment.get('expertisesIndArr') || [],
        langPref: appointment.get('langPref') || [],
        thirdPartyPayer: appointment.get('thirdPartyPayer'),
        clientNoteMsg: appointment.get('clientNoteMsg'),
        tppObj: appointment.get('tppObj'),
        availArr: appointment.get('availArr') || [],
        clientAddress: appointment.get('clientAddress'),
        concernedPers: appointment.get('concernedPers'),
        noAvailPref: appointment.get('noAvailPref'),
        clientCancelled: appointment.get('clientCancelled'),
        createdAt: appointment.get('createdAt'),
        updatedAt: appointment.get('updatedAt'),
        
        // Frontend display fields
        clientName: clientName,
        clientEmail: clientEmail,
        
        // Pointer references
        clientPtr: clientPtr ? {
          objectId: clientPtr.id,
          email: clientPtr.get('email'),
          username: clientPtr.get('username')
        } : null,
        profilePtr: profilePtr ? {
          objectId: profilePtr.id,
          firstName: profilePtr.get('firstName'),
          lastName: profilePtr.get('lastName'),
          dob: profilePtr.get('dob'),
          gender: profilePtr.get('gender'),
          phoneNb: profilePtr.get('phoneNb')
        } : null
      };
    });

    return {
      results: transformedResults,
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: (page + 1) * limit < totalCount,
      hasPrevPage: page > 0
    };

  } catch (error) {
    console.error('Error in AppointmentService.getAppointments:', error);
    throw error;
  }
};

/**
 * Get a single appointment by ID
 * @param {string} appointmentId - The appointment's ID
 * @returns {Promise<Object>} Appointment data
 */
const getAppointmentById = async (appointmentId) => {
  console.log('AppointmentService.getAppointmentById called with ID:', appointmentId);
  
  try {
    // Check for authenticated session
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const appointmentQuery = new Parse.Query('Appointment');
    appointmentQuery.equalTo('objectId', appointmentId);
    appointmentQuery.include(['clientPtr', 'profilePtr']);
    
    const appointment = await appointmentQuery.first();
    
    if (!appointment) {
      throw new Error(`Appointment with ID ${appointmentId} not found`);
    }

    const clientPtr = appointment.get('clientPtr');
    const profilePtr = appointment.get('profilePtr');
    
    // Get client name and email
    let clientName = 'Unknown Client';
    let clientEmail = '';
    
    if (profilePtr) {
      const firstName = profilePtr.get('firstName') || '';
      const lastName = profilePtr.get('lastName') || '';
      clientName = `${firstName} ${lastName}`.trim() || 'Unknown Client';
    }
    
    if (clientPtr) {
      clientEmail = clientPtr.get('email') || '';
    }

    return {
      id: appointment.id,
      objectId: appointment.id,
      title: appointment.get('title'),
      description: appointment.get('description'),
      status: appointment.get('status'),
      serviceType: appointment.get('serviceType'),
      meetPref: appointment.get('meetPref'),
      genderPref: appointment.get('genderPref'),
      clientAgeGroup: appointment.get('clientAgeGroup'),
      maxBudget: appointment.get('maxBudget'),
      searchRadius: appointment.get('searchRadius'),
      isForClient: appointment.get('isForClient'),
      afterDate: appointment.get('afterDate'),
      scheduledTimestamp: appointment.get('scheduledTimestamp'),
      dateTime: appointment.get('dateTime'),
      applicationCount: appointment.get('applicationCount') || 0,
      appliedProfIds: appointment.get('appliedProfIds') || [],
      consultReasonsArr: appointment.get('consultReasonsArr') || [],
      expertisesIndArr: appointment.get('expertisesIndArr') || [],
      langPref: appointment.get('langPref') || [],
      thirdPartyPayer: appointment.get('thirdPartyPayer'),
      clientNoteMsg: appointment.get('clientNoteMsg'),
      tppObj: appointment.get('tppObj'),
      availArr: appointment.get('availArr') || [],
      clientAddress: appointment.get('clientAddress'),
      concernedPers: appointment.get('concernedPers'),
      noAvailPref: appointment.get('noAvailPref'),
      clientCancelled: appointment.get('clientCancelled'),
      createdAt: appointment.get('createdAt'),
      updatedAt: appointment.get('updatedAt'),
      
      // Frontend display fields
      clientName: clientName,
      clientEmail: clientEmail,
      
      // Pointer references
      clientPtr: clientPtr ? {
        objectId: clientPtr.id,
        email: clientPtr.get('email'),
        username: clientPtr.get('username')
      } : null,
      profilePtr: profilePtr ? {
        objectId: profilePtr.id,
        firstName: profilePtr.get('firstName'),
        lastName: profilePtr.get('lastName'),
        dob: profilePtr.get('dob'),
        gender: profilePtr.get('gender'),
        phoneNb: profilePtr.get('phoneNb')
      } : null
    };
    
  } catch (error) {
    console.error('Error in AppointmentService.getAppointmentById:', error);
    throw error;
  }
};

/**
 * Helper function to get service type name
 * @param {number} serviceTypeCode - Service type code
 * @returns {string} Service type name
 */
const getServiceTypeName = (serviceTypeCode) => {
  const serviceTypeMap = {
    0: 'Individual Therapy',
    1: 'Group Therapy',
    2: 'Couples Therapy',
    3: 'Family Therapy',
    4: 'Psychological Assessment',
    5: 'Neuropsychological Assessment',
    6: 'Career Counseling',
    7: 'Addiction Counseling'
  };
  return serviceTypeMap[serviceTypeCode] || 'Unknown';
};

/**
 * Helper function to get status display info
 * @param {string} status - Status code
 * @returns {Object} Status display info with label and color
 */
const getStatusInfo = (status) => {
  const statusMap = {
    'requested': { label: 'Requested', color: 'warning' },
    'matched': { label: 'Matched', color: 'info' },
    'confirmed': { label: 'Confirmed', color: 'success' },
    'completed': { label: 'Completed', color: 'primary' },
    'cancelled': { label: 'Cancelled', color: 'error' },
    'no_show': { label: 'No Show', color: 'error' }
  };
  return statusMap[status] || { label: status, color: 'default' };
};

/**
 * Helper function to format currency
 * @param {number} amount - Amount in CAD
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  if (!amount) return 'Not specified';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount);
};

/**
 * Helper function to format date and time
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date and time
 */
const formatDateTime = (timestamp) => {
  if (!timestamp) return 'Not scheduled';
  const date = new Date(timestamp);
  return date.toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get appointment statistics for dashboard
 * @returns {Promise<Object>} Appointment statistics
 */
const getAppointmentStats = async () => {
  try {
    // Check for authenticated session
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    // Create base query
    const baseQuery = new Parse.Query('Appointment');

    // Get total count
    const total = await baseQuery.count();

    // Get status counts
    const statuses = ['requested', 'matched', 'confirmed', 'completed', 'cancelled'];
    const statusCounts = {};

    for (const status of statuses) {
      const statusQuery = new Parse.Query('Appointment');
      statusQuery.equalTo('status', status);
      statusCounts[status] = await statusQuery.count();
    }

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCreatedQuery = new Parse.Query('Appointment');
    todayCreatedQuery.greaterThanOrEqualTo('createdAt', today);
    const todayCreated = await todayCreatedQuery.count();

    const todayScheduledQuery = new Parse.Query('Appointment');
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    todayScheduledQuery.greaterThanOrEqualTo('scheduledTimestamp', today.getTime());
    todayScheduledQuery.lessThanOrEqualTo('scheduledTimestamp', todayEnd.getTime());
    const todayScheduled = await todayScheduledQuery.count();

    // Get application stats
    const withApplicationsQuery = new Parse.Query('Appointment');
    withApplicationsQuery.greaterThan('applicationCount', 0);
    const withApplications = await withApplicationsQuery.count();

    const withoutApplicationsQuery = new Parse.Query('Appointment');
    withoutApplicationsQuery.equalTo('applicationCount', 0);
    const withoutApplications = await withoutApplicationsQuery.count();

    const stats = {
      total: total,
      requested: statusCounts.requested || 0,
      matched: statusCounts.matched || 0,
      confirmed: statusCounts.confirmed || 0,
      completed: statusCounts.completed || 0,
      cancelled: statusCounts.cancelled || 0,
      
      // Today's stats
      today: {
        created: todayCreated,
        scheduled: todayScheduled
      },
      
      // Application stats
      withApplications: withApplications,
      withoutApplications: withoutApplications
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    throw error;
  }
};

/**
 * Check if Parse Server is available
 * @returns {Promise<boolean>} True if Parse Server is available
 */
const isParseServerAvailable = async () => {
  try {
    // Check if we have a current user session
    const currentUser = Parse.User.current();
    return !!currentUser;
  } catch (error) {
    console.log('Parse Server check failed:', error.message);
    return false;
  }
};

const AppointmentService = {
  getAppointments,
  getAppointmentById,
  getAppointmentStats,
  getServiceTypeName,
  getStatusInfo,
  formatCurrency,
  formatDateTime,
  isParseServerAvailable
};

export { AppointmentService };
export default AppointmentService; 