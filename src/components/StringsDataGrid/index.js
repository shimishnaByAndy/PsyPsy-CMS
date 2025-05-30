/**
 * StringsDataGrid - MUI-X DataGrid component for displaying strings data
 * Uses the same structure as ClientsDataGrid but adapted for string management
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';

// @mui material components
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';

// @mui icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import RestoreIcon from '@mui/icons-material/Restore';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function StringsDataGrid({ 
  language = 'en',
  englishStrings = {},
  frenchStrings = {},
  modifiedStrings = {},
  onStringModified,
  onStringReset,
  searchTerm = '',
  categoryFilter = 'all',
  modifiedFilter = 'all',
  height = 600 
}) {
  
  // State for data grid
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  
  // State for pagination and sorting
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState([]);

  // Generate category for a string key
  const getCategory = (key) => {
    if (key.includes('welcome') || key.includes('onboard') || key.includes('start')) {
      return 'Welcome & Onboarding';
    } else if (key.includes('login') || key.includes('signup') || key.includes('auth') || key.includes('psw')) {
      return 'Authentication';
    } else if (key.includes('profile') || key.includes('account') || key.includes('setting')) {
      return 'Profile & Settings';
    } else if (key.includes('valid') || key.includes('form') || key.includes('input')) {
      return 'Forms & Validation';
    } else if (key.includes('btn') || key.includes('nav') || key.includes('menu') || key.includes('cancel') || key.includes('next') || key.includes('back')) {
      return 'Navigation & UI';
    } else if (key.includes('error') || key.includes('invalid') || key.includes('fail') || key.includes('wrong')) {
      return 'Errors & Messages';
    } else {
      return 'Other';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Welcome & Onboarding': 'success',
      'Authentication': 'warning',
      'Profile & Settings': 'info',
      'Forms & Validation': 'primary',
      'Navigation & UI': 'secondary',
      'Errors & Messages': 'error',
      'Other': 'default'
    };
    return colors[category] || 'default';
  };

  // Define columns for the data grid
  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'category',
        headerName: 'Category',
        width: 180,
        renderCell: (params) => {
          const category = params.row.category;
          const isModified = params.row.isModified;
          
          return (
            <MDBox display="flex" alignItems="center" gap={1}>
              <Chip 
                label={category} 
                size="small" 
                color={getCategoryColor(category)}
                variant="outlined"
              />
              {isModified && (
                <Chip 
                  label="MODIFIED" 
                  size="small" 
                  color="warning"
                  sx={{ 
                    height: 18, 
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                    backgroundColor: '#ffc107',
                    color: 'white'
                  }}
                />
              )}
            </MDBox>
          );
        },
        sortable: true,
      }
    ];

    // Add language-specific columns with consistent total width
    if (language === 'both') {
      baseColumns.push(
        {
          field: 'englishValue',
          headerName: 'English Value',
          width: 280,
          renderCell: (params) => {
            const value = params.row.englishValue || '';
            const isModified = params.row.isModified;
            
            return (
              <MDBox 
                sx={{ 
                  padding: isModified ? '8px' : '4px',
                  border: isModified ? '2px dashed #ffc107' : 'none',
                  borderRadius: '4px',
                  backgroundColor: isModified ? '#fff3cd' : 'transparent',
                  width: '100%'
                }}
              >
                <MDTypography 
                  variant="caption" 
                  fontWeight="medium"
                  sx={{ 
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {value}
                </MDTypography>
                {isModified && (
                  <MDTypography 
                    variant="caption" 
                    color="warning"
                    fontWeight="bold"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    ⚠️ Modified
                  </MDTypography>
                )}
              </MDBox>
            );
          },
          sortable: true,
        },
        {
          field: 'frenchValue',
          headerName: 'French Value',
          width: 280,
          renderCell: (params) => {
            const value = params.row.frenchValue || '';
            const isModified = params.row.isModified;
            
            return (
              <MDBox 
                sx={{ 
                  padding: isModified ? '8px' : '4px',
                  border: isModified ? '2px dashed #ffc107' : 'none',
                  borderRadius: '4px',
                  backgroundColor: isModified ? '#fff3cd' : 'transparent',
                  width: '100%'
                }}
              >
                <MDTypography 
                  variant="caption" 
                  fontWeight="medium"
                  sx={{ 
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {value}
                </MDTypography>
                {isModified && (
                  <MDTypography 
                    variant="caption" 
                    color="warning"
                    fontWeight="bold"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    ⚠️ Modified
                  </MDTypography>
                )}
              </MDBox>
            );
          },
          sortable: true,
        }
      );
    } else {
      baseColumns.push({
        field: 'currentValue',
        headerName: 'Current Value',
        width: 560,
        renderCell: (params) => {
          const isEditing = editingCell === `${params.row.id}-currentValue`;
          const value = params.row.currentValue || '';
          const originalValue = params.row.originalValue || '';
          const isModified = params.row.isModified;
          
          if (isEditing) {
            return (
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                variant="outlined"
                size="small"
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff3cd',
                    '& fieldset': {
                      borderColor: '#ffc107',
                      borderWidth: '2px'
                    }
                  }
                }}
              />
            );
          }
          
          return (
            <MDBox 
              sx={{ 
                padding: isModified ? '8px' : '4px',
                border: isModified ? '2px dashed #ffc107' : 'none',
                borderRadius: '4px',
                backgroundColor: isModified ? '#fff3cd' : 'transparent',
                width: '100%'
              }}
            >
              <MDTypography 
                variant="caption" 
                fontWeight="medium"
                sx={{ 
                  wordBreak: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {value}
              </MDTypography>
              {isModified && originalValue !== value && (
                <>
                  <MDTypography 
                    variant="caption" 
                    color="warning"
                    fontWeight="bold"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    ⚠️ Modified
                  </MDTypography>
                  <MDTypography 
                    variant="caption" 
                    color="text"
                    sx={{ 
                      display: 'block',
                      fontStyle: 'italic',
                      textDecoration: 'line-through',
                      opacity: 0.7,
                      mt: 0.5
                    }}
                  >
                    Original: {originalValue.length > 30 ? originalValue.substring(0, 30) + '...' : originalValue}
                  </MDTypography>
                </>
              )}
            </MDBox>
          );
        },
        sortable: true,
      });
    }

    // Add actions column
    baseColumns.push({
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => {
        const isEditing = editingCell === `${params.row.id}-currentValue`;
        const isModified = params.row.isModified;
        
        return (
          <MDBox display="flex" gap={0.5}>
            {isEditing ? (
              <>
                <Tooltip title="Save Changes">
                  <IconButton 
                    size="small"
                    color="success"
                    onClick={() => handleSaveEdit(params.row)}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton 
                    size="small"
                    color="error"
                    onClick={handleCancelEdit}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Edit String">
                  <IconButton 
                    size="small"
                    color="primary"
                    onClick={() => handleStartEdit(params.row)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {isModified && (
                  <Tooltip title="Reset to Original">
                    <IconButton 
                      size="small"
                      color="warning"
                      onClick={() => handleResetString(params.row)}
                    >
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </MDBox>
        );
      },
      sortable: false,
    });

    return baseColumns;
  }, [language, editingCell, editingValue]);

  // Handle edit start
  const handleStartEdit = (row) => {
    setEditingCell(`${row.id}-currentValue`);
    setEditingValue(row.currentValue || '');
  };

  // Handle edit save
  const handleSaveEdit = (row) => {
    if (onStringModified) {
      onStringModified(row.key, editingValue);
    }
    setEditingCell(null);
    setEditingValue('');
  };

  // Handle edit cancel
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  // Handle reset string
  const handleResetString = (row) => {
    if (onStringReset) {
      onStringReset(row.key);
    }
  };

  // Process and filter data
  const processedData = useMemo(() => {
    let data = [];
    
    if (language === "both") {
      // Combine both languages
      const allKeys = new Set([...Object.keys(englishStrings), ...Object.keys(frenchStrings)]);
      data = Array.from(allKeys).map(key => ({
        id: key,
        key,
        englishValue: englishStrings[key] || '',
        frenchValue: frenchStrings[key] || '',
        category: getCategory(key),
        isModified: modifiedStrings[key] !== undefined,
      }));
    } else {
      // Single language mode
      const currentStrings = language === 'en' ? englishStrings : frenchStrings;
      data = Object.entries(currentStrings).map(([key, value]) => ({
        id: key,
        key,
        originalValue: value,
        currentValue: modifiedStrings[key] !== undefined ? modifiedStrings[key] : value,
        category: getCategory(key),
        isModified: modifiedStrings[key] !== undefined,
      }));
    }

    // Apply filters
    if (categoryFilter !== 'all') {
      data = data.filter(item => item.category === categoryFilter);
    }

    if (modifiedFilter === 'modified') {
      data = data.filter(item => item.isModified);
    } else if (modifiedFilter === 'unmodified') {
      data = data.filter(item => !item.isModified);
    }

    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => {
        if (language === "both") {
          return item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.englishValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.frenchValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.category.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.originalValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.currentValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.category.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }

    return data;
  }, [englishStrings, frenchStrings, modifiedStrings, language, categoryFilter, modifiedFilter, searchTerm]);

  // Update rows and count when data changes
  useEffect(() => {
    setRows(processedData);
    setRowCount(processedData.length);
  }, [processedData]);

  // Handle pagination change
  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  // Handle sort change
  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  return (
    <MDBox>
      <Box sx={{ height: height, width: '100%', minWidth: '900px' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          
          // Pagination
          paginationMode="client"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 25, 50, 100]}
          
          // Sorting
          sortingMode="client"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          
          // Styling
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #dee2e6',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8f9fa',
            },
            '& .MuiDataGrid-row': {
              '&.modified': {
                backgroundColor: '#fff3cd',
                borderLeft: '4px solid #ffc107',
              }
            }
          }}
          
          // Loading overlay
          slots={{
            loadingOverlay: LinearProgress,
          }}
          
          // Initial state
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          
          // Row styling
          getRowClassName={(params) => params.row.isModified ? 'modified' : ''}
        />
      </Box>
    </MDBox>
  );
}

export default StringsDataGrid; 