// Quick test to verify professionals API is working
import { invoke } from '@tauri-apps/api/core';

async function testProfessionalsAPI() {
    try {
        console.log('Testing get_professionals command...');

        const response = await invoke('get_professionals', {
            page: 1,
            limit: 10,
            filters: null,
            sort: null
        });

        console.log('✅ get_professionals response:', response);

        if (response.success && response.data) {
            console.log(`✅ Successfully retrieved ${response.data.data.length} professionals`);
            console.log('✅ First professional:', response.data.data[0]?.profile?.first_name || 'N/A');

            // Test search functionality
            const searchResponse = await invoke('search_professionals', {
                query: 'Sarah',
                limit: 5
            });

            console.log('✅ search_professionals response:', searchResponse);
            console.log(`✅ Search found ${searchResponse.data?.length || 0} professionals`);

            // Test stats
            const statsResponse = await invoke('get_professional_stats');
            console.log('✅ get_professional_stats response:', statsResponse);

            return { success: true, message: 'All tests passed!' };
        } else {
            return { success: false, message: 'No data returned' };
        }
    } catch (error) {
        console.error('❌ API test failed:', error);
        return { success: false, message: error.toString() };
    }
}

// Export for use in browser console or test runner
window.testProfessionalsAPI = testProfessionalsAPI;

// Auto-run test if in development
if (import.meta.env.DEV) {
    console.log('🧪 Running Professionals API test...');
    testProfessionalsAPI().then(result => {
        console.log('🧪 Test result:', result);
    });
}