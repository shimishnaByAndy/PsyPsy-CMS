import { useEffect } from 'react';
import ParseService from '../services/parseService';
import parseConfig from '../config/parseConfig';

/**
 * Component that initializes Parse when the app starts
 * This should be included near the top of your component tree
 */
const ParseInitializer = ({ children }) => {
  useEffect(() => {
    // Initialize Parse with the configuration
    ParseService.initialize(parseConfig);
    console.log('Parse initialized with environment-specific configuration');
  }, []);

  // This component doesn't render anything, it just initializes Parse
  return children || null;
};

export default ParseInitializer; 