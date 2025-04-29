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

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";

// react-i18next 
import { useTranslation } from 'react-i18next';

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// Language Switcher component
import LanguageSwitcher from "components/LanguageSwitcher";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

// Parse authentication service
import { ParseAuth } from "services/parseService";

function DashboardNavbar({ absolute, light, isMini }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  // User menu handlers
  const handleUserMenuOpen = (event) => setUserMenu(event.currentTarget);
  const handleUserMenuClose = () => setUserMenu(null);

  // Handle logout
  const handleLogout = async () => {
    try {
      await ParseAuth.logout();
      navigate("/authentication/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Get current user
  const currentUser = ParseAuth.getCurrentUser();
  const username = currentUser ? currentUser.get("username") : "Guest";

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title={t('navbar.newMessages')} />
      <NotificationItem icon={<Icon>podcasts</Icon>} title={t('navbar.podcastSessions')} />
      <NotificationItem icon={<Icon>shopping_cart</Icon>} title={t('navbar.paymentCompleted')} />
    </Menu>
  );

  // Render the user menu
  const renderUserMenu = () => (
    <Menu
      anchorEl={userMenu}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(userMenu)}
      onClose={handleUserMenuClose}
      sx={{ mt: 1 }}
    >
      <MenuItem onClick={() => navigate("/profile")}>
        <Icon sx={{ mr: 1 }}>person</Icon> {t('common.profile')}
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Icon sx={{ mr: 1 }}>logout</Icon> {t('common.logout')}
      </MenuItem>
    </Menu>
  );

  // Styles for the navbar icons
  const iconsStyle = () => ({
    color: () => {
      let colorValue = light || darkMode ? "white" : "dark";

      if (transparentNavbar && !light) {
        colorValue = darkMode ? "rgba(255,255,255,0.6)" : "text.main";
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox pr={1}>
              <MDInput label={t('navbar.searchHere')} />
            </MDBox>
            <MDBox color={light ? "white" : "inherit"}>
              {/* Language Switcher */}
              <LanguageSwitcher iconColor={iconsStyle().color()} />

              <Tooltip title={t('common.profile')}>
                <IconButton 
                  sx={navbarIconButton}
                  size="small" 
                  disableRipple
                  onClick={handleUserMenuOpen}
                  aria-controls="user-menu"
                  aria-haspopup="true"
                >
                  <Icon sx={iconsStyle}>account_circle</Icon>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    color={light ? "white" : "dark"}
                    sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline-block' } }}
                  >
                    {username}
                  </MDTypography>
                </IconButton>
              </Tooltip>
              {renderUserMenu()}
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon sx={iconsStyle}>{t('common.settings')}</Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="notification-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenMenu}
              >
                <Icon sx={iconsStyle}>notifications</Icon>
              </IconButton>
              {renderMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
