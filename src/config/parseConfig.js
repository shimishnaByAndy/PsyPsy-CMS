/**
 * Parse Server configuration
 */

// Configuration setup - reads values from environment variables or uses defaults
const devConfig = {
    // These should be the actual Parse Server details
    appId: process.env.REACT_APP_PARSE_APP_ID,
    serverURL: 'http://10.0.0.71:1337/parse',
    javascriptKey: process.env.REACT_APP_PARSE_JS_KEY,
    liveQuery: false,
    enableLocalDatastore: true,
    masterKey: process.env.REACT_APP_MASTER_KEY
};

const prodConfig = {
    appId: process.env.REACT_APP_PARSE_APP_ID,
    serverURL: process.env.REACT_APP_PARSE_SERVER_URL,
    javascriptKey: process.env.REACT_APP_PARSE_JS_KEY,
    liveQuery: true,
    enableLocalDatastore: false,
    masterKey: process.env.REACT_APP_MASTER_KEY
};
  

// Use development or production configuration based on environment
const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

// Log the config being used (without sensitive keys)
console.log('Parse config being used:', {
  appId: config.appId ? '****' + config.appId.substr(-4) : 'undefined',
  serverURL: config.serverURL,
  javascriptKey: config.javascriptKey ? '****' : 'undefined',
  masterKeyProvided: !!config.masterKey,
  liveQuery: config.liveQuery,
  enableLocalDatastore: config.enableLocalDatastore
});

export default config; 