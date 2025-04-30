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
import { UserService } from "services/parseService";
import DataTable from "examples/Tables/DataTable";
import UserDetail from "components/UserDetail";
import Parse from "parse";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from '@mui/material/LinearProgress';

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
  const [userType, setUserType] = useState(localStorage.getItem('selectedUserType') || 'all'); 
  
  // State for user detail modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  
  // State for stats data
  const [stats, setStats] = useState({
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    newUsersThisYear: 0,
    ageRanges: {
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55+": 0
    },
    genderCounts: {
      male: 0,
      female: 0,
      other: 0
    }
  });
  
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
      if (result.users && result.users.length > 0) {
        console.log('First user example:', JSON.stringify(result.users[0], null, 2));
      }
      
      // Parse server returns Parse objects - no need for extra transformation
      const users = result.users || [];
      console.log('Users data:', users);
      
      // Set the users data directly
      setUsers(users);
      setTotalUsers(result.totalUsers || 0); 
      
      // Set stats if available
      if (result.stats) {
        setStats(result.stats);
      }
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
  
  // Effect to load users when dependencies change
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
    if (!lastSeenDate) return { text: 'Never', color: 'error' };
    
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffMs = now - lastSeen;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    const diffMonths = diffDays / 30;
    
    if (diffHours < 24) {
      return { 
        text: `${Math.round(diffHours)}h ago`, 
        color: 'success' 
      };
    } else if (diffDays < 7) {
      return { 
        text: `${Math.round(diffDays)}d ago`, 
        color: 'success' 
      };
    } else if (diffDays < 30) {
      return { 
        text: `${Math.round(diffDays)}d ago`, 
        color: 'warning' 
      };
    } else if (diffMonths < 3) {
      return { 
        text: `${Math.round(diffMonths)}mo ago`, 
        color: 'warning' 
      };
    } else {
      return { 
        text: 'Inactive', 
        color: 'error' 
      };
    }
  };
  
  // Prepare user table columns
  const userColumns = [
    { 
      Header: "Name", 
      accessor: "name", 
      width: "30%",
      Cell: ({ row }) => {
        const clientPtr = row.original.clientPtr && row.original.clientPtr.attributes ? 
                          row.original.clientPtr.attributes : 
                          (row.original.clientPtr || {});
        
        return (
          <MDBox lineHeight={1}>
            <MDTypography display="block" variant="button" fontWeight="medium">
              {clientPtr.firstName ? 
                `${clientPtr.firstName} ${clientPtr.lastName || ''}` : 
                row.original.email || 'N/A'}
            </MDTypography>
            <MDTypography variant="caption" color="text" fontWeight="regular">
              {row.original.email || 'N/A'}
            </MDTypography>
          </MDBox>
        );
      }
    },
    { 
      Header: "Age", 
      accessor: "age", 
      width: "15%",
      Cell: ({ row }) => {
        const clientPtr = row.original.clientPtr && row.original.clientPtr.attributes ? 
                          row.original.clientPtr.attributes : 
                          (row.original.clientPtr || {});
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
      Header: "Gender", 
      accessor: "gender", 
      width: "15%",
      Cell: ({ row }) => {
        const clientPtr = row.original.clientPtr && row.original.clientPtr.attributes ? 
                          row.original.clientPtr.attributes : 
                          (row.original.clientPtr || {});
        let genderLabel = "Other";
        
        if (clientPtr.gender !== undefined) {
          if (clientPtr.gender === 1) genderLabel = "Male";
          else if (clientPtr.gender === 2) genderLabel = "Female";
        }
        
        return (
          <MDTypography variant="caption" fontWeight="medium">
            {genderLabel}
          </MDTypography>
        );
      }
    },
    { 
      Header: "Phone", 
      accessor: "phone", 
      width: "20%",
      Cell: ({ row }) => {
        const clientPtr = row.original.clientPtr && row.original.clientPtr.attributes ? 
                          row.original.clientPtr.attributes : 
                          (row.original.clientPtr || {});
                          
        return (
          <MDTypography variant="caption" fontWeight="medium">
            {formatCanadianPhoneNumber(clientPtr.phoneNb)}
          </MDTypography>
        );
      }
    },
    { 
      Header: "Last Seen", 
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
      Header: "Actions", 
      accessor: "actions", 
      width: "10%",
      Cell: ({ row }) => (
        <MDButton 
          variant="text" 
          color="info"
          onClick={() => handleViewUser(row.original.objectId || row.original.id)}
        >
          <Icon>visibility</Icon>&nbsp;View
        </MDButton>
      )
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar onUserTypeChange={handleUserTypeChange} />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} mb={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox bgColor="white" borderRadius="lg" p={2} shadow="lg">
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <MDTypography variant="h6" fontWeight="medium">Total Clients</MDTypography>
                  <MDTypography variant="h4">{totalUsers}</MDTypography>
                </Grid>
                <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                  <MDBox 
                    bgColor="info" 
                    color="white" 
                    width="4rem" 
                    height="4rem" 
                    borderRadius="lg"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon fontSize="large">people</Icon>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <MDBox bgColor="white" borderRadius="lg" p={2} shadow="lg">
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <MDTypography variant="h6" fontWeight="medium">New This Week</MDTypography>
                  <MDTypography variant="h4">{stats.newUsersThisWeek || 0}</MDTypography>
                </Grid>
                <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                  <MDBox 
                    bgColor="success" 
                    color="white" 
                    width="4rem" 
                    height="4rem" 
                    borderRadius="lg"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon fontSize="large">trending_up</Icon>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <MDBox bgColor="white" borderRadius="lg" p={2} shadow="lg">
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <MDTypography variant="h6" fontWeight="medium">New This Month</MDTypography>
                  <MDTypography variant="h4">{stats.newUsersThisMonth || 0}</MDTypography>
                </Grid>
                <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                  <MDBox 
                    bgColor="warning" 
                    color="white" 
                    width="4rem" 
                    height="4rem" 
                    borderRadius="lg"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon fontSize="large">date_range</Icon>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <MDBox bgColor="white" borderRadius="lg" p={2} shadow="lg">
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <MDTypography variant="h6" fontWeight="medium">Gender Ratio</MDTypography>
                  <MDTypography variant="body2">
                    Male: {stats.genderCounts?.male || 0} <br />
                    Female: {stats.genderCounts?.female || 0} <br />
                    Other: {stats.genderCounts?.other || 0}
                  </MDTypography>
                </Grid>
                <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                  <MDBox 
                    bgColor="primary" 
                    color="white" 
                    width="4rem" 
                    height="4rem" 
                    borderRadius="lg"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon fontSize="large">pie_chart</Icon>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Grid>
        </Grid>
        
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
                  Client Management
                </MDTypography>
                <MDBox width="40%">
                  <TextField
                    fullWidth
                    placeholder="Search users..."
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
                  <DataTable
                    table={{ columns: userColumns, rows: users }}
                    isSorted={false}
                    entriesPerPage={{
                      defaultValue: limit,
                      entries: [5, 10, 15, 20, 25],
                    }}
                    showTotalEntries={true}
                    noEndBorder
                    pagination={{
                      count: totalUsers,
                      page,
                      onPageChange: handlePageChange,
                      onEntriesPerPageChange: handleLimitChange,
                    }}
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
