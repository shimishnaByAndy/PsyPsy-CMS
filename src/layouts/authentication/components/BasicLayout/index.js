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

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import PageLayout from "examples/LayoutContainers/PageLayout";

// Import the LanguageSwitcher
import LanguageSwitcher from "components/LanguageSwitcher";

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
          backgroundImage: ({ functions: { rgba } }) =>
            image && `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Language Switcher positioned at the top right */}
        <MDBox position="absolute" top={16} right={16} zIndex={2}>
          <LanguageSwitcher iconColor="white" />
        </MDBox>
        <MDBox 
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
      </MDBox>
      <Footer light />
    </PageLayout>
  );
}

// Typechecking props for the BasicLayout
BasicLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
