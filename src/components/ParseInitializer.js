import { useEffect, useState, createContext, useContext } from 'react';
import Parse from 'parse';
import ParseService, { checkRememberMeState } from '../services/parseService';
import parseConfig from '../config/parseConfig';

// Create context to track Parse initialization state
export const ParseInitializationContext = createContext({
  isInitialized: false
});

/**
 * Hook to access Parse initialization state
 */
export const useParseInitialization = () => useContext(ParseInitializationContext);

// Global flag to prevent multiple initializations
window.PARSE_INITIALIZED = window.PARSE_INITIALIZED || false;

/**
 * Component that initializes Parse when the app starts
 * This should be included near the top of your component tree
 */
const ParseInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(window.PARSE_INITIALIZED);

  useEffect(() => {
    // Return early if already initialized to prevent any possibility of loops
    if (window.PARSE_INITIALIZED) {
      setIsInitialized(true);
      return;
    }
    
    // Mark as initialized before doing anything else
    window.PARSE_INITIALIZED = true;
    
    // Initialize Parse with the configuration
    try {
      const { appId, javascriptKey, serverURL, masterKey, enableLocalDatastore, liveQuery } = parseConfig;
      
      // Initialize Parse FIRST
      Parse.initialize(appId, javascriptKey, masterKey);
      Parse.serverURL = serverURL;
      
      // Enable local datastore AFTER initialization if specified
      if (enableLocalDatastore) {
        Parse.enableLocalDatastore();
      }
      
      // Enable LiveQuery if needed
      if (liveQuery) {
        Parse.liveQueryServerURL = serverURL.replace(/^https?:\/\//, 'wss://');
      }
      
      // Check remember me state after initialization
      checkRememberMeState();
      
      // Handler function for beforeunload
      const handleBeforeUnload = () => {
        const rememberMe = localStorage.getItem('psypsy_remember_me') === 'true';
        if (!rememberMe) {
          console.log('App closing - session will be cleared since remember me is not enabled');
        }
      };
      
      // Set up beforeunload event listener
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      console.log('Parse initialized with environment-specific configuration');
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing Parse:', error);
    }
  }, []); // Empty dependency array to run only once

  return (
    <ParseInitializationContext.Provider value={{ isInitialized }}>
      {children}
    </ParseInitializationContext.Provider>
  );
};

export default ParseInitializer; 