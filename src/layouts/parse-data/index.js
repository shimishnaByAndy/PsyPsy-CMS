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
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Parse data service
import { ParseData } from "services/parseService";

function ParseDataExample() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sample Parse class name
  const PARSE_CLASS_NAME = "Item";

  // Fetch data from Parse Server
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      
      try {
        const results = await ParseData.query(PARSE_CLASS_NAME);
        
        // Convert Parse objects to plain objects for easier UI manipulation
        const items = results.map(item => ({
          id: item.id,
          title: item.get("title"),
          description: item.get("description"),
          createdAt: item.get("createdAt"),
        }));
        
        setRecords(items);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data from the server");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [refreshTrigger]);

  // Create a new item in Parse Server
  const handleCreateItem = async () => {
    if (!newItemTitle) {
      setError("Title is required");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await ParseData.create(PARSE_CLASS_NAME, {
        title: newItemTitle,
        description: newItemDescription || "",
      });
      
      // Reset form and refresh data
      setNewItemTitle("");
      setNewItemDescription("");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error creating item:", err);
      setError(err.message || "Failed to create new item");
    } finally {
      setLoading(false);
    }
  };

  // Delete an item from Parse Server
  const handleDeleteItem = async (id) => {
    setLoading(true);
    setError("");
    
    try {
      await ParseData.delete(PARSE_CLASS_NAME, id);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the data table
  const dataTableData = {
    columns: [
      { Header: "Title", accessor: "title", width: "30%" },
      { Header: "Description", accessor: "description", width: "40%" },
      { Header: "Created At", accessor: "createdAt", width: "20%" },
      { Header: "Actions", accessor: "actions", width: "10%" },
    ],
    
    rows: records.map(record => ({
      title: record.title,
      description: record.description,
      createdAt: record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A",
      actions: (
        <MDButton 
          variant="text" 
          color="error" 
          onClick={() => handleDeleteItem(record.id)}
          disabled={loading}
        >
          Delete
        </MDButton>
      ),
    })),
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                mx={2}
                mt={-3}
                p={2}
                mb={1}
                textAlign="center"
              >
                <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                  Parse Server Data Example
                </MDTypography>
                <MDTypography variant="body2" color="white">
                  Connect and interact with your Parse Server database
                </MDTypography>
              </MDBox>
              
              <MDBox pt={4} pb={3} px={3}>
                {/* Form for creating new items */}
                <MDBox mb={4}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Create New Item
                  </MDTypography>
                  
                  {error && (
                    <MDBox mt={2} mb={2}>
                      <MDAlert color="error" dismissible>
                        {error}
                      </MDAlert>
                    </MDBox>
                  )}
                  
                  <Grid container spacing={2} mt={1}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Title"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Description"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={handleCreateItem}
                        disabled={loading}
                        fullWidth
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Create"}
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDBox>
                
                {/* Data table */}
                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Items from Parse Server
                  </MDTypography>
                  
                  {loading && !records.length ? (
                    <MDBox textAlign="center" py={4}>
                      <CircularProgress />
                    </MDBox>
                  ) : (
                    <MDBox mt={3}>
                      <DataTable
                        table={dataTableData}
                        isSorted={false}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        noEndBorder
                      />
                    </MDBox>
                  )}
                  
                  {!loading && !records.length && (
                    <MDBox textAlign="center" py={4}>
                      <MDTypography variant="body1" color="text">
                        No items found. Create your first item above.
                      </MDTypography>
                    </MDBox>
                  )}
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

export default ParseDataExample; 