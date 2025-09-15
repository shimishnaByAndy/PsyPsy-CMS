/**
 * Test file for ClientService - Run this to verify the service is working
 * Usage: node src/test-client-service.js
 */

import { ClientService } from './services/clientService.js';

async function testClientService() {
  console.log('Testing ClientService...');
  
  try {
    // Test getting clients with default parameters
    console.log('\n1. Testing getClients with default parameters:');
    const result1 = await ClientService.getClients();
    console.log(`- Found ${result1.results.length} clients`);
    console.log(`- Total: ${result1.total}`);
    console.log(`- Page: ${result1.page}, Limit: ${result1.limit}`);
    if (result1.error) {
      console.log(`- Warning: ${result1.error}`);
    }
    
    // Test with search
    console.log('\n2. Testing getClients with search:');
    const result2 = await ClientService.getClients({
      search: 'Emma',
      limit: 5
    });
    console.log(`- Found ${result2.results.length} clients matching "Emma"`);
    
    // Test with filters
    console.log('\n3. Testing getClients with filters:');
    const result3 = await ClientService.getClients({
      filters: { gender: '1', ageRange: '25-34' },
      limit: 5
    });
    console.log(`- Found ${result3.results.length} clients with filters`);
    
    // Test pagination
    console.log('\n4. Testing pagination:');
    const result4 = await ClientService.getClients({
      page: 1,
      limit: 3
    });
    console.log(`- Page 1 results: ${result4.results.length} clients`);
    
    // Show sample client data structure
    if (result1.results.length > 0) {
      console.log('\n5. Sample client data structure:');
      const sampleClient = result1.results[0];
      console.log('- Client ID:', sampleClient.id);
      console.log('- Email:', sampleClient.email);
      console.log('- Client Name:', `${sampleClient.clientPtr?.firstName} ${sampleClient.clientPtr?.lastName}`);
      console.log('- Phone:', sampleClient.clientPtr?.phoneNb);
      console.log('- Location:', `${sampleClient.clientPtr?.addressObj?.city}, ${sampleClient.clientPtr?.addressObj?.province}`);
      console.log('- Languages:', sampleClient.clientPtr?.spokenLangArr);
    }
    
    console.log('\n✅ ClientService test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ ClientService test failed:', error);
  }
}

// Run the test
testClientService(); 