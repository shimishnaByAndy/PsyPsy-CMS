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

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { UserService } from "services/parseService";
import UserDetail from "components/UserDetail";
import Parse from "parse";

// Import new Grid components
import GridTable from "components/GridTable";
import GridTableFilter from "components/GridTableFilter";
import "components/GridTable/GridStyles.css";

// Import the new GridTableWithFilter component
import GridTableWithFilter from "components/GridTable";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setOpenConfigurator,
} from "context";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from '@mui/material/LinearProgress';
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Data
import projectsTableData from "layouts/tables/data/projectsTableData";

function Tables() {
  const { t } = useTranslation();
  
  // Get project table data
  const { columns: pColumns, rows: pRows } = projectsTableData();
  
  // State for users data
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0); 
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");  
  const [userType, setUserType] = useState(localStorage.getItem('selectedUserType') || 2);
  const [filters, setFilters] = useState({});
  
  // State for user detail modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  
  // Material UI controller for Configurator
  const [controller, dispatch] = useMaterialUIController();
  
  // Handle user type change
  const handleUserTypeChange = (type) => {
    setUserType(type);
    localStorage.setItem('selectedUserType', type);
    setPage(0); // Reset to first page
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(0); // Reset to first page when changing limit
  };
  
  // Handle filters
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when applying filters
    
    // Here you would normally trigger a new data fetch with the applied filters
    // For demo purposes, we're just logging the filters
    console.log('Applied filters:', newFilters);
  };
  
  // Load users data
  const loadUsers = useCallback(async () => {
    console.log('Starting to load users with fetchUsers'); 
    setLoading(true);
    setError(null);

    try {
      console.log('Calling fetchUsers cloud function');
      const result = await Parse.Cloud.run("fetchUsers", {
        userType: 2, // Fetch only clients 
        page: 1,     // First page
        limit: 10,   // Number of items per page
        search: '',  // No search term
        sortBy: 'createdAt', // Sort by creation date
        sortDirection: 'desc' // Sort in descending order 
      });
      console.log('fetchUsers result:', result); 
      
      // Log the first user as an example to debug structure
      // if (result.users && result.users.length > 0) {
      //   console.log('First user example:', JSON.stringify(result.users[0], null, 2));
      // }
      
      // Parse server returns Parse objects - no need for extra transformation
      const users = result.users || [];
      console.log('Users data:', users);
      
      // Set the users data directly
      setUsers(users);
      setTotalUsers(result.totalUsers || 0); 
    } catch (err) {
      console.error("Error loading users with fetchUsers:", err);
      console.error("Error details:", err.message, err.code);
      console.error("Error stack:", err.stack);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
      console.log('Finished loading users attempt with fetchUsers');
    }
  }, []);
  
  // Ensure the GridTableWithFilter is populated with the fetched user data
  useEffect(() => {
    console.log('Tables component mounted or dependencies changed');
    loadUsers();
    
    // Cleanup function
    return () => {
      console.log('Tables component unmounting or dependencies changing');
    };
  }, [loadUsers]);
  
  // Ensure proper user table structure
  useEffect(() => {
    if (users.length > 0) {
      console.log('User structure check:', users[0]);
    }
  }, [users]);
  
  // Handle viewing user details
  const handleViewUser = (userId) => {
    console.log('Viewing user with ID:', userId);
    const user = users.find(u => {
      // Handle both normal objects and Parse objects
      return (u.objectId === userId) || (u.id === userId);
    });
    
    if (user) {
      console.log('Found user to view:', user);
      setSelectedUser(user);
      setUserDetailOpen(true);
    } else {
      console.error('User not found with ID:', userId);
    }
  };
  
  // Close user detail modal
  const handleCloseUserDetail = () => {
    setUserDetailOpen(false);
  };
  
  // Gender mapping with translations
  const genderMap = {
    1: t("statistics.distributions.gender.woman"),
    2: t("statistics.distributions.gender.man"),
    3: t("statistics.distributions.gender.other"),
    4: t("statistics.distributions.gender.notDisclosed"),
  };
  
  // Get user type label
  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 0: return "Admin";
      case 1: return "Professional";
      case 2: return "Client";
      default: return `Type ${userType}`;
    }
  };
  
  // Helper function to format Canadian phone numbers
  const formatCanadianPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return 'N/A';
    
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Check if we have a valid number of digits
    if (digits.length < 10) return phoneNumber; // Return original if not enough digits
    
    // Remove leading 1 if present (country code)
    const tenDigits = digits.length === 11 && digits.charAt(0) === '1' 
      ? digits.substring(1) 
      : digits.substring(0, 10); 
    
    // Format as (XXX) XXX-XXXX
    return `(${tenDigits.substring(0, 3)}) ${tenDigits.substring(3, 6)}-${tenDigits.substring(6, 10)}`;
  };
  
  // Helper function to format last seen date with color
  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return { text: t("tables.timeIndicators.never"), color: 'error' };
    
    const now = new Date();
    const lastSeen = new Date(lastSeenDate); 
    const diffMs = now - lastSeen;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    const diffMonths = diffDays / 30;
    
    if (diffHours < 24) {
      return { 
        text: t("tables.timeIndicators.hoursAgo", { count: Math.round(diffHours) }),
        color: 'success' 
      };
    } else if (diffDays < 7) {
      return { 
        text: t("tables.timeIndicators.daysAgo", { count: Math.round(diffDays) }),
        color: 'success' 
      };
    } else if (diffDays < 30) {
      return { 
        text: t("tables.timeIndicators.daysAgo", { count: Math.round(diffDays) }),
        color: 'warning' 
      };
    } else if (diffMonths < 3) {
      return { 
        text: t("tables.timeIndicators.monthsAgo", { count: Math.round(diffMonths) }),
        color: 'warning' 
      };
    } else {
      return { 
        text: t("tables.timeIndicators.inactive"),
        color: 'error' 
      };
    }
  };
  
  // Prepare user table columns
  const userColumns = [
    { 
      Header: t("tables.columns.name"), 
      accessor: "name", 
      width: "30%",
      Cell: ({ row }) => {
        const clientPtr = row.original.clientPtr || {};
        const firstName = clientPtr.firstName || 'N/A';
        const lastName = clientPtr.lastName || '';
        const email = row.original.email || 'N/A';

        return (
          <MDBox lineHeight={1}>
            <MDTypography display="block" variant="button" fontWeight="medium">
              {firstName} {lastName}
            </MDTypography>
            <MDTypography variant="caption" color="text" fontWeight="regular">
              {email}
            </MDTypography>
          </MDBox>
        );
      }
    },
    { 
      Header: t("tables.columns.age"), 
      accessor: "age", 
      width: "15%",
      Cell: ({ row }) => {
        const clientPtr = row.original.clientPtr || {};
        let age = 'N/A';
        if (clientPtr.dob) {
          const dobDate = new Date(clientPtr.dob);
          if (dobDate instanceof Date && !isNaN(dobDate)) {
            age = new Date().getFullYear() - dobDate.getFullYear();
          }
        }
        return (
          <MDTypography variant="caption" fontWeight="medium">
            {age}
          </MDTypography>
        );
      }
    },
    { 
      Header: t("tables.columns.gender"), 
      accessor: "gender", 
      width: "15%",
      Cell: ({ row }) => {
        const clientPtr = row.original.clientPtr || {};
        const genderLabel = clientPtr.gender !== undefined && genderMap[clientPtr.gender] 
                           ? genderMap[clientPtr.gender] 
                           : "Unknown";
        return (
          <MDTypography variant="caption" fontWeight="medium">
            {genderLabel}
          </MDTypography>
        );
      }
    },
    { 
      Header: t("tables.columns.phone"), 
      accessor: "phone", 
      width: "20%",
      Cell: ({ row }) => {
        const clientPtr = row.original.clientPtr || {};
        return (
          <MDTypography variant="caption" fontWeight="medium">
            {formatCanadianPhoneNumber(clientPtr.phoneNb)}
          </MDTypography>
        );
      }
    },
    { 
      Header: t("tables.columns.lastSeen"), 
      accessor: "lastSeen", 
      width: "20%",
      Cell: ({ row }) => {
        // Use updatedAt as last seen date
        const lastSeenDate = row.original.updatedAt || row.original.createdAt;
        const { text, color } = formatLastSeen(lastSeenDate);
        
        return (
          <MDBox ml={-1}>
            <MDBox
              component="span"
              py={0.75}
              px={1.5}
              borderRadius="lg"
              bgColor={color}
              color="white"
              fontSize="xs"
              fontWeight="medium"
            >
              {text}
            </MDBox>
          </MDBox>
        );
      }
    },
    { 
      Header: t("tables.columns.updatedAt"), 
      accessor: "updatedAt", 
      width: "20%",
      Cell: ({ row }) => {
        const updatedAt = row.original.updatedAt || 'N/A';
        return (
          <MDTypography variant="caption" fontWeight="medium">
            {updatedAt}
          </MDTypography>
        );
      }
    },
    { 
      Header: t("tables.columns.actions"), 
      accessor: "actions", 
      width: "10%",
      Cell: ({ row }) => (
        <MDButton 
          variant="text" 
          color="info"
          onClick={() => handleViewUser(row.original.objectId || row.original.id)}
        >
          <Icon>visibility</Icon>&nbsp;{t("tables.actions.view")}
        </MDButton>
      )
    },
  ];

  // Function to open the stats configurator
  const handleOpenConfigurator = () => {
    setOpenConfigurator(dispatch, true);
  };

  useEffect(() => {
    console.log('Fetched users:', users);
  }, [users]);

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
                <MDBox display="flex" alignItems="center">
                  <MDBox width="100%">
                    <TextField
                      fullWidth
                      placeholder={t("tables.searchUsers")}
                      value={search}
                      onChange={handleSearch}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon sx={{ color: "white" }}>search</Icon>
                          </InputAdornment>
                        ),
                        sx: {
                          color: "white",
                          "&::placeholder": { color: "white" },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.5)" },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" }
                        }
                      }}
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
              
              {/* Display GridTableFilter only when GridTable is used */}
              <MDBox px={2} pt={3}>
                <GridTableFilter onFilter={handleFilter} />
              </MDBox>
              
              <MDBox pt={3} px={2}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </MDBox>
                ) : error ? (
                  <MDBox display="flex" justifyContent="center" p={4}>
                    <MDTypography color="error">{error}</MDTypography>
                  </MDBox>
                ) : (
                  <GridTableWithFilter
                    data={users}
                    columns={userColumns}
                    loading={loading}
                    error={error}
                    onViewUser={handleViewUser}
                    pagination={true}
                    search={true}
                    sort={true}
                    limit={limit}
                    totalCount={totalUsers}
                  />
                )}
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

export default Tables;
