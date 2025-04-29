import { useTranslation } from 'react-i18next';

// @mui material components
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';

// Material Dashboard 2 React components
import MDBox from './MDBox';

// Import SVG icons
import mapleLeafIcon from '../assets/images/icons/flags/maple-leaf.svg';
import fleurDeLisIcon from '../assets/images/icons/flags/fleur-de-lis.svg';

const LanguageSwitcher = ({ iconColor }) => {
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
            bgcolor: currentLanguage === 'en' ? '#899581' : '#FFFFFF',
            borderColor: currentLanguage === 'en' ? '#899581' : '#FFFFFF',
            '&:hover': {
              bgcolor: currentLanguage === 'en' ? '#A9AC99' : 'rgba(255, 255, 255, 0.8)',
              borderColor: currentLanguage === 'en' ? '#A9AC99' : '#FFFFFF',
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
            bgcolor: currentLanguage === 'fr' ? '#899581' : '#FFFFFF',
            borderColor: currentLanguage === 'fr' ? '#899581' : '#FFFFFF',
            '&:hover': {
              bgcolor: currentLanguage === 'fr' ? '#A9AC99' : 'rgba(255, 255, 255, 0.8)',
              borderColor: currentLanguage === 'fr' ? '#A9AC99' : '#FFFFFF',
            }
          }}
        >
          <Box 
            component="img" 
            src={fleurDeLisIcon} 
            alt="Quebec Flag" 
            sx={{ 
              width: '16px', 
              height: '16px', 
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