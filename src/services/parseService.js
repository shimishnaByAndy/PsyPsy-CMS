/**
 * Parse server integration service
 */

import Parse from 'parse';

// Keys for localStorage
const REMEMBER_ME_KEY = 'psypsy_remember_me';
const SESSION_TOKEN_KEY = 'Parse/sessionToken';

/**
 * Checks if the user should be remembered and handles session state accordingly
 */
export const checkRememberMeState = () => {
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  
  // If remember me is not checked, clear the session immediately on app load
  if (!rememberMe) {
    clearUserSession();
    console.log('Remember me not enabled, cleared previous session');
  } else {
    console.log('Remember me is enabled, keeping session');
  }
};

/**
 * Clears the user session completely
 */
export const clearUserSession = () => {
  // Remove session token from localStorage
  localStorage.removeItem(SESSION_TOKEN_KEY);
  
  // Also try to log out the current user if Parse is initialized
  try {
    if (Parse.User.current()) {
      Parse.User.logOut();
    }
  } catch (e) {
    console.log('Parse not initialized yet, session token removed from storage');
  }
};

// Run the remember me check when this module loads
// This should happen after Parse is initialized elsewhere
setTimeout(() => {
  checkRememberMeState();
}, 0);

/**
 * User authentication methods
 */
export const ParseAuth = {
  /**
   * Registers a new user
   * @param {string} username - Username for new user
   * @param {string} email - Email for new user
   * @param {string} password - Password for new user
   * @returns {Promise<Parse.User>} Parse User object
   */
  register: async (username, email, password) => {
    const user = new Parse.User();
    user.set('username', username);
    user.set('email', email);
    user.set('password', password);
    
    try {
      const result = await user.signUp();
      console.log('User registered successfully');
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  /**
   * Logs in a user
   * @param {string} username - Username 
   * @param {string} password - Password
   * @returns {Promise<Parse.User>} Parse User object
   */
  login: async (username, password) => {
    try {
      const user = await Parse.User.logIn(username, password);
      console.log('User logged in successfully');
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  /**
   * Logs in a user with remember me option
   * @param {string} username - Username 
   * @param {string} password - Password
   * @param {boolean} rememberMe - Whether to remember the user's session
   * @returns {Promise<Parse.User>} Parse User object
   */
  loginWithRememberMe: async (username, password, rememberMe = false) => {
    try {
      const user = await Parse.User.logIn(username, password);
      
      // Store the remember me preference in localStorage
      localStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
      console.log(`User logged in successfully with remember me: ${rememberMe}`);
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  /**
   * Logs out the current user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      localStorage.removeItem(REMEMBER_ME_KEY);
      await Parse.User.logOut();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  /**
   * Gets the current user
   * @returns {Parse.User | null} Current user or null if no user is logged in
   */
  getCurrentUser: () => {
    return Parse.User.current();
  },

  /**
   * Checks if a user is logged in
   * @returns {boolean} True if a user is logged in
   */
  isLoggedIn: () => {
    try {
      return !!Parse.User.current();
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  /**
   * Requests a password reset for the specified email
   * @param {string} email - Email address
   * @returns {Promise<void>}
   */
  requestPasswordReset: async (email) => {
    try {
      await Parse.User.requestPasswordReset(email);
      console.log('Password reset request sent');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }
};

/**
 * Data manipulation methods
 */
export const ParseData = {
  /**
   * Creates a new object of the specified class
   * @param {string} className - Parse class name
   * @param {Object} data - Data to save
   * @returns {Promise<Parse.Object>} Parse Object
   */
  create: async (className, data) => {
    const ParseObject = Parse.Object.extend(className);
    const object = new ParseObject();
    
    Object.keys(data).forEach(key => {
      object.set(key, data[key]);
    });
    
    try {
      const result = await object.save();
      console.log(`${className} created successfully`);
      return result;
    } catch (error) {
      console.error(`Error creating ${className}:`, error);
      throw error;
    }
  },

  /**
   * Gets an object by ID
   * @param {string} className - Parse class name
   * @param {string} objectId - Object ID
   * @returns {Promise<Parse.Object>} Parse Object
   */
  getById: async (className, objectId) => {
    const ParseObject = Parse.Object.extend(className);
    const query = new Parse.Query(ParseObject);
    
    try {
      const result = await query.get(objectId);
      return result;
    } catch (error) {
      console.error(`Error getting ${className} with ID ${objectId}:`, error);
      throw error;
    }
  },

  /**
   * Updates an object
   * @param {string} className - Parse class name
   * @param {string} objectId - Object ID
   * @param {Object} data - New data
   * @returns {Promise<Parse.Object>} Updated Parse Object
   */
  update: async (className, objectId, data) => {
    try {
      const object = await ParseData.getById(className, objectId);
      
      Object.keys(data).forEach(key => {
        object.set(key, data[key]);
      });
      
      const result = await object.save();
      console.log(`${className} updated successfully`);
      return result;
    } catch (error) {
      console.error(`Error updating ${className} with ID ${objectId}:`, error);
      throw error;
    }
  },

  /**
   * Deletes an object
   * @param {string} className - Parse class name
   * @param {string} objectId - Object ID
   * @returns {Promise<boolean>} True if successful
   */
  delete: async (className, objectId) => {
    try {
      const object = await ParseData.getById(className, objectId);
      await object.destroy();
      console.log(`${className} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${className} with ID ${objectId}:`, error);
      throw error;
    }
  },

  /**
   * Queries objects from a class
   * @param {string} className - Parse class name
   * @param {Object} conditions - Query conditions
   * @param {number} limit - Maximum number of results to return (default 100)
   * @param {number} skip - Number of results to skip (for pagination)
   * @param {string} sortBy - Field to sort by
   * @param {boolean} ascending - Sort direction (true for ascending, false for descending)
   * @returns {Promise<Parse.Object[]>} Array of Parse Objects
   */
  query: async (className, conditions = {}, limit = 100, skip = 0, sortBy = 'createdAt', ascending = false) => {
    const ParseObject = Parse.Object.extend(className);
    const query = new Parse.Query(ParseObject);
    
    // Apply conditions
    Object.entries(conditions).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        if (value.operator === 'contains') {
          query.contains(key, value.value);
        } else if (value.operator === 'startsWith') {
          query.startsWith(key, value.value);
        } else if (value.operator === 'endsWith') {
          query.endsWith(key, value.value);
        } else if (value.operator === 'lessThan') {
          query.lessThan(key, value.value);
        } else if (value.operator === 'greaterThan') {
          query.greaterThan(key, value.value);
        } else if (value.operator === 'in') {
          query.containedIn(key, value.value);
        } else {
          query.equalTo(key, value);
        }
      } else {
        query.equalTo(key, value);
      }
    });
    
    // Apply pagination
    query.limit(limit);
    query.skip(skip);
    
    // Apply sorting
    if (sortBy) {
      if (ascending) {
        query.ascending(sortBy);
      } else {
        query.descending(sortBy);
      }
    }
    
    try {
      const results = await query.find();
      return results;
    } catch (error) {
      console.error(`Error querying ${className}:`, error);
      throw error;
    }
  }
};

/**
 * User management service - Read-only operations
 */
export const UserService = {
  /**
   * Get users with filtering by type and search
   * @param {string} userType - Filter by user type ('all', 'professionals', 'clients', 'admins')
   * @param {number} page - Page number for pagination (0-based)
   * @param {number} limit - Number of items per page
   * @param {string} search - Search term for username or email
   * @param {string} sortBy - Field to sort by
   * @param {string} sortDirection - Sort direction ('asc' or 'desc')
   * @returns {Promise<Object>} Object with results, total count, and pagination info
   */
  getUsers: async (
    userType = 'all',
    page = 0,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortDirection = 'desc'
  ) => {
    const query = new Parse.Query(Parse.User);
    
    // Apply user type filter
    if (userType !== 'all') {
      const userTypeMap = {
        'professionals': 1,
        'clients': 2,
        'admins': 0
      };
      query.equalTo('userType', userTypeMap[userType]);
    }
    
    // Apply search if provided
    if (search) {
      const usernameQuery = new Parse.Query(Parse.User);
      usernameQuery.matches('username', new RegExp(search, 'i'));
      
      const emailQuery = new Parse.Query(Parse.User);
      emailQuery.matches('email', new RegExp(search, 'i'));
      
      const mainQuery = Parse.Query.or(usernameQuery, emailQuery);
      query._orQuery([mainQuery]);
    }
    
    // Include pointers based on user type
    query.include('professionalPtr');
    query.include('clientPtr');
    query.include('adminPtr');
    
    // Apply pagination
    query.limit(limit);
    query.skip(page * limit);
    
    // Apply sorting
    if (sortDirection === 'asc') {
      query.ascending(sortBy);
    } else {
      query.descending(sortBy);
    }
    
    try {
      // Use master key for querying users
      const results = await query.find({ useMasterKey: true });
      const count = await query.count({ useMasterKey: true });
      
      // Transform results to frontend-friendly format
      const transformedResults = results.map(user => UserService.transformUserObject(user));
      
      return {
        results: transformedResults,
        total: count,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  /**
   * Get a user by ID
   * @param {string} userId - User ID to fetch
   * @returns {Promise<Object>} User object with related data
   */
  getUserById: async (userId) => {
    const query = new Parse.Query(Parse.User);
    query.equalTo('objectId', userId);
    
    // Include related objects
    query.include('professionalPtr');
    query.include('clientPtr');
    query.include('adminPtr');
    
    try {
      // Use master key for querying users
      const user = await query.first({ useMasterKey: true });
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      return UserService.transformUserObject(user);
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * Transform Parse User object to frontend-friendly format
   * @param {Parse.User} parseUser - Parse User object
   * @returns {Object} Transformed user object
   */
  transformUserObject: (parseUser) => {
    const user = {
      id: parseUser.id,
      username: parseUser.get('username'),
      email: parseUser.get('email'),
      emailVerified: parseUser.get('emailVerified'),
      userType: parseUser.get('userType'),
      createdAt: parseUser.get('createdAt'),
      updatedAt: parseUser.get('updatedAt'),
      isBlocked: parseUser.get('isBlocked') || false,
      roleNames: parseUser.get('roleNames') || []
    };
    
    // Add professional data if available
    if (parseUser.get('userType') === 1 && parseUser.get('professionalPtr')) {
      const professional = parseUser.get('professionalPtr');
      user.professional = {
        id: professional.id,
        firstName: professional.get('firstName'),
        lastName: professional.get('lastName'),
        profType: professional.get('profType'),
        businessName: professional.get('businessName'),
        servOfferedArr: professional.get('servOfferedArr') || [],
        offeredLangArr: professional.get('offeredLangArr') || [],
        meetType: professional.get('meetType'),
        expertises: professional.get('expertises') || [],
        bussEmail: professional.get('bussEmail'),
        bussPhoneNb: professional.get('bussPhoneNb')
      };
    }
    
    // Add client data if available
    if (parseUser.get('userType') === 2 && parseUser.get('clientPtr')) {
      const client = parseUser.get('clientPtr');
      user.client = {
        id: client.id,
        firstName: client.get('firstName'),
        lastName: client.get('lastName'),
        dob: client.get('dob'),
        gender: client.get('gender'),
        spokenLangArr: client.get('spokenLangArr') || [],
        phoneNb: client.get('phoneNb'),
        searchRadius: client.get('searchRadius')
      };
      
      // Add geolocation if available
      if (client.get('geoPt')) {
        user.client.location = {
          latitude: client.get('geoPt').latitude,
          longitude: client.get('geoPt').longitude
        };
      }
      
      // Add address if available
      if (client.get('addressObj')) {
        user.client.address = client.get('addressObj');
      }
    }
    
    return user;
  }
};

// Export Parse instance for direct usage if needed
export { Parse };

// Default export with all services
export default {
  Auth: ParseAuth,
  Data: ParseData,
  User: UserService,
  Parse,
}; 