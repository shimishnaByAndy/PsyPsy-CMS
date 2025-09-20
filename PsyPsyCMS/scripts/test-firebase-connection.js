#!/usr/bin/env node

/**
 * Firebase Connection Test Script
 *
 * Tests connectivity to Firebase emulators and functions
 */

import fetch from 'node-fetch';

const EMULATOR_ENDPOINTS = {
  'Emulator UI': 'http://127.0.0.1:8782',
  'Auth Emulator': 'http://127.0.0.1:9880',
  'Functions Emulator': 'http://127.0.0.1:8780/psypsy-dev-local/us-east4/helloWorld',
  'Firestore Emulator': 'http://127.0.0.1:9881'
};

const DIRECT_EMULATOR_ENDPOINTS = {
  'Auth Emulator Status': 'http://127.0.0.1:9880',
  'Firestore Emulator Status': 'http://127.0.0.1:9881'
};

async function testEndpoint(name, url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      timeout: 5000,
      headers: {
        'User-Agent': 'Firebase-Test-Script'
      }
    });

    const status = response.status;
    const statusText = response.statusText;

    if (status >= 200 && status < 400) {
      console.log(`✅ ${name}: Connected (${status})`);
      return true;
    } else {
      console.log(`⚠️  ${name}: Responding but with status ${status} ${statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Connection failed - ${error.message}`);
    return false;
  }
}

async function testHelloWorldFunction() {
  console.log('\n🔍 Testing Firebase Functions...');

  try {
    const response = await fetch('http://127.0.0.1:8780/psypsy-dev-local/us-east4/helloWorld', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: {} })
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      let result;

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Handle plain text response (like "Hello from Firebase!")
        result = await response.text();
      }

      console.log('✅ Firebase Functions: Working');
      console.log('📋 Function Response:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ Firebase Functions: Failed (${response.status})`);
      console.log('📋 Error:', errorText);
      return false;
    }
  } catch (error) {
    console.log(`❌ Firebase Functions: Connection failed - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Firebase Emulator Connection Test\n');

  let allConnected = true;

  // Test basic endpoints
  for (const [name, url] of Object.entries(EMULATOR_ENDPOINTS)) {
    const connected = await testEndpoint(name, url);
    allConnected = allConnected && connected;
  }

  // Test Firebase Functions specifically
  const functionsWorking = await testHelloWorldFunction();
  allConnected = allConnected && functionsWorking;

  console.log('\n📊 Test Summary:');
  if (allConnected) {
    console.log('🎉 All Firebase emulators are running and accessible!');
    console.log('💡 Your React app should now be able to connect to Firebase emulators.');
  } else {
    // Check specific emulator statuses for better guidance
    const authWorking = await testEndpoint('Auth Test', 'http://127.0.0.1:9880');
    const functionsWorkingTest = functionsWorking;
    const firestoreWorking = await testEndpoint('Firestore Test', 'http://127.0.0.1:9881');

    console.log('⚠️  Some emulators are not responding correctly.');
    console.log('\n📝 Current Status:');
    console.log(`   • Functions: ${functionsWorkingTest ? '✅ Working' : '❌ Not working'}`);
    console.log(`   • Auth: ${authWorking ? '✅ Working' : '❌ Not working'}`);
    console.log(`   • Firestore: ${firestoreWorking ? '✅ Working' : '❌ Not working'}`);

    if (!firestoreWorking && (functionsWorkingTest || authWorking)) {
      console.log('\n💡 Firestore Emulator Notes:');
      console.log('   • Functions and Auth are working - sufficient for most development');
      console.log('   • App will use offline Firestore cache when emulator unavailable');
      console.log('   • To start Firestore: firebase emulators:start --only firestore');
    } else {
      console.log('\n💡 Make sure Firebase emulators are started with: firebase emulators:start');
    }
  }

  console.log('\n🔧 Debugging Tips:');
  console.log('• Check Emulator UI: http://127.0.0.1:8782/');
  console.log('• Restart emulators: firebase emulators:start');
  console.log('• Check environment: npm run switch:status');
  console.log('• View logs in browser console when testing the app');
}

main().catch(console.error);