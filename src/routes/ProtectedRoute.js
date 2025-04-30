import React, { memo } from 'react';
import AuthGuard from '../components/AuthGuard';

/**
 * Protected route wrapper component
 * Wraps a route component with the AuthGuard to prevent unauthorized access
 * Using memo to prevent unnecessary re-renders that could cause infinite loops
 * 
 * @param {Object} props - Component props
 * @param {React.Component} props.component - The component to render if authenticated
 */
const ProtectedRoute = memo(({ component }) => {
  return <AuthGuard>{component}</AuthGuard>;
});

export default ProtectedRoute; 