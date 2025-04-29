import { useState, useEffect } from 'react';

// @mui material components
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';

// Material Dashboard 2 React components
import MDBox from './MDBox';
import MDTypography from './MDTypography';

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

const UserTypeSelector = ({ onChange }) => {
  // Material UI context for theme
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  
  // Label color based on theme
  const labelColor = darkMode ? "white" : "dark";
  
  // User type options
  const USER_TYPES = {
    ALL: 'all',
    PROFESSIONALS: 'professionals',
    CLIENTS: 'clients',
    ADMINS: 'admins'
  };
  
  // Get current type from localStorage or default to 'all'
  const [currentType, setCurrentType] = useState(
    localStorage.getItem('userTypeFilter') || USER_TYPES.ALL
  );

  // Change user type filter
  const changeUserType = (type) => {
    if (type !== currentType) {
      setCurrentType(type);
      // Save the selected type to localStorage
      localStorage.setItem('userTypeFilter', type);
      
      // Notify parent component about the change
      if (onChange) {
        onChange(type);
      }
    }
  };
  
  // Calculate indicator position based on current type
  const getIndicatorPosition = () => {
    switch (currentType) {
      case USER_TYPES.ALL:
        return '0px';
      case USER_TYPES.PROFESSIONALS:
        return '25%';
      case USER_TYPES.CLIENTS:
        return '50%';
      case USER_TYPES.ADMINS:
        return '75%';
      default:
        return '0px';
    }
  };

  return (
    <Box
      sx={{ 
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        backgroundColor: darkMode ? '#1a2035' : 'rgba(255, 255, 255, 0.8)',
        mx: 'auto',
        my: 0,
        position: 'relative',
        p: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: 'none'
      }}
    >
      {/* Indicator */}
      <Box
        sx={{
          position: 'absolute',
          left: getIndicatorPosition(),
          width: 'calc(25% - 8px)',
          height: '96%',
          borderRadius: '12px',
          backgroundColor: '#5D1C33',
          transition: 'left 0.3s ease, width 0.3s ease',
          zIndex: 1,
          opacity: 1,
          boxShadow: '0 4px 12px rgba(93, 28, 51, 0.3)'
        }}
      />
      
      {/* All Users Button */}
      <Box
        onClick={() => changeUserType(USER_TYPES.ALL)}
        sx={{
          width: '25%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2,
          position: 'relative',
          fontWeight: currentType === USER_TYPES.ALL ? 'bold' : 'normal',
          color: currentType === USER_TYPES.ALL ? '#ffffff' : (darkMode ? '#ffffff' : '#4B5563'),
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#ffffff',
            backgroundColor: currentType !== USER_TYPES.ALL ? 'rgba(93, 28, 51, 0.3)' : 'transparent',
            borderRadius: '10px'
          }
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "1.25rem",
            mr: 1,
            color: 'inherit',
            opacity: currentType === USER_TYPES.ALL ? 1 : 0.7
          }}
        >
          group
        </Icon>
        <MDTypography
          variant="button"
          color="inherit"
          fontWeight={currentType === USER_TYPES.ALL ? 'bold' : 'regular'}
          sx={{ 
            fontSize: '0.9rem',
            letterSpacing: '0.02em',
            display: { xs: 'block', sm: 'block' }
          }}
        >
          All Users
        </MDTypography>
      </Box>
      
      {/* Professionals Button */}
      <Box
        onClick={() => changeUserType(USER_TYPES.PROFESSIONALS)}
        sx={{
          width: '25%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2,
          position: 'relative',
          fontWeight: currentType === USER_TYPES.PROFESSIONALS ? 'bold' : 'normal',
          color: currentType === USER_TYPES.PROFESSIONALS ? '#ffffff' : (darkMode ? '#ffffff' : '#4B5563'),
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#ffffff',
            backgroundColor: currentType !== USER_TYPES.PROFESSIONALS ? 'rgba(93, 28, 51, 0.3)' : 'transparent',
            borderRadius: '10px'
          }
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "1.25rem",
            mr: 1,
            color: 'inherit',
            opacity: currentType === USER_TYPES.PROFESSIONALS ? 1 : 0.7
          }}
        >
          psychology
        </Icon>
        <MDTypography
          variant="button"
          color="inherit"
          fontWeight={currentType === USER_TYPES.PROFESSIONALS ? 'bold' : 'regular'}
          sx={{ 
            fontSize: '0.9rem',
            letterSpacing: '0.02em',
            display: { xs: 'block', sm: 'block' }
          }}
        >
          Professionals
        </MDTypography>
      </Box>
      
      {/* Clients Button */}
      <Box
        onClick={() => changeUserType(USER_TYPES.CLIENTS)}
        sx={{
          width: '25%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2,
          position: 'relative',
          fontWeight: currentType === USER_TYPES.CLIENTS ? 'bold' : 'normal',
          color: currentType === USER_TYPES.CLIENTS ? '#ffffff' : (darkMode ? '#ffffff' : '#4B5563'),
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#ffffff',
            backgroundColor: currentType !== USER_TYPES.CLIENTS ? 'rgba(93, 28, 51, 0.3)' : 'transparent',
            borderRadius: '10px'
          }
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "1.25rem",
            mr: 1,
            color: 'inherit',
            opacity: currentType === USER_TYPES.CLIENTS ? 1 : 0.7
          }}
        >
          person
        </Icon>
        <MDTypography
          variant="button"
          color="inherit"
          fontWeight={currentType === USER_TYPES.CLIENTS ? 'bold' : 'regular'}
          sx={{ 
            fontSize: '0.9rem',
            letterSpacing: '0.02em',
            display: { xs: 'block', sm: 'block' }
          }}
        >
          Clients
        </MDTypography>
      </Box>
      
      {/* Admins Button */}
      <Box
        onClick={() => changeUserType(USER_TYPES.ADMINS)}
        sx={{
          width: '25%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2,
          position: 'relative',
          fontWeight: currentType === USER_TYPES.ADMINS ? 'bold' : 'normal',
          color: currentType === USER_TYPES.ADMINS ? '#ffffff' : (darkMode ? '#ffffff' : '#4B5563'),
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#ffffff',
            backgroundColor: currentType !== USER_TYPES.ADMINS ? 'rgba(93, 28, 51, 0.3)' : 'transparent',
            borderRadius: '10px'
          }
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "1.25rem",
            mr: 1,
            color: 'inherit',
            opacity: currentType === USER_TYPES.ADMINS ? 1 : 0.7
          }}
        >
          admin_panel_settings
        </Icon>
        <MDTypography
          variant="button"
          color="inherit"
          fontWeight={currentType === USER_TYPES.ADMINS ? 'bold' : 'regular'}
          sx={{ 
            fontSize: '0.9rem',
            letterSpacing: '0.02em',
            display: { xs: 'block', sm: 'block' }
          }}
        >
          Admins
        </MDTypography>
      </Box>
    </Box>
  );
};

export default UserTypeSelector; 