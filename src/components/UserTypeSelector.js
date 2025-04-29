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
        return '4px';
      case USER_TYPES.PROFESSIONALS:
        return 'calc(25% + 4px)';
      case USER_TYPES.CLIENTS:
        return 'calc(50% + 4px)';
      case USER_TYPES.ADMINS:
        return 'calc(75% + 4px)';
      default:
        return '4px';
    }
  };

  return (
    <Box
      sx={{ 
        width: '100%',
        height: '100%',
        borderRadius: '0',
        backgroundColor: 'transparent',
        mx: 'auto',
        my: 0,
        position: 'relative',
        p: 0.75,
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
          width: 'calc(25% - 12px)',
          height: '52px',
          borderRadius: '6px',
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
          transition: 'left 0.3s ease',
          zIndex: 1
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
          color: labelColor,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: currentType !== USER_TYPES.ALL ? 'translateY(-2px)' : 'none'
          }
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "1.25rem",
            mr: 1,
            color: labelColor,
            opacity: currentType === USER_TYPES.ALL ? 1 : 0.8
          }}
        >
          group
        </Icon>
        <MDTypography
          variant="button"
          color={labelColor}
          fontWeight={currentType === USER_TYPES.ALL ? 'bold' : 'regular'}
          sx={{ 
            fontSize: '1rem',
            letterSpacing: '0.03em',
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
          color: labelColor,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: currentType !== USER_TYPES.PROFESSIONALS ? 'translateY(-2px)' : 'none'
          }
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "1.25rem",
            mr: 1,
            color: labelColor,
            opacity: currentType === USER_TYPES.PROFESSIONALS ? 1 : 0.8
          }}
        >
          psychology
        </Icon>
        <MDTypography
          variant="button"
          color={labelColor}
          fontWeight={currentType === USER_TYPES.PROFESSIONALS ? 'bold' : 'regular'}
          sx={{ 
            fontSize: '1rem',
            letterSpacing: '0.03em',
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
          color: labelColor,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: currentType !== USER_TYPES.CLIENTS ? 'translateY(-2px)' : 'none'
          }
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "1.25rem",
            mr: 1,
            color: labelColor,
            opacity: currentType === USER_TYPES.CLIENTS ? 1 : 0.8
          }}
        >
          person
        </Icon>
        <MDTypography
          variant="button"
          color={labelColor}
          fontWeight={currentType === USER_TYPES.CLIENTS ? 'bold' : 'regular'}
          sx={{ 
            fontSize: '1rem',
            letterSpacing: '0.03em',
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
          color: labelColor,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: currentType !== USER_TYPES.ADMINS ? 'translateY(-2px)' : 'none'
          }
        }}
      >
        <Icon 
          sx={{ 
            fontSize: "1.25rem",
            mr: 1,
            color: labelColor,
            opacity: currentType === USER_TYPES.ADMINS ? 1 : 0.8
          }}
        >
          admin_panel_settings
        </Icon>
        <MDTypography
          variant="button"
          color={labelColor}
          fontWeight={currentType === USER_TYPES.ADMINS ? 'bold' : 'regular'}
          sx={{ 
            fontSize: '1rem',
            letterSpacing: '0.03em',
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