import { useEffect, useState, createContext, useContext } from 'react';
import ParseService from '../services/parseService';
import parseConfig from '../config/parseConfig';

// Create context to track Parse initialization state
export const ParseInitializationContext = createContext({
  isInitialized: false
});

/**
 * Hook to access Parse initialization state
 */
export const useParseInitialization = () => useContext(ParseInitializationContext);

/**
 * Component that initializes Parse when the app starts
 * This should be included near the top of your component tree
 */
const ParseInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Parse with the configuration
    try {
      ParseService.initialize(parseConfig);
      
      // Set up beforeunload event listener to handle session clearing when app closes
      // This will run if the user didn't check "remember me"
      window.addEventListener('beforeunload', () => {
        const rememberMe = localStorage.getItem('psypsy_remember_me') === 'true';
        if (!rememberMe) {
          // We don't need to manually clear here - the listener in loginWithRememberMe will handle it
          console.log('App closing - session will be cleared since remember me is not enabled');
        }
      });
      
      console.log('Parse initialized with environment-specific configuration');
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing Parse:', error);
    }
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', () => {});
    };
  }, []);

  return (
    <ParseInitializationContext.Provider value={{ isInitialized }}>
      {children}
    </ParseInitializationContext.Provider>
  );
};

export default ParseInitializer; 