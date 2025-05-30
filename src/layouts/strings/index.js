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

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";

// @mui icons
import SearchIcon from "@mui/icons-material/Search";
import LoginIcon from "@mui/icons-material/Login";
import TranslateIcon from "@mui/icons-material/Translate";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoIcon from "@mui/icons-material/Info";
import FilterListIcon from "@mui/icons-material/FilterList";

// Material Dashboard 2 React components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ConnectionError from "components/ConnectionError";

// Custom components
import StringsDataGrid from "components/StringsDataGrid";

// Theme and styling
import { THEME, componentStyles } from "config/theme";

// Parse
import Parse from 'parse';

function Strings() {
  const { t, i18n } = useTranslation();
  
  const [language, setLanguage] = useState("both"); // en, fr, or both
  const [strings, setStrings] = useState({});
  const [frenchStrings, setFrenchStrings] = useState({});
  const [englishStrings, setEnglishStrings] = useState({});
  const [modifiedStrings, setModifiedStrings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modifiedFilter, setModifiedFilter] = useState('all'); // 'all', 'modified', 'unmodified'
  const [authError, setAuthError] = useState(false);
  const [testMode, setTestMode] = useState(null); // 'network', 'server', 'parse', null

  // Check authentication status
  useEffect(() => {
    try {
      const currentUser = Parse.User.current();
      if (!currentUser) {
        console.warn('No authenticated user found - strings page may have limited functionality');
        setAuthError(true);
      } else {
        setAuthError(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      
      // Check if it's a Parse Server connection error
      if (error.message && (error.message.includes('XMLHttpRequest failed') || error.message.includes('Parse API'))) {
        setConnectionError({
          type: 'parse',
          title: t('strings.errors.serverError'),
          message: t('strings.errors.serverMessage')
        });
      }
      
      setAuthError(true);
    }
  }, [t]);

  // Auto-load strings when component mounts
  useEffect(() => {
    console.log(`🚀 Component mounted, auto-loading strings for language: ${language}`);
    if (language === "both") {
      loadStrings("en");
      loadStrings("fr");
    } else {
      loadStrings(language);
    }
  }, []); // Only run on mount

  // Load strings when language changes
  useEffect(() => {
    if (language) {
      console.log(`🔄 Language changed to: ${language}, reloading strings`);
      if (language === "both") {
        loadStrings("en");
        loadStrings("fr");
      } else {
        loadStrings(language);
      }
    }
  }, [language]); // Run when language changes

  // Load strings from XML files
  const loadStrings = async (lang) => {
    setLoading(true);
    setError(null);
    setConnectionError(null);
    
    try {
      console.log(`🔄 Loading strings for language: ${lang}`);
      console.log(`📁 Attempting to fetch from: /assets/i18n/${lang}/strings.xml`);
      
      // Simulate different types of errors in test mode
      if (testMode === 'network') {
        throw new TypeError('Failed to fetch');
      } else if (testMode === 'server') {
        throw new Error('HTTP 500: Internal Server Error');
      } else if (testMode === 'parse') {
        throw new Error('XMLHttpRequest failed: "Unable to connect to the Parse API"');
      }
      
      const response = await fetch(`/assets/i18n/${lang}/strings.xml`);
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load ${lang} strings from /assets/i18n/${lang}/strings.xml`);
      }
      
      const xmlText = await response.text();
      console.log(`📄 Received XML text for ${lang}, length: ${xmlText.length} characters`);
      console.log(`📄 First 200 characters: ${xmlText.substring(0, 200)}...`);
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      // Check for XML parsing errors
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        console.error(`❌ XML parsing error:`, parseError[0].textContent);
        throw new Error(`XML parsing error: ${parseError[0].textContent}`);
      }
      
      const stringElements = xmlDoc.getElementsByTagName("string");
      const parsedStrings = {};
      
      console.log(`🔍 Found ${stringElements.length} string elements in ${lang} XML`);
      
      for (let i = 0; i < stringElements.length; i++) {
        const element = stringElements[i];
        const name = element.getAttribute("name");
        const value = element.textContent;
        if (name && value !== undefined) {
          parsedStrings[name] = value;
        }
      }
      
      console.log(`✅ Successfully parsed ${Object.keys(parsedStrings).length} strings for ${lang}`);
      console.log(`📋 Sample strings:`, Object.keys(parsedStrings).slice(0, 5));
      console.log(`📋 Sample string values:`, Object.keys(parsedStrings).slice(0, 3).map(key => ({ key, value: parsedStrings[key] })));
      
      if (lang === 'fr') {
        setFrenchStrings(parsedStrings);
        setStrings(frenchStrings);
      } else if (lang === 'en') {
        setEnglishStrings(parsedStrings);
        setStrings(englishStrings);
      } else {
        setStrings(parsedStrings);
      }
      console.log(`🎯 Strings state updated with ${Object.keys(parsedStrings).length} entries`);
      
      // Clear any previous errors and test mode
      setError(null);
      setConnectionError(null);
      setTestMode(null);
      
    } catch (err) {
      console.error("❌ Error loading strings:", err);
      console.error("❌ Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // Categorize error types
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        // Network error
        setConnectionError({
          type: 'network',
          title: t('strings.errors.networkError'),
          message: t('strings.errors.networkMessage')
        });
      } else if (err.message.includes('XMLHttpRequest failed') || err.message.includes('Parse API')) {
        // Parse Server error
        setConnectionError({
          type: 'parse',
          title: t('strings.errors.serverError'),
          message: t('strings.errors.serverMessage')
        });
      } else if (err.message.includes('HTTP 404') || err.message.includes('HTTP 500')) {
        // Server error
        setConnectionError({
          type: 'server',
          title: t('strings.errors.parseError'),
          message: t('strings.errors.parseMessage', { error: err.message })
        });
      } else {
        // Generic error
        setError(t('strings.errors.loadFailed', { language: lang, error: err.message }));
      }
      
      // Set empty strings object on error
      if (lang === 'fr') {
        setFrenchStrings({});
        setStrings(frenchStrings);
      } else if (lang === 'en') {
        setEnglishStrings({});
        setStrings(englishStrings);
      } else {
        setStrings({});
      }
      console.log(`🔄 Set empty strings object due to error`);
    } finally {
      setLoading(false);
      console.log(`🏁 Loading completed for ${lang}`);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLang) => {
    if (loading || newLang === language) return;
    
    setLanguage(newLang);
    setModifiedStrings({}); // Clear modifications when switching languages
    setSearchTerm(""); // Clear search
  };

  // Get unique categories for filter
  const getUniqueCategories = () => {
    const allData = language === "both" 
      ? Array.from(new Set([...Object.keys(englishStrings), ...Object.keys(frenchStrings)]))
      : Object.keys(language === 'en' ? englishStrings : frenchStrings);
    
    const getCategory = (key) => {
      if (key.includes('welcome') || key.includes('onboard') || key.includes('start')) {
        return t('strings.categories.welcome');
      } else if (key.includes('login') || key.includes('signup') || key.includes('auth') || key.includes('psw')) {
        return t('strings.categories.authentication');
      } else if (key.includes('profile') || key.includes('account') || key.includes('setting')) {
        return t('strings.categories.profile');
      } else if (key.includes('valid') || key.includes('form') || key.includes('input')) {
        return t('strings.categories.forms');
      } else if (key.includes('btn') || key.includes('nav') || key.includes('menu') || key.includes('cancel') || key.includes('next') || key.includes('back')) {
        return t('strings.categories.navigation');
      } else if (key.includes('error') || key.includes('invalid') || key.includes('fail') || key.includes('wrong')) {
        return t('strings.categories.errors');
      } else {
        return t('strings.categories.other');
      }
    };
    
    return [...new Set(allData.map(key => getCategory(key)))].sort();
  };

  // Handle string modification
  const handleStringModified = (key, newValue) => {
    const originalValue = language === 'en' ? englishStrings[key] : frenchStrings[key];
    
    if (newValue !== originalValue) {
      setModifiedStrings(prev => ({
        ...prev,
        [key]: newValue
      }));
    } else {
      // If value is same as original, remove from modified strings
      setModifiedStrings(prev => {
        const newModified = { ...prev };
        delete newModified[key];
        return newModified;
      });
    }
  };

  // Handle reset string to original value
  const handleStringReset = (key) => {
    setModifiedStrings(prev => {
      const newModified = { ...prev };
      delete newModified[key];
      return newModified;
    });
  };

  // Retry loading strings
  const handleRetry = () => {
    setConnectionError(null);
    setError(null);
    loadStrings(language);
  };

  // Clear session and redirect to login
  const handleLoginRedirect = () => {
    try {
      localStorage.clear();
      if (Parse.User.current()) {
        Parse.User.logOut();
      }
      window.location.href = '/authentication/login';
    } catch (error) {
      console.error('Error clearing session:', error);
      window.location.href = '/authentication/login';
    }
  };

  // Generate XML content for modified strings
  const generateModifiedXML = () => {
    if (Object.keys(modifiedStrings).length === 0) {
      return null;
    }

    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<resources>\n';
    
    // Add comments to indicate this is a modified strings file
    xmlContent += `<!--Modified strings for ${language.toUpperCase()} - Generated by PsyPsy CMS-->\n`;
    xmlContent += `<!--Original strings.xml should be updated with these changes-->\n\n`;
    
    // Add only modified strings
    Object.entries(modifiedStrings).forEach(([key, value]) => {
      // Escape XML special characters
      const escapedValue = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      
      xmlContent += `    <string name="${key}">${escapedValue}</string>\n`;
    });
    
    xmlContent += '</resources>';
    return xmlContent;
  };

  // Save modified strings to strings2.xml
  const saveModifiedStrings = async () => {
    if (Object.keys(modifiedStrings).length === 0) {
      setError(t('strings.messages.noModifications'));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const xmlContent = generateModifiedXML();
      
      // Create a blob and download link
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `strings2_${language}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess(t('strings.messages.exportSuccess', { 
        language: language, 
        count: Object.keys(modifiedStrings).length 
      }));
      
      // Clear modifications after successful save
      setTimeout(() => {
        setModifiedStrings({});
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("Error saving strings:", err);
      setError(t('strings.errors.saveFailed', { error: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ overflow: 'visible', minWidth: '1000px' }}>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={3}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={componentStyles.pageHeader}
              >
                <MDBox>
                  <MDTypography variant="h5" color="white" display="flex" alignItems="center" fontWeight="bold">
                    <TranslateIcon sx={{ mr: 1.5, fontSize: 28 }} />
                    {t('strings.title')}
                  </MDTypography>
                  <MDTypography variant="body2" color="white" opacity={0.9} mt={0.5}>
                    {t('strings.subtitle')}
                  </MDTypography>
                </MDBox>
                
                {/* Fixed Language Toggle */}
                <MDBox 
                  display="flex" 
                  flexDirection="column"
                  alignItems="flex-end"
                  gap={1}
                >
                  <MDBox
                    sx={{ 
                      width: THEME.components.languageToggle.containerWidth,
                      height: THEME.components.languageToggle.containerHeight,
                      borderRadius: THEME.components.languageToggle.borderRadius,
                      backgroundColor: THEME.components.languageToggle.backgroundColor,
                      position: 'relative',
                      p: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Sliding Indicator */}
                    <MDBox
                      sx={{
                        position: 'absolute',
                        left: language === 'both' ? '4px' : language === 'en' ? 'calc(33.33% + 2px)' : 'calc(66.66% + 2px)',
                        width: 'calc(33.33% - 4px)',
                        height: '32px',
                        borderRadius: '24px',
                        backgroundColor: THEME.components.languageToggle.indicatorColor,
                        transition: THEME.components.languageToggle.transition,
                        zIndex: 1
                      }}
                    />
                    
                    {/* BOTH Button - Now First */}
                    <MDBox
                      onClick={() => !loading && handleLanguageChange('both')}
                      sx={{
                        width: '33.33%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        zIndex: 2,
                        position: 'relative',
                      }}
                    >
                      <MDTypography
                        variant="button"
                        color="white"
                        fontWeight={language === 'both' ? 'medium' : 'regular'}
                        sx={{ 
                          fontSize: THEME.typography.sizeSM,
                          letterSpacing: '0.02em',
                          opacity: language === 'both' ? 1 : 0.8
                        }}
                      >
                        {t('strings.both')}
                      </MDTypography>
                    </MDBox>

                    {/* EN Button - Now Second */}
                    <MDBox
                        onClick={() => !loading && handleLanguageChange('en')}
                      sx={{
                        width: '33.33%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        zIndex: 2,
                        position: 'relative',
                      }}
                    >
                      <MDTypography
                        variant="button"
                        color="white"
                        fontWeight={language === 'en' ? 'medium' : 'regular'}
                        sx={{ 
                          fontSize: THEME.typography.sizeSM,
                          letterSpacing: '0.02em',
                          opacity: language === 'en' ? 1 : 0.8
                        }}
                      >
                        {t('strings.english')}
                      </MDTypography>
                    </MDBox>
                      
                    {/* FR Button - Now Third */}
                    <MDBox
                        onClick={() => !loading && handleLanguageChange('fr')}
                      sx={{
                        width: '33.33%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        zIndex: 2,
                        position: 'relative',
                      }}
                    >
                      <MDTypography
                        variant="button"
                        color="white"
                        fontWeight={language === 'fr' ? 'medium' : 'regular'}
                        sx={{ 
                          fontSize: THEME.typography.sizeSM,
                          letterSpacing: '0.02em',
                          opacity: language === 'fr' ? 1 : 0.8
                        }}
                      >
                        {t('strings.french')}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  
                  {loading && (
                    <CircularProgress 
                      size={18} 
                      sx={{ 
                        color: 'white',
                      }} 
                    />
                  )}
                </MDBox>
              </MDBox>
              
              <MDBox p={3}>
                {/* Fixed Height Container to Prevent Layout Shifts */}
                <MDBox 
                  sx={{ 
                    minHeight: '800px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Authentication Warning */}
                  {authError && (
                    <Alert 
                      severity="warning" 
                      sx={{ mb: 3, borderRadius: 2 }}
                      action={
                        <MDButton
                          size="small"
                          color="warning"
                          onClick={handleLoginRedirect}
                          startIcon={<LoginIcon />}
                        >
                          {t('strings.messages.loginButton')}
                        </MDButton>
                      }
                    >
                      <strong>{t('strings.messages.authRequired')}</strong> {t('strings.messages.authMessage')}
                    </Alert>
                  )}

                  {/* Search and Actions */}
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder={t('strings.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={componentStyles.searchInput}
                    />
                    
                    {/* Category Filter */}
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>{t('strings.filters.category')}</InputLabel>
                      <Select
                        value={categoryFilter}
                        label={t('strings.filters.category')}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} />}
                      >
                        <MenuItem value="all">{t('strings.filters.allCategories')}</MenuItem>
                        {getUniqueCategories().map(category => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Modified Status Filter */}
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel>{t('strings.filters.status')}</InputLabel>
                      <Select
                        value={modifiedFilter}
                        label={t('strings.filters.status')}
                        onChange={(e) => setModifiedFilter(e.target.value)}
                      >
                        <MenuItem value="all">{t('strings.filters.allStrings')}</MenuItem>
                        <MenuItem value="modified">{t('strings.filters.modifiedOnly')}</MenuItem>
                        <MenuItem value="unmodified">{t('strings.filters.unmodifiedOnly')}</MenuItem>
                      </Select>
                    </FormControl>
                    
                    {/* Save Button */}
                    {Object.keys(modifiedStrings).length > 0 && (
                      <MDButton
                        variant="gradient"
                        color="success"
                        onClick={saveModifiedStrings}
                        disabled={loading}
                        startIcon={<FileDownloadIcon />}
                        sx={{ 
                          minWidth: 200,
                          borderRadius: THEME.components.button.borderRadius,
                          fontSize: THEME.components.button.fontSize,
                          fontWeight: THEME.components.button.fontWeight,
                        }}
                      >
                        {loading ? t('strings.generating') : t('strings.export', { count: Object.keys(modifiedStrings).length })}
                      </MDButton>
                    )}
                  </Stack>

                  {/* Active Filters Indicator */}
                  {(categoryFilter !== 'all' || modifiedFilter !== 'all' || searchTerm) && (
                    <MDBox 
                      display="flex" 
                      alignItems="center" 
                      gap={1} 
                      flexWrap="wrap"
                      p={2}
                      mb={2}
                      sx={{ 
                        backgroundColor: THEME.colors.backgroundSubtle, 
                        borderRadius: THEME.borderRadius.md,
                        border: `1px solid ${THEME.colors.border}`
                      }}
                    >
                      <MDTypography variant="body2" fontWeight="medium" color="text">
                        {t('strings.activeFilters')}:
                      </MDTypography>
                      
                      {searchTerm && (
                        <Chip
                          label={`${t('common.search')}: "${searchTerm}"`}
                          size="small"
                          onDelete={() => setSearchTerm('')}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      
                      {categoryFilter !== 'all' && (
                        <Chip
                          label={`${t('strings.filters.category')}: ${categoryFilter}`}
                          size="small"
                          onDelete={() => setCategoryFilter('all')}
                          color="info"
                          variant="outlined"
                        />
                      )}
                      
                      {modifiedFilter !== 'all' && (
                        <Chip
                          label={`${t('strings.filters.status')}: ${modifiedFilter === 'modified' ? t('strings.filters.modifiedOnly') : t('strings.filters.unmodifiedOnly')}`}
                          size="small"
                          onDelete={() => setModifiedFilter('all')}
                          color="warning"
                          variant="outlined"
                        />
                      )}
                      
                      <MDButton
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setSearchTerm('');
                          setCategoryFilter('all');
                          setModifiedFilter('all');
                        }}
                        sx={{ ml: 1 }}
                      >
                        {t('strings.clearAll')}
                      </MDButton>
                    </MDBox>
                  )}

                  {/* Error/Success Messages */}
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                      {success}
                    </Alert>
                  )}

                  {/* Connection Error */}
                  {connectionError && (
                    <MDBox sx={{ mb: 3 }}>
                      <ConnectionError
                        title={connectionError.title}
                        message={connectionError.message}
                        type={connectionError.type}
                        onRetry={handleRetry}
                        variant="card"
                      />
                    </MDBox>
                  )}

                  {/* Strings DataGrid with Fixed Height */}
                  <MDBox sx={{ flex: 1, minHeight: '600px' }}>
                    <StringsDataGrid
                      language={language}
                      englishStrings={englishStrings}
                      frenchStrings={frenchStrings}
                      modifiedStrings={modifiedStrings}
                      onStringModified={handleStringModified}
                      onStringReset={handleStringReset}
                      searchTerm={searchTerm}
                      categoryFilter={categoryFilter}
                      modifiedFilter={modifiedFilter}
                      height={600}
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Strings; 