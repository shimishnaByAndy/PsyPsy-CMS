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
import Switch from "@mui/material/Switch";
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
import MDAlert from "components/MDAlert";
import LanguageSwitcher from "components/LanguageSwitcher";

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

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const login = async () => {
    setError(null);
    try {
      await Parse.User.logIn(username, password);
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error while logging in user", error);
      setError(t("auth.login.error"));
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
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {t("auth.login.title")}
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="https://facebook.com" target="_blank" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="https://instagram.com" target="_blank" variant="body1" color="white">
                <InstagramIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="https://psypsy.ca" target="_blank" variant="body1" color="white">
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
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth onClick={login}>
                {t("auth.login.submit")}
              </MDButton>
            </MDBox>
            <MDBox display="flex" justifyContent="center" alignItems="center" mt={2}>
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", mr: 1 }}
              >
                {t("common.rememberMe")}
              </MDTypography>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic; 