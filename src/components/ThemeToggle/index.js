import { useState, useEffect } from "react";

// @mui material components
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React context
import { useMaterialUIController, setDarkMode } from "context";

function ThemeToggle() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const toggleTheme = () => {
    console.log('ThemeToggle: Switching theme from', darkMode ? 'dark' : 'light', 'to', !darkMode ? 'dark' : 'light');
    setDarkMode(dispatch, !darkMode);
  };

  return (
    <Box
      sx={{ 
        width: '80%',
        height: '40px',
        borderRadius: '30px',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        mx: 'auto',
        position: 'relative',
        mb: 2,
        p: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Indicator */}
      <Box
        sx={{
          position: 'absolute',
          left: darkMode ? 'calc(50% + 4px)' : '4px',
          width: 'calc(50% - 8px)',
          height: '32px',
          borderRadius: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          transition: 'left 0.3s ease',
          zIndex: 1
        }}
      />
      
      {/* Light Mode Button */}
      <Box
        onClick={() => darkMode && toggleTheme()}
        sx={{
          width: '50%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2,
          position: 'relative',
          color: 'white'
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "0.85rem",
            mr: 0.75,
            color: "white",
            filter: "brightness(0) invert(1)",
            opacity: !darkMode ? 1 : 0.8
          }}
        >
          light_mode
        </Icon>
        <MDTypography
          variant="button"
          color="white"
          fontWeight={!darkMode ? 'medium' : 'regular'}
          sx={{ 
            fontSize: '0.85rem',
            letterSpacing: '0.02em',
            opacity: !darkMode ? 1 : 0.8
          }}
        >
          Light
        </MDTypography>
      </Box>
      
      {/* Dark Mode Button */}
      <Box
        onClick={() => !darkMode && toggleTheme()}
        sx={{
          width: '50%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2,
          position: 'relative',
          color: 'white'
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "0.85rem",
            mr: 0.75,
            color: "white",
            filter: "brightness(0) invert(1)",
            opacity: darkMode ? 1 : 0.8
          }}
        >
          dark_mode
        </Icon>
        <MDTypography
          variant="button"
          color="white"
          fontWeight={darkMode ? 'medium' : 'regular'}
          sx={{ 
            fontSize: '0.85rem',
            letterSpacing: '0.02em',
            opacity: darkMode ? 1 : 0.8
          }}
        >
          Dark
        </MDTypography>
      </Box>
    </Box>
  );
}

export default ThemeToggle; 