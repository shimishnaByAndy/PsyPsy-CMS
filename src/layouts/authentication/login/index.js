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

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Box from "@mui/material/Box";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import LanguageSwitcher from "components/LanguageSwitcher";
import SimpleSwitch from "components/SimpleSwitch";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

// Parse
import Parse from "parse/dist/parse.min.js";

function Basic() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRememberMeChange = (checked) => {
    setRememberMe(checked);
  };

  const login = async () => {
    setError(null);
    try {
      await Parse.User.logIn(username, password);
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error while logging in user", error);
      
      // Handle specific error types
      if (error.code === Parse.Error.CONNECTION_FAILED) {
        setError("Could not connect to the server. Please check your internet connection.");
      } else if (error.code === Parse.Error.OBJECT_NOT_FOUND) {
        setError("Invalid username or password.");
      } else if (error.code === Parse.Error.INVALID_SESSION_TOKEN) {
        setError("Your session has expired. Please login again.");
      } else if (error.message && error.message.includes("unauthorized")) {
        setError("Incorrect username or password. Please try again.");
      } else {
        setError(error.message || t("auth.login.error"));
      }
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
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
              fontSize: "1.875rem",
              letterSpacing: "1px" 
            }}
          >
            PsyPsy
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 2, mb: 0.5 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="https://www.facebook.com/profile.php?id=61558742723032" target="_blank" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="https://www.instagram.com/psypsy_sante/" target="_blank" variant="body1" color="white">
                <InstagramIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="http://www.psypsy.ca" target="_blank" variant="body1" color="white">
                <LanguageIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {error && (
            <MDBox mb={2}>
              <MDAlert color="error">{error}</MDAlert>
            </MDBox>
          )}
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
              <MDButton variant="gradient" color="info" fullWidth onClick={login}>
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