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
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import SimpleErrorMessage from "components/SimpleErrorMessage";
import SimpleSwitch from "components/SimpleSwitch";

// Animate UI components
import { IconButton } from "components/animate-ui/buttons/icon-button";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/montreal_green.png";
//import bgImage from "assets/images/montreal_night.png";
//import bgImage from "assets/images/montreal_blue.png";
//import bgImage from "assets/images/montrel_purple.png";

// Parse
import Parse from 'parse';
import { ParseAuth } from "services/parseService";

function Basic() {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for saved language preference or use browser language
  useEffect(() => {
    // Get stored language or browser language with French fallback
    const storedLanguage = localStorage.getItem('language');
    const userLanguage = navigator.language.split('-')[0]; // Gets 'fr' from 'fr-CA'
    const defaultLanguage = storedLanguage || userLanguage || 'fr';
    
    // If current language is different from the desired language, change it
    if (i18n.language !== defaultLanguage) {
      i18n.changeLanguage(defaultLanguage);
    }
    
    // Check if there's a remembered username and pre-fill it
    const rememberedUsername = localStorage.getItem('lastLoginUsername');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, [i18n]);

  const handleRememberMeChange = (checked) => {
    setRememberMe(checked);
  };

  const login = async () => {
    setError(null);
    console.log('Login attempted with:', { username, rememberMe });
    
    // Basic validation before attempting to log in
    if (!username.trim()) {
      setError(t("auth.login.missingCredentials"));
      return;
    }
    
    if (!password.trim()) {
      setError(t("auth.login.missingPassword"));
      return;
    }
    
    try {
      console.log('Calling ParseAuth.loginWithRememberMe');
      // Use the new loginWithRememberMe function and pass the rememberMe state
      await ParseAuth.loginWithRememberMe(username, password, rememberMe);
      console.log('Login successful, session token saved');
      
      // Store the username in localStorage if rememberMe is true
      if (rememberMe) {
        localStorage.setItem('lastLoginUsername', username);
      } else {
        localStorage.removeItem('lastLoginUsername');
      }
      
      console.log('Navigating to dashboard after successful login');
      // Use a slight delay to ensure all states are updated before navigation
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (error) {
      console.error("Error while logging in user", error);
      
      // Handle specific error types
      if (error.code === 101) {
        setError(t("auth.login.invalidCredentials"));
      } else if (error.code === 209) {
        setError(t("auth.login.sessionExpired"));
      } else if (error.message && error.message.includes("unauthorized")) {
        setError(t("auth.login.unauthorized"));
      } else if (error.code === 100) {
        setError(t("auth.login.connectionFailed"));
      } else if (error.message && error.message.includes("username/email is required")) {
        setError(t("auth.login.missingCredentials"));
      } else {
        setError(error.message || t("auth.login.error"));
      }
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card sx={{ width: '350px', maxWidth: '350px', minWidth: '300px' }}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography 
            variant="logo" 
            color="white" 
            mt={1}
            sx={{ 
              fontFamily: "'Romantically', serif",
              fontSize: "2.2rem",
              lineHeight: 1.2,
              letterSpacing: "1px"
            }}
          >
            PsyPsy
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 4, mb: 1 }}>
            <Grid item xs={2}>
              <MDTypography component="div" variant="body1" color="white" sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  icon={FacebookIcon}
                  href="https://www.facebook.com/profile.php?id=61558742723032"
                  target="_blank"
                  color={[255, 255, 255]} // White icons
                  rippleColor={[255, 255, 255]} // White ripple
                  size={24}
                />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component="div" variant="body1" color="white" sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  icon={InstagramIcon}
                  href="https://www.instagram.com/psypsy_sante/"
                  target="_blank"
                  color={[255, 255, 255]} // White icons
                  rippleColor={[255, 255, 255]} // White ripple
                  size={24}
                />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component="div" variant="body1" color="white" sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  icon={LanguageIcon}
                  href="http://www.psypsy.ca"
                  target="_blank"
                  color={[255, 255, 255]} // White icons
                  rippleColor={[255, 255, 255]} // White ripple
                  size={24}
                />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {error && <SimpleErrorMessage message={error} />}
          
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput
                type="text"
                label={t("auth.login.username")}
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label={t("auth.login.password")}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            
            <MDBox mt={2} mb={1}>
              <MDButton 
                variant="gradient" 
                color="info" 
                fullWidth 
                onClick={login}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  }
                }}
              >
                {t("auth.login.submit")}
              </MDButton>
            </MDBox>
            
            {/* Remember me with simple switch */}
            <MDBox mt={2} display="flex" justifyContent="center">
              <SimpleSwitch
                checked={rememberMe}
                onChange={handleRememberMeChange}
                label={t("common.rememberMe")}
              />
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic; 