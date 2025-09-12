/**
 * Firebase Login Component
 * 
 * Updated login component that uses Firebase Authentication
 * instead of Parse Server authentication
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Firebase services
import firebaseAuthService from "../../../services/firebaseAuthService";

// Images
import bgImage from "assets/images/montreal_green.png";

// Language switcher component
import LanguageSwitcher from "components/LanguageSwitcher";

function FirebaseLogin() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [formState, setFormState] = useState({
    isLoading: false,
    error: null,
    showPassword: false
  });

  // Check if user is already authenticated
  useEffect(() => {
    const currentUser = firebaseAuthService.getCurrentUser();
    if (currentUser) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [navigate]);

  // Handle form input changes
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setFormState(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    setFormState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      console.log('Attempting Firebase login...');
      
      const result = await firebaseAuthService.login(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      console.log('Firebase login successful:', result.user.email);

      // Navigate to the intended destination or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });

    } catch (error) {
      console.error('Firebase login error:', error);
      
      setFormState(prev => ({
        ...prev,
        error: error.message || 'Login failed. Please try again.',
        isLoading: false
      }));
    }
  };

  // Handle language change
  const handleLanguageChange = () => {
    const newLanguage = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setFormState(prev => ({
        ...prev,
        error: 'Please enter your email address first.'
      }));
      return;
    }

    setFormState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      await firebaseAuthService.resetPassword(formData.email);
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));
      
      // Show success message (you could use a snackbar here)
      alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to send password reset email.'
      }));
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="success"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {t('authentication.signIn')}
          </MDTypography>
          
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <InstagramIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={handleLanguageChange} sx={{ color: 'white' }}>
                <LanguageIcon />
              </IconButton>
            </Grid>
          </Grid>
        </MDBox>
        
        <MDBox pt={4} pb={3} px={3}>
          {formState.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formState.error}
            </Alert>
          )}
          
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <TextField
                fullWidth
                id="email"
                name="email"
                type="email"
                label={t('authentication.email')}
                value={formData.email}
                onChange={handleInputChange}
                disabled={formState.isLoading}
                required
                variant="outlined"
                autoComplete="email"
              />
            </MDBox>
            
            <MDBox mb={2}>
              <TextField
                fullWidth
                id="password"
                name="password"
                type={formState.showPassword ? 'text' : 'password'}
                label={t('authentication.password')}
                value={formData.password}
                onChange={handleInputChange}
                disabled={formState.isLoading}
                required
                variant="outlined"
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={formState.isLoading}
                    >
                      {formState.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </MDBox>
            
            <MDBox display="flex" alignItems="center" ml={-1}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={formState.isLoading}
                    color="success"
                  />
                }
                label={
                  <MDTypography
                    variant="button"
                    fontWeight="regular"
                    color="text"
                    sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                  >
                    &nbsp;&nbsp;{t('authentication.rememberMe')}
                  </MDTypography>
                }
              />
            </MDBox>
            
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="success"
                fullWidth
                type="submit"
                disabled={formState.isLoading || !formData.email || !formData.password}
              >
                {formState.isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  t('authentication.signIn')
                )}
              </MDButton>
            </MDBox>
            
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography 
                variant="button" 
                color="text"
                component="button"
                type="button"
                onClick={handleForgotPassword}
                disabled={formState.isLoading}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    opacity: 0.8
                  },
                  '&:disabled': {
                    cursor: 'not-allowed',
                    opacity: 0.5
                  }
                }}
              >
                {t('authentication.forgotPassword')}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
      
      <MDBox mt={2} textAlign="center">
        <LanguageSwitcher />
      </MDBox>
    </BasicLayout>
  );
}

export default FirebaseLogin;