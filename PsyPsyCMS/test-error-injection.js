// Test Error Injection Script for CMS Debugger Validation
// This script will trigger specific error patterns to test our enhanced categorization

console.log('🧪 Starting Enhanced Error Pattern Testing...');

// Test 1: Hook Rules Violation (simulated)
setTimeout(() => {
    console.log('🔍 Testing HOOKS_RULES pattern...');
    console.error('Error: Invalid hook call. Hooks can only be called inside the body of a function component.');
}, 500);

// Test 2: State Mutation Error
setTimeout(() => {
    console.log('🔍 Testing STATE_MUTATION pattern...');
    console.error('TypeError: Cannot assign to read only property \'patientData\' of object');
}, 1000);

// Test 3: Missing Keys (React warning)
setTimeout(() => {
    console.log('🔍 Testing MISSING_KEYS pattern...');
    console.warn('Warning: Each child in a list should have a unique "key" prop for medical records');
}, 1500);

// Test 4: Memory Leak Error
setTimeout(() => {
    console.log('🔍 Testing MEMORY_LEAK pattern...');
    console.error('Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState.');
}, 2000);

// Test 5: Context Error
setTimeout(() => {
    console.log('🔍 Testing CONTEXT_ERROR pattern...');
    console.error('Error: useContext must be used within a AuthenticationProvider for protected medical routes');
}, 2500);

// Test 6: Async/Network Error
setTimeout(() => {
    console.log('🔍 Testing ASYNC_ERROR pattern...');
    console.error('NetworkError: Failed to fetch patient medical records from Firebase emulator');
}, 3000);

// Test 7: Authentication Error
setTimeout(() => {
    console.log('🔍 Testing AUTH_ERROR pattern...');
    console.error('AuthenticationError: Permission denied for accessing patient PHI data - 401 Unauthorized');
}, 3500);

// Test 8: DOM/Portal Error
setTimeout(() => {
    console.log('🔍 Testing DOM_ERROR pattern...');
    console.error('Error: Portal target container for medical alert modal not found in DOM');
}, 4000);

// Test 9: Hydration Error
setTimeout(() => {
    console.log('🔍 Testing HYDRATION_ERROR pattern...');
    console.error('Warning: Text content did not match. Server: "Loading patient..." Client: "Patient: John Doe"');
}, 4500);

// Test 10: Prop Types Error
setTimeout(() => {
    console.log('🔍 Testing PROP_TYPES pattern...');
    console.error('Warning: Failed prop type: Invalid prop `patientData` of type `string` supplied to `PatientCard`, expected `object`.');
}, 5000);

// Test 11: Lifecycle Error
setTimeout(() => {
    console.log('🔍 Testing LIFECYCLE_ERROR pattern...');
    console.error('Error: useEffect cleanup function failed: Cannot cancel patient data subscription after component unmount');
}, 5500);

// Summary
setTimeout(() => {
    console.log('✅ Enhanced Error Pattern Testing Complete');
    console.log('📊 Expected Results:');
    console.log('  • 11 different error patterns triggered');
    console.log('  • Healthcare impact assessments displayed');
    console.log('  • HIPAA/Quebec Law 25 compliance risk levels shown');
    console.log('  • Actionable suggestions provided');
    console.log('  • Error categorization with severity levels');
    console.log('  • WebSocket transmission to CMS Debugger (port 9223)');
}, 6000);