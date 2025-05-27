#!/usr/bin/env node

/**
 * Script to create an admin user in the Parse Server database
 * Usage: node scripts/createAdmin.js
 */

const Parse = require('parse/node');

// Parse Server configuration (matching the React app config)
const parseConfig = {
    appId: process.env.REACT_APP_PARSE_APP_ID || 'psypsy-cms-dev',
    serverURL: process.env.REACT_APP_PARSE_SERVER_URL || 'http://10.0.0.71:1337/parse',
    javascriptKey: process.env.REACT_APP_PARSE_JS_KEY || 'psypsy-js-key-dev',
    masterKey: process.env.REACT_APP_MASTER_KEY || 'psypsy-master-key-dev'
};

// Initialize Parse
Parse.initialize(parseConfig.appId, parseConfig.javascriptKey, parseConfig.masterKey);
Parse.serverURL = parseConfig.serverURL;

/**
 * Creates an admin user with the specified credentials
 */
async function createAdminUser() {
    try {
        console.log('🚀 Starting admin user creation...');
        console.log('📡 Connecting to Parse Server:', parseConfig.serverURL);
        
        // Admin user details
        const adminData = {
            username: 'andy@admin.ca',
            email: 'andy@admin.ca',
            password: 'aaaaaa',
            userType: 0, // Admin type
            roleNames: ['admin'],
            emailVerified: true,
            isBlocked: false
        };
        
        // Check if user already exists
        console.log('🔍 Checking if admin user already exists...');
        const existingUserQuery = new Parse.Query(Parse.User);
        existingUserQuery.equalTo('username', adminData.username);
        
        try {
            const existingUser = await existingUserQuery.first({ useMasterKey: true });
            if (existingUser) {
                console.log('⚠️  Admin user already exists with ID:', existingUser.id);
                console.log('📧 Email:', existingUser.get('email'));
                console.log('👤 User Type:', existingUser.get('userType'));
                console.log('🏷️  Role Names:', existingUser.get('roleNames'));
                return existingUser;
            }
        } catch (error) {
            // User doesn't exist, continue with creation
            console.log('✅ No existing admin user found, proceeding with creation...');
        }
        
        // Create new admin user using Parse SDK
        console.log('👤 Creating new admin user using Parse SDK...');
        const user = new Parse.User();
        
        // Set user properties
        user.set('username', adminData.username);
        user.set('email', adminData.email);
        user.set('password', adminData.password);
        user.set('userType', adminData.userType);
        user.set('roleNames', adminData.roleNames);
        user.set('emailVerified', adminData.emailVerified);
        user.set('isBlocked', adminData.isBlocked);
        
        // Sign up the user (this is the proper way to create users)
        const savedUser = await user.signUp();
        
        console.log('🎉 Admin user created successfully!');
        console.log('📋 User Details:');
        console.log('   ID:', savedUser.id);
        console.log('   Username:', savedUser.get('username'));
        console.log('   Email:', savedUser.get('email'));
        console.log('   User Type:', savedUser.get('userType'));
        console.log('   Role Names:', savedUser.get('roleNames'));
        console.log('   Email Verified:', savedUser.get('emailVerified'));
        console.log('   Created At:', savedUser.get('createdAt'));
        
        // Note: We don't create an Admin class object since the documentation
        // shows that admins are identified by userType: 0 and roleNames: ['admin']
        // The adminPtr field would point to an Admin class object if it existed
        
        return savedUser;
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        
        if (error.code === 202) {
            console.error('💡 This usually means the username is already taken.');
        } else if (error.code === 203) {
            console.error('💡 This usually means the email is already taken.');
        } else if (error.code === 101) {
            console.error('💡 Invalid username/password format or user already exists.');
        } else if (error.code === 1) {
            console.error('💡 Internal server error. Check if Parse Server is running.');
        }
        
        throw error;
    }
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🔧 Parse Configuration:');
        console.log('   App ID:', parseConfig.appId);
        console.log('   Server URL:', parseConfig.serverURL);
        console.log('   Master Key:', parseConfig.masterKey ? '✅ Provided' : '❌ Missing');
        console.log('');
        
        await createAdminUser();
        
        console.log('');
        console.log('✅ Admin creation completed successfully!');
        console.log('🔐 You can now login with:');
        console.log('   Username: andy@admin.ca');
        console.log('   Password: aaaaaa');
        
    } catch (error) {
        console.error('');
        console.error('❌ Failed to create admin user:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { createAdminUser }; 