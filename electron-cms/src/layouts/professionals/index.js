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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import UserDetail from "components/UserDetail";

// Import MUI-X DataGrid component
import ProfessionalsDataGrid from "components/ProfessionalsDataGrid";

// Theme and styling
import { componentStyles } from "config/theme";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setOpenConfigurator,
} from "context";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";

// Material Dashboard 2 React example components

function Professionals() {
  const { t } = useTranslation();
  
  // State for search and filters
  const [search, setSearch] = useState("");  
  const [userType, setUserType] = useState(localStorage.getItem('selectedUserType') || 1);
  const [filters, setFilters] = useState({
    profType: 'all',
    meetType: 'all',
    gender: 'all',
    language: 'all',
    expertise: 'all'
  });
  
  // State for user detail modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  
  // Material UI controller for Configurator
  const [controller, dispatch] = useMaterialUIController();
  
  // Handle user type change
  const handleUserTypeChange = (type) => {
    setUserType(type);
    localStorage.setItem('selectedUserType', type);
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Handle viewing professional details
  const handleViewProfessional = (professionalId) => {
    console.log('Viewing professional with ID:', professionalId);
    // For now, we'll create a mock professional object for the detail view
    // In a real implementation, you'd fetch the full professional details
    const mockProfessional = {
      id: professionalId,
      userType: 1, // Professional
      username: 'prof_user',
      email: 'professional@psypsy.com',
      emailVerified: true,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      professionalPtr: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        dob: new Date('1985-01-01'),
        gender: 1,
        profType: 1,
        businessName: 'Wellness Psychology Center',
        bussEmail: 'professional@psypsy.com',
        phoneNb: { number: '+15551234567', canShare: true },
        offeredLangArr: ['English', 'French']
      }
    };
    
    setSelectedUser(mockProfessional);
    setUserDetailOpen(true);
  };
  
  // Close user detail modal
  const handleCloseUserDetail = () => {
    setUserDetailOpen(false);
    setSelectedUser(null);
  };

  // Function to open the stats configurator
  const handleOpenConfigurator = () => {
    setOpenConfigurator(dispatch, true);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      profType: 'all',
      meetType: 'all',
      gender: 'all',
      language: 'all',
      expertise: 'all'
    });
    setSearch('');
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length + (search ? 1 : 0);

  return (
    <DashboardLayout>
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                p={3}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={componentStyles.pageHeader}
              >
                <MDBox sx={{ flex: '0 0 auto', minWidth: 'max-content' }}>
                  <MDTypography 
                    variant="h5" 
                    color="white" 
                    fontWeight="bold"
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'unset',
                      minWidth: 'max-content',
                      flexShrink: 0,
                      display: 'block',
                      width: 'max-content'
                    }}
                  >
                    Professional Management
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" gap={2} sx={{ flex: '0 0 auto' }}>
                  <TextField
                    placeholder="Search professionals..."
                    value={search}
                    onChange={handleSearch}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 250 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon sx={{ color: "white" }}>search</Icon>
                        </InputAdornment>
                      ),
                      sx: {
                        color: "white",
                        "& .MuiOutlinedInput-notchedOutline": { 
                          borderColor: "rgba(255, 255, 255, 0.5)" 
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": { 
                          borderColor: "white" 
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                          borderColor: "white" 
                        }
                      }
                    }}
                    InputLabelProps={{
                      sx: { color: "white" }
                    }}
                  />
                </MDBox>
              </MDBox>
              
              {/* Filters Section */}
              <MDBox px={3} pt={3} pb={2}>
                <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Filters
                    {activeFiltersCount > 0 && (
                      <Chip 
                        label={`${activeFiltersCount} active`} 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </MDTypography>
                  {activeFiltersCount > 0 && (
                    <MDButton 
                      variant="text" 
                      color="secondary" 
                      size="small"
                      onClick={clearFilters}
                    >
                      Clear All
                    </MDButton>
                  )}
                </MDBox>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Profession</InputLabel>
                      <Select
                        value={filters.profType}
                        label="Profession"
                        onChange={(e) => handleFilterChange('profType', e.target.value)}
                      >
                        <MenuItem value="all">All Professions</MenuItem>
                        <MenuItem value="1">Psychologist</MenuItem>
                        <MenuItem value="2">Social Worker</MenuItem>
                        <MenuItem value="3">Psychoeducator</MenuItem>
                        <MenuItem value="4">Marriage & Family Therapist</MenuItem>
                        <MenuItem value="5">Licensed Professional Counselor</MenuItem>
                        <MenuItem value="6">Clinical Social Worker</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Consultation Type</InputLabel>
                      <Select
                        value={filters.meetType}
                        label="Consultation Type"
                        onChange={(e) => handleFilterChange('meetType', e.target.value)}
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="1">In-person only</MenuItem>
                        <MenuItem value="2">Online only</MenuItem>
                        <MenuItem value="3">Both in-person and online</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={filters.gender}
                        label="Gender"
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                      >
                        <MenuItem value="all">All Genders</MenuItem>
                        <MenuItem value="1">Woman</MenuItem>
                        <MenuItem value="2">Man</MenuItem>
                        <MenuItem value="3">Other</MenuItem>
                        <MenuItem value="4">Not disclosed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={filters.language}
                        label="Language"
                        onChange={(e) => handleFilterChange('language', e.target.value)}
                      >
                        <MenuItem value="all">All Languages</MenuItem>
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="French">French</MenuItem>
                        <MenuItem value="Spanish">Spanish</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Expertise</InputLabel>
                      <Select
                        value={filters.expertise}
                        label="Expertise"
                        onChange={(e) => handleFilterChange('expertise', e.target.value)}
                      >
                        <MenuItem value="all">All Specializations</MenuItem>
                        <MenuItem value="Anxiety">Anxiety</MenuItem>
                        <MenuItem value="Depression">Depression</MenuItem>
                        <MenuItem value="Trauma">Trauma</MenuItem>
                        <MenuItem value="Couples">Couples Therapy</MenuItem>
                        <MenuItem value="Child">Child Psychology</MenuItem>
                        <MenuItem value="Addiction">Addiction</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </MDBox>
              
              {/* MUI-X DataGrid */}
              <MDBox px={3} pb={3}>
                <ProfessionalsDataGrid
                  searchTerm={search}
                  filters={filters}
                  onViewProfessional={handleViewProfessional}
                  height={600}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      
      {/* User Detail Modal */}
      <UserDetail
        open={userDetailOpen}
        user={selectedUser}
        onClose={handleCloseUserDetail}
      />
    </DashboardLayout>
  );
}

export default Professionals; 