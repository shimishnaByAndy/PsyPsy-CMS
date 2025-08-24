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
import IconButton from "@mui/material/IconButton";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Form components
import { AuthForm } from "components/Forms";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/montreal_green.png";
//import bgImage from "assets/images/montreal_night.png";
//import bgImage from "assets/images/montreal_blue.png";
//import bgImage from "assets/images/montrel_purple.png";

function Basic() {
  const { t, i18n } = useTranslation();
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
  }, [i18n]);

  const handleLoginSuccess = async (user) => {
    console.log('Login successful, session token saved');
    console.log('Navigating to dashboard after successful login');
    
    // Use a slight delay to ensure all states are updated before navigation
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 100);
  };

  const handleLoginError = async (error) => {
    console.error("Error while logging in user", error);
  };

  return (
    <BasicLayout image={bgImage}>
      <Card sx={{ 
        width: '350px', 
        maxWidth: '350px', 
        minWidth: '300px',
        overflow: 'visible', // Allow the logo header to show above the card
        position: 'relative', // Ensure proper stacking context
        '&:hover': {
          transform: 'none', // Override global card hover effect
          boxShadow: 'inherit' // Keep the existing shadow, don't enhance it
        }
      }}>
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
          sx={{
            position: 'relative',
            zIndex: 10 // Ensure the logo header appears above everything
          }}
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
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 8, mb: 1 }}>
            <Grid item xs={2}>
              <MDTypography component="div" variant="body1" color="white" sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  href="https://www.facebook.com/profile.php?id=61558742723032"
                  target="_blank"
                  sx={{
                    color: '#FFFFFF !important',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'none' // Prevent any transform on hover
                    }
                  }}
                >
                  <FacebookIcon sx={{ fontSize: 24, color: '#FFFFFF !important' }} />
                </IconButton>
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component="div" variant="body1" color="white" sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  href="https://www.instagram.com/psypsy_sante/"
                  target="_blank"
                  sx={{
                    color: '#FFFFFF !important',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'none' // Prevent any transform on hover
                    }
                  }}
                >
                  <InstagramIcon sx={{ fontSize: 24, color: '#FFFFFF !important' }} />
                </IconButton>
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component="div" variant="body1" color="white" sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  href="http://www.psypsy.ca"
                  target="_blank"
                  sx={{
                    color: '#FFFFFF !important',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'none' // Prevent any transform on hover
                    }
                  }}
                >
                  <LanguageIcon sx={{ fontSize: 24, color: '#FFFFFF !important' }} />
                </IconButton>
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <AuthForm
            type="login"
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            title="" // No title since we have the logo header
          />
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic; 