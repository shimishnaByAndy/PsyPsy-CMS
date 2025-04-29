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

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";

function Tables() {
  // Get table data
  const { columns, rows: allRows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();
  
  // State for filtered rows
  const [filteredRows, setFilteredRows] = useState(allRows);
  const [userType, setUserType] = useState(localStorage.getItem('userTypeFilter') || 'all');
  
  // Handle user type change
  const handleUserTypeChange = (type) => {
    setUserType(type);
    filterRows(type);
  };
  
  // Filter rows based on user type
  const filterRows = (type) => {
    if (!allRows || !allRows.length) {
      setFilteredRows([]);
      return;
    }

    switch(type) {
      case 'professionals':
        setFilteredRows(allRows.filter(row => 
          row.function && 
          row.function.props && 
          row.function.props.title === 'Programator'
        ));
        break;
      case 'clients':
        setFilteredRows(allRows.filter(row => 
          row.function && 
          row.function.props && 
          row.function.props.title === 'Executive'
        ));
        break;
      case 'admins':
        setFilteredRows(allRows.filter(row => 
          row.function && 
          row.function.props && 
          row.function.props.title === 'Manager'
        ));
        break;
      default:
        setFilteredRows(allRows);
    }
  };
  
  // Apply filtering when component mounts
  useEffect(() => {
    filterRows(userType);
  }, []);

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
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Users
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: filteredRows }}
                  isSorted={false}
                  entriesPerPage={true}
                  showTotalEntries={true}
                  noEndBorder
                />
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
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
