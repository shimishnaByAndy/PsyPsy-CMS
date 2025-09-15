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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import PageLayout from "examples/LayoutContainers/PageLayout";

// Import the LanguageSwitcher
import LanguageSwitcher from "components/LanguageSwitcher";

// Import ShimmerBackground
import { ShimmerBackground } from "../../../../components/animate-ui/backgrounds/shimmer.tsx";

// Authentication pages components
import Footer from "layouts/authentication/components/Footer";

function BasicLayout({ image, children }) {
  return (
    <PageLayout>
      <MDBox
        position="absolute"
        width="100%"
        minHeight="100vh"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 0,
          backgroundImage: ({ functions: { rgba } }) =>
            image && `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
            zIndex: 1
          }
        }}
      >
        {/* Shimmer overlay - covers entire background */}
        <MDBox
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          zIndex={1.5}
          sx={{ pointerEvents: 'none' }}
        >
          <ShimmerBackground intensity="strong" />
        </MDBox>

        <MDBox 
          position="relative"
          zIndex={2}
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          width="100%" 
          height="100vh"
        >
          {/* Fixed-size container for the login card */}
          <Box 
            sx={{ 
              width: "350px", 
              maxWidth: "350px",
              display: "flex",
              justifyContent: "center"
            }}
          >
            {children}
          </Box>
        </MDBox>
        
        {/* Language switcher and Made with heart at the absolute bottom */}
        <MDBox 
          position="absolute"
          bottom={24}
          left={0}
          right={0}
          zIndex={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          {/* Language switcher */}
          <MDBox
            mb={2}
            width="100%"
            maxWidth="280px"
            display="flex"
            justifyContent="center"
          >
            <LanguageSwitcher iconColor="white" horizontalLayout />
          </MDBox>
          
          {/* Made with love in Montreal */}
          <MDBox
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
      </MDBox>
    </PageLayout>
  );
}

// Typechecking props for the BasicLayout
BasicLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
