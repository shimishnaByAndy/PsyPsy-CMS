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

import { useEffect, useState } from "react";

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

// Material Dashboard 2 React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Montreal cityline SVG
import montrealCityline from "assets/images/branding/mtlLines_w.png";

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
  
  // Check Parse initialization
  const { isInitialized } = useParseInitialization();
  
  // Update username when Parse is initialized
  useEffect(() => {
    if (isInitialized) {
      try {
        const currentUser = ParseAuth.getCurrentUser();
        if (currentUser) {
          setUsername(currentUser.get("username"));
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    }
  }, [isInitialized]);
  
  // Custom color for our app
  const customColor = color || "dark";

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

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
      <MenuItem onClick={handleLockApp}>
        <Icon sx={{ mr: 1 }}>lock</Icon> Lock
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Icon sx={{ mr: 1 }}>logout</Icon> Logout
      </MenuItem>
    </Menu>
  );

  // Create additional menu items for lock and logout
  const additionalMenuItems = [
    {
      type: "divider",
      key: "account-divider",
    },
    {
      type: "title",
      title: "Account",
      key: "account-title",
    },
    {
      type: "collapse",
      name: `${username}`,
      key: "profile",
      icon: "person",
      route: "/profile",
      iconColor: "white",
    },
    {
      type: "collapse",
      name: "Lock",
      key: "lock",
      icon: "lock",
      route: "/authentication/lock",
      onClick: handleLockApp,
      iconColor: "white",
    },
    {
      type: "collapse",
      name: "Logout",
      key: "logout",
      icon: "logout",
      onClick: handleLogout,
      iconColor: "white",
    },
  ];

  // Setting the routes based on menu type
  const menu = routes.find((route) => route.menu)?.subRoutes || routes;
  
  // Combine standard routes with our additional account menu items
  const allRoutes = [...menu, ...additionalMenuItems];

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = allRoutes.map(({ type, name, icon, title, route, href, key, onClick, iconColor }) => {
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
    }

    return returnValue;
  });

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
      <List>{renderRoutes}</List>
      
      {/* Language switcher and city skyline */}
      <MDBox 
        mt="auto" 
        display="flex" 
        flexDirection="column"
        position="relative"
        mb={0}
      >
        <MDBox
          p={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 1
          }}
        >
          <LanguageSwitcher iconColor="white" horizontalLayout />
        </MDBox>
        <MDBox 
          component="img" 
          src={montrealCityline} 
          alt="Montreal Cityline" 
          width="100%" 
          sx={{ 
            height: "auto",
            objectFit: "contain",
            maxWidth: "100%",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            mt: "auto"
          }}
        />
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
