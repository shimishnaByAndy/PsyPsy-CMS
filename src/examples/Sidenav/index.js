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

import { useEffect, useState, useMemo, useRef } from "react";

// react-router-dom components
import { useLocation, NavLink, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import LanguageSwitcher from "components/LanguageSwitcher";
import ThemeToggle from "components/ThemeToggle";

// Material Dashboard 2 React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Montreal cityline SVG
import montrealCityline from "assets/images/branding/mtlLines_w2.png";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

// Parse authentication service
import { ParseAuth } from "services/parseService";

// Additional Parse context import
import { useParseInitialization } from "components/ParseInitializer";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");
  const [userMenu, setUserMenu] = useState(null);
  const [username, setUsername] = useState("Guest");
  const usernameUpdated = useRef(false);
  
  // Check Parse initialization
  const { isInitialized } = useParseInitialization();
  
  // Update username when component renders if Parse is initialized
  // This avoids useEffect and potential infinite loops
  if (isInitialized && !usernameUpdated.current) {
    try {
      const currentUser = ParseAuth.getCurrentUser();
      if (currentUser) {
        const firstName = currentUser.get("firstName") || 
                         currentUser.get("first_name") || 
                         currentUser.get("username").split(" ")[0];
        if (firstName && firstName !== username) {
          setUsername(firstName);
          usernameUpdated.current = true;
        }
      }
    } catch (error) {
      console.error("Error getting current user:", error);
      usernameUpdated.current = true; // Mark as updated even on error to prevent retries
    }
  }
  
  // Custom color for our app
  const customColor = color || "dark";

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  // Remove the automatic mini sidenav setting based on window size
  // This was likely causing infinite loops with the dispatch
  useEffect(() => {
    // Only set sidenav state on initial load based on window size
    // Do not add event listeners or other things that may cause loops
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setMiniSidenav(dispatch, true);
      } else {
        setMiniSidenav(dispatch, false);
      }
    };

    // Initial check
    handleResize();
    
    // Cleanup and remove this listener when the component unmounts
    // We don't need to constantly check for resizing during normal use
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]); // Only depend on dispatch, which is stable

  // User menu handlers
  const handleUserMenuOpen = (event) => setUserMenu(event.currentTarget);
  const handleUserMenuClose = () => setUserMenu(null);
  
  // Handle logout
  const handleLogout = async () => {
    if (!isInitialized) return;
    
    try {
      await ParseAuth.logout();
      navigate("/authentication/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  // Handle lock app
  const handleLockApp = () => {
    if (!isInitialized) return;
    
    // Lock app functionality - redirect to lock screen
    navigate("/authentication/lock");
  };
  
  // Render the user menu
  const renderUserMenu = () => (
    <Menu
      anchorEl={userMenu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={Boolean(userMenu)}
      onClose={handleUserMenuClose}
      sx={{ mt: 1 }}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="center">
        <MenuItem onClick={() => navigate("/profile")}> 
          <Icon sx={{ mr: 1 }}>settings</Icon> Settings
        </MenuItem>
        <MenuItem onClick={handleLockApp}>
          <Icon sx={{ mr: 1 }}>lock</Icon> Lock
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Icon sx={{ mr: 1 }}>logout</Icon> Logout
        </MenuItem>
      </MDBox>
    </Menu>
  );

  // Create additional menu items for lock and logout
  const additionalMenuItems = []; // We'll handle these separately in the footer

  // Use useMemo to create modified routes only when dependencies change
  const allRoutes = useMemo(() => {
    const menu = routes.find((route) => route.menu)?.subRoutes || routes;
    const modifiedMenu = menu.filter(item => item.key !== "login" && item.key !== "profile" && item.key !== "settings");

    modifiedMenu.forEach(item => {
      if (item.type === "collapse") {
        item.iconColor = "white";
      }
    });

    return modifiedMenu;
  }, [routes]);

  // Memoize the rendered routes to prevent recreating on every render
  const renderedRoutes = useMemo(() => {
    return allRoutes.map(({ type, name, icon, title, route, href, key, onClick, iconColor, actions }) => {
      let returnValue;
  
      if (type === "collapse") {
        if (onClick) {
          // For items with onClick handler (lock and logout)
          returnValue = (
            <div key={key} onClick={onClick} style={{ cursor: "pointer" }}>
              <SidenavCollapse name={name} icon={icon} active={key === collapseName} noCollapse iconColor={iconColor || "inherit"} />
            </div>
          );
        } else if (href) {
          returnValue = (
            <Link
              href={href}
              key={key}
              target="_blank"
              rel="noreferrer"
              sx={{ textDecoration: "none" }}
            >
              <SidenavCollapse
                name={name}
                icon={icon}
                active={key === collapseName}
                noCollapse={href}
                iconColor={iconColor || "inherit"}
              />
            </Link>
          );
        } else {
          returnValue = (
            <NavLink key={key} to={route}>
              <SidenavCollapse name={name} icon={icon} active={key === collapseName} iconColor={iconColor || "inherit"} />
            </NavLink>
          );
        }
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={true}
            sx={{
              opacity: 0.3,
              borderColor: 'rgba(255,255,255,0.2)'
            }}
          />
        );
      } else if (type === "actions-row") {
        // Render multiple actions in a row
        returnValue = (
          <MDBox
            key={key}
            display="flex"
            justifyContent="space-around"
            px={2}
            mt={1}
            mb={1}
          >
            {actions.map((action) => (
              <MDBox 
                key={action.key}
                onClick={action.onClick}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '50%'
                }}
              >
                <Icon
                  sx={{
                    color: action.iconColor || 'white',
                    fontSize: '1.3rem',
                    mb: 0.5
                  }}
                >
                  {action.icon}
                </Icon>
                <MDTypography
                  variant="button"
                  color="white"
                  fontWeight="regular"
                  sx={{ fontSize: '0.75rem' }}
                >
                  {action.name}
                </MDTypography>
              </MDBox>
            ))}
          </MDBox>
        );
      }
  
      return returnValue;
    });
  }, [allRoutes, collapseName, textColor]);

  // Brand component displayed inside the Sidenav
  const Brand = () => (
    <MDBox px={4} py={3} mb={1} className="branding" width="100%" display="flex" justifyContent="center">
      <MDBox
        component={NavLink} 
        to="/" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <MDTypography
          component="h1"
          variant="button"
          fontWeight="medium"
          color="white"
          textAlign="center"
          sx={{
            fontFamily: "'Romantically', 'Playfair Display', serif",
            fontSize: miniSidenav ? "0.9rem" : "1.3rem",
            letterSpacing: "1px",
            textShadow: '0px 2px 4px rgba(0,0,0,0.4)'
          }}
        >
          {miniSidenav ? "PP" : "PsyPsy"}
        </MDTypography>
      </MDBox>
    </MDBox>
  );

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
      sx={{ backgroundColor: customColor }}
    >
      <MDBox pt={3} px={1} className="sidenav-header" sx={{ 
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
        padding: '16px 8px'
      }}>
        <Brand />
        <Divider
          light={true}
          sx={{
            opacity: 0.3,
            borderColor: 'rgba(255,255,255,0.2)'
          }}
        />
      </MDBox>
      <List>{renderedRoutes}</List>
      
      {/* Language switcher and city skyline */}
      <MDBox 
        mt="auto" 
        display="flex" 
        flexDirection="column"
        position="relative"
        mb={0}
      >
        {/* Divider before pickers */}
        <Divider
          light={true}
          sx={{
            opacity: 0.3,
            borderColor: 'rgba(255,255,255,0.2)',
            mt: 2
          }}
        />
        
        {/* Theme toggles and language switcher side by side */}
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          mb={1}
          mt={1}
        >
          <ThemeToggle />
          <LanguageSwitcher iconColor="white" horizontalLayout />
        </MDBox>
        
        {/* Lock and Logout buttons */}
        <MDBox
          display="flex"
          justifyContent="space-around"
          px={2}
          mt={0}
          mb={1}
        >
          <MDBox 
            onClick={() => navigate("/profile")}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '50%',
              padding: '8px 0',
              borderRadius: '4px',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Icon
              sx={{
                color: 'white',
                fontSize: '1.3rem',
                mb: 0.5,
                filter: 'brightness(0) invert(1)'
              }}
            >
              settings
            </Icon>
            <MDTypography
              variant="button"
              color="white"
              fontWeight="regular"
              sx={{ fontSize: '0.75rem' }}
            >
              Settings
            </MDTypography>
          </MDBox>
          <MDBox 
            onClick={handleLogout}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '50%',
              padding: '8px 0',
              borderRadius: '4px',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Icon
              sx={{
                color: 'white',
                fontSize: '1.3rem',
                mb: 0.5,
                filter: 'brightness(0) invert(1)'
              }}
            >
              logout
            </Icon>
            <MDTypography
              variant="button"
              color="white"
              fontWeight="regular"
              sx={{ fontSize: '0.75rem' }}
            >
              Logout
            </MDTypography>
          </MDBox>
          <MDBox 
            onClick={handleLockApp}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '50%',
              padding: '8px 0',
              borderRadius: '4px',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Icon
              sx={{
                color: 'white',
                fontSize: '1.3rem',
                mb: 0.5,
                filter: 'brightness(0) invert(1)'
              }}
            >
              lock
            </Icon>
            <MDTypography
              variant="button"
              color="white"
              fontWeight="regular"
              sx={{ fontSize: '0.75rem' }}
            >
              Lock
            </MDTypography>
          </MDBox>
        </MDBox>
        
        {/* Montreal cityline image right above the footer */}
        <MDBox 
          component="img" 
          src={montrealCityline} 
          alt="Montreal Cityline" 
          width="100%" 
          sx={{ 
            height: "auto",
            objectFit: "cover",
            width: "calc(100% + 6px)",  // Extend beyond the sidebar padding
            maxWidth: "none",            // Remove maxWidth constraint
            display: "block",
            marginLeft: "-8px",          // Negative margin to offset sidebar padding
            marginRight: "-8px",         // Negative margin to offset sidebar padding
            mb: 1,
            mt: 0,
            opacity: 0.15,
            //border: "1px dashed rgba(255, 255, 255, 0.5)",
            boxSizing: "border-box",
            padding: 0                   // Remove padding
          }}
        />
        
        {/* Made with love in Montreal - immediately after image */}
        <MDBox
          px={2}
          pb={2}
          pt={0.5}  // Small padding top to create minimal space from image
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <MDTypography
            variant="caption"
            color="white"
            fontWeight="light"
            textAlign="center"
            sx={{ 
              fontSize: "0.7rem",
              opacity: 0.75,
              letterSpacing: "0.02rem",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            Made with <Icon sx={{ fontSize: "0.8rem", color: "white" }}>favorite</Icon> in Montreal
          </MDTypography>
        </MDBox>
      </MDBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
