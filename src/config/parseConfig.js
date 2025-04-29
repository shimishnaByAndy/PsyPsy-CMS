/**
 * Parse Server configuration
 */

// Configuration setup - reads values from environment variables or uses defaults
const devConfig = {
    // Replace these with your actual Parse Server details
    appId: process.env.REACT_APP_PARSE_APP_ID,
    serverURL: 'http://10.0.0.71:1337/parse',
    javascriptKey: process.env.REACT_APP_PARSE_JS_KEY,
    liveQuery: false,
    enableLocalDatastore: true
};

const prodConfig = {
    appId: process.env.REACT_APP_PARSE_APP_ID,
    serverURL: process.env.REACT_APP_PARSE_SERVER_URL,
    javascriptKey: process.env.REACT_APP_PARSE_JS_KEY,
    liveQuery: true,
    enableLocalDatastore: false
};
  

// Use development or production configuration based on environment
const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

export default config; 