import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Parse from 'parse';
import { useParseInitialization } from './ParseInitializer';

/**
 * Component that handles authentication-based redirects on app startup
 * Redirects authenticated users to dashboard, unauthenticated users to login
 */
const AuthenticatedRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isInitialized } = useParseInitialization();

  useEffect(() => {
    if (!isInitialized) {
      console.log('AuthenticatedRedirect: Parse not initialized, waiting...');
      return;
    }

    const path = location.pathname;
    // Only handle root path redirects
    if (path === "/" || path === "/*") {
      console.log('AuthenticatedRedirect: Handling root path redirect');
      
      const checkAuthAndRedirect = async () => {
        try {
          // Check for current user first
          let currentUser = Parse.User.current();
          console.log('AuthenticatedRedirect: Current user check:', currentUser ? 'Found' : 'None');
          
          // If no current user, try to restore from session token
          if (!currentUser) {
            const sessionToken = localStorage.getItem('Parse/sessionToken');
            if (sessionToken) {
              console.log('AuthenticatedRedirect: Attempting session restoration...');
              try {
                currentUser = await Parse.User.become(sessionToken);
                console.log('AuthenticatedRedirect: Session restored for:', currentUser?.getUsername());
              } catch (sessionError) {
                console.error('AuthenticatedRedirect: Session restoration failed:', sessionError.message);
                // Clean up invalid session
                localStorage.removeItem('Parse/sessionToken');
                currentUser = null;
              }
            }
          }
          
          const isAuthenticated = !!currentUser;
          console.log('AuthenticatedRedirect: Final auth status:', isAuthenticated);
          
          if (isAuthenticated) {
            console.log('AuthenticatedRedirect: Redirecting authenticated user to dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('AuthenticatedRedirect: Redirecting unauthenticated user to login');
            navigate('/authentication/login', { replace: true });
          }
        } catch (error) {
          console.error('AuthenticatedRedirect: Error during auth check:', error);
          // On error, redirect to login
          navigate('/authentication/login', { replace: true });
        }
      };

      checkAuthAndRedirect();
    }
  }, [isInitialized, location.pathname, navigate]);

  return null;
};

export default AuthenticatedRedirect; 