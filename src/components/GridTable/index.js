import React, { useEffect, useState } from 'react';
import { Grid } from 'gridjs-react';
import { useTranslation } from 'react-i18next';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

function GridTable({ 
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
  
  // Process columns and data for Grid.js format
  useEffect(() => {
    if (!data || !columns) return;
    
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
    const formattedData = data.map(item => {
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
    
    setTableColumns(formattedColumns);
    setTableData(formattedData);
  }, [data, columns, t]);
  
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

export default GridTable; 