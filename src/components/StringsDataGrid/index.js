/**
 * StringsDataGrid - TanStack Table component for displaying strings data
 * Adapted for string management with inline editing capabilities
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TanStackTable from 'components/TanStackTable';
import TableToolbar from 'components/TanStackTable/TableToolbar';
import { createCommonColumns, createFilterOptions, TABLE_PRESETS } from 'utils/tableHelpers';

// @mui material components
import { Chip, IconButton, Tooltip, TextField, Box } from '@mui/material';

// @mui icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import RestoreIcon from '@mui/icons-material/Restore';
import DownloadIcon from '@mui/icons-material/Download';

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
  const { t } = useTranslation();
  
  // State for inline editing
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  
  // State for table operations (client-side)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(searchTerm);
  const [filters, setFilters] = useState({
    category: categoryFilter,
    modified: modifiedFilter,
  });

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
        accessorKey: 'category',
        header: 'Category',
        size: 180,
        cell: ({ row }) => {
          const category = row.original.category;
          const isModified = row.original.isModified;
          
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
        enableSorting: true,
      }
    ];

    // Add language-specific columns with consistent total width
    if (language === 'both') {
      baseColumns.push(
        {
          accessorKey: 'englishValue',
          header: 'English Value',
          size: 280,
          cell: ({ row }) => {
            const value = row.original.englishValue || '';
            const isModified = row.original.isModified;
            
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
          enableSorting: true,
        },
        {
          accessorKey: 'frenchValue',
          header: 'French Value',
          size: 280,
          cell: ({ row }) => {
            const value = row.original.frenchValue || '';
            const isModified = row.original.isModified;
            
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
          enableSorting: true,
        }
      );
    } else {
      baseColumns.push({
        accessorKey: 'currentValue',
        header: 'Current Value',
        size: 560,
        cell: ({ row }) => {
          const isEditing = editingCell === `${row.original.id}-currentValue`;
          const value = row.original.currentValue || '';
          const originalValue = row.original.originalValue || '';
          const isModified = row.original.isModified;
          
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
        enableSorting: true,
      });
    }

    // Add actions column
    baseColumns.push({
      accessorKey: 'actions',
      header: 'Actions',
      size: 120,
      cell: ({ row }) => {
        const isEditing = editingCell === `${row.original.id}-currentValue`;
        const isModified = row.original.isModified;
        
        return (
          <MDBox display="flex" gap={0.5}>
            {isEditing ? (
              <>
                <Tooltip title="Save Changes">
                  <IconButton 
                    size="small"
                    color="success"
                    onClick={() => handleSaveEdit(row.original)}
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
                    onClick={() => handleStartEdit(row.original)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {isModified && (
                  <Tooltip title="Reset to Original">
                    <IconButton 
                      size="small"
                      color="warning"
                      onClick={() => handleResetString(row.original)}
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
      enableSorting: false,
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
  const data = useMemo(() => {
    let processedData = [];
    
    if (language === "both") {
      // Combine both languages
      const allKeys = new Set([...Object.keys(englishStrings), ...Object.keys(frenchStrings)]);
      processedData = Array.from(allKeys).map(key => ({
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
      processedData = Object.entries(currentStrings).map(([key, value]) => ({
        id: key,
        key,
        originalValue: value,
        currentValue: modifiedStrings[key] !== undefined ? modifiedStrings[key] : value,
        category: getCategory(key),
        isModified: modifiedStrings[key] !== undefined,
      }));
    }

    // Apply filters
    if (filters.category !== 'all') {
      processedData = processedData.filter(item => item.category === filters.category);
    }

    if (filters.modified === 'modified') {
      processedData = processedData.filter(item => item.isModified);
    } else if (filters.modified === 'unmodified') {
      processedData = processedData.filter(item => !item.isModified);
    }

    // Apply search filter
    if (globalFilter) {
      processedData = processedData.filter(item => {
        if (language === "both") {
          return item.key.toLowerCase().includes(globalFilter.toLowerCase()) ||
                 item.englishValue.toLowerCase().includes(globalFilter.toLowerCase()) ||
                 item.frenchValue.toLowerCase().includes(globalFilter.toLowerCase()) ||
                 item.category.toLowerCase().includes(globalFilter.toLowerCase());
        } else {
          return item.key.toLowerCase().includes(globalFilter.toLowerCase()) ||
                 item.originalValue.toLowerCase().includes(globalFilter.toLowerCase()) ||
                 item.currentValue.toLowerCase().includes(globalFilter.toLowerCase()) ||
                 item.category.toLowerCase().includes(globalFilter.toLowerCase());
        }
      });
    }

    return processedData;
  }, [englishStrings, frenchStrings, modifiedStrings, language, filters, globalFilter]);

  // Update filters when props change
  useEffect(() => {
    setGlobalFilter(searchTerm);
    setFilters({
      category: categoryFilter,
      modified: modifiedFilter,
    });
  }, [searchTerm, categoryFilter, modifiedFilter]);

  // Create filter options
  const availableFilters = useMemo(() => [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'Welcome & Onboarding', label: 'Welcome & Onboarding' },
        { value: 'Authentication', label: 'Authentication' },
        { value: 'Profile & Settings', label: 'Profile & Settings' },
        { value: 'Forms & Validation', label: 'Forms & Validation' },
        { value: 'Navigation & UI', label: 'Navigation & UI' },
        { value: 'Errors & Messages', label: 'Errors & Messages' },
        { value: 'Other', label: 'Other' },
      ],
    },
    {
      key: 'modified',
      label: 'Modified Status',
      options: [
        { value: 'all', label: 'All Strings' },
        { value: 'modified', label: 'Modified Only' },
        { value: 'unmodified', label: 'Unmodified Only' },
      ],
    },
  ], []);

  // Custom actions for toolbar
  const customActions = useMemo(() => [
    {
      icon: <DownloadIcon />,
      label: 'Export',
      tooltip: 'Export strings data',
      onClick: () => {
        console.log('Export strings data');
      },
    },
  ], []);

  return (
    <MDBox>
      <TableToolbar
        title="String Management"
        subtitle={`${data.length} strings total`}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Search strings..."
        filters={filters}
        onFilterChange={setFilters}
        availableFilters={availableFilters}
        customActions={customActions}
        enableSearch={true}
        enableFilters={true}
      />
      
      <TanStackTable
        data={data}
        columns={columns}
        loading={false}
        
        // Pagination (client-side)
        totalRowCount={data.length}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        pageSizeOptions={[10, 25, 50, 100]}
        manualPagination={false}
        
        // Sorting (client-side)
        sorting={sorting}
        onSortingChange={setSorting}
        enableSorting={true}
        manualSorting={false}
        
        // Filtering (client-side)
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        enableGlobalFilter={true}
        manualFiltering={false}
        
        // Styling
        height={height}
        maxHeight="600px"
        stickyHeader={true}
        
        // Row styling for modified strings
        getRowProps={(row) => ({
          sx: row.original.isModified ? {
            backgroundColor: '#fff3cd',
            borderLeft: '4px solid #ffc107',
            '&:hover': {
              backgroundColor: '#fff3cd !important',
            }
          } : undefined
        })}
        
        // Empty state
        emptyStateType="strings"
        emptyStateSize="medium"
      />
    </MDBox>
  );
}

export default StringsDataGrid; 