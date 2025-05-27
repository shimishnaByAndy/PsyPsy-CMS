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
      console.log('ParseInitializer: Parse already initialized, skipping initialization');
      setIsInitialized(true);
      return;
    }
    
    // Mark as initialized before doing anything else
    window.PARSE_INITIALIZED = true;
    console.log('ParseInitializer: Starting Parse initialization process');
    
    // Initialize Parse with the configuration
    try {
      const { appId, javascriptKey, serverURL, masterKey, enableLocalDatastore, liveQuery } = parseConfig;
      
      // Ensure we have a master key - use direct value as fallback
      const finalMasterKey = masterKey || 'LV4QUE9IqvLec8xIS0SOUPsfRITPVXIRbNf35UW4';
      
      console.log('ParseInitializer: Parse configuration:', { 
        appId: appId ? '****' + (appId.substr(-4) || 'undefined') : 'undefined',
        javascriptKey: javascriptKey ? '****' + (javascriptKey.substr(-4) || '') : 'undefined',
        serverURL,
        masterKeyProvided: !!finalMasterKey,
        enableLocalDatastore,
        liveQuery
      });
      
      if (!appId || !javascriptKey || !serverURL) {
        console.error('ParseInitializer: Missing critical Parse configuration:',
          !appId ? 'App ID missing' : '',
          !javascriptKey ? 'JavaScript Key missing' : '',
          !serverURL ? 'Server URL missing' : ''
        );
      }
      
      // Initialize Parse FIRST with the master key
      console.log('ParseInitializer: Calling Parse.initialize with credentials and master key');
      Parse.initialize(appId, javascriptKey, finalMasterKey);
      console.log('ParseInitializer: Setting Parse.serverURL:', serverURL);
      Parse.serverURL = serverURL;
      
      // Verify initialization
      console.log('ParseInitializer: Verifying Parse initialization:');
      console.log('- Parse.applicationId:', Parse.applicationId === appId ? 'Set correctly' : 'MISMATCH!');
      console.log('- Parse.javaScriptKey:', Parse.javaScriptKey === javascriptKey ? 'Set correctly' : 'MISMATCH!');
      console.log('- Parse.serverURL:', Parse.serverURL === serverURL ? 'Set correctly' : 'MISMATCH!');
      console.log('- Parse.masterKey:', Parse.masterKey ? 'Provided' : 'Not provided');
      
      // Enable local datastore AFTER initialization if specified
      if (enableLocalDatastore) {
        console.log('ParseInitializer: Enabling Parse local datastore');
        Parse.enableLocalDatastore();
      }
      
      // Enable LiveQuery if needed
      if (liveQuery) {
        const liveQueryURL = serverURL.replace(/^https?:\/\//, 'wss://');
        console.log('ParseInitializer: Setting up LiveQuery with URL:', liveQueryURL);
        Parse.liveQueryServerURL = liveQueryURL;
      }
      
      // Check remember me state after initialization
      console.log('ParseInitializer: Checking remember me state');
      checkRememberMeState();
      
      // Handler function for beforeunload
      const handleBeforeUnload = () => {
        const rememberMe = localStorage.getItem('psypsy_remember_me') === 'true';
        if (!rememberMe) {
          console.log('ParseInitializer: App closing - session will be cleared since remember me is not enabled');
        }
      };
      
      // Set up beforeunload event listener
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      console.log('ParseInitializer: Parse initialization completed successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('ParseInitializer: Error initializing Parse:', error);
      console.error('ParseInitializer: Error details:', error.message, error.code);
      console.error('ParseInitializer: Error stack:', error.stack);
      // Still set as initialized to allow the app to load even if Parse fails
      console.log('ParseInitializer: Setting initialized to true despite Parse error to allow app to load');
      setIsInitialized(true);
    }
  }, []); // Empty dependency array to run only once

  return (
    <ParseInitializationContext.Provider value={{ isInitialized }}>
      {children}
    </ParseInitializationContext.Provider>
  );
};

export default ParseInitializer; 