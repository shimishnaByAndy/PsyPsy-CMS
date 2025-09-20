/**
 * Test Firebase Authentication with Admin Account
 * Tests authentication flow with admin@psypsy.test account
 */

const http = require('http');

const TEST_ACCOUNT = {
  email: 'admin@psypsy.test',
  password: 'testpassword123',
  role: 'admin'
};

async function testAuthConnection() {
  console.log('🔐 Testing Firebase Authentication Connection...\n');

  // Test 1: Check Auth Emulator availability
  console.log('1. Testing Auth Emulator availability...');
  try {
    const authResponse = await new Promise((resolve, reject) => {
      const request = http.get('http://localhost:9880', (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve({ status: response.statusCode, data }));
      });
      request.on('error', reject);
      request.setTimeout(5000, () => reject(new Error('Timeout')));
    });

    console.log(`   ✅ Auth Emulator responding on port 9880 (Status: ${authResponse.status})`);
  } catch (error) {
    console.log(`   ❌ Auth Emulator connection failed: ${error.message}`);
    return;
  }

  // Test 2: Check Firestore Emulator availability
  console.log('\n2. Testing Firestore Emulator availability...');
  try {
    const firestoreResponse = await new Promise((resolve, reject) => {
      const request = http.get('http://localhost:9881', (response) => {
        resolve({ status: response.statusCode });
      });
      request.on('error', reject);
      request.setTimeout(5000, () => reject(new Error('Timeout')));
    });

    console.log(`   ✅ Firestore Emulator responding on port 9881 (Status: ${firestoreResponse.status})`);
  } catch (error) {
    console.log(`   ❌ Firestore Emulator connection failed: ${error.message}`);
    return;
  }

  // Test 3: Test REST API auth endpoint (if available)
  console.log('\n3. Testing Auth REST API endpoint...');
  try {
    const authEndpoint = 'http://localhost:9880/www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword';
    const authPayload = JSON.stringify({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password,
      returnSecureToken: true
    });

    const authResult = await new Promise((resolve, reject) => {
      const postData = authPayload;
      const options = {
        hostname: 'localhost',
        port: 9880,
        path: '/www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const request = http.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({ status: response.statusCode, data: result });
          } catch (e) {
            resolve({ status: response.statusCode, data: data });
          }
        });
      });

      request.on('error', reject);
      request.setTimeout(10000, () => reject(new Error('Timeout')));
      request.write(postData);
      request.end();
    });

    if (authResult.status === 200 && authResult.data.idToken) {
      console.log(`   ✅ Authentication successful for ${TEST_ACCOUNT.email}`);
      console.log(`   📝 ID Token received (length: ${authResult.data.idToken.length})`);
    } else {
      console.log(`   ⚠️  Auth response status: ${authResult.status}`);
      console.log(`   📄 Response: ${JSON.stringify(authResult.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ Auth REST API test failed: ${error.message}`);
  }

  console.log('\n✨ Firebase authentication test completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Launch the CMS application: npm run tauri:dev');
  console.log('   2. Test login with admin@psypsy.test / testpassword123');
  console.log('   3. Verify tables populate with emulator data');
}

testAuthConnection().catch(console.error);