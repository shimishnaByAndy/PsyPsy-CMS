/**
 * Firebase-enabled App Component
 * 
 * Updated version of App.js that uses Firebase instead of Parse Server
 * Maintains all existing functionality while switching to Firebase backend
 */

import { useState, useEffect, useMemo, Suspense } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// @mui material components
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "./components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "./examples/Sidenav";
import Configurator from "./examples/Configurator";

// Material Dashboard 2 React routes
import routes from "./routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator, setSidenavColor } from "./context";

// Global Theme Provider
import GlobalThemeProvider from "./components/GlobalThemeProvider";

// PsyPsy Theme Provider
import PsyPsyThemeProvider from "./components/ThemeProvider";

// TanStack Query Provider
import QueryProvider from "./providers/QueryProvider";

// Firebase components and services
import FirebaseInitializer from "./components/FirebaseInitializer";
import FirebaseAuthGuard from "./components/FirebaseAuthGuard";
import firebaseAuthService from "./services/firebaseAuthService";

// Firebase hooks for dashboard stats
import { useFirebaseClientStats } from "./hooks/useFirebaseClients";
import { useFirebaseAppointmentStats } from "./hooks/useFirebaseAppointments";

// Images
import brandWhite from "./assets/images/logo-ct.png";
import brandDark from "./assets/images/logo-ct-dark.png";

// Internationalization
import { useTranslation } from 'react-i18next';

// Authentication redirect component
import AuthenticatedRedirect from "./components/AuthenticatedRedirect";

// Development utilities
import { initDevTools } from "./utils/devTools";

// Loading fallback component
const AppLoadingFallback = () => (
  <MDBox 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    flexDirection="column"
  >
    <CircularProgress size={50} color="success" />
    <MDBox mt={2} textAlign="center">
      Loading PsyPsy CMS...
    </MDBox>
  </MDBox>
);

// Dashboard stats provider component
const DashboardStatsProvider = ({ children, userType, setStats }) => {
  const { t } = useTranslation();
  
  // Firebase-based stats queries
  const clientStats = useFirebaseClientStats();
  const appointmentStats = useFirebaseAppointmentStats();

  // Update stats when data changes
  useEffect(() => {
    if (clientStats.data && appointmentStats.data) {
      const stats = {
        newUsersThisWeek: clientStats.data.newThisWeek || 0,
        newUsersThisMonth: clientStats.data.newThisMonth || 0,
        newUsersThisYear: clientStats.data.newThisYear || 0,
        total: clientStats.data.total || 0,
        genderCounts: clientStats.data.genderCounts || {
          1: 0, // Woman
          2: 0, // Man
          3: 0, // Other
          4: 0  // Not Disclosed
        },
        ageRanges: clientStats.data.ageRanges || {
          "14-17": 0,
          "18-24": 0,
          "25-34": 0,
          "35-44": 0,
          "45-54": 0,
          "55-64": 0,
          "65+": 0
        },
        appointments: {
          total: appointmentStats.data.total || 0,
          pending: appointmentStats.data.pending || 0,
          confirmed: appointmentStats.data.confirmed || 0,
          completed: appointmentStats.data.completed || 0,
          cancelled: appointmentStats.data.cancelled || 0
        }
      };
      
      setStats(stats);
    }
  }, [clientStats.data, appointmentStats.data, setStats]);

  return children;
};

export default function FirebaseApp() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Stats state for the Configurator
  const [stats, setStats] = useState({
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    newUsersThisYear: 0,
    total: 0,
    genderCounts: {
      1: 0, // Woman
      2: 0, // Man
      3: 0, // Other
      4: 0  // Not Disclosed
    },
    ageRanges: {
      "14-17": 0,
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55-64": 0,
      "65+": 0
    },
    appointments: {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    }
  });
  
  const [userType, setUserType] = useState(2); // 0 for admin, 1 for professional, 2 for client

  // Set the custom color for the sidenav when the component mounts - only once
  useEffect(() => {
    const colorSet = sessionStorage.getItem('sidenavColorSet');
    if (!colorSet) {
      setSidenavColor(dispatch, "success");
      sessionStorage.setItem('sidenavColorSet', 'true');
    }
  }, [dispatch]);
  
  // Initialize development tools if in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Uncomment to enable auto-opening developer tools
      // initDevTools();
    }
  }, []);
  
  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Set the layout based on the current route
  useEffect(() => {
    const isAuthRoute = pathname.includes('/authentication/');
    const layoutType = isAuthRoute ? 'page' : 'dashboard';
    
    console.log('Firebase App - Route changed to:', pathname);
    console.log('Firebase App - Setting layout to:', layoutType);
    
    if (layout !== layoutType) {
      dispatch({ type: 'LAYOUT', value: layoutType });
    }
  }, [pathname, layout, dispatch]);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => {
    setOpenConfigurator(dispatch, !openConfigurator);
  };

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  // Create a fallback route that safely handles navigation
  const getFallbackRoute = () => {
    return (
      <Route 
        path="*" 
        element={<AuthenticatedRedirect />} 
      />
    );
  };

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return (
    <QueryProvider>
      <GlobalThemeProvider>
        <PsyPsyThemeProvider>
          <FirebaseInitializer>
            <FirebaseAuthGuard>
              <DashboardStatsProvider userType={userType} setStats={setStats}>
                {layout === "dashboard" && (
                  <>
                    <Sidenav
                      color={sidenavColor}
                      brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                      brandName="PsyPsy CMS"
                      routes={routes}
                      onMouseEnter={handleOnMouseEnter}
                      onMouseLeave={handleOnMouseLeave}
                    />
                    <Configurator 
                      stats={stats}
                      userType={userType}
                      onUserTypeChange={setUserType}
                    />
                    {configsButton}
                  </>
                )}
                
                {layout === "vr" && <Configurator />}
                
                <Suspense fallback={<AppLoadingFallback />}>
                  <Routes>
                    {getRoutes(routes)}
                    {getFallbackRoute()}
                  </Routes>
                </Suspense>
              </DashboardStatsProvider>
            </FirebaseAuthGuard>
          </FirebaseInitializer>
        </PsyPsyThemeProvider>
      </GlobalThemeProvider>
    </QueryProvider>
  );
}