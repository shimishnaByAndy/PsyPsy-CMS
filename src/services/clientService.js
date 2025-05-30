/**
 * Client Service - Handles client data operations with Parse Server integration
 * Based on ClassStructDocs schema for User and Client classes
 */

import Parse from 'parse';

/**
 * Client Service - Operations for client data management
 */
export const ClientService = {
  /**
   * Get clients with filtering, pagination, and search
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-based)
   * @param {number} params.limit - Number of items per page
   * @param {string} params.search - Search term for name or email
   * @param {string} params.sortBy - Field to sort by
   * @param {string} params.sortDirection - Sort direction ('asc' or 'desc')
   * @param {Object} params.filters - Additional filters (age, gender, etc.)
   * @returns {Promise<Object>} Object with results, total count, and pagination info
   */
  getClients: async ({
    page = 0,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    filters = {}
  } = {}) => {
    console.log('ClientService.getClients called with params:', {
      page, limit, search, sortBy, sortDirection, filters
    });

    try {
      // Get the current user and session token
      const currentUser = Parse.User.current();
      const sessionToken = currentUser ? currentUser.getSessionToken() : null;

      console.log('Current user:', currentUser ? currentUser.id : 'None');
      console.log('Session token:', sessionToken ? `${sessionToken.substring(0, 5)}...` : 'None');

      if (!currentUser || !sessionToken) {
        throw new Error('No authenticated user found - authentication required for clients');
      }

      // Try to fetch real data from Parse Server
      try {
        console.log('Attempting to fetch clients from Parse Server');
        
        // Create query for users with userType = 2 (clients)
        let userQuery = new Parse.Query(Parse.User);
        userQuery.equalTo('userType', 2);
        
        // Include the client pointer data
        userQuery.include('clientPtr');
        
        // Apply search if provided
        if (search) {
          const searchQueries = [];
          
          // Search in user fields
          const usernameQuery = new Parse.Query(Parse.User);
          usernameQuery.contains('username', search);
          searchQueries.push(usernameQuery);
          
          const emailQuery = new Parse.Query(Parse.User);
          emailQuery.contains('email', search);
          searchQueries.push(emailQuery);
          
          // Search in client fields (requires a separate query)
          const firstNameQuery = new Parse.Query('Client');
          firstNameQuery.contains('firstName', search);
          const lastNameQuery = new Parse.Query('Client');
          lastNameQuery.contains('lastName', search);
          
          const clientSearchQuery = Parse.Query.or(firstNameQuery, lastNameQuery);
          const userWithClientQuery = new Parse.Query(Parse.User);
          userWithClientQuery.matchesQuery('clientPtr', clientSearchQuery);
          searchQueries.push(userWithClientQuery);
          
          const combinedSearchQuery = Parse.Query.or(...searchQueries);
          userQuery = Parse.Query.and(userQuery, combinedSearchQuery);
        }
        
        // Apply sorting
        if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'email') {
          userQuery.addDescending(sortDirection === 'desc' ? sortBy : `-${sortBy}`);
        }
        
        // Apply pagination
        userQuery.skip(page * limit);
        userQuery.limit(limit);
        
        // Get total count
        const totalCount = await userQuery.count();
        
        // Fetch the results
        const users = await userQuery.find();
        
        console.log(`Found ${users.length} clients from Parse Server`);
        
        // Transform Parse objects to frontend-friendly format
        const transformedResults = users.map(user => {
          const clientPtr = user.get('clientPtr');
          
          return {
            id: user.id,
            objectId: user.id,
            username: user.get('username'),
            email: user.get('email'),
            emailVerified: user.get('emailVerified'),
            userType: user.get('userType'),
            roleNames: user.get('roleNames') || ['client'],
            isBlocked: user.get('isBlocked') || false,
            createdAt: user.get('createdAt'),
            updatedAt: user.get('updatedAt'),
            clientPtr: clientPtr ? {
              objectId: clientPtr.id,
              firstName: clientPtr.get('firstName'),
              lastName: clientPtr.get('lastName'),
              dob: clientPtr.get('dob'),
              gender: clientPtr.get('gender'),
              spokenLangArr: clientPtr.get('spokenLangArr') || [],
              phoneNb: clientPtr.get('phoneNb'),
              geoPt: clientPtr.get('geoPt'),
              addressObj: clientPtr.get('addressObj'),
              searchRadius: clientPtr.get('searchRadius'),
              createdAt: clientPtr.get('createdAt'),
              updatedAt: clientPtr.get('updatedAt')
            } : null
          };
        });
        
        return {
          results: transformedResults,
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        };
        
      } catch (parseError) {
        console.error('Parse Server fetch failed:', parseError);
        throw parseError;
      }
      
    } catch (error) {
      console.error('Error in ClientService.getClients:', error);
      throw error;
    }
  },

  /**
   * Get a single client by ID
   * @param {string} clientId - Client user ID
   * @returns {Promise<Object>} Client object with full details
   */
  getClientById: async (clientId) => {
    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('objectId', clientId);
      userQuery.include('clientPtr');
      
      const user = await userQuery.first();
      
      if (!user) {
        throw new Error(`Client with ID ${clientId} not found`);
      }
      
      const clientPtr = user.get('clientPtr');
      
      return {
        id: user.id,
        objectId: user.id,
        username: user.get('username'),
        email: user.get('email'),
        emailVerified: user.get('emailVerified'),
        userType: user.get('userType'),
        roleNames: user.get('roleNames') || ['client'],
        isBlocked: user.get('isBlocked') || false,
        createdAt: user.get('createdAt'),
        updatedAt: user.get('updatedAt'),
        clientPtr: clientPtr ? {
          objectId: clientPtr.id,
          firstName: clientPtr.get('firstName'),
          lastName: clientPtr.get('lastName'),
          dob: clientPtr.get('dob'),
          gender: clientPtr.get('gender'),
          spokenLangArr: clientPtr.get('spokenLangArr') || [],
          phoneNb: clientPtr.get('phoneNb'),
          geoPt: clientPtr.get('geoPt'),
          addressObj: clientPtr.get('addressObj'),
          searchRadius: clientPtr.get('searchRadius'),
          createdAt: clientPtr.get('createdAt'),
          updatedAt: clientPtr.get('updatedAt')
        } : null
      };
      
    } catch (error) {
      console.error(`Error fetching client ${clientId}:`, error);
      throw error;
    }
  }
};

export default ClientService; 