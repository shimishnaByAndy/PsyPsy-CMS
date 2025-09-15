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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import SimpleErrorMessage from "components/SimpleErrorMessage";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/montreal_green.png";

// Parse
import { ParseAuth } from "services/parseService";
import { useParseInitialization } from "components/ParseInitializer";

function Lock() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const { isInitialized } = useParseInitialization();

  // Get current user when Parse is initialized
  useEffect(() => {
    if (isInitialized) {
      try {
        const currentUser = ParseAuth.getCurrentUser();
        if (currentUser) {
          setUsername(currentUser.get("username"));
        } else {
          // If no user is logged in, redirect to login page
          navigate("/authentication/login");
        }
      } catch (error) {
        console.error("Error getting current user:", error);
        navigate("/authentication/login");
      }
    }
  }, [isInitialized, navigate]);
  
  // Don't render anything if no username is set yet or Parse is not initialized
  if (!username || !isInitialized) {
    return (
      <BasicLayout image={bgImage}>
        <Card sx={{ width: '350px', maxWidth: '350px', minWidth: '300px', height: '350px' }}>
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
            <MDBox display="flex" justifyContent="center" alignItems="center" mb={1}>
              <Icon fontSize="large" color="white">hourglass_empty</Icon>
            </MDBox>
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Loading...
            </MDTypography>
          </MDBox>
        </Card>
      </BasicLayout>
    );
  }

  const unlock = async () => {
    setError(null);
    
    // Basic validation
    if (!password.trim()) {
      setError(t("auth.login.missingPassword"));
      return;
    }
    
    try {
      // Try to verify credentials
      await ParseAuth.login(username, password);
      
      // If successful, navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error while unlocking app", error);
      
      if (error.code === 101) {
        setError(t("auth.login.invalidCredentials"));
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
          <MDBox display="flex" justifyContent="center" alignItems="center" mb={1}>
            <Icon fontSize="large" color="white">lock</Icon>
          </MDBox>
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {t("auth.lock.locked")}
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {error && <SimpleErrorMessage message={error} />}
          <MDBox component="form" role="form">
            <MDBox textAlign="center" mb={2}>
              <MDTypography variant="h6">{username}</MDTypography>
              <MDTypography variant="caption" color="text">
                {t("auth.lock.enterPassword")}
              </MDTypography>
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
              <MDButton variant="gradient" color="info" fullWidth onClick={unlock}>
                {t("auth.lock.unlock")}
              </MDButton>
            </MDBox>
            
            <MDBox mt={3} textAlign="center">
              <MDTypography variant="button" color="text">
                <MDTypography
                  component="span"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                  onClick={() => navigate("/authentication/login")}
                  sx={{ cursor: "pointer" }}
                >
                  {t("auth.lock.signInDifferent")}
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Lock; 