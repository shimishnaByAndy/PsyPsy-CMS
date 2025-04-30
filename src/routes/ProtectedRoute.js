import React from 'react';
import AuthGuard from '../components/AuthGuard';

/**
 * Protected route wrapper component
 * Wraps a route component with the AuthGuard to prevent unauthorized access
 * Using React.memo to prevent unnecessary re-renders
 * 
 * @param {Object} props - Component props
 * @param {React.Component} props.component - The component to render if authenticated
 */
const ProtectedRoute = React.memo(({ component }) => {
  console.log('ProtectedRoute: rendering with component', component ? 'provided' : 'missing');
  
  // Ensure we always return a valid component
  if (!component) {
    console.error('ProtectedRoute: No component provided');
    return <div>Error: Protected page could not be loaded</div>;
  }
  
  return <AuthGuard>{component}</AuthGuard>;
}, (prevProps, nextProps) => {
  // Improved memoization logic: only prevent updates for identical components
  const isSameComponent = prevProps.component === nextProps.component;
  console.log('ProtectedRoute: memoization check -', isSameComponent ? 'same component' : 'different component');
  return isSameComponent; // Only update when the component changes
});

export default ProtectedRoute; 