import AuthGuard from '../components/AuthGuard';

/**
 * Protected route wrapper component
 * Wraps a route component with the AuthGuard to prevent unauthorized access
 * @param {Object} props - Component props
 * @param {React.Component} props.component - The component to render if authenticated
 */
const ProtectedRoute = ({ component }) => {
  return <AuthGuard>{component}</AuthGuard>;
};

export default ProtectedRoute; 