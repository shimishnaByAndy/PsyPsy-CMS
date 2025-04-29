import { useTranslation } from 'react-i18next';

// @mui material components
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Icon from '@mui/material/Icon';
import AppBar from '@mui/material/AppBar';

// Material Dashboard 2 React components
import MDBox from './MDBox';
import MDTypography from './MDTypography';

// Import SVG icons
import mapleLeafIcon from '../assets/images/icons/flags/maple-leaf.svg';
import fleurDeLisIcon from '../assets/images/icons/flags/fleur-de-lis.svg';

const LanguageSwitcher = ({ iconColor, horizontalLayout = false }) => {
  const { t, i18n } = useTranslation();
  
  // Get current language
  const currentLanguage = i18n.language || 'en';

  // Change language
  const changeLanguage = (code) => {
    if (code !== currentLanguage) {
      i18n.changeLanguage(code);
      // Save the selected language to localStorage
      localStorage.setItem('language', code);
    }
  };

  // Tabs layout (similar to the provided HTML)
  if (horizontalLayout) {
    return (
      <Box
        sx={{ 
          width: '80%',
          height: '40px',
          borderRadius: '30px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
            left: currentLanguage === 'en' ? '4px' : 'calc(50% + 4px)',
            width: 'calc(50% - 8px)',
            height: '32px',
            borderRadius: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transition: 'left 0.3s ease',
            zIndex: 1
          }}
        />
        
        {/* EN Button */}
        <Box
          onClick={() => changeLanguage('en')}
          sx={{
            width: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            position: 'relative',
            fontWeight: currentLanguage === 'en' ? 'bold' : 'normal',
            color: 'white'
          }}
        >
          <Box 
            component="img" 
            src={mapleLeafIcon} 
            alt="Canadian Flag" 
            sx={{ 
              width: '16px', 
              height: '16px', 
              mr: 0.5,
              filter: 'brightness(0) invert(1)',
              opacity: currentLanguage === 'en' ? 1 : 0.8
            }} 
          />
          <MDTypography
            variant="button"
            color="white"
            fontWeight={currentLanguage === 'en' ? 'medium' : 'regular'}
            sx={{ 
              fontSize: '0.85rem',
              letterSpacing: '0.02em'
            }}
          >
            EN
          </MDTypography>
        </Box>
        
        {/* FR Button */}
        <Box
          onClick={() => changeLanguage('fr')}
          sx={{
            width: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            position: 'relative',
            fontWeight: currentLanguage === 'fr' ? 'bold' : 'normal',
            color: 'white'
          }}
        >
          <Box 
            component="img" 
            src={fleurDeLisIcon} 
            alt="Quebec Flag" 
            sx={{ 
              width: '18px', 
              height: '18px', 
              mr: 0.5,
              filter: 'brightness(0) invert(1)' // Always white
            }} 
          />
          <MDTypography
            variant="button"
            color="white"
            fontWeight={currentLanguage === 'fr' ? 'medium' : 'regular'}
            sx={{ 
              fontSize: '0.85rem',
              letterSpacing: '0.02em'
            }}
          >
            FR
          </MDTypography>
        </Box>
      </Box>
    );
  }

  // Original vertical button group layout
  return (
    <MDBox>
      <ButtonGroup variant="outlined" size="small">
        <Button
          onClick={() => changeLanguage('en')}
          variant={currentLanguage === 'en' ? 'contained' : 'outlined'}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            color: currentLanguage === 'en' ? '#FFFFFF' : '#000000',
            bgcolor: currentLanguage === 'en' ? '#5d1c33' : '#FFFFFF',
            borderColor: currentLanguage === 'en' ? '#5d1c33' : '#FFFFFF',
            fontSize: '0.85rem',
            letterSpacing: '0.02em',
            '&:hover': {
              bgcolor: currentLanguage === 'en' ? '#6d2c43' : 'rgba(255, 255, 255, 0.8)',
              borderColor: currentLanguage === 'en' ? '#6d2c43' : '#FFFFFF',
            }
          }}
        >
          <Box 
            component="img" 
            src={mapleLeafIcon} 
            alt="Canadian Flag" 
            sx={{ 
              width: '16px', 
              height: '16px', 
              mr: 0.5,
              filter: currentLanguage === 'en' ? 'brightness(0) invert(1)' : 'none'
            }} 
          />
          EN
        </Button>
        <Button
          onClick={() => changeLanguage('fr')}
          variant={currentLanguage === 'fr' ? 'contained' : 'outlined'}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            color: currentLanguage === 'fr' ? '#FFFFFF' : '#000000',
            bgcolor: currentLanguage === 'fr' ? '#5d1c33' : '#FFFFFF',
            borderColor: currentLanguage === 'fr' ? '#5d1c33' : '#FFFFFF',
            fontSize: '0.85rem',
            letterSpacing: '0.02em',
            '&:hover': {
              bgcolor: currentLanguage === 'fr' ? '#6d2c43' : 'rgba(255, 255, 255, 0.8)',
              borderColor: currentLanguage === 'fr' ? '#6d2c43' : '#FFFFFF',
            }
          }}
        >
          <Box 
            component="img" 
            src={fleurDeLisIcon} 
            alt="Quebec Flag" 
            sx={{ 
              width: '18px', 
              height: '18px', 
              mr: 0.5,
              filter: currentLanguage === 'fr' ? 'brightness(0) invert(1)' : 'none'
            }} 
          />
          FR
        </Button>
      </ButtonGroup>
    </MDBox>
  );
};

export default LanguageSwitcher; 