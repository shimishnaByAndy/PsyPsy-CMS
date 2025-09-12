/**
 * Parse Server Configuration Utilities
 * Centralized management of Parse Server options and security settings
 */

import Parse from 'parse';
import parseConfig from '../config/parseConfig';

/**
 * Determine if we're running in a server environment (Node.js/Cloud Functions)
 * vs client environment (browser/Electron)
 */
export const isServerEnvironment = () => {
  // Check if we're in Node.js environment
  if (typeof process !== 'undefined' && process.versions?.node) {
    // Further check if we're in a server context (not Electron main process)
    return !process.versions.electron && process.env.NODE_ENV !== 'development';
  }
  return false;
};

/**
 * Determine if we're running in Electron environment
 */
export const isElectronEnvironment = () => {
  return typeof process !== 'undefined' && process.versions?.electron;
};

/**
 * Get Parse Server options with proper master key configuration
 * @param {boolean} forceMasterKey - Force enable master key (use with caution)
 * @returns {Object} Parse Server options object
 */
export const getParseOptions = (forceMasterKey = false) => {
  const isServer = isServerEnvironment();
  const isElectron = isElectronEnvironment();
  
  // Base options - never use master key in client environments
  const baseOptions = {
    useMasterKey: false
  };
  
  // Only allow master key in true server environments and when explicitly forced
  if (isServer && (forceMasterKey || process.env.ALLOW_MASTER_KEY === 'true')) {
    baseOptions.useMasterKey = true;
  }
  
  // Log configuration for debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Parse options configuration:', {
      isServer,
      isElectron,
      useMasterKey: baseOptions.useMasterKey,
      forceMasterKey,
      environment: process.env.NODE_ENV
    });
  }
  
  return baseOptions;
};

/**
 * Validate Parse Server connection and configuration
 * @returns {Promise<Object>} Connection status and configuration info
 */
export const validateParseConnection = async () => {
  try {
    const currentUser = Parse.User.current();
    const isConnected = Parse.applicationId && Parse.serverURL;
    
    const status = {
      connected: isConnected,
      authenticated: !!currentUser,
      serverURL: Parse.serverURL,
      applicationId: Parse.applicationId ? '****' + Parse.applicationId.substr(-4) : 'undefined',
      environment: {
        isServer: isServerEnvironment(),
        isElectron: isElectronEnvironment(),
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    };
    
    // Test basic connectivity with a simple query
    if (isConnected) {
      try {
        const testQuery = new Parse.Query('_Installation');
        testQuery.limit(1);
        await testQuery.find(getParseOptions());
        status.queryTest = 'success';
      } catch (queryError) {
        status.queryTest = 'failed';
        status.queryError = queryError.message;
      }
    }
    
    return status;
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Safe Parse Server operation wrapper
 * Automatically applies correct options and handles common errors
 * @param {Function} operation - Parse Server operation to execute
 * @param {Object} options - Additional options
 * @returns {Promise} Operation result
 */
export const safeParseOperation = async (operation, options = {}) => {
  try {
    const parseOptions = getParseOptions(options.forceMasterKey);
    
    // Merge with any additional options
    const finalOptions = {
      ...parseOptions,
      ...options,
      // Ensure master key setting is preserved
      useMasterKey: parseOptions.useMasterKey
    };
    
    return await operation(finalOptions);
  } catch (error) {
    // Enhanced error handling with context
    const enhancedError = new Error(`Parse operation failed: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.parseContext = {
      isServer: isServerEnvironment(),
      isElectron: isElectronEnvironment(),
      useMasterKey: getParseOptions().useMasterKey
    };
    
    console.error('Parse operation error:', enhancedError.parseContext, error);
    throw enhancedError;
  }
};

/**
 * Initialize Parse with environment-appropriate configuration
 * @param {Object} customConfig - Optional custom configuration overrides
 */
export const initializeParse = (customConfig = {}) => {
  const config = {
    ...parseConfig,
    ...customConfig
  };
  
  try {
    Parse.initialize(config.appId, config.javascriptKey);
    Parse.serverURL = config.serverURL;
    
    // Configure additional Parse settings
    if (config.liveQuery) {
      Parse.liveQueryServerURL = config.liveQueryServerURL || config.serverURL.replace('http', 'ws');
    }
    
    if (config.enableLocalDatastore) {
      Parse.enableLocalDatastore();
    }
    
    console.log('Parse initialized successfully:', {
      appId: config.appId ? '****' + config.appId.substr(-4) : 'undefined',
      serverURL: config.serverURL,
      environment: isElectronEnvironment() ? 'Electron' : isServerEnvironment() ? 'Server' : 'Browser'
    });
    
    return true;
  } catch (error) {
    console.error('Parse initialization failed:', error);
    return false;
  }
};

const parseConfigUtils = {
  isServerEnvironment,
  isElectronEnvironment,
  getParseOptions,
  validateParseConnection,
  safeParseOperation,
  initializeParse
};

export default parseConfigUtils;