/**
 * Parse server integration service
 */

import Parse from 'parse';

// Default connection parameters
// Replace these with your actual Parse Server details
const DEFAULT_APP_ID = 'your_app_id';
const DEFAULT_SERVER_URL = 'https://your-parse-server.com/parse';
const DEFAULT_JAVASCRIPT_KEY = 'your_javascript_key';
const DEFAULT_MASTER_KEY = 'your_master_key'; // Only use in secure environments

// Keys for localStorage
const REMEMBER_ME_KEY = 'psypsy_remember_me';
const SESSION_TOKEN_KEY = 'Parse/sessionToken';

/**
 * Initializes Parse with the given parameters
 * @param {Object} options - Parse initialization options
 * @param {string} options.appId - Your Parse app ID
 * @param {string} options.serverURL - URL to your Parse server
 * @param {string} options.javascriptKey - JavaScript key for your Parse app
 * @param {boolean} options.enableLocalDatastore - Whether to enable local datastore (defaults to false)
 * @param {boolean} options.liveQuery - Whether to enable LiveQuery
 * @returns {Object} Parse instance
 */
export const initializeParse = (options = {}) => {
  const {
    appId = DEFAULT_APP_ID,
    serverURL = DEFAULT_SERVER_URL,
    javascriptKey = DEFAULT_JAVASCRIPT_KEY,
    enableLocalDatastore = false,
    liveQuery = false,
  } = options;

  // Enable local datastore if specified
  if (enableLocalDatastore) {
    Parse.enableLocalDatastore();
  }

  // Initialize Parse
  Parse.initialize(appId, javascriptKey);
  Parse.serverURL = serverURL;

  // Enable LiveQuery if needed
  if (liveQuery) {
    Parse.liveQueryServerURL = serverURL.replace(/^https?:\/\//, 'wss://');
  }

  // Check if we need to restore a session
  checkRememberMeState();

  console.log('Parse initialized with appId:', appId);
  return Parse;
};

/**
 * Checks if the user should be remembered and handles session state accordingly
 */
const checkRememberMeState = () => {
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  
  // If remember me is not set, clear any existing session
  if (!rememberMe) {
    const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (sessionToken) {
      console.log('Remember me not set, clearing session');
      localStorage.removeItem(SESSION_TOKEN_KEY);
      // Parse's internal state will be updated on next initialization
    }
  }
};

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
      
      // If remember me is false, add event listener to clear session on window close
      if (!rememberMe) {
        window.addEventListener('beforeunload', () => {
          localStorage.removeItem(SESSION_TOKEN_KEY);
        });
      }
      
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

// Export Parse instance for direct usage if needed
export { Parse };

// Default export with all services
export default {
  initialize: initializeParse,
  Auth: ParseAuth,
  Data: ParseData,
  Parse,
}; 