/**
 * Appointments Layout - Professional appointment management interface
 * Based on Appointment class structure from ClassStructDocs
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";

// Import MUI-X DataGrid component
import AppointmentsDataGrid from "components/AppointmentsDataGrid";

// Theme and styling
import { componentStyles } from "config/theme";

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
import Footer from "examples/Footer";

function Appointments() {
  const { t } = useTranslation();
  
  // State for search and filters
  const [search, setSearch] = useState("");  
  const [filters, setFilters] = useState({
    status: 'all',
    serviceType: 'all',
    meetPref: 'all',
    dateRange: 'all',
    applicationStatus: 'all'
  });
  
  // State for appointment detail modal (can be added later)
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentDetailOpen, setAppointmentDetailOpen] = useState(false);
  
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
  
  // Handle viewing appointment details
  const handleViewAppointment = (appointment) => {
    console.log('Viewing appointment:', appointment);
    setSelectedAppointment(appointment);
    setAppointmentDetailOpen(true);
    // For now, just log - could open a detailed view later
  };
  
  // Close appointment detail modal
  const handleCloseAppointmentDetail = () => {
    setAppointmentDetailOpen(false);
    setSelectedAppointment(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      serviceType: 'all',
      meetPref: 'all',
      dateRange: 'all',
      applicationStatus: 'all'
    });
    setSearch('');
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length + (search ? 1 : 0);

  return (
    <DashboardLayout>
      <MDBox pt={6} pb={3} sx={{ overflow: 'visible' }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card sx={{ overflow: 'visible' }}>
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
                    Appointment Management
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" gap={2} sx={{ flex: '0 0 auto' }}>
                  <TextField
                    placeholder="Search appointments..."
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
                  </MDTypography>
                  {activeFiltersCount > 0 && (
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label={`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <MDButton 
                        size="small" 
                        variant="text" 
                        color="error"
                        onClick={clearFilters}
                      >
                        Clear All
                      </MDButton>
                    </MDBox>
                  )}
                </MDBox>
                
                <Grid container spacing={3}>
                  {/* Status Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="requested">Requested</MenuItem>
                        <MenuItem value="matched">Matched</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="no_show">No Show</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Service Type Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Service Type</InputLabel>
                      <Select
                        value={filters.serviceType}
                        label="Service Type"
                        onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                      >
                        <MenuItem value="all">All Services</MenuItem>
                        <MenuItem value="0">Individual Therapy</MenuItem>
                        <MenuItem value="1">Group Therapy</MenuItem>
                        <MenuItem value="2">Couples Therapy</MenuItem>
                        <MenuItem value="3">Family Therapy</MenuItem>
                        <MenuItem value="4">Psychological Assessment</MenuItem>
                        <MenuItem value="5">Neuropsychological Assessment</MenuItem>
                        <MenuItem value="6">Career Counseling</MenuItem>
                        <MenuItem value="7">Addiction Counseling</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Meeting Preference Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Meeting Type</InputLabel>
                      <Select
                        value={filters.meetPref}
                        label="Meeting Type"
                        onChange={(e) => handleFilterChange('meetPref', e.target.value)}
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="0">In-Person</MenuItem>
                        <MenuItem value="1">Online</MenuItem>
                        <MenuItem value="2">Either</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Date Range Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Date Range</InputLabel>
                      <Select
                        value={filters.dateRange}
                        label="Date Range"
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Application Status Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Applications</InputLabel>
                      <Select
                        value={filters.applicationStatus}
                        label="Applications"
                        onChange={(e) => handleFilterChange('applicationStatus', e.target.value)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="none">No Applications</MenuItem>
                        <MenuItem value="few">1-2 Applications</MenuItem>
                        <MenuItem value="many">3+ Applications</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </MDBox>

              {/* Quick Stats */}
              <MDBox px={3} pb={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <MDBox textAlign="center" py={1} px={2} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                      <MDTypography variant="h6" fontWeight="bold" color="warning">
                        2
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Pending Requests
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <MDBox textAlign="center" py={1} px={2} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                      <MDTypography variant="h6" fontWeight="bold" color="info">
                        1
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Matched Today
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <MDBox textAlign="center" py={1} px={2} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                      <MDTypography variant="h6" fontWeight="bold" color="success">
                        1
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Confirmed
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <MDBox textAlign="center" py={1} px={2} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                      <MDTypography variant="h6" fontWeight="bold" color="primary">
                        1
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Completed
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>

              {/* Data Grid */}
              <MDBox px={3} pb={3}>
                <AppointmentsDataGrid
                  onViewAppointment={handleViewAppointment}
                  searchTerm={search}
                  filters={filters}
                  height={600}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Appointments; 