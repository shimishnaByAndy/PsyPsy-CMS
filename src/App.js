/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect, useMemo, Suspense, createContext } from "react";

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

// Global Theme Provider - Our new comprehensive theme system
import GlobalThemeProvider from "./components/GlobalThemeProvider";

// PsyPsy Theme Provider - Custom theme utilities for components
import PsyPsyThemeProvider from "./components/ThemeProvider";

// Images
import brandWhite from "./assets/images/logo-ct.png";
import brandDark from "./assets/images/logo-ct-dark.png";

// Bootstrap CSS for Darkone
import 'bootstrap/dist/css/bootstrap.min.css';

// Development utilities
import { initDevTools } from "./utils/devTools";

// Parse initialization
import ParseInitializer from "./components/ParseInitializer";

// Authentication redirect component
import AuthenticatedRedirect from "./components/AuthenticatedRedirect";

// Parse for cloud functions
import Parse from "parse";

// i18n (internationalization) setup
import "./localization/i18n";

// Custom PsyPsy color
const PSYPSY_COLOR = "#899581";

// App-wide stats context for use with Configurator
export const StatsContext = createContext({
  stats: {},
  userType: 2,
  setStats: () => {},
  setUserType: () => {}
});

// Loading component for suspense fallback
const LoadingFallback = () => (
  <MDBox
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
    }}
  >
    <CircularProgress color="info" />
  </MDBox>
);

export default function App() {
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
    }
  });
  const [userType, setUserType] = useState(2); // 0 for admin, 1 for professional, 2 for client
  
  // Fetch stats from Parse Server
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Only fetch if user is authenticated
        if (Parse.User.current()) {
          const result = await Parse.Cloud.run("fetchClientStats", { userType });
          if (result && result.stats) {
            setStats(result.stats);
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, [userType, pathname]); // Refetch when userType changes or route changes

  // SELECTIVELY RESTORE KEY FUNCTIONALITY
  
  // Set the custom color for the sidenav when the component mounts - only once
  useEffect(() => {
    // Only set once to prevent loops
    const colorSet = sessionStorage.getItem('sidenavColorSet');
    if (!colorSet) {
      setSidenavColor(dispatch, "success");
      sessionStorage.setItem('sidenavColorSet', 'true');
    }
  }, []); // Empty dependency array prevents loops
  
  // Initialize development tools if in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Comment out initDevTools() to prevent auto-opening developer tools
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
    // Check if the current route is an authentication route
    const isAuthRoute = pathname.includes('/authentication/');
    const layoutType = isAuthRoute ? 'page' : 'dashboard';
    
    console.log('Route changed to:', pathname);
    console.log('Setting layout to:', layoutType);
    
    if (layout !== layoutType) {
      // Update layout state in the controller
      dispatch({ type: 'LAYOUT', value: layoutType });
    }
  }, [pathname, layout, dispatch]);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      // Conditional update to prevent unnecessary state changes
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      // Conditional update to prevent unnecessary state changes
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

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ParseInitializer>
        <GlobalThemeProvider>
          <PsyPsyThemeProvider>
            <MDBox
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                padding: '16px'
              }}
            >
              <MDBox
                sx={{
                  width: '100%',
                  maxWidth: '1400px',
                  height: '850px',
                  position: 'relative',
                  backgroundColor: 'transparent'
                }}
              >
                {layout === "dashboard" && (
                  <>
                    <Sidenav
                      color="success"
                      brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                      brandName="PsyPsy CMS"
                      routes={routes}
                      onMouseEnter={handleOnMouseEnter}
                      onMouseLeave={handleOnMouseLeave}
                    />
                    <Configurator stats={stats} userType={userType} />
                  </>
                )}
                {layout === "vr" && <Configurator stats={stats} userType={userType} />}
                <Routes>
                  {/* Root path redirect based on authentication */}
                  <Route path="/" element={<AuthenticatedRedirect />} />
                  {getRoutes(routes)}
                  {getFallbackRoute()}
                </Routes>
              </MDBox>
            </MDBox>
          </PsyPsyThemeProvider>
        </GlobalThemeProvider>
      </ParseInitializer>
    </Suspense>
  );
}
