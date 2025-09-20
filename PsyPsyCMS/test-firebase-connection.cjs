/**
 * Test Firebase Emulator Connection
 * Simple Node.js script to test if Firebase emulators are accessible
 */

const http = require('http');

const tests = [
  {
    name: 'Auth Emulator',
    url: 'http://localhost:9880',
    expectedStatus: 400 // Auth emulator returns 400 for basic GET requests
  },
  {
    name: 'Firestore Emulator',
    url: 'http://localhost:9881',
    expectedStatus: [200, 404] // Firestore accepts various status codes
  },
  {
    name: 'Functions Emulator (helloWorld)',
    url: 'http://localhost:5001/psypsy-dev-local/us-east4/helloWorld',
    expectedStatus: [200, 405] // Functions may return different codes
  },
  {
    name: 'Emulator UI',
    url: 'http://localhost:8782',
    expectedStatus: 200
  }
];

async function testConnection(test) {
  return new Promise((resolve) => {
    const request = http.get(test.url, (response) => {
      const isExpected = Array.isArray(test.expectedStatus)
        ? test.expectedStatus.includes(response.statusCode)
        : response.statusCode === test.expectedStatus;

      resolve({
        ...test,
        status: response.statusCode,
        success: isExpected,
        message: isExpected ? '✅ Connected' : `❌ Unexpected status: ${response.statusCode}`
      });
    });

    request.on('error', (error) => {
      resolve({
        ...test,
        success: false,
        message: `❌ Connection failed: ${error.message}`
      });
    });

    request.setTimeout(5000, () => {
      resolve({
        ...test,
        success: false,
        message: '❌ Timeout after 5 seconds'
      });
    });
  });
}

async function runTests() {
  console.log('🔥 Testing Firebase Emulator Connections...\n');

  for (const test of tests) {
    const result = await testConnection(test);
    console.log(`${result.name}: ${result.message}`);
    if (result.status) {
      console.log(`   Status: ${result.status}`);
    }
    console.log('');
  }

  console.log('✨ Firebase emulator connection test completed!');
}

runTests().catch(console.error);