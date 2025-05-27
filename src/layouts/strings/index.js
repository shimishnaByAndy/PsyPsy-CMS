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

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

// @mui icons
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import RestoreIcon from "@mui/icons-material/Restore";
import LoginIcon from "@mui/icons-material/Login";
import TranslateIcon from "@mui/icons-material/Translate";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoIcon from "@mui/icons-material/Info";

// Material Dashboard 2 React components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import SimpleErrorMessage from "components/SimpleErrorMessage";

// Parse
import Parse from 'parse';

function Strings() {
  const [language, setLanguage] = useState("en"); // en or fr
  const [strings, setStrings] = useState({});
  const [modifiedStrings, setModifiedStrings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [authError, setAuthError] = useState(false);

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
      setAuthError(true);
    }
  }, []);

  // Load strings from XML files
  const loadStrings = async (lang) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading strings for language: ${lang}`);
      const response = await fetch(`/assets/i18n/${lang}/strings.xml`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load ${lang} strings from /assets/i18n/${lang}/strings.xml`);
      }
      
      const xmlText = await response.text();
      console.log(`Received XML text for ${lang}, length: ${xmlText.length} characters`);
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      // Check for XML parsing errors
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error(`XML parsing error: ${parseError[0].textContent}`);
      }
      
      const stringElements = xmlDoc.getElementsByTagName("string");
      const parsedStrings = {};
      
      console.log(`Found ${stringElements.length} string elements in ${lang} XML`);
      
      for (let i = 0; i < stringElements.length; i++) {
        const element = stringElements[i];
        const name = element.getAttribute("name");
        const value = element.textContent;
        if (name && value !== undefined) {
          parsedStrings[name] = value;
        }
      }
      
      setStrings(parsedStrings);
      console.log(`Successfully loaded ${Object.keys(parsedStrings).length} strings for ${lang}`);
      
      // Clear any previous errors
      setError(null);
      
    } catch (err) {
      console.error("Error loading strings:", err);
      setError(`Failed to load ${lang} strings: ${err.message}`);
      
      // Set empty strings object on error
      setStrings({});
    } finally {
      setLoading(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLang) => {
    if (loading || newLang === language) return;
    
    setLanguage(newLang);
    setModifiedStrings({}); // Clear modifications when switching languages
    setEditingKey(null); // Clear editing state
    setSearchTerm(""); // Clear search
    setPage(0); // Reset pagination
  };

  // Load strings when language changes
  useEffect(() => {
    loadStrings(language);
  }, [language]);

  // Generate category for a string key
  const getCategory = (key) => {
    if (key.includes('welcome') || key.includes('onboard') || key.includes('start')) {
      return 'Welcome & Onboarding';
    } else if (key.includes('login') || key.includes('signup') || key.includes('auth') || key.includes('psw')) {
      return 'Authentication';
    } else if (key.includes('profile') || key.includes('account') || key.includes('setting')) {
      return 'Profile & Settings';
    } else if (key.includes('valid') || key.includes('form') || key.includes('input')) {
      return 'Forms & Validation';
    } else if (key.includes('btn') || key.includes('nav') || key.includes('menu') || key.includes('cancel') || key.includes('next') || key.includes('back')) {
      return 'Navigation & UI';
    } else if (key.includes('error') || key.includes('invalid') || key.includes('fail') || key.includes('wrong')) {
      return 'Errors & Messages';
    } else {
      return 'Other';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Welcome & Onboarding': 'success',
      'Authentication': 'warning',
      'Profile & Settings': 'info',
      'Forms & Validation': 'primary',
      'Navigation & UI': 'secondary',
      'Errors & Messages': 'error',
      'Other': 'default'
    };
    return colors[category] || 'default';
  };

  // Filter and prepare data
  const filteredData = useMemo(() => {
    const data = Object.entries(strings).map(([key, value]) => ({
      key,
      originalValue: value,
      currentValue: modifiedStrings[key] !== undefined ? modifiedStrings[key] : value,
      category: getCategory(key),
      isModified: modifiedStrings[key] !== undefined,
    }));

    if (searchTerm) {
      return data.filter(item => 
        item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.originalValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.currentValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [strings, modifiedStrings, searchTerm]);

  // Handle pagination
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Handle edit start
  const handleEditStart = (key, value) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  // Handle edit save
  const handleEditSave = (key) => {
    if (editingValue !== strings[key]) {
      setModifiedStrings(prev => ({
        ...prev,
        [key]: editingValue
      }));
    } else {
      // If value is same as original, remove from modified strings
      setModifiedStrings(prev => {
        const newModified = { ...prev };
        delete newModified[key];
        return newModified;
      });
    }
    setEditingKey(null);
    setEditingValue("");
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingKey(null);
    setEditingValue("");
  };

  // Handle reset string to original value
  const handleResetString = (key) => {
    setModifiedStrings(prev => {
      const newModified = { ...prev };
      delete newModified[key];
      return newModified;
    });
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
      setError("No modifications to save");
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
      
      setSuccess(`Successfully generated strings2_${language}.xml with ${Object.keys(modifiedStrings).length} modified strings`);
      
      // Clear modifications after successful save
      setTimeout(() => {
        setModifiedStrings({});
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("Error saving strings:", err);
      setError(`Failed to save strings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ overflow: 'visible' }}>
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
              >
                <MDBox>
                  <MDTypography variant="h5" color="white" display="flex" alignItems="center" fontWeight="bold">
                    <TranslateIcon sx={{ mr: 1.5, fontSize: 28 }} />
                    String Management
                  </MDTypography>
                  <MDTypography variant="body2" color="white" opacity={0.9} mt={0.5}>
                    Manage application strings for different languages
                  </MDTypography>
                </MDBox>
                
                {/* Enhanced Language Toggle */}
                <MDBox display="flex" alignItems="center" gap={2}>
                  <MDBox 
                    display="flex" 
                    alignItems="center" 
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: 3,
                      padding: '8px 16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <MDTypography variant="button" color="white" mr={2} fontWeight="medium">
                      Language:
                    </MDTypography>
                    
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label="EN" 
                        size="small" 
                        onClick={() => !loading && handleLanguageChange('en')}
                        sx={{ 
                          backgroundColor: language === 'en' ? 'white' : 'rgba(255, 255, 255, 0.2)',
                          color: language === 'en' ? 'info.main' : 'white',
                          fontWeight: 'bold',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          minWidth: 40,
                          '&:hover': {
                            backgroundColor: language === 'en' ? 'white' : 'rgba(255, 255, 255, 0.3)',
                          }
                        }}
                      />
                      
                      <MDTypography variant="body2" color="white" mx={0.5}>
                        |
                      </MDTypography>
                      
                      <Chip 
                        label="FR" 
                        size="small" 
                        onClick={() => !loading && handleLanguageChange('fr')}
                        sx={{ 
                          backgroundColor: language === 'fr' ? 'white' : 'rgba(255, 255, 255, 0.2)',
                          color: language === 'fr' ? 'info.main' : 'white',
                          fontWeight: 'bold',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          minWidth: 40,
                          '&:hover': {
                            backgroundColor: language === 'fr' ? 'white' : 'rgba(255, 255, 255, 0.3)',
                          }
                        }}
                      />
                    </MDBox>
                    
                    {loading && (
                      <CircularProgress size={16} sx={{ ml: 1.5, color: 'white' }} />
                    )}
                  </MDBox>
                </MDBox>
              </MDBox>
              
              <MDBox p={3}>
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
                        Login
                      </MDButton>
                    }
                  >
                    <strong>Authentication Required:</strong> You are not logged in. 
                    Some features may be limited. Please log in for full functionality.
                  </Alert>
                )}

                {/* Statistics Cards */}
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'grey.50' }}>
                      <MDTypography variant="h4" color="info" fontWeight="bold">
                        {loading ? "..." : Object.keys(strings).length}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Total Strings
                      </MDTypography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'warning.light', color: 'white' }}>
                      <MDTypography variant="h4" color="white" fontWeight="bold">
                        {Object.keys(modifiedStrings).length}
                      </MDTypography>
                      <MDTypography variant="caption" color="white">
                        Modified
                      </MDTypography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'success.light', color: 'white' }}>
                      <MDTypography variant="h4" color="white" fontWeight="bold">
                        {filteredData.length}
                      </MDTypography>
                      <MDTypography variant="caption" color="white">
                        Showing
                      </MDTypography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'info.light', color: 'white' }}>
                      <MDTypography variant="h4" color="white" fontWeight="bold">
                        {new Set(filteredData.map(item => item.category)).size}
                      </MDTypography>
                      <MDTypography variant="caption" color="white">
                        Categories
                      </MDTypography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Search and Actions */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search strings by key, value, or category..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(0); // Reset pagination when searching
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  
                  {/* Save Button */}
                  {Object.keys(modifiedStrings).length > 0 && (
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={saveModifiedStrings}
                      disabled={loading}
                      startIcon={<FileDownloadIcon />}
                      sx={{ minWidth: 200 }}
                    >
                      {loading ? "Generating..." : `Export ${Object.keys(modifiedStrings).length} Changes`}
                    </MDButton>
                  )}
                </Stack>

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

                {/* Table */}
                <Card sx={{ overflow: 'hidden', borderRadius: 2 }}>
                  <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            backgroundColor: 'grey.100',
                            borderBottom: '2px solid',
                            borderColor: 'grey.300',
                            width: '20%',
                            minWidth: 180,
                            fontSize: '0.875rem'
                          }}>
                            <MDBox display="flex" alignItems="center">
                              <MDTypography variant="button" fontWeight="bold" color="text">
                                String Key
                              </MDTypography>
                            </MDBox>
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            backgroundColor: 'grey.100',
                            borderBottom: '2px solid',
                            borderColor: 'grey.300',
                            width: '15%',
                            minWidth: 120,
                            textAlign: 'center'
                          }}>
                            <MDBox display="flex" alignItems="center" justifyContent="center">
                              <MDTypography variant="button" fontWeight="bold" color="text">
                                Category
                              </MDTypography>
                            </MDBox>
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            backgroundColor: 'grey.100',
                            borderBottom: '2px solid',
                            borderColor: 'grey.300',
                            width: '25%',
                            minWidth: 200
                          }}>
                            <MDBox display="flex" alignItems="center">
                              <MDTypography variant="button" fontWeight="bold" color="text">
                                Original Value
                              </MDTypography>
                            </MDBox>
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            backgroundColor: 'grey.100',
                            borderBottom: '2px solid',
                            borderColor: 'grey.300',
                            width: '25%',
                            minWidth: 200
                          }}>
                            <MDBox display="flex" alignItems="center">
                              <MDTypography variant="button" fontWeight="bold" color="text">
                                Current Value
                              </MDTypography>
                            </MDBox>
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            backgroundColor: 'grey.100',
                            borderBottom: '2px solid',
                            borderColor: 'grey.300',
                            width: '15%',
                            minWidth: 120,
                            textAlign: 'center'
                          }}>
                            <MDBox display="flex" alignItems="center" justifyContent="center">
                              <MDTypography variant="button" fontWeight="bold" color="text">
                                Actions
                              </MDTypography>
                            </MDBox>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((row, index) => (
                          <TableRow 
                            key={row.key}
                            sx={{ 
                              backgroundColor: row.isModified ? 'warning.light' : (index % 2 === 0 ? 'grey.50' : 'white'),
                              '&:hover': { 
                                backgroundColor: row.isModified ? 'warning.main' : 'grey.100',
                                '& .MuiTableCell-root': {
                                  color: row.isModified ? 'white' : 'inherit'
                                }
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <TableCell sx={{ 
                              width: '20%',
                              minWidth: 180,
                              maxWidth: 180,
                              padding: '12px 16px',
                              verticalAlign: 'top'
                            }}>
                              <MDTypography 
                                variant="caption" 
                                fontWeight="bold" 
                                color="text"
                                sx={{
                                  wordBreak: 'break-word',
                                  fontSize: '0.75rem',
                                  lineHeight: 1.4
                                }}
                              >
                                {row.key}
                              </MDTypography>
                            </TableCell>
                            <TableCell sx={{ 
                              width: '15%',
                              minWidth: 120,
                              maxWidth: 120,
                              padding: '12px 8px',
                              textAlign: 'center',
                              verticalAlign: 'top'
                            }}>
                              <Chip 
                                label={row.category} 
                                size="small" 
                                color={getCategoryColor(row.category)}
                                variant="outlined"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 24,
                                  maxWidth: '100%',
                                  '& .MuiChip-label': {
                                    padding: '0 8px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ 
                              width: '25%',
                              minWidth: 200,
                              maxWidth: 200,
                              padding: '12px 16px',
                              verticalAlign: 'top'
                            }}>
                              <MDTypography 
                                variant="body2" 
                                color="text" 
                                sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 4,
                                  WebkitBoxOrient: 'vertical',
                                  fontSize: '0.8rem',
                                  lineHeight: 1.4,
                                  wordBreak: 'break-word'
                                }}
                              >
                                {row.originalValue}
                              </MDTypography>
                            </TableCell>
                            <TableCell sx={{ 
                              width: '25%',
                              minWidth: 200,
                              maxWidth: 200,
                              padding: '12px 16px',
                              verticalAlign: 'top'
                            }}>
                              {editingKey === row.key ? (
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={4}
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  variant="outlined"
                                  size="small"
                                  autoFocus
                                  sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                      fontSize: '0.8rem'
                                    },
                                    '& .MuiInputBase-input': {
                                      padding: '8px 12px'
                                    }
                                  }}
                                />
                              ) : (
                                <MDTypography 
                                  variant="body2" 
                                  color="text" 
                                  sx={{ 
                                    whiteSpace: 'pre-wrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                    fontSize: '0.8rem',
                                    lineHeight: 1.4,
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {row.currentValue}
                                </MDTypography>
                              )}
                            </TableCell>
                            <TableCell sx={{ 
                              width: '15%',
                              minWidth: 120,
                              maxWidth: 120,
                              padding: '12px 8px',
                              textAlign: 'center',
                              verticalAlign: 'top'
                            }}>
                              <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="flex-start">
                                {editingKey === row.key ? (
                                  <>
                                    <Tooltip title="Save Changes">
                                      <IconButton 
                                        size="small" 
                                        color="success"
                                        onClick={() => handleEditSave(row.key)}
                                        sx={{ 
                                          backgroundColor: 'success.light',
                                          '&:hover': { backgroundColor: 'success.main' },
                                          width: 32,
                                          height: 32
                                        }}
                                      >
                                        <SaveIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancel Edit">
                                      <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={handleEditCancel}
                                        sx={{ 
                                          backgroundColor: 'error.light',
                                          '&:hover': { backgroundColor: 'error.main' },
                                          width: 32,
                                          height: 32
                                        }}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                ) : (
                                  <>
                                    <Tooltip title="Edit String">
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleEditStart(row.key, row.currentValue)}
                                        sx={{ 
                                          backgroundColor: 'primary.light',
                                          '&:hover': { backgroundColor: 'primary.main' },
                                          width: 32,
                                          height: 32
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    {row.isModified && (
                                      <Tooltip title="Reset to Original">
                                        <IconButton 
                                          size="small" 
                                          color="warning"
                                          onClick={() => handleResetString(row.key)}
                                          sx={{ 
                                            backgroundColor: 'warning.light',
                                            '&:hover': { backgroundColor: 'warning.main' },
                                            width: 32,
                                            height: 32
                                          }}
                                        >
                                          <RestoreIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  <TablePagination
                    component="div"
                    count={filteredData.length}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                      setRowsPerPage(parseInt(event.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    sx={{ 
                      borderTop: '1px solid',
                      borderColor: 'grey.200',
                      backgroundColor: 'grey.50'
                    }}
                  />
                </Card>

                <Divider sx={{ my: 3 }} />

                {/* Instructions */}
                <Alert severity="info" sx={{ borderRadius: 2 }} icon={<InfoIcon />}>
                  <MDTypography variant="body2" color="text">
                    <strong>Instructions:</strong> Click the edit icon to modify any string value. 
                    Use the search bar to filter strings by key, value, or category. Modified strings are highlighted in yellow.
                    Click the "Export" button to download your changes as strings2_{language}.xml.
                  </MDTypography>
                </Alert>
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