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
import ClientsDataGrid from "components/ClientsDataGrid";

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

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function Clients() {
  const { t } = useTranslation();
  
  // State for search and filters
  const [search, setSearch] = useState("");  
  const [userType, setUserType] = useState(localStorage.getItem('selectedUserType') || 2);
  const [filters, setFilters] = useState({
    gender: 'all',
    ageRange: 'all',
    status: 'all'
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
  
  // Handle viewing user details
  const handleViewUser = (userId) => {
    console.log('Viewing user with ID:', userId);
    // For now, we'll create a mock user object for the detail view
    // In a real implementation, you'd fetch the full user details
    const mockUser = {
      id: userId,
      userType: 2, // Client
      username: 'client_user',
      email: 'client@example.com',
      emailVerified: true,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      clientPtr: {
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1990-01-01'),
        gender: 2,
        phoneNb: '+15551234567',
        spokenLangArr: ['English', 'French']
      }
    };
    
    setSelectedUser(mockUser);
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
      gender: 'all',
      ageRange: 'all',
      status: 'all'
    });
    setSearch('');
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length + (search ? 1 : 0);

  return (
    <DashboardLayout>
      <DashboardNavbar onUserTypeChange={handleUserTypeChange} />
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
              >
                <MDTypography variant="h6" color="white">
                  {t("tables.clientManagement")}
                </MDTypography>
                <MDBox display="flex" alignItems="center" gap={2}>
                  <TextField
                    placeholder={t("tables.searchUsers")}
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
                    {t("tables.filters.title")}
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
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("tables.filters.gender")}</InputLabel>
                      <Select
                        value={filters.gender}
                        label={t("tables.filters.gender")}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                      >
                        <MenuItem value="all">All Genders</MenuItem>
                        <MenuItem value="1">{t("statistics.distributions.gender.woman")}</MenuItem>
                        <MenuItem value="2">{t("statistics.distributions.gender.man")}</MenuItem>
                        <MenuItem value="3">{t("statistics.distributions.gender.other")}</MenuItem>
                        <MenuItem value="4">{t("statistics.distributions.gender.notDisclosed")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("tables.filters.age")}</InputLabel>
                      <Select
                        value={filters.ageRange}
                        label={t("tables.filters.age")}
                        onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                      >
                        <MenuItem value="all">All Ages</MenuItem>
                        <MenuItem value="18-24">{t("statistics.distributions.age.range18_24")}</MenuItem>
                        <MenuItem value="25-34">{t("statistics.distributions.age.range25_34")}</MenuItem>
                        <MenuItem value="35-44">{t("statistics.distributions.age.range35_44")}</MenuItem>
                        <MenuItem value="45-54">{t("statistics.distributions.age.range45_54")}</MenuItem>
                        <MenuItem value="55-64">{t("statistics.distributions.age.range55_64")}</MenuItem>
                        <MenuItem value="65+">{t("statistics.distributions.age.range65Plus")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="blocked">Blocked</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("tables.filters.lastSeen")}</InputLabel>
                      <Select
                        value={filters.lastSeen || 'all'}
                        label={t("tables.filters.lastSeen")}
                        onChange={(e) => handleFilterChange('lastSeen', e.target.value)}
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </MDBox>
              
              {/* MUI-X DataGrid */}
              <MDBox px={3} pb={3}>
                <ClientsDataGrid
                  searchTerm={search}
                  filters={filters}
                  onViewClient={handleViewUser}
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

export default Clients; 