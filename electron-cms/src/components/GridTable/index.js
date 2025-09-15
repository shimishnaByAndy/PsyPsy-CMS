import React, { useEffect, useState, useCallback } from 'react';
import { Grid } from 'gridjs-react';
import { useTranslation } from 'react-i18next';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
//import GridTableFilter from '../GridTableFilter';
import moment from 'moment';
import { UserService } from '../../services/parseService';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

function GridTableWithFilter({ 
  data, 
  columns, 
  loading, 
  error, 
  onViewUser, 
  pagination = true, 
  search = true, 
  sort = true,
  limit = 10,
  totalCount
}) {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  
  // Handle filtering logic
  const handleFilter = (filters) => {
    console.log('Filters:', filters);
    let newData = data;

    if (filters.gender) {
      newData = newData.filter(item => item.userInfo && item.userInfo.gender === filters.gender);
    }

    if (filters.ageRange) {
      newData = newData.filter(item => item.userInfo && item.userInfo.age >= filters.ageRange[0] && item.userInfo.age <= filters.ageRange[1]);
    }

    if (filters.lastSeen) {
      newData = newData.filter(item => {
        if (!item.userInfo || !item.userInfo.lastSeen) return false;
        const lastSeenDate = moment(item.userInfo.lastSeen);
        switch (filters.lastSeen) {
          case 'today':
            return moment().diff(lastSeenDate, 'hours') <= 24;
          case 'week': 
            return moment().diff(lastSeenDate, 'days') <= 7;
          case 'month':
            return moment().diff(lastSeenDate, 'days') <= 30;
          case 'quarter':
            return moment().diff(lastSeenDate, 'months') <= 3;
          case 'inactive':
            return moment().diff(lastSeenDate, 'days') > 30;
          default:
            return true;
        }
      });
    }

    setFilteredData(newData);
  };

  // Process columns and data for Grid.js format
  useEffect(() => {
    if (!filteredData || !columns) return;
    
    console.log('Processing columns:', columns);
    console.log('Processing data:', filteredData);

    // Transform columns to GridJS format
    const formattedColumns = columns.map(col => {
      // Skip actions column as we'll handle it separately
      if (col.accessor === 'actions') {
        return {
          name: col.Header,
          formatter: (_, row) => {
            return html(`
              <button class="gridjs-view-btn" data-id="${row.cells[0].data}">
                <i class="material-icons">visibility</i> ${t("tables.actions.view")}
              </button>
            `);
          }
        };
      }
      
      // Use the formatter if provided in the column definition
      if (col.Cell) {
        return {
          name: col.Header,
          sort: col.sort !== false,
          formatter: (cell, row) => {
            // Convert to HTML for custom cell rendering
            // Note: This is simplified and may need more complex handling
            const rawData = cell !== undefined ? cell : '';
            return html(`<div>${rawData}</div>`);
          }
        };
      }
      
      return {
        name: col.Header,
        sort: col.sort !== false
      };
    });
    
    // Transform data to plain arrays for GridJS
    const formattedData = filteredData.map(item => {
      console.log('Transform data to plain arrays for GridJS :', item);
      // Map each item to an array of values based on columns
      return columns.map(col => {
        // For action column, return id for later use
        if (col.accessor === 'actions') {
          return item.objectId || item.id;
        }
        
        // For normal columns, get value using accessor
        if (typeof col.accessor === 'string') {
          // Special handling for complex accessors like clientPtr.firstName
          if (col.accessor.includes('.')) {
            const accessorPath = col.accessor.split('.');
            let value = item;
            for (const path of accessorPath) {
              value = value?.[path];
            }
            return value;
          }
          
          return item[col.accessor];
        }
        
        // If accessor is a function
        if (typeof col.accessor === 'function') {
          return col.accessor(item);
        }
        
        return '';
      });
    });
    
    console.log('Formatted columns:', formattedColumns);
    console.log('Formatted data:', formattedData);

    setTableColumns(formattedColumns);
    setTableData(formattedData);
  }, [filteredData, columns, t]);
  
  // Initialize event handlers after table is mounted
  useEffect(() => {
    // Setup event handlers for action buttons
    const handleActionClick = (e) => {
      if (e.target.closest('.gridjs-view-btn')) {
        const userId = e.target.closest('.gridjs-view-btn').dataset.id;
        if (onViewUser && userId) {
          onViewUser(userId);
        }
      }
    };
    
    // Add event listener to document body to handle dynamic button clicks
    document.body.addEventListener('click', handleActionClick);
    
    // Clean up
    return () => {
      document.body.removeEventListener('click', handleActionClick);
    };
  }, [onViewUser]);
  
  // Custom styles to better integrate with Material Dashboard
  const customStyles = {
    table: {
      width: '100%',
      border: 'none',
      boxShadow: 'none'
    },
    th: {
      padding: '16px',
      textAlign: 'left',
      backgroundColor: '#f8f9fa',
      color: '#344767',
      fontWeight: '700',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      borderBottom: '1px solid #ddd',
    },
    td: {
      padding: '16px',
      fontSize: '0.875rem',
      color: '#344767',
      borderBottom: '1px solid #f0f2f5',
    },
    container: {
      boxShadow: 'none',
      border: 'none',
    },
    footer: {
      padding: '16px',
      borderTop: 'none',
    },
    search: {
      margin: '16px 0',
    }
  };
  
  // Fetch client data and populate the table
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const result = await UserService.getUsers(2, 0, 10, '', 'createdAt', 'desc');
        console.log('API response:', result); // Log the full response
        if (result && result.users) {
          setFilteredData(result.users);
        } else {
          console.error('Unexpected API response structure:', result);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        console.error('Error details:', error.response || error.message); // Log detailed error
      }
    };

    //fetchClientData();
  }, []);
  
  // Add console logs to debug data flow
  useEffect(() => {
    console.log('GridTableWithFilter mounted');
    console.log('Initial data:', data);
    console.log('Initial columns:', columns);
  }, []);

  useEffect(() => {
    console.log('Filtered data updated:', filteredData);
  }, [filteredData]);

  useEffect(() => {
    console.log('Formatted columns:', columns);
    console.log('Formatted data:', data);
  }, [tableColumns, tableData]);
  
  // Bypass the filtering logic
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <MDBox>
      {loading ? (
        <MDBox display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </MDBox>
      ) : error ? (
        <MDBox display="flex" justifyContent="center" p={4}>
          <MDTypography color="error">{error}</MDTypography>
        </MDBox>
      ) : (
        <Grid
          data={tableData}
          columns={tableColumns}
          search={search}
          sort={sort}
          pagination={pagination ? {
            limit,
            server: {
              total: totalCount
            }
          } : false}
          language={{
            search: {
              placeholder: t("tables.searchUsers")
            },
            pagination: {
              previous: t("common.previous") || 'Previous',
              next: t("common.next") || 'Next',
              showing: t("common.showing") || 'Showing',
              results: t("common.results") || 'Results',
              of: t("common.of") || 'of',
            }
          }}
          className={{
            container: 'custom-gridjs-container',
            table: 'custom-gridjs-table',
            th: 'custom-gridjs-th',
            td: 'custom-gridjs-td',
            search: 'custom-gridjs-search',
            footer: 'custom-gridjs-footer',
          }}
          style={{
            container: customStyles.container,
            table: customStyles.table,
            th: customStyles.th,
            td: customStyles.td,
            footer: customStyles.footer,
            search: customStyles.search,
          }}
        />
      )}
    </MDBox>
  );
}

export default GridTableWithFilter; 