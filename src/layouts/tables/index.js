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
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Project components
import UserDetail from "components/UserDetail";
import TestUserData from "components/TestUserData";

// Services
import { UserService } from "services/parseService";

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
    console.log('Starting to load users with:', { userType, page, limit, search });
    setLoading(true);
    setError(null);
    
    try {
      console.log('Calling fetchUsers cloud function');
      const { stats, userTypes } = await Parse.Cloud.run("fetchUsers");
      
      console.log('User Stats:', stats);
      console.log('Users by Type:', userTypes);
      
      setUsers(userTypes.all || []);
      setTotalUsers(stats.total);
    } catch (err) {
      console.error("Error loading users:", err);
      console.error("Error details:", err.message, err.code);
      console.error("Error stack:", err.stack);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
      console.log('Finished loading users attempt');
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
  
  // Handle viewing user details
  const handleViewUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setUserDetailOpen(true);
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
  
  // Prepare user table columns
  const userColumns = [
    { 
      Header: "User", 
      accessor: "user", 
      width: "30%",
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center" lineHeight={1}>
          <MDAvatar 
            bgColor={row.original.userType === 0 ? "dark" : 
                     row.original.userType === 1 ? "info" : "primary"}
            size="sm"
          >
            {getUserTypeLabel(row.original.userType).charAt(0)}
          </MDAvatar>
          <MDBox ml={2} lineHeight={1}>
            <MDTypography display="block" variant="button" fontWeight="medium">
              {row.original.username}
            </MDTypography>
            <MDTypography variant="caption">{row.original.email}</MDTypography>
          </MDBox>
        </MDBox>
      )
    },
    { 
      Header: "Type", 
      accessor: "type", 
      width: "15%",
      Cell: ({ row }) => (
        <MDTypography variant="caption" fontWeight="medium">
          {getUserTypeLabel(row.original.userType)}
        </MDTypography>
      )
    },
    { 
      Header: "Status", 
      accessor: "status", 
      width: "15%",
      Cell: ({ row }) => (
        <MDBox ml={-1}>
          <MDBox
            component="span"
            py={0.75}
            px={1.5}
            borderRadius="lg"
            bgColor={row.original.isBlocked ? "error" : "success"}
            color="white"
            fontSize="xs"
            fontWeight="medium"
          >
            {row.original.isBlocked ? "Blocked" : "Active"}
          </MDBox>
        </MDBox>
      )
    },
    { 
      Header: "Created", 
      accessor: "created", 
      width: "15%",
      Cell: ({ row }) => (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </MDTypography>
      )
    },
    { 
      Header: "Completion", 
      accessor: "completion", 
      width: "15%",
      Cell: () => (
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="caption" color="text" fontWeight="medium" mr={1}>
            100%
          </MDTypography>
          <MDBox ml={0.5} width="9rem">
            <MDProgress variant="gradient" color="info" value={100} />
          </MDBox>
        </MDBox>
      )
    },
    { 
      Header: "Actions", 
      accessor: "actions", 
      width: "10%",
      Cell: ({ row }) => (
        <MDButton 
          variant="text" 
          color="info"
          onClick={() => handleViewUser(row.original.id)}
        >
          <Icon>visibility</Icon>&nbsp;View
        </MDButton>
      )
    },
  ];

  // Move the dummy data setup into a useEffect hook
  useEffect(() => {
    // Add dummy data for testing
    const dummyData = [
      {
        id: "dummy1",
        username: "dummy_user",
        email: "dummy@example.com",
        userType: 1, // Professional
        createdAt: new Date(),
        isBlocked: false,
      },
    ];

    // Use dummy data for testing
    setUsers(dummyData);
  }, []); // Empty dependency array ensures this runs only once on mount

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
                  Users
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
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Projects Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns: pColumns, rows: pRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
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
                    Professionals
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} px={2}>
                  <DataTable
                    table={{ columns: userColumns, rows: users.filter(user => user.userType === 1) }}
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
                </MDBox>
              </Card>
            </Grid>
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
                    Clients
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} px={2}>
                  <DataTable
                    table={{ columns: userColumns, rows: users.filter(user => user.userType === 2) }}
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
                </MDBox>
              </Card>
            </Grid>
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
                    Admins
                  </MDTypography>
                </MDBox>
                <MDBox pt={3} px={2}>
                  <DataTable
                    table={{ columns: userColumns, rows: users.filter(user => user.userType === 0) }}
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
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
      
      {/* User Detail Modal */}
      <UserDetail
        open={userDetailOpen}
        user={selectedUser}
        onClose={handleCloseUserDetail}
      />
      
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
