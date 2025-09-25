// Error Testing Component for CMS Debugger Validation
// This component intentionally triggers different React error patterns
// to test our enhanced healthcare-specific error categorization

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@nextui-org/react';
import { HealthcareCard } from '@/components/ui/healthcare/HealthcareCard';

interface Patient {
  id: string;
  name: string;
  ssn: string;
  medicalHistory: string[];
}

// Test component that intentionally triggers various React errors
export const ErrorTestingComponent: React.FC = () => {
  const [testType, setTestType] = useState<string>('');
  const [patients, setPatients] = useState<Patient[]>([]);

  // Auto-run a few test errors on component mount for validation
  useEffect(() => {
    console.log('🧪 CMS Debugger Error Testing Component loaded');

    // Trigger a few test errors to validate our enhanced categorization
    setTimeout(() => {
      console.log('🧪 Auto-testing AUTH_ERROR pattern...');
      console.error('Authentication failed: Permission denied for accessing patient PHI data - 401 Unauthorized');
    }, 1000);

    setTimeout(() => {
      console.log('🧪 Auto-testing HOOKS_RULES pattern...');
      console.error('Error: Invalid hook call. Hooks can only be called inside the body of a function component.');
    }, 2000);

    setTimeout(() => {
      console.log('🧪 Auto-testing ASYNC_ERROR pattern...');
      console.error('Network error: Failed to fetch patient medical records from Firebase');
    }, 3000);

    setTimeout(() => {
      console.log('🧪 Auto-testing CONTEXT_ERROR pattern...');
      console.error('Error: useContext must be used within a AuthenticationProvider for protected medical routes');
    }, 4000);

    setTimeout(() => {
      console.log('✅ Auto-testing complete - Check console and WebSocket for enhanced categorization');
    }, 5000);
  }, []);

  // Test 1: Hook Rules Violation (calling hook conditionally)
  const triggerHookError = () => {
    console.log('🧪 Testing Hook Rules Violation...');
    try {
      if (Math.random() > 0.5) {
        // This will trigger: "Invalid hook call" or "Hooks can only be called"
        const [badState] = useState('invalid'); // Hook called conditionally
      }
    } catch (error) {
      console.error('Hook error triggered:', error);
    }
  };

  // Test 2: State Mutation Error
  const triggerStateMutationError = () => {
    console.log('🧪 Testing State Mutation Error...');
    try {
      // Directly mutating props - this should trigger our STATE_MUTATION pattern
      const patientData: any = { name: 'John Doe', readonly: true };
      Object.defineProperty(patientData, 'name', { writable: false });
      patientData.name = 'Modified Name'; // This will throw "cannot assign to read only property"
    } catch (error) {
      console.error('State mutation error triggered:', error);
    }
  };

  // Test 3: Missing Keys Error (common in medical lists)
  const triggerMissingKeysError = () => {
    console.log('🧪 Testing Missing Keys Error...');
    // Render list without keys - this should show in console as warning
    const patientList = [
      { id: '1', name: 'Patient A', ssn: '123-45-6789' },
      { id: '2', name: 'Patient B', ssn: '987-65-4321' },
      { id: '3', name: 'Patient C', ssn: '555-44-3333' }
    ];

    // This will trigger React warning about missing keys
    setPatients(patientList);
    console.warn('Warning: Each child in a list should have a unique "key" prop for medical records');
  };

  // Test 4: Memory Leak / Infinite Render Error
  const triggerMemoryLeakError = () => {
    console.log('🧪 Testing Memory Leak Error...');
    try {
      // Simulate infinite re-renders
      console.error('Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.');
    } catch (error) {
      console.error('Memory leak error triggered:', error);
    }
  };

  // Test 5: Prop Types Validation Error
  const triggerPropTypesError = () => {
    console.log('🧪 Testing Prop Validation Error...');
    try {
      // Simulate prop type validation failure
      console.error('Warning: Failed prop type: Invalid prop `patientData` of type `string` supplied to `PatientCard`, expected `object`.');
    } catch (error) {
      console.error('Prop types error triggered:', error);
    }
  };

  // Test 6: Context Error (missing provider)
  const triggerContextError = () => {
    console.log('🧪 Testing Context Error...');
    try {
      // Simulate context usage outside provider
      throw new Error('useContext must be used within a AuthenticationProvider for protected medical routes');
    } catch (error) {
      console.error('Context error triggered:', error);
    }
  };

  // Test 7: Async/Network Error
  const triggerAsyncError = () => {
    console.log('🧪 Testing Async/Network Error...');
    try {
      // Simulate network failure for medical data
      throw new Error('Network error: Failed to fetch patient medical records from Firebase');
    } catch (error) {
      console.error('Async error triggered:', error);
    }
  };

  // Test 8: Authentication/Security Error
  const triggerAuthError = () => {
    console.log('🧪 Testing Authentication Error...');
    try {
      // Simulate authentication failure
      throw new Error('Authentication failed: Permission denied for accessing patient PHI data - 401 Unauthorized');
    } catch (error) {
      console.error('Auth error triggered:', error);
    }
  };

  // Test 9: DOM/Portal Error
  const triggerDOMError = () => {
    console.log('🧪 Testing DOM/Portal Error...');
    try {
      // Simulate portal mount point missing
      throw new Error('Portal: Target container for medical alert modal not found in DOM');
    } catch (error) {
      console.error('DOM error triggered:', error);
    }
  };

  // Test 10: Hydration Error (SSR mismatch)
  const triggerHydrationError = () => {
    console.log('🧪 Testing Hydration Error...');
    try {
      // Simulate hydration mismatch
      console.error('Warning: Text content did not match. Server: "Loading patient data..." Client: "Patient: John Doe"');
    } catch (error) {
      console.error('Hydration error triggered:', error);
    }
  };

  // Test 11: Lifecycle Error
  const triggerLifecycleError = () => {
    console.log('🧪 Testing Lifecycle Error...');
    try {
      // Simulate cleanup issue
      throw new Error('useEffect cleanup function failed: Cannot cancel patient data subscription after component unmount');
    } catch (error) {
      console.error('Lifecycle error triggered:', error);
    }
  };

  return (
    <HealthcareCard className="p-6 max-w-4xl mx-auto mt-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            🧪 React Error Testing Suite
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Healthcare-specific error pattern validation for CMS Debugger
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-800">
              ⚠️ This component intentionally triggers React errors to test our enhanced error categorization system.
              Each error includes healthcare impact and compliance risk assessments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button
            onClick={triggerHookError}
            variant="destructive"
            className="text-xs py-2"
          >
            Hook Rules Error
          </Button>

          <Button
            onClick={triggerStateMutationError}
            variant="destructive"
            className="text-xs py-2"
          >
            State Mutation
          </Button>

          <Button
            onClick={triggerMissingKeysError}
            variant="outline"
            className="text-xs py-2"
          >
            Missing Keys
          </Button>

          <Button
            onClick={triggerMemoryLeakError}
            variant="destructive"
            className="text-xs py-2"
          >
            Memory Leak
          </Button>

          <Button
            onClick={triggerPropTypesError}
            variant="outline"
            className="text-xs py-2"
          >
            Prop Validation
          </Button>

          <Button
            onClick={triggerContextError}
            variant="destructive"
            className="text-xs py-2"
          >
            Context Error
          </Button>

          <Button
            onClick={triggerAsyncError}
            variant="destructive"
            className="text-xs py-2"
          >
            Network Error
          </Button>

          <Button
            onClick={triggerAuthError}
            variant="destructive"
            className="text-xs py-2 bg-red-600"
          >
            Auth Error
          </Button>

          <Button
            onClick={triggerDOMError}
            variant="outline"
            className="text-xs py-2"
          >
            DOM/Portal
          </Button>

          <Button
            onClick={triggerHydrationError}
            variant="outline"
            className="text-xs py-2"
          >
            Hydration
          </Button>

          <Button
            onClick={triggerLifecycleError}
            variant="outline"
            className="text-xs py-2"
          >
            Lifecycle
          </Button>

          <Button
            onClick={() => {
              console.log('🧪 Testing ALL error patterns sequentially...');
              setTimeout(triggerHookError, 100);
              setTimeout(triggerStateMutationError, 200);
              setTimeout(triggerMissingKeysError, 300);
              setTimeout(triggerMemoryLeakError, 400);
              setTimeout(triggerPropTypesError, 500);
              setTimeout(triggerContextError, 600);
              setTimeout(triggerAsyncError, 700);
              setTimeout(triggerAuthError, 800);
              setTimeout(triggerDOMError, 900);
              setTimeout(triggerHydrationError, 1000);
              setTimeout(triggerLifecycleError, 1100);
            }}
            variant="default"
            className="text-xs py-2 bg-blue-600 col-span-2 md:col-span-1"
          >
            Test All Patterns
          </Button>
        </div>

        {/* Test patient list without keys (this will trigger React warning) */}
        {patients.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Patient List (Missing Keys Test):</h3>
            <div className="space-y-2">
              {patients.map((patient) => (
                // Intentionally no key prop - this triggers MISSING_KEYS pattern
                <div className="text-xs p-2 bg-white rounded border">
                  <span className="font-medium">{patient.name}</span>
                  <span className="text-gray-500 ml-2">SSN: {patient.ssn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Check browser DevTools Console and CMS Debugger WebSocket connection to see enhanced error categorization with:
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
            <li>• Healthcare Impact Assessment</li>
            <li>• HIPAA Compliance Risk Level</li>
            <li>• Actionable Suggestions</li>
            <li>• Error Pattern Classification</li>
          </ul>
        </div>
      </div>
    </HealthcareCard>
  );
};

export default ErrorTestingComponent;