/**
 * Client Service - Handles client data operations with Parse Server integration
 * Based on ClassStructDocs schema for User and Client classes
 */

import Parse from 'parse';

// Helper function to create mock client data for development/testing
const createMockClients = (count = 20) => {
  console.log('Creating mock client data for development');
  
  const firstNames = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
    'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
    'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
    'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery', 'David'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
  ];

  const languages = [
    ['English'], ['French'], ['English', 'French'], ['English', 'Spanish'],
    ['French', 'Spanish'], ['English', 'French', 'Spanish']
  ];

  const cities = [
    'Montreal', 'Toronto', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton',
    'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'
  ];

  return Array.from({ length: count }).map((_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@example.com`;
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${index + 1}`;
    
    // Generate realistic birth date (18-80 years old)
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (18 + Math.floor(Math.random() * 62));
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dob = new Date(birthYear, birthMonth, birthDay);
    
    // Generate phone number
    const phoneNb = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    
    // Generate address
    const city = cities[Math.floor(Math.random() * cities.length)];
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln'];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    
    const addressObj = {
      street: `${streetNumber} ${streetName}`,
      city: city,
      province: city === 'Montreal' || city === 'Quebec City' ? 'QC' : 'ON',
      postalCode: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}`,
      country: 'Canada'
    };

    // Generate coordinates near major Canadian cities
    const baseCoords = {
      'Montreal': { lat: 45.5017, lng: -73.5673 },
      'Toronto': { lat: 43.6532, lng: -79.3832 },
      'Vancouver': { lat: 49.2827, lng: -123.1207 },
      'Calgary': { lat: 51.0447, lng: -114.0719 },
      'Ottawa': { lat: 45.4215, lng: -75.6972 }
    };
    
    const baseCoord = baseCoords[city] || baseCoords['Toronto'];
    const geoPt = {
      latitude: baseCoord.lat + (Math.random() - 0.5) * 0.1,
      longitude: baseCoord.lng + (Math.random() - 0.5) * 0.1
    };

    const now = new Date();
    const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    const updatedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * (now.getTime() - createdAt.getTime())));

    return {
      // User fields
      id: `client-user-${index + 1}`,
      objectId: `client-user-${index + 1}`,
      username: username,
      email: email,
      emailVerified: Math.random() > 0.1, // 90% verified
      userType: 2, // Client type
      roleNames: ['client'],
      isBlocked: Math.random() > 0.95, // 5% blocked
      createdAt: createdAt,
      updatedAt: updatedAt,
      
      // Client pointer data (clientPtr)
      clientPtr: {
        objectId: `client-${index + 1}`,
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        gender: Math.floor(Math.random() * 4) + 1, // 1-4 as per schema
        spokenLangArr: languages[Math.floor(Math.random() * languages.length)],
        phoneNb: phoneNb,
        geoPt: geoPt,
        addressObj: addressObj,
        searchRadius: 10 + Math.floor(Math.random() * 40), // 10-50 km
        createdAt: createdAt,
        updatedAt: updatedAt
      }
    };
  });
};

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
        console.warn('No authenticated user found - using mock data');
        const mockClients = createMockClients(limit * 5); // Create more for pagination
        const startIndex = page * limit;
        const endIndex = startIndex + limit;
        
        let filteredClients = mockClients;
        
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredClients = filteredClients.filter(client => 
            client.clientPtr.firstName.toLowerCase().includes(searchLower) ||
            client.clientPtr.lastName.toLowerCase().includes(searchLower) ||
            client.email.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply additional filters
        if (filters.gender && filters.gender !== 'all') {
          filteredClients = filteredClients.filter(client => 
            client.clientPtr.gender === parseInt(filters.gender)
          );
        }
        
        if (filters.ageRange) {
          const currentYear = new Date().getFullYear();
          filteredClients = filteredClients.filter(client => {
            const age = currentYear - new Date(client.clientPtr.dob).getFullYear();
            switch (filters.ageRange) {
              case '18-24': return age >= 18 && age <= 24;
              case '25-34': return age >= 25 && age <= 34;
              case '35-44': return age >= 35 && age <= 44;
              case '45-54': return age >= 45 && age <= 54;
              case '55-64': return age >= 55 && age <= 64;
              case '65+': return age >= 65;
              default: return true;
            }
          });
        }
        
        // Apply sorting
        filteredClients.sort((a, b) => {
          let aValue, bValue;
          
          switch (sortBy) {
            case 'name':
              aValue = `${a.clientPtr.firstName} ${a.clientPtr.lastName}`;
              bValue = `${b.clientPtr.firstName} ${b.clientPtr.lastName}`;
              break;
            case 'age':
              aValue = new Date().getFullYear() - new Date(a.clientPtr.dob).getFullYear();
              bValue = new Date().getFullYear() - new Date(b.clientPtr.dob).getFullYear();
              break;
            case 'email':
              aValue = a.email;
              bValue = b.email;
              break;
            case 'createdAt':
            default:
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
              break;
          }
          
          if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        const paginatedClients = filteredClients.slice(startIndex, endIndex);
        
        return {
          results: paginatedClients,
          total: filteredClients.length,
          page,
          limit,
          totalPages: Math.ceil(filteredClients.length / limit),
          error: 'Using mock data - no authenticated session'
        };
      }

      // Try to fetch real data from Parse Server
      try {
        console.log('Attempting to fetch clients from Parse Server');
        
        // Create query for users with userType = 2 (clients)
        const userQuery = new Parse.Query(Parse.User);
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
          const clientQuery = new Parse.Query('Client');
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
        const totalCount = await userQuery.count({ useMasterKey: true });
        
        // Fetch the results
        const users = await userQuery.find({ useMasterKey: true });
        
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
        console.log('Falling back to mock data...');
        
        // Fallback to mock data
        const mockClients = createMockClients(limit * 3);
        const startIndex = page * limit;
        const endIndex = startIndex + limit;
        const paginatedClients = mockClients.slice(startIndex, endIndex);
        
        return {
          results: paginatedClients,
          total: mockClients.length,
          page,
          limit,
          totalPages: Math.ceil(mockClients.length / limit),
          error: `Parse Server error: ${parseError.message}`
        };
      }
      
    } catch (error) {
      console.error('Error in ClientService.getClients:', error);
      
      // Final fallback to mock data
      const mockClients = createMockClients(limit);
      return {
        results: mockClients,
        total: mockClients.length,
        page,
        limit,
        totalPages: Math.ceil(mockClients.length / limit),
        error: error.message
      };
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
      
      const user = await userQuery.first({ useMasterKey: true });
      
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