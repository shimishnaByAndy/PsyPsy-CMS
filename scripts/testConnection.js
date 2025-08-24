#!/usr/bin/env node

/**
 * Script to test Parse Server connection and configuration
 */

const Parse = require('parse/node');

// Different possible configurations to try
const configs = [
    {
        name: 'Default Dev Config',
        appId: 'psypsy-cms-dev',
        serverURL: 'http://localhost:1337/parse',
        javascriptKey: 'psypsy-js-key-dev',
        masterKey: 'psypsy-master-key-dev'
    },
    {
        name: 'Localhost Config',
        appId: 'psypsy-cms-dev',
        serverURL: 'http://localhost:1337/parse',
        javascriptKey: 'psypsy-js-key-dev',
        masterKey: 'psypsy-master-key-dev'
    },
    {
        name: 'Alternative Dev Config',
        appId: 'myAppId',
        serverURL: 'http://localhost:1337/parse',
        javascriptKey: 'myJavaScriptKey',
        masterKey: 'myMasterKey'
    }
];

async function testConfig(config) {
    try {
        console.log(`\n🧪 Testing configuration: ${config.name}`);
        console.log(`   Server URL: ${config.serverURL}`);
        console.log(`   App ID: ${config.appId}`);
        
        // Initialize Parse with this config
        Parse.initialize(config.appId, config.javascriptKey, config.masterKey);
        Parse.serverURL = config.serverURL;
        
        // Try to perform a simple query
        const query = new Parse.Query(Parse.User);
        query.limit(1);
        
        const result = await query.find({ useMasterKey: true });
        console.log(`   ✅ Success! Found ${result.length} users`);
        
        return config;
        
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        return null;
    }
}

async function main() {
    console.log('🔍 Testing Parse Server connections...');
    
    for (const config of configs) {
        const workingConfig = await testConfig(config);
        if (workingConfig) {
            console.log(`\n🎉 Found working configuration: ${workingConfig.name}`);
            console.log('You can use this configuration to create the admin user.');
            return workingConfig;
        }
    }
    
    console.log('\n❌ No working configuration found.');
    console.log('Please check:');
    console.log('1. Parse Server is running');
    console.log('2. Server URL is correct');
    console.log('3. App ID and keys are correct');
    console.log('4. Network connectivity');
}

if (require.main === module) {
    main();
} 